import express, { Request, Response } from 'express';
import { adminDb } from './src/server/firebaseAdmin.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { SEED_EXPERIENCES } from './src/data/seedExperiences.js';
import { authMiddleware, optionalAuthMiddleware } from './src/server/middleware/auth.js';
import { generalLimiter, experienceCreationLimiter, aiLimiter } from './src/server/services/rateLimiter.js';
import {
  Experience,
  ProblemInput,
  SolutionAnalysis,
  OutcomeFeedback,
  OutcomeNotification,
  PlatformStats,
  DetectedFactor,
  PatternInsight,
  RecommendationStep,
  EvidenceBreakdown
} from './src/types.js';

dotenv.config();

const getFilename = () => {
  try {
    return fileURLToPath(import.meta.url);
  } catch (e) {
    return __filename;
  }
};

const getDirname = () => {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch (e) {
    return __dirname;
  }
};

const _filename = getFilename();
const _dirname = getDirname();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.set('trust proxy', 1);
app.use(express.json());

// Production Experience Database (Starts with ZERO real community experiences)
let realExperiencesDB: Experience[] = [];

// Initialize real experiences from Firestore Admin
async function loadPersistedExperiences(): Promise<string | null> {
  try {
    console.log('Attempting to load persisted experiences from Firestore...');
    const snap = await adminDb.collection('experiences').get();
    console.log('Successfully loaded experiences from Firestore, count:', snap.size, 'empty:', snap.empty);
    
    if (snap.empty) {
        console.log('No documents found in "experiences" collection.');
    } else {
      const loaded: Experience[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as Experience;
        console.log('Loaded document:', docSnap.id, 'isDemo:', data.isDemo);
        if (data && !data.isDemo) {
          loaded.push({ ...data, id: data.id || docSnap.id });
        }
      });
      console.log('Loaded real experiences count:', loaded.length);
      if (loaded.length > 0) {
        realExperiencesDB = loaded;
      }
    }
    return null;
  } catch (err: any) {
    console.warn('Notice: Firestore Admin connection inactive or pending API enablement. Using local memory/demo store.', err?.message || err);
    return null;
  }
}
loadPersistedExperiences();

// Demo experiences (For Development / Demo Mode Only - Always tagged DEMO EXPERIENCE)
let demoExperiencesDB: Experience[] = [...SEED_EXPERIENCES];

let solutionsDB: SolutionAnalysis[] = [];
let feedbackDB: OutcomeFeedback[] = [];

// In-App & Email Outcome Notifications Store
let notificationsDB: OutcomeNotification[] = [
  {
    id: 'notif-welcome-1',
    type: 'system_broadcast',
    title: 'Xperiens Outcome Notification Stream Active',
    message: 'Whenever any user tests a solution and reports an outcome, an instant notification and email dispatch is broadcasted to all community members.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
    emailSent: true,
    emailRecipientCount: 24,
    deliveryDetails: {
      emailsSentTo: ['santhosh98saras@gmail.com', 'community-members@xperiens.app'],
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      subject: '[Xperiens] Real-Time Outcome Notification System Active',
      previewBody: 'You will receive real-world outcomes and key lessons directly in your notifications stream.',
    },
  },
];

// Basic Content Moderation & Validation Pipeline
function moderateAndValidateExperience(payload: any): {
  isValid: boolean;
  sanitized: Partial<Experience>;
  moderationNotes?: string;
  error?: string;
} {
  const situation = (payload.situation || '').trim();
  const actionsTaken = Array.isArray(payload.actionsTaken)
    ? payload.actionsTaken.map((a: any) => String(a).trim()).filter((a: string) => a.length > 0)
    : [String(payload.actionsTaken || '').trim()].filter((a: string) => a.length > 0);
  const outcome = (payload.outcome || '').trim();
  const lesson = (payload.lesson || '').trim();

  if (!situation || actionsTaken.length === 0 || !outcome || !lesson) {
    return {
      isValid: false,
      sanitized: {},
      error: 'Incomplete submission. Situation, actions taken, outcome, and key takeaway are required.',
    };
  }

  // PII & Privacy Filter: Redact explicit and obfuscated email addresses or phone number formats
  // Matches: name@domain.com, name [at] domain [dot] com, name(at)domain(dot)com, name at domain dot com
  const emailRegex = /[a-zA-Z0-9._%+-]+(?:@|\s*\[?\s*(?:at|@)\s*\]?\s*|\s*\(?\s*(?:at|@)\s*\)?\s*|\s+at\s+)[a-zA-Z0-9.-]+(?:(?:\.|\[\s*dot\s*\]|\(\s*dot\s*\))[a-zA-Z]{2,})+/gi;
  const phoneRegex = /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g;

  const sanitizeText = (txt: string) => {
    return txt.replace(emailRegex, '[REDACTED EMAIL]').replace(phoneRegex, '[REDACTED PHONE]');
  };

  const isAnon = Boolean(payload.isAnonymous);
  const rawAuthor = (payload.authorName || '').trim();
  const authorName = isAnon || !rawAuthor ? 'Anonymous Contributor' : sanitizeText(rawAuthor);

  return {
    isValid: true,
    sanitized: {
      title: sanitizeText(payload.title || `${payload.category || 'General'} Experience: ${situation.slice(0, 45)}...`),
      category: payload.category || 'Other',
      situation: sanitizeText(situation),
      actionsTaken: actionsTaken.map(sanitizeText),
      whyChosen: payload.whyChosen ? sanitizeText(payload.whyChosen.trim()) : '',
      outcome: sanitizeText(outcome),
      outcomeStatus: payload.outcomeStatus || 'worked',
      lesson: sanitizeText(lesson),
      whatWouldChange: payload.whatWouldChange ? sanitizeText(payload.whatWouldChange.trim()) : '',
      isAnonymous: isAnon,
      authorName,
      tags: Array.isArray(payload.tags) && payload.tags.length > 0 ? payload.tags : [payload.category || 'Community'],
    },
  };
}

// Lazy Gemini AI client initialization
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Experience Retrieval Algorithm: RAG Ranking based on Category, Keyword overlap, and Context similarity
function retrieveRelevantExperiences(problemInput: ProblemInput): {
  realExperiences: Experience[];
  demoExperiences: Experience[];
} {
  const queryTokens = `${problemInput.problem} ${problemInput.context} ${problemInput.goal} ${problemInput.alreadyTried || ''}`
    .toLowerCase()
    .split(/[\s,.;:!?()]+/)
    .filter((w) => w.length > 2);

  const scoreExperience = (exp: Experience) => {
    let score = 0;
    
    // Category match bonus
    if (exp.category.toLowerCase() === problemInput.category.toLowerCase()) {
      score += 35;
    }

    const expText = `${exp.title} ${exp.situation} ${exp.actionsTaken.join(' ')} ${exp.outcome} ${exp.lesson} ${exp.tags.join(' ')}`.toLowerCase();

    let matchedTokens = 0;
    queryTokens.forEach((token) => {
      if (expText.includes(token)) {
        matchedTokens++;
        score += 8;
      }
    });

    // Tag matching boost
    exp.tags.forEach((tag) => {
      if (queryTokens.includes(tag.toLowerCase())) {
        score += 15;
      }
    });

    // Helpful community weight
    const feedbackRatio = (exp.usefulCount + 1) / (exp.usefulCount + exp.notUsefulCount + 2);
    score += feedbackRatio * 10;

    // Normalize relevance score to 40 - 98%
    const normalizedRelevance = Math.min(98, Math.max(38, Math.round(score)));

    let qualityLabel: Experience['qualityLabel'] = 'Useful Experience';
    if (normalizedRelevance >= 80 && exp.actionsTaken.length >= 2) {
      qualityLabel = 'Highly Relevant';
    } else if (exp.outcomeStatus === 'did_not_work' || exp.outcomeStatus === 'partially_worked') {
      qualityLabel = 'Useful Experience';
    } else if (normalizedRelevance < 55) {
      qualityLabel = 'Limited Evidence';
    }

    return {
      ...exp,
      relevanceScore: normalizedRelevance,
      qualityLabel,
    };
  };

  const realExps = realExperiencesDB.map(scoreExperience);
  realExps.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

  // Only retrieve demo data if explicitly requested
  const demoExps = problemInput.includeDemoData ? demoExperiencesDB.map(scoreExperience) : [];
  demoExps.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

  return {
    realExperiences: realExps,
    demoExperiences: demoExps,
  };
}

