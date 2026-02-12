import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../models/notification_model.dart';
import '../repositories/notifications_repository.dart';

final notificationsRepositoryProvider =
    Provider<NotificationsRepository>((ref) {
  return NotificationsRepository(ref.read(dioClientProvider));
});

/// Notifications list – falls back to simulated data matching the web app.
final notificationsProvider =
    FutureProvider<List<NotificationModel>>((ref) async {
  try {
    final list = await ref.read(notificationsRepositoryProvider).getAll();
    if (list.isNotEmpty) return list;
  } catch (_) {}
  return _simulatedNotifications;
});

/// Unread notification count.
final unreadNotificationCountProvider = Provider<int>((ref) {
  final notifications = ref.watch(notificationsProvider);
  return notifications.when(
    data: (list) => list.where((n) => !n.isRead).length,
    loading: () => 0,
    error: (_, _) => 0,
  );
});

// ---------------------------------------------------------------------------
// Simulated notifications – matches NotificationsPanel.tsx data.
// ---------------------------------------------------------------------------
final _simulatedNotifications = <NotificationModel>[
  NotificationModel(
    id: 'n1',
    title: 'Its Weekly Sports Bonus Time!',
    message: 'Bet \$50+ on sports this week and get a 100% bonus up to \$100!',
    type: 'promotion',
    isRead: false,
    createdAt: DateTime(2026, 1, 10),
  ),
  NotificationModel(
    id: 'n2',
    title: 'Its Weekly Sports Bonus Time!',
    message: 'Bet \$50+ on sports this week and get a 100% bonus up to \$100!',
    type: 'promotion',
    isRead: false,
    createdAt: DateTime(2026, 1, 3),
  ),
  NotificationModel(
    id: 'n3',
    title: 'Daily Bonus Available!',
    message: 'Your daily bonus is ready to claim. Log in now!',
    type: 'promotion',
    isRead: true,
    createdAt: DateTime(2026, 1, 2),
  ),
  NotificationModel(
    id: 'n4',
    title: 'Deposit Successful',
    message: '\$500.00 has been deposited to your account.',
    type: 'transaction',
    isRead: true,
    createdAt: DateTime(2026, 1, 1),
  ),
  NotificationModel(
    id: 'n5',
    title: 'Withdrawal Complete',
    message: '\$200.00 USDC withdrawal has been processed.',
    type: 'transaction',
    isRead: true,
    createdAt: DateTime(2025, 12, 30),
  ),
  NotificationModel(
    id: 'n6',
    title: 'Password Changed',
    message: 'Your password was successfully changed.',
    type: 'system',
    isRead: true,
    createdAt: DateTime(2025, 12, 28),
  ),
];
