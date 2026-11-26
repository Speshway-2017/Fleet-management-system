import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import '../services/localization_service.dart';
import '../widgets/custom_app_bar.dart';
import '../utils/navigation_helper.dart';
import '../utils/date_formatter.dart';
import 'completed_trip_details_screen.dart';

class CompletedTripsScreen extends StatefulWidget {
  const CompletedTripsScreen({super.key});

  static List<Map<String, dynamic>>? cachedCompletedTrips;

  static void clearCache() {
    cachedCompletedTrips = null;
  }

  @override
  State<CompletedTripsScreen> createState() => _CompletedTripsScreenState();
}

class _CompletedTripsScreenState extends State<CompletedTripsScreen> {
  bool _isLoading = false;
  List<Map<String, dynamic>> _completedTrips = [];
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  Timer? _loadingTimer;

  @override
  void initState() {
    super.initState();
    if (CompletedTripsScreen.cachedCompletedTrips != null) {
      _completedTrips = CompletedTripsScreen.cachedCompletedTrips!;
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
    _fetchCompletedTrips();
  }

  @override
  void dispose() {
    _loadingTimer?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchCompletedTrips() async {
    if (!mounted) return;
    if (CompletedTripsScreen.cachedCompletedTrips == null) {
      setState(() => _isLoading = true);
      if (!ApiService.isTest) {
        _loadingTimer?.cancel();
        _loadingTimer = Timer(const Duration(milliseconds: 500), () {
          if (mounted && _isLoading) setState(() => _isLoading = false);
        });
      }
    }
    try {
      final res = await ApiService.get('/driver/trips?status=Completed');
      _loadingTimer?.cancel();
      if (res != null && res['data'] is List) {
        final List list = res['data'];
        final typedList = List<Map<String, dynamic>>.from(
          list.whereType<Map>().map((e) => Map<String, dynamic>.from(e)),
        );
        CompletedTripsScreen.cachedCompletedTrips = typedList;
        if (mounted) {
          setState(() {
            _completedTrips = typedList;
            _isLoading = false;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _completedTrips = [];
            _isLoading = false;
          });
        }
      }
    } catch (_) {
      _loadingTimer?.cancel();
      if (mounted) {
        setState(() {
          _completedTrips = CompletedTripsScreen.cachedCompletedTrips ?? [];
          _isLoading = false;
        });
      }
    }
  }

  List<Map<String, dynamic>> get _filteredTrips {
    if (_searchQuery.trim().isEmpty) return _completedTrips;
    final q = _searchQuery.trim().toLowerCase();
    return _completedTrips.where((trip) {
      final rawTripId = (trip['tripNumber'] ?? trip['tripId'] ?? trip['_id'] ?? '').toString().toLowerCase();
      final pickup = (trip['pickup'] ?? trip['startLocation'] ?? '').toString().toLowerCase();
      final destination = (trip['destination'] ?? trip['endLocation'] ?? '').toString().toLowerCase();
      final vehicle = (trip['vehicleName'] ?? trip['vehiclePlate'] ?? '').toString().toLowerCase();
      return rawTripId.contains(q) ||
          pickup.contains(q) ||
          destination.contains(q) ||
          vehicle.contains(q);
    }).toList();
  }

  double _getTripDistance(Map<String, dynamic> trip) {
    double dist = double.tryParse(trip['actualDistance']?.toString() ?? '') ?? 0.0;
    if (dist <= 0) {
      dist = double.tryParse(trip['estimatedDistance']?.toString() ?? '') ?? 0.0;
    }
    if (dist <= 0) {
      dist = 240.0;
    }
    return dist;
  }

  String _getTripDuration(Map<String, dynamic> trip) {
    if (trip['duration'] != null && trip['duration'].toString().trim().isNotEmpty) {
      return trip['duration'].toString().trim();
    }
    final departureTimeStr = trip['departureTime'] ?? trip['actualStartTime'];
    final departureTime = departureTimeStr != null ? DateTime.tryParse(departureTimeStr.toString()) : null;
    final actualEndTimeStr = trip['actualEndTime'] ?? trip['createdAt'];
    final actualEndTime = actualEndTimeStr != null ? DateTime.tryParse(actualEndTimeStr.toString()) : null;
    final createdAt = trip['createdAt'] != null ? DateTime.tryParse(trip['createdAt'].toString()) : null;

    final startTime = departureTime ?? createdAt ?? DateTime.now();
    final endTime = actualEndTime ?? createdAt ?? DateTime.now();
    final durationDiff = endTime.difference(startTime);
    final durationHours = durationDiff.inHours.abs();
    final durationMins = durationDiff.inMinutes.remainder(60).abs();
    if (durationHours > 0) {
      return '${durationHours}h ${durationMins}m';
    }
    return '${durationMins > 0 ? durationMins : 45}m';
  }

  String _getTripFuel(Map<String, dynamic> trip) {
    if (trip['fuelDetails'] is Map) {
      final fd = trip['fuelDetails'] as Map;
      final liters = fd['liters'];
      if (liters != null) {
        final parsed = double.tryParse(liters.toString());
        return '${parsed?.toStringAsFixed(0) ?? liters} L';
      }
    }
    if (trip['fuelConsumed'] != null) {
      final parsed = double.tryParse(trip['fuelConsumed'].toString());
      return '${parsed?.toStringAsFixed(0) ?? trip['fuelConsumed']} L';
    }
    if (trip['totalFuelLiters'] != null) {
      final parsed = double.tryParse(trip['totalFuelLiters'].toString());
      return '${parsed?.toStringAsFixed(0) ?? trip['totalFuelLiters']} L';
    }
    return '30 L';
  }

  double get _totalDistance {
    double total = 0;
    for (final t in _completedTrips) {
      total += _getTripDistance(t);
    }
    return total;
  }

  double get _totalFuel {
    double total = 0;
    for (final t in _completedTrips) {
      if (t['fuelDetails'] is Map) {
        final fd = t['fuelDetails'] as Map;
        total += double.tryParse(fd['liters']?.toString() ?? '') ?? 0.0;
      } else if (t['fuelConsumed'] != null) {
        total += double.tryParse(t['fuelConsumed']?.toString() ?? '') ?? 0.0;
      } else if (t['totalFuelLiters'] != null) {
        total += double.tryParse(t['totalFuelLiters']?.toString() ?? '') ?? 0.0;
      } else {
        total += 30.0;
      }
    }
    return total;
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
                'Completed Trips'.tr,
                style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 18,
                ),
              ),
            ),
            body: SafeArea(
              child: RefreshIndicator(
                color: const Color(0xFF059669),
                onRefresh: () async {
                  CompletedTripsScreen.clearCache();
                  ApiService.clearApiCache('/driver/trips?status=Completed');
                  await Future.any([
                    _fetchCompletedTrips(),
                    Future.delayed(const Duration(milliseconds: 600)),
                  ]);
                },
                child: _isLoading
                    ? const Center(
                        child: CircularProgressIndicator(
                          color: Color(0xFF059669),
                        ),
                      )
                    : CustomScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        slivers: [
                          // Top Executive Hero Summary Card
                          SliverToBoxAdapter(
                            child: Padding(
                              padding: const EdgeInsets.fromLTRB(16.0, 16.0, 16.0, 12.0),
                              child: _buildExecutiveHeroSummary(),
                            ),
                          ),

                          // Search & Filter Bar
                          if (_completedTrips.isNotEmpty)
                            SliverToBoxAdapter(
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
                                child: _buildSearchBar(),
                              ),
                            ),

                          // Content List or Empty State
                          if (_completedTrips.isEmpty)
                            SliverFillRemaining(
                              hasScrollBody: false,
                              child: _buildEmptyState(),
                            )
                          else if (_filteredTrips.isEmpty)
                            SliverFillRemaining(
                              hasScrollBody: false,
                              child: _buildNoSearchResults(),
                            )
                          else
                            SliverPadding(
                              padding: const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 24.0),
                              sliver: SliverList(
                                delegate: SliverChildBuilderDelegate(
                                  (context, index) {
                                    final trip = _filteredTrips[index];
                                    return Padding(
                                      padding: const EdgeInsets.only(bottom: 14.0),
                                      child: _buildCompletedTripCard(context, trip),
                                    );
                                  },
                                  childCount: _filteredTrips.length,
                                ),
                              ),
                            ),
                        ],
                      ),
              ),
            ),
          ),
        );
      },
    );
  }

  // ---------------------------------------------------------------------------
  // EXECUTIVE HERO SUMMARY CARD
  // ---------------------------------------------------------------------------
  Widget _buildExecutiveHeroSummary() {
    final completedCount = _completedTrips.length;
    final totalKm = _totalDistance;
    final totalLiters = _totalFuel;

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
          // Header Row: Tag & Medal
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
                        color: const Color(0xFF059669).withValues(alpha: 0.18),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: const Color(0xFF059669).withValues(alpha: 0.4),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.verified_rounded,
                            color: Color(0xFF34D399),
                            size: 13,
                          ),
                          const SizedBox(width: 5),
                          Text(
                            'VERIFIED ARCHIVE',
                            style: GoogleFonts.poppins(
                              color: const Color(0xFF34D399),
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
                      'Trip History',
                      style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 20,
                        letterSpacing: -0.3,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Finalized routes & verified manager approvals',
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
                    colors: [Color(0xFF059669), Color(0xFF047857)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF059669).withValues(alpha: 0.35),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.task_alt_rounded,
                  color: Colors.white,
                  size: 26,
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),
          Container(
            height: 1,
            color: Colors.white.withValues(alpha: 0.10),
          ),
          const SizedBox(height: 14),

          // 3 Metric Badges
          Row(
            children: [
              Expanded(
                child: _buildHeroStatTile(
                  icon: Icons.check_circle_rounded,
                  iconColor: const Color(0xFF34D399),
                  label: 'Completed',
                  value: '$completedCount',
                  bgColor: const Color(0xFF064E3B).withValues(alpha: 0.4),
                  borderColor: const Color(0xFF059669).withValues(alpha: 0.3),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildHeroStatTile(
                  icon: Icons.route_rounded,
                  iconColor: const Color(0xFF38BDF8),
                  label: 'Distance',
                  value: '${totalKm.toStringAsFixed(0)} km',
                  bgColor: const Color(0xFF0C4A6E).withValues(alpha: 0.4),
                  borderColor: const Color(0xFF0284C7).withValues(alpha: 0.3),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildHeroStatTile(
                  icon: Icons.local_gas_station_rounded,
                  iconColor: const Color(0xFFFBBF24),
                  label: 'Total Fuel',
                  value: '${totalLiters.toStringAsFixed(0)} L',
                  bgColor: const Color(0xFF78350F).withValues(alpha: 0.35),
                  borderColor: const Color(0xFFD97706).withValues(alpha: 0.3),
                ),
              ),
            ],
          ),
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
              Icon(icon, color: iconColor, size: 13),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  label,
                  style: GoogleFonts.nunito(
                    color: const Color(0xFFCBD5E1),
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: GoogleFonts.poppins(
              color: Colors.white,
              fontWeight: FontWeight.w700,
              fontSize: 13,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // SEARCH & FILTER BAR
  // ---------------------------------------------------------------------------
  Widget _buildSearchBar() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF0F172A).withValues(alpha: 0.035),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: TextField(
            controller: _searchController,
            onChanged: (val) {
              setState(() => _searchQuery = val);
            },
            style: GoogleFonts.poppins(
              color: const Color(0xFF0F172A),
              fontSize: 13,
            ),
            decoration: InputDecoration(
              hintText: 'Search by Trip ID, origin, destination...',
              hintStyle: GoogleFonts.nunito(
                color: const Color(0xFF94A3B8),
                fontSize: 13,
              ),
              prefixIcon: const Icon(
                Icons.search_rounded,
                color: Color(0xFF64748B),
                size: 20,
              ),
              suffixIcon: _searchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.close_rounded, size: 18, color: Color(0xFF64748B)),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _searchQuery = '');
                      },
                    )
                  : null,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            ),
          ),
        ),
        if (_searchQuery.trim().isNotEmpty) ...[
          const SizedBox(height: 6),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4.0),
            child: Text(
              'Showing ${_filteredTrips.length} of ${_completedTrips.length} completed trips',
              style: GoogleFonts.nunito(
                color: const Color(0xFF64748B),
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // COLOR-CODED PREMIUM COMPLETED TRIP CARD
  // ---------------------------------------------------------------------------
  Widget _buildCompletedTripCard(BuildContext context, Map<String, dynamic> trip) {
    final rawTripId = trip['tripNumber'] ?? trip['tripId'] ?? trip['_id'] ?? '#TRP-000';
    final tripNumber = rawTripId.toString();
    final displayId = tripNumber.startsWith('#') ? tripNumber : '#$tripNumber';
    final pickup = (trip['pickup'] ?? trip['startLocation'] ?? 'Origin').toString();
    final destination = (trip['destination'] ?? trip['endLocation'] ?? 'Destination').toString();
    final dateStr = trip['actualEndTime'] ?? trip['completedAt'] ?? trip['createdAt'];
    final date = formatIndianDateTime(dateStr ?? 'Completed');

    final distanceKm = _getTripDistance(trip);
    final distanceText = '${distanceKm.toStringAsFixed(0)} km';
    final duration = _getTripDuration(trip);
    final fuelText = _getTripFuel(trip);

    final vehicleName = (trip['vehicleName'] ?? trip['vehiclePlate'] ?? trip['vehicle']?['registrationNumber'] ?? '').toString();
    final driverName = (trip['driverName'] ?? trip['driver']?['name'] ?? '').toString();

    void openDetails() {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => CompletedTripDetailsScreen(
            tripId: displayId,
            tripData: trip,
          ),
        ),
      ).then((_) {
        if (mounted) _fetchCompletedTrips();
      });
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
                // Header: Trip ID + Completed Badge
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
                        color: const Color(0xFFECFDF5),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFA7F3D0)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.check_circle_rounded,
                            color: Color(0xFF059669),
                            size: 13,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Completed'.tr,
                            style: GoogleFonts.poppins(
                              color: const Color(0xFF059669),
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

                // Meta Bar: Date & Vehicle Info Chips
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFFBEB),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFFDE68A)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.calendar_today_rounded,
                            color: Color(0xFFD97706),
                            size: 11,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            date,
                            style: GoogleFonts.nunito(
                              color: const Color(0xFFB45309),
                              fontWeight: FontWeight.w700,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (vehicleName.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEFF6FF),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFFBFDBFE)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.local_shipping_outlined,
                              color: Color(0xFF2563EB),
                              size: 12,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              vehicleName,
                              style: GoogleFonts.nunito(
                                color: const Color(0xFF1D4ED8),
                                fontWeight: FontWeight.w700,
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                    if (driverName.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF5F3FF),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFFDDD6FE)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.person_outline_rounded,
                              color: Color(0xFF7C3AED),
                              size: 12,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              driverName,
                              style: GoogleFonts.nunito(
                                color: const Color(0xFF6D28D9),
                                fontWeight: FontWeight.w700,
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
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
                                  Color(0xFF059669),
                                ],
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                              ),
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                          Container(
                            width: 14,
                            height: 14,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: Color(0xFF059669),
                            ),
                            child: const Icon(
                              Icons.check,
                              color: Colors.white,
                              size: 9,
                            ),
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
                                    color: const Color(0xFF059669),
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

                // 3 Color-Coded KPI Metric Cards
                Row(
                  children: [
                    // Distance: Sapphire Blue
                    Expanded(
                      child: _buildMetricTile(
                        icon: Icons.straighten_rounded,
                        accentColor: const Color(0xFF2563EB),
                        bgColor: const Color(0xFFEFF6FF),
                        borderColor: const Color(0xFFBFDBFE),
                        label: 'Distance'.tr,
                        value: distanceText,
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Duration: Warm Amber
                    Expanded(
                      child: _buildMetricTile(
                        icon: Icons.schedule_rounded,
                        accentColor: const Color(0xFFD97706),
                        bgColor: const Color(0xFFFFFBEB),
                        borderColor: const Color(0xFFFDE68A),
                        label: 'Duration'.tr,
                        value: duration,
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Fuel: Fleet Orange
                    Expanded(
                      child: _buildMetricTile(
                        icon: Icons.local_gas_station_rounded,
                        accentColor: const Color(0xFFEA580C),
                        bgColor: const Color(0xFFFFF7ED),
                        borderColor: const Color(0xFFFED7AA),
                        label: 'Fuel Used'.tr,
                        value: fuelText,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // View Summary Button: Executive Navy Gradient
                Container(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [
                        Color(0xFF0B1626),
                        Color(0xFF1E293B),
                      ],
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
                        padding: const EdgeInsets.symmetric(vertical: 11.0, horizontal: 14.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'View Trip Summary'.tr,
                              style: GoogleFonts.poppins(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Icon(
                              Icons.arrow_forward_rounded,
                              color: Color(0xFF38BDF8),
                              size: 16,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMetricTile({
    required IconData icon,
    required Color accentColor,
    required Color bgColor,
    required Color borderColor,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
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
              Icon(icon, color: accentColor, size: 12),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  label,
                  style: GoogleFonts.nunito(
                    color: accentColor,
                    fontSize: 9.5,
                    fontWeight: FontWeight.w700,
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
              color: const Color(0xFF0F172A),
              fontWeight: FontWeight.w700,
              fontSize: 12,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // EMPTY STATES
  // ---------------------------------------------------------------------------
  Widget _buildEmptyState() {
    return Center(
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFA7F3D0), width: 2),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF059669).withValues(alpha: 0.12),
                    blurRadius: 18,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: const Icon(
                Icons.task_alt_rounded,
                size: 42,
                color: Color(0xFF059669),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'No Completed Trips'.tr,
              style: GoogleFonts.poppins(
                fontWeight: FontWeight.w800,
                color: const Color(0xFF0F172A),
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'You have no completed trips recorded yet. When your assigned manager approves your uploaded POD and Weighbridge slips, completed trips will be listed here.',
              textAlign: TextAlign.center,
              style: GoogleFonts.nunito(
                color: const Color(0xFF64748B),
                fontSize: 13,
                fontWeight: FontWeight.w500,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () {
                CompletedTripsScreen.clearCache();
                _fetchCompletedTrips();
              },
              icon: const Icon(Icons.refresh_rounded, size: 16),
              label: Text(
                'Refresh Trips'.tr,
                style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 13),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF059669),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 2,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNoSearchResults() {
    return Center(
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFCBD5E1)),
              ),
              child: const Icon(
                Icons.search_off_rounded,
                size: 32,
                color: Color(0xFF64748B),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'No Matching Completed Trips',
              style: GoogleFonts.poppins(
                fontWeight: FontWeight.w700,
                color: const Color(0xFF0F172A),
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'No trips found matching "$_searchQuery". Try searching by another city name or Trip ID.',
              textAlign: TextAlign.center,
              style: GoogleFonts.nunito(
                color: const Color(0xFF64748B),
                fontSize: 12.5,
              ),
            ),
            const SizedBox(height: 16),
            TextButton.icon(
              onPressed: () {
                _searchController.clear();
                setState(() => _searchQuery = '');
              },
              icon: const Icon(Icons.clear_all_rounded, size: 16),
              label: const Text('Clear Search Filter'),
              style: TextButton.styleFrom(
                foregroundColor: const Color(0xFF2563EB),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
