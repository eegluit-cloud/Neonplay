import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';

/// KYC document upload tab (placeholder - not yet implemented in backend).
class KycTab extends StatelessWidget {
  const KycTab({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.verified_user, size: 64, color: AppColors.primary),
            SizedBox(height: 20),
            Text(
              'Identity Verification',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppColors.foreground,
              ),
            ),
            SizedBox(height: 12),
            Text(
              'Document verification is coming soon. You will be able to upload your ID and proof of address for account verification.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: AppColors.mutedForeground,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
