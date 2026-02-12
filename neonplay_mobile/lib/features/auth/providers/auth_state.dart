import 'package:freezed_annotation/freezed_annotation.dart';
import '../models/user_model.dart';
import '../models/wallet_model.dart';

part 'auth_state.freezed.dart';

@freezed
abstract class AuthState with _$AuthState {
  const factory AuthState.initial() = _Initial;
  const factory AuthState.loading() = _Loading;
  const factory AuthState.authenticated({
    required UserModel user,
    WalletModel? wallet,
  }) = _Authenticated;
  const factory AuthState.unauthenticated([String? error]) = _Unauthenticated;
}
