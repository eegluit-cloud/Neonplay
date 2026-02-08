import { StaticContentPage } from '@/components/StaticContentPage';

const TermsOfService = () => (
  <StaticContentPage
    title="Terms of Service"
    lastUpdated="January 15, 2026"
    sections={[
      {
        title: '1. Acceptance of Terms',
        content: (
          <div className="space-y-3">
            <p>By accessing or using the PhiBet.io platform ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree with any part of these Terms, you must not use the Platform.</p>
            <p>These Terms constitute a legally binding agreement between you and PhiBet.io. We reserve the right to modify these Terms at any time, and your continued use of the Platform constitutes acceptance of any changes.</p>
          </div>
        ),
      },
      {
        title: '2. Eligibility',
        content: (
          <div className="space-y-3">
            <p>You must be at least 18 years of age (or the legal gambling age in your jurisdiction, whichever is higher) to use the Platform. By creating an account, you represent and warrant that you meet the minimum age requirement.</p>
            <p>You are responsible for ensuring that your use of the Platform complies with all applicable laws and regulations in your jurisdiction. The Platform is not available in jurisdictions where online gambling is prohibited.</p>
          </div>
        ),
      },
      {
        title: '3. Account Registration',
        content: (
          <div className="space-y-3">
            <p>To access certain features, you must create an account. You agree to provide accurate, current, and complete information during registration and to keep your account information updated.</p>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. Each person may only register one account.</p>
          </div>
        ),
      },
      {
        title: '4. Virtual Currency & Sweepstakes',
        content: (
          <div className="space-y-3">
            <p>PhiBet.io operates using virtual currencies including Gold Coins (for entertainment purposes only) and Sweepstakes Coins (which may be redeemed for prizes where legally permitted).</p>
            <p>Gold Coins have no monetary value and cannot be exchanged for cash or prizes. Sweepstakes Coins are subject to specific redemption rules detailed in our Sweepstakes Rules.</p>
          </div>
        ),
      },
      {
        title: '5. Prohibited Conduct',
        content: (
          <div className="space-y-3">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the Platform for any unlawful purpose or in violation of any applicable laws</li>
              <li>Create multiple accounts or use another person's account</li>
              <li>Use any automated systems, bots, or scripts to interact with the Platform</li>
              <li>Attempt to exploit bugs, glitches, or vulnerabilities in the Platform</li>
              <li>Engage in collusion, fraud, or any form of cheating</li>
              <li>Harass, threaten, or abuse other users</li>
              <li>Use the Platform for money laundering or terrorist financing</li>
            </ul>
          </div>
        ),
      },
      {
        title: '6. Intellectual Property',
        content: (
          <p>All content on the Platform, including but not limited to text, graphics, logos, icons, images, audio clips, software, and the compilation thereof, is the property of PhiBet.io or its content suppliers and is protected by international copyright laws.</p>
        ),
      },
      {
        title: '7. Disclaimer of Warranties',
        content: (
          <p>The Platform is provided "as is" and "as available" without any warranties of any kind, either express or implied. PhiBet.io does not warrant that the Platform will be uninterrupted, error-free, or free of viruses or other harmful components.</p>
        ),
      },
      {
        title: '8. Limitation of Liability',
        content: (
          <p>To the fullest extent permitted by law, PhiBet.io shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Platform, including but not limited to loss of profits, data, or other intangible losses.</p>
        ),
      },
      {
        title: '9. Governing Law',
        content: (
          <p>These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which PhiBet.io is registered, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in that jurisdiction.</p>
        ),
      },
      {
        title: '10. Contact Information',
        content: (
          <div className="space-y-2">
            <p>If you have any questions about these Terms, please contact us:</p>
            <p>Email: support@phibet.io</p>
            <p>Live Chat: Available 24/7 through our platform</p>
          </div>
        ),
      },
    ]}
  />
);

export default TermsOfService;
