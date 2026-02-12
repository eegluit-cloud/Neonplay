import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../auth/models/user_model.dart';
import '../../../auth/providers/auth_provider.dart';
import '../../providers/profile_provider.dart';

/// Profile edit tab with user details form.
class ProfileEditTab extends ConsumerStatefulWidget {
  const ProfileEditTab({super.key});

  @override
  ConsumerState<ProfileEditTab> createState() => _ProfileEditTabState();
}

class _ProfileEditTabState extends ConsumerState<ProfileEditTab> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _firstNameCtrl;
  late TextEditingController _lastNameCtrl;
  late TextEditingController _phoneCtrl;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _firstNameCtrl = TextEditingController();
    _lastNameCtrl = TextEditingController();
    _phoneCtrl = TextEditingController();
  }

  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  void _populateFields(UserModel user) {
    if (_firstNameCtrl.text.isEmpty) {
      _firstNameCtrl.text = user.firstName ?? '';
    }
    if (_lastNameCtrl.text.isEmpty) {
      _lastNameCtrl.text = user.lastName ?? '';
    }
    if (_phoneCtrl.text.isEmpty) {
      _phoneCtrl.text = user.phone ?? '';
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);
    try {
      final repo = ref.read(profileRepositoryProvider);
      await repo.updateProfile({
        'firstName': _firstNameCtrl.text.trim(),
        'lastName': _lastNameCtrl.text.trim(),
        'phone': _phoneCtrl.text.trim(),
      });
      await ref.read(authProvider.notifier).refreshUser();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile updated'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to update profile'),
            backgroundColor: AppColors.destructive,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    if (user != null) _populateFields(user);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Email (readonly)
            _buildLabel('Email'),
            _buildReadonlyField(user?.email ?? ''),
            const SizedBox(height: 16),

            // Username (readonly)
            _buildLabel('Username'),
            _buildReadonlyField(user?.username ?? ''),
            const SizedBox(height: 16),

            // First name
            _buildLabel('First Name'),
            TextFormField(
              controller: _firstNameCtrl,
              style: const TextStyle(color: AppColors.foreground),
              decoration: _inputDecoration('Enter first name'),
            ),
            const SizedBox(height: 16),

            // Last name
            _buildLabel('Last Name'),
            TextFormField(
              controller: _lastNameCtrl,
              style: const TextStyle(color: AppColors.foreground),
              decoration: _inputDecoration('Enter last name'),
            ),
            const SizedBox(height: 16),

            // Phone
            _buildLabel('Phone'),
            TextFormField(
              controller: _phoneCtrl,
              style: const TextStyle(color: AppColors.foreground),
              keyboardType: TextInputType.phone,
              decoration: _inputDecoration('Enter phone number'),
            ),
            const SizedBox(height: 24),

            // Save button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isSaving ? null : _save,
                child: _isSaving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Save Changes'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: AppColors.mutedForeground,
        ),
      ),
    );
  }

  Widget _buildReadonlyField(String value) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.muted,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Text(
        value,
        style: const TextStyle(color: AppColors.mutedForeground, fontSize: 14),
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: AppColors.mutedForeground),
      filled: true,
      fillColor: AppColors.card,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.primary),
      ),
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
    );
  }
}
