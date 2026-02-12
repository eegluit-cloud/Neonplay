import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/app_colors.dart';

class MobileBottomNav extends StatelessWidget {
  final String currentLocation;

  const MobileBottomNav({super.key, required this.currentLocation});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: AppColors.border, width: 1)),
      ),
      child: BottomNavigationBar(
        currentIndex: _indexFromLocation(currentLocation),
        onTap: (index) => _onTap(context, index),
        type: BottomNavigationBarType.fixed,
        backgroundColor: AppColors.background,
        selectedItemColor: AppColors.accent,
        unselectedItemColor: AppColors.mutedForeground,
        selectedFontSize: 11,
        unselectedFontSize: 11,
        elevation: 0,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.menu),
            label: 'Menu',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.sports_volleyball),
            label: 'Sports',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.casino),
            label: 'Casino',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.receipt_long),
            label: 'Bets',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.favorite),
            label: 'Favorites',
          ),
        ],
      ),
    );
  }

  int _indexFromLocation(String location) {
    if (location.startsWith('/sports')) return 1;
    if (location.startsWith('/casino') ||
        location.startsWith('/slots') ||
        location.startsWith('/game') ||
        location.startsWith('/hot-games') ||
        location.startsWith('/crash-games') ||
        location.startsWith('/live-casino') ||
        location.startsWith('/providers')) {
      return 2;
    }
    if (location.startsWith('/profile')) return 3;
    if (location.startsWith('/favorites')) return 4;
    return 0;
  }

  void _onTap(BuildContext context, int index) {
    switch (index) {
      case 0:
        Scaffold.of(context).openDrawer();
      case 1:
        context.go('/sports');
      case 2:
        context.go('/casino');
      case 3:
        context.go('/profile');
      case 4:
        context.go('/favorites');
    }
  }
}
