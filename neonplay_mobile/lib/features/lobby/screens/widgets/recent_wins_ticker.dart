import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../activity/models/activity_models.dart';
import '../../../activity/providers/activity_provider.dart';

/// Horizontal auto-scrolling ticker showing recent big wins.
/// Matches the web app's RecentWins.tsx: compact vertical cards with
/// portrait game image on top, username and green dollar amount below.
class RecentWinsTicker extends ConsumerStatefulWidget {
  const RecentWinsTicker({super.key});

  @override
  ConsumerState<RecentWinsTicker> createState() => _RecentWinsTickerState();
}

class _RecentWinsTickerState extends ConsumerState<RecentWinsTicker> {
  final ScrollController _scrollController = ScrollController();
  Timer? _scrollTimer;

  @override
  void dispose() {
    _scrollTimer?.cancel();
    _scrollController.dispose();
    super.dispose();
  }

  void _startAutoScroll() {
    _scrollTimer?.cancel();
    _scrollTimer = Timer.periodic(const Duration(milliseconds: 30), (_) {
      if (!mounted || !_scrollController.hasClients) return;
      final maxScroll = _scrollController.position.maxScrollExtent;
      final current = _scrollController.offset;
      if (current >= maxScroll) {
        _scrollController.jumpTo(0);
      } else {
        _scrollController.jumpTo(current + 0.5);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final winsAsync = ref.watch(recentWinsProvider);

    return winsAsync.when(
      data: (wins) {
        if (wins.isEmpty) return const SizedBox.shrink();
        // Triple list for seamless loop (matches web app)
        final loopedWins = [...wins, ...wins, ...wins];
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _startAutoScroll();
        });
        return _buildTicker(loopedWins);
      },
      loading: () => const SizedBox(height: 100),
      error: (_, _) => const SizedBox.shrink(),
    );
  }

  Widget _buildTicker(List<RecentWin> wins) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header with pulsing dot (matches web app)
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              // Pulsing amber dot
              SizedBox(
                width: 16,
                height: 16,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                    ),
                    _PulsingDot(color: AppColors.primary),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'Recent Big Wins',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.foreground,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        // Scrolling cards
        SizedBox(
          height: 104,
          child: ListView.separated(
            controller: _scrollController,
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: wins.length,
            separatorBuilder: (_, _) => const SizedBox(width: 6),
            itemBuilder: (_, index) => _buildWinCard(wins[index]),
          ),
        ),
      ],
    );
  }

  /// Vertical card matching web app: 56px wide, portrait image, text below.
  Widget _buildWinCard(RecentWin win) {
    return SizedBox(
      width: 56,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Game image – aspect ratio 56:75 (matches web app)
          Container(
            width: 56,
            height: 75,
            decoration: BoxDecoration(
              color: AppColors.muted,
              borderRadius: BorderRadius.circular(8),
            ),
            clipBehavior: Clip.antiAlias,
            child: win.gameImage != null
                ? Image.asset(
                    win.gameImage!,
                    fit: BoxFit.cover,
                    errorBuilder: (_, _, _) => const Icon(
                      Icons.casino,
                      color: AppColors.primary,
                      size: 20,
                    ),
                  )
                : const Icon(
                    Icons.casino,
                    color: AppColors.primary,
                    size: 20,
                  ),
          ),
          const SizedBox(height: 2),
          // Username
          Text(
            win.username,
            style: const TextStyle(
              fontSize: 9,
              color: AppColors.mutedForeground,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
          ),
          // Amount in green
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.attach_money, size: 10, color: Color(0xFF4ADE80)),
              Text(
                _formatAmount(win.amount),
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF4ADE80), // green-400
                  letterSpacing: 0.3,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatAmount(double amount) {
    if (amount >= 1000000) {
      return '${(amount / 1000000).toStringAsFixed(1)}M';
    } else if (amount >= 1000) {
      return '${(amount / 1000).toStringAsFixed(1)}K';
    }
    return amount.toStringAsFixed(0);
  }
}

/// Animated pulsing dot for the "Recent Big Wins" header.
class _PulsingDot extends StatefulWidget {
  final Color color;
  const _PulsingDot({required this.color});

  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (_, _) {
        final t = _controller.value;
        return Container(
          width: 10 + (6 * t),
          height: 10 + (6 * t),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: widget.color.withValues(alpha: 0.3 * (1 - t)),
          ),
        );
      },
    );
  }
}
