import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/widgets/error_boundary.dart';
import 'features/auth/providers/auth_provider.dart';
import 'features/auth/providers/auth_state.dart';

class NeonplayApp extends ConsumerStatefulWidget {
  const NeonplayApp({super.key});

  @override
  ConsumerState<NeonplayApp> createState() => _NeonplayAppState();
}

class _NeonplayAppState extends ConsumerState<NeonplayApp> {
  GoRouter? _router;
  bool? _lastIsAuthenticated;

  @override
  void initState() {
    super.initState();
    // Initialize auth - checks for existing session
    Future.microtask(() {
      ref.read(authProvider.notifier).init();
    });
  }

  @override
  void dispose() {
    _router?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    final isLoading = authState.maybeMap(
      initial: (_) => true,
      loading: (_) => true,
      orElse: () => false,
    );

    // Show loading spinner only on initial app startup (before first router)
    if (isLoading && _router == null) {
      return _buildLoading();
    }

    final isAuthenticated = authState.maybeMap(
      authenticated: (_) => true,
      orElse: () => false,
    );

    // Only recreate router when auth status definitively changes.
    // During loading transitions, keep the existing router alive so
    // bottom sheets and modals are not torn down mid-flow.
    if (!isLoading && _lastIsAuthenticated != isAuthenticated) {
      _router?.dispose();
      _router = createAppRouter(isAuthenticated: isAuthenticated);
      _lastIsAuthenticated = isAuthenticated;
    }

    if (_router != null) {
      return ErrorBoundary(
        child: MaterialApp.router(
          title: 'PhiBet.io',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.dark,
          routerConfig: _router!,
        ),
      );
    }

    return _buildLoading();
  }

  Widget _buildLoading() {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: AppTheme.dark,
      home: const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      ),
    );
  }
}