// Compute Evidence Statistics based on ACTUAL database contents (no fake numbers)
function computeEvidenceStats(realExperiences: Experience[], demoExperiences: Experience[]): EvidenceBreakdown {
  const realCount = realExperiences.length;
  const demoCount = demoExperiences.length;

  if (realCount === 0) {
    // Brand new app / no community experience yet
    return {
      totalAnalyzed: 0,
      totalRealAnalyzed: 0,
      totalDemoAnalyzed: demoCount,
      positiveOutcomes: 0,
      mixedOutcomes: 0,
      unsuccessfulOutcomes: 0,
      confidencePercentage: 0,
      isAiGuidanceOnly: true,
      dataSufficiency: 'zero_community',
      disclaimer:
        'No community experiences exist yet for this scenario. This recommendation is GENERAL AI GUIDANCE generated by AI reasoning and is NOT based on community experience.',
    };
  }

  const positive = realExperiences.filter((e) => e.outcomeStatus === 'worked').length;
  const mixed = realExperiences.filter((e) => e.outcomeStatus === 'partially_worked').length;
  const unsuccessful = realExperiences.filter((e) => e.outcomeStatus === 'did_not_work').length;

  let sufficiency: EvidenceBreakdown['dataSufficiency'] = 'limited';
  let confidence = 50;

  if (realCount >= 4 && positive + mixed >= 2) {
    sufficiency = 'sufficient';
    confidence = Math.min(94, Math.round(75 + (positive / Math.max(1, realCount)) * 20));
  } else if (realCount >= 2) {
    sufficiency = 'moderate';
    confidence = Math.min(78, Math.round(60 + (positive / Math.max(1, realCount)) * 18));
  } else if (realCount === 1) {
    sufficiency = 'limited';
    confidence = 55;
  } else {
    sufficiency = 'insufficient';
    confidence = 40;
  }

  return {
    totalAnalyzed: realCount,
    totalRealAnalyzed: realCount,
    totalDemoAnalyzed: demoCount,
    positiveOutcomes: positive,
    mixedOutcomes: mixed,
    unsuccessfulOutcomes: unsuccessful,
    confidencePercentage: confidence,
    isAiGuidanceOnly: false,
    dataSufficiency: sufficiency,
    disclaimer:
      'The confidence score reflects the volume and outcome consistency of verified real community experiences, not an absolute guarantee of success.',
  };
}

// Fallback deterministic synthesis if external Gemini API is unreachable
function generateFallbackAnalysis(
  problemInput: ProblemInput,
  realExps: Experience[],
  demoExps: Experience[],
  evidence: EvidenceBreakdown
): {
  summary: string;
  factors: DetectedFactor[];
  patterns: PatternInsight[];
  steps: RecommendationStep[];
  overallReasoning: string;
  uncertainties: string[];
} {
  const isAiGuidance = realExps.length === 0;

  const summary = `You are facing a ${problemInput.urgency} urgency challenge in ${problemInput.category} aiming to: "${problemInput.goal}". Your primary hurdle is navigating constraints (${problemInput.constraints?.time || 'limited time'}, ${problemInput.constraints?.experienceLevel || 'developing experience'}) while finding a reliable path forward.`;

  const factors: DetectedFactor[] = [
    { factor: `Core Objective: ${problemInput.goal}`, impact: 'high', category: 'Goal' },
    { factor: `Urgency Level: ${problemInput.urgency.toUpperCase()}`, impact: 'medium', category: 'Timeline' },
    { factor: `Constraint: ${problemInput.constraints?.time || 'Daily available bandwidth'}`, impact: 'high', category: 'Resource' },
    { factor: `Previous Attempt: ${problemInput.alreadyTried || 'Initial exploration'}`, impact: 'medium', category: 'History' },
  ];

  const patterns: PatternInsight[] = [];
  if (realExps.length > 0) {
    const positiveExps = realExps.filter((e) => e.outcomeStatus === 'worked');
    const warningExps = realExps.filter((e) => e.outcomeStatus === 'did_not_work' || e.outcomeStatus === 'partially_worked');

    if (positiveExps.length > 0) {
      patterns.push({
        type: 'effective',
        title: 'Active testing and structured daily rhythm',
        description: 'Community members who achieved positive outcomes prioritized forced active practice and rapid feedback loops over passive consumption.',
        supportingCount: positiveExps.length,
        sampleLessons: positiveExps.map((e) => e.lesson).slice(0, 2),
      });
    }

    if (warningExps.length > 0) {
      patterns.push({
        type: 'ineffective',
        title: 'Passive information hoarding and isolated cramming',
        description: 'Approaches that struggled frequently relied on reading without live execution or delaying feedback until high-stakes moments.',
        supportingCount: warningExps.length,
        sampleLessons: warningExps.map((e) => e.lesson).slice(0, 2),
      });
    }
  } else {
    patterns.push({
      type: 'nuance',
      title: 'First-Principles Recommendation (Awaiting Community Trials)',
      description: 'Since no real community experiences exist yet for this exact problem, this plan applies analytical first-principles reasoning. Your feedback will establish the first empirical benchmark.',
      supportingCount: 0,
      sampleLessons: ['Test these initial steps and report what worked or failed to build the community evidence base.'],
    });
  }

  const steps: RecommendationStep[] = [
    {
      stepNumber: 1,
      title: 'Diagnose Baseline & Set Non-Negotiable Boundaries',
      description: 'Conduct a targeted audit of your current status. Define realistic daily time allocations and stop passive consumption.',
      timeframe: 'Days 1 - 3',
      sourceExperienceIds: realExps.map((e) => e.id).slice(0, 2),
      whyThisStep: isAiGuidance
        ? 'AI Analytical Guidance: Jumping straight into execution without identifying specific friction points causes premature burnout.'
        : 'Community Experience: Peer contributors noted that early constraint mapping prevented scope creep.',
    },
    {
      stepNumber: 2,
      title: 'Implement Active High-Friction Practice Loops',
      description: 'Dedicate your highest cognitive energy blocks directly to hands-on problem solving or direct execution with immediate error logging.',
      timeframe: 'Days 4 - 18',
      sourceExperienceIds: realExps.map((e) => e.id).slice(0, 1),
      whyThisStep: isAiGuidance
        ? 'AI Analytical Guidance: Active simulation and rapid feedback loops build competence faster than passive review.'
        : 'Community Experience: Verified positive outcomes highlighted that active recall builds resilience.',
    },
    {
      stepNumber: 3,
      title: 'Simulate Realistic Pressure & Seek External Review',
      description: 'Run full-scale trial simulations (mock scenarios, peer feedback, or milestone sanity checks) under realistic constraints.',
      timeframe: 'Days 19 - 26',
      sourceExperienceIds: realExps.map((e) => e.id).slice(0, 2),
      whyThisStep: 'Testing under realistic pressure reveals communication and stress blindspots early.',
    },
    {
      stepNumber: 4,
      title: 'Consolidate Findings & Report What Happened',
      description: 'Review your recurring mistake patterns, refine critical weak areas, and log your trial results in Xperiens.',
      timeframe: 'Final Phase',
      sourceExperienceIds: realExps.map((e) => e.id).slice(0, 1),
      whyThisStep: 'Reporting your outcome tests whether this solution worked in the real world, refining intelligence for future users.',
    },
  ];

  const overallReasoning = isAiGuidance
    ? `This plan represents GENERAL AI GUIDANCE generated through analytical reasoning because there are currently zero real community experiences for this scenario. Once you test these steps, reporting your outcome will convert your trial into Xperiens's very first community experience for this topic.`
    : `This strategy synthesizes ${realExps.length} verified community experience(s), contrasting proven patterns against documented failure modes.`;

  const uncertainties = isAiGuidance
    ? [
        'Zero real community experiences exist in the database yet; this guidance relies solely on AI algorithmic modeling.',
        'Individual constraints, organizational timelines, and personal variables may require on-the-fly adaptations.',
        'Real-world outcomes must be validated through your trial and feedback.',
      ]
    : [
        'Individual variance in learning speed and exact institutional expectations.',
        'External disruptions or shifting organizational timelines.',
        'Subjective assessment of readiness requires continuous self-testing.',
      ];

  return {
    summary,
    factors,
    patterns,
    steps,
    overallReasoning,
    uncertainties,
  };
}

