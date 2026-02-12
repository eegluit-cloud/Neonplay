import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';

/// Team logo with fallback to initials.
class TeamLogo extends StatelessWidget {
  final String teamName;
  final String? logoUrl;
  final double size;

  const TeamLogo({
    super.key,
    required this.teamName,
    this.logoUrl,
    this.size = 32,
  });

  @override
  Widget build(BuildContext context) {
    if (logoUrl != null && logoUrl!.isNotEmpty) {
      // Local asset path (e.g. assets/images/teams/...)
      if (logoUrl!.startsWith('assets/')) {
        return ClipRRect(
          borderRadius: BorderRadius.circular(size / 2),
          child: Image.asset(
            logoUrl!,
            width: size,
            height: size,
            fit: BoxFit.contain,
            errorBuilder: (_, _, _) => _buildFallback(),
          ),
        );
      }
      // Network URL
      return ClipRRect(
        borderRadius: BorderRadius.circular(size / 2),
        child: CachedNetworkImage(
          imageUrl: logoUrl!,
          width: size,
          height: size,
          fit: BoxFit.cover,
          errorWidget: (_, _, _) => _buildFallback(),
        ),
      );
    }
    return _buildFallback();
  }

  Widget _buildFallback() {
    final initials = teamName.length >= 2
        ? teamName.substring(0, 2).toUpperCase()
        : teamName.toUpperCase();
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: AppColors.muted,
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Text(
          initials,
          style: TextStyle(
            fontSize: size * 0.35,
            fontWeight: FontWeight.w700,
            color: AppColors.foreground,
          ),
        ),
      ),
    );
  }
}
