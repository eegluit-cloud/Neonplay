import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../providers/amoe_provider.dart';

/// AMOE (Alternative Method of Entry) screen.
class AmoeScreen extends ConsumerWidget {
  const AmoeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final configAsync = ref.watch(amoeConfigProvider);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Header
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: AppGradients.gold,
            borderRadius: BorderRadius.circular(16),
          ),
          child: const Column(
            children: [
              Icon(Icons.mail_outline, size: 48, color: Colors.white),
              SizedBox(height: 12),
              Text(
                'Alternative Method of Entry',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 6),
              Text(
                'Free entry without purchase',
                style: TextStyle(fontSize: 14, color: Colors.white70),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Config / instructions
        configAsync.when(
          data: (config) => Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (config['instructions'] != null)
                Text(
                  config['instructions'] as String,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.mutedForeground,
                    height: 1.5,
                  ),
                ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => _generateCode(context, ref),
                  child: const Text('Generate AMOE Code'),
                ),
              ),
            ],
          ),
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (_, _) => const Text('Failed to load AMOE config',
              style: TextStyle(color: AppColors.mutedForeground)),
        ),
      ],
    );
  }

  Future<void> _generateCode(BuildContext context, WidgetRef ref) async {
    try {
      final repo = ref.read(amoeRepositoryProvider);
      final result = await repo.generate();
      if (context.mounted) {
        showDialog(
          context: context,
          builder: (_) => AlertDialog(
            title: const Text('AMOE Code'),
            content: SelectableText(
              result['code'] as String? ?? 'Generated',
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w800,
                letterSpacing: 2,
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('OK'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to generate code'),
            backgroundColor: AppColors.destructive,
          ),
        );
      }
    }
  }
}
