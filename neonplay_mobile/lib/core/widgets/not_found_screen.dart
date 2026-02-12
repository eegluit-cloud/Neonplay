import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

/// 404 Not Found screen shown when navigating to an invalid route.
class NotFoundScreen extends StatelessWidget {
  const NotFoundScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '404',
                style: AppTextStyles.displayLarge.copyWith(
                  color: AppColors.primary,
                  fontSize: 72,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Page Not Found',
                style: AppTextStyles.headlineMedium.copyWith(
                  color: AppColors.foreground,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'The page you are looking for does not exist or has been moved.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.mutedForeground,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 32),
              ElevatedButton.icon(
                onPressed: () => context.go('/lobby'),
                icon: const Icon(Icons.home, size: 18),
                label: const Text('Go to Lobby'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
