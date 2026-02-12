import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/providers/auth_provider.dart';
import '../network/api_endpoints.dart';
import '../theme/app_colors.dart';

/// Reusable CMS-driven static content page.
class StaticContentPage extends ConsumerWidget {
  final String slug;
  final String fallbackTitle;

  const StaticContentPage({
    super.key,
    required this.slug,
    required this.fallbackTitle,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final contentAsync = ref.watch(_cmsPageProvider(slug));

    return contentAsync.when(
      data: (data) => SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              data['title'] as String? ?? fallbackTitle,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: AppColors.foreground,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              data['content'] as String? ?? 'Content not available.',
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.mutedForeground,
                height: 1.6,
              ),
            ),
          ],
        ),
      ),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, _) => Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                fallbackTitle,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: AppColors.foreground,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Content is currently unavailable.',
                style: TextStyle(color: AppColors.mutedForeground),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Internal provider for fetching a CMS page by slug.
final _cmsPageProvider =
    FutureProvider.family<Map<String, dynamic>, String>((ref, slug) async {
  final client = ref.read(dioClientProvider);
  final response = await client.get(ApiEndpoints.cmsPage(slug));
  return response.data as Map<String, dynamic>;
});
