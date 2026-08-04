import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../utils/date_formatter.dart';
import 'profile/profile_screen.dart';
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
import 'settings/settings_screen.dart';
import 'fuel_overview_screen.dart';
import '../widgets/driver_profile_dropdown.dart';

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
  bool _isVehicleAssigned = false;
  Map<String, dynamic>? _assignedVehicle;

  @override
  void initState() {
    super.initState();
    MainNavigationScreen.selectedTabNotifier.addListener(_onTabChanged);
    _loadDashboardData();
    
    // Register socket listeners for instant updates
    SocketService.onEvent('notification:new', _onSocketEvent);
    SocketService.onEvent('trip:assigned', _onSocketEvent);
    SocketService.onEvent('trip:status-updated', _onSocketEvent);
    SocketService.onEvent('vehicle:assigned', _onSocketEvent);
    SocketService.onEvent('vehicle:unassigned', _onSocketEvent);
    SocketService.onEvent('driver:vehicle-updated', _onSocketEvent);
  }

  void _onSocketEvent(dynamic data) {
    if (mounted) {
      debugPrint('Dashboard refreshed via Socket event');
      _loadDashboardData();
    }
  }

  Future<void> _loadDashboardData() async {
    try {
      final profile = await AuthService.fetchProfile();
      final currentTripRes = await ApiService.get('/driver/trips/current');
      final dashRes = await ApiService.get('/driver/dashboard');
      
      bool vehicleAssigned = false;
      Map<String, dynamic>? vehObj;
      try {
        final vehRes = await ApiService.getAssignedVehicle();
        if (vehRes != null && vehRes['success'] == true) {
          final data = vehRes['data'];
          if (data != null && data['assigned'] == true && data['vehicle'] != null) {
            vehicleAssigned = true;
            vehObj = Map<String, dynamic>.from(data['vehicle']);
          }
        }
      } catch (e) {
        debugPrint('Error fetching assigned vehicle: $e');
      }

      if (mounted) {
        if (profile != null && profile['profileImage'] != null) {
          final img = profile['profileImage'].toString();
          if (img.isNotEmpty && img != ProfileState.profilePhotoUrlNotifier.value) {
            ProfileState.profilePhotoUrlNotifier.value = img;
          }
        }
        setState(() {
          _driverProfile = profile;
          _currentTrip = currentTripRes['data'];
          _dashboardData = dashRes['data'];
          _isVehicleAssigned = vehicleAssigned;
          _assignedVehicle = vehObj;
        });

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
                                _isVehicleAssigned
                                    ? '${_assignedVehicle?['vehicleNumber'] ?? _driverProfile?['vehicle'] ?? 'Assigned Vehicle'} • ID: ${_driverProfile?['driverId'] ?? 'EMP-1002'}'
                                    : 'No Vehicle Assigned • ID: ${_driverProfile?['driverId'] ?? 'EMP-1002'}',
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
                  const DriverProfileDropdown(
                    isDarkBackground: true,
                    compact: true,
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

  Widget _buildEmptyActiveTripCard() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      decoration: BoxDecoration(
        color: const Color(0xFF0F1E36), // Deep Navy Black
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F1E36).withValues(alpha: 0.3),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.06),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.local_shipping_outlined,
              color: Color(0xFFFF6A00),
              size: 28,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'No Active Trip',
            style: GoogleFonts.poppins(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            "You don't have any assigned trips yet.\nPlease wait for your manager to assign a trip.",
            textAlign: TextAlign.center,
            style: GoogleFonts.nunito(
              color: Colors.white.withValues(alpha: 0.7),
              fontSize: 12,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _handleTripAction(String tripId, String action) async {
    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => const Center(child: CircularProgressIndicator(color: Color(0xFFFF6A00))),
      );

      final res = action == 'accept'
          ? await ApiService.acceptTrip(tripId)
          : await ApiService.rejectTrip(tripId);

      if (mounted) Navigator.pop(context);
      if (!mounted) return;

      if (res != null && res['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(action == 'accept' ? 'Trip Accepted! Status updated to Scheduled.' : 'Trip Rejected.'),
            backgroundColor: action == 'accept' ? Colors.green : Colors.orange,
          ),
        );
        _loadDashboardData();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(res?['message'] ?? 'Failed to update trip'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Widget _buildPendingTripCard(BuildContext context) {
    if (_currentTrip == null || _currentTrip!.isEmpty) {
      return _buildEmptyActiveTripCard();
    }

    final tripId = _currentTrip?['tripId']?.toString() ?? _currentTrip?['_id']?.toString() ?? '';
    final tripNumber = _currentTrip?['tripNumber']?.toString() ?? '';
    final pickup = _currentTrip?['pickup']?.toString() ?? _currentTrip?['startLocation']?.toString() ?? 'N/A';
    final destination = _currentTrip?['destination']?.toString() ?? _currentTrip?['endLocation']?.toString() ?? 'N/A';
    final depTime = _currentTrip?['departureTime']?.toString() ?? 'N/A';
    final vehicle = _currentTrip?['vehicleName'] != null && _currentTrip!['vehicleName'].toString().isNotEmpty
        ? '${_currentTrip!['vehicleName']} (${_currentTrip!['vehiclePlate'] ?? ''})'
        : (_currentTrip?['vehicle']?.toString() ?? 'Vehicle Assigned');
    final cargo = '${_currentTrip?['cargoType'] ?? 'General Cargo'} (${_currentTrip?['cargoWeight'] ?? 0} kg)';

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF0F1E36),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFFF9800).withValues(alpha: 0.4)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Pending Header Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFFF9800).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFFF9800).withValues(alpha: 0.5)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.access_time_filled_rounded, color: Color(0xFFFF9800), size: 14),
                    const SizedBox(width: 6),
                    Text(
                      'Pending Acceptance',
                      style: GoogleFonts.poppins(
                        color: const Color(0xFFFF9800),
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                '#$tripNumber',
                style: GoogleFonts.poppins(
                  color: Colors.white70,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Departure Time
          Row(
            children: [
              const Icon(Icons.calendar_today_rounded, color: Color(0xFFFF6A00), size: 14),
              const SizedBox(width: 6),
              Text(
                'Departure: $depTime',
                style: GoogleFonts.nunito(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Route Details
          Row(
            children: [
              const Icon(Icons.trip_origin, color: Color(0xFFFF6A00), size: 18),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  pickup,
                  style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 8),
                child: Icon(Icons.arrow_forward_rounded, color: Colors.white54, size: 16),
              ),
              const Icon(Icons.location_on, color: Color(0xFF00E676), size: 18),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  destination,
                  style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Divider(color: Colors.white10, height: 1),
          const SizedBox(height: 14),
          // Vehicle & Cargo Metadata
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.local_shipping_outlined, color: Colors.white60, size: 16),
                  const SizedBox(width: 6),
                  Text(vehicle, style: GoogleFonts.nunito(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
                ],
              ),
              Row(
                children: [
                  const Icon(Icons.inventory_2_outlined, color: Colors.white60, size: 16),
                  const SizedBox(width: 6),
                  Text(cargo, style: GoogleFonts.nunito(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 18),
          // Action Buttons: Reject & Accept
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFFF5252)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () => _handleTripAction(tripId, 'reject'),
                  icon: const Icon(Icons.close_rounded, color: Color(0xFFFF5252), size: 18),
                  label: Text('Reject', style: GoogleFonts.poppins(color: const Color(0xFFFF5252), fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00E676),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () => _handleTripAction(tripId, 'accept'),
                  icon: const Icon(Icons.check_circle_rounded, color: Color(0xFF091522), size: 18),
                  label: Text('Accept', style: GoogleFonts.poppins(color: const Color(0xFF091522), fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // Active Trip Card Builder
  Widget _buildActiveTripCard(BuildContext context) {
    if (_currentTrip == null || _currentTrip!.isEmpty) {
      return _buildEmptyActiveTripCard();
    }

    final rawStatus = _currentTrip?['status']?.toString() ?? '';
    final statusLower = rawStatus.toLowerCase();

    if (statusLower.contains('pending')) {
      return _buildPendingTripCard(context);
    }

    final activeStatuses = [
      'assigned',
      'scheduled',
      'in progress',
      'accepted',
      'on transit',
      'enroute',
      'reach pickup',
      'pickup completed'
    ];

    if (!activeStatuses.contains(statusLower)) {
      return _buildEmptyActiveTripCard();
    }

    final tripNumberStr = _currentTrip?['tripNumber']?.toString() ?? '';
    if (tripNumberStr.isEmpty) {
      return _buildEmptyActiveTripCard();
    }

    double progressVal = 0.0;
    if (statusLower == 'completed') {
      progressVal = 1.0;
    } else if (statusLower == 'in progress' || statusLower == 'on transit' || statusLower == 'enroute') {
      final actual = double.tryParse(_currentTrip?['actualDistance']?.toString() ?? '') ?? 0.0;
      final estimated = double.tryParse(_currentTrip?['estimatedDistance']?.toString() ?? '') ?? 0.0;
      if (estimated > 0) {
        progressVal = (actual / estimated).clamp(0.0, 1.0);
        if (progressVal == 0.0) progressVal = 0.35;
      } else {
        progressVal = 0.35;
      }
    } else {
      progressVal = 0.0;
    }

    final int progressPercent = (progressVal * 100).toInt();
    final String progressText = '$progressPercent%';

    final etaText = _currentTrip?['eta'] != null
        ? 'ETA ${_currentTrip!['eta']}'
        : (_currentTrip?['departureTime'] != null
            ? 'ETA ${formatIndianDateTime(_currentTrip!['departureTime'])}'
            : '');

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
            flex: 12,
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
                  tripNumberStr,
                  style: GoogleFonts.poppins(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: (statusLower == 'assigned' || statusLower == 'scheduled')
                            ? Colors.orange
                            : const Color(0xFF22C55E), // Live / Assigned Pill
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        rawStatus.toUpperCase(),
                        style: GoogleFonts.poppins(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    if (etaText.isNotEmpty) ...[
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          etaText,
                          style: GoogleFonts.nunito(
                            color: Colors.white.withValues(alpha: 0.7),
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
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
                            _currentTrip?['pickup'] ?? _currentTrip?['startLocation'] ?? 'N/A',
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
                            _currentTrip?['destination'] ?? _currentTrip?['endLocation'] ?? 'N/A',
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
          const SizedBox(width: 10),

          // Right side: Progress Box + Progress line + CTA Button
          Expanded(
            flex: 8,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                // Progress statistic container
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white12),
                  ),
                  child: Column(
                    children: [
                      Text(
                        progressText,
                        style: GoogleFonts.poppins(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
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
                const SizedBox(height: 14),

                // Orange progress bar
                ClipRRect(
                  borderRadius: BorderRadius.circular(3),
                  child: SizedBox(
                    width: 70,
                    child: LinearProgressIndicator(
                      value: progressVal,
                      color: const Color(0xFFFF6A00),
                      backgroundColor: Colors.white12,
                      minHeight: 5,
                    ),
                  ),
                ),
                const SizedBox(height: 18),

                // View Details orange action button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      final tripIdToPass = _currentTrip?['tripId']?.toString() ??
                          _currentTrip?['_id']?.toString() ??
                          _currentTrip?['tripNumber'] ??
                          'TRP-846708';
                      await Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => TripDetailsScreen(
                            tripId: tripIdToPass,
                            tripData: _currentTrip,
                          ),
                        ),
                      );
                      _loadDashboardData();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFF6A00),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10.0),
                      ),
                      elevation: 0,
                    ),
                    child: FittedBox(
                      fit: BoxFit.scaleDown,
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
                          const SizedBox(width: 2),
                          const Icon(Icons.chevron_right, size: 14),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Quick Actions Grid Builder
  Widget _buildQuickActionsRow(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (!_isVehicleAssigned) ...[
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
            padding: const EdgeInsets.all(14.0),
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF), // Light blue box
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFBFDBFE)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.info_outline_rounded,
                  color: Color(0xFF2563EB),
                  size: 20,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'No vehicle is currently assigned. You can view your previous records, but new fuel entries and maintenance tickets will be available once a vehicle is assigned.',
                    style: GoogleFonts.nunito(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF1E40AF),
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
        ],
        GridView.count(
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
              MainNavigationScreen.selectedTabNotifier.value = 1;
            }),
            _buildActionCard(context, Icons.settings_outlined, 'Settings', () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const SettingsScreen()),
              );
            }),
          ],
        ),
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
    final List serverNotifs = _dashboardData?['notifications'] ?? [];
    if (serverNotifs.isEmpty && NotificationsScreen.notifications.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF132235),
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Center(
          child: Text(
            'No recent notifications',
            style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
          ),
        ),
      );
    }

    final itemsToDisplay = serverNotifs.isNotEmpty
        ? serverNotifs.take(3).map((item) {
            return {
              'title': item['title'] ?? 'Fleet Notification',
              'subtitle': item['message'] ?? item['description'] ?? '',
              'time': formatNotificationTime(item['createdAt']),
              'isUnread': !(item['isRead'] ?? false),
              'icon': item['type'] == 'trip_assigned' ? Icons.inventory_2_outlined : Icons.notifications_none_outlined,
            };
          }).toList()
        : NotificationsScreen.notifications.take(3).map((item) {
            return {
              'title': item.title,
              'subtitle': item.description,
              'time': item.timestamp,
              'isUnread': !item.isRead,
              'icon': item.icon,
            };
          }).toList();

    return Column(
      children: itemsToDisplay.map<Widget>((notif) {
        return _buildNotificationItem(
          context,
          icon: notif['icon'] as IconData,
          iconBgColor: const Color(0xFF1E293B),
          iconColor: const Color(0xFF38BDF8),
          title: notif['title'] as String,
          subtitle: notif['subtitle'] as String,
          time: notif['time'] as String,
          isUnread: notif['isUnread'] as bool,
          onTap: () {
            MainNavigationScreen.selectedTabNotifier.value = 3;
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
