import '../services/localization_service.dart';
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

  static Map<String, dynamic>? get cachedCurrentTrip => _DashboardScreenState._cachedCurrentTrip;
  static Map<String, dynamic>? get cachedDashboardData => _DashboardScreenState._cachedDashboardData;
  static bool? get cachedIsVehicleAssigned => _DashboardScreenState._cachedIsVehicleAssigned;
  static String? get cachedVehicleNumber => _DashboardScreenState._cachedVehicleNumber;

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
      if (data != null && data is Map) {
        final tripDriver = data['driver'];
        final assignedDriverId = (tripDriver is Map ? (tripDriver['_id'] ?? tripDriver['id']) : tripDriver)?.toString() ?? '';
        final myDriverId = _driverProfile?['_id']?.toString() ?? _driverProfile?['id']?.toString() ?? '';
        if (assignedDriverId.isNotEmpty && myDriverId.isNotEmpty && assignedDriverId != myDriverId) {
          debugPrint('Ignoring socket event for driver $assignedDriverId (current driver: $myDriverId)');
          return;
        }
      }
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

        // Strict Driver Verification: Ensure active trip belongs to this driver
        if (activeTrip != null) {
          final tripDriver = activeTrip['driver'];
          final tripDriverId = (tripDriver is Map ? (tripDriver['_id'] ?? tripDriver['id']) : tripDriver)?.toString() ?? '';
          final myDriverId = (profile?['_id'] ?? profile?['id'] ?? _driverProfile?['_id'] ?? _driverProfile?['id'])?.toString() ?? '';
          if (tripDriverId.isNotEmpty && myDriverId.isNotEmpty && tripDriverId != myDriverId) {
            debugPrint('⚠️ Active trip assigned to driver $tripDriverId does not match logged-in driver $myDriverId. Ignored.');
            activeTrip = null;
            isAssigned = false;
            vehicleNum = null;
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

        final currentDriverId = (profile?['_id'] ?? profile?['id'] ?? _driverProfile?['_id'] ?? _driverProfile?['id'])?.toString() ?? '';
        if (currentDriverId.isNotEmpty) {
          fetchedTrips = fetchedTrips.where((t) {
            if (t is! Map) return false;
            final td = t['driver'];
            final tdId = (td is Map ? (td['_id'] ?? td['id']) : td)?.toString() ?? '';
            return tdId.isEmpty || tdId == currentDriverId;
          }).toList();
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
              height: 155,
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

                  // 4. Overlaid Header Content (Logo, On Duty Switch, Notifications, Greeting & ID Chip)
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16.0, 4.0, 16.0, 10.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Row 1: Brand Emblem & Title + On Duty Switch + Alerts Bell
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            // Brand Emblem & Title
                            Expanded(
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    width: 34,
                                    height: 34,
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
                                    padding: const EdgeInsets.all(3.5),
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
                                          'Fleet Management'.tr,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: GoogleFonts.poppins(
                                            fontSize: 13.5,
                                            fontWeight: FontWeight.w700,
                                            color: Colors.white,
                                            letterSpacing: 0.2,
                                          ),
                                        ),
                                        Text(
                                          'Commercial Logistics'.tr,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: GoogleFonts.nunito(
                                            fontSize: 10.0,
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
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
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
                                          _isOnDuty ? 'On Duty'.tr : 'Off Duty'.tr,
                                          style: GoogleFonts.poppins(
                                            fontSize: 10.5,
                                            fontWeight: FontWeight.w600,
                                            color: Colors.white,
                                          ),
                                        ),
                                        const SizedBox(width: 5),
                                        AnimatedContainer(
                                          duration: const Duration(milliseconds: 200),
                                          width: 30,
                                          height: 17,
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(10),
                                            color: _isOnDuty ? const Color(0xFF10B981) : const Color(0xFF475569),
                                          ),
                                          child: AnimatedAlign(
                                            duration: const Duration(milliseconds: 200),
                                            alignment: _isOnDuty ? Alignment.centerRight : Alignment.centerLeft,
                                            child: Container(
                                              width: 13,
                                              height: 13,
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
                                const SizedBox(width: 7),

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
                                    width: 33,
                                    height: 33,
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
                                          size: 19,
                                        ),
                                        Positioned(
                                          right: 5,
                                          top: 5,
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

                        // Row 2: Greeting & ID Badge Pill
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Good Morning, ${(_driverProfile?['fullName'] ?? 'Abhi').toString().split(' ')[0]} 👋',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.poppins(
                                fontSize: 18.0,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3.5),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0F243E).withValues(alpha: 0.75),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: Colors.white.withValues(alpha: 0.15),
                                  width: 0.8,
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(
                                    Icons.badge_rounded,
                                    color: Color(0xFFF97316),
                                    size: 14,
                                  ),
                                  const SizedBox(width: 5),
                                  Text(
                                    'ID: ${_driverProfile?['employeeId'] ?? _driverProfile?['driverId'] ?? 'EMP-916164'}',
                                    style: GoogleFonts.nunito(
                                      fontSize: 11.0,
                                      fontWeight: FontWeight.w600,
                                      color: const Color(0xFFE2E8F0),
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
                ],
              ),
            ),

            // Main Wave-Curved Content Area with Orange Wave Accent
            Expanded(
              child: Stack(
                children: [
                  // Deep navy background matching header
                  Positioned.fill(
                    child: Container(color: const Color(0xFF071426)),
                  ),

                  // Orange Accent Wave on the Left Transition
                  Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 32,
                    child: CustomPaint(
                      painter: HeaderOrangeWavePainter(),
                    ),
                  ),

                  // White Wave Body Content Area
                  Positioned.fill(
                    child: ClipPath(
                      clipper: HeaderWaveClipper(),
                      child: Container(
                        color: const Color(0xFFF8FAFC),
                        child: RefreshIndicator(
                          color: const Color(0xFFF97316),
                          backgroundColor: Colors.white,
                          onRefresh: () async {
                            DashboardScreen.clearStaticCache();
                            ApiService.clearApiCache();
                            await Future.any([
                              _loadDashboardData(),
                              Future.delayed(const Duration(milliseconds: 500)),
                            ]);
                          },
                          child: SingleChildScrollView(
                            physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                            padding: const EdgeInsets.only(top: 22, bottom: 85),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                              // 1. Active Trip Card (Only shown when active trip is assigned to THIS driver)
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
                                'Dashboard Overview'.tr,
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
                                    'Recent Trips'.tr,
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
                                  'View All'.tr,
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
          ),
          ],
        ),
      ),
    ],
  ),
),
      floatingActionButton: Container(
        margin: const EdgeInsets.only(bottom: 10, right: 4),
        child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(30),
          child: InkWell(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const SupportHistoryScreen(),
                ),
              );
            },
            borderRadius: BorderRadius.circular(30),
            splashColor: Colors.white.withValues(alpha: 0.2),
            highlightColor: Colors.white.withValues(alpha: 0.1),
            child: Ink(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFF7A1A), Color(0xFFEA580C)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(30),
                border: Border.all(
                  color: Colors.white.withValues(alpha: 0.32),
                  width: 1.2,
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9.5),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.22),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.headset_mic_rounded,
                        color: Colors.white,
                        size: 16,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Help'.tr,
                      style: GoogleFonts.poppins(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        letterSpacing: 0.4,
                      ),
                    ),
                    const SizedBox(width: 7),
                    Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                        color: Color(0xFF10B981),
                        shape: BoxShape.circle,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
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
      return const SizedBox.shrink();
    }

    final tripId = _currentTrip?['tripId']?.toString() ?? _currentTrip?['_id']?.toString() ?? '';
    final tripNumber = _currentTrip?['tripNumber']?.toString() ?? 'TRP-615370';
    final pickup = _currentTrip?['pickup']?.toString() ?? _currentTrip?['startLocation']?.toString() ?? 'Hyderabad';
    final destination = _currentTrip?['destination']?.toString() ?? _currentTrip?['endLocation']?.toString() ?? 'Khammam';
    final depTime = _currentTrip?['departureTime']?.toString() ?? 'N/A';
    final vehicle = _currentTrip?['vehicleName'] != null && _currentTrip!['vehicleName'].toString().isNotEmpty
        ? '${_currentTrip!['vehicleName']} – ${_currentTrip!['vehiclePlate'] ?? ''}'
        : (_currentTrip?['vehicle']?.toString() ?? (_vehicleNumber ?? 'TATA 6564 – TS 76 GY 6756'));

    Future<void> openPendingTripDetails() async {
      final tripIdToPass = tripId.isNotEmpty
          ? tripId
          : (_currentTrip?['tripNumber']?.toString() ?? 'TRP-615370');
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
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(22),
        child: InkWell(
          borderRadius: BorderRadius.circular(22),
          onTap: openPendingTripDetails,
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
              // Header Row: Pending Badge + Trip Number
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF7ED),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.access_time_filled_rounded, color: Color(0xFFEA580C), size: 14),
                        const SizedBox(width: 5),
                        Text(
                          'Pending Acceptance',
                          style: GoogleFonts.poppins(
                            color: const Color(0xFFEA580C),
                            fontWeight: FontWeight.w700,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    '#$tripNumber',
                    style: GoogleFonts.poppins(
                      color: const Color(0xFF0F1E38),
                      fontWeight: FontWeight.w800,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Departure Time
              Row(
                children: [
                  const Icon(Icons.calendar_month_outlined, color: Color(0xFF64748B), size: 15),
                  const SizedBox(width: 6),
                  Text(
                    'Departure: $depTime',
                    style: GoogleFonts.nunito(
                      color: const Color(0xFF64748B),
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Stepper: Pickup -> Destination
              Row(
                children: [
                  const Icon(Icons.radio_button_checked, color: Color(0xFF2563EB), size: 15),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      pickup,
                      style: GoogleFonts.poppins(fontSize: 13.5, fontWeight: FontWeight.w700, color: const Color(0xFF0F1E38)),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8),
                    child: Icon(Icons.arrow_forward_rounded, color: Color(0xFF94A3B8), size: 16),
                  ),
                  const Icon(Icons.location_on, color: Color(0xFFEF4444), size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      destination,
                      style: GoogleFonts.poppins(fontSize: 13.5, fontWeight: FontWeight.w700, color: const Color(0xFF0F1E38)),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Vehicle Pill
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.local_shipping_rounded, color: Color(0xFF1E3A8A), size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        vehicle,
                        style: GoogleFonts.poppins(fontSize: 11.5, fontWeight: FontWeight.w700, color: const Color(0xFF0F1E38)),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Action Buttons: Reject & Accept
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFFEF4444)),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () => _handleTripAction(tripId, 'reject'),
                      child: Text('Reject', style: GoogleFonts.poppins(color: const Color(0xFFEF4444), fontWeight: FontWeight.w700, fontSize: 13)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                      onPressed: () => _handleTripAction(tripId, 'accept'),
                      child: Text('Accept', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
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

  bool get _hasActiveTrip {
    if (_currentTrip == null || _currentTrip!.isEmpty) return false;
    final rawStatus = (_currentTrip?['status']?.toString() ?? '').toLowerCase();
    final nonActive = ['completed', 'cancelled', 'rejected'];
    if (nonActive.contains(rawStatus)) return false;
    final tripNumberStr = _currentTrip?['tripNumber']?.toString() ?? _currentTrip?['tripId']?.toString() ?? '';
    if (tripNumberStr.isEmpty) return false;

    // Strict Driver Ownership Check: Ensure this trip belongs to THIS driver
    final tripDriver = _currentTrip?['driver'];
    final tripDriverId = (tripDriver is Map ? (tripDriver['_id'] ?? tripDriver['id']) : tripDriver)?.toString() ?? '';
    final myDriverId = _driverProfile?['_id']?.toString() ?? _driverProfile?['id']?.toString() ?? '';
    if (tripDriverId.isNotEmpty && myDriverId.isNotEmpty && tripDriverId != myDriverId) {
      return false;
    }

    return true;
  }

  // Active Trip Card Builder (Matches reference image white card layout with route stepper & orange CTA)
  Widget _buildActiveTripCard(BuildContext context) {
    if (!_hasActiveTrip || _currentTrip == null || _currentTrip!.isEmpty) {
      return const SizedBox.shrink();
    }

    final rawStatus = _currentTrip?['status']?.toString() ?? '';
    final statusLower = rawStatus.toLowerCase();

    // If active trip is pending driver acceptance, show pending card
    if (statusLower.contains('pending')) {
      return _buildPendingTripCard(context);
    }

    final trip = _currentTrip!;

    final tripNumberStr = (trip['tripNumber']?.toString().isNotEmpty == true)
        ? trip['tripNumber'].toString()
        : (trip['tripId']?.toString().isNotEmpty == true
            ? trip['tripId'].toString()
            : 'TRP-615370');

    // Progress calculation
    double progressVal = 0.0;
    final tripStatusLower = (trip['status']?.toString() ?? 'assigned').toLowerCase();
    if (tripStatusLower == 'completed') {
      progressVal = 1.0;
    } else if (tripStatusLower == 'in progress' ||
        tripStatusLower == 'on transit' ||
        tripStatusLower == 'enroute') {
      final actual = double.tryParse(trip['actualDistance']?.toString() ?? '') ?? 0.0;
      final estimated = double.tryParse(trip['estimatedDistance']?.toString() ?? '') ?? 0.0;
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

    final etaRaw = trip['eta']?.toString() ?? trip['departureTime']?.toString() ?? '2026-11-05T18:30:00';
    final String etaText = 'ETA $etaRaw';

    final pickup = trip['pickup']?.toString() ??
        trip['startLocation']?.toString() ??
        'Hyderabad';
    final destination = trip['destination']?.toString() ??
        trip['endLocation']?.toString() ??
        'Khammam';

    final activeVehicle = (trip['vehicleName'] != null && trip['vehicleName'].toString().isNotEmpty)
        ? '${trip['vehicleName']} – ${trip['vehiclePlate'] ?? ''}'
        : (_vehicleNumber != null && _vehicleNumber!.isNotEmpty
            ? _vehicleNumber!
            : 'TATA 6564 – TS 76 GY 6756');

    Future<void> openTripDetails() async {
      final tripIdToPass = trip['tripId']?.toString() ??
          trip['_id']?.toString() ??
          tripNumberStr;
      await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => TripDetailsScreen(
            tripId: tripIdToPass,
            tripData: trip,
          ),
        ),
      );
      _loadDashboardData();
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(22),
        child: InkWell(
          borderRadius: BorderRadius.circular(22),
          onTap: openTripDetails,
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
              // Row 1: Orange Dot + "Active Trip" (Left) & "View Details ➔" Pill (Right)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Color(0xFFF97316),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Active Trip',
                        style: GoogleFonts.poppins(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF0F172A),
                        ),
                      ),
                    ],
                  ),
                  InkWell(
                    onTap: openTripDetails,
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFEDD5), // Soft pastel orange
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'View Details',
                            style: GoogleFonts.poppins(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFFEA580C),
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(
                            Icons.arrow_forward_rounded,
                            size: 14,
                            color: Color(0xFFEA580C),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Row 2: Trip ID & ETA (Left) & Progress Box (Right)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          tripNumberStr,
                          style: GoogleFonts.poppins(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: const Color(0xFF0F1E38),
                            letterSpacing: -0.3,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(
                              Icons.calendar_month_outlined,
                              size: 15,
                              color: Color(0xFF64748B),
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                etaText,
                                style: GoogleFonts.nunito(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: const Color(0xFF64748B),
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
                  const SizedBox(width: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE0F2FE), // Pastel sky blue
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          progressText,
                          style: GoogleFonts.poppins(
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                            color: const Color(0xFF0F1E38),
                            height: 1.1,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Progress',
                          style: GoogleFonts.nunito(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Row 3: Route Stepper (Left) & Orange CTA Button (Right)
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Route Stepper
                  Expanded(
                    flex: 11,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Pickup
                        Row(
                          children: [
                            const Icon(
                              Icons.radio_button_checked,
                              color: Color(0xFF2563EB),
                              size: 15,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'PICKUP',
                                    style: GoogleFonts.poppins(
                                      fontSize: 9.5,
                                      fontWeight: FontWeight.w700,
                                      color: const Color(0xFF3B82F6),
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                  Text(
                                    pickup,
                                    style: GoogleFonts.poppins(
                                      fontSize: 13.5,
                                      fontWeight: FontWeight.w700,
                                      color: const Color(0xFF0F1E38),
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        // Stepper Connector Line
                        Container(
                          margin: const EdgeInsets.only(left: 6.5, top: 2, bottom: 2),
                          width: 2,
                          height: 16,
                          color: const Color(0xFFCBD5E1),
                        ),
                        // Destination
                        Row(
                          children: [
                            const Icon(
                              Icons.location_on,
                              color: Color(0xFFEF4444),
                              size: 16,
                            ),
                            const SizedBox(width: 7),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'DESTINATION',
                                    style: GoogleFonts.poppins(
                                      fontSize: 9.5,
                                      fontWeight: FontWeight.w700,
                                      color: const Color(0xFF64748B),
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                  Text(
                                    destination,
                                    style: GoogleFonts.poppins(
                                      fontSize: 13.5,
                                      fontWeight: FontWeight.w700,
                                      color: const Color(0xFF0F1E38),
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

                  // Orange CTA Action Button
                  InkWell(
                    onTap: openTripDetails,
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFFFF7A1A), Color(0xFFEA580C)],
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFEA580C).withValues(alpha: 0.35),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Transform.rotate(
                            angle: math.pi / 4,
                            child: const Icon(
                              Icons.navigation_rounded,
                              color: Colors.white,
                              size: 15,
                            ),
                          ),
                          const SizedBox(width: 7),
                          Text(
                            'View Details',
                            style: GoogleFonts.poppins(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Row 4: Full-width Vehicle Pill
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF), // Soft light blue
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.local_shipping_rounded,
                      color: Color(0xFF1E3A8A),
                      size: 17,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        activeVehicle,
                        style: GoogleFonts.poppins(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF0F1E38),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
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
    final int activeCount = _dashboardData?['activeTrips'] ?? 0;
    final int upcomingCount = _dashboardData?['upcomingTrips'] ?? 0;
    final int completedCount = _dashboardData?['completedTrips'] ?? 0;
    final int totalCount = _dashboardData?['totalTrips'] ?? (activeCount + upcomingCount + completedCount);

    final activeTrips = activeCount.toString();
    final upcomingTrips = upcomingCount.toString();
    final completedTrips = completedCount.toString();
    final totalTrips = totalCount.toString();

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
                  label: 'Active Trip'.tr,
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
                  label: 'Upcoming'.tr,
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
                  label: 'Completed'.tr,
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
                  label: 'Total Trips'.tr,
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

    // When no recent trips exist for this driver, show clean empty state
    if (itemsToDisplay.isEmpty) {
      return Container(
        margin: const EdgeInsets.symmetric(horizontal: 16),
        padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFFF1F5F9)),
        ),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.route_outlined, size: 28, color: Colors.grey.withValues(alpha: 0.45)),
              const SizedBox(height: 8),
              Text(
                'No recent trips found',
                style: GoogleFonts.poppins(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF64748B),
                ),
              ),
            ],
          ),
        ),
      );
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
// HEADER ORANGE WAVE PAINTER (Accent swoosh on top-left edge matching reference image)
// ---------------------------------------------------------------------------
class HeaderOrangeWavePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.centerLeft,
        end: Alignment.centerRight,
        colors: [Color(0xFFFF7A1A), Color(0xFFEA580C)],
      ).createShader(Rect.fromLTWH(0, 0, size.width * 0.55, size.height))
      ..style = PaintingStyle.fill;

    final path = Path();
    path.moveTo(0, 0);
    path.lineTo(0, 22);
    path.quadraticBezierTo(size.width * 0.25, 26, size.width * 0.48, 16);
    path.quadraticBezierTo(size.width * 0.25, 6, 0, 0);
    path.close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ---------------------------------------------------------------------------
// ORGANIC TOP WAVE CLIPPER (Matches reference image wave transition)
// ---------------------------------------------------------------------------
class HeaderWaveClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    path.moveTo(0, 18);
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
