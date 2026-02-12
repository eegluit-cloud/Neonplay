import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/providers/auth_provider.dart';
import '../theme/app_colors.dart';

class AppSidebar extends ConsumerWidget {
  const AppSidebar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Drawer(
      child: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Row(
                children: [
                  const Text(
                    'PhiBet.io',
                    style: TextStyle(
                      fontFamily: 'Orbitron',
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primary,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppColors.foreground),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),
            const Divider(color: AppColors.border),

            // Scrollable content
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: [
                  // Lobby
                  _SidebarItem(
                    icon: Icons.home_outlined,
                    label: 'Lobby',
                    route: '/lobby',
                  ),
                  const _SidebarSectionDivider(),

                  // Sports
                  _SidebarSection(
                    title: 'Sports',
                    children: [
                      _SidebarItem(
                        icon: Icons.sports_soccer,
                        label: 'Sports Home',
                        route: '/sports',
                      ),
                    ],
                  ),
                  const _SidebarSectionDivider(),

                  // Casino
                  _SidebarSection(
                    title: 'Casino',
                    initiallyExpanded: true,
                    children: [
                      _SidebarItem(
                        icon: Icons.casino,
                        label: 'All Games',
                        route: '/casino',
                      ),
                      _SidebarItem(
                        icon: Icons.favorite_border,
                        label: 'Favorites',
                        route: '/favorites',
                      ),
                      _SidebarItem(
                        icon: Icons.local_fire_department,
                        label: 'Hot Games',
                        route: '/hot-games',
                      ),
                      _SidebarItem(
                        icon: Icons.grid_view,
                        label: 'Slots',
                        route: '/slots',
                      ),
                      _SidebarItem(
                        icon: Icons.rocket_launch,
                        label: 'Crash Games',
                        route: '/crash-games',
                      ),
                      _SidebarItem(
                        icon: Icons.live_tv,
                        label: 'Live Casino',
                        route: '/live-casino',
                      ),
                      _SidebarItem(
                        icon: Icons.storefront,
                        label: 'Providers',
                        route: '/providers',
                      ),
                    ],
                  ),
                  const _SidebarSectionDivider(),

                  // Promotions
                  _SidebarSection(
                    title: 'Promotions',
                    children: [
                      _SidebarItem(
                        icon: Icons.card_giftcard,
                        label: 'All Promotions',
                        route: '/promotions',
                      ),
                      _SidebarItem(
                        icon: Icons.workspace_premium,
                        label: 'VIP Club',
                        route: '/vip',
                      ),
                      _SidebarItem(
                        icon: Icons.people_outline,
                        label: 'Refer a Friend',
                        route: '/refer-friend',
                      ),
                      _SidebarItem(
                        icon: Icons.emoji_events,
                        label: 'Prizes',
                        route: '/prizes',
                      ),
                      _SidebarItem(
                        icon: Icons.leaderboard,
                        label: 'Leaderboard',
                        route: '/leaderboard',
                      ),
                    ],
                  ),
                  const _SidebarSectionDivider(),

                  // Account
                  _SidebarSection(
                    title: 'Account',
                    children: [
                      _SidebarItem(
                        icon: Icons.person_outline,
                        label: 'Profile',
                        route: '/profile',
                      ),
                    ],
                  ),
                  const _SidebarSectionDivider(),

                  // Support
                  _SidebarSection(
                    title: 'Support & Info',
                    children: [
                      _SidebarItem(
                        icon: Icons.help_outline,
                        label: 'Live Chat / FAQ',
                        route: '/faq',
                      ),
                      _SidebarItem(
                        icon: Icons.verified_user_outlined,
                        label: 'Provably Fair',
                        route: '/provably-fair',
                      ),
                      _SidebarItem(
                        icon: Icons.shield_outlined,
                        label: 'Responsible Gambling',
                        route: '/responsible-gambling',
                      ),
                    ],
                  ),
                  const _SidebarSectionDivider(),

                  // Legal
                  _SidebarSection(
                    title: 'Legal',
                    children: [
                      _SidebarItem(
                        icon: Icons.description_outlined,
                        label: 'Terms & Conditions',
                        route: '/terms',
                      ),
                      _SidebarItem(
                        icon: Icons.privacy_tip_outlined,
                        label: 'Privacy Policy',
                        route: '/privacy',
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Logout button
            const Divider(color: AppColors.border),
            Consumer(
              builder: (context, ref, _) {
                return ListTile(
                  leading: const Icon(
                    Icons.logout,
                    color: AppColors.destructive,
                  ),
                  title: const Text(
                    'Log Out',
                    style: TextStyle(color: AppColors.destructive),
                  ),
                  onTap: () {
                    Navigator.of(context).pop();
                    ref.read(authProvider.notifier).logout();
                  },
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _SidebarItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String route;

  const _SidebarItem({
    required this.icon,
    required this.label,
    required this.route,
  });

  @override
  Widget build(BuildContext context) {
    final currentRoute = GoRouterState.of(context).matchedLocation;
    final isActive = currentRoute == route;

    return ListTile(
      dense: true,
      leading: Icon(
        icon,
        size: 20,
        color: isActive ? AppColors.primary : AppColors.mutedForeground,
      ),
      title: Text(
        label,
        style: TextStyle(
          fontSize: 14,
          color: isActive ? AppColors.primary : AppColors.foreground,
          fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
        ),
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      tileColor: isActive ? AppColors.primary.withValues(alpha: 0.1) : null,
      onTap: () {
        Navigator.of(context).pop();
        context.go(route);
      },
    );
  }
}

class _SidebarSection extends StatelessWidget {
  final String title;
  final List<Widget> children;
  final bool initiallyExpanded;

  const _SidebarSection({
    required this.title,
    required this.children,
    this.initiallyExpanded = false,
  });

  @override
  Widget build(BuildContext context) {
    return ExpansionTile(
      title: Text(
        title,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: AppColors.mutedForeground,
          letterSpacing: 0.5,
        ),
      ),
      initiallyExpanded: initiallyExpanded,
      tilePadding: const EdgeInsets.symmetric(horizontal: 16),
      childrenPadding: EdgeInsets.zero,
      iconColor: AppColors.mutedForeground,
      collapsedIconColor: AppColors.mutedForeground,
      children: children,
    );
  }
}

class _SidebarSectionDivider extends StatelessWidget {
  const _SidebarSectionDivider();

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.symmetric(horizontal: 16),
      child: Divider(color: AppColors.border, height: 1),
    );
  }
}
