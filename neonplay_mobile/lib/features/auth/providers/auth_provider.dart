import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';
import '../../../core/network/socket_manager.dart';
import '../../../core/storage/token_manager.dart';
import '../models/auth_models.dart';
import '../models/wallet_model.dart';
import '../models/user_model.dart';
import '../repository/auth_repository.dart';
import 'auth_state.dart';

/// Core singleton instances.
final tokenManagerProvider = Provider<TokenManager>((_) => TokenManager());

final dioClientProvider = Provider<DioClient>((ref) {
  return DioClient(ref.read(tokenManagerProvider));
});

final socketManagerProvider = Provider<SocketManager>((ref) {
  return SocketManager(ref.read(tokenManagerProvider));
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ref.read(dioClientProvider));
});

/// Auth state notifier - manages authentication lifecycle.
class AuthNotifier extends Notifier<AuthState> {
  late final TokenManager _tokenManager;
  late final AuthRepository _authRepository;
  late final SocketManager _socketManager;

  @override
  AuthState build() {
    _tokenManager = ref.read(tokenManagerProvider);
    _authRepository = ref.read(authRepositoryProvider);
    _socketManager = ref.read(socketManagerProvider);
    return const AuthState.initial();
  }

  /// Initialize auth on app start.
  /// Uses a 5-second timeout so the app never stays stuck on loading.
  Future<void> init() async {
    state = const AuthState.loading();

    try {
      await _initSession().timeout(const Duration(seconds: 5));
    } catch (_) {
      // Timeout or any error → go to unauthenticated
      try {
        await _tokenManager.clearTokens();
      } catch (_) {}
      state = const AuthState.unauthenticated();
    }
  }

  Future<void> _initSession() async {
    final hasSession = await _tokenManager.hasSession();
    if (!hasSession) {
      state = const AuthState.unauthenticated();
      return;
    }

    final refreshToken = await _tokenManager.getRefreshToken();
    if (refreshToken == null) {
      state = const AuthState.unauthenticated();
      return;
    }

    final tokens = await _authRepository.refreshTokens(refreshToken);
    await _tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);

    final user = await _authRepository.getProfile();

    WalletModel? wallet;
    try {
      wallet = await _authRepository.getWallet();
    } catch (_) {}

    _socketManager.connect();

    state = AuthState.authenticated(user: user, wallet: wallet);
  }

  /// Login with email/username and password.
  Future<void> login(String email, String password) async {
    state = const AuthState.loading();

    try {
      final tokens = await _authRepository.login(
        LoginRequest(email: email, password: password),
      );
      await _tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);

      final user = await _authRepository.getProfile();

      WalletModel? wallet;
      try {
        wallet = await _authRepository.getWallet();
      } catch (_) {}

      _socketManager.connect();

      state = AuthState.authenticated(user: user, wallet: wallet);
    } catch (e) {
      state = AuthState.unauthenticated(e.toString());
    }
  }

  /// Register a new account.
  Future<void> register(RegisterRequest request) async {
    state = const AuthState.loading();

    try {
      final tokens = await _authRepository.register(request);
      await _tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);

      final user = await _authRepository.getProfile();

      WalletModel? wallet;
      try {
        wallet = await _authRepository.getWallet();
      } catch (_) {}

      _socketManager.connect();

      state = AuthState.authenticated(user: user, wallet: wallet);
    } catch (e) {
      state = AuthState.unauthenticated(e.toString());
    }
  }

  /// Logout and clear all tokens.
  Future<void> logout() async {
    final refreshToken = await _tokenManager.getRefreshToken();
    await _tokenManager.clearTokens();
    _socketManager.disconnect();
    state = const AuthState.unauthenticated();

    if (refreshToken != null) {
      try {
        await _authRepository.logout(refreshToken);
      } catch (_) {}
    }
  }

  /// Refresh user profile data.
  Future<void> refreshUser() async {
    try {
      final user = await _authRepository.getProfile();
      state.mapOrNull(
        authenticated: (s) {
          state = s.copyWith(user: user);
        },
      );
    } catch (_) {}
  }

  /// Refresh wallet data.
  Future<void> refreshWallet() async {
    try {
      final wallet = await _authRepository.getWallet();
      state.mapOrNull(
        authenticated: (s) {
          state = s.copyWith(wallet: wallet);
        },
      );
    } catch (_) {}
  }
}

/// The main auth provider.
final authProvider = NotifierProvider<AuthNotifier, AuthState>(
  AuthNotifier.new,
);

/// Convenience providers.
final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).maybeMap(
        authenticated: (_) => true,
        orElse: () => false,
      );
});

final currentUserProvider = Provider<UserModel?>((ref) {
  return ref.watch(authProvider).mapOrNull(
        authenticated: (s) => s.user,
      );
});

final currentWalletProvider = Provider<WalletModel?>((ref) {
  return ref.watch(authProvider).mapOrNull(
        authenticated: (s) => s.wallet,
      );
});
