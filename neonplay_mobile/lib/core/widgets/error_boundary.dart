import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

/// Global error boundary widget that catches uncaught widget errors.
///
/// Wrap around the root MaterialApp or individual screens to prevent
/// unhandled exceptions from crashing the entire app.
class ErrorBoundary extends StatefulWidget {
  final Widget child;

  const ErrorBoundary({super.key, required this.child});

  @override
  State<ErrorBoundary> createState() => _ErrorBoundaryState();
}

class _ErrorBoundaryState extends State<ErrorBoundary> {
  bool _hasError = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Reset error state when dependencies change (e.g. navigation)
    _hasError = false;
  }

  @override
  Widget build(BuildContext context) {
    if (_hasError) {
      return _ErrorFallback(
        onRetry: () => setState(() => _hasError = false),
      );
    }
    return widget.child;
  }
}

class _ErrorFallback extends StatelessWidget {
  final VoidCallback onRetry;

  const _ErrorFallback({required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.background,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.warning_amber_rounded,
                size: 64,
                color: AppColors.accent,
              ),
              const SizedBox(height: 16),
              const Text(
                'Something went wrong',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.foreground,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'An unexpected error occurred. Please try again.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.mutedForeground,
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh, size: 18),
                label: const Text('Try Again'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
