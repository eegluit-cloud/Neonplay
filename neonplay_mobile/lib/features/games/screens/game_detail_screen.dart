import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../../../core/theme/app_colors.dart';
import '../providers/games_provider.dart';

/// Game detail screen with WebView launcher.
class GameDetailScreen extends ConsumerStatefulWidget {
  final String gameId;

  const GameDetailScreen({super.key, required this.gameId});

  @override
  ConsumerState<GameDetailScreen> createState() => _GameDetailScreenState();
}

class _GameDetailScreenState extends ConsumerState<GameDetailScreen> {
  WebViewController? _webViewController;
  bool _isPlaying = false;
  bool _isLoading = false;
  bool _isFullscreen = false;

  Future<void> _launchGame() async {
    setState(() => _isLoading = true);

    try {
      final repo = ref.read(gamesRepositoryProvider);
      final launch = await repo.launchGame(widget.gameId);

      final controller = WebViewController()
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..setNavigationDelegate(NavigationDelegate(
          onPageFinished: (_) => setState(() => _isLoading = false),
        ))
        ..loadRequest(Uri.parse(launch.url));

      setState(() {
        _webViewController = controller;
        _isPlaying = true;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to launch game')),
        );
      }
    }
  }

  void _toggleFullscreen() {
    setState(() => _isFullscreen = !_isFullscreen);
    if (_isFullscreen) {
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
      SystemChrome.setPreferredOrientations([
        DeviceOrientation.landscapeLeft,
        DeviceOrientation.landscapeRight,
      ]);
    } else {
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
      SystemChrome.setPreferredOrientations([
        DeviceOrientation.portraitUp,
        DeviceOrientation.portraitDown,
      ]);
    }
  }

  Future<bool> _onWillPop() async {
    if (_isFullscreen) {
      _toggleFullscreen();
      return false;
    }
    if (_isPlaying) {
      final shouldExit = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Exit Game?'),
          content: const Text('Are you sure you want to leave the game?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Stay'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Exit'),
            ),
          ],
        ),
      );
      if (shouldExit == true) {
        setState(() {
          _isPlaying = false;
          _webViewController = null;
        });
      }
      return false;
    }
    return true;
  }

  @override
  void dispose() {
    // Reset orientation when leaving
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !_isPlaying && !_isFullscreen,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _onWillPop();
      },
      child: Scaffold(
        appBar: _isPlaying && _isFullscreen
            ? null
            : AppBar(
                title: Text(widget.gameId),
                actions: [
                  if (_isPlaying)
                    IconButton(
                      icon: Icon(_isFullscreen
                          ? Icons.fullscreen_exit
                          : Icons.fullscreen),
                      onPressed: _toggleFullscreen,
                    ),
                ],
              ),
        body: _isPlaying
            ? Stack(
                children: [
                  if (_webViewController != null)
                    WebViewWidget(controller: _webViewController!),
                  if (_isLoading)
                    const Center(child: CircularProgressIndicator()),
                ],
              )
            : _buildGameInfo(),
      ),
    );
  }

  Widget _buildGameInfo() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.casino, size: 64, color: AppColors.primary),
          const SizedBox(height: 24),
          Text(
            widget.gameId,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: AppColors.foreground,
            ),
          ),
          const SizedBox(height: 32),
          ElevatedButton.icon(
            onPressed: _isLoading ? null : _launchGame,
            icon: _isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.play_arrow),
            label: Text(_isLoading ? 'Loading...' : 'Play Now'),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(200, 56),
            ),
          ),
        ],
      ),
    );
  }
}
