export type Category =
  | 'Career'
  | 'Career & Jobs'
  | 'Education'
  | 'Technology'
  | 'Productivity'
  | 'Personal Growth'
  | 'Personal Decisions'
  | 'Finance'
  | 'Relationships'
  | 'Health & Fitness'
  | 'Daily Life'
  | 'Everyday Problems'
  | 'Other';

export type OutcomeStatus = 'worked' | 'partially_worked' | 'did_not_work';

export type QualityLabel =
  | 'Highly Relevant'
  | 'Useful Experience'
  | 'Limited Evidence'
  | 'Conflicting Experiences';

export type UrgencyLevel = 'low' | 'medium' | 'high';

export type SolutionStatus = 'saved' | 'in_progress' | 'testing' | 'completed';

export interface Experience {
  id: string;
  userId?: string;
  authorName: string;
  isAnonymous: boolean;
  isDemo: boolean; // Explicitly true for demo records, false for real community submissions
  title: string;
  category: Category;
  situation: string;
  actionsTaken: string[];
  whyChosen?: string;
  outcome: string;
  outcomeStatus: OutcomeStatus;
  lesson: string;
  whatWouldChange?: string;
  relevanceScore?: number; // 0 - 100% computed against query
  qualityLabel?: QualityLabel;
  qualityScore?: number; // 0 - 100%
  usefulCount: number;
  notUsefulCount: number;
  userVoted?: 'useful' | 'not_useful' | null;
  createdAt: string;
  tags: string[];
  bannerURL?: string;
}

export interface ProblemInput {
  id?: string;
  problem: string;
  context: string;
  goal: string;
  alreadyTried?: string;
  constraints?: {
    budget?: string;
    time?: string;
    resources?: string;
    experienceLevel?: string;
  };
  category: Category;
  urgency: UrgencyLevel;
  includeDemoData?: boolean;
  languageStyle?: LanguageChoice;
}

export interface DetectedFactor {
  factor: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
}

export interface PatternInsight {
  type: 'effective' | 'ineffective' | 'mixed' | 'nuance';
  title: string;
  description: string;
  supportingCount: number;
  sampleLessons: string[];
}

export interface RecommendationStep {
  stepNumber: number;
  title: string;
  description: string;
  timeframe?: string;
  sourceExperienceIds?: string[];
  whyThisStep: string;
}

export interface EvidenceBreakdown {
  totalAnalyzed: number;
  totalRealAnalyzed: number;
  totalDemoAnalyzed: number;
  positiveOutcomes: number;
  mixedOutcomes: number;
  unsuccessfulOutcomes: number;
  confidencePercentage: number;
  isAiGuidanceOnly: boolean;
  dataSufficiency: 'sufficient' | 'moderate' | 'limited' | 'insufficient' | 'zero_community';
  disclaimer: string;
}

export interface SolutionAnalysis {
  id: string;
  problemId: string;
  problemSummary: string;
  originalProblem: ProblemInput;
  detectedFactors: DetectedFactor[];
  relevantExperiences: Experience[];
  realCommunityExperiences: Experience[];
  demoExperiences: Experience[];
  isAiGuidanceOnly: boolean;
  guidanceType: 'general_ai' | 'community_grounded' | 'demo_assisted';
  patterns: PatternInsight[];
  recommendationSteps: RecommendationStep[];
  overallReasoning: string;
  evidence: EvidenceBreakdown;
  uncertainties: string[];
  safetyNotice?: string;
  createdAt: string;
  status?: SolutionStatus;
  outcomeReport?: OutcomeFeedback;
}

export interface OutcomeFeedback {
  id: string;
  solutionId: string;
  problemId?: string;
  userId?: string;
  result: OutcomeStatus;
  whatHappened: string;
  whatLearned: string;
  whatWouldChange: string;
  shareAsPublicExperience: boolean;
  createdAt: string;
  generatedExperienceId?: string;
}

export type ProfileVisibility = 'public' | 'limited' | 'private';
export type ThemePreference = 'light' | 'dark' | 'system';

export interface NotificationPreferences {
  emailOnOutcome: boolean;
  inAppOnOutcome: boolean;
  categoryDigests: boolean;
}

export interface OutcomeNotification {
  id: string;
  type: 'outcome_reported' | 'experience_shared' | 'solution_saved' | 'system_broadcast';
  title: string;
  message: string;
  outcomeStatus?: OutcomeStatus;
  category?: Category;
  authorName?: string;
  experienceId?: string;
  solutionId?: string;
  situationSnippet?: string;
  lessonSnippet?: string;
  actionsSnippet?: string[];
  createdAt: string;
  read?: boolean;
  emailSent?: boolean;
  emailRecipientCount?: number;
  deliveryDetails?: {
    emailsSentTo: string[];
    timestamp: string;
    subject: string;
    previewBody: string;
  };
}

export interface LegalAcceptance {
  termsAccepted: boolean;
  communityGuidelinesAccepted: boolean;
  privacyPolicyAcknowledged: boolean;
  termsVersion: string;
  communityGuidelinesVersion: string;
  privacyPolicyVersion: string;
  acceptedAt?: string;
}

export type LanguageChoice = 'en' | 'ta' | 'ta_trans' | 'hi' | 'hi_trans';

export interface UserProfile {
  id: string;
  uid?: string;
  name: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  bannerURL?: string;
  avatarSeed?: string;
  about?: string;
  interests?: Category[];
  isAnonymous: boolean;
  profileVisibility?: ProfileVisibility;
  themePreference?: ThemePreference;
  languagePreference?: LanguageChoice;
  isGuest: boolean;
  joinedAt: string;
  createdAt?: string;
  updatedAt?: string;
  experiencesShared: number;
  solutionsTested: number;
  peopleHelped: number;
  savedSolutionIds: string[];
  savedExperienceIds?: string[];
  notificationPreferences?: NotificationPreferences;
  aiWritingAssistEnabled?: boolean;
  onboardingCompleted: boolean;
  legalAcceptance?: LegalAcceptance;
}

export type WritingSuggestionType = 'typo_grammar' | 'alternative_wording' | 'clarity' | 'concise' | 'professional';

export type WritingAssistMode = 'realtime' | 'polish' | 'concise' | 'professional' | 'grammar';

export interface WritingSuggestion {
  id: string;
  type: WritingSuggestionType;
  original: string;
  suggested: string;
  reason: string;
  confidence?: number;
}

export interface WritingAssistResponse {
  hasSuggestions: boolean;
  suggestions: WritingSuggestion[];
  cleanText?: string;
  analysisSummary?: string;
}

export interface PlatformStats {
  totalRealExperiences: number;
  totalDemoExperiences: number;
  totalExperiences: number;
  totalOutcomesReported: number;
  successfulSolutionsRatio: number;
  activeCategories: number;
  communityContributors: number;
}
