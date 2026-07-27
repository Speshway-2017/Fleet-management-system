import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';
import 'dashboard_screen.dart';
import 'trips_screen.dart';
import 'support_history_screen.dart';
import 'profile/profile_screen.dart';
import 'notifications/notifications_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  static final ValueNotifier<int> selectedTabNotifier = ValueNotifier<int>(0);

  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _currentIndex = MainNavigationScreen.selectedTabNotifier.value;
    MainNavigationScreen.selectedTabNotifier.addListener(_onTabChanged);
  }

  @override
  void dispose() {
    MainNavigationScreen.selectedTabNotifier.removeListener(_onTabChanged);
    MainNavigationScreen.selectedTabNotifier.value = 0;
    // Reset mock notifications read status for consistent state
    for (var item in NotificationsScreen.notifications) {
      if (item.id == '1' || item.id == '2') {
        item.isRead = false;
      } else {
        item.isRead = true;
      }
    }
    super.dispose();
  }

  void _onTabChanged() {
    if (mounted) {
      setState(() {
        _currentIndex = MainNavigationScreen.selectedTabNotifier.value;
      });
    }
  }

  final List<Widget> _screens = [
    const DashboardScreen(),
    const TripsScreen(),
    const SupportHistoryScreen(),
    const NotificationsScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        color: AppColors.primary,
        padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 8.0),
        child: SafeArea(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(0, Icons.home_outlined, Icons.home, 'Home'),
              _buildNavItem(1, Icons.route_outlined, Icons.route, 'Trips'),
              _buildNavItem(2, Icons.headset_mic_outlined, Icons.headset_mic, 'Support'),
              _buildNavItem(3, Icons.notifications_none_rounded, Icons.notifications, 'Alerts'),
              _buildNavItem(4, Icons.account_circle_outlined, Icons.account_circle, 'Profile'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData outlineIcon, IconData solidIcon, String label) {
    final bool isSelected = _currentIndex == index;

    Widget iconWidget = Icon(
      isSelected ? solidIcon : outlineIcon,
      color: isSelected ? Colors.white : AppColors.textDisabled,
      size: 24,
    );

    // If it's the Alerts tab (index 3), add a notification badge.
    if (index == 3) {
      iconWidget = Stack(
        clipBehavior: Clip.none,
        children: [
          iconWidget,
          Positioned(
            right: 0,
            top: 0,
            child: Container(
              width: 8,
              height: 8,
              decoration: const BoxDecoration(
                color: AppColors.secondary, // Fleet Orange
                shape: BoxShape.circle,
              ),
            ),
          ),
        ],
      );
    }

    if (isSelected) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.secondary,
          borderRadius: BorderRadius.circular(12.0),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            iconWidget,
            const SizedBox(height: 3),
            Text(
              label,
              style: GoogleFonts.poppins(
                color: Colors.white,
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      );
    } else {
      return InkWell(
        onTap: () {
          MainNavigationScreen.selectedTabNotifier.value = index;
        },
        borderRadius: BorderRadius.circular(12.0),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 6.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              iconWidget,
              const SizedBox(height: 3),
              Text(
                label,
                style: GoogleFonts.poppins(
                  color: AppColors.textDisabled,
                  fontSize: 10,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      );
    }
  }
}

class PlaceholderScreen extends StatelessWidget {
  final String title;
  final IconData icon;
  const PlaceholderScreen({super.key, required this.title, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(
          title,
          style: GoogleFonts.poppins(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 72,
              color: AppColors.textDisabled,
            ),
            const SizedBox(height: 16),
            Text(
              '$title Screen Placeholder',
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'This screen will display your fleet $title details.',
              style: GoogleFonts.nunito(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
