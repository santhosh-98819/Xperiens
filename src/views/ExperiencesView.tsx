import React, { useState, useEffect } from 'react';
import { Experience, Category } from '../types';
import { ExperienceCard } from '../components/ExperienceCard';
import { fetchExperiences, getLocalUser } from '../services/api';
import { fetchUserExperiences } from '../services/firestoreService';
import { Search, Compass, ShieldCheck, User, AlertTriangle, PlusCircle, ArrowRight } from 'lucide-react';
import { ViewMode } from '../App';

interface ExperiencesViewProps {
  initialCategory?: Category | 'All';
  onNavigate: (view: ViewMode) => void;
  onSelectExperience?: (exp: Experience) => void;
}

export const ExperiencesView: React.FC<ExperiencesViewProps> = ({
  initialCategory = 'All',
  onNavigate,
  onSelectExperience,
}) => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'most_useful' | 'newest'>('most_useful');
  const [viewMode, setViewMode] = useState<'community' | 'my' | 'demo'>('community');
  const [counts, setCounts] = useState<{ real: number; my: number; demo: number }>({ real: 0, my: 0, demo: 0 });

  const loadData = async () => {
    setLoading(true);
    let experiencesData: Experience[] = [];
    
    if (viewMode === 'my') {
      const user = getLocalUser();
      experiencesData = await fetchUserExperiences(user.id);
      setCounts((prev) => ({ ...prev, my: experiencesData.length }));
    } else {
      const data = await fetchExperiences({
        category: selectedCategory,
        outcome: selectedOutcome,
        query: searchQuery,
        sort: sortBy,
        mode: viewMode,
      });
      experiencesData = data.experiences || [];
      setCounts((prev) => ({
        ...prev,
        real: data.realCount ?? 0,
        demo: data.demoCount ?? 0,
      }));
    }
    setExperiences(experiencesData);
    setLoading(false);
  };

  const handleDeleteExperience = (deletedId: string) => {
    setExperiences((prev) => prev.filter((e) => e.id !== deletedId));
    if (viewMode === 'community') {
      setCounts((prev) => ({ ...prev, real: Math.max(0, prev.real - 1) }));
    } else {
      setCounts((prev) => ({ ...prev, demo: Math.max(0, prev.demo - 1) }));
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedOutcome, sortBy, viewMode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const categories = ['All', 'Career', 'Education', 'Technology', 'Productivity', 'Personal Decisions', 'Finance', 'Relationships', 'Everyday Problems', 'Other'];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 space-y-16 animate-fadeIn pb-32">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-brand-border dark:border-dark-border pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary dark:text-dark-text-secondary">
            <Compass className="w-3 h-3" />
            <span>Wisdom Repository</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">
            {viewMode === 'community' ? 'Community Stories' : viewMode === 'my' ? 'My Reflections' : 'Reference Data'}
          </h1>
          <p className="text-brand-text-secondary dark:text-dark-text-secondary max-w-xl text-lg leading-relaxed">
            {viewMode === 'community' 
              ? 'A curated collection of real-world experiences, failures, and successes from contributors worldwide.' 
              : viewMode === 'my' 
              ? 'Your personal contributions to the collective human knowledge base.' 
              : 'Standardized test cases for platform evaluation and model grounding.'}
          </p>
        </div>

        <button
          onClick={() => onNavigate('share-experience')}
          className="flex items-center gap-2 px-8 py-4 bg-brand-text-primary dark:bg-dark-text-primary text-white dark:text-dark-bg font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <PlusCircle className="w-5 h-5" />
          Contribute a Story
        </button>
      </header>

      {/* Control Bar: Search & Filter */}
      <section className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, challenge, or keyword..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-brand-border dark:border-dark-border bg-brand-bg dark:bg-dark-bg text-brand-text-primary dark:text-dark-text-primary focus:border-brand-accent dark:focus:border-dark-accent outline-none transition-all shadow-xs"
            />
          </form>

          {/* Mode Switcher */}
          <div className="flex bg-brand-border/20 dark:bg-dark-border/20 p-1 rounded-xl border border-brand-border dark:border-dark-border overflow-hidden">
             {[
               { id: 'community', icon: ShieldCheck, label: 'Community', count: counts.real },
               { id: 'my', icon: User, label: 'My Stories', count: counts.my },
               { id: 'demo', icon: AlertTriangle, label: 'Reference', count: counts.demo }
             ].map((mode) => (
               <button
                 key={mode.id}
                 onClick={() => setViewMode(mode.id as any)}
                 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === mode.id ? 'bg-brand-card dark:bg-dark-card text-brand-text-primary dark:text-dark-text-primary shadow-sm' : 'text-brand-text-secondary hover:text-brand-text-primary'}`}
               >
                 <mode.icon className="w-3.5 h-3.5" />
                 {mode.label}
                 <span className="opacity-40 tabular-nums">({mode.count})</span>
               </button>
             ))}
          </div>
        </div>

        {/* Categories & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-6 border-y border-brand-border dark:border-dark-border py-4">
           <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
             {categories.map((cat) => (
               <button
                 key={cat}
                 onClick={() => setSelectedCategory(cat)}
                 className={`text-xs font-bold tracking-widest uppercase whitespace-nowrap transition-colors ${selectedCategory === cat ? 'text-brand-accent dark:text-dark-accent' : 'text-brand-text-secondary hover:text-brand-text-primary'}`}
               >
                 {cat}
               </button>
             ))}
           </div>

           <div className="flex items-center gap-4">
             <select
               value={selectedOutcome}
               onChange={(e) => setSelectedOutcome(e.target.value)}
               className="bg-transparent text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary dark:text-dark-text-secondary border-none focus:ring-0 cursor-pointer"
             >
               <option value="all">All Outcomes</option>
               <option value="worked">Worked</option>
               <option value="partially_worked">Mixed</option>
               <option value="did_not_work">Failed</option>
             </select>

             <div className="w-px h-4 bg-brand-border dark:bg-dark-border" />

             <select
               value={sortBy}
               onChange={(e) => setSortBy(e.target.value as any)}
               className="bg-transparent text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary dark:text-dark-text-secondary border-none focus:ring-0 cursor-pointer"
             >
               <option value="most_useful">Most Useful</option>
               <option value="newest">Newest</option>
               <option value="relevance">Quality</option>
             </select>
           </div>
        </div>
      </section>

      {/* Grid Section */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 opacity-50">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-brand-border/20 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : experiences.length === 0 ? (
          <div className="py-32 text-center bg-brand-accent/5 dark:bg-dark-accent/5 rounded-[3rem] border border-brand-accent/10 dark:border-dark-accent/10 space-y-6">
            <Compass className="w-16 h-16 text-brand-accent dark:text-dark-accent mx-auto opacity-30" />
            <div className="space-y-2">
               <h3 className="text-2xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">The repository is waiting.</h3>
               <p className="text-brand-text-secondary dark:text-dark-text-secondary max-w-sm mx-auto">No stories match your current filters. Try broadening your search or contribute your own experience.</p>
            </div>
            <button
              onClick={() => onNavigate('share-experience')}
              className="font-bold text-brand-accent dark:text-dark-accent hover:underline flex items-center gap-2 mx-auto"
            >
              Start a new reflection <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {experiences.map((exp) => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                showRelevance={false}
                onDelete={handleDeleteExperience}
                onClick={() => onSelectExperience && onSelectExperience(exp)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
