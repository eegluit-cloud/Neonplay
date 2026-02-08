import { StaticContentPage } from '@/components/StaticContentPage';

const FAQ = () => (
  <StaticContentPage
    title="FAQ & Help Center"
    sections={[
      {
        title: 'Account & Registration',
        content: (
          <div className="space-y-4">
            <div>
              <p className="font-medium text-foreground mb-1">How do I create an account?</p>
              <p>Click the "Sign Up" button on the homepage. Enter your email address, choose a username, and create a password. You'll need to verify your email to complete registration.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">I forgot my password. How do I reset it?</p>
              <p>Click "Forgot Password" on the login screen. Enter your registered email address and we'll send you a password reset link. The link expires after 24 hours.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">How do I verify my account?</p>
              <p>Go to your Profile settings and complete the verification process. You may need to provide a government-issued ID and proof of address. Verification typically takes 24-48 hours.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Can I change my username?</p>
              <p>Usernames can be changed once every 30 days through your account settings. Go to Profile &gt; Account Settings to make changes.</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Deposits & Withdrawals',
        content: (
          <div className="space-y-4">
            <div>
              <p className="font-medium text-foreground mb-1">What payment methods do you accept?</p>
              <p>We accept major credit/debit cards (Visa, Mastercard), bank transfers, and various cryptocurrencies including Bitcoin, Ethereum, and USDT. Available methods may vary by region.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">What are the minimum and maximum deposit amounts?</p>
              <p>Minimum deposit is $10 (or equivalent). Maximum deposit limits depend on your account verification level and payment method. VIP members enjoy higher limits.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">How long do withdrawals take?</p>
              <p>Withdrawal processing times: Crypto - within 1 hour; E-wallets - 24 hours; Bank transfer - 3-5 business days; Cards - 3-5 business days. All withdrawals are subject to security review.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Are there withdrawal fees?</p>
              <p>PhiBet.io does not charge withdrawal fees. However, your payment provider or bank may apply their own fees for certain transaction types.</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Games & Gameplay',
        content: (
          <div className="space-y-4">
            <div>
              <p className="font-medium text-foreground mb-1">Are the games fair?</p>
              <p>Yes. All our games use certified Random Number Generators (RNG) and are regularly audited by independent testing agencies. Visit our Provably Fair page for more details on our verification system.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">What types of games are available?</p>
              <p>We offer slots, live casino (blackjack, roulette, baccarat), table games, crash games, game shows, and sports betting. New games are added regularly from top providers.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Can I play on mobile?</p>
              <p>Yes! PhiBet.io is fully optimized for mobile browsers on both iOS and Android. No app download is required - simply visit our website from your mobile browser.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">What is RTP?</p>
              <p>RTP (Return to Player) is the theoretical percentage of wagered money a game will pay back to players over time. For example, a 96% RTP means the game returns $96 for every $100 wagered on average.</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Bonuses & Promotions',
        content: (
          <div className="space-y-4">
            <div>
              <p className="font-medium text-foreground mb-1">How do I claim a bonus?</p>
              <p>Available bonuses appear on the Promotions page. Click "Claim" on any eligible promotion. Some bonuses are automatically applied, while others may require a promo code or minimum deposit.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">What are wagering requirements?</p>
              <p>Wagering requirements specify how many times you need to wager a bonus amount before you can withdraw winnings. For example, a 30x requirement on a $10 bonus means you need to wager $300 total.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">How does the VIP program work?</p>
              <p>Earn XP points through gameplay to progress through VIP tiers: Bronze, Silver, Gold, Platinum, and Diamond. Each tier unlocks better rewards, higher limits, cashback rates, and exclusive promotions.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">How does the referral program work?</p>
              <p>Share your unique referral link with friends. When they sign up and make their first deposit, both you and your friend receive bonus rewards. Visit the Refer a Friend page for current rewards.</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Technical Issues',
        content: (
          <div className="space-y-4">
            <div>
              <p className="font-medium text-foreground mb-1">A game froze or disconnected. What happens to my bet?</p>
              <p>If a game is interrupted due to a technical issue, the game state is saved server-side. When you reconnect, the game will resume from where it left off. If the round cannot be completed, your bet will be refunded.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">The website is loading slowly. What can I do?</p>
              <p>Try clearing your browser cache, disabling browser extensions, or switching to a different browser. Ensure you have a stable internet connection. If issues persist, contact our support team.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Which browsers are supported?</p>
              <p>We support the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, we recommend keeping your browser updated to the latest version.</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Responsible Gaming',
        content: (
          <div className="space-y-4">
            <div>
              <p className="font-medium text-foreground mb-1">How do I set deposit limits?</p>
              <p>Go to Profile &gt; Account Settings &gt; Responsible Gaming. You can set daily, weekly, and monthly deposit limits. Decreases take effect immediately; increases have a 24-hour cooling period.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">How do I self-exclude?</p>
              <p>Visit Profile &gt; Account Settings &gt; Responsible Gaming and select "Self-Exclusion." Choose your exclusion period. This action cannot be reversed during the chosen period.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Where can I get help for problem gambling?</p>
              <p>Visit our Responsible Gambling page for a list of support organizations. You can also contact our support team 24/7 for assistance with responsible gambling tools.</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Contact Support',
        content: (
          <div className="space-y-3">
            <p>Our support team is available 24/7 to assist you:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Live Chat:</strong> Click the support button on any page for instant help</li>
              <li><strong>Email:</strong> support@phibet.io (response within 24 hours)</li>
              <li><strong>Telegram:</strong> @PhibetSupport</li>
            </ul>
          </div>
        ),
      },
    ]}
  />
);

export default FAQ;
