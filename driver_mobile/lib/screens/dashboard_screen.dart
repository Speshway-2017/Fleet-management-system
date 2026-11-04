import 'dart:convert';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/date_formatter.dart';
import 'profile/profile_screen.dart';
import 'trip_details_screen.dart';
import 'completed_trip_details_screen.dart';
import 'vehicle_overview_screen.dart';
import 'main_navigation_screen.dart';
import 'notifications/notifications_screen.dart';
import 'notifications/notification_details_screen.dart';
import 'settings/settings_screen.dart';
import 'fuel_overview_screen.dart';
import 'support_history_screen.dart';
import '../widgets/driver_profile_dropdown.dart';

import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/location_service.dart';
import '../services/socket_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  static void clearStaticCache() {
    _DashboardScreenState._cachedDriverProfile = null;
    _DashboardScreenState._cachedCurrentTrip = null;
    _DashboardScreenState._cachedDashboardData = null;
    _DashboardScreenState._cachedIsVehicleAssigned = null;
    _DashboardScreenState._cachedVehicleNumber = null;
    ProfileState.profilePhotoUrlNotifier.value = '';
  }

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  // In-memory cache for instant zero-delay restoration across tab switches
  static Map<String, dynamic>? _cachedDriverProfile;
  static Map<String, dynamic>? _cachedCurrentTrip;
  static Map<String, dynamic>? _cachedDashboardData;
  static bool? _cachedIsVehicleAssigned;
  static String? _cachedVehicleNumber;

  Map<String, dynamic>? _driverProfile;
  Map<String, dynamic>? _currentTrip;
  Map<String, dynamic>? _dashboardData;
  bool _isVehicleAssigned = false;
  bool _isOnDuty = true;
  List<dynamic> _recentTrips = [];
  String? _vehicleNumber;
  bool _isFetching = false;

  @override
  void initState() {
    super.initState();
    // 1. Immediately hydrate from memory cache for instant 0ms rendering
    _driverProfile = _cachedDriverProfile;
    _currentTrip = _cachedCurrentTrip;
    _dashboardData = _cachedDashboardData;
    _isVehicleAssigned = _cachedIsVehicleAssigned ?? false;
    _vehicleNumber = _cachedVehicleNumber;

    // 2. Hydrate from persistent disk cache on cold starts
    _loadFromLocalCache();

    MainNavigationScreen.selectedTabNotifier.addListener(_onTabChanged);
    _loadDashboardData();
    
    // Register socket listeners for instant updates
    SocketService.onEvent('notification:new', _onSocketEvent);
    SocketService.onEvent('trip:assigned', _onSocketEvent);
    SocketService.onEvent('trip:status-updated', _onSocketEvent);
  }

  Future<void> _loadFromLocalCache() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      bool stateChanged = false;

      final cachedDuty = prefs.getBool('driver_is_on_duty_cache');
      if (cachedDuty != null && cachedDuty != _isOnDuty) {
        _isOnDuty = cachedDuty;
        stateChanged = true;
      }

      if (_driverProfile == null) {
        final cachedProf = prefs.getString('driver_profile_cache') ?? prefs.getString('driver_profile');
        if (cachedProf != null && cachedProf.isNotEmpty) {
          final decoded = jsonDecode(cachedProf);
          if (decoded is Map<String, dynamic>) {
            _driverProfile = decoded;
            _cachedDriverProfile = decoded;
            final isDutyVal = decoded['isDuty'] ?? decoded['isOnline'] ?? (decoded['driverStatus'] != 'OFFLINE' && decoded['driverStatus'] != 'OFF_DUTY');
            final dutyBool = isDutyVal == true || isDutyVal == 'true' || isDutyVal == 1;
            if (_isOnDuty != dutyBool) {
              _isOnDuty = dutyBool;
            }
            stateChanged = true;
            final img = decoded['profileImage']?.toString() ?? '';
            if (ProfileState.profilePhotoUrlNotifier.value != img) {
              ProfileState.profilePhotoUrlNotifier.value = img;
            }
          }
        }
      }

      if (_currentTrip == null) {
        final cachedTrip = prefs.getString('driver_current_trip_cache');
        if (cachedTrip != null && cachedTrip.isNotEmpty) {
          final decoded = jsonDecode(cachedTrip);
          if (decoded is Map<String, dynamic>) {
            _currentTrip = decoded;
            _cachedCurrentTrip = decoded;
            _isVehicleAssigned = prefs.getBool('driver_is_vehicle_assigned_cache') ?? true;
            _vehicleNumber = prefs.getString('driver_vehicle_number_cache');
            _cachedIsVehicleAssigned = _isVehicleAssigned;
            _cachedVehicleNumber = _vehicleNumber;
            stateChanged = true;
          }
        }
      }

      if (_dashboardData == null) {
        final cachedDash = prefs.getString('driver_dashboard_data_cache');
        if (cachedDash != null && cachedDash.isNotEmpty) {
          final decoded = jsonDecode(cachedDash);
          if (decoded is Map<String, dynamic>) {
            _dashboardData = decoded;
            _cachedDashboardData = decoded;
            stateChanged = true;
          }
        }
      }

      if (stateChanged && mounted) {
        setState(() {});
      }
    } catch (e) {
      debugPrint('Error reading dashboard local cache: $e');
    }
  }

  void _onSocketEvent(dynamic data) {
    if (mounted) {
      debugPrint('Dashboard refreshed via Socket event');
      _loadDashboardData();
    }
  }

  Future<void> _loadDashboardData() async {
    if (_isFetching) return;
    _isFetching = true;

    try {
      // Fetch profile, current trip, and dashboard metrics in PARALLEL via Future.wait
      final results = await Future.wait([
        AuthService.fetchProfile(),
        ApiService.get('/driver/trips/current'),
        ApiService.get('/driver/dashboard'),
        ApiService.get('/driver/trips'),
      ]);

      final profile = results[0] as Map<String, dynamic>?;
      final currentTripRes = results[1] as Map<String, dynamic>?;
      final dashRes = results[2] as Map<String, dynamic>?;
      final allTripsRes = results.length > 3 ? results[3] as Map<String, dynamic>? : null;

      if (mounted) {
        if (profile != null) {
          final img = profile['profileImage']?.toString() ?? '';
          if (img != ProfileState.profilePhotoUrlNotifier.value) {
            ProfileState.profilePhotoUrlNotifier.value = img;
          }
        }

        bool isAssigned = false;
        String? vehicleNum;

        final tripData = currentTripRes?['data'];
        if (tripData != null && tripData is Map<String, dynamic>) {
          final rawStatus = tripData['status']?.toString() ?? '';
          final statusLower = rawStatus.toLowerCase();
          final activeStatuses = [
            'pending driver acceptance', 'pending', 'assigned', 'scheduled', 'in progress', 'accepted', 
            'on transit', 'enroute', 'reach pickup', 'pickup completed', 
            'waiting for manager approval'
          ];
          if (activeStatuses.contains(statusLower)) {
            final vName = tripData['vehicleName']?.toString() ?? '';
            final vPlate = tripData['vehiclePlate']?.toString() ?? '';
            if (vPlate.isNotEmpty) {
              isAssigned = true;
              vehicleNum = vName.isNotEmpty ? '$vName – $vPlate' : vPlate;
            } else {
              final vId = tripData['vehicle']?.toString() ?? '';
              if (vId.isNotEmpty && vId != 'Unassigned') {
                isAssigned = true;
                vehicleNum = vId;
              }
            }
          }
        }

        final rawTrip = currentTripRes?['data'];
        Map<String, dynamic>? activeTrip;
        if (rawTrip != null && rawTrip is Map<String, dynamic>) {
          final rawStatus = (rawTrip['status']?.toString() ?? '').toLowerCase();
          final nonActive = ['completed', 'cancelled', 'rejected'];
          if (!nonActive.contains(rawStatus)) {
            activeTrip = rawTrip;
          }
        }

        // Only query /driver/vehicle if active trip has no vehicle assigned
        if (activeTrip != null && !isAssigned) {
          try {
            final vehRes = await ApiService.get('/driver/vehicle');
            if (vehRes != null && vehRes['success'] == true) {
              final data = vehRes['data'];
              if (data != null && data['assigned'] == true && data['vehicle'] != null) {
                isAssigned = true;
                final vName = data['vehicle']['vehicleName'] ?? data['vehicle']['brand'] ?? '';
                final vPlate = data['vehicle']['vehicleNumber'] ?? data['vehicle']['registrationNumber'] ?? '';
                if (vPlate.isNotEmpty) {
                  vehicleNum = vName.isNotEmpty ? '$vName – $vPlate' : vPlate;
                }
              }
            }
          } catch (_) {}
        }

        // Update in-memory static cache
        if (profile != null) _cachedDriverProfile = profile;
        _cachedCurrentTrip = activeTrip;
        if (dashRes != null && dashRes['data'] != null) _cachedDashboardData = dashRes['data'];

        List<dynamic> fetchedTrips = [];
        if (allTripsRes != null && allTripsRes['data'] is List) {
          fetchedTrips = allTripsRes['data'] as List;
        } else if (dashRes != null && dashRes['data'] != null && dashRes['data']['todaySchedule'] is List) {
          fetchedTrips = dashRes['data']['todaySchedule'] as List;
        }
        _recentTrips = fetchedTrips.take(2).toList();

        _cachedIsVehicleAssigned = isAssigned;
        _cachedVehicleNumber = vehicleNum;

        if (profile != null) {
          final isDutyVal = profile['isDuty'] ?? profile['isOnline'] ?? (profile['driverStatus'] != 'OFFLINE' && profile['driverStatus'] != 'OFF_DUTY');
          final dutyBool = isDutyVal == true || isDutyVal == 'true' || isDutyVal == 1;
          _isOnDuty = dutyBool;
        }

        setState(() {
          _driverProfile = profile ?? _driverProfile;
          _currentTrip = activeTrip;
          _dashboardData = (dashRes != null && dashRes['data'] != null) ? dashRes['data'] : _dashboardData;
          _isVehicleAssigned = isAssigned;
          _vehicleNumber = vehicleNum;
        });

        // Background persistence
        _persistDashboardCache(profile, activeTrip, dashRes?['data'], isAssigned, vehicleNum);

        if (_currentTrip != null && _currentTrip!['tripId'] != null) {
          LocationTrackingService.startTracking(tripId: _currentTrip!['tripId'].toString());
        } else {
          LocationTrackingService.stopTracking();
        }
      }
    } catch (e) {
      debugPrint('Error loading dashboard data: $e');
    } finally {
      _isFetching = false;
    }
  }

  void _persistDashboardCache(
    Map<String, dynamic>? profile,
    Map<String, dynamic>? activeTrip,
    dynamic dashboardData,
    bool isAssigned,
    String? vehicleNum,
  ) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      prefs.setBool('driver_is_on_duty_cache', _isOnDuty);
      if (profile != null) {
        prefs.setString('driver_profile_cache', jsonEncode(profile));
      }
      if (activeTrip != null) {
        prefs.setString('driver_current_trip_cache', jsonEncode(activeTrip));
      } else {
        prefs.remove('driver_current_trip_cache');
      }
      if (dashboardData != null && dashboardData is Map) {
        prefs.setString('driver_dashboard_data_cache', jsonEncode(dashboardData));
      }
      prefs.setBool('driver_is_vehicle_assigned_cache', isAssigned);
      if (vehicleNum != null && vehicleNum.isNotEmpty) {
        prefs.setString('driver_vehicle_number_cache', vehicleNum);
      } else {
        prefs.remove('driver_vehicle_number_cache');
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    MainNavigationScreen.selectedTabNotifier.removeListener(_onTabChanged);
    super.dispose();
  }

  
  Future<void> _handleDutyToggle(bool newValue) async {
    setState(() {
      _isOnDuty = newValue;
    });

    final newStatus = newValue ? 'AVAILABLE' : 'OFFLINE';
    try {
      final res = await ApiService.put('/driver/status', {
        'isOnline': newValue,
        'driverStatus': newStatus,
        'status': newValue ? 'Available' : 'Offline',
      });

      if (_driverProfile != null) {
        _driverProfile!['isOnline'] = newValue;
        _driverProfile!['isDuty'] = newValue;
        _driverProfile!['driverStatus'] = newStatus;
        _driverProfile!['status'] = newValue ? 'Available' : 'Offline';
        _cachedDriverProfile = _driverProfile;
      }

      final prefs = await SharedPreferences.getInstance();
      prefs.setBool('driver_is_on_duty_cache', newValue);
      if (_driverProfile != null) {
        prefs.setString('driver_profile_cache', jsonEncode(_driverProfile));
      }

      if (!mounted) return;

      if (res != null && res['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              newValue ? 'Status updated to On Duty 🟢' : 'Status updated to Off Duty ⚪',
              style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w500),
            ),
            backgroundColor: newValue ? const Color(0xFF10B981) : const Color(0xFF334155),
            duration: const Duration(seconds: 2),
            behavior: SnackBarBehavior.floating,
          ),
        );
      } else {
        await ApiService.put('/driver/profile', {
          'isOnline': newValue,
          'driverStatus': newStatus,
          'status': newValue ? 'Available' : 'Offline',
        });
      }
    } catch (e) {
      debugPrint('Error updating duty status: $e');
      try {
        await ApiService.put('/driver/profile', {
          'isOnline': newValue,
          'driverStatus': newStatus,
          'status': newValue ? 'Available' : 'Offline',
        });
      } catch (err2) {
        debugPrint('Fallback profile update note: $err2');
      }
    }
  }

  void _onTabChanged() {
    if (mounted && MainNavigationScreen.selectedTabNotifier.value == 2) {
      _loadDashboardData();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF071426), // Deep Navy Matching Reference Header
      body: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Top Nav Header with Commercial Truck Background Image & Text Overlay
            Container(
              height: 76,
              width: double.infinity,
              color: const Color(0xFF071426),
              child: Stack(
                children: [
                  // 1. Semi-truck Background Image Aligned on Right
                  Positioned.fill(
                    child: Image.asset(
                      'assets/images/vehicle.png',
                      fit: BoxFit.cover,
                      alignment: const Alignment(0.70, -0.15),
                      errorBuilder: (ctx, err, st) => Image.asset(
                        'assets/images/white_van.png',
                        fit: BoxFit.cover,
                        errorBuilder: (ctx2, err2, st2) => Container(
                          color: const Color(0xFF071426),
                        ),
                      ),
                    ),
                  ),

                  // 2. Horizontal Navy Gradient Scrim (Heavy Navy Left, Fading Right)
                  Positioned.fill(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.centerLeft,
                          end: Alignment.centerRight,
                          colors: [
                            const Color(0xFF071426),
                            const Color(0xFF071426).withValues(alpha: 0.94),
                            const Color(0xFF071426).withValues(alpha: 0.45),
                            Colors.transparent,
                          ],
                          stops: const [0.0, 0.45, 0.75, 1.0],
                        ),
                      ),
                    ),
                  ),

                  // 3. Vertical Gradient Scrim for Contrast & Top Bar Legibility
                  Positioned.fill(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            const Color(0xFF071426).withValues(alpha: 0.55),
                            Colors.transparent,
                            const Color(0xFF071426).withValues(alpha: 0.65),
                          ],
                          stops: const [0.0, 0.5, 1.0],
                        ),
                      ),
                    ),
                  ),

                  // 4. Overlaid Header Content (Logo, Fleet Management Title, On Duty Switch & Notifications)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        // Brand Emblem & Title
                        Expanded(
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(9.0),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.18),
                                      blurRadius: 6,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
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
                                          color: Color(0xFF071426),
                                          size: 20,
                                        );
                                      },
                                    );
                                  },
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      'Fleet Management',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.poppins(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                        color: Colors.white,
                                        letterSpacing: 0.2,
                                      ),
                                    ),
                                    Text(
                                      'Commercial Logistics',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.nunito(
                                        fontSize: 10.5,
                                        fontWeight: FontWeight.w500,
                                        color: const Color(0xFF94A3B8),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 6),

                        // Right: On Duty Switch Pill + Alerts Bell
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            // On Duty Pill Switch
                            GestureDetector(
                              onTap: () => _handleDutyToggle(!_isOnDuty),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0F243E).withValues(alpha: 0.85),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: Colors.white.withValues(alpha: 0.20),
                                    width: 1.0,
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      _isOnDuty ? 'On Duty' : 'Off Duty',
                                      style: GoogleFonts.poppins(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.white,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    AnimatedContainer(
                                      duration: const Duration(milliseconds: 200),
                                      width: 32,
                                      height: 18,
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(10),
                                        color: _isOnDuty ? const Color(0xFF10B981) : const Color(0xFF475569),
                                      ),
                                      child: AnimatedAlign(
                                        duration: const Duration(milliseconds: 200),
                                        alignment: _isOnDuty ? Alignment.centerRight : Alignment.centerLeft,
                                        child: Container(
                                          width: 14,
                                          height: 14,
                                          margin: const EdgeInsets.symmetric(horizontal: 2),
                                          decoration: const BoxDecoration(
                                            shape: BoxShape.circle,
                                            color: Colors.white,
                                            boxShadow: [
                                              BoxShadow(
                                                color: Colors.black26,
                                                blurRadius: 2,
                                                offset: Offset(0, 1),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),

                            // Notification Bell Button with Red Dot Badge
                            InkWell(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => const NotificationsScreen(),
                                  ),
                                );
                              },
                              borderRadius: BorderRadius.circular(20),
                              child: Container(
                                width: 35,
                                height: 35,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Colors.white.withValues(alpha: 0.10),
                                  border: Border.all(
                                    color: Colors.white.withValues(alpha: 0.18),
                                    width: 1.0,
                                  ),
                                ),
                                child: Stack(
                                  alignment: Alignment.center,
                                  children: [
                                    const Icon(
                                      Icons.notifications_none_rounded,
                                      color: Colors.white,
                                      size: 20,
                                    ),
                                    Positioned(
                                      right: 6,
                                      top: 6,
                                      child: Container(
                                        width: 7,
                                        height: 7,
                                        decoration: const BoxDecoration(
                                          color: Color(0xFFEF4444),
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Main Wave-Curved Content Area
            Expanded(
              child: ClipPath(
                clipper: HeaderWaveClipper(),
                child: Container(
                  color: const Color(0xFFF8FAFC),
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.only(top: 22, bottom: 76),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Good Morning Greeting & ID Chip (Moved to down of the top card)
                        Padding(
                          padding: const EdgeInsets.fromLTRB(20.0, 4.0, 20.0, 16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Good Morning, ${(_driverProfile?['fullName'] ?? 'Abhi').toString().split(' ')[0]} 👋',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.poppins(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: const Color(0xFF0F1E38),
                                  letterSpacing: -0.3,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3.5),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFFFF7ED),
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(
                                        color: const Color(0xFFFFEDD5),
                                        width: 1.0,
                                      ),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Icon(
                                          Icons.badge_rounded,
                                          color: Color(0xFFF97316),
                                          size: 13,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          'ID: ${_driverProfile?['employeeId'] ?? _driverProfile?['driverId'] ?? 'EMP-916164'}',
                                          style: GoogleFonts.nunito(
                                            fontSize: 11.5,
                                            fontWeight: FontWeight.w700,
                                            color: const Color(0xFFC2410C),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  if (_isVehicleAssigned && _vehicleNumber != null && _vehicleNumber!.isNotEmpty) ...[
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFEFF6FF),
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(
                                          color: const Color(0xFFDBEAFE),
                                          width: 1.0,
                                        ),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          const Icon(
                                            Icons.local_shipping_outlined,
                                            color: Color(0xFF2563EB),
                                            size: 13,
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            _vehicleNumber!,
                                            style: GoogleFonts.poppins(
                                              fontSize: 11,
                                              fontWeight: FontWeight.w600,
                                              color: const Color(0xFF1D4ED8),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ],
                          ),
                        ),
                        // 1. Active Trip Card (Only shown when active trip is in progress)
                        if (_hasActiveTrip) ...[
                          _buildActiveTripCard(context),
                          const SizedBox(height: 20),
                        ],

                        // 1. Dashboard Overview Header & 2x2 Stats Grid
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20.0),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(5),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFEFF6FF),
                                  borderRadius: BorderRadius.circular(7),
                                ),
                                child: const Icon(
                                  Icons.bar_chart_rounded,
                                  color: Color(0xFF2563EB),
                                  size: 19,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'Dashboard Overview',
                                style: GoogleFonts.poppins(
                                  fontSize: 16.5,
                                  fontWeight: FontWeight.bold,
                                  color: const Color(0xFF0F1E38),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 14),
                        _buildStatsOverview(context),

                        const SizedBox(height: 24),

                        // 2. Recent Trips Header & Items (Displays recent 2 trips)
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(5),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF0F1E38),
                                      borderRadius: BorderRadius.circular(7),
                                    ),
                                    child: const Icon(
                                      Icons.business_center_rounded,
                                      color: Colors.white,
                                      size: 15,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Recent Trips',
                                    style: GoogleFonts.poppins(
                                      fontSize: 16.5,
                                      fontWeight: FontWeight.bold,
                                      color: const Color(0xFF0F1E38),
                                    ),
                                  ),
                                ],
                              ),
                              InkWell(
                                onTap: () {
                                  MainNavigationScreen.selectedTabNotifier.value = 3;
                                },
                                child: Text(
                                  'View All',
                                  style: GoogleFonts.poppins(
                                    fontSize: 13.5,
                                    fontWeight: FontWeight.bold,
                                    color: const Color(0xFFF97316),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        _buildRecentTrips(context),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: Container(
        margin: const EdgeInsets.only(bottom: 6, right: 2),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const SupportHistoryScreen(),
                ),
              );
            },
            borderRadius: BorderRadius.circular(28),
            child: Ink(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFF7A1A), Color(0xFFE65100)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(28),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFFF7A1A).withValues(alpha: 0.38),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.headset_mic_rounded,
                    color: Colors.white,
                    size: 18,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'Help',
                    style: GoogleFonts.poppins(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.3,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
    );
  }

  bool get _hasActiveTrip {
    if (_currentTrip == null || _currentTrip!.isEmpty) return false;
    final rawStatus = _currentTrip?['status']?.toString() ?? '';
    final statusLower = rawStatus.toLowerCase();
    if (statusLower.contains('pending') || statusLower == 'assigned') return true;
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
    if (!activeStatuses.contains(statusLower)) return false;
    final tripNumberStr = _currentTrip?['tripNumber']?.toString() ?? '';
    return tripNumberStr.isNotEmpty;
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
      return const SizedBox.shrink();
    }

    final tripId = _currentTrip?['tripId']?.toString() ?? _currentTrip?['_id']?.toString() ?? '';
    final tripNumber = _currentTrip?['tripNumber']?.toString() ?? '';
    final pickup = _currentTrip?['pickup']?.toString() ?? _currentTrip?['startLocation']?.toString() ?? 'N/A';
    final destination = _currentTrip?['destination']?.toString() ?? _currentTrip?['endLocation']?.toString() ?? 'N/A';
    final depTime = _currentTrip?['departureTime']?.toString() ?? 'N/A';
    final vehicle = _currentTrip?['vehicleName'] != null && _currentTrip!['vehicleName'].toString().isNotEmpty
        ? '${_currentTrip!['vehicleName']} (${_currentTrip!['vehiclePlate'] ?? ''})'
        : (_currentTrip?['vehicle']?.toString() ?? 'No Vehicle Assigned');
    final cargo = '${_currentTrip?['cargoType'] ?? 'General Cargo'} (${_currentTrip?['cargoWeight'] ?? 0} kg)';

    Future<void> openPendingTripDetails() async {
      final tripIdToPass = tripId.isNotEmpty
          ? tripId
          : (_currentTrip?['tripNumber']?.toString() ?? 'TRP-846708');
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
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
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
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: openPendingTripDetails,
          child: Padding(
            padding: const EdgeInsets.all(20),
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
    ),
    ),
    ),
    );
  }

  // Active Trip Card Builder
  Widget _buildActiveTripCard(BuildContext context) {
    if (!_hasActiveTrip) {
      return const SizedBox.shrink();
    }

    final rawStatus = _currentTrip?['status']?.toString() ?? '';
    final statusLower = rawStatus.toLowerCase();

    if (statusLower.contains('pending') || statusLower == 'assigned') {
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
      return const SizedBox.shrink();
    }

    final tripNumberStr = _currentTrip?['tripNumber']?.toString() ?? '';
    if (tripNumberStr.isEmpty) {
      return const SizedBox.shrink();
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

    final activeVehicle = _currentTrip?['vehicleName'] != null && _currentTrip!['vehicleName'].toString().isNotEmpty
        ? '${_currentTrip!['vehicleName']} – ${_currentTrip!['vehiclePlate'] ?? ''}'
        : (_currentTrip?['vehicle']?.toString() ?? 'No Vehicle Assigned');

    Future<void> openTripDetails() async {
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
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
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
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: openTripDetails,
          child: Padding(
            padding: const EdgeInsets.all(16),
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
                const SizedBox(height: 14),
                Row(
                  children: [
                    const Icon(
                      Icons.local_shipping_outlined,
                      color: Colors.white54,
                      size: 14,
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        activeVehicle,
                        style: GoogleFonts.nunito(
                          color: Colors.white70,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
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
                    onPressed: openTripDetails,
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
    ),
    ),
    ),
    );
  }

  // ---------------------------------------------------------------------------
  // DASHBOARD OVERVIEW (2x2 Grid Matching Reference Image)
  // ---------------------------------------------------------------------------
  Widget _buildStatsOverview(BuildContext context) {
    final activeTrips = (_dashboardData?['activeTrips'] ?? 0).toString();
    final upcomingTrips = (_dashboardData?['upcomingTrips'] ?? 0).toString();
    final completedTrips = (_dashboardData?['completedTrips'] ?? 5).toString();
    final totalTrips = ((_dashboardData?['activeTrips'] ?? 0) +
            (_dashboardData?['upcomingTrips'] ?? 0) +
            (_dashboardData?['completedTrips'] ?? 5))
        .toString();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          // Row 1: Active Trip & Upcoming
          Row(
            children: [
              Expanded(
                child: _buildOverviewCard(
                  context,
                  value: activeTrips,
                  label: 'Active Trip',
                  icon: Icons.local_shipping_rounded,
                  iconColor: const Color(0xFF2563EB),
                  iconBgColor: const Color(0xFFEFF6FF),
                  waveColor: const Color(0xFFDBEAFE).withValues(alpha: 0.55),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildOverviewCard(
                  context,
                  value: upcomingTrips,
                  label: 'Upcoming',
                  icon: Icons.calendar_month_rounded,
                  iconColor: const Color(0xFF10B981),
                  iconBgColor: const Color(0xFFECFDF5),
                  waveColor: const Color(0xFFD1FAE5).withValues(alpha: 0.55),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Row 2: Completed & Total Trips
          Row(
            children: [
              Expanded(
                child: _buildOverviewCard(
                  context,
                  value: completedTrips,
                  label: 'Completed',
                  icon: Icons.check_circle_outline_rounded,
                  iconColor: const Color(0xFFF97316),
                  iconBgColor: const Color(0xFFFFF7ED),
                  waveColor: const Color(0xFFFFEDD5).withValues(alpha: 0.65),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildOverviewCard(
                  context,
                  value: totalTrips,
                  label: 'Total Trips',
                  icon: Icons.fact_check_outlined,
                  iconColor: const Color(0xFF8B5CF6),
                  iconBgColor: const Color(0xFFF5F3FF),
                  waveColor: const Color(0xFFEDE9FE).withValues(alpha: 0.65),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildOverviewCard(
    BuildContext context, {
    required String value,
    required String label,
    required IconData icon,
    required Color iconColor,
    required Color iconBgColor,
    required Color waveColor,
  }) {
    return Container(
      height: 96,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Stack(
          children: [
            // Bottom pastel organic wave shape
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              height: 28,
              child: ClipPath(
                clipper: CardBottomWaveClipper(),
                child: Container(
                  color: waveColor,
                ),
              ),
            ),
            // Card Content: Icon + Count & Label
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: iconBgColor,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(icon, color: iconColor, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          value,
                          style: GoogleFonts.poppins(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF0F1E38),
                            height: 1.1,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          label,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: const Color(0xFF64748B),
                          ),
                        ),
                      ],
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

  // Recent Trips Builder (Displays recent 2 trips matching reference layout)
  Widget _buildRecentTrips(BuildContext context) {
    List<dynamic> tripsList = [];
    if (_recentTrips.isNotEmpty) {
      tripsList = _recentTrips;
    } else if (_dashboardData?['todaySchedule'] is List && (_dashboardData!['todaySchedule'] as List).isNotEmpty) {
      tripsList = _dashboardData!['todaySchedule'] as List;
    }

    List<dynamic> itemsToDisplay = tripsList.take(2).toList();

    // Fallback sample trips matching reference image when database is fresh/empty
    if (itemsToDisplay.isEmpty) {
      itemsToDisplay = [
        {
          'tripNumber': 'TRP-945845',
          'status': 'Completed',
          'pickup': 'Vijayawada',
          'destination': 'Hyderabad',
          'departureTime': '2026-11-02T14:50:00.000Z',
          'distance': '285',
        },
        {
          'tripNumber': 'TRP-542307',
          'status': 'Completed',
          'pickup': 'Khammam',
          'destination': 'Hyderabad',
          'departureTime': '2026-11-01T10:20:00.000Z',
          'distance': '278',
        },
      ];
    }

    return Column(
      children: itemsToDisplay.map<Widget>((item) {
        final Map<String, dynamic> trip = item is Map<String, dynamic>
            ? item
            : Map<String, dynamic>.from(item as Map);

        final rawTripNumber = trip['tripNumber']?.toString() ??
            trip['tripId']?.toString() ??
            trip['_id']?.toString() ??
            '';
        final tripNumberDisplay = rawTripNumber.isEmpty
            ? '#TRP-945845'
            : (rawTripNumber.startsWith('#') ? rawTripNumber : '#$rawTripNumber');

        final status = trip['status']?.toString() ?? 'Completed';
        final pickup = trip['pickup']?.toString() ??
            trip['startLocation']?.toString() ??
            'Vijayawada';
        final destination = trip['destination']?.toString() ??
            trip['dropoff']?.toString() ??
            trip['endLocation']?.toString() ??
            'Hyderabad';
        final distance = trip['distance']?.toString() ?? '285';
        final date = trip['departureTime'] != null
            ? formatIndianDateTime(trip['departureTime'])
            : (trip['createdAt'] != null
                ? formatIndianDateTime(trip['createdAt'])
                : '02/11/2026 02:50 PM');

        return _buildTripItem(
          context,
          tripNumber: tripNumberDisplay,
          status: status,
          pickup: pickup,
          destination: destination,
          distance: distance,
          date: date,
          onTap: () {
            final tripId = trip['tripId']?.toString() ??
                trip['_id']?.toString() ??
                trip['tripNumber']?.toString() ??
                '';
            final statusLower = status.toLowerCase();
            if (statusLower == 'completed') {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => CompletedTripDetailsScreen(
                    tripId: tripId,
                    tripData: trip,
                  ),
                ),
              ).then((_) {
                if (mounted) _loadDashboardData();
              });
            } else {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => TripDetailsScreen(
                    tripId: tripId,
                    tripData: trip,
                  ),
                ),
              ).then((_) {
                if (mounted) _loadDashboardData();
              });
            }
          },
        );
      }).toList(),
    );
  }

  Widget _buildTripItem(
    BuildContext context, {
    required String tripNumber,
    required String status,
    required String pickup,
    required String destination,
    required String distance,
    required String date,
    required VoidCallback onTap,
  }) {
    Color statusColor = const Color(0xFF059669);
    Color statusBgColor = const Color(0xFFECFDF5);
    final statusLower = status.toLowerCase();

    if (statusLower == 'completed') {
      statusColor = const Color(0xFF059669);
      statusBgColor = const Color(0xFFECFDF5);
    } else if (statusLower.contains('progress') ||
        statusLower.contains('transit') ||
        statusLower.contains('enroute')) {
      statusColor = const Color(0xFF2563EB);
      statusBgColor = const Color(0xFFEFF6FF);
    } else if (statusLower.contains('pending')) {
      statusColor = const Color(0xFFEA580C);
      statusBgColor = const Color(0xFFFFF7ED);
    } else if (statusLower == 'cancelled' || statusLower == 'rejected') {
      statusColor = const Color(0xFFDC2626);
      statusBgColor = const Color(0xFFFEF2F2);
    } else {
      statusColor = const Color(0xFF0284C7);
      statusBgColor = const Color(0xFFF0F9FF);
    }

    return Container(
      margin: const EdgeInsets.only(left: 16, right: 16, bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Row: Orange Truck Icon + Trip Number & Status Badge
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF7ED),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(
                            Icons.local_shipping_rounded,
                            color: Color(0xFFF97316),
                            size: 17,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Flexible(
                          child: Text(
                            tripNumber,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.poppins(
                              fontWeight: FontWeight.w800,
                              fontSize: 14.5,
                              color: const Color(0xFF0F1E38),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusBgColor,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      status.toUpperCase(),
                      style: GoogleFonts.poppins(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w700,
                        color: statusColor,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Route Row: Origin ➔ Destination
              Row(
                children: [
                  const Icon(
                    Icons.radio_button_checked,
                    color: Color(0xFF2563EB),
                    size: 14,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      pickup,
                      style: GoogleFonts.poppins(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF1E293B),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8.0),
                    child: Icon(
                      Icons.arrow_forward_rounded,
                      color: Colors.grey.withValues(alpha: 0.5),
                      size: 15,
                    ),
                  ),
                  const Icon(
                    Icons.location_on,
                    color: Color(0xFFEF4444),
                    size: 15,
                  ),
                  const SizedBox(width: 5),
                  Expanded(
                    child: Text(
                      destination,
                      style: GoogleFonts.poppins(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF1E293B),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Bottom Row: Date & Distance
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (date.isNotEmpty)
                    Expanded(
                      child: Row(
                        children: [
                          Icon(
                            Icons.schedule_rounded,
                            size: 13,
                            color: Colors.grey.withValues(alpha: 0.7),
                          ),
                          const SizedBox(width: 5),
                          Flexible(
                            child: Text(
                              date,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.nunito(
                                fontSize: 11.5,
                                color: const Color(0xFF64748B),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    const SizedBox.shrink(),
                  const SizedBox(width: 8),
                  if (distance.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.alt_route_rounded,
                            size: 13,
                            color: Color(0xFF475569),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            distance.contains('km') || distance.contains('KM')
                                ? distance
                                : '$distance km',
                            style: GoogleFonts.poppins(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF475569),
                            ),
                          ),
                        ],
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

// ---------------------------------------------------------------------------
// ORGANIC TOP WAVE CLIPPER (Matches reference image wave transition)
// ---------------------------------------------------------------------------
class HeaderWaveClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    path.moveTo(0, 16);
    path.quadraticBezierTo(size.width * 0.28, 26, size.width * 0.55, 14);
    path.quadraticBezierTo(size.width * 0.82, 6, size.width, 12);
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}

// ---------------------------------------------------------------------------
// STAT CARD BOTTOM WAVE CLIPPER (Matches reference image card bottom tint)
// ---------------------------------------------------------------------------
class CardBottomWaveClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    path.moveTo(0, 10);
    path.quadraticBezierTo(size.width * 0.32, 0, size.width * 0.62, 12);
    path.quadraticBezierTo(size.width * 0.85, 20, size.width, 8);
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}
