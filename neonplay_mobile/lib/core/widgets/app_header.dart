import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/providers/auth_provider.dart';
import '../../features/notifications/providers/notifications_provider.dart';
import '../../features/notifications/screens/widgets/notifications_panel.dart';
import '../../features/wallet/screens/wallet_bottom_sheet.dart';
import '../theme/app_colors.dart';
import 'coin_balance_pill.dart';

class AppHeader extends ConsumerWidget implements PreferredSizeWidget {
  const AppHeader({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);

    return AppBar(
      leading: IconButton(
        icon: const Icon(Icons.menu, color: AppColors.foreground),
        onPressed: () => Scaffold.of(context).openDrawer(),
      ),
      title: GestureDetector(
        onTap: () => context.go('/lobby'),
        child: SvgPicture.asset(
          'assets/images/logos/phibet-logo-horizontal.svg',
          height: 28,
          colorFilter: const ColorFilter.mode(
            AppColors.primary,
            BlendMode.srcIn,
          ),
        ),
      ),
      centerTitle: false,
      actions: [
        const CoinBalancePill(),
        const SizedBox(width: 8),

        // Action buttons pill
        Container(
          margin: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Wallet
              _PillButton(
                icon: Icons.account_balance_wallet_outlined,
                onTap: () => WalletBottomSheet.show(context),
              ),
              _PillDivider(),
              // Notifications
              _NotificationPillButton(),
            ],
          ),
        ),
        const SizedBox(width: 8),

        // Avatar
        GestureDetector(
          onTap: () => context.go('/profile'),
          child: Padding(
            padding: const EdgeInsets.only(right: 12),
            child: CircleAvatar(
              radius: 16,
              backgroundColor: AppColors.primary.withValues(alpha: 0.2),
              backgroundImage:
                  user?.avatar != null ? NetworkImage(user!.avatar!) : null,
              child: user?.avatar == null
                  ? Text(
                      (user?.username ?? '?')[0].toUpperCase(),
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    )
                  : null,
            ),
          ),
        ),
      ],
    );
  }
}

class _PillButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _PillButton({
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        child: Icon(icon, size: 18, color: AppColors.foreground),
      ),
    );
  }
}

class _NotificationPillButton extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unreadCount = ref.watch(unreadNotificationCountProvider);
    return GestureDetector(
      onTap: () => NotificationsPanel.show(context),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        child: unreadCount > 0
            ? Badge(
                label: Text(
                  '$unreadCount',
                  style: const TextStyle(fontSize: 9),
                ),
                child: const Icon(Icons.notifications_outlined,
                    size: 18, color: AppColors.foreground),
              )
            : const Icon(Icons.notifications_outlined,
                size: 18, color: AppColors.foreground),
      ),
    );
  }
}

class _PillDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 1,
      height: 16,
      color: AppColors.border,
    );
  }
}
