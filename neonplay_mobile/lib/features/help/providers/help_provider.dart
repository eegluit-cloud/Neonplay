import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../repositories/help_repository.dart';

final helpRepositoryProvider = Provider<HelpRepository>((ref) {
  return HelpRepository(ref.read(dioClientProvider));
});

/// FAQ categories – falls back to simulated data matching FAQ.tsx.
final faqCategoriesProvider =
    FutureProvider<List<Map<String, dynamic>>>((ref) async {
  try {
    final list = await ref.read(helpRepositoryProvider).getFaqCategories();
    if (list.isNotEmpty) return list;
  } catch (_) {}
  return _simulatedCategories;
});

/// FAQs list – falls back to simulated data matching FAQ.tsx.
final faqsProvider =
    FutureProvider.family<List<Map<String, dynamic>>, String?>(
        (ref, category) async {
  try {
    final list =
        await ref.read(helpRepositoryProvider).getFaqs(category: category);
    if (list.isNotEmpty) return list;
  } catch (_) {}
  if (category != null) {
    return _simulatedFaqs
        .where((f) => f['category'] == category)
        .toList();
  }
  return _simulatedFaqs;
});

// ---------------------------------------------------------------------------
// Simulated FAQ data – matches FAQ.tsx hardcoded content.
// ---------------------------------------------------------------------------
final _simulatedCategories = <Map<String, dynamic>>[
  {'id': 'account', 'name': 'Account & Registration'},
  {'id': 'payments', 'name': 'Deposits & Withdrawals'},
  {'id': 'games', 'name': 'Games & Gameplay'},
  {'id': 'bonuses', 'name': 'Bonuses & Promotions'},
  {'id': 'technical', 'name': 'Technical Issues'},
  {'id': 'responsible', 'name': 'Responsible Gaming'},
];

final _simulatedFaqs = <Map<String, dynamic>>[
  // Account & Registration
  {
    'category': 'account',
    'question': 'How do I create an account?',
    'answer':
        'Click "Register" and fill in your email, username, and password. You\'ll receive a verification email to confirm your account.',
  },
  {
    'category': 'account',
    'question': 'How do I verify my account?',
    'answer':
        'After registration, check your email for a verification code. Enter the code on the verification page to activate your account.',
  },
  {
    'category': 'account',
    'question': 'I forgot my password. How do I reset it?',
    'answer':
        'Click "Forgot Password" on the login screen, enter your email, and we\'ll send you a password reset link.',
  },
  {
    'category': 'account',
    'question': 'Can I change my username?',
    'answer':
        'Usernames cannot be changed once set. Please choose carefully during registration.',
  },
  // Deposits & Withdrawals
  {
    'category': 'payments',
    'question': 'What is the minimum deposit?',
    'answer':
        'The minimum deposit is \$10 for most payment methods. Cryptocurrency deposits may have different minimums based on network fees.',
  },
  {
    'category': 'payments',
    'question': 'How long do withdrawals take?',
    'answer':
        'Withdrawal times vary by method: Cryptocurrency: ~1 hour, E-wallets: up to 24 hours, Bank transfers: 3-5 business days.',
  },
  {
    'category': 'payments',
    'question': 'What payment methods are available?',
    'answer':
        'We accept Credit/Debit Cards (Visa, Mastercard), Bank Transfers (UPI, NEFT, IMPS), and Cryptocurrencies (BTC, ETH, USDT, USDC).',
  },
  {
    'category': 'payments',
    'question': 'Are there any fees for deposits or withdrawals?',
    'answer':
        'We do not charge fees for deposits. Withdrawal fees may apply depending on the payment method and amount.',
  },
  // Games & Gameplay
  {
    'category': 'games',
    'question': 'What types of games are available?',
    'answer':
        'We offer Slots, Live Casino, Table Games (Blackjack, Roulette, Baccarat), Crash Games, Game Shows, and Sports Betting.',
  },
  {
    'category': 'games',
    'question': 'What is RTP?',
    'answer':
        'RTP (Return to Player) is the percentage of wagered money a game returns to players over time. For example, a 96% RTP means \$96 returned per \$100 wagered on average.',
  },
  {
    'category': 'games',
    'question': 'Are the games fair?',
    'answer':
        'Yes! All our games use certified Random Number Generators (RNG) and are regularly audited. Visit our Provably Fair page for details.',
  },
  {
    'category': 'games',
    'question': 'Can I play games for free?',
    'answer':
        'Many games offer a demo mode where you can play with virtual credits. Look for the "Demo" button on supported games.',
  },
  // Bonuses & Promotions
  {
    'category': 'bonuses',
    'question': 'What is the welcome bonus?',
    'answer':
        'New players receive a 200% deposit bonus up to \$1,000 on their first deposit. Check our Promotions page for current offers.',
  },
  {
    'category': 'bonuses',
    'question': 'How does the VIP program work?',
    'answer':
        'Our VIP program has 5 tiers: Bronze, Silver, Gold, Platinum, and Diamond. Earn points by playing to level up and unlock exclusive rewards.',
  },
  {
    'category': 'bonuses',
    'question': 'What are wagering requirements?',
    'answer':
        'Wagering requirements indicate how many times you must bet the bonus amount before you can withdraw winnings. For example, 30x means betting \$30 for every \$1 of bonus.',
  },
  {
    'category': 'bonuses',
    'question': 'How does the referral program work?',
    'answer':
        'Share your unique referral code with friends. When they sign up and deposit, both you and your friend receive \$100 in bonus funds!',
  },
  // Technical Issues
  {
    'category': 'technical',
    'question': 'The game is loading slowly. What should I do?',
    'answer':
        'Try refreshing the page, clearing your browser cache, or switching to a different browser. Ensure you have a stable internet connection.',
  },
  {
    'category': 'technical',
    'question': 'I was disconnected during a game. What happens to my bet?',
    'answer':
        'If you\'re disconnected, the game round will complete automatically. Any winnings will be credited to your account. Check your game history for details.',
  },
  {
    'category': 'technical',
    'question': 'Which devices are supported?',
    'answer':
        'PhiBet.io works on all modern browsers (Chrome, Safari, Firefox, Edge) and our native iOS and Android apps.',
  },
  // Responsible Gaming
  {
    'category': 'responsible',
    'question': 'How can I set deposit limits?',
    'answer':
        'Go to Profile > Settings to set daily, weekly, or monthly deposit limits. Limits take effect immediately.',
  },
  {
    'category': 'responsible',
    'question': 'Can I self-exclude from the platform?',
    'answer':
        'Yes. Contact our support team to request a temporary or permanent self-exclusion. During exclusion, you will not be able to access your account.',
  },
  {
    'category': 'responsible',
    'question': 'Where can I get help for gambling problems?',
    'answer':
        'If you or someone you know has a gambling problem, please visit our Responsible Gambling page or contact organizations like GamCare or Gamblers Anonymous.',
  },
];
