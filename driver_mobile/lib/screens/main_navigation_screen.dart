import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../theme/app_colors.dart';
import 'dashboard_screen.dart';
import 'vehicle_overview_screen.dart';
import 'fuel_overview_screen.dart';
import 'trips_screen.dart';
import 'support_history_screen.dart';
import 'profile/profile_screen.dart';
import 'notifications/notifications_screen.dart';
import '../services/fcm_service.dart';
import '../services/localization_service.dart';

import '../services/socket_service.dart';
import '../services/api_service.dart';
import '../utils/date_formatter.dart';

class MainNavigationScreen extends StatefulWidget {
  static final ValueNotifier<int> selectedTabNotifier = ValueNotifier<int>(2);

  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;
  final Set<int> _activatedTabs = {2};
  DateTime? _lastBackPressed;

  @override
  void initState() {
    super.initState();
    _currentIndex = MainNavigationScreen.selectedTabNotifier.value;
    _activatedTabs.add(_currentIndex);
    MainNavigationScreen.selectedTabNotifier.addListener(_onTabChanged);
    _setupSocketNotificationListeners();
    // Initialize Firebase Cloud Messaging when entering MainNavigationScreen
    FcmService.initialize(context);
    _prewarmAppData();
  }

  void _prewarmAppData() {
    Future.microtask(() async {
      try {
        await Future.wait([
          ApiService.getAssignedVehicle().catchError((_) => null),
          ApiService.getCurrentTrip().catchError((_) => null),
          ApiService.get('/driver/dashboard').catchError((_) => null),
          ApiService.getDriverMaintenance().catchError((_) => null),
          ApiService.getDriverTickets().catchError((_) => null),
          ApiService.getDriverFuelRecords().catchError((_) => null),
          ApiService.getDriverNotifications().catchError((_) => null),
          ApiService.get('/driver/trips?status=Completed').catchError((_) => null),
        ]);
      } catch (_) {}
    });
  }

  void _setupSocketNotificationListeners() {
    SocketService.onEvent('notification:new', (data) {
      if (mounted && data != null) {
        final title = data['title'] ?? 'New Notification';
        final message = data['message'] ?? data['description'] ?? '';
        _showPopupNotification(title, message);

        final newItem = NotificationItem(
          id: data['_id'] ?? data['id'] ?? DateTime.now().millisecondsSinceEpoch.toString(),
          title: title,
          description: message,
          timestamp: formatNotificationTime(data['createdAt']),
          category: getNotificationCategory(data['createdAt']),
          isRead: false,
          icon: data['type'] == 'trip_assigned' ? Icons.assignment_ind_outlined : Icons.notifications_none_outlined,
        );

        // Prepend to static notifications feed and update notifier
        NotificationsScreen.notifications.insert(0, newItem);
        NotificationsScreen.unreadCountNotifier.value = NotificationsScreen.notifications.where((n) => !n.isRead).length;
      }
    });

    SocketService.onEvent('trip:assigned', (data) async {
      if (mounted) {
        if (data != null && data is Map) {
          final prefs = await SharedPreferences.getInstance();
          final currentDriverId = prefs.getString('driver_id') ?? '';
          final tripDriver = data['driver'];
          final assignedDriverId = (tripDriver is Map ? (tripDriver['_id'] ?? tripDriver['id']) : tripDriver)?.toString() ?? '';
          if (assignedDriverId.isNotEmpty && currentDriverId.isNotEmpty && assignedDriverId != currentDriverId) {
            debugPrint('Ignoring trip:assigned notification for different driver $assignedDriverId (current: $currentDriverId)');
            return;
          }
        }
        _showPopupNotification('🚀 New Trip Assigned!', 'Your manager has assigned a new trip to you.');
      }
    });

    SocketService.onEvent('trip:status-updated', (data) async {
      if (mounted && data != null) {
        if (data is Map) {
          final prefs = await SharedPreferences.getInstance();
          final currentDriverId = prefs.getString('driver_id') ?? '';
          final tripDriver = data['driver'];
          final assignedDriverId = (tripDriver is Map ? (tripDriver['_id'] ?? tripDriver['id']) : tripDriver)?.toString() ?? '';
          if (assignedDriverId.isNotEmpty && currentDriverId.isNotEmpty && assignedDriverId != currentDriverId) {
            return;
          }
        }
        final status = data['status'] ?? 'Updated';
        _showPopupNotification('📋 Trip Status Updated', 'Trip status changed to $status');
      }
    });
  }

  void _showPopupNotification(String title, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.notifications_active, color: Colors.amber, size: 24),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white)),
                  if (message.isNotEmpty)
                    Text(message, style: GoogleFonts.poppins(fontSize: 11, color: Colors.white70), maxLines: 2, overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF091522),
        duration: const Duration(seconds: 4),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  @override
  void dispose() {
    MainNavigationScreen.selectedTabNotifier.removeListener(_onTabChanged);
    MainNavigationScreen.selectedTabNotifier.value = 2;
    super.dispose();
  }

  void _onTabChanged() {
    if (mounted) {
      final newIndex = MainNavigationScreen.selectedTabNotifier.value;
      setState(() {
        _currentIndex = newIndex;
        _activatedTabs.add(newIndex);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: LocalizationService.currentLanguageNotifier,
      builder: (context, currentLanguage, _) {
        return PopScope(
          canPop: false,
          onPopInvokedWithResult: (bool didPop, dynamic result) async {
            if (didPop) return;

            // If not on Home tab (index 2), switch to Home tab
            if (_currentIndex != 2) {
              setState(() {
                _currentIndex = 2;
              });
              MainNavigationScreen.selectedTabNotifier.value = 2;
              return;
            }

            // On Home tab: double tap within 2 seconds to exit app
            final now = DateTime.now();
            if (_lastBackPressed == null ||
                now.difference(_lastBackPressed!) > const Duration(seconds: 2)) {
              _lastBackPressed = now;
              ScaffoldMessenger.of(context).removeCurrentSnackBar();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    'Press back again to exit',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  duration: const Duration(seconds: 2),
                  behavior: SnackBarBehavior.floating,
                  margin: const EdgeInsets.only(bottom: 72, left: 60, right: 60),
                  backgroundColor: const Color(0xE60F172A),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
              );
              return;
            }

            // Confirmed double-back: exit the app safely
            await SystemNavigator.pop();
          },
          child: Scaffold(
            key: ValueKey('main_scaffold_$currentLanguage'),
            backgroundColor: Colors.white,
            body: IndexedStack(
              key: ValueKey('main_stack_$currentLanguage'),
              index: _currentIndex,
              children: const [
                VehicleOverviewScreen(),
                FuelOverviewScreen(),
                DashboardScreen(),
                TripsScreen(),
                ProfileScreen(),
              ],
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
                    _buildNavItem(0, Icons.local_shipping_outlined, Icons.local_shipping, 'Vehicle'.tr),
                    _buildNavItem(1, Icons.local_gas_station_outlined, Icons.local_gas_station_rounded, 'Fuel'.tr),
                    _buildNavItem(2, Icons.home_outlined, Icons.home, 'Home'.tr),
                    _buildNavItem(3, Icons.route_outlined, Icons.route, 'Trips'.tr),
                    _buildNavItem(4, Icons.account_circle_outlined, Icons.account_circle, 'Profile'.tr),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildNavItem(int index, IconData outlineIcon, IconData solidIcon, String label) {
    final bool isSelected = _currentIndex == index;
    final iconWidget = Icon(
      isSelected ? solidIcon : outlineIcon,
      color: isSelected ? AppColors.secondary : AppColors.textDisabled,
      size: 24,
    );

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
