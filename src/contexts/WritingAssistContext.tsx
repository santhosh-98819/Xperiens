import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAiWritingAssistPreference, setAiWritingAssistPreference } from '../services/api';
import { useAuth } from './AuthContext';

interface WritingAssistContextType {
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  toggleEnabled: () => void;
  showPrivacyNotice: boolean;
  setShowPrivacyNotice: (show: boolean) => void;
}

const WritingAssistContext = createContext<WritingAssistContextType | undefined>(undefined);

export const WritingAssistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, updateUserPreferences } = useAuth();
  const [isEnabled, setIsEnabledState] = useState<boolean>(() => {
    return getAiWritingAssistPreference();
  });
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);

  useEffect(() => {
    if (userProfile?.aiWritingAssistEnabled !== undefined) {
      setIsEnabledState(userProfile.aiWritingAssistEnabled);
      setAiWritingAssistPreference(userProfile.aiWritingAssistEnabled);
    }
  }, [userProfile?.aiWritingAssistEnabled]);

  const setIsEnabled = (enabled: boolean) => {
    setIsEnabledState(enabled);
    setAiWritingAssistPreference(enabled);
    if (userProfile) {
      updateUserPreferences({ aiWritingAssistEnabled: enabled });
    }
  };

  const toggleEnabled = () => {
    setIsEnabled(!isEnabled);
  };

  return (
    <WritingAssistContext.Provider
      value={{
        isEnabled,
        setIsEnabled,
        toggleEnabled,
        showPrivacyNotice,
        setShowPrivacyNotice,
      }}
    >
      {children}
    </WritingAssistContext.Provider>
  );
};

export const useWritingAssist = () => {
  const context = useContext(WritingAssistContext);
  if (!context) {
    throw new Error('useWritingAssist must be used within a WritingAssistProvider');
  }
  return context;
};
