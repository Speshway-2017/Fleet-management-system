import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_radius.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_card.dart';
import 'vehicle_overview_screen.dart';
import 'notifications/notifications_screen.dart';
import 'notifications/notification_details_screen.dart';
import 'main_navigation_screen.dart';
import 'home_screen.dart';
import 'trips_screen.dart';
import 'profile/profile_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool get _isTripUnread => !NotificationsScreen.notifications.firstWhere((n) => n.id == '1').isRead;
  bool get _isMaintenanceUnread => !NotificationsScreen.notifications.firstWhere((n) => n.id == '2').isRead;
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const HomeScreen(),
    const TripsScreen(),
    const PlaceholderScreen(title: 'Support', icon: Icons.headset_mic_outlined),
    const PlaceholderScreen(title: 'Alerts', icon: Icons.notifications_none_rounded),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: IndexedStack(
        index: _selectedIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        color: AppColors.primary,
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 64,
            child: Row(
              children: [
                _buildNavItem(0, Icons.home, Icons.home_outlined, 'Home'),
                _buildNavItem(1, Icons.route, Icons.route, 'Trips'),
                _buildNavItem(
                  2,
                  Icons.headset_mic,
                  Icons.headset_mic_outlined,
                  'Support',
                ),
                _buildNavItem(
                  3,
                  Icons.notifications,
                  Icons.notifications_outlined,
                  'Alerts',
                ),
                _buildNavItem(
                  4,
                  Icons.account_circle,
                  Icons.account_circle_outlined,
                  'Profile',
                ),
              ),
              AppSpacing.verticalLg,

              // Recent Notifications Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Recent Notifications',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primaryText,
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      MainNavigationScreen.selectedTabNotifier.value = 3;
                    },
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.secondary,
                      padding: EdgeInsets.zero,
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: const Text('View All'),
                  ),
                ],
              ),
              AppSpacing.verticalMd,
              _buildNotificationCard(
                context,
                icon: Icons.assignment_turned_in_outlined,
                iconBgColor: AppColors.secondary.withValues(alpha: 0.1),
                iconColor: AppColors.secondary,
                title: 'New Trip Assigned',
                subtext: 'Scheduled for Oct 24, 06:00 AM',
                time: '2m ago',
                message: 'A new trip #TRP-9921 has been assigned to you. Please check your schedule and route details for more information.',
                type: 'Route Update',
                isUnread: _isTripUnread,
                onTap: () {
                  setState(() {
                    NotificationsScreen.notifications.firstWhere((n) => n.id == '1').isRead = true;
                  });
                },
              ),
              _buildNotificationCard(
                context,
                icon: Icons.build_outlined,
                iconBgColor: AppColors.divider.withValues(alpha: 0.5),
                iconColor: AppColors.secondaryText,
                title: 'Maintenance Reminder',
                subtext: 'Next engine check due in 3 days',
                time: '1h ago',
                message: 'Your assigned vehicle is scheduled for a routine engine check-up in 3 days. Please coordinate with the fleet supervisor.',
                type: 'Maintenance Alert',
                isUnread: _isMaintenanceUnread,
                onTap: () {
                  setState(() {
                    NotificationsScreen.notifications.firstWhere((n) => n.id == '2').isRead = true;
                  });
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(
    int index,
    IconData selectedIcon,
    IconData unselectedIcon,
    String label,
  ) {
    final isSelected = _selectedIndex == index;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            _selectedIndex = index;
          });
        },
        child: Container(
          color: Colors.transparent,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                isSelected ? selectedIcon : unselectedIcon,
                color: isSelected ? AppColors.secondary : Colors.white.withValues(alpha: 0.7),
                size: 24,
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  color: isSelected ? AppColors.secondary : Colors.white.withValues(alpha: 0.7),
                  fontSize: 10,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
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

  Widget _buildNotificationCard(
    BuildContext context, {
    required IconData icon,
    required Color iconBgColor,
    required Color iconColor,
    required String title,
    required String subtext,
    required String time,
    required String message,
    required String type,
    bool isUnread = false,
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => NotificationDetailsScreen(
              title: title,
              message: message,
              time: time,
              type: type,
              icon: icon,
              onOpened: onTap,
              comingFromDashboard: true,
            ),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: AppSpacing.sm),
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: AppColors.divider),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon Container
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: iconBgColor,
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: Icon(icon, color: iconColor, size: 20),
            ),
            AppSpacing.horizontalMd,
            // Text Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Row(
                          children: [
                            Text(
                              title,
                              style: Theme.of(context).textTheme.titleSmall
                                  ?.copyWith(
                                    color: AppColors.primaryText,
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                            if (isUnread) ...[
                              AppSpacing.horizontalSm,
                              Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: AppColors.secondary,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                      Text(
                        time,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.secondaryText,
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtext,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.secondaryText,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

