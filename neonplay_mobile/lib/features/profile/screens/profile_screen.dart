import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../auth/providers/auth_provider.dart';
import 'widgets/game_history_tab.dart';
import 'widgets/kyc_tab.dart';
import 'widgets/password_tab.dart';
import 'widgets/profile_edit_tab.dart';
import 'widgets/transactions_tab.dart';

/// Profile screen with 5 tabs.
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);

    return DefaultTabController(
      length: 5,
      child: Column(
        children: [
          // User header
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Avatar
                CircleAvatar(
                  radius: 28,
                  backgroundColor: AppColors.muted,
                  backgroundImage:
                      user?.avatar != null ? NetworkImage(user!.avatar!) : null,
                  child: user?.avatar == null
                      ? Text(
                          (user?.username ?? '?')[0].toUpperCase(),
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: AppColors.foreground,
                          ),
                        )
                      : null,
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user?.username ?? '',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: AppColors.foreground,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        user?.email ?? '',
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.mutedForeground,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Tab bar
          const TabBar(
            isScrollable: true,
            tabAlignment: TabAlignment.start,
            labelColor: AppColors.primary,
            unselectedLabelColor: AppColors.mutedForeground,
            indicatorColor: AppColors.primary,
            dividerColor: AppColors.border,
            labelStyle: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            tabs: [
              Tab(text: 'Game History'),
              Tab(text: 'Profile'),
              Tab(text: 'Password'),
              Tab(text: 'KYC'),
              Tab(text: 'Transactions'),
            ],
          ),

          // Tab views
          const Expanded(
            child: TabBarView(
              children: [
                GameHistoryTab(),
                ProfileEditTab(),
                PasswordTab(),
                KycTab(),
                TransactionsTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
