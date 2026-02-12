import 'package:flutter/material.dart';

class AppTextStyles {
  // Inter - UI font
  static const _inter = 'Inter';
  // Orbitron - Display/heading font
  static const _orbitron = 'Orbitron';

  // Display (Orbitron)
  static const displayLarge = TextStyle(
    fontFamily: _orbitron,
    fontSize: 36,
    fontWeight: FontWeight.w800,
    letterSpacing: 1.2,
  );

  static const displayMedium = TextStyle(
    fontFamily: _orbitron,
    fontSize: 28,
    fontWeight: FontWeight.w700,
    letterSpacing: 1.0,
  );

  static const displaySmall = TextStyle(
    fontFamily: _orbitron,
    fontSize: 22,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.8,
  );

  // Headings (Orbitron)
  static const headlineLarge = TextStyle(
    fontFamily: _orbitron,
    fontSize: 20,
    fontWeight: FontWeight.w700,
  );

  static const headlineMedium = TextStyle(
    fontFamily: _orbitron,
    fontSize: 18,
    fontWeight: FontWeight.w600,
  );

  static const headlineSmall = TextStyle(
    fontFamily: _orbitron,
    fontSize: 16,
    fontWeight: FontWeight.w500,
  );

  // Title (Inter)
  static const titleLarge = TextStyle(
    fontFamily: _inter,
    fontSize: 18,
    fontWeight: FontWeight.w600,
  );

  static const titleMedium = TextStyle(
    fontFamily: _inter,
    fontSize: 16,
    fontWeight: FontWeight.w600,
  );

  static const titleSmall = TextStyle(
    fontFamily: _inter,
    fontSize: 14,
    fontWeight: FontWeight.w600,
  );

  // Body (Inter)
  static const bodyLarge = TextStyle(
    fontFamily: _inter,
    fontSize: 16,
    fontWeight: FontWeight.w400,
  );

  static const bodyMedium = TextStyle(
    fontFamily: _inter,
    fontSize: 14,
    fontWeight: FontWeight.w400,
  );

  static const bodySmall = TextStyle(
    fontFamily: _inter,
    fontSize: 12,
    fontWeight: FontWeight.w400,
  );

  // Label (Inter)
  static const labelLarge = TextStyle(
    fontFamily: _inter,
    fontSize: 14,
    fontWeight: FontWeight.w500,
  );

  static const labelMedium = TextStyle(
    fontFamily: _inter,
    fontSize: 12,
    fontWeight: FontWeight.w500,
  );

  static const labelSmall = TextStyle(
    fontFamily: _inter,
    fontSize: 10,
    fontWeight: FontWeight.w500,
  );
}
