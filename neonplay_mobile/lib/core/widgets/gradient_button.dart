import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_gradients.dart';

/// Reusable gradient button with configurable gradient, size, and loading state.
class GradientButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final LinearGradient gradient;
  final bool isLoading;
  final IconData? icon;
  final double height;
  final double borderRadius;

  const GradientButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.gradient = AppGradients.primary,
    this.isLoading = false,
    this.icon,
    this.height = 48,
    this.borderRadius = 12,
  });

  /// Cyan → Blue gradient (default).
  const GradientButton.primary({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.icon,
    this.height = 48,
    this.borderRadius = 12,
  }) : gradient = AppGradients.primary;

  /// Gold → Orange gradient.
  const GradientButton.gold({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.icon,
    this.height = 48,
    this.borderRadius = 12,
  }) : gradient = AppGradients.gold;

  /// Purple → Pink VIP gradient.
  const GradientButton.vip({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.icon,
    this.height = 48,
    this.borderRadius = 12,
  }) : gradient = AppGradients.vip;

  @override
  Widget build(BuildContext context) {
    final enabled = onPressed != null && !isLoading;

    return GestureDetector(
      onTap: enabled ? onPressed : null,
      child: AnimatedOpacity(
        opacity: enabled ? 1.0 : 0.5,
        duration: const Duration(milliseconds: 200),
        child: Container(
          height: height,
          decoration: BoxDecoration(
            gradient: gradient,
            borderRadius: BorderRadius.circular(borderRadius),
            boxShadow: enabled
                ? [
                    BoxShadow(
                      color: gradient.colors.first.withValues(alpha: 0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ]
                : null,
          ),
          child: Center(
            child: isLoading
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      color: Colors.white,
                    ),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (icon != null) ...[
                        Icon(icon, color: Colors.white, size: 20),
                        const SizedBox(width: 8),
                      ],
                      Text(
                        label,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppColors.foreground,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}
