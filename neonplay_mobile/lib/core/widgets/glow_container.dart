import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

/// Container with a configurable glow effect.
class GlowContainer extends StatelessWidget {
  final Widget child;
  final Color glowColor;
  final double glowRadius;
  final double borderRadius;
  final EdgeInsetsGeometry? padding;
  final Color? backgroundColor;

  const GlowContainer({
    super.key,
    required this.child,
    this.glowColor = AppColors.primary,
    this.glowRadius = 16,
    this.borderRadius = 12,
    this.padding,
    this.backgroundColor,
  });

  /// Cyan glow (default).
  const GlowContainer.cyan({
    super.key,
    required this.child,
    this.glowRadius = 16,
    this.borderRadius = 12,
    this.padding,
    this.backgroundColor,
  }) : glowColor = AppColors.primary;

  /// Gold glow.
  const GlowContainer.gold({
    super.key,
    required this.child,
    this.glowRadius = 16,
    this.borderRadius = 12,
    this.padding,
    this.backgroundColor,
  }) : glowColor = AppColors.accent;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: backgroundColor ?? AppColors.card,
        borderRadius: BorderRadius.circular(borderRadius),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: glowColor.withValues(alpha: 0.15),
            blurRadius: glowRadius,
            spreadRadius: 0,
          ),
        ],
      ),
      child: child,
    );
  }
}