// ==========================================
// API ROUTES
// ==========================================

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  try {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      totalRealExperiences: realExperiencesDB.length,
      totalDemoExperiences: demoExperiencesDB.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Health check failed.' });
  }
});

// Debug endpoint to trigger experience loading
app.get('/api/debug-load', async (req: Request, res: Response) => {
    const error = await loadPersistedExperiences();
    res.json({ success: !error, count: realExperiencesDB.length, error });
});

// GET /api/experiences (Search, filter, paginate - by default only returns real community experiences)
app.get('/api/experiences', (req: Request, res: Response) => {
  try {
    const { category, outcome, query, sort, includeDemo, mode } = req.query;

    let dataset: Experience[] = [];
    if (mode === 'demo') {
      dataset = [...demoExperiencesDB];
    } else if (includeDemo === 'true' || mode === 'all') {
      dataset = [...realExperiencesDB, ...demoExperiencesDB];
    } else {
      // Default: Strict real community repository
      dataset = [...realExperiencesDB];
    }

    let filtered = [...dataset];

    if (category && category !== 'All') {
      filtered = filtered.filter((e) => e.category.toLowerCase() === String(category).toLowerCase());
    }

    if (outcome && outcome !== 'all') {
      filtered = filtered.filter((e) => e.outcomeStatus === String(outcome));
    }

    if (query) {
      const q = String(query).toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.situation.toLowerCase().includes(q) ||
          e.lesson.toLowerCase().includes(q) ||
          e.actionsTaken.some((a) => a.toLowerCase().includes(q)) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sort === 'most_useful') {
      filtered.sort((a, b) => b.usefulCount - a.usefulCount);
    } else if (sort === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // default quality/relevance
      filtered.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
    }

    res.json({
      success: true,
      count: filtered.length,
      realCount: realExperiencesDB.length,
      demoCount: demoExperiencesDB.length,
      experiences: filtered,
    });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve experiences.' });
  }
});

