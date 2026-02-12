import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

/// Wrapper that adds pull-to-refresh to any scrollable child.
class PullToRefresh extends StatelessWidget {
  final Widget child;
  final Future<void> Function() onRefresh;

  const PullToRefresh({
    super.key,
    required this.child,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh,
      color: AppColors.primary,
      backgroundColor: AppColors.card,
      child: child,
    );
  }
}
