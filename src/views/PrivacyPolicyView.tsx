import React from 'react';
import { LegalPageLayout } from '../components/LegalPageLayout';

export const PrivacyPolicyView: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <LegalPageLayout title="Privacy Policy" lastUpdated="August 24, 2026" onBack={onBack}>
    <p>Welcome to Xperiens (“Xperiens,” “we,” “our,” or “us”).</p>
    <p>Xperiens is a platform that allows users to share real-life experiences, discover experiences shared by others, and learn from the community.</p>
    <p>This Privacy Policy explains what information Xperiens collects, how we use it, how it is shared, and the choices available to you when you use the Xperiens website or application (“Service”).</p>
    <p>By using Xperiens, you acknowledge this Privacy Policy.</p>
    
    <h2>1. Information We Collect</h2>
    <p>We collect only the information reasonably necessary to provide and operate Xperiens.</p>
    <h3>1.1 Account Information</h3>
    <p>When you create or use an Xperiens account, we may collect:</p>
    <ul>
      <li>Name or display name</li>
      <li>Email address</li>
      <li>Profile picture</li>
      <li>Authentication information</li>
      <li>Account creation information</li>
    </ul>
    <p>If you use Google Sign-In or another supported authentication method, information associated with that authentication provider may be provided to us as necessary to create and authenticate your Xperiens account.</p>
    <p>We do not collect or store your Google password or other third-party authentication passwords.</p>

    <h3>1.2 Profile Information</h3>
    <p>You may provide information for your Xperiens profile, such as: Display name, Profile picture. Some profile information may be visible to other users depending on the features of Xperiens.</p>

    <h3>1.3 Experiences and Content</h3>
    <p>When you share an experience on Xperiens, we collect and store the information you choose to submit, which may include: Experience title, Experience description, Category, Images or other media you upload, Anonymous-posting preference, Information contained within your submitted experience.</p>
    <p>You are responsible for making sure that the information you share does not unnecessarily contain another person's private or sensitive information.</p>
    
    <h3>1.4 Anonymous Experiences</h3>
    <p>Xperiens may allow you to share an experience anonymously.</p>
    <p>When you choose anonymous posting:</p>
    <ul>
      <li>Your name is not publicly displayed with that experience.</li>
      <li>Your experience may still be stored in association with your Xperiens account internally.</li>
      <li>Xperiens may retain this association for account management, security, moderation, abuse prevention, and legal compliance.</li>
    </ul>
    <p>Anonymous posting does not mean that the experience is completely anonymous to Xperiens.</p>

    <h3>1.5 Legal Acceptance Information</h3>
    <p>When you create an account or accept an updated version of our legal documents, we may store: Terms & Conditions acceptance, Community Guidelines acceptance, Privacy Policy acknowledgment, Document versions, Date and time of acceptance.</p>

    <h3>1.6 Information We Do Not Intentionally Collect</h3>
    <p>Xperiens does not intentionally collect IP addresses for its own purposes. We do not intentionally request or collect government IDs, financial info, passwords, or precise location.</p>

    <h2>2. How We Use Your Information</h2>
    <p>We use the information described above only as reasonably necessary to operate and improve Xperiens.</p>
    <p>We do not sell your personal information.</p>
    
    <h2>3. Public Content</h2>
    <p>Information you intentionally publish publicly may be viewed by other users.</p>

    <h2>4. Profile Pictures</h2>
    <p>Profile pictures may be displayed in areas of Xperiens where your profile is represented. For anonymous experiences, use the application's anonymous representation rather than publicly identifying the user.</p>

    <h2>5. Third-Party Service Providers</h2>
    <p>Xperiens may use trusted third-party service providers for essential services such as authentication, data storage, hosting, security, and application infrastructure. Xperiens does not sell personal information to third parties.</p>
    
    <h2>6. Cookies and Local Storage</h2>
    <p>Xperiens may use cookies, local storage, or session storage when necessary for application functionality, authentication, security, or remembering application state.</p>
    
    <h2>7. Sharing Information</h2>
    <p>We do not sell personal information. Information may be shared or processed when reasonably necessary to provide the Service, operate required service providers, prevent fraud or abuse, protect users, investigate security issues, enforce Terms & Conditions, enforce Community Guidelines, or comply with applicable law.</p>
    
    <h2>8. Data Security</h2>
    <p>We take reasonable measures to protect information used by Xperiens against unauthorized access, misuse, alteration, or loss.</p>
    
    <h2>9. Data Retention</h2>
    <p>We retain information for as long as reasonably necessary to maintain accounts, provide the Service, maintain security, prevent abuse, resolve disputes, enforce policies, and comply with legal obligations.</p>
    
    <h2>10. Account Deletion</h2>
    <p>Users may request deletion of their Xperiens account. We will take reasonable steps to delete or anonymize associated personal information, subject to information that may need to be retained for security, fraud prevention, legal compliance, dispute resolution, policy enforcement, or other legitimate purposes.</p>
    
    <h2>11. Children's Privacy</h2>
    <p>Xperiens is not intended for children below the minimum age required under applicable law. We do not knowingly collect personal information from children in violation of applicable law.</p>

    <h2>12. Third-Party Links</h2>
    <p>Xperiens may contain links to third-party websites or services. We are not responsible for third-party privacy practices.</p>

    <h2>13. Privacy Rights</h2>
    <p>Depending on applicable law and location, users may have rights such as access, correction, deletion, information about processing, restriction or objection, and data portability.</p>
    
    <h2>14. Changes to Privacy Policy</h2>
    <p>We may update this Privacy Policy when our features or data practices change. The Last Updated date will be changed when an update occurs. If an update requires renewed acknowledgment, users will be asked to acknowledge the updated Privacy Policy before continuing.</p>

    <h2>15. Contact</h2>
    <p>Xperiens Team</p>
    <p>Email: support@xperiens.app</p>
    <p>Website: https://xperiens.app</p>
  </LegalPageLayout>
);
