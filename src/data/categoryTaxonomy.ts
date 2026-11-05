import { Category, ProblemInput } from '../types';
import {
  Briefcase,
  GraduationCap,
  Laptop,
  Zap,
  Compass,
  DollarSign,
  Users,
  Wrench,
  Sparkles,
  LucideIcon,
} from 'lucide-react';

export interface CategoryCustomField {
  id: string;
  label: string;
  placeholder: string;
  helperText?: string;
  quickSuggestions?: string[];
}

export interface CategoryMetadata {
  id: Category;
  label: string;
  shortLabel: string;
  simpleTitle: string;
  icon: LucideIcon;
  description: string;
  simpleDescription: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  questions: {
    problemLabel: string;
    problemPlaceholder: string;
    problemHelp: string;
    contextLabel: string;
    contextPlaceholder: string;
    contextHelp: string;
    goalLabel: string;
    goalPlaceholder: string;
    goalHelp: string;
    alreadyTriedLabel: string;
    alreadyTriedPlaceholder: string;
    alreadyTriedHelp: string;
    tailoredTips: string[];
  };
  customFields: CategoryCustomField[];
  commonPitfalls: string[];
  provenPatterns: string[];
  sampleScenarios: {
    title: string;
    summary: string;
    data: ProblemInput;
  }[];
}

