import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../providers/help_provider.dart';

/// FAQ screen with expandable accordion sections.
class FaqScreen extends ConsumerWidget {
  const FaqScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final faqsAsync = ref.watch(faqsProvider(null));

    return faqsAsync.when(
      data: (faqs) {
        if (faqs.isEmpty) {
          return const Center(
            child: Text('No FAQs available',
                style: TextStyle(color: AppColors.mutedForeground)),
          );
        }
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: faqs.length,
          itemBuilder: (_, index) {
            final faq = faqs[index];
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.border),
              ),
              child: ExpansionTile(
                title: Text(
                  faq['question'] as String? ?? '',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.foreground,
                  ),
                ),
                iconColor: AppColors.primary,
                collapsedIconColor: AppColors.mutedForeground,
                childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                children: [
                  Text(
                    faq['answer'] as String? ?? '',
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.mutedForeground,
                      height: 1.5,
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, _) => const Center(
        child: Text('Failed to load FAQs',
            style: TextStyle(color: AppColors.mutedForeground)),
      ),
    );
  }
}
