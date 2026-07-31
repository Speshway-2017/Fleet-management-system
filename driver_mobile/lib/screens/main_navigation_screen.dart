import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';
import 'dashboard_screen.dart';
import 'trips_screen.dart';
import 'support_history_screen.dart';
import 'profile/profile_screen.dart';
import 'notifications/notifications_screen.dart';
import '../services/fcm_service.dart';

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
    // Initialize Firebase Cloud Messaging when entering MainNavigationScreen
    FcmService.initialize(context);
  }

  @override
  void dispose() {
    MainNavigationScreen.selectedTabNotifier.removeListener(_onTabChanged);
    MainNavigationScreen.selectedTabNotifier.value = 0;
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
        height: 64.0 + MediaQuery.of(context).padding.bottom,
        decoration: const BoxDecoration(
          color: AppColors.primary,
          boxShadow: [
            BoxShadow(
              color: Colors.black26,
              blurRadius: 8,
              offset: Offset(0, -2),
            ),
          ],
        ),
        padding: const EdgeInsets.symmetric(horizontal: 4.0),
        child: SafeArea(
          top: false,
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
    late final Widget iconWidget;

    if (index == 3) {
      iconWidget = Stack(
        clipBehavior: Clip.none,
        children: [
          Icon(
            isSelected ? solidIcon : outlineIcon,
            color: isSelected ? AppColors.secondary : AppColors.textDisabled,
            size: 24,
          ),
          Positioned(
            right: -2,
            top: -2,
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
    } else {
      iconWidget = Icon(
        isSelected ? solidIcon : outlineIcon,
        color: isSelected ? AppColors.secondary : AppColors.textDisabled,
        size: 24,
      );
    }

    return Expanded(
      child: InkWell(
        onTap: () {
          MainNavigationScreen.selectedTabNotifier.value = index;
        },
        borderRadius: BorderRadius.circular(12.0),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 6.0),
          alignment: Alignment.center,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              iconWidget,
              const SizedBox(height: 3),
              Text(
                label,
                style: GoogleFonts.poppins(
                  color: isSelected ? AppColors.secondary : AppColors.textDisabled,
                  fontSize: 10,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
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
