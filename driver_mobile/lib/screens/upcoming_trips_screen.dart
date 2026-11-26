import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import '../services/localization_service.dart';
import '../services/socket_service.dart';
import '../widgets/custom_app_bar.dart';
import '../utils/navigation_helper.dart';
import '../utils/date_formatter.dart';
import 'active_trips_screen.dart';
import 'trip_details_screen.dart';

class UpcomingTripsScreen extends StatefulWidget {
  const UpcomingTripsScreen({super.key});

  static Map<String, dynamic>? cachedUpcomingTrip;

  static void clearCache() {
    cachedUpcomingTrip = null;
  }

  @override
  State<UpcomingTripsScreen> createState() => _UpcomingTripsScreenState();
}

class _UpcomingTripsScreenState extends State<UpcomingTripsScreen> {
  bool _isLoading = false;
  Map<String, dynamic>? _currentTrip;
  Timer? _loadingTimer;

  @override
  void initState() {
    super.initState();
    if (UpcomingTripsScreen.cachedUpcomingTrip != null) {
      _currentTrip = UpcomingTripsScreen.cachedUpcomingTrip;
      _isLoading = false;
    } else {
      _isLoading = true;
      if (!ApiService.isTest) {
        _loadingTimer?.cancel();
        _loadingTimer = Timer(const Duration(milliseconds: 500), () {
          if (mounted && _isLoading) setState(() => _isLoading = false);
        });
      }
    }
    _fetchTripData();
    _setupSocketListeners();
  }

  @override
  void dispose() {
    _loadingTimer?.cancel();
    super.dispose();
  }

