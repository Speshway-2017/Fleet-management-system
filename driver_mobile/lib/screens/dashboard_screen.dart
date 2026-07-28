import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';
import 'trip_details_screen.dart';
import 'trips_screen.dart';
import 'active_trips_screen.dart';
import 'upcoming_trips_screen.dart';
import 'completed_trips_screen.dart';
import 'vehicle_overview_screen.dart';
import 'main_navigation_screen.dart';
import 'notifications/notifications_screen.dart';
import 'schedule_screen.dart';
import 'todays_schedule_screen.dart';
import 'upcoming_trip_details_screen.dart';
import 'vehicle_maintenance_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool get _isTripUnread => !NotificationsScreen.notifications.firstWhere((n) => n.id == '1').isRead;
  bool get _isMaintenanceUnread => !NotificationsScreen.notifications.firstWhere((n) => n.id == '2').isRead;

  @override
  void initState() {
    super.initState();
    MainNavigationScreen.selectedTabNotifier.addListener(_onTabChanged);
  }

  @override
  void dispose() {
    MainNavigationScreen.selectedTabNotifier.removeListener(_onTabChanged);
    super.dispose();
  }

  void _onTabChanged() {
    if (mounted && MainNavigationScreen.selectedTabNotifier.value == 0) {
      setState(() {});
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
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Good Morning, Meghana 👋',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.poppins(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Monday, Oct 23, 2023',
                          style: GoogleFonts.nunito(
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            color: const Color(0xFF98A2B3),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Stack(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white24, width: 1.5),
                        ),
                        child: ClipOval(
                          child: Image.asset(
                            'assets/images/driver_avatar.png',
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return const Icon(
                                Icons.person,
                                color: Colors.white,
                                size: 24,
                              );
                            },
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          width: 13,
                          height: 13,
                          decoration: BoxDecoration(
                            color: AppColors.success, // Green online dot
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: const Color(0xFF091522),
                              width: 2.0,
                            ),
                          ),
                        ),
                      ),
                    ],
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
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Quick Actions',
                                style: GoogleFonts.poppins(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: const Color(0xFF1B2430),
                                ),
                              ),
                              GestureDetector(
                                onTap: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Edit actions coming soon'),
                                    ),
                                  );
                                },
                                child: Row(
                                  children: [
                                    const Icon(
                                      Icons.edit_outlined,
                                      color: Color(0xFFFF6A00),
                                      size: 14,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      'Edit',
                                      style: GoogleFonts.poppins(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: const Color(0xFFFF6A00),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
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

  // Active Trip Card Builder
  Widget _buildActiveTripCard(BuildContext context) {
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
                  '#TRP-9921',
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
                        'LIVE',
                        style: GoogleFonts.poppins(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'ETA 14:30 PM',
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
                            'Port of Long Beach, CA',
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
                            'Distribution Center A-12, AZ',
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
                        '65%',
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
                  child: const SizedBox(
                    width: 80,
                    child: LinearProgressIndicator(
                      value: 0.65,
                      color: Color(0xFFFF6A00),
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
                        builder: (context) => const TripDetailsScreen(
                          tripId: '#TRP-9921',
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

  // Quick Actions Row Builder (Horizontal Scroll)
  Widget _buildQuickActionsRow(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          _buildActionCard(context, Icons.local_shipping_outlined, 'Vehicle', () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const VehicleOverviewScreen()),
            );
          }),
          _buildActionCard(context, Icons.local_gas_station_outlined, 'Fuel', () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Fuel logs coming soon')),
            );
          }),
          _buildActionCard(context, Icons.warning_amber_rounded, 'Issue', () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Issue reporting coming soon')),
            );
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
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Settings coming soon')),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildActionCard(
    BuildContext context,
    IconData icon,
    String label,
    VoidCallback onTap,
  ) {
    return Container(
      width: 72,
      margin: const EdgeInsets.only(right: 12, bottom: 4, top: 4),
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
          padding: const EdgeInsets.symmetric(vertical: 12.0),
          child: Column(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: const BoxDecoration(
                  color: Color(0xFFFFF2EB), // Very Light Orange/Peach
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: const Color(0xFFFF6A00), size: 20),
              ),
              const SizedBox(height: 8),
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
          _buildStatItem(context, 'Active Trip', '01', Icons.local_shipping, const Color(0xFF3B82F6), const Color(0xFFEFF6FF), () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const ActiveTripsScreen()));
          }),
          _buildStatItem(context, 'Upcoming', '01', Icons.calendar_today, const Color(0xFF22C55E), const Color(0xFFF0FDF4), () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const UpcomingTripsScreen()));
          }),
          _buildStatItem(context, 'Completed', '04', Icons.check_circle_outline, const Color(0xFFFF6A00), const Color(0xFFFFF7ED), () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const CompletedTripsScreen()));
          }),
          _buildStatItem(context, 'Total Trips', '128', Icons.assignment_outlined, const Color(0xFF8B5CF6), const Color(0xFFF5F3FF), () {
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
        children: [
          _buildTimelineRow(
            context,
            time: '08:00 AM',
            title: 'Warehouse Pickup',
            location: 'Industrial Area, Hub 7',
            isColorActive: true,
            isLineActive: true,
            isLast: false,
          ),
          _buildTimelineRow(
            context,
            time: '09:30 AM',
            title: 'Cargo Loading',
            location: 'Dock C, Section 22',
            isColorActive: false,
            isLineActive: false,
            isLast: false,
          ),
          _buildTimelineRow(
            context,
            time: '11:00 AM',
            title: 'Main Delivery',
            location: 'Logistics Center North',
            isColorActive: false,
            isLineActive: false,
            isLast: true,
          ),
        ],
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
    return Column(
      children: [
        _buildNotificationItem(
          context,
          icon: Icons.inventory_2_outlined,
          iconBgColor: const Color(0xFFFFF2EB),
          iconColor: const Color(0xFFFF6A00),
          title: 'New Trip Assigned',
          subtitle: 'Scheduled for Oct 24, 06:00 AM',
          time: '2m ago',
          isUnread: _isTripUnread,
          onTap: () {
            setState(() {
              NotificationsScreen.notifications.firstWhere((n) => n.id == '1').isRead = true;
            });
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const UpcomingTripDetailsScreen(tripId: '#TRP-8840'),
              ),
            );
          },
        ),
        _buildNotificationItem(
          context,
          icon: Icons.construction_outlined,
          iconBgColor: const Color(0xFFF1F5F9),
          iconColor: const Color(0xFF667085),
          title: 'Maintenance Reminder',
          subtitle: 'Next engine check due in 3 days',
          time: '1h ago',
          isUnread: _isMaintenanceUnread,
          onTap: () {
            setState(() {
              NotificationsScreen.notifications.firstWhere((n) => n.id == '2').isRead = true;
            });
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const VehicleMaintenanceScreen(),
              ),
            );
          },
        ),
      ],
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
