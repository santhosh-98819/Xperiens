import { GoogleGenAI, Type } from '@google/genai';
import { ExperienceValidationResult, RiskLevel } from '../../types';

// Heuristic checks for obvious gibberish and low quality
export function performHeuristicCheck(text: string): { isMeaningless: boolean; reason?: string } {
  const trimmed = text.trim();
  
  if (trimmed.length < 10) {
    return { isMeaningless: true, reason: 'Content is too short to be meaningful.' };
  }

  // 1. Detect random keyboard sequences (simplified patterns)
  const gibberishPatterns = [
    /[asdfghjkl]{6,}/i,
    /[qwertyuiop]{6,}/i,
    /[zxcvbnm]{6,}/i,
    /(.)\1{4,}/, // Repeated same character
    /^[a-z0-9]{15,}$/i, // Long string of alphanumeric with no spaces
    /[bcdfghjklmnpqrstvwxyz]{7,}/i, // Long consonant strings (English centric, but helpful)
  ];

  for (const pattern of gibberishPatterns) {
    if (pattern.test(trimmed)) {
      return { isMeaningless: true, reason: 'Content appears to be random characters or keyboard sequences.' };
    }
  }

  // 2. Repeated words or sequences
  const words = trimmed.toLowerCase().split(/\s+/);
  if (words.length > 5) {
    let repetitions = 0;
    for (let i = 0; i < words.length - 1; i++) {
      if (words[i] === words[i + 1]) repetitions++;
    }
    if (repetitions > words.length * 0.5) {
      return { isMeaningless: true, reason: 'Content contains excessive word repetition.' };
    }
  }

  return { isMeaningless: false };
}

export async function validateExperienceWithAI(
  pillars: Record<string, string>,
  languageStyle?: string
): Promise<ExperienceValidationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      isValid: true,
      riskLevel: 'low',
      isMeaningless: false,
      feedback: 'Quality check skipped (API key not configured).'
    };
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const combinedContent = Object.entries(pillars)
    .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
    .join('\n\n');

  const prompt = `
You are the Xperiens Experience Authenticity & Quality Guard.
Your task is to analyze the following shared experience for quality, authenticity, and meaningfulness.

Xperiens is a platform for sharing real-world experiences to help others solve problems.
The user has provided their experience across 6 reflection pillars.

EXPERIENCE CONTENT:
${combinedContent}

LANGUAGE STYLE: ${languageStyle || 'en'}

CRITICAL GUIDELINES:
1. MEANINGLESS CONTENT: Detect random keyboard inputs, gibberish, nonsensical combinations, or repeated words. If it's objectively meaningless, set isValid=false and riskLevel=high.
2. AUTHENTICITY: Does this describe a plausible real-world situation? Are the actions and outcomes consistent? Look for contradictions or suspicious repetition.
3. QUALITY: Is there enough detail to be useful?
4. SENSITIVITY: NEVER label unusual, emotional, extraordinary, or informal writing as fake automatically. Distinguish between "meaningless" and "suspected fabrication".
5. MULTILINGUAL: Support Tamil, Hindi, English, Tanglish, and Hinglish. Do NOT mistake code-switching, transliteration, or informal grammar for gibberish.

DECISION LOGIC:
- isValid: false if content is objectively meaningless/gibberish or pure spam.
- riskLevel 'low': Meaningful content with no major concerns.
- riskLevel 'medium': Unclear, highly suspicious, or lacks critical detail.
- riskLevel 'high': Clearly fake, spam, or meaningless.

OUTPUT FORMAT:
Return a structured JSON object with the following fields:
- isValid (boolean)
- riskLevel ('low', 'medium', 'high')
- reason (string, concise internal reason)
- isMeaningless (boolean, true if it's gibberish/keyboard sequence)
- suggestedFixes (string array, how the user can improve it)
- feedback (string, friendly message for the user in the requested language style)

FRIENDLY FEEDBACK EXAMPLES:
- Gibberish: "Your experience doesn't seem to contain meaningful information. Please describe what happened in your own words."
- Incomplete: "Your story needs a little more detail. Help readers understand what you experienced."
- Suspicious: "We need a little more context to understand this experience. Please review your submission."
- Good: "Your experience has passed the initial quality check."

RESPONSE LANGUAGE: Respond in the language requested (${languageStyle || 'English'}).
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            riskLevel: { type: Type.STRING },
            reason: { type: Type.STRING },
            isMeaningless: { type: Type.BOOLEAN },
            suggestedFixes: { type: Type.ARRAY, items: { type: Type.STRING } },
            feedback: { type: Type.STRING }
          },
          required: ['isValid', 'riskLevel', 'isMeaningless', 'feedback']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      isValid: result.isValid ?? true,
      riskLevel: (result.riskLevel as RiskLevel) || 'low',
      reason: result.reason,
      isMeaningless: result.isMeaningless ?? false,
      suggestedFixes: result.suggestedFixes || [],
      feedback: result.feedback || 'Experience validated.'
    };
  } catch (error) {
    console.error('AI Validation Error:', error);
    return {
      isValid: true, // Fail open if AI fails, but ideally we have heuristics
      riskLevel: 'low',
      isMeaningless: false,
      feedback: 'Validation service temporarily unavailable. Continuing with submission.'
    };
  }
}
