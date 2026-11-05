import React from 'react';
import { LegalPageLayout } from '../components/LegalPageLayout';

export const CommunityGuidelinesView: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <LegalPageLayout title="Community Guidelines" lastUpdated="August 24, 2026" onBack={onBack}>
    <p>Core principle: <strong>"Real experiences. Shared knowledge. Different perspectives."</strong></p>
    
    <h2>1. Be Respectful</h2>
    <p>Treat others with kindness and respect.</p>
    
    <h2>2. Share Real Experiences</h2>
    <p>Share genuine, honest experiences.</p>
    
    <h2>3. Protect Privacy</h2>
    <p>Do not share your own or others' private, sensitive information.</p>
    
    <h2>4. Anonymous Sharing</h2>
    <p>Anonymous posting is a feature, but be aware it doesn't guarantee absolute anonymity from Xperiens.</p>
    
    <h2>5. No Harassment or Bullying</h2>
    <p>Zero tolerance for harassment and bullying.</p>
    
    <h2>6. No Hate or Discrimination</h2>
    <p>No hate speech, discrimination, or promotion of violence.</p>
    
    <h2>7. No Threats or Violence</h2>
    <p>Threats are strictly prohibited.</p>
    
    <h2>8. No Scams or Fraud</h2>
    <p>Do not use Xperiens to scam or defraud users.</p>
    
    <h2>9. No Spam</h2>
    <p>No spam or unsolicited promotions.</p>
    
    <h2>10. Respect Intellectual Property</h2>
    <p>Do not steal or misuse others' content.</p>
    
    <h2>11. Sensitive or Professional Advice</h2>
    <p>Experiences are not professional medical, legal, or financial advice.</p>
    
    <h2>12. Content That May Be Removed</h2>
    <p>Xperiens reserves the right to remove content that violates these guidelines.</p>
    
    <h2>13. Reporting</h2>
    <p>Use our reporting feature to flag content that breaches guidelines.</p>
    
    <h2>14. Enforcement</h2>
    <p>Violations can lead to content removal or account suspension.</p>
    
    <h2>15. Appeals</h2>
    <p>You may appeal moderation decisions via contact.</p>
    
    <h2>16. Our Goal</h2>
    <p>To foster a supportive, community-driven platform for real experiences.</p>
  </LegalPageLayout>
);
