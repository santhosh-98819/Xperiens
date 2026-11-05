import React from 'react';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
  onBack: () => void;
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ title, lastUpdated, children, onBack }) => (
  <div className="max-w-4xl mx-auto py-12 px-6">
    <button onClick={onBack} className="mb-8 text-indigo-600 hover:underline">← Back</button>
    <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
      <h1 className="text-4xl font-extrabold mb-2 text-slate-900 dark:text-white">{title}</h1>
      <p className="text-slate-500 mb-8">Last Updated: {lastUpdated}</p>
      <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-900 dark:[&>h2]:text-white [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-slate-800 dark:[&>h3]:text-slate-100 [&>h3]:mt-6 [&>h3]:mb-3 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2 [&>li]:mb-1">
        {children}
      </div>
    </div>
  </div>
);