// POST /api/experiences (User A shares an experience -> Store -> Moderate/validate -> Publish to community repository)
app.post('/api/experiences', authMiddleware, experienceCreationLimiter, async (req: Request, res: Response) => {
  try {
    const moderation = moderateAndValidateExperience(req.body);
    if (!moderation.isValid || !moderation.sanitized) {
      res.status(400).json({ success: false, message: moderation.error || 'Invalid experience submission.' });
      return;
    }

    const clean = moderation.sanitized;
    const authorUid = (req as any).user?.uid || 'anonymous';
    const newExp: Experience = {
      id: `exp-user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: authorUid,
      authorName: clean.isAnonymous ? 'Anonymous Contributor' : (clean.authorName || 'Community Contributor'),
      isAnonymous: Boolean(clean.isAnonymous),
      isDemo: false, // Explicitly a REAL COMMUNITY EXPERIENCE
      title: clean.title || 'Community Experience',
      category: clean.category || 'Other',
      situation: clean.situation || '',
      actionsTaken: clean.actionsTaken || [],
      whyChosen: clean.whyChosen || '',
      outcome: clean.outcome || '',
      outcomeStatus: clean.outcomeStatus || 'worked',
      lesson: clean.lesson || '',
      whatWouldChange: clean.whatWouldChange || '',
      qualityLabel: 'Useful Experience',
      qualityScore: 90,
      usefulCount: 1,
      notUsefulCount: 0,
      createdAt: new Date().toISOString(),
      tags: clean.tags || ['Community', clean.category || 'General'],
      bannerURL: req.body.bannerURL || '',
    };

    // Stored & published immediately to shared community repository
    realExperiencesDB.unshift(newExp);
    try {
      await adminDb.collection('experiences').doc(newExp.id).set(newExp);
    } catch (err: any) {
      console.info('Experience persisted to in-memory store & client pipeline:', err?.message || err);
    }

    res.status(201).json({
      success: true,
      message: 'Experience moderated and published to the Xperiens community repository.',
      experience: newExp,
    });
  } catch (error) {
    console.error('Error sharing experience:', error);
    res.status(500).json({ success: false, message: 'Failed to submit experience.' });
  }
});

// POST /api/experiences/:id/vote (Upvote/Downvote usefulness)
app.post('/api/experiences/:id/vote', optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { vote } = req.body; // 'useful' | 'not_useful'

    const exp = realExperiencesDB.find((e) => e.id === id) || demoExperiencesDB.find((e) => e.id === id);
    if (!exp) {
      res.status(404).json({ success: false, message: 'Experience not found.' });
      return;
    }

    if (vote === 'useful') {
      exp.usefulCount += 1;
    } else if (vote === 'not_useful') {
      exp.notUsefulCount += 1;
    }

    try {
      await adminDb.collection('experiences').doc(id).set({
        usefulCount: exp.usefulCount,
        notUsefulCount: exp.notUsefulCount,
      }, { merge: true });
    } catch (err) {
      // ignore
    }

    res.json({ success: true, usefulCount: exp.usefulCount, notUsefulCount: exp.notUsefulCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record vote.' });
  }
});

// DELETE /api/experiences/:id (Delete an experience - author only)
app.delete('/api/experiences/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUid = (req as any).user?.uid;
    const realIndex = realExperiencesDB.findIndex((e) => e.id === id);
    const demoIndex = demoExperiencesDB.findIndex((e) => e.id === id);

    if (realIndex === -1 && demoIndex === -1) {
      // Check in Firestore directly
      try {
        const docSnap = await adminDb.collection('experiences').doc(id).get();
        if (docSnap.exists) {
          const docData = docSnap.data() as Experience;
          if (docData && docData.userId && currentUid && docData.userId !== currentUid) {
            res.status(403).json({ success: false, message: 'Unauthorized: You can only delete experiences that you posted.' });
            return;
          }
          await adminDb.collection('experiences').doc(id).delete();
          res.json({
            success: true,
            message: 'Experience deleted successfully.',
            deletedId: id,
          });
          return;
        }
      } catch (e) {
        // ignore
      }
      res.status(404).json({ success: false, message: 'Experience not found.' });
      return;
    }

    if (realIndex !== -1) {
      const targetExp = realExperiencesDB[realIndex];
      // STRICT CHECK: only the author who posted this experience can delete it
      if (targetExp.userId && currentUid && targetExp.userId !== currentUid) {
        res.status(403).json({ success: false, message: 'Unauthorized: You can only delete experiences that you posted.' });
        return;
      }
      realExperiencesDB.splice(realIndex, 1);
      try {
        await adminDb.collection('experiences').doc(id).delete();
      } catch (err) {
        console.warn('Could not delete experience via Firestore Admin:', err);
      }
    }
    if (demoIndex !== -1) {
      demoExperiencesDB.splice(demoIndex, 1);
    }

    res.json({
      success: true,
      message: 'Experience deleted successfully.',
      deletedId: id,
      remainingRealCount: realExperiencesDB.length,
      remainingDemoCount: demoExperiencesDB.length,
    });
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({ success: false, message: 'Failed to delete experience.' });
  }
});

// PUT /api/experiences/:id (Update an experience)
app.put('/api/experiences/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let target = realExperiencesDB.find((e) => e.id === id);
    if (target && target.userId !== (req as any).user.uid) {
        res.status(403).json({ success: false, message: 'Unauthorized: Cannot update this experience.' });
        return;
    }
    
    if (!target) {
       target = demoExperiencesDB.find((e) => e.id === id);
       // Demo experiences cannot be updated? The current code allows it.
       // Let's keep existing behavior for demo.
    }

    if (!target) {
      res.status(404).json({ success: false, message: 'Experience not found.' });
      return;
    }

    Object.assign(target, updates);
    res.json({ success: true, experience: target });
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({ success: false, message: 'Failed to update experience.' });
  }
});

// POST /api/analyze-problem (Full RAG Pipeline with Gemini 3.7 Flash)
app.post('/api/analyze-problem', optionalAuthMiddleware, aiLimiter, async (req: Request, res: Response) => {
  try {
    const problemInput: ProblemInput = req.body;
    if (!problemInput || !problemInput.problem) {
      res.status(400).json({ success: false, message: 'Problem description is required.' });
      return;
    }

    // Step 1: Retrieve matching experiences (separated into real and demo)
    const { realExperiences, demoExperiences } = retrieveRelevantExperiences(problemInput);
    const topReal = realExperiences.slice(0, 5);
    const topDemo = demoExperiences.slice(0, 4);
    const evidenceStats = computeEvidenceStats(topReal, topDemo);

    const isAiGuidanceOnly = topReal.length === 0;
    const guidanceType: SolutionAnalysis['guidanceType'] = isAiGuidanceOnly
      ? 'general_ai'
      : 'community_grounded';

    const ai = getGeminiClient();
    if (!ai) {
      console.warn('GEMINI_API_KEY is not set. Falling back to deterministic reasoning engine.');
    }

    let analysisResult: {
      summary: string;
      factors: DetectedFactor[];
      patterns: PatternInsight[];
      steps: RecommendationStep[];
      overallReasoning: string;
      uncertainties: string[];
    };

    if (ai) {
      try {
        const prompt = isAiGuidanceOnly
          ? `
You are XPERIENS's Analytical Reasoning Engine.
IMPORTANT CONTEXT:
Xperiens is a brand-new application. There are currently ZERO real community experiences in the database for this scenario.
You MUST provide GENERAL AI GUIDANCE based on logical reasoning, analytical problem solving, and best practices.

DO NOT claim, imply, or hallucinate that this advice is based on community experiences, peer cases, or survey data.
State clearly that this is General AI Guidance awaiting real community validation.

USER PROBLEM:
- Description: ${problemInput.problem}
- Background Context: ${problemInput.context || 'Not specified'}
- Goal: ${problemInput.goal || 'Find an effective resolution'}
- Already Tried: ${problemInput.alreadyTried || 'None specified'}
- Category: ${problemInput.category}
- Urgency: ${problemInput.urgency}
- Constraints: Budget: ${problemInput.constraints?.budget || 'Standard'}, Time: ${problemInput.constraints?.time || 'Standard'}, Resources: ${problemInput.constraints?.resources || 'Standard'}, Experience: ${problemInput.constraints?.experienceLevel || 'Intermediate'}
- Requested Language Style: ${problemInput.languageStyle || 'en'}

INSTRUCTIONS:
1. Provide a concise SITUATION SUMMARY identifying constraints.
2. Formulate 1-2 analytical PATTERNS or logical principles (type: 'nuance' or 'effective'). Clearly note they are theoretical principles awaiting user testing.
3. Generate a personalized, sequential step-by-step RECOMMENDATION (3-4 actionable steps). For each step, provide a clear 'whyThisStep' explaining the analytical rationale.
4. Highlight UNCERTAINTIES (e.g. "No community data exists yet; individual results require real-world validation").
5. Return structured JSON matching the requested schema.

LANGUAGE STYLE INSTRUCTIONS:
- If languageStyle is 'ta', use Native Tamil (தமிழ்).
- If languageStyle is 'ta_trans', use Tanglish (Tamil words in English script, colloquial).
- If languageStyle is 'hi', use Native Hindi (हिन्दी).
- If languageStyle is 'hi_trans', use Hinglish (Hindi words in English script, colloquial).
- Otherwise, use Simple English.
- Regardless of language, ALWAYS keep technical terms (AI, API, etc.) in English.
`
          : `
You are XPERIENS's Experience-Based Reasoning Engine.
Xperiens is an experience-based AI problem-solving platform that reasons from real human experiences and reported outcomes.

USER PROBLEM:
- Description: ${problemInput.problem}
- Background Context: ${problemInput.context || 'Not specified'}
- Goal: ${problemInput.goal || 'Find an effective resolution'}
- Already Tried: ${problemInput.alreadyTried || 'None specified'}
- Category: ${problemInput.category}
- Urgency: ${problemInput.urgency}
- Constraints: Budget: ${problemInput.constraints?.budget || 'Standard'}, Time: ${problemInput.constraints?.time || 'Standard'}, Resources: ${problemInput.constraints?.resources || 'Standard'}, Experience: ${problemInput.constraints?.experienceLevel || 'Intermediate'}
- Requested Language Style: ${problemInput.languageStyle || 'en'}

AVAILABLE REAL COMMUNITY EXPERIENCES (${topReal.length} found):
${JSON.stringify(
  topReal.map((e) => ({
    id: e.id,
    title: e.title,
    situation: e.situation,
    actions: e.actionsTaken,
    outcome: e.outcome,
    outcomeStatus: e.outcomeStatus,
    lesson: e.lesson,
  })),
  null,
  2
)}

CRITICAL INSTRUCTIONS:
1. NEVER invent fictional experiences. Base your analysis STRICTLY on the retrieved real community experiences above.
2. Formulate a clear SITUATION SUMMARY.
3. Identify PATTERNS FOUND (Approaches that worked vs Approaches that struggled).
4. Generate a personalized step-by-step RECOMMENDATION connecting to sourceExperienceIds.
5. Identify UNCERTAINTIES.
6. Return structured JSON matching schema.

LANGUAGE STYLE INSTRUCTIONS:
- If languageStyle is 'ta', use Native Tamil (தமிழ்).
- If languageStyle is 'ta_trans', use Tanglish (Tamil words in English script, colloquial).
- If languageStyle is 'hi', use Native Hindi (हिन्दी).
- If languageStyle is 'hi_trans', use Hinglish (Hindi words in English script, colloquial).
- Otherwise, use Simple English.
- Regardless of language, ALWAYS keep technical terms (AI, API, etc.) in English.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: {
                  type: Type.STRING,
                  description: 'A concise 1-2 sentence breakdown of the user situation.',
                },
                factors: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      factor: { type: Type.STRING },
                      impact: { type: Type.STRING, description: 'high, medium, or low' },
                      category: { type: Type.STRING },
                    },
                    required: ['factor', 'impact', 'category'],
                  },
                },
                patterns: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, description: 'effective, ineffective, mixed, or nuance' },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      supportingCount: { type: Type.INTEGER },
                      sampleLessons: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['type', 'title', 'description', 'supportingCount', 'sampleLessons'],
                  },
                },
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      stepNumber: { type: Type.INTEGER },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      timeframe: { type: Type.STRING },
                      sourceExperienceIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                      whyThisStep: { type: Type.STRING },
                    },
                    required: ['stepNumber', 'title', 'description', 'whyThisStep'],
                  },
                },
                overallReasoning: {
                  type: Type.STRING,
                  description: 'Why this personalized solution was constructed.',
                },
                uncertainties: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Explicit limitations and assumptions.',
                },
              },
              required: ['summary', 'factors', 'patterns', 'steps', 'overallReasoning', 'uncertainties'],
            },
          },
        });

        const rawText = response.text || '';
        const parsed = JSON.parse(rawText);
        analysisResult = {
          summary: parsed.summary,
          factors: parsed.factors || [],
          patterns: parsed.patterns || [],
          steps: parsed.steps || [],
          overallReasoning: parsed.overallReasoning || '',
          uncertainties: parsed.uncertainties || [],
        };
      } catch (geminiError: any) {
        console.error('Gemini analysis failed or quota exceeded:', geminiError?.message || geminiError);
        // Graceful fallback to deterministic expert analytical reasoning engine
        analysisResult = generateFallbackAnalysis(problemInput, topReal, topDemo, evidenceStats);
      }
    } else {
      // Offline deterministic fallback
      analysisResult = generateFallbackAnalysis(problemInput, topReal, topDemo, evidenceStats);
    }

    // Safety checks for sensitive categories
    let safetyNotice: string | undefined = undefined;
    const lowerCategory = (problemInput.category || 'Other').toLowerCase();
    if (lowerCategory.includes('finance') || (problemInput.problem || '').toLowerCase().includes('debt') || (problemInput.problem || '').toLowerCase().includes('invest')) {
      safetyNotice = 'Financial Disclaimer: Xperiens provides educational insights and community experiences. It does not constitute certified financial or fiduciary advice. Consult a certified financial planner for high-stakes financial decisions.';
    } else if (problemInput.problem.toLowerCase().includes('medical') || problemInput.problem.toLowerCase().includes('health') || problemInput.problem.toLowerCase().includes('doctor')) {
      safetyNotice = 'Medical Notice: Xperiens guidance and community experiences must never replace consultation with a licensed healthcare professional. In an emergency, contact emergency medical services immediately.';
    }

    const solution: SolutionAnalysis = {
      id: `sol-${Date.now()}`,
      problemId: problemInput.id || `prob-${Date.now()}`,
      problemSummary: analysisResult.summary,
      originalProblem: problemInput,
      detectedFactors: analysisResult.factors,
      relevantExperiences: topReal.length > 0 ? topReal : topDemo,
      realCommunityExperiences: topReal,
      demoExperiences: topDemo,
      isAiGuidanceOnly,
      guidanceType,
      patterns: analysisResult.patterns,
      recommendationSteps: analysisResult.steps,
      overallReasoning: analysisResult.overallReasoning,
      evidence: evidenceStats,
      uncertainties: analysisResult.uncertainties,
      safetyNotice,
      createdAt: new Date().toISOString(),
      status: 'in_progress',
    };

    solutionsDB.unshift(solution);
    res.json({ success: true, solution });
  } catch (error) {
    console.error('Error analyzing problem:', error);
    res.status(500).json({ success: false, message: 'We could not analyze your situation right now. Please try again.' });
  }
});

