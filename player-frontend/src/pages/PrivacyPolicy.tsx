import { StaticContentPage } from '@/components/StaticContentPage';

const PrivacyPolicy = () => (
  <StaticContentPage
    title="Privacy Policy"
    lastUpdated="January 15, 2026"
    sections={[
      {
        title: '1. Information We Collect',
        content: (
          <div className="space-y-3">
            <p>We collect information you provide directly, such as when you create an account, make a purchase, or contact support. This includes your name, email address, date of birth, and payment information.</p>
            <p>We also automatically collect certain information when you use the Platform, including your IP address, browser type, device information, pages visited, and gameplay data.</p>
          </div>
        ),
      },
      {
        title: '2. How We Use Your Information',
        content: (
          <div className="space-y-3">
            <p>We use your information to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide, maintain, and improve the Platform</li>
              <li>Process transactions and send related information</li>
              <li>Verify your identity and prevent fraud</li>
              <li>Comply with legal obligations (KYC/AML requirements)</li>
              <li>Send promotional communications (with your consent)</li>
              <li>Monitor and analyze usage patterns to improve user experience</li>
              <li>Enforce responsible gambling measures</li>
            </ul>
          </div>
        ),
      },
      {
        title: '3. Information Sharing',
        content: (
          <div className="space-y-3">
            <p>We do not sell your personal information. We may share your information with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Service providers who assist in operating the Platform</li>
              <li>Payment processors for transaction handling</li>
              <li>Regulatory authorities as required by law</li>
              <li>Law enforcement when required by legal process</li>
            </ul>
          </div>
        ),
      },
      {
        title: '4. Cookies & Tracking',
        content: (
          <div className="space-y-3">
            <p>We use cookies and similar tracking technologies to enhance your experience. These include essential cookies for Platform functionality, analytics cookies to understand usage, and preference cookies to remember your settings.</p>
            <p>You can manage cookie preferences through your browser settings. Disabling certain cookies may limit Platform functionality.</p>
          </div>
        ),
      },
      {
        title: '5. Data Retention',
        content: (
          <p>We retain your personal information for as long as your account is active or as needed to provide services. We may also retain information as required to comply with legal obligations, resolve disputes, and enforce our agreements. Account data is typically retained for a minimum of 5 years after account closure, as required by gaming regulations.</p>
        ),
      },
      {
        title: '6. Your Rights',
        content: (
          <div className="space-y-3">
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information (subject to legal requirements)</li>
              <li>Object to or restrict certain processing activities</li>
              <li>Data portability - receive your data in a structured format</li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>
            <p>To exercise these rights, contact us at privacy@phibet.io.</p>
          </div>
        ),
      },
      {
        title: '7. Data Security',
        content: (
          <p>We implement industry-standard security measures including encryption (TLS/SSL), secure server infrastructure, regular security audits, and access controls. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>
        ),
      },
      {
        title: '8. Children\'s Privacy',
        content: (
          <p>The Platform is not intended for individuals under 18 years of age. We do not knowingly collect personal information from minors. If we learn that we have collected information from a child under 18, we will take steps to delete that information promptly.</p>
        ),
      },
      {
        title: '9. Contact Us',
        content: (
          <div className="space-y-2">
            <p>For privacy-related inquiries, contact our Data Protection Officer:</p>
            <p>Email: privacy@phibet.io</p>
            <p>We will respond to all legitimate requests within 30 days.</p>
          </div>
        ),
      },
    ]}
  />
);

export default PrivacyPolicy;
