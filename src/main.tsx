import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { LanguageProvider } from './contexts/LanguageContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { WritingAssistProvider } from './contexts/WritingAssistContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <WritingAssistProvider>
            <App />
          </WritingAssistProvider>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  </StrictMode>,
);
