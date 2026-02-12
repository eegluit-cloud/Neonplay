import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppShadows {
  static final glowCyan = [
    BoxShadow(
      color: AppColors.accent.withValues(alpha: 0.3),
      blurRadius: 30,
      spreadRadius: 0,
    ),
  ];

  static final glowGold = [
    BoxShadow(
      color: AppColors.primary.withValues(alpha: 0.3),
      blurRadius: 30,
      spreadRadius: 0,
    ),
  ];

  static final card = [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.5),
      blurRadius: 20,
      offset: const Offset(0, 4),
    ),
  ];

  static final subtle = [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.3),
      blurRadius: 10,
      offset: const Offset(0, 2),
    ),
  ];
}
