import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'app_header.dart';
import 'app_sidebar.dart';
import 'mobile_bottom_nav.dart';

/// Shell scaffold wrapping all protected routes.
/// Provides header, sidebar drawer, bottom nav, and support FAB.
class AppScaffold extends StatelessWidget {
  final Widget child;

  const AppScaffold({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;

    return Scaffold(
      appBar: const AppHeader(),
      drawer: const AppSidebar(),
      body: child,
      bottomNavigationBar: MobileBottomNav(currentLocation: location),
    );
  }
}
