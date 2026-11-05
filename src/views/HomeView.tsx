import React, { useState } from 'react';
import { SAMPLE_PROBLEMS } from '../data/sampleProblems';
import { Experience, Category } from '../types';
import { ViewMode } from '../App';
import { ExperienceCard } from '../components/ExperienceCard';
import { Sparkles, ArrowRight, Briefcase, GraduationCap, Cpu, Target, UserCheck, DollarSign, HeartHandshake, HelpCircle } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: ViewMode) => void;
  onSelectProblemPreset: (problemText: string, category?: Category) => void;
  featuredExperiences: Experience[];
  onSelectExperience?: (exp: Experience) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSelectProblemPreset,
  featuredExperiences,
  onSelectExperience,
}) => {
  const [quickInput, setQuickInput] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectProblemPreset(quickInput.trim(), 'Other');
    onNavigate('ask');
  };

  const categories: { name: Category; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { name: 'Career', icon: Briefcase, desc: 'Interview prep, pivots, salary negotiation.' },
    { name: 'Education', icon: GraduationCap, desc: 'Learning methods, exam recovery.' },
    { name: 'Technology', icon: Cpu, desc: 'Architecture, stack transitions.' },
    { name: 'Productivity', icon: Target, desc: 'Time management, ADHD workflows.' },
    { name: 'Personal Decisions', icon: UserCheck, desc: 'Relocation, habit changes.' },
    { name: 'Finance', icon: DollarSign, desc: 'Debt recovery, budgeting.' },
    { name: 'Relationships', icon: HeartHandshake, desc: 'Boundaries, alignment.' },
    { name: 'Everyday Problems', icon: HelpCircle, desc: 'Freelance, general disputes.' },
  ];

  return (
    <div className="space-y-24 py-16">
      {/* Editorial Hero */}
      <section className="text-center max-w-3xl mx-auto space-y-8">
        <h1 className="text-5xl lg:text-7xl font-serif text-brand-deep-indigo dark:text-brand-warm-ivory tracking-tight leading-tight">
          Real experiences. Shared knowledge. Different perspectives.
        </h1>
        <p className="text-lg text-brand-charcoal/70 dark:text-brand-warm-ivory/70 leading-relaxed font-sans">
          Xperiens is a premium storytelling platform where collective human wisdom meets AI-driven analysis. Explore how others solved the challenges you're facing.
        </p>

        <form onSubmit={handleQuickSubmit} className="relative max-w-xl mx-auto">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Share a situation you're navigating..."
            className="w-full px-6 py-4 rounded-full border border-brand-charcoal/10 dark:border-brand-warm-ivory/10 bg-white dark:bg-brand-charcoal shadow-sm focus:ring-2 focus:ring-brand-soft-violet outline-none"
          />
          <button type="submit" className="absolute right-2 top-2 bottom-2 px-6 bg-brand-deep-indigo text-white rounded-full font-semibold text-sm hover:opacity-90">
            Find Clarity
          </button>
        </form>
      </section>

      {/* Editorial Category Grid */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-serif text-brand-deep-indigo dark:text-brand-warm-ivory mb-8">Explore Domains</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => { onSelectProblemPreset('', cat.name); onNavigate('experiences'); }}
              className="p-6 border border-brand-charcoal/10 dark:border-brand-warm-ivory/10 rounded-2xl hover:border-brand-soft-violet transition-colors text-left space-y-3 cursor-pointer"
            >
              <cat.icon className="w-6 h-6 text-brand-soft-violet" />
              <h3 className="font-semibold text-brand-deep-indigo dark:text-brand-warm-ivory">{cat.name}</h3>
              <p className="text-sm text-brand-charcoal/70 dark:text-brand-warm-ivory/70">{cat.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Editorial Featured Experiences */}
      <section className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif text-brand-deep-indigo dark:text-brand-warm-ivory">Recent Stories</h2>
            <button onClick={() => onNavigate('experiences')} className="text-brand-soft-violet flex items-center gap-2 font-semibold cursor-pointer">View All <ArrowRight className="w-4 h-4"/></button>
        </div>
        
        {featuredExperiences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredExperiences.slice(0, 3).map((exp) => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                showRelevance={false}
                onClick={() => onSelectExperience && onSelectExperience(exp)}
              />
            ))}
          </div>
        ) : (
            <p className="text-center text-brand-charcoal/50">No stories shared yet. Be the first!</p>
        )}
      </section>
    </div>
  );
};