export const CATEGORY_TAXONOMY: Record<string, CategoryMetadata> = {
  Career: {
    id: 'Career',
    label: 'Career & Professional Growth',
    shortLabel: 'Career',
    simpleTitle: 'Job, Interviews & Workplace Career',
    icon: Briefcase,
    description: 'Technical interviews, salary negotiations, job transitions, performance reviews, and workplace politics.',
    simpleDescription: 'Get real advice for job searches, interviews, promotions, salary talks, and changing careers.',
    accentColor: 'indigo',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/70',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    borderClass: 'border-indigo-200 dark:border-indigo-800',
    questions: {
      problemLabel: '1. What job or career challenge are you facing?',
      problemPlaceholder: 'e.g., I freeze during technical interviews; I want to ask for a raise with data; I want to switch from operations to product management...',
      problemHelp: 'Explain the main problem in plain words.',
      contextLabel: '2. What is your current role, background, and timeline?',
      contextPlaceholder: 'e.g., I have 3 years experience as a junior developer. My next interview round is in 3 weeks with a mid-size tech company...',
      contextHelp: 'Share your current experience level and any deadlines you have.',
      goalLabel: '3. What specific outcome or job offer do you want to achieve?',
      goalPlaceholder: 'e.g., Pass the 3-round interview and get an offer with a 20% salary increase...',
      goalHelp: 'What does a successful result look like for you?',
      alreadyTriedLabel: '4. What have you already tried so far?',
      alreadyTriedPlaceholder: 'e.g., Applied online without referrals; practiced LeetCode alone without speaking out loud; brought up promotion once in a 1-on-1...',
      alreadyTriedHelp: 'This prevents us from suggesting things you already tested.',
      tailoredTips: [
        'Mention your current job title and how many years of experience you have.',
        'Include any target salary, company type (startup or large company), or interview date.',
        'Tell us if you have another offer or an urgent deadline.'
      ]
    },
    customFields: [
      {
        id: 'currentRole',
        label: 'Current Job Title & Seniority',
        placeholder: 'e.g. Junior Developer, Marketing Specialist, Student',
        quickSuggestions: ['Junior Level (1-2 yrs)', 'Mid-Level (3-5 yrs)', 'Senior Level (5+ yrs)', 'Career Changer / Student']
      },
      {
        id: 'targetRole',
        label: 'Target Job Title or Company Type',
        placeholder: 'e.g. Senior Software Engineer, Product Manager, Tech Startup',
        quickSuggestions: ['Tech Startup', 'Mid-Size Company', 'Large Enterprise', 'Remote Team']
      },
      {
        id: 'timelineDeadline',
        label: 'Decision Date or Next Interview',
        placeholder: 'e.g. Interview in 2 weeks, Offer deadline Friday',
        quickSuggestions: ['Within 7 days', 'In 2-4 weeks', 'Within 3 months', 'No rush / Exploring']
      },
      {
        id: 'mainWorry',
        label: 'Biggest Workplace or Interview Hurdle',
        placeholder: 'e.g. Live coding nerves, Negotiating salary, Resume rejections',
        quickSuggestions: ['Live coding nerves', 'Salary negotiation', 'Resume getting rejected', 'Difficult manager']
      }
    ],
    commonPitfalls: [
      'Studying alone quietly instead of doing live practice out loud with peers',
      'Asking for a raise without showing clear proof of work and market salary numbers',
      'Sending cold job applications online without asking people for internal referrals'
    ],
    provenPatterns: [
      'Doing practice mock interviews where you explain your thinking out loud',
      'Showing results on small trial projects before asking for a new title',
      'Writing down a simple feedback log after every interview round'
    ],
    sampleScenarios: [
      {
        title: '30-Day Technical Interview Loop',
        summary: 'Preparing for live algorithm and system design interviews under tight deadlines',
        data: {
          problem: 'I have a junior/intermediate software engineer technical interview loop in 30 days and feel overwhelmed by the volume of algorithms and system design topics.',
          context: 'I know basic Python and data structures, but I freeze during live coding tests and struggle to explain my thought process out loud.',
          goal: 'Pass the 3-round technical interview and receive a formal job offer without burning out.',
          alreadyTried: 'Tried randomly solving LeetCode hard problems and watching long video lectures without writing code.',
          constraints: {
            budget: '$0 - $50 for mock interview platforms',
            time: '2-3 hours per day after full-time work',
            resources: 'Laptop, VS Code, online practice sites',
            experienceLevel: 'Intermediate programmer, beginner at live whiteboard interviews'
          },
          category: 'Career',
          urgency: 'high'
        }
      },
      {
        title: 'Internal Career Pivot to Product Management',
        summary: 'Transitioning from operations to product management without pay cuts or school',
        data: {
          problem: 'Working in operations with 3 years experience, wanting to transition into tech product management without taking an entry-level pay cut.',
          context: 'Our company has an engineering and product group, but no formal APM training program.',
          goal: 'Secure an internal transfer to Associate Product Manager within 6 months.',
          alreadyTried: 'Applied to external PM jobs online and received automated rejections due to lack of direct PM title.',
          constraints: {
            budget: '$200 for books and certifications',
            time: '5-8 hours per week outside work duties',
            resources: 'Access to company Slack, product managers, and internal tools',
            experienceLevel: 'Strong domain expertise in operations, beginner in agile PRD creation'
          },
          category: 'Career',
          urgency: 'medium'
        }
      }
    ]
  },
  Technology: {
    id: 'Technology',
    label: 'Technology & Software Architecture',
    shortLabel: 'Technology',
    simpleTitle: 'Coding, Tech Stack & Software Systems',
    icon: Laptop,
    description: 'System design, database migrations, choosing tech stacks, cloud infrastructure, AI adoption, and debugging complex bugs.',
    simpleDescription: 'Get tested advice on choosing tools, building apps, fixing performance bugs, and designing databases.',
    accentColor: 'blue',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/70',
    badgeText: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-200 dark:border-blue-800',
    questions: {
      problemLabel: '1. What technical problem or coding decision are you trying to solve?',
      problemPlaceholder: 'e.g., Choosing between a single app vs microservices; database queries taking 3 seconds; safely adding AI features to our app...',
      problemHelp: 'Describe the technical decision, error, or bottleneck clearly.',
      contextLabel: '2. What tech stack, app size, or traffic do you have?',
      contextPlaceholder: 'e.g., We use React, Node.js, and PostgreSQL. We have about 10,000 active users and 4 developers on our team...',
      contextHelp: 'Mention your programming languages, database, cloud provider, and team size.',
      goalLabel: '3. What should the system do when this is solved?',
      goalPlaceholder: 'e.g., Fast response times under 200ms, easy deployments, and no data sync errors...',
      goalHelp: 'Define what a reliable, working setup looks like.',
      alreadyTriedLabel: '4. What fixes, libraries, or setups did you already test?',
      alreadyTriedPlaceholder: 'e.g., Added an in-memory cache without indexes; tried rewriting everything from scratch; added more server memory...',
      alreadyTriedHelp: 'Tell us what did not work so we do not repeat it.',
      tailoredTips: [
        'List the languages, frameworks, and databases you currently use.',
        'Include numbers like user traffic, data size, or response speed if you know them.',
        'State your team size and whether you have dedicated server / cloud engineers.'
      ]
    },
    customFields: [
      {
        id: 'techStack',
        label: 'Languages, Frameworks & Database',
        placeholder: 'e.g. React, Node.js, PostgreSQL, Docker, AWS',
        quickSuggestions: ['React / TypeScript', 'Node.js / Express', 'Python / Django / FastAPI', 'PostgreSQL / SQL']
      },
      {
        id: 'scaleTraffic',
        label: 'User Traffic or Database Size',
        placeholder: 'e.g. 5,000 daily users, 50GB database, 100 requests/sec',
        quickSuggestions: ['Early Prototype (<1k users)', 'Growing SaaS (10k-50k users)', 'High Traffic (100k+ users)', 'Internal Tool']
      },
      {
        id: 'teamDevSize',
        label: 'Developer Team Size',
        placeholder: 'e.g. Solo founder, 3 developers, 10 engineers',
        quickSuggestions: ['Solo Developer', 'Small Team (2-5 devs)', 'Growing Team (6-15 devs)', 'Enterprise Team']
      },
      {
        id: 'mainBottleneck',
        label: 'Primary Technical Bottleneck',
        placeholder: 'e.g. Slow database queries, Merge conflicts, Complex setup',
        quickSuggestions: ['Slow database response', 'Complex microservice sync', 'Deployments breaking', 'Choosing right tech stack']
      }
    ],
    commonPitfalls: [
      'Splitting into complex microservices too early before the team or app needs it',
      'Picking shiny new frameworks based on hype instead of what your team knows well',
      'Attempting a full rewrite from scratch, which often takes 3x longer than expected'
    ],
    provenPatterns: [
      'Keeping a clean, well-organized single codebase (modular monolith) until scale demands separation',
      'Testing data migrations with double-writing before switching over completely',
      'Measuring actual server metrics and query speeds before optimizing code'
    ],
    sampleScenarios: [
      {
        title: 'Monolith vs Microservices Architecture Choice',
        summary: 'Evaluating backend architecture trade-offs for a growing SaaS team',
        data: {
          problem: 'Engineering team is debating whether to split a growing monolith into microservices or refine modular domain boundaries.',
          context: 'Team has 6 developers, 25,000 monthly users, and deployment cycles take 15 minutes with occasional merge conflicts.',
          goal: 'Improve developer velocity and maintain high reliability without doubling DevOps maintenance overhead.',
          alreadyTried: 'Separated one service as an experiment, which created complex local Docker setups and network latency.',
          constraints: {
            budget: 'Zero additional cloud budget',
            time: '1 month to set architectural standard',
            resources: 'Existing PostgreSQL database, AWS ECS cluster',
            experienceLevel: 'Mid-level engineers, no dedicated full-time DevOps engineer'
          },
          category: 'Technology',
          urgency: 'medium'
        }
      },
      {
        title: 'B2B SaaS Cold Outreach vs Content Marketing',
        summary: 'Bootstrapping early pilot customers for a developer tool with zero marketing budget',
        data: {
          problem: 'Launched a developer productivity utility but struggling to acquire initial paying beta users.',
          context: 'Built a working MVP with good initial feedback from 3 peers, but cold inbound traffic is near zero.',
          goal: 'Acquire 10 committed pilot users and validate pricing tier.',
          alreadyTried: 'Posted once on Reddit/Hacker News and sent 50 cold emails with low open rates.',
          constraints: {
            budget: '$0 marketing spend',
            time: '10 hours per week',
            resources: 'Technical blog, Twitter/X account, LinkedIn',
            experienceLevel: 'Solo technical founder with strong coding skills, low sales background'
          },
          category: 'Technology',
          urgency: 'high'
        }
      }
    ]
  },
  Education: {
    id: 'Education',
    label: 'Education & Learning Systems',
    shortLabel: 'Education',
    simpleTitle: 'School, Exams & Study Methods',
    icon: GraduationCap,
    description: 'Exam preparation, active recall, university course recovery, thesis writing, and mastering difficult academic subjects.',
    simpleDescription: 'Learn effective study routines, active recall, exam prep, and recovering from low grades.',
    accentColor: 'emerald',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/70',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
    questions: {
      problemLabel: '1. What subject, exam, or study challenge do you need help with?',
      problemPlaceholder: 'e.g., I scored 45% on my chemistry midterm; I forget formulas quickly; I am struggling to write my 30-page graduation thesis...',
      problemHelp: 'State the class, topic, or test that is giving you trouble.',
      contextLabel: '2. What is your current grade, and when is your next exam or deadline?',
      contextPlaceholder: 'e.g., Final exam is in 4 weeks and counts for 50% of my grade. I need at least 75% to keep my scholarship...',
      contextHelp: 'Mention how many weeks you have and what score you need.',
      goalLabel: '3. What score, grade, or learning outcome are you aiming for?',
      goalPlaceholder: 'e.g., Score 85%+ on the final exam and understand the core principles without last-minute cramming...',
      goalHelp: 'What specific mark or grade will get you to where you want to be?',
      alreadyTriedLabel: '4. How have you been studying or preparing so far?',
      alreadyTriedPlaceholder: 'e.g., Highlighting textbook pages; re-reading lecture slides; staying up until 3am the night before tests...',
      alreadyTriedHelp: 'Tell us your past study habits so we can suggest better techniques.',
      tailoredTips: [
        'State the exact date of your upcoming exam or assignment deadline.',
        'Tell us if the issue is memorization (facts/vocab) or problem-solving (math/logic).',
        'Mention if you have access to practice exams, teaching assistants, or study groups.'
      ]
    },
    customFields: [
      {
        id: 'subjectCourse',
        label: 'Subject or Exam Name',
        placeholder: 'e.g. Organic Chemistry, Calculus II, Bar Exam, SAT',
        quickSuggestions: ['Math / Calculus', 'Sciences / Chemistry / Physics', 'Computer Science', 'Medicine / Nursing / Law']
      },
      {
        id: 'currentVsTarget',
        label: 'Current Grade vs Target Grade',
        placeholder: 'e.g. Currently 50% -> Need 80%+ to pass',
        quickSuggestions: ['Failing -> Need 70% to pass', 'B Grade (80%) -> Aiming for A (90%+)', 'First time taking exam']
      },
      {
        id: 'timeUntilExam',
        label: 'Time Until Exam / Due Date',
        placeholder: 'e.g. Exam in 3 weeks, Due in 5 days',
        quickSuggestions: ['Less than 7 days', '2-4 weeks', '1-2 months', 'Ongoing semester']
      },
      {
        id: 'weeklyStudyHours',
        label: 'Weekly Study Time Available',
        placeholder: 'e.g. 2 hours every evening, 10 hrs on weekend',
        quickSuggestions: ['1-2 hours / day', '3-4 hours / day', 'Weekends only', 'Full-time study']
      }
    ],
    commonPitfalls: [
      'Just reading over highlighted notes, which gives a false feeling of knowing the material',
      'Sacrificing sleep to cram, which hurts memory and causes brain fog during tests',
      'Spending hours rewriting pretty notes instead of solving actual practice questions'
    ],
    provenPatterns: [
      'Using active recall flashcards (Anki) and testing yourself without looking at answers',
      'Practicing with past exam papers under realistic timed test conditions',
      'Keeping a simple mistake notebook to review why each wrong answer happened'
    ],
    sampleScenarios: [
      {
        title: 'Bouncing Back from Midterm Failure',
        summary: 'Rebounding from a 45% exam score using spaced retrieval and active recall',
        data: {
          problem: 'Failed my university midterm exam with a 45% score despite spending 20+ hours reading textbooks before test day.',
          context: 'My final exam is in 5 weeks and counts for 55% of the grade. I need at least an 80% to pass the prerequisite course.',
          goal: 'Revamp my study methodology to achieve active retention and score above 85% on the final exam.',
          alreadyTried: 'Highlighting textbook chapters, re-reading class slide decks, late-night cram sessions.',
          constraints: {
            budget: 'Free study tools only',
            time: '15 hours per week dedicated study time',
            resources: 'Course syllabus, textbook problem sets, study group',
            experienceLevel: 'Sophomore college student'
          },
          category: 'Education',
          urgency: 'high'
        }
      }
    ]
  },
  Productivity: {
    id: 'Productivity',
    label: 'Productivity & Work Systems',
    shortLabel: 'Productivity',
    simpleTitle: 'Focus, Time Management & Beating Procrastination',
    icon: Zap,
    description: 'Procrastination, deep work routines, energy management, team workload distribution, and beating chronic burnout.',
    simpleDescription: 'Overcome distractions, build sustainable daily focus habits, and get meaningful work done without burnout.',
    accentColor: 'amber',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/70',
    badgeText: 'text-amber-700 dark:text-amber-300',
    borderClass: 'border-amber-200 dark:border-amber-800',
    questions: {
      problemLabel: '1. What is stopping you from getting work done or staying focused?',
      problemPlaceholder: 'e.g., I spend the whole morning scrolling on my phone; I start 5 tasks and finish none; our team is exhausted before launch...',
      problemHelp: 'Explain where your focus or time is getting lost.',
      contextLabel: '2. What does your daily routine, schedule, or workspace look like?',
      contextPlaceholder: 'e.g., I work remotely from home with no direct supervision. I have 3 hours of meetings scattered across the day...',
      contextHelp: 'Describe if you work from home or office, and when your energy is highest.',
      goalLabel: '3. What does your ideal productive day look like?',
      goalPlaceholder: 'e.g., Complete 3 solid hours of focused work before 1:00 PM without opening social media...',
      goalHelp: 'What specific daily routine or output do you want to achieve?',
      alreadyTriedLabel: '4. What apps, to-do lists, or habits did you already try?',
      alreadyTriedPlaceholder: 'e.g., Downloaded 4 to-do apps; set phone alarms; tried to rely purely on willpower...',
      alreadyTriedHelp: 'Tell us what failed so we can suggest systems that stick.',
      tailoredTips: [
        'Tell us if the hardest part is starting a task or staying focused once you begin.',
        'Describe your workspace (remote desk, busy office, noisy coffee shop).',
        'State your main distraction source (phone, social media, meetings, coworkers).'
      ]
    },
    customFields: [
      {
        id: 'workSetting',
        label: 'Workspace & Job Setting',
        placeholder: 'e.g. 100% Remote, Hybrid, Open Office, Freelance',
        quickSuggestions: ['Work From Home (100% Remote)', 'Hybrid (Home + Office)', 'In-Office Desk', 'Freelance / Student']
      },
      {
        id: 'mainDistraction',
        label: 'Biggest Distraction or Block',
        placeholder: 'e.g. Phone scrolling, Unclear tasks, Too many meetings',
        quickSuggestions: ['Phone / Social Media', 'Too many meetings / Slack', 'Procrastinating on hard tasks', 'Chronic fatigue / burnout']
      },
      {
        id: 'peakEnergy',
        label: 'Best Energy Time of Day',
        placeholder: 'e.g. Early morning 7am-10am, Late night',
        quickSuggestions: ['Early Morning (7am-10am)', 'Late Morning (10am-1pm)', 'Afternoon (2pm-5pm)', 'Night Owl (8pm-midnight)']
      },
      {
        id: 'dailyFocusTarget',
        label: 'Target Daily Deep Work Hours',
        placeholder: 'e.g. 2-3 hours of solid uninterrupted focus',
        quickSuggestions: ['2 hours daily', '3-4 hours daily', '1 hour daily', 'Whole day flow']
      }
    ],
    commonPitfalls: [
      'Relying purely on willpower instead of putting phones in another room',
      'Stuffing 15 tasks on a daily list and feeling guilty when only 2 get done',
      'Staying at a desk for 10 hours while only doing 1 hour of real focused work'
    ],
    provenPatterns: [
      'Working with an accountability partner or joining virtual focus sessions',
      'Protecting a 2-hour "No Meetings" block every morning for your #1 priority',
      'Breaking scary tasks into small 10-minute starter steps'
    ],
    sampleScenarios: [
      {
        title: 'Combating Remote Work Procrastination',
        summary: 'Establishing high-leverage deep work routines when working without direct oversight',
        data: {
          problem: 'Severe executive dysfunction and procrastination working from home; wasting morning hours on phone and rushing work late at night.',
          context: 'I work 100% remotely as a technical writer. The lack of structure and direct oversight makes it hard to initiate tasks until deadline panic sets in.',
          goal: 'Establish a reliable deep-work routine that delivers 3-4 hours of focused output by 2:00 PM every day.',
          alreadyTried: 'Tried setting phone alarms and writing long to-do lists, which I ended up ignoring.',
          constraints: {
            budget: 'Under $20/month for productivity apps',
            time: 'Immediate implementation',
            resources: 'Home office, dual monitor, smartphone',
            experienceLevel: 'Working remotely for 2 years'
          },
          category: 'Productivity',
          urgency: 'medium'
        }
      },
      {
        title: 'Preventing Team Burnout During Tight Deadlines',
        summary: 'Leading an engineering team through high-pressure sprints without attrition',
        data: {
          problem: 'Team of 6 engineers showing exhaustion, declining quality, and cynicism 3 weeks before a critical product launch.',
          context: 'Executive stakeholders have high expectations, but bug rates are rising due to team fatigue.',
          goal: 'Ship the core MVP on schedule while halting team burnout and preserving morale.',
          alreadyTried: 'Asked team to work late hours, which led to frustration and more software bugs.',
          constraints: {
            budget: 'None',
            time: '3 weeks until scheduled release date',
            resources: 'Jira backlog, Slack, weekly stakeholder review',
            experienceLevel: 'Engineering Manager with 3 years leadership experience'
          },
          category: 'Productivity',
          urgency: 'high'
        }
      }
    ]
  },
  Finance: {
    id: 'Finance',
    label: 'Finance & Money Strategy',
    shortLabel: 'Finance',
    simpleTitle: 'Budgeting, Bills, Debt & Money Decisions',
    icon: DollarSign,
    description: 'Emergency funds, medical bills, freelance pricing, debt restructuring, budget overhauls, and risk management.',
    simpleDescription: 'Practical ways to manage unexpected bills, pay off debt, price freelance work, and budget comfortably.',
    accentColor: 'teal',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/70',
    badgeText: 'text-teal-700 dark:text-teal-300',
    borderClass: 'border-teal-200 dark:border-teal-800',
    questions: {
      problemLabel: '1. What money decision, bill, or financial challenge are you facing?',
      problemPlaceholder: 'e.g., I received an unexpected $4,000 hospital bill; I want to price my freelance project fairly; I have credit card debt to pay off...',
      problemHelp: 'Explain the financial situation or expense in simple numbers.',
      contextLabel: '2. What is your current income, fixed expenses, and savings cushion?',
      contextPlaceholder: 'e.g., My take-home pay is $3,200/mo. Rent and bills are $2,400. I have $600 in emergency savings...',
      contextHelp: 'Rough monthly numbers help create a realistic, stress-free plan.',
      goalLabel: '3. What financial target do you want to reach?',
      goalPlaceholder: 'e.g., Settle the bill with a 0% interest monthly payment plan of $250 without damaging my credit score...',
      goalHelp: 'What outcome will give you financial peace of mind?',
      alreadyTriedLabel: '4. What steps have you tried so far?',
      alreadyTriedPlaceholder: 'e.g., Thought about putting it on a high-interest credit card; tried a super strict budget that lasted 2 weeks...',
      alreadyTriedHelp: 'Tell us what you have already considered or attempted.',
      tailoredTips: [
        'Include approximate amounts, monthly income, or interest rates if comfortable.',
        'State whether your priority is immediate cash relief vs long-term saving.',
        'Mention if you can call and negotiate with the billing department or vendor.'
      ]
    },
    customFields: [
      {
        id: 'amountDebt',
        label: 'Amount of Money / Bill Involved',
        placeholder: 'e.g. $3,500 medical bill, $5,000 debt, $2,000 budget',
        quickSuggestions: ['Under $1,000', '$1,000 - $5,000', '$5,000 - $15,000', '$15,000+']
      },
      {
        id: 'monthlySurplus',
        label: 'Monthly Extra Cash Available',
        placeholder: 'e.g. $150-$300 extra each month after bills',
        quickSuggestions: ['$0 - $100 / mo', '$200 - $400 / mo', '$500+ / mo', 'Currently in negative']
      },
      {
        id: 'payoffTimeline',
        label: 'Desired Payoff / Savings Timeline',
        placeholder: 'e.g. 6 months, 12 months, 2 years',
        quickSuggestions: ['Within 3-6 months', 'Within 12 months', 'Within 2 years', 'Immediate emergency']
      },
      {
        id: 'mainGoal',
        label: 'Top Financial Priority',
        placeholder: 'e.g. Lower interest, Settle bill, Build emergency fund',
        quickSuggestions: ['0% Interest Payment Plan', 'Emergency Cash Buffer', 'Eliminate High-Interest Debt', 'Fair Freelance Pricing']
      }
    ],
    commonPitfalls: [
      'Putting sudden medical or car expenses on high-interest credit cards before negotiating',
      'Ignoring hospital or billing office options for financial hardship discounts',
      'Setting an extreme zero-fun budget that leads to binge spending later'
    ],
    provenPatterns: [
      'Calling billing offices to ask for itemized bills and 0% interest payment plans',
      'Building a small $500-$1,000 beginner safety cushion first before aggressive debt payoff',
      'Keeping spending money in a separate debit account so bills are always safe'
    ],
    sampleScenarios: [
      {
        title: 'Emergency Medical Debt Resolution',
        summary: 'Negotiating out-of-pocket bills and structuring zero-interest installment plans',
        data: {
          problem: 'Faced with an unexpected $4,200 out-of-pocket medical bill with only $800 in emergency savings.',
          context: 'Full-time salaried income covers basic living expenses with roughly $300 monthly surplus.',
          goal: 'Pay off the obligation without taking high-interest loans or ruining credit score.',
          alreadyTried: 'Considered putting the entire balance on a 24% APR credit card.',
          constraints: {
            budget: '$300-$400 monthly payment capacity',
            time: '12-18 month payoff target',
            resources: 'Itemized hospital statement, telephone access to billing office',
            experienceLevel: 'First time navigating major medical insurance claims'
          },
          category: 'Finance',
          urgency: 'high'
        }
      }
    ]
  },
  'Personal Decisions': {
    id: 'Personal Decisions',
    label: 'Personal Decisions & Life Choices',
    shortLabel: 'Personal',
    simpleTitle: 'Major Life Decisions & Personal Choices',
    icon: Compass,
    description: 'Relocating to a new city, deciding between job offers, lifestyle adjustments, habit transformation, and major milestones.',
    simpleDescription: 'Clear frameworks for making big choices like moving cities, switching jobs, or choosing between two paths.',
    accentColor: 'purple',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/70',
    badgeText: 'text-purple-700 dark:text-purple-300',
    borderClass: 'border-purple-200 dark:border-purple-800',
    questions: {
      problemLabel: '1. What big life choice or dilemma are you trying to decide?',
      problemPlaceholder: 'e.g., Should I move across the country for a new job or stay near family? Should I stay at my stable corporate job or join an early startup?...',
      problemHelp: 'Explain the main options you are weighing.',
      contextLabel: '2. What are the main options, timeline, and stakes involved?',
      contextPlaceholder: 'e.g., I have 10 days to sign the offer. The new job pays 30% more, but I would be moving away from my close friend circle...',
      contextHelp: 'What happens if you choose Option A vs Option B?',
      goalLabel: '3. What matters most to you in this decision?',
      goalPlaceholder: 'e.g., Make a confident decision that aligns with my long-term happiness and values, with zero regret...',
      goalHelp: 'State your top personal values (growth, family, freedom, stability).',
      alreadyTriedLabel: '4. What pros/cons or advice have you already looked at?',
      alreadyTriedPlaceholder: 'e.g., Made a standard pros and cons list that ended in a tie; asked 5 friends who gave opposite opinions...',
      alreadyTriedHelp: 'Tell us what thoughts or methods you have tested so far.',
      tailoredTips: [
        'Identify whether this decision is reversible (easy to change back) or permanent.',
        'List your top 2 non-negotiable personal values.',
        'Name the specific fear or worry holding you back from each option.'
      ]
    },
    customFields: [
      {
        id: 'optionsComparison',
        label: 'Option A vs Option B',
        placeholder: 'e.g. Move to New York vs Stay in Austin near family',
        quickSuggestions: ['New Job Offer vs Current Stable Job', 'Relocating to New City vs Staying', 'Graduate School vs Continuing Work', 'Starting a Business vs Employment']
      },
      {
        id: 'decisionDeadline',
        label: 'Deadline to Decide',
        placeholder: 'e.g. Offer expires in 7 days, Lease ends next month',
        quickSuggestions: ['Within 48 hours', 'Within 7-10 days', 'Within 1 month', 'Exploring options / No deadline']
      },
      {
        id: 'topValuePriority',
        label: 'What Matters Most to You',
        placeholder: 'e.g. Career growth, Mental health, Closeness to family, Financial safety',
        quickSuggestions: ['Career & Financial Growth', 'Mental Peace & Well-being', 'Family & Community Ties', 'Autonomy & Freedom']
      },
      {
        id: 'biggestWorry',
        label: 'Biggest Fear or Worst-Case Scenario',
        placeholder: 'e.g. Feeling isolated in a new city, Missing out on rapid career growth',
        quickSuggestions: ['Feeling lonely or isolated', 'Financial regret', 'Stagnating in my career', 'Burnout and stress']
      }
    ],
    commonPitfalls: [
      'Treating easily reversible decisions like permanent one-way traps',
      'Asking too many people for advice without first defining what you value most',
      'Waiting for 100% certainty before making any move'
    ],
    provenPatterns: [
      'Looking at the worst-case regret instead of just the best-case dream',
      'Doing a small trial run (like visiting the new city for 4 days) before signing',
      'Rating each option on 3 clear values rather than a generic pros/cons list'
    ],
    sampleScenarios: [
      {
        title: 'Relocating for Career vs Remaining Near Family',
        summary: 'Balancing a high-growth career move with personal community connections',
        data: {
          problem: 'Received a career-defining job offer in another city requiring cross-country relocation, but worried about leaving established support networks.',
          context: 'Current city provides strong social circle, but local job market is stagnant in my specialized industry.',
          goal: 'Determine whether to accept the relocation offer with a clear 2-year evaluation framework.',
          alreadyTried: 'Created simple pros and cons lists which resulted in paralysis.',
          constraints: {
            budget: 'Relocation package provided by company',
            time: 'Offer decision deadline in 10 days',
            resources: 'Option to visit new city for 3 days before signing',
            experienceLevel: 'Mid-career professional'
          },
          category: 'Personal Decisions',
          urgency: 'high'
        }
      }
    ]
  },
  Relationships: {
    id: 'Relationships',
    label: 'Relationships & Interpersonal Alignment',
    shortLabel: 'Relationships',
    simpleTitle: 'Communication, Team Dynamics & Difficult Conversations',
    icon: Users,
    description: 'Co-founder disagreements, difficult workplace conversations, roommate tensions, boundary setting, and communication breakdowns.',
    simpleDescription: 'Resolve disagreements calmly with co-founders, coworkers, managers, clients, or roommates.',
    accentColor: 'rose',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/70',
    badgeText: 'text-rose-700 dark:text-rose-300',
    borderClass: 'border-rose-200 dark:border-rose-800',
    questions: {
      problemLabel: '1. What conversation, disagreement, or boundary are you trying to handle?',
      problemPlaceholder: 'e.g., My co-founder and I disagree on equity split and product direction; my team member is not doing their share of work...',
      problemHelp: 'Explain the relationship issue and what triggered it.',
      contextLabel: '2. Who is involved and what is the relationship background?',
      contextPlaceholder: 'e.g., We started this company 6 months ago as equal 50/50 partners. We have 9 months of runway left and tension is slowing us down...',
      contextHelp: 'Describe who is involved (boss, peer, partner) and how long it has been happening.',
      goalLabel: '3. How would you like the situation to improve?',
      goalPlaceholder: 'e.g., Agree on written roles and responsibilities so we can work smoothly without lingering tension...',
      goalHelp: 'What does a fair, healthy resolution look like?',
      alreadyTriedLabel: '4. What have you said or done so far to address it?',
      alreadyTriedPlaceholder: 'e.g., Dropped subtle hints; vented to other coworkers; avoided the topic in meetings...',
      alreadyTriedHelp: 'Tell us past conversations so we can suggest a constructive approach.',
      tailoredTips: [
        'Focus on describing specific actions rather than guessing the other person’s motives.',
        'Explain what a win-win outcome looks like for both sides.',
        'Mention if there are contracts, job descriptions, or third-party mediators involved.'
      ]
    },
    customFields: [
      {
        id: 'personInvolved',
        label: 'Who Is Involved in This Situation?',
        placeholder: 'e.g. Co-founder, Direct Manager, Teammate, Roommate, Client',
        quickSuggestions: ['Co-founder / Business Partner', 'Manager / Supervisor', 'Teammate / Coworker', 'Client / Customer', 'Roommate / Friend']
      },
      {
        id: 'durationTension',
        label: 'How Long Has This Been Happening?',
        placeholder: 'e.g. Past 2 weeks, Since last month, Several months',
        quickSuggestions: ['Recent (past 1-2 weeks)', 'Ongoing (1-3 months)', 'Long-standing pattern', 'First time occurrence']
      },
      {
        id: 'desiredResolution',
        label: 'What Would a Healthy Outcome Be?',
        placeholder: 'e.g. Clear written roles, Respectful 1-on-1 discussion, Fair split',
        quickSuggestions: ['Clear written responsibilities', 'Constructive private 1-on-1', 'Fair compromise on work/money', 'Professional healthy boundaries']
      },
      {
        id: 'pastCommunication',
        label: 'How Have You Communicated So Far?',
        placeholder: 'e.g. Sent Slack messages, Avoided talking, Had a quick heated chat',
        quickSuggestions: ['Hinted gently without clear words', 'Sent emails / messages', 'Avoided the conversation', 'Had an unproductive talk']
      }
    ],
    commonPitfalls: [
      'Putting off tough conversations until small irritations blow up into arguments',
      'Focusing on "winning the argument" instead of solving the shared problem',
      'Leaving agreements verbal without sending a friendly written recap afterward'
    ],
    provenPatterns: [
      'Using clear "Observation + Impact + Proposal" phrasing instead of blame',
      'Focusing on shared goals and writing down clear responsibilities',
      'Setting up a calm 1-on-1 coffee or video chat to listen first before reacting'
    ],
    sampleScenarios: [
      {
        title: 'Co-founder Disagreement on Product Direction',
        summary: 'Resolving fundamental technical vs commercial vision conflict in a startup',
        data: {
          problem: 'Technical co-founder wants to rebuild backend for 6 months while commercial co-founder wants to start selling MVP immediately.',
          context: 'Both hold equal 50% equity stakes, seed funding has 9 months of runway remaining, and tension is slowing daily decisions.',
          goal: 'Align on a unified 90-day milestone plan with clear decision-making authority.',
          alreadyTried: 'Debated repeatedly in long meetings without reaching consensus.',
          constraints: {
            budget: '9 months of company runway',
            time: 'Resolution needed within 1 week',
            resources: 'Advisory board member willing to facilitate one meeting',
            experienceLevel: 'First-time startup co-founders'
          },
          category: 'Relationships',
          urgency: 'high'
        }
      }
    ]
  },
  'Everyday Problems': {
    id: 'Everyday Problems',
    label: 'Everyday Problems & Practical Challenges',
    shortLabel: 'Everyday',
    simpleTitle: 'Daily Practical Problems, Contracts & Client Issues',
    icon: Wrench,
    description: 'Client scope creep, landlord negotiations, contractor disputes, contract clarity, organizational logistics, and daily friction.',
    simpleDescription: 'Solve real-world hassles with demanding clients, landlords, contractors, and service disputes.',
    accentColor: 'sky',
    badgeBg: 'bg-sky-50 dark:bg-sky-950/70',
    badgeText: 'text-sky-700 dark:text-sky-300',
    borderClass: 'border-sky-200 dark:border-sky-800',
    questions: {
      problemLabel: '1. What practical problem, client issue, or dispute happened?',
      problemPlaceholder: 'e.g., A web design client keeps asking for 10 extra features not in our contract; landlord is refusing to fix the water heater...',
      problemHelp: 'Explain what went wrong in plain, straightforward terms.',
      contextLabel: '2. What was originally agreed, and what are the key facts?',
      contextPlaceholder: 'e.g., We signed a $2,500 contract for a 5-page site. The client now wants a custom shop with free extra revisions...',
      contextHelp: 'Mention if you have a written contract, email thread, or receipts.',
      goalLabel: '3. What fair resolution or compromise do you want?',
      goalPlaceholder: 'e.g., Set firm boundaries, charge a fair price for extra work, and finish the project amicably...',
      goalHelp: 'What outcome protects your time and money?',
      alreadyTriedLabel: '4. What have you already asked or done so far?',
      alreadyTriedPlaceholder: 'e.g., Did the first 3 small changes for free to be nice; sent a quick text message that got ignored...',
      alreadyTriedHelp: 'Tell us how you have responded so far.',
      tailoredTips: [
        'Mention if you have written messages, signed proposals, or invoices.',
        'Include any money or deadline dates involved.',
        'Distinguish between what you are legally owed vs what you are happy to compromise on.'
      ]
    },
    customFields: [
      {
        id: 'issueType',
        label: 'Type of Problem / Dispute',
        placeholder: 'e.g. Client asking for free extra work, Landlord repair issue, Contractor delay',
        quickSuggestions: ['Client asking for free extra work (Scope Creep)', 'Landlord / Rental repair dispute', 'Contractor / Vendor delay', 'Service refund / Cancellation']
      },
      {
        id: 'writtenAgreement',
        label: 'Do You Have a Written Agreement?',
        placeholder: 'e.g. Signed contract, Email thread, Text messages, Verbal only',
        quickSuggestions: ['Signed formal contract', 'Written email agreement', 'Text messages / DMs', 'Verbal agreement only']
      },
      {
        id: 'amountDeadline',
        label: 'Money Involved or Deadline',
        placeholder: 'e.g. $1,500 invoice, Project deadline next Friday',
        quickSuggestions: ['Under $500', '$500 - $2,500', '$2,500+', 'No money / Just deadline']
      },
      {
        id: 'desiredCompromise',
        label: 'Desired Fair Solution',
        placeholder: 'e.g. Sign paid change order, Get full refund, Complete on original terms',
        quickSuggestions: ['Sign paid Change Order for extra work', 'Get full or partial refund', 'Complete on agreed terms', 'Part ways amicably']
      }
    ],
    commonPitfalls: [
      'Doing extra work for free out of politeness, which teaches the other party to ask for more',
      'Writing angry messages instead of politely pointing to the agreed written terms',
      'Agreeing to extra requests verbally without sending a price estimate in writing'
    ],
    provenPatterns: [
      'Using a simple "Change Order" email: "We can gladly add feature X for $Y and Z days"',
      'Calmly offering 2 reasonable choices so the other person stays in control',
      'Keeping all important project requests documented in email threads'
    ],
    sampleScenarios: [
      {
        title: 'Freelance Scope Creep & Demanding Client',
        summary: 'Enforcing project boundaries when client requests endless additions to fixed-price scope',
        data: {
          problem: 'A fixed-price web design client keeps asking for new features and multiple revisions not in the original agreement.',
          context: 'I quoted $2,500 for a 5-page website. The client has now asked for custom e-commerce checkout, multilingual support, and 4 extra layouts, insisting "this should only take 5 minutes".',
          goal: 'Set professional boundaries, charge fairly for extra requests, and finish the project on good terms.',
          alreadyTried: 'Accommodated the first 3 small requests for free, which only encouraged more requests.',
          constraints: {
            budget: 'None',
            time: 'Project deadline in 2 weeks',
            resources: 'Existing written email proposal and Figma drafts',
            experienceLevel: 'Freelancing for 1.5 years'
          },
          category: 'Everyday Problems',
          urgency: 'high'
        }
      }
    ]
  },
  Other: {
    id: 'Other',
    label: 'Other & Multidisciplinary Topics',
    shortLabel: 'Other',
    simpleTitle: 'Special Projects, Hobbies & Unique Challenges',
    icon: Sparkles,
    description: 'Cross-cutting challenges, specialized hobbies, creative pursuits, and unique situations requiring collective wisdom.',
    simpleDescription: 'Get experience-backed advice on unique hobbies, creative projects, and multidisciplinary goals.',
    accentColor: 'slate',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-800 dark:text-slate-200',
    borderClass: 'border-slate-300 dark:border-slate-700',
    questions: {
      problemLabel: '1. What challenge, goal, or special project are you working on?',
      problemPlaceholder: 'e.g., I want to finish writing my first novel; I am training for a half-marathon with limited time; organizing a community event...',
      problemHelp: 'Describe what you want to achieve or figure out.',
      contextLabel: '2. What background details and current constraints explain your situation?',
      contextPlaceholder: 'e.g., I work full-time (40 hrs/week) and have 1 hour in the morning to dedicate to this project...',
      contextHelp: 'Mention your available time, tools, and experience level.',
      goalLabel: '3. What specific result represents success for you?',
      goalPlaceholder: 'e.g., Finish a complete first draft within 90 days with steady weekly progress...',
      goalHelp: 'What milestone do you want to hit?',
      alreadyTriedLabel: '4. What approaches have you tried so far?',
      alreadyTriedPlaceholder: 'e.g., Tried setting weekend marathon sessions which caused burnout; tried following a general online guide...',
      alreadyTriedHelp: 'Tell us what did or did not work so far.',
      tailoredTips: [
        'Be as specific as possible about the topic and what success looks like.',
        'List any key limits like budget, tools, or weekly hours.',
        'Tell us what step you feel most stuck on right now.'
      ]
    },
    customFields: [
      {
        id: 'topicDomain',
        label: 'Project Topic or Activity',
        placeholder: 'e.g. Novel writing, Marathon training, Podcasting, Crafting',
        quickSuggestions: ['Creative Writing / Book', 'Fitness / Endurance Goal', 'Side Hobby / Crafting', 'Community Project / Event']
      },
      {
        id: 'currentProgress',
        label: 'Current Progress Level',
        placeholder: 'e.g. Just getting started, 25% done, Stuck halfway through',
        quickSuggestions: ['Just getting started (0-10%)', 'Early progress (20-40%)', 'Stuck halfway (50%)', 'Finishing & Polishing (80%+)']
      },
      {
        id: 'timeAndTools',
        label: 'Time & Tools Available',
        placeholder: 'e.g. 45 minutes every morning, Laptop, Basic gear',
        quickSuggestions: ['30-60 mins daily', 'Weekends only (4-6 hrs)', 'Minimal / Free tools', 'Full equipment ready']
      },
      {
        id: 'firstMilestone',
        label: 'First Milestone You Want to Hit',
        placeholder: 'e.g. Complete chapter 1, Run 5k without stopping, Launch page',
        quickSuggestions: ['Finish first draft / prototype', 'Reach initial milestone in 30 days', 'Build a consistent weekly routine', 'Publish or share with first audience']
      }
    ],
    commonPitfalls: [
      'Setting vague goals without a clear measurable finish line',
      'Relying on big irregular weekend bursts instead of small daily habits',
      'Perfectionism stopping you from finishing an early version'
    ],
    provenPatterns: [
      'Setting a tiny, easy daily habit (e.g. 25 minutes of work every morning)',
      'Aiming for a messy first draft before trying to make it perfect',
      'Sharing progress weekly with a friend or community for feedback'
    ],
    sampleScenarios: [
      {
        title: 'Creative Project Completion Under Constraints',
        summary: 'Finishing a major creative milestone while balancing full-time responsibilities',
        data: {
          problem: 'Working on a creative manuscript/portfolio project for 12 months with only 40% completed due to shifting scope and perfectionism.',
          context: 'Full-time job takes up 45 hours/week, leaving scattered evening energy.',
          goal: 'Ship a finished first version within 90 days with consistent weekly output.',
          alreadyTried: 'Tried setting marathon weekend sessions which led to burnout.',
          constraints: {
            budget: '$0',
            time: '45 minutes every morning before work',
            resources: 'Laptop, notes',
            experienceLevel: 'Passionate practitioner'
          },
          category: 'Other',
          urgency: 'medium'
        }
      }
    ]
  }
};

// Aliases and extensions for full Category taxonomy compatibility
(CATEGORY_TAXONOMY as any)['Career & Jobs'] = CATEGORY_TAXONOMY['Career'];
(CATEGORY_TAXONOMY as any)['Personal Growth'] = CATEGORY_TAXONOMY['Personal Decisions'];
(CATEGORY_TAXONOMY as any)['Health & Fitness'] = {
  ...CATEGORY_TAXONOMY['Everyday Problems'],
  id: 'Health & Fitness',
  label: 'Health & Fitness',
  shortLabel: 'Health & Fitness',
  simpleTitle: 'Health, Sleep, Exercise & Fitness',
};
(CATEGORY_TAXONOMY as any)['Daily Life'] = CATEGORY_TAXONOMY['Everyday Problems'];

export const ALL_CATEGORIES: Category[] = [
  'Education',
  'Career',
  'Technology',
  'Personal Growth',
  'Relationships',
  'Finance',
  'Health & Fitness',
  'Daily Life',
  'Productivity',
  'Personal Decisions',
  'Everyday Problems',
  'Other',
];
