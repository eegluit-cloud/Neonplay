import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/utils/validators.dart';
import '../models/auth_models.dart';
import '../providers/auth_provider.dart';
import '../providers/auth_state.dart';
import '../widgets/password_strength_indicator.dart';
import '../widgets/social_login_buttons.dart';
import 'login_bottom_sheet.dart';

/// Full-screen registration page with mascot hero and multi-step form.
class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});

  static void show(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const RegisterPage()),
    );
  }

  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  int _step = 0; // 0: email, 1: username, 2: password
  final _emailCtrl = TextEditingController();
  final _usernameCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _referralCtrl = TextEditingController();
  bool _obscure = true;
  String? _error;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _usernameCtrl.dispose();
    _passwordCtrl.dispose();
    _referralCtrl.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _error = null;
      _step++;
    });
  }

  void _prevStep() {
    setState(() {
      _error = null;
      _step--;
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _error = null);

    final request = RegisterRequest(
      email: _emailCtrl.text.trim(),
      username: _usernameCtrl.text.trim(),
      password: _passwordCtrl.text,
      referralCode: _referralCtrl.text.trim().isNotEmpty
          ? _referralCtrl.text.trim()
          : null,
    );

    final notifier = ref.read(authProvider.notifier);
    await notifier.register(request);

    if (!mounted) return;

    ref.read(authProvider).mapOrNull(
      unauthenticated: (s) {
        if (s.error != null) {
          setState(() => _error = 'Registration failed. Please try again.');
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = ref.watch(authProvider).maybeMap(
      loading: (_) => true,
      orElse: () => false,
    );
    final topPad = MediaQuery.of(context).padding.top;
    final bottomPad = MediaQuery.of(context).padding.bottom;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Hero with mascot image
            _buildHero(topPad),

            // Form content
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 8),
                    ShaderMask(
                      shaderCallback: (bounds) => const LinearGradient(
                        colors: [AppColors.primary, AppColors.casinoOrange],
                      ).createShader(bounds),
                      child: const Text(
                        'Create Account',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Step ${_step + 1} of 3',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.mutedForeground,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),

                    // Progress bar
                    Row(
                      children: List.generate(3, (i) {
                        return Expanded(
                          child: Container(
                            height: 3,
                            margin: EdgeInsets.only(right: i < 2 ? 4 : 0),
                            decoration: BoxDecoration(
                              color: i <= _step
                                  ? AppColors.primary
                                  : AppColors.muted,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                        );
                      }),
                    ),
                    const SizedBox(height: 24),

                    if (_error != null) ...[
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.destructive.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color:
                                AppColors.destructive.withValues(alpha: 0.3),
                          ),
                        ),
                        child: Text(
                          _error!,
                          style: const TextStyle(
                            color: AppColors.destructive,
                            fontSize: 13,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Step content
                    if (_step == 0) _buildEmailStep(),
                    if (_step == 1) _buildUsernameStep(),
                    if (_step == 2) _buildPasswordStep(),
                    const SizedBox(height: 24),

                    // Navigation buttons
                    Row(
                      children: [
                        if (_step > 0) ...[
                          Expanded(
                            child: OutlinedButton(
                              onPressed: _prevStep,
                              style: OutlinedButton.styleFrom(
                                side:
                                    const BorderSide(color: AppColors.border),
                                padding:
                                    const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              child: const Text('Back'),
                            ),
                          ),
                          const SizedBox(width: 12),
                        ],
                        Expanded(
                          child: Container(
                            decoration: BoxDecoration(
                              gradient: AppGradients.gold,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: ElevatedButton(
                              onPressed: isLoading
                                  ? null
                                  : _step < 2
                                      ? _nextStep
                                      : _submit,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.transparent,
                                shadowColor: Colors.transparent,
                                disabledBackgroundColor: Colors.transparent,
                                padding:
                                    const EdgeInsets.symmetric(vertical: 14),
                              ),
                              child: isLoading
                                  ? const SizedBox(
                                      height: 20,
                                      width: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Colors.black,
                                      ),
                                    )
                                  : Text(
                                      _step < 2
                                          ? 'Continue'
                                          : 'Create Account',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w700,
                                        color: Colors.black,
                                      ),
                                    ),
                            ),
                          ),
                        ),
                      ],
                    ),

                    if (_step == 0) ...[
                      const SizedBox(height: 24),
                      const SocialLoginButtons(),
                    ],
                    const SizedBox(height: 24),

                    // Sign in link
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Already have an account? ',
                          style: TextStyle(
                            fontSize: 14,
                            color: AppColors.mutedForeground,
                          ),
                        ),
                        GestureDetector(
                          onTap: () =>
                              Navigator.of(context).pushReplacement(
                            MaterialPageRoute(
                              builder: (_) => const LoginPage(),
                            ),
                          ),
                          child: const Text(
                            'Sign In',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: AppColors.accent,
                            ),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: bottomPad + 24),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHero(double topPad) {
    return Column(
      children: [
        // Header bar — matches web "Welcome To PhiBet.io"
        Container(
          color: Colors.black,
          padding: EdgeInsets.only(
            top: topPad + 4,
            bottom: 12,
            left: 8,
            right: 16,
          ),
          child: Row(
            children: [
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.08),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.arrow_back_ios_new,
                    color: Colors.white,
                    size: 18,
                  ),
                ),
              ),
              const Spacer(),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Image.asset(
                    'assets/images/logos/phibet-logo.png',
                    height: 22,
                    errorBuilder: (_, _, _) => const SizedBox.shrink(),
                  ),
                  const SizedBox(width: 6),
                  ShaderMask(
                    shaderCallback: (bounds) =>
                        AppGradients.gold.createShader(bounds),
                    child: const Text(
                      'PhiBet.io',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        fontFamily: 'Orbitron',
                      ),
                    ),
                  ),
                ],
              ),
              const Spacer(),
              const SizedBox(width: 38), // balance the back button
            ],
          ),
        ),
        // Mascot image — fitWidth shows full image without side-cropping
        Stack(
          children: [
            Positioned.fill(
              child: const ColoredBox(color: Colors.black),
            ),
            Image.asset(
              'assets/images/characters/mascot.jpeg',
              width: double.infinity,
              height: 220,
              fit: BoxFit.fitWidth,
              alignment: Alignment.topCenter,
            ),
            // Bottom gradient into background
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [Colors.transparent, AppColors.background],
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildEmailStep() {
    return TextFormField(
      controller: _emailCtrl,
      keyboardType: TextInputType.emailAddress,
      textInputAction: TextInputAction.next,
      decoration: const InputDecoration(
        labelText: 'Email',
        prefixIcon: Icon(Icons.email_outlined),
      ),
      validator: Validators.email,
    );
  }

  Widget _buildUsernameStep() {
    return Column(
      children: [
        TextFormField(
          controller: _usernameCtrl,
          textInputAction: TextInputAction.next,
          decoration: const InputDecoration(
            labelText: 'Username',
            prefixIcon: Icon(Icons.person_outline),
            helperText: '3-30 characters, letters, numbers, underscores',
          ),
          validator: Validators.username,
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _referralCtrl,
          decoration: const InputDecoration(
            labelText: 'Referral Code (optional)',
            prefixIcon: Icon(Icons.card_giftcard),
          ),
        ),
      ],
    );
  }

  Widget _buildPasswordStep() {
    return Column(
      children: [
        TextFormField(
          controller: _passwordCtrl,
          obscureText: _obscure,
          textInputAction: TextInputAction.done,
          decoration: InputDecoration(
            labelText: 'Password',
            prefixIcon: const Icon(Icons.lock_outline),
            suffixIcon: IconButton(
              icon: Icon(
                _obscure ? Icons.visibility_off : Icons.visibility,
              ),
              onPressed: () => setState(() => _obscure = !_obscure),
            ),
            helperText: 'Min 8 chars with upper, lower, number, special',
          ),
          validator: Validators.password,
          onFieldSubmitted: (_) => _submit(),
        ),
        PasswordStrengthIndicator(password: _passwordCtrl.text),
      ],
    );
  }
}
