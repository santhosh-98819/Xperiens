import React from 'react';
import { LegalPageLayout } from '../components/LegalPageLayout';

export const TermsAndConditionsView: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <LegalPageLayout title="Terms & Conditions" lastUpdated="August 24, 2026" onBack={onBack}>
    <p>Welcome to <strong>Xperiens</strong>. These Terms & Conditions (“Terms”) govern your access to and use of the Xperiens website and application (the “Service”).</p>
    <p>By creating an account or using Xperiens, you agree to these Terms and our Community Guidelines.</p>

    <h2>1. About Xperiens</h2>
    <p>Xperiens is a platform for sharing real-life experiences, discovering experiences shared by others, and learning from the community.</p>
    <p>Xperiens provides a platform for user-generated content and does not guarantee the accuracy, completeness, or reliability of experiences shared by users.</p>

    <h2>2. Eligibility</h2>
    <p>You must meet the minimum legal age required to use the Service under applicable law.</p>
    <p>By using Xperiens, you confirm that you are legally permitted to use the Service.</p>

    <h2>3. User Accounts</h2>
    <p>You are responsible for:</p>
    <ul>
      <li>Providing accurate information when creating your account.</li>
      <li>Maintaining the security of your account credentials.</li>
      <li>Keeping your account information up to date.</li>
      <li>All activity that occurs through your account.</li>
    </ul>
    <p>You must not impersonate another person or create an account using another person's identity without authorization.</p>

    <h2>4. Sharing Experiences</h2>
    <p>Xperiens allows users to share experiences with the community.</p>
    <p>You are responsible for the content you submit.</p>
    <p>You must ensure that your content:</p>
    <ul>
      <li>Is truthful to the best of your knowledge.</li>
      <li>Does not intentionally mislead other users.</li>
      <li>Does not violate another person's rights.</li>
      <li>Does not contain unnecessary private or confidential information.</li>
      <li>Complies with these Terms and our Community Guidelines.</li>
    </ul>

    <h2>5. Anonymous Posting</h2>
    <p>Xperiens may allow you to share experiences anonymously.</p>
    <p>When you choose anonymous posting, your identity may not be publicly displayed with that experience.</p>
    <p>However, anonymous posting does <strong>not</strong> guarantee complete anonymity from Xperiens.</p>
    <p>Xperiens may retain an internal association between an anonymous experience and the account that submitted it for purposes such as security, moderation, abuse prevention, and legal compliance.</p>

    <h2>6. Prohibited Conduct</h2>
    <p>You must not use Xperiens to:</p>
    <ul>
      <li>Harass, threaten, or bully others.</li>
      <li>Promote hatred or discrimination.</li>
      <li>Encourage violence or illegal activity.</li>
      <li>Commit or promote scams or fraud.</li>
      <li>Spam or misuse the platform.</li>
      <li>Impersonate another person.</li>
      <li>Share another person's private information without authorization.</li>
      <li>Upload illegal or unlawful content.</li>
      <li>Violate intellectual property rights.</li>
      <li>Attempt to gain unauthorized access to accounts or systems.</li>
      <li>Interfere with the operation or security of Xperiens.</li>
      <li>Abuse reporting or moderation systems.</li>
      <li>Use Xperiens for purposes that violate applicable laws.</li>
    </ul>

    <h2>7. User Content</h2>
    <p>You retain ownership of the original content you create and submit to Xperiens.</p>
    <p>By submitting content, you grant Xperiens the limited rights necessary to host, store, display, reproduce, and distribute that content as required to operate and provide the Service.</p>
    <p>This permission does not transfer ownership of your original content to Xperiens.</p>
    <p>You are responsible for ensuring that you have the necessary rights to any content you submit.</p>

    <h2>8. Content Moderation</h2>
    <p>Xperiens may review, restrict, hide, or remove content that we reasonably believe:</p>
    <ul>
      <li>Violates these Terms.</li>
      <li>Violates the Community Guidelines.</li>
      <li>Is illegal or unlawful.</li>
      <li>Harms or threatens users.</li>
      <li>Contains spam, scams, or abusive content.</li>
      <li>Creates security or operational risks.</li>
    </ul>
    <p>We may take action against accounts that repeatedly or seriously violate our rules.</p>

    <h2>9. Reporting</h2>
    <p>Users may report experiences, accounts, or other content that they believe violates these Terms or the Community Guidelines.</p>
    <p>Reports should be made honestly and in good faith.</p>
    <p>Xperiens may review reports and take appropriate action based on the circumstances.</p>

    <h2>10. Intellectual Property</h2>
    <p>Xperiens and its original branding, design, logos, software, and other platform materials may be protected by intellectual property laws.</p>
    <p>You must not copy, modify, distribute, sell, or exploit Xperiens's protected materials without appropriate authorization.</p>
    <p>You are responsible for respecting the intellectual property rights of other users and third parties.</p>

    <h2>11. Third-Party Services</h2>
    <p>Xperiens may use or contain links to third-party services.</p>
    <p>Third-party services operate independently and may have their own terms and privacy policies.</p>
    <p>Xperiens is not responsible for the content, availability, security, or privacy practices of third-party services that it does not control.</p>

    <h2>12. User Responsibility</h2>
    <p>Experiences and other content on Xperiens are created by users.</p>
    <p>User-generated experiences are not automatically professional advice and should not be treated as a substitute for qualified professional advice, including medical, legal, financial, mental-health, or other professional advice where applicable.</p>
    <p>You are responsible for deciding whether information shared by another user is appropriate or reliable for your situation.</p>

    <h2>13. Disclaimer</h2>
    <p>The Service is provided on an <strong>“as is” and “as available”</strong> basis to the extent permitted by applicable law.</p>
    <p>Xperiens does not guarantee that:</p>
    <ul>
      <li>The Service will always be available.</li>
      <li>The Service will always be error-free.</li>
      <li>User-generated content will be accurate or reliable.</li>
      <li>The Service will meet every user's requirements.</li>
    </ul>

    <h2>14. Service Availability</h2>
    <p>We may modify, update, suspend, or discontinue features of Xperiens at any time.</p>
    <p>We may perform maintenance or updates that temporarily affect availability.</p>
    <p>We will make reasonable efforts to maintain the Service, but continuous availability cannot be guaranteed.</p>

    <h2>15. Account Suspension and Termination</h2>
    <p>Xperiens may suspend, restrict, or terminate an account when reasonably necessary, including for:</p>
    <ul>
      <li>Serious violations of these Terms.</li>
      <li>Repeated violations.</li>
      <li>Violations of the Community Guidelines.</li>
      <li>Fraud or abuse.</li>
      <li>Threats to the safety or security of users or the platform.</li>
      <li>Illegal activity.</li>
      <li>Attempts to circumvent platform restrictions.</li>
    </ul>
    <p>Where appropriate, users may have an opportunity to appeal moderation or account actions.</p>

    <h2>16. Limitation of Liability</h2>
    <p>To the maximum extent permitted by applicable law, Xperiens will not be responsible for indirect, incidental, special, consequential, or similar damages arising from your use of or inability to use the Service.</p>
    <p>Nothing in these Terms is intended to exclude or limit liability where such exclusion or limitation is not permitted by applicable law.</p>

    <h2>17. Changes to These Terms</h2>
    <p>We may update these Terms when Xperiens's features, services, policies, or legal requirements change.</p>
    <p>When we update these Terms, we will update the <strong>Last Updated</strong> date.</p>
    <p>If an updated version requires renewed acceptance, you will be required to review and accept the updated Terms before continuing to use protected features of Xperiens.</p>

    <h2>18. Contact</h2>
    <p><strong>Xperiens Team</strong></p>
    <p><strong>Email:</strong> support@xperiens.app</p>
    <p><strong>Website:</strong> https://xperiens.app</p>
  </LegalPageLayout>
);
