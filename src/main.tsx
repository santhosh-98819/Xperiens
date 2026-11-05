import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { WritingAssistProvider } from './contexts/WritingAssistContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <WritingAssistProvider>
          <App />
        </WritingAssistProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
);