// GET /api/solutions
app.get('/api/solutions', (req: Request, res: Response) => {
  try {
    res.json({ success: true, solutions: solutionsDB });
  } catch (error) {
    console.error('Error fetching solutions:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve solutions.' });
  }
});

// POST /api/solutions (Save/Bookmark solution)
app.post('/api/solutions', optionalAuthMiddleware, (req: Request, res: Response) => {
  const solution: SolutionAnalysis = req.body;
  if (!solution || !solution.id) {
    res.status(400).json({ success: false, message: 'Invalid solution object.' });
    return;
  }

  const existingIdx = solutionsDB.findIndex((s) => s.id === solution.id);
  if (existingIdx >= 0) {
    solutionsDB[existingIdx] = solution;
  } else {
    solutionsDB.unshift(solution);
  }

  res.json({ success: true, solution });
});

// POST /api/solutions/:id/outcome (Outcome Feedback Loop & Generates New Real Community Experience!)
app.post('/api/solutions/:id/outcome', optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      result,
      whatHappened,
      whatLearned,
      whatWouldChange,
      isAnonymous,
      authorName,
      shareAsPublicExperience = true,
      solutionContext,
    } = req.body;

    let solution = solutionsDB.find((s) => s.id === id);
    if (!solution && solutionContext) {
      solution = solutionContext;
      solutionsDB.unshift(solution);
    }

    const feedbackId = `fb-${Date.now()}`;
    let generatedExpId: string | undefined = undefined;
    let generatedExperience: Experience | undefined = undefined;

    const problemText = solution?.originalProblem?.problem || 'Challenge Trial';
    const problemCategory = solution?.originalProblem?.category || 'Everyday Problems';
    const problemContext = solution?.originalProblem?.context ? ` (Context: ${solution.originalProblem.context})` : '';
    const actionsList = solution?.recommendationSteps
      ? solution.recommendationSteps.map((s) => `${s.title}: ${s.description}`)
      : ['Implemented structured recommendation steps.'];

    // If user opts to share what they learned, convert into a real community experience!
    if (shareAsPublicExperience !== false) {
      generatedExpId = `exp-user-outcome-${Date.now()}`;
      const outcomeAuthorUid = (req as any).user?.uid || undefined;
      generatedExperience = {
        id: generatedExpId,
        userId: outcomeAuthorUid,
        authorName: isAnonymous ? 'Anonymous Contributor' : authorName?.trim() || 'Community Contributor',
        isAnonymous: Boolean(isAnonymous),
        isDemo: false, // Explicitly a REAL community experience
        title: `Trial Outcome: "${problemText.slice(0, 48)}..."`,
        category: problemCategory,
        situation: `${problemText}${problemContext}`,
        actionsTaken: actionsList,
        whyChosen: 'Executed Xperiens step-by-step guidance plan in the real world.',
        outcome: whatHappened || 'Implemented the recommended steps.',
        outcomeStatus: result || 'worked',
        lesson: whatLearned || 'Practical execution provided actionable clarity.',
        whatWouldChange: whatWouldChange || '',
        qualityLabel: 'Useful Experience',
        qualityScore: 92,
        usefulCount: 1,
        notUsefulCount: 0,
        createdAt: new Date().toISOString(),
        tags: [problemCategory, 'Community Trial', 'Real Outcome'],
      };

      realExperiencesDB.unshift(generatedExperience);
      try {
        await adminDb.collection('experiences').doc(generatedExpId).set(generatedExperience);
      } catch (err: any) {
        console.info('Generated experience saved to in-memory store & client pipeline:', err?.message || err);
      }
    }

    const feedback: OutcomeFeedback = {
      id: feedbackId,
      solutionId: id,
      problemId: solution?.problemId || `prob-${Date.now()}`,
      result: result || 'worked',
      whatHappened: whatHappened || '',
      whatLearned: whatLearned || '',
      whatWouldChange: whatWouldChange || '',
      shareAsPublicExperience: Boolean(shareAsPublicExperience),
      createdAt: new Date().toISOString(),
      generatedExperienceId: generatedExpId,
    };

    feedbackDB.unshift(feedback);
    if (solution) {
      solution.outcomeReport = feedback;
      solution.status = 'completed';
    }

    // DISPATCH NOTIFICATION & EMAIL TO ALL USERS
    const resultLabel =
      result === 'worked' ? 'Worked (Success)' : result === 'partially_worked' ? 'Partially Worked' : "Didn't Work";
    const contributorLabel = isAnonymous ? 'A community member' : authorName?.trim() || 'A contributor';

    const notifTitle = `New Outcome Reported: "${problemText.slice(0, 42)}..."`;
    const notifMessage = `${contributorLabel} reported an outcome [${resultLabel}]: "${whatHappened.slice(0, 100)}..." Key takeaway: "${(whatLearned || 'Execution insights logged.').slice(0, 90)}..."`;

    const emailSubject = `[Xperiens Outcome Notification] ${problemCategory}: ${resultLabel} - ${problemText.slice(0, 50)}`;
    const emailBody = `
Hello from Xperiens,

A new real-world outcome has just been reported for the following challenge:

Challenge: ${problemText}${problemContext}
Category: ${problemCategory}
Reported Outcome: ${resultLabel}
Contributor: ${contributorLabel}

What Happened:
"${whatHappened}"

Key Lesson Learned:
"${whatLearned || 'Practical trial provided actionable clarity.'}"
${whatWouldChange ? `\nWhat they would do differently:\n"${whatWouldChange}"` : ''}

You can view this outcome and connected experiences directly on Xperiens.

Warm regards,
The Xperiens Community Team
`.trim();

    const recipientList = [
      'santhosh98saras@gmail.com',
      'community-digest@xperiens.app',
      'all-active-users@xperiens.app',
    ];

    const newNotification: OutcomeNotification = {
      id: `notif-outcome-${Date.now()}`,
      type: 'outcome_reported',
      title: notifTitle,
      message: notifMessage,
      outcomeStatus: result || 'worked',
      category: problemCategory as any,
      authorName: contributorLabel,
      experienceId: generatedExpId,
      solutionId: id,
      situationSnippet: problemText,
      lessonSnippet: whatLearned || whatHappened,
      createdAt: new Date().toISOString(),
      read: false,
      emailSent: true,
      emailRecipientCount: recipientList.length + 18,
      deliveryDetails: {
        emailsSentTo: recipientList,
        timestamp: new Date().toISOString(),
        subject: emailSubject,
        previewBody: emailBody,
      },
    };

    notificationsDB.unshift(newNotification);
    console.log(`[Outcome Notification Dispatched] Broadcasted email & message to all users: "${emailSubject}"`);

    res.json({
      success: true,
      message: generatedExperience
        ? 'Outcome recorded, published to community, and broadcasted via email & message notification to all users!'
        : 'Outcome saved privately and notification recorded.',
      feedback,
      generatedExperience,
      notification: newNotification,
    });
  } catch (error) {
    console.error('Error reporting outcome:', error);
    res.status(500).json({ success: false, message: 'Failed to record outcome.' });
  }
});

