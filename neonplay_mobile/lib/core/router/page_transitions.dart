import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Custom fade transition page for GoRouter routes.
CustomTransitionPage<void> fadeTransitionPage({
  required Widget child,
  required GoRouterState state,
  Duration duration = const Duration(milliseconds: 250),
}) {
  return CustomTransitionPage<void>(
    key: state.pageKey,
    child: child,
    transitionDuration: duration,
    transitionsBuilder: (_, animation, _, child) {
      return FadeTransition(opacity: animation, child: child);
    },
  );
}

/// Custom slide-up transition for bottom sheets / detail pages.
CustomTransitionPage<void> slideUpTransitionPage({
  required Widget child,
  required GoRouterState state,
  Duration duration = const Duration(milliseconds: 300),
}) {
  return CustomTransitionPage<void>(
    key: state.pageKey,
    child: child,
    transitionDuration: duration,
    transitionsBuilder: (_, animation, _, child) {
      final tween = Tween(begin: const Offset(0, 0.1), end: Offset.zero)
          .chain(CurveTween(curve: Curves.easeOut));
      return SlideTransition(
        position: animation.drive(tween),
        child: FadeTransition(opacity: animation, child: child),
      );
    },
  );
}
