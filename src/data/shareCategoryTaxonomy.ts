import { Category } from '../types';
import {
  GraduationCap,
  Briefcase,
  Laptop,
  Sparkles,
  Users,
  DollarSign,
  HeartPulse,
  Sun,
  Compass,
  LucideIcon,
} from 'lucide-react';

export interface ShareCategoryQuestion {
  label: string;
  placeholder: string;
  helperText?: string;
  fieldName: string;
}

export interface ShareCategoryConfig {
  id: Category;
  displayName: string;
  icon: LucideIcon;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  subtitle: string;
  notice?: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'shield';
  };
  q1: ShareCategoryQuestion; // Trying to do / achieve
  q2: ShareCategoryQuestion; // Problem / challenge faced
  q3: ShareCategoryQuestion; // What did you try / do
  q4: ShareCategoryQuestion; // What happened / result
  q5: ShareCategoryQuestion; // What did you learn
  q6: ShareCategoryQuestion; // What would you do differently / advice
}

export const SHARE_CATEGORIES: ShareCategoryConfig[] = [
  {
    id: 'Education',
    displayName: 'Education',
    icon: GraduationCap,
    badgeBg: 'bg-amber-50 dark:bg-amber-950/70',
    badgeText: 'text-amber-700 dark:text-amber-300',
    borderClass: 'border-amber-200 dark:border-amber-800',
    subtitle: 'Exams, studying, degrees, certificates, and learning skills',
    q1: {
      label: '1. What were you trying to do?',
      placeholder: 'e.g. I was preparing for a certification exam, learning how to code, or studying for my final semester test...',
      helperText: 'Describe what you were studying or trying to achieve.',
      fieldName: 'Goal / Target',
    },
    q2: {
      label: '2. What problem did you face?',
      placeholder: 'e.g. I was easily distracted, had only 3 weeks left, or found the study materials confusing...',
      helperText: 'What made it difficult or stressful?',
      fieldName: 'Problem Faced',
    },
    q3: {
      label: '3. What did you try?',
      placeholder: 'e.g. I used flashcards with spaced repetition, studied 45 minutes every morning, and practiced with past exam papers...',
      helperText: 'Put each step or method on a new line if you tried multiple things.',
      fieldName: 'Methods Tried',
    },
    q4: {
      label: '4. What happened?',
      placeholder: 'e.g. I passed with an 88% score and finished the syllabus 4 days before the test date...',
      helperText: 'What were the real results after trying your approach?',
      fieldName: 'Outcome / Result',
    },
    q5: {
      label: '5. What did you learn?',
      placeholder: 'e.g. Practicing test questions every day is 10 times more effective than re-reading textbooks...',
      helperText: 'The main lesson you want someone else to know.',
      fieldName: 'Lesson Learned',
    },
    q6: {
      label: '6. What would you do differently next time?',
      placeholder: 'e.g. I would start doing mock tests right from week 1 rather than waiting until the end...',
      helperText: 'What changes or improvements would you make if you started over?',
      fieldName: 'What To Do Differently',
    },
  },
  {
    id: 'Career',
    displayName: 'Career & Jobs',
    icon: Briefcase,
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/70',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    borderClass: 'border-indigo-200 dark:border-indigo-800',
    subtitle: 'Job interviews, salary talks, promotions, switching roles, and workplace challenges',
    q1: {
      label: '1. What were you trying to achieve?',
      placeholder: 'e.g. I wanted to negotiate a higher salary, land my first tech role, or switch from sales to product management...',
      helperText: 'What job goal, promotion, or workplace change were you working on?',
      fieldName: 'Career Goal',
    },
    q2: {
      label: '2. What challenge did you face?',
      placeholder: 'e.g. I did not have formal experience in the new field, got nervous during interviews, or felt uncomfortable asking for a raise...',
      helperText: 'What was the biggest obstacle in your way?',
      fieldName: 'Workplace Challenge',
    },
    q3: {
      label: '3. What did you do?',
      placeholder: 'e.g. I created 2 real project samples, gathered industry salary benchmark data, and practiced mock interviews out loud with peers...',
      helperText: 'List the specific actions or preparation steps you took.',
      fieldName: 'Actions Taken',
    },
    q4: {
      label: '4. What was the result?',
      placeholder: 'e.g. I received 2 job offers and successfully negotiated a 15% salary increase above the initial offer...',
      helperText: 'What actually happened after taking action?',
      fieldName: 'Result',
    },
    q5: {
      label: '5. What did you learn?',
      placeholder: 'e.g. Bringing concrete proof of your work and practicing out loud gives you way more confidence than just reading notes...',
      helperText: 'The core takeaway you would share with a coworker or friend.',
      fieldName: 'Key Lesson',
    },
    q6: {
      label: '6. What would you do differently?',
      placeholder: 'e.g. I would ask for the salary range before the first interview and negotiate remote work days upfront...',
      helperText: 'What would you adjust if you were doing this again?',
      fieldName: 'What To Change',
    },
  },
  {
    id: 'Technology',
    displayName: 'Technology',
    icon: Laptop,
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/70',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    borderClass: 'border-cyan-200 dark:border-cyan-800',
    subtitle: 'Coding, tools, bugs, server setup, databases, software, and hardware',
    q1: {
      label: '1. What were you trying to build or fix?',
      placeholder: 'e.g. I was fixing a slow database query, building a full-stack web app, or migrating our database to the cloud...',
      helperText: 'What technical feature, system, or issue were you working on?',
      fieldName: 'Technical Task',
    },
    q2: {
      label: '2. What problem did you face?',
      placeholder: 'e.g. The app crashed when handling 50 concurrent users, error logs were unhelpful, or API responses took over 4 seconds...',
      helperText: 'Describe the bug, bottleneck, or technical roadblock.',
      fieldName: 'Technical Problem',
    },
    q3: {
      label: '3. What did you try?',
      placeholder: 'e.g. Added index on user_id column, integrated Redis for caching frequent lookups, and profiled query execution times...',
      helperText: 'Share the commands, configurations, or coding approaches you tried.',
      fieldName: 'Solutions Tried',
    },
    q4: {
      label: '4. What worked or didn\'t work?',
      placeholder: 'e.g. The Redis cache reduced response times by 80%. Increasing server RAM alone did not fix the problem...',
      helperText: 'Explain which tools or code changes succeeded and which ones failed.',
      fieldName: 'What Worked / Failed',
    },
    q5: {
      label: '5. What did you learn?',
      placeholder: 'e.g. Always measure and profile bottlenecks with real data before rewriting code based on guesswork...',
      helperText: 'What insight will save other developers or tech users time?',
      fieldName: 'Technical Lesson',
    },
    q6: {
      label: '6. What would you try next time?',
      placeholder: 'e.g. Set up automated load tests and performance monitoring alerts before launching to production...',
      helperText: 'What is the best way to handle this in future tech projects?',
      fieldName: 'Next Time Plan',
    },
  },
  {
    id: 'Personal Growth',
    displayName: 'Personal Growth',
    icon: Sparkles,
    badgeBg: 'bg-purple-50 dark:bg-purple-950/70',
    badgeText: 'text-purple-700 dark:text-purple-300',
    borderClass: 'border-purple-200 dark:border-purple-800',
    subtitle: 'Daily habits, focus, time management, reading, discipline, and mindset',
    q1: {
      label: '1. What were you trying to improve?',
      placeholder: 'e.g. I wanted to wake up at 6:30 AM consistently, stop scrolling social media in bed, or read 1 book every month...',
      helperText: 'What habit, routine, or personal change were you focusing on?',
      fieldName: 'Growth Goal',
    },
    q2: {
      label: '2. What was difficult?',
      placeholder: 'e.g. I had strong motivation for 3 days but fell back into old habits as soon as I felt tired after work...',
      helperText: 'What caused you to lose focus, procrastinate, or struggle?',
      fieldName: 'Difficulty Faced',
    },
    q3: {
      label: '3. What did you try?',
      placeholder: 'e.g. Put my phone in the living room before sleeping, started with just 5 minutes of reading per day, and tracked days on a wall calendar...',
      helperText: 'What daily systems, rules, or habit triggers did you use?',
      fieldName: 'Habits & Strategies',
    },
    q4: {
      label: '4. What changed?',
      placeholder: 'e.g. Kept a 45-day streak, read 6 books in 3 months, and felt much calmer and more focused throughout the day...',
      helperText: 'How did your daily routine, energy, or behavior shift?',
      fieldName: 'What Changed',
    },
    q5: {
      label: '5. What did you learn?',
      placeholder: 'e.g. Changing your physical environment is 10 times easier and more reliable than depending on willpower alone...',
      helperText: 'What was the biggest discovery about yourself or habits?',
      fieldName: 'Personal Lesson',
    },
    q6: {
      label: '6. What advice would you give someone in the same situation?',
      placeholder: 'e.g. Make your new habit so small and easy that you can do it even on your busiest and most exhausting day...',
      helperText: 'Your #1 piece of encouragement and practical advice.',
      fieldName: 'Advice for Others',
    },
  },
  {
    id: 'Relationships',
    displayName: 'Relationships',
    icon: Users,
    badgeBg: 'bg-rose-50 dark:bg-rose-950/70',
    badgeText: 'text-rose-700 dark:text-rose-300',
    borderClass: 'border-rose-200 dark:border-rose-800',
    subtitle: 'Communication, setting boundaries, resolving conflict, family, friends, and roommates',
    notice: {
      title: 'Privacy & Respect Reminder',
      message: 'Please do not include names, contact details, or private identifying information about others.',
      type: 'shield',
    },
    q1: {
      label: '1. What situation were you dealing with?',
      placeholder: 'e.g. Resolving a recurring chore disagreement with a roommate, or setting healthy communication boundaries with a family member...',
      helperText: 'Describe the relationship situation without using real names.',
      fieldName: 'Situation',
    },
    q2: {
      label: '2. What was difficult?',
      placeholder: 'e.g. Whenever we tried to talk it turned into an argument, text messages were misunderstood, or I feared hurting their feelings...',
      helperText: 'Why was this hard to discuss or resolve?',
      fieldName: 'What Was Difficult',
    },
    q3: {
      label: '3. What did you do?',
      placeholder: 'e.g. Asked to talk in person during a calm moment, used "I feel" statements instead of pointing fingers, and wrote down an agreed chore plan...',
      helperText: 'How did you approach the conversation or boundary?',
      fieldName: 'Approach Taken',
    },
    q4: {
      label: '4. How did things turn out?',
      placeholder: 'e.g. We came to a fair agreement, the household tension disappeared, and we both felt heard and respected...',
      helperText: 'How is the situation and communication now?',
      fieldName: 'How It Turned Out',
    },
    q5: {
      label: '5. What did you learn?',
      placeholder: 'e.g. Bringing up small issues kindly and early prevents them from turning into massive arguments later on...',
      helperText: 'What communication lesson did this teach you?',
      fieldName: 'Relationship Lesson',
    },
    q6: {
      label: '6. What would you do differently?',
      placeholder: 'e.g. I would speak up in the first week rather than holding in my frustration for two months...',
      helperText: 'What would you do differently if faced with a similar issue?',
      fieldName: 'What To Change',
    },
  },
  {
    id: 'Finance',
    displayName: 'Finance',
    icon: DollarSign,
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/70',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
    subtitle: 'Saving money, paying off debt, budgeting, purchases, and managing expenses',
    notice: {
      title: 'Security Notice',
      message: 'Never share bank account numbers, card numbers, passwords, OTPs, or other sensitive financial information.',
      type: 'warning',
    },
    q1: {
      label: '1. What were you trying to manage?',
      placeholder: 'e.g. I wanted to pay off $3,000 in credit card debt, save a 3-month emergency fund, or stop overspending on food delivery...',
      helperText: 'What money goal, budget, or expense challenge were you addressing?',
      fieldName: 'Financial Goal',
    },
    q2: {
      label: '2. What problem did you face?',
      placeholder: 'e.g. High interest fees were eating my savings, unexpected car repairs came up, or I kept spending without tracking receipts...',
      helperText: 'What made it hard to stick to your budget or savings plan?',
      fieldName: 'Money Obstacle',
    },
    q3: {
      label: '3. What did you try?',
      placeholder: 'e.g. Set up automatic bank transfer of $100 on payday, used the avalanche method for high-interest cards, and canceled 3 unused subscriptions...',
      helperText: 'What budgeting methods, automated tools, or habits did you use?',
      fieldName: 'Steps Taken',
    },
    q4: {
      label: '4. What happened?',
      placeholder: 'e.g. Cleared all card debt in 7 months, saved $1,200 in an emergency buffer, and reduced monthly expenses by $220...',
      helperText: 'What was your financial result after taking these steps?',
      fieldName: 'Financial Result',
    },
    q5: {
      label: '5. What did you learn?',
      placeholder: 'e.g. Automating your savings on the day you get paid works because you never get the temptation to spend money you don\'t see...',
      helperText: 'What is the most helpful financial rule you discovered?',
      fieldName: 'Money Lesson',
    },
    q6: {
      label: '6. What would you do differently?',
      placeholder: 'e.g. I would build a small $500 emergency buffer first before aggressively putting every penny into debt payoff...',
      helperText: 'What strategy would you adjust if you were doing this again?',
      fieldName: 'What To Adjust',
    },
  },
  {
    id: 'Health & Fitness',
    displayName: 'Health & Fitness',
    icon: HeartPulse,
    badgeBg: 'bg-teal-50 dark:bg-teal-950/70',
    badgeText: 'text-teal-700 dark:text-teal-300',
    borderClass: 'border-teal-200 dark:border-teal-800',
    subtitle: 'Exercise, running, sleep, meal routines, posture, and wellness',
    notice: {
      title: 'Community Experience Notice',
      message: 'Personal experiences shared here are for everyday learning and do not constitute professional medical advice.',
      type: 'info',
    },
    q1: {
      label: '1. What were you trying to improve?',
      placeholder: 'e.g. I wanted to run my first 5K without stopping, improve my sleep from 5 to 7 hours, or relieve lower back tightness from sitting...',
      helperText: 'What fitness, sleep, or wellness goal were you working towards?',
      fieldName: 'Wellness Goal',
    },
    q2: {
      label: '2. What challenge did you face?',
      placeholder: 'e.g. Shin pain whenever I ran, feeling exhausted after work, or conflicting advice on workout routines...',
      helperText: 'What physical difficulty, fatigue, or obstacle showed up?',
      fieldName: 'Fitness Challenge',
    },
    q3: {
      label: '3. What did you try?',
      placeholder: 'e.g. Followed a Couch-to-5K gradual plan, bought proper supportive shoes, and added a 10-minute warm-up and cool-down stretch routine...',
      helperText: 'What routine, gradual progression, or adjustments did you make?',
      fieldName: 'Routine Tried',
    },
    q4: {
      label: '4. What happened?',
      placeholder: 'e.g. Completed the 5K run in 28 minutes without shin pain, back tightness decreased significantly, and sleep quality improved...',
      helperText: 'How did your body, fitness level, or energy respond?',
      fieldName: 'Health Outcome',
    },
    q5: {
      label: '5. What did you learn?',
      placeholder: 'e.g. Consistency and gradual progression prevent injuries far better than pushing too hard too soon...',
      helperText: 'The main lesson you discovered about your body or habits.',
      fieldName: 'Fitness Lesson',
    },
    q6: {
      label: '6. What would you do differently?',
      placeholder: 'e.g. I would invest in good running shoes and prioritize warm-up stretching from day one instead of waiting for aches...',
      helperText: 'What would you do if you were starting your wellness journey today?',
      fieldName: 'What To Change',
    },
  },
  {
    id: 'Daily Life',
    displayName: 'Daily Life',
    icon: Sun,
    badgeBg: 'bg-orange-50 dark:bg-orange-950/70',
    badgeText: 'text-orange-700 dark:text-orange-300',
    borderClass: 'border-orange-200 dark:border-orange-800',
    subtitle: 'Moving, home repairs, cooking, organizing, travel, and everyday practical tasks',
    q1: {
      label: '1. What were you trying to do?',
      placeholder: 'e.g. Moving apartments on a tight budget, fixing a running toilet, organizing a cluttered room, or planning a weekend road trip...',
      helperText: 'What practical task or household project were you tackling?',
      fieldName: 'Task / Project',
    },
    q2: {
      label: '2. What problem came up?',
      placeholder: 'e.g. The rental van was canceled last minute, lacked the right tool for plumbing, or underestimated how long packing would take...',
      helperText: 'What unexpected hiccup or hurdle happened?',
      fieldName: 'Problem That Came Up',
    },
    q3: {
      label: '3. What did you try?',
      placeholder: 'e.g. Watched a 5-minute plumbing repair tutorial, borrowed an adjustable wrench from a neighbor, and labeled boxes by room with color tape...',
      helperText: 'What DIY steps, workarounds, or tools did you use?',
      fieldName: 'Steps & Workarounds',
    },
    q4: {
      label: '4. What happened?',
      placeholder: 'e.g. Fixed the leak in 20 minutes for under $8, saved a $120 plumber call fee, and moved all items in one smooth trip...',
      helperText: 'How did the situation resolve?',
      fieldName: 'Outcome',
    },
    q5: {
      label: '5. What did you learn?',
      placeholder: 'e.g. Labeling every box by room and taking photos of electronics cables before unplugging them saves hours of stress...',
      helperText: 'What practical life hack or lesson did you find?',
      fieldName: 'Practical Lesson',
    },
    q6: {
      label: '6. What would you do differently?',
      placeholder: 'e.g. I would confirm rental equipment in writing 48 hours in advance and start packing non-essentials a week earlier...',
      helperText: 'What will you do next time you face this task?',
      fieldName: 'Next Time Plan',
    },
  },
  {
    id: 'Other',
    displayName: 'Other',
    icon: Compass,
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    borderClass: 'border-slate-300 dark:border-slate-700',
    subtitle: 'Any other unique situation, project, dilemma, or life experience',
    q1: {
      label: '1. What happened?',
      placeholder: 'e.g. Describe what project, dilemma, or unique situation you were going through...',
      helperText: 'Tell us the background of what was happening.',
      fieldName: 'Background Story',
    },
    q2: {
      label: '2. What problem did you face?',
      placeholder: 'e.g. The unexpected obstacle, difficult decision, or complication you ran into...',
      helperText: 'What was the toughest part?',
      fieldName: 'Problem Faced',
    },
    q3: {
      label: '3. What did you try?',
      placeholder: 'e.g. The approaches, experiments, or steps you took to handle it...',
      helperText: 'List the methods or tools you tested.',
      fieldName: 'What You Tried',
    },
    q4: {
      label: '4. What was the result?',
      placeholder: 'e.g. How things turned out in the end, whether good or bad...',
      helperText: 'What was the final outcome?',
      fieldName: 'Result',
    },
    q5: {
      label: '5. What did you learn?',
      placeholder: 'e.g. The most important lesson you took away from this whole experience...',
      helperText: 'What is the #1 takeaway?',
      fieldName: 'Lesson Learned',
    },
    q6: {
      label: '6. What would you do differently?',
      placeholder: 'e.g. What you would change or do if you were starting over...',
      helperText: 'What would you do differently next time?',
      fieldName: 'What To Change',
    },
  },
];

export function getCategoryConfig(catId: Category): ShareCategoryConfig {
  const found = SHARE_CATEGORIES.find((c) => c.id === catId || c.displayName === catId);
  return found || SHARE_CATEGORIES[SHARE_CATEGORIES.length - 1];
}
