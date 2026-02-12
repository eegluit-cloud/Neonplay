import 'dart:async';
import 'dart:math';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import 'login_bottom_sheet.dart';
import 'register_bottom_sheet.dart';

/// Landing screen for unauthenticated users.
class RegisterScreen extends StatelessWidget {
  const RegisterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _HeroSection(
              onCreateAccount: () => RegisterPage.show(context),
              onSignIn: () => LoginPage.show(context),
            ),

            // Features section overlaps hero bottom
            Transform.translate(
              offset: const Offset(0, -16),
              child: _FeaturesSection(),
            ),

            _FooterLinks(),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Hero: Full-bleed casino image + spinning roulette + headline + auth buttons
// ---------------------------------------------------------------------------
class _HeroSection extends StatefulWidget {
  final VoidCallback onCreateAccount;
  final VoidCallback onSignIn;

  const _HeroSection({
    required this.onCreateAccount,
    required this.onSignIn,
  });

  @override
  State<_HeroSection> createState() => _HeroSectionState();
}

class _HeroSectionState extends State<_HeroSection>
    with TickerProviderStateMixin {
  late final AnimationController _logoFloatController;
  late final AnimationController _rouletteSpinController;
  int _leftIndex = 0;
  int _rightIndex = 1;
  Timer? _timer;

  static const _wins = [
    ('Phoenix Baker', 'just won', '\$2,500', 'https://randomuser.me/api/portraits/men/32.jpg'),
    ('Jessica Lee', 'won on roulette', '\$8,700', 'https://randomuser.me/api/portraits/women/44.jpg'),
    ('Sarah Miller', 'claimed a bonus of', '\$1,200', 'https://randomuser.me/api/portraits/women/33.jpg'),
    ('Marcus Johnson', 'hit the jackpot!', '\$15,000', 'https://randomuser.me/api/portraits/men/22.jpg'),
    ('Emily Davis', 'won big on slots', '\$3,200', 'https://randomuser.me/api/portraits/women/35.jpg'),
    ('David Kim', 'earned rewards of', '\$1,800', 'https://randomuser.me/api/portraits/men/52.jpg'),
    ('Daniel Garcia', 'scored big on blackjack', '\$4,200', 'https://randomuser.me/api/portraits/men/19.jpg'),
    ('Emma Thompson', 'earned weekly bonus of', '\$3,500', 'https://randomuser.me/api/portraits/women/62.jpg'),
    ('Amanda Torres', 'just cashed out', '\$5,600', 'https://randomuser.me/api/portraits/women/28.jpg'),
    ('James Wilson', 'hit a mega win!', '\$22,000', 'https://randomuser.me/api/portraits/men/67.jpg'),
  ];

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (!mounted) return;
      setState(() {
        _leftIndex = (_leftIndex + 2) % _wins.length;
        _rightIndex = (_rightIndex + 2) % _wins.length;
      });
    });

    _logoFloatController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);

    _rouletteSpinController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    )..repeat();
  }

  @override
  void dispose() {
    _logoFloatController.dispose();
    _rouletteSpinController.dispose();
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final topPadding = MediaQuery.of(context).padding.top;
    final rouletteSize = screenWidth * 0.40;
    // Banner starts right below the PhiBet.io header
    final bannerTop = topPadding + 48;
    final bannerHeight = screenWidth * 0.50;

    return Stack(
      children: [
        // LAYER 1: Black base
        Positioned.fill(
          child: const ColoredBox(color: Colors.black),
        ),

        // LAYER 2: Casino banner — fitWidth shows the full panoramic scene
        // (characters edge-to-edge) starting right below the PhiBet.io header
        Positioned(
          top: bannerTop,
          left: 0,
          right: 0,
          height: bannerHeight,
          child: ShaderMask(
            shaderCallback: (bounds) => const LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Colors.white, Colors.white, Colors.transparent],
              stops: [0.0, 0.50, 0.90],
            ).createShader(bounds),
            blendMode: BlendMode.dstIn,
            child: Image.asset(
              'assets/images/banners/casino-hero-bg-v2.png',
              fit: BoxFit.fitWidth,
              alignment: Alignment.topCenter,
              width: screenWidth,
            ),
          ),
        ),

        // LAYER 3: Light overlay — characters stay vivid
        Positioned.fill(
          child: ColoredBox(color: Colors.black.withValues(alpha: 0.15)),
        ),

        // LAYER 4: Bottom gradient into app background
        Positioned(
          left: 0,
          right: 0,
          bottom: 0,
          height: 200,
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.transparent,
                  AppColors.background.withValues(alpha: 0.3),
                  AppColors.background.withValues(alpha: 0.7),
                  AppColors.background,
                ],
                stops: const [0.0, 0.3, 0.6, 1.0],
              ),
            ),
          ),
        ),

        // LAYER 5: Content column (drives Stack height)
        Column(
          children: [
            SizedBox(height: topPadding + 12),
            _buildFloatingLogo(),
            const SizedBox(height: 16),
            _buildRouletteWheel(rouletteSize),
            Transform.translate(
              offset: Offset(0, -rouletteSize * 0.25),
              child: _buildHeadlineAndButtons(),
            ),
          ],
        ),

        // LAYER 6: Floating win cards — in the character zone beside roulette
        Positioned(
          left: 8,
          top: bannerTop + 4,
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 700),
            transitionBuilder: (child, animation) => FadeTransition(
              opacity: animation,
              child: SlideTransition(
                position: Tween<Offset>(
                  begin: const Offset(-0.15, 0),
                  end: Offset.zero,
                ).animate(animation),
                child: child,
              ),
            ),
            child: _WinCard(
              key: ValueKey('l$_leftIndex'),
              name: _wins[_leftIndex].$1,
              action: _wins[_leftIndex].$2,
              amount: _wins[_leftIndex].$3,
              avatarUrl: _wins[_leftIndex].$4,
            ),
          ),
        ),

        Positioned(
          right: 8,
          top: bannerTop + 72,
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 700),
            transitionBuilder: (child, animation) => FadeTransition(
              opacity: animation,
              child: SlideTransition(
                position: Tween<Offset>(
                  begin: const Offset(0.15, 0),
                  end: Offset.zero,
                ).animate(animation),
                child: child,
              ),
            ),
            child: _WinCard(
              key: ValueKey('r$_rightIndex'),
              name: _wins[_rightIndex].$1,
              action: _wins[_rightIndex].$2,
              amount: _wins[_rightIndex].$3,
              avatarUrl: _wins[_rightIndex].$4,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFloatingLogo() {
    return AnimatedBuilder(
      animation: _logoFloatController,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(
            0,
            -10 *
                CurvedAnimation(
                  parent: _logoFloatController,
                  curve: Curves.easeInOut,
                ).value,
          ),
          child: child,
        );
      },
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Image.asset(
            'assets/images/logos/phibet-logo.png',
            height: 28,
            errorBuilder: (_, _, _) => const SizedBox.shrink(),
          ),
          const SizedBox(width: 8),
          ShaderMask(
            shaderCallback: (bounds) =>
                AppGradients.gold.createShader(bounds),
            child: const Text(
              'PhiBet.io',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: Colors.white,
                fontFamily: 'Orbitron',
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRouletteWheel(double size) {
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Spinning roulette image
          Positioned.fill(
            child: AnimatedBuilder(
              animation: _rouletteSpinController,
              builder: (context, child) {
                return Transform.rotate(
                  angle: _rouletteSpinController.value * 2 * pi,
                  child: child,
                );
              },
              child: Image.asset(
                'assets/images/ui/roulette-wheel-new.png',
                fit: BoxFit.contain,
              ),
            ),
          ),

          // Gentle vertical fade — keeps top 50% fully visible (numbers stay readable)
          Positioned.fill(
            child: IgnorePointer(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      Colors.transparent,
                      Colors.black.withValues(alpha: 0.15),
                      Colors.black.withValues(alpha: 0.4),
                      Colors.black.withValues(alpha: 0.75),
                      Colors.black,
                    ],
                    stops: const [0.0, 0.35, 0.50, 0.60, 0.75, 0.90],
                  ),
                ),
              ),
            ),
          ),

          // Soft radial fade at bottom center
          Positioned.fill(
            child: IgnorePointer(
              child: CustomPaint(
                painter: const _BottomRadialGradientPainter(),
              ),
            ),
          ),

          // Bottom reinforcement — narrower to avoid washing out the wheel
          Positioned(
            bottom: -16,
            left: -size * 0.5,
            width: size * 2.0,
            height: 120,
            child: IgnorePointer(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [
                      Colors.black,
                      Colors.black.withValues(alpha: 0.5),
                      Colors.transparent,
                    ],
                    stops: const [0.0, 0.40, 1.0],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeadlineAndButtons() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          // Headline: "Social Casino #1 in Asia"
          RichText(
            textAlign: TextAlign.center,
            text: TextSpan(
              children: [
                const TextSpan(
                  text: 'Social Casino ',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    color: AppColors.foreground,
                    fontFamily: 'Orbitron',
                    height: 1.2,
                  ),
                ),
                TextSpan(
                  text: '#1 in Asia',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    fontFamily: 'Orbitron',
                    height: 1.2,
                    foreground: Paint()
                      ..shader = const LinearGradient(
                        colors: [
                          Color(0xFF22D3EE), // cyan-400
                          Color(0xFF60A5FA), // blue-400
                          Color(0xFFC084FC), // purple-400
                        ],
                      ).createShader(const Rect.fromLTWH(0, 0, 250, 36)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Subtitle
          Text(
            'Millions in prizes waiting your big win could be just one spin away.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: AppColors.mutedForeground,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 24),

          // Create Account — gold gradient, full-width
          SizedBox(
            width: double.infinity,
            child: Container(
              decoration: BoxDecoration(
                gradient: AppGradients.gold,
                borderRadius: BorderRadius.circular(12),
              ),
              child: ElevatedButton(
                onPressed: widget.onCreateAccount,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: const Text(
                  'Create Account',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: Colors.black,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Sign In — cyan outlined, full-width
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: widget.onSignIn,
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.accent),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'Sign In',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: AppColors.accent,
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

/// Radial gradient at the bottom center of the roulette wheel.
class _BottomRadialGradientPainter extends CustomPainter {
  const _BottomRadialGradientPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Rect.fromLTWH(
      -size.width * 0.5,
      size.height * 0.88,
      size.width * 2.0,
      size.height * 0.24,
    );
    final gradient = RadialGradient(
      center: Alignment.center,
      radius: 1.0,
      colors: [Colors.black, Colors.transparent],
      stops: const [0.0, 0.35],
    );
    final paint = Paint()
      ..shader = gradient.createShader(rect);
    canvas.drawOval(rect, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Floating win notification card — compact for mobile.
class _WinCard extends StatelessWidget {
  final String name;
  final String action;
  final String amount;
  final String avatarUrl;

  const _WinCard({
    super.key,
    required this.name,
    required this.action,
    required this.amount,
    required this.avatarUrl,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      constraints: const BoxConstraints(maxWidth: 210),
      decoration: BoxDecoration(
        color: const Color(0xFF0C0C0C).withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.accent.withValues(alpha: 0.25),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: AppColors.accent.withValues(alpha: 0.5),
                width: 1.5,
              ),
            ),
            child: ClipOval(
              child: CachedNetworkImage(
                imageUrl: avatarUrl,
                fit: BoxFit.cover,
                placeholder: (_, _) => _AvatarFallback(letter: name[0]),
                errorWidget: (_, _, _) => _AvatarFallback(letter: name[0]),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Flexible(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.foreground,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  action,
                  style: TextStyle(
                    fontSize: 9,
                    color: AppColors.mutedForeground,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 1),
                Text(
                  amount,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.accent,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _AvatarFallback extends StatelessWidget {
  final String letter;
  const _AvatarFallback({required this.letter});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.muted,
      child: Center(
        child: Text(
          letter,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: AppColors.foreground,
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Feature cards
// ---------------------------------------------------------------------------
class _FeaturesSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          _FeatureCard(
            icon: Icons.casino,
            title: '5,000+ Games',
            description: 'Slots, table games, live casino, and more',
            color: AppColors.casinoPurple,
          ),
          const SizedBox(height: 12),
          _FeatureCard(
            icon: Icons.sports_soccer,
            title: 'Live Sports',
            description: 'Bet on soccer, basketball, tennis, and esports',
            color: AppColors.casinoBlue,
          ),
          const SizedBox(height: 12),
          _FeatureCard(
            icon: Icons.bolt,
            title: 'Instant Payouts',
            description: 'Crypto and fiat withdrawals in minutes',
            color: AppColors.accent,
          ),
          const SizedBox(height: 12),
          _FeatureCard(
            icon: Icons.shield_outlined,
            title: 'Provably Fair',
            description: 'Transparent and verifiable game outcomes',
            color: AppColors.primary,
          ),
        ],
      ),
    );
  }
}

class _FeatureCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final Color color;

  const _FeatureCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.foreground,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  description,
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.mutedForeground,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
class _FooterLinks extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          Wrap(
            alignment: WrapAlignment.center,
            spacing: 16,
            runSpacing: 8,
            children: [
              _footerLink(context, 'Terms', '/terms'),
              _footerLink(context, 'Privacy', '/privacy'),
              _footerLink(context, 'Responsible Gambling', '/responsible-gambling'),
              _footerLink(context, 'FAQ', '/faq'),
              _footerLink(context, 'Provably Fair', '/provably-fair'),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            '\u00a9 2026 PhiBet.io. All rights reserved.',
            style: TextStyle(
              fontSize: 12,
              color: AppColors.mutedForeground,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _footerLink(BuildContext context, String label, String route) {
    return GestureDetector(
      onTap: () => context.go(route),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 13,
          color: AppColors.mutedForeground,
          decoration: TextDecoration.underline,
        ),
      ),
    );
  }
}