  void _setupSocketListeners() {
    SocketService.onEvent('trip:assigned', (_) => _fetchTripData());
    SocketService.onEvent('trip:status-updated', (_) => _fetchTripData());
    SocketService.onEvent('trip:15min-reminder', (data) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(data['message'] ?? 'Trip starts in 15 minutes!'),
            backgroundColor: const Color(0xFF2563EB),
            behavior: SnackBarBehavior.floating,
          ),
        );
        _fetchTripData();
      }
    });
  }

  Future<void> _fetchTripData() async {
    if (!mounted) return;
    try {
      var res = await ApiService.getCurrentTrip();
      Map<String, dynamic>? trip = res != null ? res['data'] : null;

      if (trip == null) {
        final allTripsRes = await ApiService.get('/driver/trips');
        if (allTripsRes != null && allTripsRes['data'] is List && (allTripsRes['data'] as List).isNotEmpty) {
          final list = allTripsRes['data'] as List;
          final candidate = list.firstWhere(
            (t) {
              final st = (t['status'] ?? '').toString().toLowerCase();
              return st.contains('pending') || ['assigned', 'scheduled', 'accepted', 'upcoming'].contains(st);
            },
            orElse: () => null,
          );
          if (candidate != null && candidate is Map<String, dynamic>) {
            trip = candidate;
          }
        }
      }

      _loadingTimer?.cancel();

      if (trip != null) {
        final status = (trip['status']?.toString() ?? '').toLowerCase();
        final isUpcomingOrPending = status.contains('pending') ||
            ['assigned', 'scheduled', 'accepted', 'upcoming'].contains(status);
        if (isUpcomingOrPending) {
          UpcomingTripsScreen.cachedUpcomingTrip = trip;
          if (mounted) {
            setState(() {
              _currentTrip = trip;
              _isLoading = false;
            });
          }
        } else {
          UpcomingTripsScreen.cachedUpcomingTrip = null;
          if (mounted) {
            setState(() {
              _currentTrip = null;
              _isLoading = false;
            });
          }
        }
      } else {
        UpcomingTripsScreen.cachedUpcomingTrip = null;
        if (mounted) {
          setState(() {
            _currentTrip = null;
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      _loadingTimer?.cancel();
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  bool _isStartEnabled(String? departureTimeStr) {
    if (departureTimeStr == null || departureTimeStr.isEmpty) return true;
    try {
      final dep = DateTime.parse(departureTimeStr);
      final now = DateTime.now();
      return now.isAfter(dep.subtract(const Duration(minutes: 15)));
    } catch (_) {
      return true;
    }
  }

  Future<void> _handleRespond(String tripId, String action) async {
    try {
      await ApiService.respondToTripAssignment(tripId, action);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Trip assignment ${action == 'accept' ? 'accepted' : 'rejected'} successfully'),
            backgroundColor: action == 'accept' ? const Color(0xFF059669) : const Color(0xFFEF4444),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
      _fetchTripData();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: const Color(0xFFEF4444),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> _handleStartTrip(String tripId, String? departureTimeStr) async {
    if (!_isStartEnabled(departureTimeStr)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Trip button is locked. You can start the trip 15 minutes before scheduled departure.'),
          backgroundColor: Color(0xFF2563EB),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    try {
      await ApiService.updateTripStatus(tripId, 'In Progress');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🚀 Trip started! Live GPS tracking activated.'),
            backgroundColor: Color(0xFF059669),
            behavior: SnackBarBehavior.floating,
          ),
        );
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const ActiveTripsScreen()),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: const Color(0xFFEF4444),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: LocalizationService.currentLanguageNotifier,
      builder: (context, currentLang, _) {
        return PopScope(
          canPop: false,
          onPopInvokedWithResult: (didPop, result) {
            if (!didPop) SafeNavigation.pop(context, fallbackTab: 3);
          },
          child: Scaffold(
            backgroundColor: const Color(0xFFF4F6FA),
            appBar: CustomAppBar(
              centerTitle: false,
              fallbackTab: 3,
              title: Text(
                'Upcoming Trips'.tr,
                style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 18,
                ),
              ),
            ),
            body: SafeArea(
              child: RefreshIndicator(
                color: const Color(0xFF2563EB),
                onRefresh: () async {
                  UpcomingTripsScreen.clearCache();
                  ApiService.clearApiCache('/driver/trips');
                  ApiService.clearApiCache('/driver/trips/current');
                  await Future.any([
                    _fetchTripData(),
                    Future.delayed(const Duration(milliseconds: 600)),
                  ]);
                },
                child: _isLoading
                    ? const Center(
                        child: Padding(
                          padding: EdgeInsets.all(40.0),
                          child: CircularProgressIndicator(color: Color(0xFF2563EB)),
                        ),
                      )
                    : SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Executive Hero Header Banner
                            _buildUpcomingHeroBanner(),
                            const SizedBox(height: 14),

                            if (_currentTrip == null)
                              _buildEmptyState()
                            else ...[
                              _buildTripCard(context, _currentTrip!),
                              const SizedBox(height: 16),
                            ],
                          ],
                        ),
                      ),
              ),
            ),
          ),
        );
      },
    );
  }

  // ---------------------------------------------------------------------------
  // EXECUTIVE HERO SUMMARY BANNER
  // ---------------------------------------------------------------------------
  Widget _buildUpcomingHeroBanner() {
    final hasTrip = _currentTrip != null;
    final statusLower = (_currentTrip?['status']?.toString() ?? '').toLowerCase();
    final isAssigned = statusLower.contains('pending') || statusLower == 'assigned';

    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            Color(0xFF0B1626),
            Color(0xFF13263E),
            Color(0xFF1B3452),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20.0),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.12),
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0B1626).withValues(alpha: 0.25),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      padding: const EdgeInsets.all(18.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF2563EB).withValues(alpha: 0.18),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: const Color(0xFF38BDF8).withValues(alpha: 0.4),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.schedule_rounded,
                            color: Color(0xFF38BDF8),
                            size: 13,
                          ),
                          const SizedBox(width: 5),
                          Text(
                            'SCHEDULED TRIP',
                            style: GoogleFonts.poppins(
                              color: const Color(0xFF38BDF8),
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.5,
                              fontSize: 9.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Upcoming Trip',
                      style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 20,
                        letterSpacing: -0.3,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      hasTrip
                          ? (isAssigned ? 'Action required: Accept or decline assignment' : 'Scheduled route ready for departure')
                          : 'No upcoming trip scheduled for your roster',
                      style: GoogleFonts.nunito(
                        color: const Color(0xFF94A3B8),
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF2563EB), Color(0xFF1D4ED8)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF2563EB).withValues(alpha: 0.35),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.departure_board_rounded,
                  color: Colors.white,
                  size: 26,
                ),
              ),
            ],
          ),

          if (hasTrip) ...[
            const SizedBox(height: 16),
            Container(
              height: 1,
              color: Colors.white.withValues(alpha: 0.10),
            ),
            const SizedBox(height: 14),

            // 3 Quick Indicator Badges
            Row(
              children: [
                Expanded(
                  child: _buildHeroStatTile(
                    icon: Icons.flag_circle_rounded,
                    iconColor: const Color(0xFF38BDF8),
                    label: 'Status',
                    value: isAssigned ? 'Pending' : 'Accepted',
                    bgColor: const Color(0xFF0C4A6E).withValues(alpha: 0.4),
                    borderColor: const Color(0xFF0284C7).withValues(alpha: 0.3),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildHeroStatTile(
                    icon: Icons.route_rounded,
                    iconColor: const Color(0xFFFBBF24),
                    label: 'Distance',
                    value: '${_currentTrip?['estimatedDistance'] ?? _currentTrip?['actualDistance'] ?? 240} km',
                    bgColor: const Color(0xFF78350F).withValues(alpha: 0.35),
                    borderColor: const Color(0xFFD97706).withValues(alpha: 0.3),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildHeroStatTile(
                    icon: Icons.timer_outlined,
                    iconColor: const Color(0xFF34D399),
                    label: 'Start Window',
                    value: '15m Before',
                    bgColor: const Color(0xFF064E3B).withValues(alpha: 0.4),
                    borderColor: const Color(0xFF059669).withValues(alpha: 0.3),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildHeroStatTile({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
    required Color bgColor,
    required Color borderColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 9, horizontal: 8),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: iconColor, size: 12),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  label,
                  style: GoogleFonts.nunito(
                    color: const Color(0xFFCBD5E1),
                    fontSize: 9.5,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 3),
          Text(
            value,
            style: GoogleFonts.poppins(
              color: Colors.white,
              fontWeight: FontWeight.w700,
              fontSize: 12.5,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // COLOR-CODED PREMIUM UPCOMING TRIP CARD
  // ---------------------------------------------------------------------------
  Widget _buildTripCard(BuildContext context, Map<String, dynamic> trip) {
    final tripId = trip['tripId'] ?? trip['_id'] ?? '#TRP-000';
    final tripNumber = (trip['tripNumber'] ?? tripId).toString();
    final displayId = tripNumber.startsWith('#') ? tripNumber : '#$tripNumber';
    final pickup = (trip['pickup'] ?? trip['startLocation'] ?? 'Pickup Point').toString();
    final destination = (trip['destination'] ?? trip['endLocation'] ?? 'Destination Point').toString();
    final departureTime = formatIndianDateTime(trip['departureTime'] ?? 'Scheduled');
    final vehicle = (trip['vehicleName'] ?? trip['vehiclePlate'] ?? trip['vehicle'] ?? 'Truck / Van').toString();
    final managerName = (trip['manager'] is Map ? trip['manager']['name'] : trip['managerName'] ?? 'Fleet Manager').toString();
    final statusLower = (trip['status']?.toString() ?? '').toLowerCase();
    final isAssigned = statusLower.contains('pending') || statusLower == 'assigned';
    final startEnabled = _isStartEnabled(trip['departureTime']);

    void openDetails() {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => TripDetailsScreen(tripId: tripId.toString(), tripData: trip),
        ),
      ).then((_) => _fetchTripData());
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18.0),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withValues(alpha: 0.045),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(18.0),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          borderRadius: BorderRadius.circular(18.0),
          onTap: openDetails,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header: Trip ID + Status Badge
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'TRIP ID',
                          style: GoogleFonts.poppins(
                            color: const Color(0xFF64748B),
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.6,
                            fontSize: 9.5,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          displayId,
                          style: GoogleFonts.poppins(
                            color: const Color(0xFF0F172A),
                            fontWeight: FontWeight.w800,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: isAssigned ? const Color(0xFFFFFBEB) : const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isAssigned ? const Color(0xFFFDE68A) : const Color(0xFFBFDBFE),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            isAssigned ? Icons.hourglass_top_rounded : Icons.event_available_rounded,
                            color: isAssigned ? const Color(0xFFD97706) : const Color(0xFF2563EB),
                            size: 13,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            isAssigned ? 'Pending Action'.tr : 'Upcoming'.tr,
                            style: GoogleFonts.poppins(
                              color: isAssigned ? const Color(0xFFD97706) : const Color(0xFF2563EB),
                              fontWeight: FontWeight.w700,
                              fontSize: 10.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 10),

                // Scheduled Departure Time Squircle Chip
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFFBEB),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFFDE68A)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.access_time_filled_rounded,
                        color: Color(0xFFD97706),
                        size: 13,
                      ),
                      const SizedBox(width: 6),
                      Flexible(
                        child: Text(
                          'Scheduled: $departureTime',
                          style: GoogleFonts.nunito(
                            color: const Color(0xFFB45309),
                            fontWeight: FontWeight.w700,
                            fontSize: 11.5,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),

                // Route Overview Box
                Container(
                  padding: const EdgeInsets.all(12.0),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(14.0),
                    border: Border.all(color: const Color(0xFFE8EDF5)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Column(
                        children: [
                          Container(
                            width: 14,
                            height: 14,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: const Color(0xFF2563EB),
                                width: 2.5,
                              ),
                              color: Colors.white,
                            ),
                          ),
                          Container(
                            width: 2,
                            height: 32,
                            margin: const EdgeInsets.symmetric(vertical: 3.0),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [
                                  Color(0xFF2563EB),
                                  Color(0xFFEA580C),
                                ],
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                              ),
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                          const Icon(
                            Icons.location_on_rounded,
                            color: Color(0xFFEA580C),
                            size: 16,
                          ),
                        ],
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'PICKUP',
                                  style: GoogleFonts.poppins(
                                    color: const Color(0xFF2563EB),
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 0.5,
                                    fontSize: 9.5,
                                  ),
                                ),
                                const SizedBox(height: 1),
                                Text(
                                  pickup,
                                  style: GoogleFonts.poppins(
                                    color: const Color(0xFF0F172A),
                                    fontWeight: FontWeight.w700,
                                    fontSize: 13,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'DESTINATION',
                                  style: GoogleFonts.poppins(
                                    color: const Color(0xFFEA580C),
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 0.5,
                                    fontSize: 9.5,
                                  ),
                                ),
                                const SizedBox(height: 1),
                                Text(
                                  destination,
                                  style: GoogleFonts.poppins(
                                    color: const Color(0xFF0F172A),
                                    fontWeight: FontWeight.w700,
                                    fontSize: 13,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),

                // Vehicle & Dispatcher Tiles (Color-Coded)
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 9),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEFF6FF),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFBFDBFE)),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.local_shipping_outlined,
                              color: Color(0xFF2563EB),
                              size: 16,
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'VEHICLE',
                                    style: GoogleFonts.nunito(
                                      color: const Color(0xFF2563EB),
                                      fontWeight: FontWeight.w700,
                                      fontSize: 9,
                                    ),
                                  ),
                                  Text(
                                    vehicle,
                                    style: GoogleFonts.poppins(
                                      color: const Color(0xFF0F172A),
                                      fontWeight: FontWeight.w700,
                                      fontSize: 11.5,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 9),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF5F3FF),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFDDD6FE)),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.person_outline_rounded,
                              color: Color(0xFF7C3AED),
                              size: 16,
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'DISPATCHER',
                                    style: GoogleFonts.nunito(
                                      color: const Color(0xFF7C3AED),
                                      fontWeight: FontWeight.w700,
                                      fontSize: 9,
                                    ),
                                  ),
                                  Text(
                                    managerName,
                                    style: GoogleFonts.poppins(
                                      color: const Color(0xFF0F172A),
                                      fontWeight: FontWeight.w700,
                                      fontSize: 11.5,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // Action Buttons
                if (isAssigned) ...[
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => _handleRespond(tripId.toString(), 'reject'),
                          style: OutlinedButton.styleFrom(
                            backgroundColor: const Color(0xFFFEF2F2),
                            side: const BorderSide(color: Color(0xFFFECACA), width: 1.2),
                            foregroundColor: const Color(0xFFDC2626),
                            padding: const EdgeInsets.symmetric(vertical: 12.0),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: Text(
                            'Reject',
                            style: GoogleFonts.poppins(
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF059669), Color(0xFF047857)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF059669).withValues(alpha: 0.25),
                                blurRadius: 8,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              borderRadius: BorderRadius.circular(12),
                              onTap: () => _handleRespond(tripId.toString(), 'accept'),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(vertical: 12.0),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(Icons.check_rounded, color: Colors.white, size: 16),
                                    const SizedBox(width: 6),
                                    Text(
                                      'Accept Trip',
                                      style: GoogleFonts.poppins(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w700,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ] else ...[
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: startEnabled
                                ? const LinearGradient(
                                    colors: [Color(0xFFFF6A00), Color(0xFFEA580C)],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  )
                                : null,
                            color: startEnabled ? null : const Color(0xFFCBD5E1),
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: startEnabled
                                ? [
                                    BoxShadow(
                                      color: const Color(0xFFEA580C).withValues(alpha: 0.25),
                                      blurRadius: 8,
                                      offset: const Offset(0, 3),
                                    ),
                                  ]
                                : null,
                          ),
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              borderRadius: BorderRadius.circular(12),
                              onTap: startEnabled ? () => _handleStartTrip(tripId.toString(), trip['departureTime']) : null,
                              child: Padding(
                                padding: const EdgeInsets.symmetric(vertical: 11.0, horizontal: 8.0),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      startEnabled ? Icons.play_arrow_rounded : Icons.lock_clock_rounded,
                                      size: 16,
                                      color: startEnabled ? Colors.white : const Color(0xFF64748B),
                                    ),
                                    const SizedBox(width: 5),
                                    Flexible(
                                      child: Text(
                                        startEnabled ? 'Start Trip' : 'Starts 15m Before',
                                        style: GoogleFonts.poppins(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w700,
                                          color: startEnabled ? Colors.white : const Color(0xFF64748B),
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF0B1626), Color(0xFF1E293B)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF0B1626).withValues(alpha: 0.18),
                                blurRadius: 8,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              borderRadius: BorderRadius.circular(12),
                              onTap: openDetails,
                              child: Padding(
                                padding: const EdgeInsets.symmetric(vertical: 11.0, horizontal: 4.0),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Flexible(
                                      child: Text(
                                        'View Details',
                                        style: GoogleFonts.poppins(
                                          color: Colors.white,
                                          fontSize: 12,
                                          fontWeight: FontWeight.w700,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    const Icon(
                                      Icons.arrow_forward_rounded,
                                      color: Color(0xFF38BDF8),
                                      size: 14,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // EMPTY STATE
  // ---------------------------------------------------------------------------
  Widget _buildEmptyState() {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFBFDBFE), width: 2),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF2563EB).withValues(alpha: 0.12),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: const Icon(
                Icons.calendar_month_rounded,
                size: 36,
                color: Color(0xFF2563EB),
              ),
            ),
            const SizedBox(height: 18),
            Text(
              'No Upcoming Trips'.tr,
              style: GoogleFonts.poppins(
                fontWeight: FontWeight.w800,
                color: const Color(0xFF0F172A),
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'You currently have no scheduled or assigned trips. Any new trip assigned by your fleet manager will appear here.',
              textAlign: TextAlign.center,
              style: GoogleFonts.nunito(
                color: const Color(0xFF64748B),
                fontSize: 13,
                fontWeight: FontWeight.w500,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
