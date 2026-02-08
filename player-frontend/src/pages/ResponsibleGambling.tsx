import { StaticContentPage } from '@/components/StaticContentPage';

const ResponsibleGambling = () => (
  <StaticContentPage
    title="Responsible Gambling"
    lastUpdated="January 15, 2026"
    sections={[
      {
        title: 'Our Commitment',
        content: (
          <div className="space-y-3">
            <p>At PhiBet.io, we are committed to promoting responsible gambling and providing a safe, enjoyable experience for all our users. We believe that gambling should always be a form of entertainment, never a way to make money or escape problems.</p>
            <p>We provide a range of tools and resources to help you stay in control of your gambling activity.</p>
          </div>
        ),
      },
      {
        title: 'Self-Assessment',
        content: (
          <div className="space-y-3">
            <p>Ask yourself these questions to assess your gambling habits:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Do you spend more time or money gambling than you intended?</li>
              <li>Do you feel restless or irritable when trying to cut down on gambling?</li>
              <li>Have you tried to control, cut back, or stop gambling without success?</li>
              <li>Do you gamble to escape problems or relieve feelings of helplessness or anxiety?</li>
              <li>After losing money, do you return to try to win it back?</li>
              <li>Have you lied to family members or others to hide your gambling?</li>
              <li>Have you jeopardized relationships, jobs, or opportunities because of gambling?</li>
            </ul>
            <p>If you answered "yes" to any of these questions, you may want to consider seeking help.</p>
          </div>
        ),
      },
      {
        title: 'Setting Limits',
        content: (
          <div className="space-y-3">
            <p>We offer several limit-setting tools to help you stay in control:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Deposit Limits:</strong> Set daily, weekly, or monthly deposit limits</li>
              <li><strong>Session Limits:</strong> Set time reminders for your gaming sessions</li>
              <li><strong>Loss Limits:</strong> Set a maximum amount you're willing to lose</li>
              <li><strong>Wager Limits:</strong> Set maximum bet amounts per game</li>
            </ul>
            <p>You can set or adjust these limits at any time through your account settings. Reductions take effect immediately; increases have a cooling-off period.</p>
          </div>
        ),
      },
      {
        title: 'Self-Exclusion',
        content: (
          <div className="space-y-3">
            <p>If you feel you need a break from gambling, you can self-exclude from PhiBet.io for a period of your choosing:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Cool-Off Period:</strong> 24 hours, 7 days, or 30 days</li>
              <li><strong>Self-Exclusion:</strong> 6 months, 1 year, or 5 years</li>
              <li><strong>Permanent Exclusion:</strong> Indefinite account closure</li>
            </ul>
            <p>During self-exclusion, you will be unable to access your account or place any bets. Self-exclusion cannot be reversed during the selected period.</p>
          </div>
        ),
      },
      {
        title: 'Recognizing Problem Gambling',
        content: (
          <div className="space-y-3">
            <p>Warning signs of problem gambling include:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Spending more money and time on gambling than you can afford</li>
              <li>Finding it hard to manage or stop gambling</li>
              <li>Having arguments with family or friends about money and gambling</li>
              <li>Losing interest in usual activities and hobbies</li>
              <li>Always thinking or talking about gambling</li>
              <li>Lying about gambling or hiding it from others</li>
              <li>Chasing losses or gambling to get out of financial trouble</li>
              <li>Gambling until all money is gone</li>
              <li>Borrowing money, selling possessions, or not paying bills to fund gambling</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Tips for Responsible Gambling',
        content: (
          <div className="space-y-3">
            <ul className="list-disc pl-5 space-y-1">
              <li>Set a budget before you start and stick to it</li>
              <li>Set a time limit for your gambling sessions</li>
              <li>Never chase your losses</li>
              <li>Don't gamble when you're upset, stressed, or under the influence</li>
              <li>Take regular breaks during play sessions</li>
              <li>Balance gambling with other activities</li>
              <li>Never borrow money to gamble</li>
              <li>Remember that gambling is entertainment, not income</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Support Organizations',
        content: (
          <div className="space-y-3">
            <p>If you or someone you know has a gambling problem, please contact these organizations for free, confidential support:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>National Council on Problem Gambling (NCPG):</strong> 1-800-522-4700 (24/7)</li>
              <li><strong>Gamblers Anonymous:</strong> www.gamblersanonymous.org</li>
              <li><strong>GamCare:</strong> www.gamcare.org.uk - 0808 8020 133</li>
              <li><strong>BeGambleAware:</strong> www.begambleaware.org - 0808 8020 133</li>
              <li><strong>Gambling Therapy:</strong> www.gamblingtherapy.org (online support)</li>
            </ul>
            <p>You can also reach our support team 24/7 for assistance with any responsible gambling tools or concerns.</p>
          </div>
        ),
      },
    ]}
  />
);

export default ResponsibleGambling;
