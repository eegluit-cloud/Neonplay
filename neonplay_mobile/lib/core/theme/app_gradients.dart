import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppGradients {
  static const primary = LinearGradient(
    colors: [AppColors.casinoGold, AppColors.casinoOrange],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Cyan accent gradient for secondary highlights.
  static const accent = LinearGradient(
    colors: [AppColors.accent, AppColors.casinoBlue],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const gold = LinearGradient(
    colors: [AppColors.casinoGold, AppColors.casinoOrange],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const vip = LinearGradient(
    colors: [AppColors.casinoPurple, AppColors.casinoPink],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const card = LinearGradient(
    colors: [Color(0xFF1A1E2A), Color(0xFF10131A)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const hero = LinearGradient(
    colors: [Color(0xFF0F1118), AppColors.background],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const destructive = LinearGradient(
    colors: [AppColors.destructive, Color(0xFFDC2626)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
