import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../models/notification_model.dart';
import '../../providers/notifications_provider.dart';

/// Notifications panel shown as a bottom sheet.
/// Matches the web app's NotificationsPanel.tsx with 3 tabs.
class NotificationsPanel extends ConsumerStatefulWidget {
  const NotificationsPanel({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const NotificationsPanel(),
    );
  }

  @override
  ConsumerState<NotificationsPanel> createState() => _NotificationsPanelState();
}

class _NotificationsPanelState extends ConsumerState<NotificationsPanel>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  bool _unreadOnly = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final notificationsAsync = ref.watch(notificationsProvider);

    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      minChildSize: 0.4,
      maxChildSize: 0.9,
      builder: (_, scrollController) => Container(
        decoration: const BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            // Handle bar
            Center(
              child: Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(top: 12, bottom: 8),
                decoration: BoxDecoration(
                  color: AppColors.mutedForeground,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  const Text(
                    'Notifications',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: AppColors.foreground,
                    ),
                  ),
                  const Spacer(),
                  // Unread only toggle
                  GestureDetector(
                    onTap: () => setState(() => _unreadOnly = !_unreadOnly),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: _unreadOnly
                            ? AppColors.primary.withValues(alpha: 0.1)
                            : AppColors.secondary,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: _unreadOnly
                              ? AppColors.primary
                              : AppColors.border,
                        ),
                      ),
                      child: Text(
                        'Unread',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: _unreadOnly
                              ? AppColors.primary
                              : AppColors.mutedForeground,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            // Tabs
            TabBar(
              controller: _tabController,
              labelColor: AppColors.primary,
              unselectedLabelColor: AppColors.mutedForeground,
              indicatorColor: AppColors.primary,
              tabs: [
                _buildTab('Promotions', notificationsAsync, 'promotion'),
                _buildTab('Activity', notificationsAsync, 'transaction'),
                _buildTab('System', notificationsAsync, 'system'),
              ],
            ),
            // Tab content
            Expanded(
              child: notificationsAsync.when(
                data: (notifications) => TabBarView(
                  controller: _tabController,
                  children: [
                    _buildList(notifications, 'promotion', scrollController),
                    _buildList(notifications, 'transaction', scrollController),
                    _buildList(notifications, 'system', scrollController),
                  ],
                ),
                loading: () =>
                    const Center(child: CircularProgressIndicator()),
                error: (_, _) => const Center(
                  child: Text('Failed to load notifications',
                      style: TextStyle(color: AppColors.mutedForeground)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Tab _buildTab(String label, AsyncValue<List<NotificationModel>> async,
      String type) {
    final count = async.when(
      data: (list) =>
          list.where((n) => n.type == type && !n.isRead).length,
      loading: () => 0,
      error: (_, _) => 0,
    );
    return Tab(
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label),
          if (count > 0) ...[
            const SizedBox(width: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '$count',
                style: const TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryForeground),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildList(List<NotificationModel> all, String type,
      ScrollController scrollController) {
    var filtered = all.where((n) => n.type == type).toList();
    if (_unreadOnly) {
      filtered = filtered.where((n) => !n.isRead).toList();
    }

    if (filtered.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              type == 'promotion'
                  ? Icons.campaign_outlined
                  : type == 'transaction'
                      ? Icons.receipt_long_outlined
                      : Icons.info_outlined,
              size: 40,
              color: AppColors.mutedForeground,
            ),
            const SizedBox(height: 8),
            Text(
              _unreadOnly ? 'No unread notifications' : 'No notifications',
              style: const TextStyle(
                  color: AppColors.mutedForeground, fontSize: 14),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      controller: scrollController,
      padding: const EdgeInsets.all(16),
      itemCount: filtered.length,
      separatorBuilder: (_, _) => const SizedBox(height: 8),
      itemBuilder: (_, index) => _NotificationTile(
        notification: filtered[index],
      ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  final NotificationModel notification;

  const _NotificationTile({required this.notification});

  @override
  Widget build(BuildContext context) {
    final dateStr = notification.createdAt != null
        ? DateFormat.MMMd().format(notification.createdAt!)
        : '';

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: notification.isRead
            ? AppColors.background
            : AppColors.primary.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: notification.isRead
              ? AppColors.border
              : AppColors.primary.withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Type icon
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: _typeColor(notification.type).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              _typeIcon(notification.type),
              size: 18,
              color: _typeColor(notification.type),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        notification.title,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: notification.isRead
                              ? FontWeight.w500
                              : FontWeight.w700,
                          color: AppColors.foreground,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (!notification.isRead)
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                      ),
                  ],
                ),
                if (notification.message != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    notification.message!,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.mutedForeground,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                const SizedBox(height: 4),
                Text(
                  dateStr,
                  style: const TextStyle(
                    fontSize: 10,
                    color: AppColors.mutedForeground,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  IconData _typeIcon(String type) {
    return switch (type) {
      'promotion' => Icons.campaign,
      'transaction' => Icons.receipt_long,
      'system' => Icons.settings,
      _ => Icons.notifications,
    };
  }

  Color _typeColor(String type) {
    return switch (type) {
      'promotion' => AppColors.primary,
      'transaction' => AppColors.success,
      'system' => AppColors.accent,
      _ => AppColors.mutedForeground,
    };
  }
}
