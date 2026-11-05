import React from 'react';
import { useLegalAcceptance } from '../hooks/useLegalAcceptance';
import { LegalAcceptanceView } from '../views/LegalAcceptanceView';

export const LegalAcceptanceGuard: React.FC<{
  children: React.ReactNode;
  onNavigate?: (view: any) => void;
}> = ({ children, onNavigate }) => {
  const { needsAcceptance, acceptanceLoading } = useLegalAcceptance();

  if (acceptanceLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (needsAcceptance) {
    return (
      <LegalAcceptanceView
        onComplete={() => {}}
        onNavigate={onNavigate || (() => {})}
      />
    );
  }

  return <>{children}</>;
};
