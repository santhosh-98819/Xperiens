import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Brain,
  Layers,
  HelpCircle,
  X,
  Share2,
  AlertTriangle,
  Lightbulb,
  Lock,
  ThumbsUp,
  UserCheck,
} from 'lucide-react';
import { ViewMode } from '../App';
import { Logo } from '../components/Logo';

interface OnboardingProps {
  onComplete: () => void;
  onNavigate: (view: ViewMode) => void;
}

export const OnboardingView: React.FC<OnboardingProps> = ({ onComplete, onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      number: '01',
      title: 'What is Xperiens?',
      subtitle: 'Experience-based intelligence, not just another chatbot',
      icon: <Brain className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
          <p className="font-medium text-slate-900 dark:text-white text-base sm:text-lg">
            “Xperiens is an experience-based AI platform that helps people make better decisions by combining human experiences with AI reasoning.”
          </p>
          <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 text-indigo-950 dark:text-indigo-200 space-y-2">
            <span className="font-bold block text-sm text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Not a Generic Conversational Chatbot
            </span>
            <p className="text-xs sm:text-sm text-indigo-800/90 dark:text-indigo-300/90 leading-relaxed">
              Standard chatbots generate plausible-sounding answers based purely on pattern completions. Xperiens grounds its reasoning in real human trial outcomes, explicit constraints, and observed lessons.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">Human Grounding</span>
              <span className="text-slate-600 dark:text-slate-300">Learns from what real people actually tried in real life situations.</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">Analytical Reasoning</span>
              <span className="text-slate-600 dark:text-slate-300">Synthesizes key patterns, tradeoffs, and failure modes logically.</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: '02',
      title: 'How Xperiens Works',
      subtitle: 'The 8-step closed-loop problem solving cycle',
      icon: <Layers className="w-8 h-8 text-sky-600 dark:text-sky-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Xperiens follows an evidence-backed intelligence cycle that continuously refines collective knowledge:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { step: '1', title: 'Your Situation', desc: 'Describe problem & context', color: 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800' },
              { step: '2', title: 'Relevant Exps', desc: 'Search human trials', color: 'border-sky-200 dark:border-sky-900 bg-sky-50 dark:bg-sky-950/40' },
              { step: '3', title: 'Outcome Analysis', desc: 'Weigh what worked vs failed', color: 'border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/40' },
              { step: '4', title: 'AI Recommendation', desc: 'Step-by-step action plan', color: 'border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/40' },
              { step: '5', title: 'Try Solution', desc: 'Test in real world', color: 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40' },
              { step: '6', title: 'Report Outcome', desc: 'Tell how it went', color: 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40' },
              { step: '7', title: 'Share Learnings', desc: 'Publish takeaway (optional)', color: 'border-teal-200 dark:border-teal-900 bg-teal-50 dark:bg-teal-950/40' },
              { step: '8', title: 'Help Future Users', desc: 'Grounds future answers', color: 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40' },
            ].map((item, idx) => (
              <div key={idx} className={`p-3 rounded-xl border text-left flex flex-col justify-between ${item.color}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Phase 0{item.step}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{item.title}</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-slate-900 text-white rounded-xl text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Every trial outcome directly refines the intelligence for the next person.</span>
          </div>
        </div>
      ),
    },
    {
      number: '03',
      title: 'The Experience Library',
      subtitle: 'A zero-synthetic baseline that grows honestly with users',
      icon: <Compass className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 text-sm">
          <div className="p-4 bg-amber-50/80 dark:bg-amber-950/40 rounded-2xl border border-amber-200/90 dark:border-amber-900/60 text-amber-950 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300 text-sm">
              <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Brand-New Application — Zero Synthetic Data</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
              Xperiens does NOT pre-populate its production database with fake human experiences or fabricated success metrics.
            </p>
          </div>
          <p className="text-slate-800 dark:text-slate-200 font-medium text-sm sm:text-base">
            “The experience library grows as users voluntarily share what they tried, what happened, and what they learned.”
          </p>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-200 text-amber-900 flex-shrink-0">
              DEMO EXPERIENCE
            </span>
            <span>
              If demo reference data is enabled during development, it is always clearly labeled with an amber banner so you always know what is real human data and what is a demo case.
            </span>
          </div>
        </div>
      ),
    },
    {
      number: '04',
      title: 'Ask Xperiens',
      subtitle: 'Rich context provides deeply relevant recommendations',
      icon: <HelpCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 text-sm">
          <p>When asking Xperiens for guidance on a challenge, you describe:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            {[
              { label: 'Problem', desc: 'The core bottleneck you face' },
              { label: 'Context', desc: 'Background & situation details' },
              { label: 'Goal', desc: 'Specific desired outcome' },
              { label: 'Tried So Far', desc: 'Previous approaches & results' },
              { label: 'Constraints', desc: 'Budget, time, skill limits' },
              { label: 'Urgency & Category', desc: 'Domain & timeframe' },
            ].map((f, i) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">{f.label}</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">{f.desc}</span>
              </div>
            ))}
          </div>
          <p className="text-xs bg-sky-50/70 dark:bg-sky-950/40 p-3 rounded-xl border border-sky-100 dark:border-sky-900 text-sky-900 dark:text-sky-300">
            💡 The more context you provide, the better Xperiens can match similar past human experiences and avoid repeating what failed.
          </p>
        </div>
      ),
    },
    {
      number: '05',
      title: 'Experience-Based Analysis',
      subtitle: 'Transparent evidence breakdown & clear uncertainties',
      icon: <Lightbulb className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 text-sm">
          <p>Xperiens transparently distinguishes between:</p>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-emerald-900 dark:text-emerald-300 block">Human Experience</span>
                <span className="text-emerald-800/90 dark:text-emerald-300/90 text-xs">Direct outcomes reported by real people in comparable conditions.</span>
              </div>
            </div>
            <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900 flex items-start gap-2.5">
              <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-indigo-900 dark:text-indigo-300 block">AI Analysis & Recommendation</span>
                <span className="text-indigo-800/90 dark:text-indigo-300/90 text-xs">Synthesized step-by-step roadmap tailored to your specific constraints.</span>
              </div>
            </div>
            <div className="p-3 bg-amber-50/60 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-amber-900 dark:text-amber-300 block">Identified Uncertainties & Risks</span>
                <span className="text-amber-800/90 dark:text-amber-300/90 text-xs">Explicit caveats where outcomes varied or where data is scarce. AI recommendations are never guaranteed.</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: '06',
      title: 'Share Your Experience',
      subtitle: 'Contribute your real-world wisdom to the community',
      icon: <Share2 className="w-8 h-8 text-teal-600 dark:text-teal-400" />,
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 text-sm">
          <p className="font-medium text-slate-900 dark:text-white">
            “When you choose to share an experience, your experience can help other users facing a similar situation.”
          </p>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs uppercase tracking-wider">Structured Knowledge Format:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 font-medium">1. Situation</div>
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 font-medium">2. What You Tried</div>
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 font-medium">3. Outcome</div>
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 font-medium text-indigo-600 dark:text-indigo-400 font-bold">4. Key Lesson</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-900 text-teal-900 dark:text-teal-300 text-xs">
            <UserCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
            <span>You can share under your profile name or completely anonymously.</span>
          </div>
        </div>
      ),
    },
    {
      number: '07',
      title: 'Report Outcome',
      subtitle: 'Close the loop after testing a recommendation',
      icon: <ThumbsUp className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 text-sm">
          <p>After trying any solution, let Xperiens know what happened:</p>
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-300 font-bold text-xs">
              ✓ WORKED
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-300 font-bold text-xs">
              ≈ PARTIALLY WORKED
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-300 font-bold text-xs">
              ✕ DIDN'T WORK
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            Your outcome rating can optionally be converted into a structured community experience with one click, creating immediate value for other people.
          </p>
        </div>
      ),
    },
    {
      number: '08',
      title: 'Privacy & Control',
      subtitle: 'You maintain full ownership of your data',
      icon: <Lock className="w-8 h-8 text-slate-800 dark:text-slate-200" />,
      content: (
        <div className="space-y-3.5 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Anonymous Sharing</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs">Share without revealing your name or email.</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">User-Controlled Sharing</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs">Keep solutions private or share publicly.</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Delete Experiences</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs">Remove your submissions anytime.</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Account Controls</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs">Full profile editing and account deletion.</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 text-center pt-1">
            Protected by Cloud Firestore security rules and Firebase Authentication.
          </p>
        </div>
      ),
    },
  ];

  const current = steps[currentStep];
  const isFinalStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-brand-charcoal py-8 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
        {/* Header Progress Bar */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-auto" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Onboarding Guide
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
          </div>

          <button
            onClick={onComplete}
            className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Skip Guide</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step Indicator Progress Line */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 flex">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-full flex-1 transition-all duration-300 ${
                i <= currentStep ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Main Content Area */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex-shrink-0">
                  {current.icon}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {current.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {current.subtitle}
                  </p>
                </div>
              </div>

              <div className="pt-2">{current.content}</div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                currentStep === 0
                  ? 'text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed border border-slate-100 dark:border-slate-800'
                  : 'text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 shadow-2xs'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {!isFinalStep ? (
              <button
                onClick={handleNext}
                id="onboarding-next-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    onComplete();
                    onNavigate('ask');
                  }}
                  id="onboarding-ask-btn"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask Xperiens</span>
                </button>
                <button
                  onClick={() => {
                    onComplete();
                    onNavigate('experiences');
                  }}
                  id="onboarding-explore-btn"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Explore Experiences</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