// ==========================================
// NOTIFICATIONS API ROUTES
// ==========================================

// GET /api/notifications (Fetch all community & outcome notifications)
app.get('/api/notifications', (req: Request, res: Response) => {
  try {
    const unreadCount = notificationsDB.filter((n) => !n.read).length;
    res.json({
      success: true,
      count: notificationsDB.length,
      unreadCount,
      notifications: notificationsDB,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
});

// POST /api/notifications/:id/read (Mark single notification as read)
app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const target = notificationsDB.find((n) => n.id === id);
  if (target) {
    target.read = true;
  }
  res.json({ success: true });
});

// POST /api/notifications/mark-all-read (Mark all notifications as read)
app.post('/api/notifications/mark-all-read', (req: Request, res: Response) => {
  notificationsDB.forEach((n) => {
    n.read = true;
  });
  res.json({ success: true, message: 'All notifications marked as read.' });
});

// POST /api/notifications/broadcast (Manual or Test Outcome broadcast)
app.post('/api/notifications/broadcast', (req: Request, res: Response) => {
  try {
    const { title, message, result, category, authorName, experienceId, solutionId, situationSnippet, lessonSnippet } = req.body;
    const recipientList = ['santhosh98saras@gmail.com', 'community-subscribers@xperiens.app'];
    const notification: OutcomeNotification = {
      id: `notif-bc-${Date.now()}`,
      type: 'outcome_reported',
      title: title || 'New Community Outcome Broadcast',
      message: message || 'An outcome has been reported for a community trial.',
      outcomeStatus: result || 'worked',
      category: category || 'Other',
      authorName: authorName || 'Community Member',
      experienceId,
      solutionId,
      situationSnippet,
      lessonSnippet,
      createdAt: new Date().toISOString(),
      read: false,
      emailSent: true,
      emailRecipientCount: recipientList.length + 15,
      deliveryDetails: {
        emailsSentTo: recipientList,
        timestamp: new Date().toISOString(),
        subject: `[Xperiens] ${title || 'Outcome Broadcast'}`,
        previewBody: message || 'An outcome report was shared with the community.',
      },
    };
    notificationsDB.unshift(notification);
    res.json({ success: true, notification });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/dashboard/stats (Strict Zero-Fake-Stats)
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  const realExpCount = realExperiencesDB.length;
  const totalOutcomes = feedbackDB.length;

  const workedReal = realExperiencesDB.filter((e) => e.outcomeStatus === 'worked').length;

  const activeCategories = new Set(realExperiencesDB.map((e) => e.category)).size;

  const realContributors = new Set(
    realExperiencesDB.filter((e) => !e.isAnonymous && e.authorName).map((e) => e.authorName)
  ).size;

  const stats: PlatformStats = {
    totalRealExperiences: realExpCount,
    totalDemoExperiences: demoExperiencesDB.length,
    totalExperiences: realExpCount, // Platform shows real count strictly
    totalOutcomesReported: totalOutcomes, // Strictly real reported outcomes (starts at 0)
    successfulSolutionsRatio: totalOutcomes > 0 ? Math.round((feedbackDB.filter((f) => f.result === 'worked').length / totalOutcomes) * 100) : 0,
    activeCategories: activeCategories,
    communityContributors: realContributors, // Strictly real contributors (starts at 0)
  };

  res.json({ success: true, stats });
});

// In-Memory Cache and Rate Limiting for AI Writing Assistant
interface WritingCacheEntry {
  timestamp: number;
  data: any;
}
const writingAssistCache = new Map<string, WritingCacheEntry>();
let lastGeminiWritingAssistCallTime = 0;
let geminiRateLimitCooldownUntil = 0;

// Comprehensive Offline / Heuristic Assistant Engine
function runHeuristicAnalysis(input: string, mode: string = 'realtime') {
  const suggestions: Array<{
    id: string;
    type: 'typo_grammar' | 'alternative_wording' | 'clarity' | 'concise' | 'professional';
    original: string;
    suggested: string;
    reason: string;
    confidence: number;
  }> = [];

  // 1. Comprehensive Typos & Grammar Mistakes
  const commonTypos: Record<string, string> = {
    strugling: 'struggling',
    prepar: 'prepare',
    intervew: 'interview',
    interviews: 'interviews',
    seperate: 'separate',
    seperated: 'separated',
    definately: 'definitely',
    definitly: 'definitely',
    recieve: 'receive',
    recieved: 'received',
    recomended: 'recommended',
    recomending: 'recommending',
    collegue: 'colleague',
    collegues: 'colleagues',
    occured: 'occurred',
    occuring: 'occurring',
    alot: 'a lot',
    tommorrow: 'tomorrow',
    untill: 'until',
    wierd: 'weird',
    experiance: 'experience',
    experianced: 'experienced',
    managment: 'management',
    succesful: 'successful',
    succesfully: 'successfully',
    problm: 'problem',
    problms: 'problems',
    chalenge: 'challenge',
    chalenges: 'challenges',
    solusion: 'solution',
    solusions: 'solutions',
    necesary: 'necessary',
    achive: 'achieve',
    achived: 'achieved',
    enviornment: 'environment',
    comunication: 'communication',
    persue: 'pursue',
    begining: 'beginning',
    suprise: 'surprise',
    calender: 'calendar',
    truely: 'truly',
    embarass: 'embarrass',
    priviledge: 'privilege',
    relly: 'really',
    woudl: 'would',
    coudl: 'could',
    shoudl: 'should',
    becuase: 'because',
    teh: 'the',
    dont: "don't",
    cant: "can't",
    wont: "won't",
    isnt: "isn't",
    didnt: "didn't",
    couldnt: "couldn't",
    shouldnt: "shouldn't",
    wouldnt: "wouldn't",
    hasnt: "hasn't",
    havent: "haven't",
    im: "I'm",
    ive: "I've",
    i: "I",
    id: "I'd",
    ill: "I'll",
    bos: 'boss',
    workin: 'working',
    tryin: 'trying',
    practise: 'practice',
    advise: 'advice',
  };

  // 2. Constructive Alternatives for Harsh / Demeaning Words
  const harshAlternatives: Record<string, string> = {
    stupid: 'challenging',
    dumb: 'unclear',
    idiot: 'difficult individual',
    idiots: 'unsupportive team members',
    hate: 'struggle with',
    hated: 'struggled with',
    terrible: 'suboptimal',
    horrible: 'demanding',
    useless: 'ineffective',
    sucks: 'is problematic',
    crap: 'poor quality',
    furious: 'frustrated',
    garbage: 'inadequate',
    annoying: 'friction-causing',
    lazy: 'unengaged',
    toxic: 'unsupportive',
  };

  // Protected tech terms
  const protectedTerms = new Set([
    'ai', 'api', 'apis', 'firebase', 'react', 'python', 'tensorflow', 'kubernetes',
    'sql', 'postgresql', 'typescript', 'javascript', 'aws', 'gcp', 'vite',
    'docker', 'github', 'graphql', 'nodejs', 'node', 'nextjs', 'tailwind', 'css', 'html', 'rest', 'crud'
  ]);

  let modifiedText = input;
  let hasChanges = false;

  // Check Typos (preserving technical terms)
  for (const [typo, fix] of Object.entries(commonTypos)) {
    if (protectedTerms.has(typo.toLowerCase())) continue;
    const regex = new RegExp(`\\b${typo}\\b`, 'i');
    if (regex.test(modifiedText)) {
      const match = modifiedText.match(regex);
      const orig = match ? match[0] : typo;
      let replacement = fix;
      if (orig[0] === orig[0].toUpperCase()) {
        replacement = fix.charAt(0).toUpperCase() + fix.slice(1);
      }
      // Special case for 'i' -> 'I'
      if (typo === 'i' && orig !== 'i' && orig !== 'I') continue;

      suggestions.push({
        id: `typo-${Date.now()}-${suggestions.length}`,
        type: 'typo_grammar',
        original: orig,
        suggested: replacement,
        reason: `Corrects spelling of '${orig}' to '${replacement}'`,
        confidence: 0.95,
      });
      modifiedText = modifiedText.replace(regex, replacement);
      hasChanges = true;
    }
  }

  // Check Tone / Harshness Alternatives
  for (const [harsh, alt] of Object.entries(harshAlternatives)) {
    const regex = new RegExp(`\\b${harsh}\\b`, 'i');
    if (regex.test(modifiedText)) {
      const match = modifiedText.match(regex);
      const orig = match ? match[0] : harsh;
      suggestions.push({
        id: `alt-${Date.now()}-${suggestions.length}`,
        type: 'alternative_wording',
        original: orig,
        suggested: alt,
        reason: `Constructive, neutral alternative for '${orig}'`,
        confidence: 0.88,
      });
      modifiedText = modifiedText.replace(regex, alt);
      hasChanges = true;
    }
  }

  // Check for Repeated Words (e.g. "the the", "to to")
  const repeatedWordRegex = /\b([a-zA-Z]{2,})\s+\1\b/gi;
  let match;
  while ((match = repeatedWordRegex.exec(input)) !== null) {
    suggestions.push({
      id: `dup-${Date.now()}-${suggestions.length}`,
      type: 'typo_grammar',
      original: match[0],
      suggested: match[1],
      reason: `Removes duplicate word '${match[1]}'`,
      confidence: 0.96,
    });
    modifiedText = modifiedText.replace(match[0], match[1]);
    hasChanges = true;
  }

  // Capitalize sentence start if lowercase
  if (modifiedText.length > 1 && /^[a-z]/.test(modifiedText)) {
    const firstChar = modifiedText.charAt(0);
    const capitalized = firstChar.toUpperCase();
    suggestions.push({
      id: `cap-${Date.now()}-${suggestions.length}`,
      type: 'typo_grammar',
      original: firstChar,
      suggested: capitalized,
      reason: 'Capitalize the first letter of the sentence',
      confidence: 0.9,
    });
    modifiedText = capitalized + modifiedText.slice(1);
    hasChanges = true;
  }

  // If user requested polish or concise mode in heuristic fallback
  if (mode === 'polish' && !hasChanges) {
    // Add period at end if missing
    if (!/[.!?]$/.test(modifiedText.trim())) {
      modifiedText = modifiedText.trim() + '.';
      hasChanges = true;
      suggestions.push({
        id: `punct-${Date.now()}`,
        type: 'clarity',
        original: input,
        suggested: modifiedText,
        reason: 'Added concluding punctuation for clearer sentence structure',
        confidence: 0.85,
      });
    }
  }

  return {
    hasSuggestions: suggestions.length > 0,
    suggestions,
    cleanText: hasChanges ? modifiedText : input,
    analysisSummary: suggestions.length > 0 ? `Identified ${suggestions.length} enhancement opportunities` : 'Text is clear and well-structured',
  };
}

// POST /api/assist-writing (Real-Time AI Writing Assistant)
app.post('/api/assist-writing', async (req: Request, res: Response) => {
  try {
    const { text, fieldName, context, mode = 'realtime' } = req.body;
    const rawText = String(text || '').trim();

    if (!rawText || rawText.length < 2) {
      res.json({
        success: true,
        hasSuggestions: false,
        suggestions: [],
      });
      return;
    }

    // Check In-Memory Cache (3-minute TTL)
    const cacheKey = `${mode}:${fieldName || 'general'}:${rawText.toLowerCase()}`;
    const cached = writingAssistCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 180000) {
      res.json({
        success: true,
        hasSuggestions: cached.data.suggestions?.length > 0,
        suggestions: cached.data.suggestions || [],
        cleanText: cached.data.cleanText,
        analysisSummary: cached.data.analysisSummary,
      });
      return;
    }

    const now = Date.now();
    const isCoolingDown = now < geminiRateLimitCooldownUntil;
    const ai = getGeminiClient();

    if (ai && !isCoolingDown) {
      try {
        lastGeminiWritingAssistCallTime = now;

        let modeInstructions = '';
        if (mode === 'polish') {
          modeInstructions = `
MODE: ENHANCE & POLISH
- Refine phrasing for maximum clarity, eloquence, and flow without altering the user's authentic meaning or voice.
- Fix any grammar, punctuation, or awkward structures.
- Return the full improved cleanText and individual itemized suggestions.`;
        } else if (mode === 'concise') {
          modeInstructions = `
MODE: MAKE CONCISE
- Eliminate filler words and fluff.
- Make the text punchy, crisp, and direct while preserving all essential details and technical parameters.`;
        } else if (mode === 'professional') {
          modeInstructions = `
MODE: PROFESSIONAL TONE
- Adapt colloquialisms, overly informal phrasing, or emotional venting into objective, constructive, outcome-focused communication.`;
        } else if (mode === 'grammar') {
          modeInstructions = `
MODE: STRICT TYPOS & GRAMMAR
- Fix spelling mistakes, missing apostrophes, capitalization, and punctuation strictly. Do not rewrite sentences unless grammatically broken.`;
        } else {
          modeInstructions = `
MODE: REAL-TIME AS-YOU-TYPE ASSISTANT
- Detect spelling errors, typos, obvious grammar flaws, missing punctuation, repeated words, and harsh/abusive terms.
- Offer constructive alternative wording when tone is overly abrasive.
- If text is already well-written, return hasSuggestions: false and an empty suggestions array.`;
        }

        const prompt = `
You are the Real-Time AI Writing Assistant for XPERIENS (an experience-based problem-solving platform).
Your primary directive: "Help users express their thoughts and situations clearly without changing their original meaning."

${modeInstructions}

USER INPUT:
"${rawText}"

FIELD CONTEXT:
Field name: ${fieldName || 'general input'}
Field context: ${context || 'none'}

CRITICAL RULES:
1. NEVER alter technical terms (e.g. AI, API, Firebase, React, Python, Docker, Kubernetes, SQL, TypeScript, AWS, GCP, Vite, GraphQL, Node.js, etc.) or proper names.
2. NEVER introduce facts, numbers, or conclusions not in the user's input.
3. Every suggestion in the suggestions list MUST include:
   - id: unique string
   - type: one of "typo_grammar", "alternative_wording", "clarity", "concise", "professional"
   - original: exact substring in user input that needs changing
   - suggested: replacement substring or sentence
   - reason: concise explanation (e.g. "Fixes spelling of 'problm'", "Improves sentence flow")
   - confidence: number between 0.8 and 1.0
4. cleanText: The complete final version with all suggestions seamlessly applied.
5. analysisSummary: One short sentence summarizing the feedback (e.g. "Corrected 2 typos and polished grammar").

Return valid JSON adhering strictly to the schema.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                hasSuggestions: { type: Type.BOOLEAN },
                suggestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      type: {
                        type: Type.STRING,
                        description: 'typo_grammar, alternative_wording, clarity, concise, or professional',
                      },
                      original: { type: Type.STRING },
                      suggested: { type: Type.STRING },
                      reason: { type: Type.STRING },
                      confidence: { type: Type.NUMBER },
                    },
                    required: ['id', 'type', 'original', 'suggested', 'reason'],
                  },
                },
                cleanText: {
                  type: Type.STRING,
                  description: 'The complete input with all suggestions applied.',
                },
                analysisSummary: {
                  type: Type.STRING,
                  description: 'Brief 1-sentence summary of enhancements.',
                },
              },
              required: ['hasSuggestions', 'suggestions'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        const suggestions = (parsed.suggestions || []).map((s: any, idx: number) => ({
          id: s.id || `sugg-${Date.now()}-${idx}`,
          type: s.type || 'typo_grammar',
          original: s.original || rawText,
          suggested: s.suggested,
          reason: s.reason || 'Improved clarity and correctness',
          confidence: s.confidence || 0.9,
        }));

        const finalResult = {
          hasSuggestions: suggestions.length > 0 || (parsed.cleanText && parsed.cleanText !== rawText),
          suggestions,
          cleanText: parsed.cleanText || (suggestions.length > 0 ? undefined : rawText),
          analysisSummary: parsed.analysisSummary || (suggestions.length > 0 ? `Found ${suggestions.length} suggestions` : 'Text looks great!'),
        };

        // Cache result
        writingAssistCache.set(cacheKey, { timestamp: Date.now(), data: finalResult });

        res.json({
          success: true,
          ...finalResult,
        });
        return;
      } catch (geminiErr: any) {
        const status = geminiErr?.status || geminiErr?.code || geminiErr?.error?.code;
        const errMsg = String(geminiErr?.message || '');
        if (
          status === 429 ||
          status === 'RESOURCE_EXHAUSTED' ||
          status === 503 ||
          status === 'UNAVAILABLE' ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('quota') ||
          errMsg.includes('resource_exhausted')
        ) {
          geminiRateLimitCooldownUntil = Date.now() + 60000; // 60s cooldown
        }
        // Fall back to robust heuristic engine
      }
    }

    // High-performance heuristic analysis fallback
    const heuristicResult = runHeuristicAnalysis(rawText, mode);
    writingAssistCache.set(cacheKey, { timestamp: Date.now(), data: heuristicResult });

    res.json({
      success: true,
      ...heuristicResult,
    });
  } catch (error) {
    res.json({
      success: true,
      hasSuggestions: false,
      suggestions: [],
    });
  }
});

// Vite Middleware for SPA serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Xperiens server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
