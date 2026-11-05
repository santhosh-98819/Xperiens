import { ProblemInput } from '../types';

export const SAMPLE_PROBLEMS: { label: string; tag: string; data: ProblemInput }[] = [
  {
    label: 'Technical Interview in 30 Days',
    tag: 'Career',
    data: {
      problem: 'I have a junior/intermediate software engineer technical interview loop in 30 days and feel overwhelmed by the sheer volume of algorithms and system design topics.',
      context: 'I know basic Python and data structures, but I freeze during live coding tests and struggle to explain my thought process out loud.',
      goal: 'Pass the 3-round technical interview and receive a formal job offer without burning out.',
      alreadyTried: 'Tried randomly solving LeetCode hard problems and watching long video lectures without writing code.',
      constraints: {
        budget: '$0 - $50 for mock interview platforms or books',
        time: '2-3 hours per day after full-time work',
        resources: 'Laptop, VS Code, online practice sites',
        experienceLevel: 'Intermediate programmer, beginner at live whiteboard interviews'
      },
      category: 'Career',
      urgency: 'high'
    }
  },
  {
    label: 'Freelance Scope Creep & Demanding Client',
    tag: 'Everyday Problems',
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
  },
  {
    label: 'Bouncing Back from Midterm Failure',
    tag: 'Education',
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
  },
  {
    label: 'Combating Remote Work Procrastination',
    tag: 'Productivity',
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
  }
];
