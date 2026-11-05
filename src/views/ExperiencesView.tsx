import React, { useState, useEffect } from 'react';
import { Experience, Category, OutcomeStatus } from '../types';
import { ExperienceCard } from '../components/ExperienceCard';
import { Tooltip } from '../components/Tooltip';
import { fetchExperiences, getLocalUser } from '../services/api';
import { fetchUserExperiences } from '../services/firestoreService';
import { Search, Filter, PlusCircle, Sparkles, Compass, CheckCircle2, SlidersHorizontal, AlertTriangle, ArrowRight, ShieldCheck, HelpCircle, User } from 'lucide-react';
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

  const categories = [
    'All',
    'Career',
    'Education',
    'Technology',
    'Productivity',
    'Personal Decisions',
    'Finance',
    'Relationships',
    'Everyday Problems',
    'Other',
  ];

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-10 space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200/80 mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>COMMUNITY EXPERIENCE REPOSITORY</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {viewMode === 'community' ? 'Community Experiences' : 'Demo Reference Experiences'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {viewMode === 'community'
              ? 'Shared across users: What real people tried, what happened, and what they learned.'
              : 'Development & testing reference cases. Each case is strictly tagged DEMO EXPERIENCE.'}
          </p>
        </div>

        <Tooltip content="Submit your own experience to help future users solve similar challenges" position="left">
          <button
            id="contribute-experience-btn"
            onClick={() => onNavigate('share-experience')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex-shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Share What You Learned</span>
          </button>
        </Tooltip>
      </div>

      {/* Mode Switcher Tabs (Real Community vs Demo Mode) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <Tooltip content="Grounded in real human submissions only (starts at 0 on clean install)" position="top">
            <button
              onClick={() => setViewMode('community')}
              id="tab-community-experiences"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'community'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Real Community Experiences</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${viewMode === 'community' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                {counts.real}
              </span>
            </button>
          </Tooltip>

          <Tooltip content="Experiences created by you" position="top">
            <button
              onClick={() => setViewMode('my')}
              id="tab-my-experiences"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'my'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 text-indigo-600" />
              <span>My Experiences</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${viewMode === 'my' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-700'}`}>
                {counts.my}
              </span>
            </button>
          </Tooltip>

          <Tooltip content="Mock test cases for demonstrating UI layout and test-driving AI synthesis" position="top">
            <button
              onClick={() => setViewMode('demo')}
              id="tab-demo-experiences"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'demo'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Demo Data (Test Mode)</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${viewMode === 'demo' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'}`}>
                {counts.demo}
              </span>
            </button>
          </Tooltip>
        </div>

        <div className="text-xs text-slate-500 px-3">
          {viewMode === 'community' ? (
            <span>Production database: Grounded exclusively in real human submissions</span>
          ) : (
            <span className="text-amber-800 font-medium">Testing cases for layout & model evaluation</span>
          )}
        </div>
      </div>

      {/* Semantic Search & Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              id="experience-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search experiences: 'how people learned programming', 'exam failure', 'scope creep'..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-hidden"
            />
          </div>
          <button
            type="submit"
            id="experience-search-submit"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Filters: Outcome & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Outcome Status:</span>
            <select
              value={selectedOutcome}
              onChange={(e) => setSelectedOutcome(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs cursor-pointer"
            >
              <option value="all">All Outcomes</option>
              <option value="worked">Worked</option>
              <option value="partially_worked">Partially Worked</option>
              <option value="did_not_work">Didn't Work</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs cursor-pointer"
            >
              <option value="most_useful">Most Useful</option>
              <option value="newest">Newest First</option>
              <option value="relevance">Quality Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Experience Cards Grid or Zero State */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto mb-2" />
          <span>Loading experiences...</span>
        </div>
      ) : experiences.length === 0 ? (
        <div className="p-10 sm:p-14 bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          
          <div className="space-y-1 max-w-lg mx-auto">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              0 Community Experiences
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              No community experiences yet.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed pt-1">
              Be one of the first people to share what you learned. Once shared, your experience becomes part of the community knowledge repository and helps future problem solvers.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Tooltip content="Publish your first real trial and outcome" position="top">
              <button
                onClick={() => onNavigate('share-experience')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm cursor-pointer transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Share What You Learned</span>
              </button>
            </Tooltip>
            
            {counts.demo > 0 && viewMode !== 'demo' && (
              <button
                onClick={() => setViewMode('demo')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 cursor-pointer transition-all"
              >
                <span>View Demo Data ({counts.demo} Cases)</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
};
