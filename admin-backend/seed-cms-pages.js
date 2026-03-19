// Run with: node seed-cms-pages.js (inside admin-backend container)
const prisma = require('./lib/prisma');

const SHARED_CSS = `
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,Helvetica,sans-serif;background:#f5f7fa;color:#333;line-height:1.7}
.container{max-width:1100px;margin:0 auto;padding:40px 20px}
.card{background:#fff;padding:40px;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.08)}
h1{font-size:2rem;font-weight:700;margin-bottom:8px;color:#111}
.subtitle{color:#777;font-size:.9rem;margin-bottom:32px;border-bottom:1px solid #eee;padding-bottom:16px}
h2{font-size:1.2rem;font-weight:700;margin:28px 0 10px;color:#222}
h3{font-size:1rem;font-weight:700;margin:20px 0 8px;color:#333}
p{margin-bottom:12px;color:#444}
ul,ol{padding-left:20px;margin-bottom:12px}
li{margin-bottom:6px;color:#444}
a{color:#5c6bc0;text-decoration:none}
a:hover{text-decoration:underline}
.toc{background:#f0f4ff;border-left:4px solid #5c6bc0;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px}
.toc strong{display:block;margin-bottom:8px;color:#333}
.toc a{display:block;color:#5c6bc0;margin-bottom:4px;font-size:.9rem}
.badge{display:inline-block;background:#e8f5e9;color:#2e7d32;padding:2px 10px;border-radius:999px;font-size:.75rem;font-weight:700;margin-bottom:16px}
.warn-box{background:#fff8e1;border-left:4px solid #ffc107;padding:14px 18px;border-radius:0 8px 8px 0;margin:16px 0}
.info-box{background:#e3f2fd;border-left:4px solid #2196f3;padding:14px 18px;border-radius:0 8px 8px 0;margin:16px 0}
.faq-item{border:1px solid #e5e7eb;border-radius:8px;margin-bottom:12px;overflow:hidden}
.faq-q{background:#f9fafb;padding:14px 18px;font-weight:600;color:#222;font-size:.95rem}
.faq-a{padding:14px 18px;color:#444;font-size:.9rem}
table{width:100%;border-collapse:collapse;margin:16px 0}
th{background:#f3f4f6;padding:10px 14px;text-align:left;font-size:.85rem;font-weight:700;border:1px solid #e5e7eb}
td{padding:10px 14px;border:1px solid #e5e7eb;font-size:.85rem}
@media(max-width:768px){.container{padding:20px 14px}.card{padding:24px 18px}h1{font-size:1.5rem}}
</style>`;

