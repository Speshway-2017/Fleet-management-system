import 'package:flutter/material.dart';
import '../screens/main_navigation_screen.dart';

/// Centralized safe navigation helper to eliminate blank screens when navigating back.
class SafeNavigation {
  /// Safely pops the current screen if [Navigator.canPop] is true.
  /// If it cannot pop (e.g., screen replaced or opened as root), safely routes to
  /// [MainNavigationScreen] with the specified [fallbackTab] (default: 2 / Home).
  static void pop(BuildContext context, {int fallbackTab = 2, dynamic result}) {
    if (!context.mounted) return;
    
    if (Navigator.of(context).canPop()) {
      Navigator.of(context).pop(result);
    } else {
      MainNavigationScreen.selectedTabNotifier.value = fallbackTab;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
        (route) => false,
      );
    }
  }

  /// Standard safe back button widget for AppBars
  static Widget backButton(
    BuildContext context, {
    Color color = Colors.white,
    int fallbackTab = 2,
    VoidCallback? onCustomBack,
  }) {
    return IconButton(
      icon: const Icon(Icons.arrow_back_rounded),
      color: color,
      tooltip: 'Back',
      onPressed: onCustomBack ?? () => pop(context, fallbackTab: fallbackTab),
    );
  }
}
