import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../config/app_config.dart';
import '../storage/token_manager.dart';

/// Manages Socket.IO connections for real-time events.
/// Backend supports: wallet, notifications, jackpot, leaderboard, activity.
class SocketManager {
  final TokenManager _tokenManager;
  io.Socket? _socket;
  final _controllers = <String, StreamController<dynamic>>{};

  SocketManager(this._tokenManager);

  /// Connect to the main namespace with JWT auth.
  void connect() {
    final token = _tokenManager.getAccessToken();
    if (token == null) return;

    _socket = io.io(
      AppConfig.wsBaseUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .enableAutoConnect()
          .enableReconnection()
          .setReconnectionDelay(1000)
          .setReconnectionAttempts(10)
          .build(),
    );

    _socket!.onConnect((_) {
      _emit('connection_status', 'connected');
    });

    _socket!.onDisconnect((_) {
      _emit('connection_status', 'disconnected');
    });

    // Main namespace events
    _listen('wallet:balance_updated');
    _listen('leaderboard:updated');
    _listen('notification:new');
    _listen('activity:new_big_win');
    _listen('jackpot:updated');
    _listen('jackpot:won');
    _listen('jackpot:value');
    _listen('jackpot:you_won');
    _listen('jackpot:near_miss');
    _listen('jackpot:milestone');
    _listen('jackpot:recent_wins');
    _listen('transaction_completed');
  }

  void _listen(String event) {
    _socket?.on(event, (data) => _emit(event, data));
  }

  void _emit(String event, dynamic data) {
    if (!_controllers.containsKey(event)) {
      _controllers[event] = StreamController<dynamic>.broadcast();
    }
    _controllers[event]!.add(data);
  }

  /// Get a stream for a specific event.
  Stream<dynamic> on(String event) {
    if (!_controllers.containsKey(event)) {
      _controllers[event] = StreamController<dynamic>.broadcast();
    }
    return _controllers[event]!.stream;
  }

  /// Re-authenticate after token refresh.
  void updateAuth() {
    final token = _tokenManager.getAccessToken();
    if (token != null && _socket != null) {
      _socket!.auth = {'token': token};
      _socket!.disconnect().connect();
    }
  }

  /// Disconnect and clean up.
  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }

  void dispose() {
    disconnect();
    for (final controller in _controllers.values) {
      controller.close();
    }
    _controllers.clear();
  }
}