const pages = [
  {
    slug: 'help-center',
    title: 'Help Center',
    metaTitle: 'Help Center | PhiBet',
    metaDescription: 'Get help with your PhiBet account, deposits, withdrawals, games, and more.',
    content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">${SHARED_CSS}</head><body>
<div class="container"><div class="card">
<div class="badge">Support</div>
<h1>Help Center</h1>
<p class="subtitle">Find answers to the most common questions about PhiBet.</p>

<div class="toc">
<strong>Quick Navigation</strong>
<a href="#account">Account & Registration</a>
<a href="#deposits">Deposits & Withdrawals</a>
<a href="#games">Games & Gameplay</a>
<a href="#bonuses">Bonuses & Promotions</a>
<a href="#security">Security & Privacy</a>
<a href="#contact">Contact Support</a>
</div>

<h2 id="account">Account & Registration</h2>
<h3>How do I create an account?</h3>
<p>Click the <strong>Register</strong> button on the homepage and fill in your details. You must be 18 years or older to register. Verify your email to activate your account.</p>
<h3>I forgot my password</h3>
<p>Click <strong>Forgot Password</strong> on the login page. Enter your registered email and we'll send a reset link within a few minutes.</p>
<h3>How do I verify my account (KYC)?</h3>
<p>Go to <strong>Profile → Verification</strong>. Upload a government-issued photo ID and a proof of address document. Verification is typically completed within 24–48 hours.</p>

<h2 id="deposits">Deposits & Withdrawals</h2>
<h3>What payment methods are accepted?</h3>
<p>We accept credit/debit cards (Visa, Mastercard), bank transfers, and major cryptocurrencies (BTC, ETH, USDC, USDT, SOL, DOGE).</p>
<h3>How long do withdrawals take?</h3>
<table>
<tr><th>Method</th><th>Processing Time</th></tr>
<tr><td>Cryptocurrency</td><td>1–2 hours</td></tr>
<tr><td>Bank Transfer</td><td>3–5 business days</td></tr>
<tr><td>Card</td><td>2–3 business days</td></tr>
</table>
<h3>Is there a minimum deposit?</h3>
<p>The minimum deposit is $10. There is no maximum deposit limit, though large deposits may require additional verification.</p>

<h2 id="games">Games & Gameplay</h2>
<h3>Are the games fair?</h3>
<p>Yes. All games use a certified Random Number Generator (RNG). Slots and live casino games are independently audited. See our <a href="/provably-fair">Provably Fair</a> page for technical details.</p>
<h3>What happens if a game disconnects?</h3>
<p>In the rare event of a disconnection, the game state is preserved. When you reconnect, the round will resume or be settled automatically. Contact support if any issues persist.</p>

<h2 id="bonuses">Bonuses & Promotions</h2>
<h3>How do I claim a bonus?</h3>
<p>Visit the <strong>Promotions</strong> page and click <strong>Claim</strong> on any eligible offer. Some bonuses require a promo code entered at deposit.</p>
<h3>What are wagering requirements?</h3>
<p>Wagering requirements define how many times you must wager the bonus amount before withdrawing. For example, a $50 bonus with 30x wagering = $1,500 in total wagers required.</p>

<h2 id="security">Security & Privacy</h2>
<h3>Is my personal data safe?</h3>
<p>We use industry-standard 256-bit SSL encryption for all data transmission. Your personal information is never sold to third parties. Read our <a href="/privacy">Privacy Policy</a> for full details.</p>
<h3>How do I enable Two-Factor Authentication?</h3>
<p>Go to <strong>Profile → Security → Two-Factor Authentication</strong> and follow the setup instructions using your preferred authenticator app.</p>

<h2 id="contact">Contact Support</h2>
<div class="info-box">
<p><strong>24/7 Live Chat</strong> — Available through the chat icon in the bottom right of any page.</p>
<p><strong>Email:</strong> support@phibet.io — Response within 24 hours.</p>
</div>
</div></div></body></html>`,
  },
  {
    slug: 'important-announcement',
    title: 'Important Announcements',
    metaTitle: 'Important Announcements | PhiBet',
    metaDescription: 'Stay up to date with the latest platform updates, maintenance schedules, and important notices from PhiBet.',
    content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">${SHARED_CSS}</head><body>
<div class="container"><div class="card">
<div class="badge">Latest Updates</div>
<h1>Important Announcements</h1>
<p class="subtitle">Stay informed about platform updates, scheduled maintenance, and key notices.</p>

<div class="warn-box">
<strong>Scheduled Maintenance Notice</strong>
<p style="margin-top:6px">Our platform will undergo routine maintenance on <strong>March 20, 2026 from 02:00–04:00 UTC</strong>. During this time, the platform will be temporarily unavailable. We apologise for any inconvenience.</p>
</div>

<h2>March 2026 — Platform Updates</h2>
<h3>New Game Providers Added</h3>
<p>We have partnered with three new game providers, adding over 200 new slot titles and 15 live casino tables. Explore the full catalog in the <strong>Casino</strong> section.</p>

<h3>Improved Withdrawal Processing</h3>
<p>Cryptocurrency withdrawals now process within 1 hour (down from 2–4 hours). Bank transfer processing has also been optimized.</p>

<h3>VIP Program Enhancements</h3>
<p>Our VIP loyalty program has been updated with enhanced cashback rates, dedicated account managers for Platinum and above, and new exclusive tournaments.</p>

<h2>February 2026</h2>
<h3>KYC Process Streamlined</h3>
<p>Identity verification is now faster. Most documents are reviewed within 2 hours during business hours. Supported document types have been expanded to include national identity cards from 40 additional countries.</p>

<h3>Sports Betting Expansion</h3>
<p>Live in-play betting is now available for all major sports including cricket, kabaddi, and e-sports. Pre-match markets now cover 60+ sports.</p>

<h2>Responsible Gaming Reminder</h2>
<div class="warn-box">
<p>PhiBet is committed to responsible gaming. If you need help managing your gameplay, visit our <a href="/responsible-gambling">Responsible Gambling</a> page or contact our support team at any time.</p>
</div>

<h2>Contact Us</h2>
<p>For questions about any announcement, contact us at <a href="mailto:support@phibet.io">support@phibet.io</a> or via live chat.</p>
</div></div></body></html>`,
  },
  {
    slug: 'responsible-gambling',
    title: 'Responsible Gambling',
    metaTitle: 'Responsible Gambling | PhiBet',
    metaDescription: 'PhiBet is committed to responsible gambling. Learn about our tools, limits, and resources for safe play.',
    content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">${SHARED_CSS}</head><body>
<div class="container"><div class="card">
<div class="badge">Player Safety</div>
<h1>Responsible Gambling</h1>
<p class="subtitle">We are committed to ensuring gambling remains fun, safe, and under your control.</p>

<div class="warn-box">
<strong>Need immediate help?</strong>
<p style="margin-top:6px">If you feel gambling is affecting your well-being, please contact the <strong>National Gambling Helpline</strong> or use our self-exclusion tool immediately.</p>
</div>

<div class="toc">
<strong>Contents</strong>
<a href="#tools">Our Responsible Gambling Tools</a>
<a href="#signs">Signs of Problem Gambling</a>
<a href="#self-assessment">Self-Assessment</a>
<a href="#support">External Support Resources</a>
<a href="#selfexclusion">Self-Exclusion</a>
</div>

<h2 id="tools">Our Responsible Gambling Tools</h2>
<p>We provide a range of tools to help you stay in control of your gambling:</p>
<ul>
<li><strong>Deposit Limits</strong> — Set daily, weekly, or monthly deposit limits from your account settings.</li>
<li><strong>Loss Limits</strong> — Restrict the amount you can lose over a set period.</li>
<li><strong>Session Time Limits</strong> — Set a maximum session duration; you will be automatically logged out.</li>
<li><strong>Reality Checks</strong> — Receive periodic reminders of how long you have been playing.</li>
<li><strong>Cool-Off Period</strong> — Take a break from gambling for 24 hours, 7 days, or 30 days.</li>
<li><strong>Self-Exclusion</strong> — Permanently or temporarily block yourself from the platform.</li>
</ul>
<p>These tools are available under <strong>Profile → Responsible Gambling</strong>.</p>

<h2 id="signs">Signs of Problem Gambling</h2>
<p>Gambling should be entertainment. Consider seeking help if you:</p>
<ul>
<li>Gamble with money needed for essential expenses (rent, food, bills)</li>
<li>Chase losses or feel compelled to win back what you lost</li>
<li>Lie to friends or family about your gambling activities</li>
<li>Feel anxious, irritable, or restless when not gambling</li>
<li>Neglect work, study, or personal relationships due to gambling</li>
<li>Have tried and failed to reduce or stop gambling</li>
</ul>

<h2 id="self-assessment">Quick Self-Assessment</h2>
<p>Answer honestly — do any of these apply to you?</p>
<ul>
<li>Do you spend more time or money gambling than you intended?</li>
<li>Have you borrowed money to gamble?</li>
<li>Has gambling caused problems at home or at work?</li>
<li>Do you feel the need to gamble with increasing amounts to get the same excitement?</li>
</ul>
<p>If you answered <strong>yes</strong> to any of the above, we strongly encourage you to use our self-exclusion tools or reach out for support.</p>

<h2 id="support">External Support Resources</h2>
<table>
<tr><th>Organisation</th><th>Contact</th><th>Available</th></tr>
<tr><td>GamCare</td><td>0808 8020 133</td><td>24/7</td></tr>
<tr><td>Gamblers Anonymous</td><td>ga.org</td><td>24/7</td></tr>
<tr><td>BeGambleAware</td><td>begambleaware.org</td><td>24/7</td></tr>
<tr><td>Gambling Therapy</td><td>gamblingtherapy.org</td><td>24/7</td></tr>
</table>

<h2 id="selfexclusion">Self-Exclusion</h2>
<p>To permanently or temporarily exclude yourself from the platform, go to <strong>Profile → Responsible Gambling → Self-Exclusion</strong>, or contact our support team directly. Self-exclusion takes effect immediately and cannot be reversed during the exclusion period.</p>
<div class="info-box">
<p><strong>We take underage gambling seriously.</strong> Users must be 18 years or older. If you suspect a minor is using the platform, please contact us immediately at <a href="mailto:support@phibet.io">support@phibet.io</a>.</p>
</div>
</div></div></body></html>`,
  },
  {
    slug: 'gamble-aware',
    title: 'Gamble Aware',
    metaTitle: 'Gamble Aware | PhiBet',
    metaDescription: 'Information and resources to help you gamble safely and responsibly at PhiBet.',
    content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">${SHARED_CSS}</head><body>
<div class="container"><div class="card">
<div class="badge">Gamble Aware</div>
<h1>Gamble Aware</h1>
<p class="subtitle">Gambling is entertainment. Keep it that way with these tips and resources.</p>

<h2>Know Your Limits</h2>
<p>Before you start playing, decide on a budget and a time limit. Stick to them regardless of whether you are winning or losing. Gambling should never be seen as a way to make money or solve financial problems.</p>

<h2>Tips for Staying in Control</h2>
<ul>
<li>Only gamble with money you can afford to lose</li>
<li>Treat gambling as entertainment, not income</li>
<li>Never gamble when you are stressed, depressed, or under the influence of alcohol</li>
<li>Take regular breaks during your sessions</li>
<li>Balance gambling with other leisure activities</li>
<li>Do not chase losses — if you have lost your budget, stop</li>
</ul>

<h2>Understanding the Odds</h2>
<p>All casino games are designed with a house edge, meaning that over time the house has a statistical advantage. Understanding this helps set realistic expectations:</p>
<table>
<tr><th>Game Type</th><th>Typical House Edge</th></tr>
<tr><td>Slots</td><td>2%–15%</td></tr>
<tr><td>Blackjack (optimal strategy)</td><td>0.5%–1%</td></tr>
<tr><td>European Roulette</td><td>2.7%</td></tr>
<tr><td>Baccarat</td><td>1.06%–1.24%</td></tr>
<tr><td>Video Poker</td><td>0.5%–5%</td></tr>
</table>

<h2>What Is Problem Gambling?</h2>
<p>Problem gambling occurs when gambling causes harm to the individual, their family, or their community. It is characterised by a persistent inability to control gambling behaviour despite negative consequences.</p>
<p>Problem gambling is treatable. With the right support, many people recover fully. If you think you have a problem, please reach out to <a href="https://www.begambleaware.org" target="_blank">BeGambleAware.org</a> or call the National Gambling Helpline: <strong>0808 8020 133</strong> (free, 24/7).</p>

<h2>Our Commitment</h2>
<p>PhiBet partners with GamCare and BeGambleAware to promote responsible gambling. We provide free tools including deposit limits, self-exclusion, and reality checks. All our staff receive responsible gambling training.</p>

<div class="info-box">
<p>For more information on our responsible gambling tools, visit our <a href="/page/responsible-gambling">Responsible Gambling</a> page or contact support at any time.</p>
</div>
</div></div></body></html>`,
  },
  {
    slug: 'fairness',
    title: 'Fairness & Provably Fair',
    metaTitle: 'Fairness & Provably Fair | PhiBet',
    metaDescription: 'Learn how PhiBet ensures fair gameplay through certified RNG and provably fair technology.',
    content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">${SHARED_CSS}</head><body>
<div class="container"><div class="card">
<div class="badge">Certified Fair</div>
<h1>Fairness &amp; Provably Fair</h1>
<p class="subtitle">We are committed to complete transparency and certified fair gaming outcomes.</p>

<div class="toc">
<strong>Contents</strong>
<a href="#rng">Random Number Generator (RNG)</a>
<a href="#provably-fair">Provably Fair Technology</a>
<a href="#verify">How to Verify a Game Result</a>
<a href="#audits">Independent Audits</a>
<a href="#rtp">Return to Player (RTP)</a>
</div>

<h2 id="rng">Random Number Generator (RNG)</h2>
<p>All slot games, table games, and virtual games on PhiBet use a certified cryptographic Random Number Generator (RNG). This ensures that every card dealt, dice roll, spin, and game outcome is completely random and cannot be predicted or manipulated.</p>
<p>Our RNG is certified by <strong>eCOGRA</strong> and <strong>iTech Labs</strong>, two of the world's most respected independent testing laboratories for online gaming software.</p>

<h2 id="provably-fair">Provably Fair Technology</h2>
<p>For crash games and certain original games, PhiBet uses <strong>Provably Fair</strong> cryptographic technology. This allows you to independently verify that neither the casino nor any third party altered the outcome of your game after your bet was placed.</p>
<h3>How It Works</h3>
<ol>
<li><strong>Server Seed</strong> — Before each game, our server generates a random seed and sends you a hashed version (SHA-256) so you can see it, but not predict the outcome.</li>
<li><strong>Client Seed</strong> — Your browser generates its own random seed, which is combined with the server seed to produce the game outcome.</li>
<li><strong>Reveal</strong> — After the game, the original server seed is revealed. You can verify that the hash matches and that the outcome was determined fairly.</li>
</ol>

<h2 id="verify">How to Verify a Game Result</h2>
<p>To verify any completed game round:</p>
<ol>
<li>Go to <strong>Profile → Game History</strong></li>
<li>Select a completed game round and click <strong>Verify</strong></li>
<li>Copy the Server Seed, Client Seed, and Nonce values</li>
<li>Use any SHA-256 online tool or our built-in verifier to confirm the outcome</li>
</ol>
<div class="info-box">
<p>You can also change your Client Seed at any time from your profile settings without affecting your gameplay experience.</p>
</div>

<h2 id="audits">Independent Audits</h2>
<p>PhiBet's games and platform are regularly audited by independent organisations:</p>
<table>
<tr><th>Auditor</th><th>Scope</th><th>Frequency</th></tr>
<tr><td>eCOGRA</td><td>RNG, payout rates, game fairness</td><td>Quarterly</td></tr>
<tr><td>iTech Labs</td><td>Software compliance, RNG certification</td><td>Annually</td></tr>
<tr><td>BMM Testlabs</td><td>Technical compliance</td><td>As required</td></tr>
</table>

<h2 id="rtp">Return to Player (RTP)</h2>
<p>Return to Player (RTP) is the theoretical percentage of all wagered money that a game will pay back to players over time. For example, a slot with 96% RTP will return $96 for every $100 wagered on average.</p>
<p>The RTP percentage for each game is displayed on the game's information page. Our overall platform RTP is audited and published quarterly.</p>

<div class="warn-box">
<p>RTP is calculated over millions of game rounds. Individual session results will vary significantly. Always gamble responsibly.</p>
</div>
</div></div></body></html>`,
  },
  {
    slug: 'faq',
    title: 'Frequently Asked Questions',
    metaTitle: 'FAQ | PhiBet',
    metaDescription: 'Find answers to the most frequently asked questions about PhiBet — accounts, payments, games, and more.',
    content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">${SHARED_CSS}</head><body>
<div class="container"><div class="card">
<div class="badge">FAQ</div>
<h1>Frequently Asked Questions</h1>
<p class="subtitle">Quick answers to the questions we hear most often.</p>

<div class="toc">
<strong>Categories</strong>
<a href="#general">General</a>
<a href="#account">Account</a>
<a href="#payments">Payments</a>
<a href="#games">Games</a>
<a href="#bonuses">Bonuses</a>
<a href="#tech">Technical</a>
</div>

<h2 id="general">General</h2>
<div class="faq-item"><div class="faq-q">Is PhiBet legal?</div><div class="faq-a">PhiBet operates under a valid gaming licence. You are responsible for ensuring online gambling is legal in your jurisdiction before registering.</div></div>
<div class="faq-item"><div class="faq-q">How old do I need to be to play?</div><div class="faq-a">You must be at least 18 years old (or the legal gambling age in your jurisdiction if higher) to create an account and play.</div></div>
<div class="faq-item"><div class="faq-q">Is PhiBet available in my country?</div><div class="faq-a">PhiBet is available in most countries. However, it is restricted in certain jurisdictions including the USA, UK, France, and others where online gambling is prohibited. During registration you will be notified if your country is restricted.</div></div>

<h2 id="account">Account</h2>
<div class="faq-item"><div class="faq-q">How do I verify my account?</div><div class="faq-a">Go to Profile → Verification and upload a government-issued ID and proof of address. Verification is usually completed within 24–48 hours.</div></div>
<div class="faq-item"><div class="faq-q">Can I have more than one account?</div><div class="faq-a">No. Each player is permitted one account only. Multiple accounts will result in permanent suspension and forfeiture of balances.</div></div>
<div class="faq-item"><div class="faq-q">How do I change my email or personal details?</div><div class="faq-a">Contact support at support@phibet.io with your request and proof of identity. Some changes require re-verification.</div></div>
<div class="faq-item"><div class="faq-q">How do I close my account?</div><div class="faq-a">Contact support with your closure request. Ensure you withdraw any remaining balance first. Account closure is typically processed within 5 business days.</div></div>

<h2 id="payments">Payments</h2>
<div class="faq-item"><div class="faq-q">What currencies are supported?</div><div class="faq-a">We support USD, EUR, GBP, CAD, AUD, PHP, INR, THB, CNY, JPY, and major cryptocurrencies (BTC, ETH, USDC, USDT, SOL, DOGE).</div></div>
<div class="faq-item"><div class="faq-q">What is the minimum withdrawal?</div><div class="faq-a">The minimum withdrawal is $20 for fiat and equivalent in crypto. There are no fees on withdrawals under $1,000.</div></div>
<div class="faq-item"><div class="faq-q">Why is my withdrawal pending?</div><div class="faq-a">Withdrawals may be held for identity verification, pending wagering requirements, or standard security checks. If your withdrawal has been pending for over 5 business days, contact support.</div></div>
<div class="faq-item"><div class="faq-q">Is there a deposit fee?</div><div class="faq-a">PhiBet does not charge deposit fees. However, your bank or crypto network may charge transaction fees.</div></div>

<h2 id="games">Games</h2>
<div class="faq-item"><div class="faq-q">Are the games rigged?</div><div class="faq-a">No. All games use certified RNG technology and are independently audited. See our <a href="/page/fairness">Fairness</a> page for full details.</div></div>
<div class="faq-item"><div class="faq-q">Can I play for free?</div><div class="faq-a">Many slots and table games offer a demo mode. Log in and look for the "Demo" or "Try for Free" button on the game tile.</div></div>
<div class="faq-item"><div class="faq-q">What happens if the internet disconnects during a game?</div><div class="faq-a">The game state is preserved. When you reconnect, rounds in progress will be resolved automatically. Contact support if funds were deducted but no result was recorded.</div></div>

<h2 id="bonuses">Bonuses</h2>
<div class="faq-item"><div class="faq-q">How do wagering requirements work?</div><div class="faq-a">If you receive a $100 bonus with 30x wagering requirements, you must wager a total of $3,000 before you can withdraw bonus-derived winnings.</div></div>
<div class="faq-item"><div class="faq-q">Can I withdraw my bonus?</div><div class="faq-a">Bonus funds cannot be withdrawn until wagering requirements are fully met. Any remaining bonus balance that does not meet requirements at expiry will be forfeited.</div></div>
<div class="faq-item"><div class="faq-q">Do bonuses expire?</div><div class="faq-a">Yes. Most bonuses expire 30 days after being credited. The exact expiry for each bonus is shown in the Promotions page.</div></div>

<h2 id="tech">Technical</h2>
<div class="faq-item"><div class="faq-q">Which browsers are supported?</div><div class="faq-a">PhiBet works on Chrome, Firefox, Safari, and Edge (latest versions). We recommend keeping your browser updated for the best experience.</div></div>
<div class="faq-item"><div class="faq-q">Is there a mobile app?</div><div class="faq-a">Our platform is fully optimised for mobile browsers. A dedicated mobile app is in development and will be available soon.</div></div>
<div class="faq-item"><div class="faq-q">I found a bug. How do I report it?</div><div class="faq-a">Please email bugs@phibet.io with a description of the issue, your device/browser, and any screenshots. We appreciate your help keeping the platform secure.</div></div>

<p style="margin-top:28px;color:#777;font-size:.85rem">Still have a question? <a href="mailto:support@phibet.io">Contact our support team</a> — available 24/7.</p>
</div></div></body></html>`,
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    metaTitle: 'Privacy Policy | PhiBet',
    metaDescription: 'Read the PhiBet Privacy Policy to understand how we collect, use, and protect your personal data.',
    content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">${SHARED_CSS}</head><body>
<div class="container"><div class="card">
<div class="badge">Legal</div>
<h1>Privacy Policy</h1>
<p class="subtitle">Last Updated: March 10, 2026 — This policy describes how PhiBet.io collects, uses, and protects your personal information.</p>

<div class="toc">
<strong>Contents</strong>
<a href="#collect">1. Information We Collect</a>
<a href="#use">2. How We Use Your Information</a>
<a href="#sharing">3. Information Sharing</a>
<a href="#cookies">4. Cookies &amp; Tracking</a>
<a href="#retention">5. Data Retention</a>
<a href="#rights">6. Your Rights</a>
<a href="#security">7. Data Security</a>
<a href="#children">8. Children's Privacy</a>
<a href="#changes">9. Changes to This Policy</a>
<a href="#contact">10. Contact Us</a>
</div>

<h2 id="collect">1. Information We Collect</h2>
<h3>Information You Provide</h3>
<ul>
<li>Account registration data (name, email, date of birth, address)</li>
<li>Identity verification documents (ID, passport, proof of address)</li>
<li>Payment information (processed securely by our payment providers)</li>
<li>Communications with our support team</li>
</ul>
<h3>Information Collected Automatically</h3>
<ul>
<li>IP address, device type, browser type and version</li>
<li>Pages visited, time spent, clicks, and navigation patterns</li>
<li>Game session data, bet history, and gameplay statistics</li>
<li>Login timestamps and geographic location</li>
</ul>

<h2 id="use">2. How We Use Your Information</h2>
<ul>
<li>Operate and maintain your account and deliver our services</li>
<li>Process transactions and prevent fraud</li>
<li>Verify your identity and comply with KYC/AML regulations</li>
<li>Provide customer support</li>
<li>Send promotional communications (with your consent)</li>
<li>Enforce responsible gambling limits and self-exclusion requests</li>
<li>Improve our platform through analytics</li>
<li>Comply with applicable laws and regulatory obligations</li>
</ul>

<h2 id="sharing">3. Information Sharing</h2>
<p>We do not sell your personal data. We may share information with:</p>
<ul>
<li><strong>Payment processors</strong> — to facilitate deposits and withdrawals</li>
<li><strong>Identity verification providers</strong> — for KYC compliance</li>
<li><strong>Analytics providers</strong> — to improve platform performance (data is anonymised)</li>
<li><strong>Regulatory authorities</strong> — as required by law</li>
<li><strong>Law enforcement</strong> — when required by legal process</li>
</ul>
<p>All third-party providers are contractually bound to protect your data and use it only for the specified purpose.</p>

<h2 id="cookies">4. Cookies &amp; Tracking</h2>
<p>We use the following types of cookies:</p>
<table>
<tr><th>Type</th><th>Purpose</th><th>Duration</th></tr>
<tr><td>Essential</td><td>Authentication, security, session management</td><td>Session</td></tr>
<tr><td>Analytics</td><td>Understanding usage patterns (anonymised)</td><td>Up to 2 years</td></tr>
<tr><td>Preference</td><td>Remembering language, currency, and display settings</td><td>1 year</td></tr>
</table>
<p>You can manage cookie preferences through your browser settings. Disabling essential cookies will affect platform functionality.</p>

<h2 id="retention">5. Data Retention</h2>
<p>We retain your data for as long as your account is active, or as required by legal obligations. Gaming regulations typically require a minimum retention period of 5 years after account closure. After this period, personal data is securely deleted or anonymised.</p>

<h2 id="rights">6. Your Rights</h2>
<p>Depending on your jurisdiction, you may have the right to:</p>
<ul>
<li><strong>Access</strong> — Request a copy of the personal data we hold about you</li>
<li><strong>Correction</strong> — Request correction of inaccurate or incomplete data</li>
<li><strong>Deletion</strong> — Request deletion of your data (subject to legal obligations)</li>
<li><strong>Restriction</strong> — Request that we limit how we process your data</li>
<li><strong>Portability</strong> — Receive your data in a structured, machine-readable format</li>
<li><strong>Objection</strong> — Object to processing based on legitimate interests</li>
</ul>
<p>To exercise any of these rights, contact our Data Protection Officer at <a href="mailto:privacy@phibet.io">privacy@phibet.io</a>. We will respond within 30 days.</p>

<h2 id="security">7. Data Security</h2>
<p>We implement industry-standard security measures including:</p>
<ul>
<li>256-bit SSL/TLS encryption for all data in transit</li>
<li>Encrypted storage for sensitive personal information</li>
<li>Regular security audits and penetration testing</li>
<li>Strict access controls — only authorised staff can access personal data</li>
<li>Multi-factor authentication for all internal systems</li>
</ul>

<h2 id="children">8. Children's Privacy</h2>
<p>The PhiBet platform is strictly for adults aged 18 and over. We do not knowingly collect personal data from minors. If we discover a minor has registered, the account will be immediately closed and all data deleted. Please contact us at <a href="mailto:support@phibet.io">support@phibet.io</a> if you suspect underage use.</p>

<h2 id="changes">9. Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on the platform. The "Last Updated" date at the top of this page reflects the most recent revision.</p>

<h2 id="contact">10. Contact Us</h2>
<p>For privacy-related queries, please contact our Data Protection Officer:</p>
<div class="info-box">
<p><strong>Email:</strong> <a href="mailto:privacy@phibet.io">privacy@phibet.io</a></p>
<p><strong>Response time:</strong> Within 30 days of receipt</p>
</div>
</div></div></body></html>`,
  },
];

async function main() {
  console.log(`Seeding ${pages.length} CMS pages...`);

  for (const page of pages) {
    const existing = await prisma.staticPage.findUnique({ where: { slug: page.slug } });
    if (existing) {
      console.log(`  SKIP  ${page.slug} (already exists)`);
      continue;
    }
    await prisma.staticPage.create({
      data: {
        slug: page.slug,
        title: page.title,
        content: page.content,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        isPublished: true,
        publishedAt: new Date(),
      },
    });
    console.log(`  CREATED  ${page.slug}`);
  }

  console.log('Done.');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
