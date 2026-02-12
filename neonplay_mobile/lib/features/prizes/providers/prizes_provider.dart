import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../models/prize_models.dart';
import '../repositories/prizes_repository.dart';

final prizesRepositoryProvider = Provider<PrizesRepository>((ref) {
  return PrizesRepository(ref.read(dioClientProvider));
});

/// Prize store – falls back to simulated data matching Prizes.tsx.
final prizesProvider = FutureProvider<List<PrizeModel>>((ref) async {
  try {
    final list = await ref.read(prizesRepositoryProvider).getStore();
    if (list.isNotEmpty) return list;
  } catch (_) {}
  return _simulatedPrizes;
});

// ---------------------------------------------------------------------------
// Simulated prizes with local asset images – matches Prizes.tsx.
// ---------------------------------------------------------------------------
final _simulatedPrizes = <PrizeModel>[
  // Monthly prizes
  const PrizeModel(
    id: 'prize-m1',
    name: 'iPhone 15 Pro Max',
    description: 'Latest Apple flagship phone with titanium design',
    imageUrl: 'assets/images/prizes/iphone.png',
    category: 'monthly',
    tier: '1st Place',
    pointsCost: 50000,
  ),
  const PrizeModel(
    id: 'prize-m2',
    name: 'MacBook Air M3',
    description: 'Ultra-thin laptop with M3 chip and all-day battery',
    imageUrl: 'assets/images/prizes/macbook.png',
    category: 'monthly',
    tier: '2nd Place',
    pointsCost: 40000,
  ),
  const PrizeModel(
    id: 'prize-m3',
    name: 'iPad Pro 12.9"',
    description: 'Pro-level tablet with M2 chip and Liquid Retina XDR',
    imageUrl: 'assets/images/prizes/ipad.png',
    category: 'monthly',
    tier: '3rd Place',
    pointsCost: 35000,
  ),
  const PrizeModel(
    id: 'prize-m4',
    name: 'Apple Watch Ultra',
    description: 'Most rugged and capable Apple Watch ever',
    imageUrl: 'assets/images/prizes/apple-watch.png',
    category: 'monthly',
    tier: '4th Place',
    pointsCost: 25000,
  ),
  const PrizeModel(
    id: 'prize-m5',
    name: 'AirPods Pro 2',
    description: 'Active noise cancellation with adaptive audio',
    imageUrl: 'assets/images/prizes/airpods.png',
    category: 'monthly',
    tier: '5th Place',
    pointsCost: 12000,
  ),
  // Weekly prizes
  const PrizeModel(
    id: 'prize-w1',
    name: 'PlayStation 5',
    description: 'Next-gen gaming console with DualSense controller',
    imageUrl: 'assets/images/prizes/ps5.png',
    category: 'weekly',
    tier: '1st Place',
    pointsCost: 25000,
  ),
  const PrizeModel(
    id: 'prize-w2',
    name: 'Samsung Galaxy S24',
    description: 'AI-powered smartphone with pro-grade camera',
    imageUrl: 'assets/images/prizes/samsung-phone.png',
    category: 'weekly',
    tier: '2nd Place',
    pointsCost: 20000,
  ),
  const PrizeModel(
    id: 'prize-w3',
    name: 'Bose Speaker',
    description: 'Premium portable speaker with deep bass',
    imageUrl: 'assets/images/prizes/bose-speaker.png',
    category: 'weekly',
    tier: '3rd Place',
    pointsCost: 15000,
  ),
  const PrizeModel(
    id: 'prize-w4',
    name: 'Fitbit Charge 6',
    description: 'Advanced fitness tracker with built-in GPS',
    imageUrl: 'assets/images/prizes/fitbit.png',
    category: 'weekly',
    tier: '4th Place',
    pointsCost: 8000,
  ),
  const PrizeModel(
    id: 'prize-w5',
    name: '\$75 Bonus Credits',
    description: 'Bonus credits added directly to your account',
    imageUrl: 'assets/images/prizes/bonus-credits.png',
    category: 'weekly',
    tier: '5th Place',
    pointsCost: 3500,
  ),
  // Daily prizes
  const PrizeModel(
    id: 'prize-d1',
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise canceling headphones',
    imageUrl: 'assets/images/prizes/sony-headphones.png',
    category: 'daily',
    tier: '1st Place',
    pointsCost: 15000,
  ),
  const PrizeModel(
    id: 'prize-d2',
    name: 'Nintendo Switch',
    description: 'Versatile gaming console for home and on-the-go',
    imageUrl: 'assets/images/prizes/nintendo-switch.png',
    category: 'daily',
    tier: '2nd Place',
    pointsCost: 12000,
  ),
  const PrizeModel(
    id: 'prize-d3',
    name: 'Amazon Echo Show',
    description: 'Smart display with Alexa and premium sound',
    imageUrl: 'assets/images/prizes/echo-show.png',
    category: 'daily',
    tier: '3rd Place',
    pointsCost: 10000,
  ),
  const PrizeModel(
    id: 'prize-d4',
    name: '\$100 Gift Card',
    description: 'Amazon gift card for anything you want',
    imageUrl: 'assets/images/prizes/gift-card.png',
    category: 'daily',
    tier: '4th Place',
    pointsCost: 5000,
  ),
  const PrizeModel(
    id: 'prize-d5',
    name: '\$50 Bonus Credits',
    description: 'Bonus credits added directly to your account',
    imageUrl: 'assets/images/prizes/bonus-credits.png',
    category: 'daily',
    tier: '5th Place',
    pointsCost: 2500,
  ),
];
