import React from 'react';
import { ViewMode } from '../App';
import { Logo } from './Logo';

export const Footer: React.FC<{ onNavigate: (view: ViewMode) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-brand-charcoal text-brand-warm-ivory border-t border-brand-warm-ivory/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="space-y-4">
            <button onClick={() => onNavigate('home')} className="block cursor-pointer">
              <Logo className="h-10 w-auto" />
            </button>
            <p className="text-brand-warm-ivory/70 text-sm leading-relaxed">
              Real experiences. Shared knowledge. Different perspectives.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-soft-violet">Platform</h4>
            <nav className="flex flex-col gap-2 text-sm text-brand-warm-ivory/70">
              <button onClick={() => onNavigate('home')} className="hover:text-brand-warm-ivory transition-colors">Home</button>
              <button onClick={() => onNavigate('experiences')} className="hover:text-brand-warm-ivory transition-colors">Stories</button>
              <button onClick={() => onNavigate('solutions')} className="hover:text-brand-warm-ivory transition-colors">My Plans</button>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-soft-violet">Legal</h4>
            <nav className="flex flex-col gap-2 text-sm text-brand-warm-ivory/70">
              <button onClick={() => onNavigate('privacy-policy')} className="hover:text-brand-warm-ivory transition-colors">Privacy Policy</button>
              <button onClick={() => onNavigate('terms-and-conditions')} className="hover:text-brand-warm-ivory transition-colors">Terms of Service</button>
              <button onClick={() => onNavigate('community-guidelines')} className="hover:text-brand-warm-ivory transition-colors">Guidelines</button>
            </nav>
          </div>
        </div>

        <div className="pt-8 border-t border-brand-warm-ivory/10 text-xs text-brand-warm-ivory/50 flex flex-col sm:flex-row justify-between gap-4">
          <p>© {new Date().getFullYear()} Xperiens. All rights reserved.</p>
          <p>Built for the collective experience.</p>
        </div>
      </div>
    </footer>
  );
};
