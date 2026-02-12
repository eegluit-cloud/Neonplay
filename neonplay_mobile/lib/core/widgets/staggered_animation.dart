import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

/// Wraps a child widget with a staggered fade-in + slide-up animation.
///
/// Use [index] to offset the delay for list items so they appear sequentially.
class StaggeredAnimation extends StatelessWidget {
  final Widget child;
  final int index;
  final Duration baseDelay;
  final Duration staggerDelay;
  final Duration duration;

  const StaggeredAnimation({
    super.key,
    required this.child,
    this.index = 0,
    this.baseDelay = Duration.zero,
    this.staggerDelay = const Duration(milliseconds: 50),
    this.duration = const Duration(milliseconds: 400),
  });

  @override
  Widget build(BuildContext context) {
    return child
        .animate()
        .fadeIn(
          duration: duration,
          delay: baseDelay + staggerDelay * index,
          curve: Curves.easeOut,
        )
        .slideY(
          begin: 0.05,
          end: 0,
          duration: duration,
          delay: baseDelay + staggerDelay * index,
          curve: Curves.easeOut,
        );
  }
}

/// Animated counting number for balances, jackpots, leaderboard scores, etc.
class AnimatedCounter extends StatelessWidget {
  final double value;
  final String prefix;
  final String suffix;
  final int decimals;
  final TextStyle? style;
  final Duration duration;

  const AnimatedCounter({
    super.key,
    required this.value,
    this.prefix = '',
    this.suffix = '',
    this.decimals = 2,
    this.style,
    this.duration = const Duration(milliseconds: 800),
  });

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: value),
      duration: duration,
      curve: Curves.easeOut,
      builder: (_, animatedValue, _) {
        return Text(
          '$prefix${animatedValue.toStringAsFixed(decimals)}$suffix',
          style: style,
        );
      },
    );
  }
}
