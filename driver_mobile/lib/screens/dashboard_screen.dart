import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../constants/app_colors.dart';
import 'trip_details_screen.dart';
import 'trips_screen.dart';
import 'active_trips_screen.dart';
import 'upcoming_trips_screen.dart';
import 'completed_trips_screen.dart';
import 'vehicle_overview_screen.dart';
import 'main_navigation_screen.dart';
import 'notifications/notification_details_screen.dart';
import 'schedule_screen.dart';
import 'todays_schedule_screen.dart';
import 'settings/settings_screen.dart';
import 'fuel_overview_screen.dart';
import 'profile/profile_screen.dart';
import '../providers/notification_provider.dart';

import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/location_service.dart';
import '../services/socket_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Map<String, dynamic>? _driverProfile;
  Map<String, dynamic>? _currentTrip;
  Map<String, dynamic>? _dashboardData;
  Timer? _pollingTimer;
  final Set<String> _knownNotificationIds = {};
  bool _isFirstLoad = true;

  @override
  void initState() {
    super.initState();
    MainNavigationScreen.selectedTabNotifier.addListener(_onTabChanged);
    _loadDashboardData();

    // Set up polling timer every 10 seconds to sync dashboard dynamically
    _pollingTimer = Timer.periodic(const Duration(seconds: 10), (timer) {
      if (mounted) {
        _loadDashboardData();
      }
    });
    SocketService.addNotificationListener(_onSocketNotification);
  }

  Future<void> _loadDashboardData() async {
    try {
      final profile = await AuthService.fetchProfile();
      final currentTripRes = await ApiService.get('/driver/trips/current');
      final dashRes = await ApiService.get('/driver/dashboard');

      if (mounted) {
        setState(() {
          _driverProfile = profile;
          _currentTrip = currentTripRes['data'];
          _dashboardData = dashRes['data'];
        });

        // Trigger loading of notifications state
        final notifProvider = Provider.of<NotificationProvider>(context, listen: false);
        await notifProvider.fetchNotifications();

        // Check for new unread notifications and present alert
        for (final notification in notifProvider.notifications) {
          if (!notification.isRead && !_knownNotificationIds.contains(notification.id)) {
            if (!_isFirstLoad && mounted) {
              ScaffoldMessenger.of(context).hideCurrentSnackBar();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Row(
                    children: [
                      Icon(notification.icon, color: Colors.white, size: 20),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              notification.title,
                              style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              notification.description,
                              style: const TextStyle(color: Colors.white70, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  backgroundColor: const Color(0xFFFF6A00),
                  behavior: SnackBarBehavior.floating,
                  duration: const Duration(seconds: 5),
                  action: SnackBarAction(
                    label: 'View',
                    textColor: Colors.white,
                    onPressed: () {
                      MainNavigationScreen.selectedTabNotifier.value = 3;
                    },
                  ),
                ),
              );
            }
            _knownNotificationIds.add(notification.id);
          }
        }
        _isFirstLoad = false;

        if (_currentTrip != null && _currentTrip!['tripId'] != null) {
          LocationTrackingService.startTracking(tripId: _currentTrip!['tripId'].toString());
        }
      }
    } catch (e) {
      debugPrint('Error loading dashboard data: $e');
    }
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    MainNavigationScreen.selectedTabNotifier.removeListener(_onTabChanged);
    SocketService.removeNotificationListener(_onSocketNotification);
    super.dispose();
  }

  void _onTabChanged() {
    if (mounted && MainNavigationScreen.selectedTabNotifier.value == 0) {
      setState(() {});
    }
  }

  void _onSocketNotification(Map<String, dynamic> notification) {
    if (mounted) {
      debugPrint('Dashboard reload triggered by socket notification');
      _loadDashboardData();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF091522), // Sleek Dark Navy
      body: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header Section: Greeting + Driver Profile Info
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8.0),
                          ),
                          padding: const EdgeInsets.all(4.0),
                          child: Image.asset(
                            'assets/logo.png',
                            fit: BoxFit.contain,
                            errorBuilder: (context, error, stackTrace) {
                              return Image.asset(
                                'assets/images/logo.png',
                                fit: BoxFit.contain,
                                errorBuilder: (context, error, stackTrace) {
                                  return const Icon(
                                    Icons.local_shipping_rounded,
                                    color: Color(0xFF091522),
                                    size: 20,
                                  );
                                },
                              );
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Good Morning, ${_driverProfile?['fullName'] ?? 'Driver'} 👋',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.poppins(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${_driverProfile?['vehicle'] ?? 'Vehicle AX-452'} • ID: ${_driverProfile?['driverId'] ?? 'EMP-1002'}',
                                style: GoogleFonts.nunito(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500,
                                  color: const Color(0xFF98A2B3),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: () {
                      MainNavigationScreen.selectedTabNotifier.value = 4;
                    },
                    child: Stack(
                      children: [
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white24, width: 1.5),
                          ),
                          child: ClipOval(
                            child: ValueListenableBuilder<String>(
                              valueListenable: ProfileState.profilePhotoUrlNotifier,
                              builder: (context, photoUrl, child) {
                                if (photoUrl.isEmpty) {
                                  return const Icon(
                                    Icons.person,
                                    color: Colors.white,
                                    size: 18,
                                  );
                                }
                                if (photoUrl.startsWith('data:image') && photoUrl.contains('base64,')) {
                                  try {
                                    final base64Content = photoUrl.split('base64,').last;
                                    final bytes = base64Decode(base64Content);
                                    return Image.memory(
                                      bytes,
                                      fit: BoxFit.cover,
                                    );
                                  } catch (_) {}
                                }
                                return Image.network(
                                  photoUrl,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return const Icon(
                                      Icons.person,
                                      color: Colors.white,
                                      size: 18,
                                    );
                                  },
                                );
                              },
                            ),
                          ),
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              color: AppColors.success, // Green online dot
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: const Color(0xFF091522),
                                width: 1.5,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),

            // Main Curved Content Area
            Expanded(
              child: Container(
                decoration: const BoxDecoration(
                  color: Color(0xFFF7F9FC), // Modern Light Gray
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(32),
                    topRight: Radius.circular(32),
                  ),
                ),
                child: ClipRRect(
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(32),
                    topRight: Radius.circular(32),
                  ),
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const SizedBox(height: 20),

                        // 1. Active Trip Card
                        _buildActiveTripCard(context),

                        const SizedBox(height: 20),

                        // 2. Quick Actions Header & Row
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20.0),
                          child: Text(
                            'Quick Actions',
                            style: GoogleFonts.poppins(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFF1B2430),
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        _buildQuickActionsRow(context),

                        const SizedBox(height: 24),

                        // 3. Dashboard Overview Header & Stats Row
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Dashboard Overview',
                                style: GoogleFonts.poppins(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: const Color(0xFF1B2430),
                                ),
                              ),
                              GestureDetector(
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => const TripsScreen(),
                                    ),
                                  );
                                },
                                child: Row(
                                  children: [
                                    Text(
                                      'View Trips',
                                      style: GoogleFonts.poppins(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: const Color(0xFFFF6A00),
                                      ),
                                    ),
                                    const Icon(
                                      Icons.chevron_right,
                                      color: Color(0xFFFF6A00),
                                      size: 16,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        _buildStatsOverview(context),

                        const SizedBox(height: 24),

                        // 4. Today's Schedule Header & Timeline Card
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                "Today's Schedule",
                                style: GoogleFonts.poppins(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: const Color(0xFF1B2430),
                                ),
                              ),
                              GestureDetector(
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => const TodaysScheduleScreen(),
                                    ),
                                  );
                                },
                                child: Text(
                                  'View All',
                                  style: GoogleFonts.poppins(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: const Color(0xFFFF6A00),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        _buildScheduleTimeline(context),

                        const SizedBox(height: 24),

                        // 5. Recent Notifications Header & Items
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Recent Notifications',
                                style: GoogleFonts.poppins(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: const Color(0xFF1B2430),
                                ),
                              ),
                              GestureDetector(
                                onTap: () {
                                  MainNavigationScreen.selectedTabNotifier.value = 3;
                                },
                                child: Text(
                                  'View All',
                                  style: GoogleFonts.poppins(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: const Color(0xFFFF6A00),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        _buildRecentNotifications(context),

                        const SizedBox(height: 32),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  double get _tripProgress {
    if (_currentTrip == null) return 0.0;
    final status = _currentTrip!['status']?.toString().toLowerCase() ?? '';
    if (status == 'completed') return 1.0;
    if (status == 'scheduled' || status == 'assigned') return 0.0;
    
    final est = double.tryParse(_currentTrip!['estimatedDistance']?.toString() ?? '') ?? 0.0;
    final act = double.tryParse(_currentTrip!['actualDistance']?.toString() ?? '') ?? 0.0;
    if (est > 0) {
      final percentage = act / est;
      return percentage.clamp(0.0, 1.0);
    }
    return 0.65; // Default progress fallback
  }

  // Active Trip Card Builder
  Widget _buildActiveTripCard(BuildContext context) {
    if (_currentTrip == null) {
      return Container(
        margin: const EdgeInsets.symmetric(horizontal: 16),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: const Color(0xFF0F1E36), // Deep Navy Black
          borderRadius: BorderRadius.circular(20),
        ),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.local_shipping_outlined, color: Colors.white54, size: 40),
              const SizedBox(height: 12),
              Text(
                'No Active Trip Assigned',
                style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'You will see details here once a trip starts.',
                style: GoogleFonts.nunito(
                  color: Colors.white60,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0F1E36), // Deep Navy Black
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F1E36).withValues(alpha: 0.3),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Left side: Status + Trip Details + Route timeline
          Expanded(
            flex: 11,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: Color(0xFFFF6A00), // Fleet Orange dot
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'ACTIVE TRIP',
                      style: GoogleFonts.poppins(
                        color: const Color(0xFFFF6A00),
                        fontWeight: FontWeight.bold,
                        fontSize: 10,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  _currentTrip!['tripNumber'] ?? '',
                  style: GoogleFonts.poppins(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 20,
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF22C55E), // Live Pill
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        _currentTrip!['status']?.toUpperCase() ?? 'LIVE',
                        style: GoogleFonts.poppins(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _currentTrip!['eta'] != null ? 'ETA ${_currentTrip!['eta']}' : 'ETA 14:30 PM',
                      style: GoogleFonts.nunito(
                        color: Colors.white.withValues(alpha: 0.7),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                // Pickup and Destination timeline
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Column(
                      children: [
                        const Icon(
                          Icons.radio_button_checked,
                          color: Color(0xFF3B82F6), // Blue pickup dot
                          size: 16,
                        ),
                        // Dotted timeline connector
                        Container(
                          width: 1.5,
                          height: 36,
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          color: Colors.white30,
                        ),
                        const Icon(
                          Icons.location_on,
                          color: Color(0xFFEF4444), // Red destination marker
                          size: 16,
                        ),
                      ],
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'PICKUP',
                            style: GoogleFonts.poppins(
                              color: Colors.white38,
                              fontSize: 8,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                          Text(
                            _currentTrip!['startLocation'] ?? 'Port of Long Beach, CA',
                            style: GoogleFonts.nunito(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 18),
                          Text(
                            'DESTINATION',
                            style: GoogleFonts.poppins(
                              color: Colors.white38,
                              fontSize: 8,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                          Text(
                            _currentTrip!['endLocation'] ?? 'Distribution Center A-12, AZ',
                            style: GoogleFonts.nunito(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),

          // Right side: Progress Box + Progress line + CTA Button
          Expanded(
            flex: 9,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                // Progress statistic container
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white12),
                  ),
                  child: Column(
                    children: [
                      Text(
                        '${(_tripProgress * 100).toInt()}%',
                        style: GoogleFonts.poppins(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      Text(
                        'Progress',
                        style: GoogleFonts.nunito(
                          color: Colors.white60,
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),

                // Orange progress bar
                ClipRRect(
                  borderRadius: BorderRadius.circular(3),
                  child: SizedBox(
                    width: 80,
                    child: LinearProgressIndicator(
                      value: _tripProgress,
                      color: const Color(0xFFFF6A00),
                      backgroundColor: Colors.white12,
                      minHeight: 6,
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // View Details orange action button
                ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => TripDetailsScreen(
                          tripId: _currentTrip!['tripId'] ?? _currentTrip!['_id'] ?? _currentTrip!['id'] ?? '',
                        ),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFF6A00),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                    elevation: 0,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'View Details',
                        style: GoogleFonts.poppins(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 4),
                      const Icon(Icons.chevron_right, size: 14),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Quick Actions Grid Builder (3 columns, 2 rows)
  Widget _buildQuickActionsRow(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 3,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.15,
      children: [
        _buildActionCard(context, Icons.local_shipping_outlined, 'Vehicle', () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const VehicleOverviewScreen()),
          );
        }),
        _buildActionCard(context, Icons.local_gas_station_outlined, 'Fuel', () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const FuelOverviewScreen()),
          );
        }),
        _buildActionCard(context, Icons.warning_amber_rounded, 'Issue', () {
          MainNavigationScreen.selectedTabNotifier.value = 2;
        }),
        _buildActionCard(context, Icons.calendar_month_outlined, 'Schedule', () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const ScheduleScreen()),
          );
        }),
        _buildActionCard(context, Icons.route_outlined, 'Trips', () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const TripsScreen()),
          );
        }),
        _buildActionCard(context, Icons.settings_outlined, 'Settings', () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const SettingsScreen()),
          );
        }),
      ],
    );
  }

  Widget _buildActionCard(
    BuildContext context,
    IconData icon,
    String label,
    VoidCallback onTap,
  ) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 4.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: const BoxDecoration(
                  color: Color(0xFFFFF2EB), // Very Light Orange/Peach
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: const Color(0xFFFF6A00), size: 18),
              ),
              const SizedBox(height: 6),
              Text(
                label,
                style: GoogleFonts.poppins(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF1B2430),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Stats Card Builder
  Widget _buildStatsOverview(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          _buildStatItem(context, 'Active Trip', _dashboardData?['activeTrips']?.toString().padLeft(2, '0') ?? '01', Icons.local_shipping, const Color(0xFF3B82F6), const Color(0xFFEFF6FF), () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const ActiveTripsScreen()));
          }),
          _buildStatItem(context, 'Upcoming', _dashboardData?['upcomingTrips']?.toString().padLeft(2, '0') ?? '04', Icons.calendar_today, const Color(0xFF22C55E), const Color(0xFFF0FDF4), () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const UpcomingTripsScreen()));
          }),
          _buildStatItem(context, 'Completed', _dashboardData?['completedTrips']?.toString().padLeft(2, '0') ?? '128', Icons.check_circle_outline, const Color(0xFFFF6A00), const Color(0xFFFFF7ED), () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const CompletedTripsScreen()));
          }),
          _buildStatItem(context, 'Total Trips', ((_dashboardData?['activeTrips'] ?? 1) + (_dashboardData?['upcomingTrips'] ?? 4) + (_dashboardData?['completedTrips'] ?? 128)).toString(), Icons.assignment_outlined, const Color(0xFF8B5CF6), const Color(0xFFF5F3FF), () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const TripsScreen()));
          }),
        ],
      ),
    );
  }

  Widget _buildStatItem(
    BuildContext context,
    String label,
    String value,
    IconData icon,
    Color iconColor,
    Color bgColor,
    VoidCallback onTap,
  ) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        child: Column(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: bgColor,
              child: Icon(icon, color: iconColor, size: 18),
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: GoogleFonts.poppins(
                fontWeight: FontWeight.bold,
                fontSize: 18,
                color: const Color(0xFF1B2430),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: GoogleFonts.nunito(
                color: const Color(0xFF667085),
                fontSize: 10,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  // Timeline Schedule Builder
  Widget _buildScheduleTimeline(BuildContext context) {
    final schedule = _dashboardData?['todaySchedule'] as List?;

    if (schedule == null || schedule.isEmpty) {
      return Container(
        margin: const EdgeInsets.symmetric(horizontal: 16),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFF1F5F9)),
        ),
        child: Center(
          child: Column(
            children: [
              const Icon(Icons.calendar_today_outlined, size: 40, color: Color(0xFF98A2B3)),
              const SizedBox(height: 12),
              Text(
                'No schedule for today',
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF667085),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: List.generate(schedule.length, (index) {
          final trip = schedule[index];
          final isFirst = index == 0;
          final isLast = index == schedule.length - 1;

          return _buildTimelineRow(
            context,
            time: trip['departureTime'] ?? '',
            title: 'Trip ${trip['tripNumber'] ?? ''}',
            location: '${trip['startLocation'] ?? ''} ➔ ${trip['endLocation'] ?? ''}',
            isColorActive: isFirst,
            isLineActive: isFirst,
            isLast: isLast,
          );
        }),
      ),
    );
  }

  Widget _buildTimelineRow(
    BuildContext context, {
    required String time,
    required String title,
    required String location,
    required bool isColorActive,
    required bool isLineActive,
    required bool isLast,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 65,
          child: Padding(
            padding: const EdgeInsets.only(top: 2.0),
            child: Text(
              time,
              style: GoogleFonts.poppins(
                color: const Color(0xFF667085),
                fontWeight: FontWeight.w500,
                fontSize: 12,
              ),
            ),
          ),
        ),
        Column(
          children: [
            Container(
              width: 14,
              height: 14,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isColorActive ? const Color(0xFFFF6A00) : Colors.white,
                border: Border.all(
                  color: isColorActive ? const Color(0xFFFF6A00) : const Color(0xFFCBD5E1),
                  width: 3,
                ),
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 40,
                color: isLineActive ? const Color(0xFFFF6A00) : const Color(0xFFE2E8F0),
              ),
          ],
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                  color: const Color(0xFF1B2430),
                ),
              ),
              const SizedBox(height: 2),
              Text(
                location,
                style: GoogleFonts.nunito(
                  color: const Color(0xFF667085),
                  fontSize: 11,
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ],
    );
  }

  // Recent Notifications Builder
  Widget _buildRecentNotifications(BuildContext context) {
    final provider = Provider.of<NotificationProvider>(context);
    final list = provider.notifications.take(3).toList();

    if (list.isEmpty) {
      return Container(
        margin: const EdgeInsets.symmetric(horizontal: 16),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFF1F5F9)),
        ),
        child: Center(
          child: Column(
            children: [
              const Icon(Icons.notifications_none_outlined, size: 40, color: Color(0xFF98A2B3)),
              const SizedBox(height: 12),
              Text(
                'No recent notifications',
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF667085),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      children: list.map((item) {
        final t = item.type.toLowerCase();
        Color bgColor = const Color(0xFFF1F5F9);
        Color iconColor = const Color(0xFF667085);
        if (t.contains('route') || t.contains('trip')) {
          bgColor = const Color(0xFFFFF2EB);
          iconColor = const Color(0xFFFF6A00);
        } else if (t.contains('maintenance') || t.contains('warning')) {
          bgColor = const Color(0xFFFEF2F2);
          iconColor = const Color(0xFFEF4444);
        } else if (t.contains('achievement') || t.contains('success')) {
          bgColor = const Color(0xFFF0FDF4);
          iconColor = const Color(0xFF22C55E);
        }

        return _buildNotificationItem(
          context,
          icon: item.icon,
          iconBgColor: bgColor,
          iconColor: iconColor,
          title: item.title,
          subtitle: item.description,
          time: item.timestamp,
          isUnread: !item.isRead,
          onTap: () {
            provider.markAsRead(item.id);
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => NotificationDetailsScreen(
                  title: item.title,
                  message: item.description,
                  time: item.timestamp,
                  type: item.type,
                  icon: item.icon,
                  onOpened: () => provider.markAsRead(item.id),
                  comingFromDashboard: true,
                ),
              ),
            );
          },
        );
      }).toList(),
    );
  }

  Widget _buildNotificationItem(
    BuildContext context, {
    required IconData icon,
    required Color iconBgColor,
    required Color iconColor,
    required String title,
    required String subtitle,
    required String time,
    required bool isUnread,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(left: 16, right: 16, bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: iconBgColor,
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: iconColor, size: 18),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.poppins(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        color: const Color(0xFF1B2430),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: GoogleFonts.nunito(
                        color: const Color(0xFF667085),
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    time,
                    style: GoogleFonts.nunito(
                      color: const Color(0xFF98A2B3),
                      fontSize: 10,
                    ),
                  ),
                  const SizedBox(height: 6),
                  if (isUnread)
                    Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                        color: Color(0xFFFF6A00),
                        shape: BoxShape.circle,
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
