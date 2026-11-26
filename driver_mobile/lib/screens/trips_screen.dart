import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';
import '../constants/app_radius.dart';
import '../constants/app_spacing.dart';
import '../services/api_service.dart';
import '../services/localization_service.dart';
import '../services/socket_service.dart';
import '../widgets/custom_app_bar.dart';
import 'active_trips_screen.dart';
import 'completed_trip_details_screen.dart';
import 'completed_trips_screen.dart';
import 'dashboard_screen.dart';
import 'main_navigation_screen.dart';
import 'trip_details_screen.dart';
import 'upcoming_trips_screen.dart';

class TripsScreen extends StatefulWidget {
  const TripsScreen({super.key});

  @override
  State<TripsScreen> createState() => _TripsScreenState();
}

class _TripsScreenState extends State<TripsScreen> {
  // Static cache for instant 0ms screen loading (Stale-While-Revalidate pattern)
  static Map<String, dynamic>? _cachedDashboardMetrics;
  static Map<String, dynamic>? _cachedCurrentTrip;
  static List<Map<String, dynamic>>? _cachedAllTrips;

  bool _isLoading = true;
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();
  String _searchQuery = '';
  int _selectedFilterIndex = 0;
  final List<String> _filters = [
    'All',
    'Active',
    'Upcoming',
    'Completed',
    'Rejected',
  ];

  Map<String, dynamic>? _dashboardMetrics;
  Map<String, dynamic>? _currentTrip;
  List<Map<String, dynamic>> _allTrips = [];

  @override
  void initState() {
    super.initState();
    _searchFocusNode.addListener(() => setState(() {}));
    MainNavigationScreen.selectedTabNotifier.addListener(_onTabChanged);
    _cachedDashboardMetrics ??= DashboardScreen.cachedDashboardData;
    _cachedCurrentTrip ??= DashboardScreen.cachedCurrentTrip;
    if (_cachedDashboardMetrics != null ||
        _cachedCurrentTrip != null ||
        _cachedAllTrips != null) {
      _dashboardMetrics = _cachedDashboardMetrics;
      _currentTrip = _cachedCurrentTrip;
      _allTrips = _cachedAllTrips ?? [];
      _isLoading = false;
    } else {
      _isLoading = true;
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted && _isLoading) setState(() => _isLoading = false);
      });
    }
    _loadTripsData();
    _setupSocketListeners();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _searchFocusNode.dispose();
    MainNavigationScreen.selectedTabNotifier.removeListener(_onTabChanged);
    super.dispose();
  }

  void _onTabChanged() {
    if (mounted && MainNavigationScreen.selectedTabNotifier.value == 3) {
      _loadTripsData(silent: true);
    }
  }

  void _setupSocketListeners() {
    SocketService.onEvent('trip:assigned', (_) => _loadTripsData(silent: true));
    SocketService.onEvent(
      'trip:status-updated',
      (_) => _loadTripsData(silent: true),
    );
    SocketService.onEvent(
      'notification:new',
      (_) => _loadTripsData(silent: true),
    );
  }

  Future<void> _loadTripsData({bool silent = false}) async {
    if (!mounted) return;
    if (!silent && _dashboardMetrics == null && _currentTrip == null) {
      setState(() => _isLoading = true);
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted && _isLoading) setState(() => _isLoading = false);
      });
    }

    try {
      // Concurrently query dashboard metrics, current active trip, and all driver trips via Future.wait
      final results = await Future.wait([
        ApiService.get('/driver/dashboard').catchError((_) => null),
        ApiService.getCurrentTrip().catchError((_) => null),
        ApiService.get('/driver/trips').catchError((_) => null),
      ]);

      final dashRes = results[0];
      final currentTripRes = results[1];
      final allTripsRes = results[2];

      Map<String, dynamic>? trip =
          currentTripRes != null && currentTripRes['data'] is Map
          ? Map<String, dynamic>.from(currentTripRes['data'] as Map)
          : null;

      final List<Map<String, dynamic>> tripsList = [];
      if (allTripsRes != null && allTripsRes['data'] is List) {
        for (final item in (allTripsRes['data'] as List)) {
          if (item is Map) {
            tripsList.add(Map<String, dynamic>.from(item));
          }
        }
      }

      if (trip == null && tripsList.isNotEmpty) {
        for (final t in tripsList) {
          final st = (t['status'] ?? '').toString().toLowerCase();
          if (!['completed', 'cancelled', 'rejected'].contains(st)) {
            trip = t;
            break;
          }
        }
      }

      if (trip != null) {
        final currentId = (trip['_id'] ?? trip['tripNumber'] ?? trip['tripId'])
            ?.toString();
        final alreadyInList = tripsList.any((t) {
          final id = (t['_id'] ?? t['tripNumber'] ?? t['tripId'])?.toString();
          return currentId != null && id == currentId;
        });
        if (!alreadyInList) {
          tripsList.insert(0, trip);
        }
      }

      if (dashRes != null && dashRes['data'] != null) {
        _cachedDashboardMetrics = dashRes['data'];
      }
      _cachedCurrentTrip = trip;
      _cachedAllTrips = tripsList;

      if (mounted) {
        setState(() {
          _dashboardMetrics = dashRes != null && dashRes['data'] != null
              ? dashRes['data']
              : _cachedDashboardMetrics;
          _currentTrip = trip;
          _allTrips = tripsList;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<Map<String, dynamic>> get _filteredTrips {
    final selectedFilter = _filters[_selectedFilterIndex];
    final query = _searchQuery.trim().toLowerCase();

    return _allTrips.where((trip) {
      final status = (trip['status'] ?? '').toString().trim().toLowerCase();

      bool matchesStatus = true;
      if (selectedFilter == 'Active') {
        matchesStatus = [
          'active',
          'in progress',
          'in_progress',
          'in transit',
          'in_transit',
          'ongoing',
          'started',
          'arrived',
          'en route',
          'en_route',
        ].contains(status);
      } else if (selectedFilter == 'Upcoming') {
        matchesStatus = [
          'upcoming',
          'scheduled',
          'assigned',
          'pending',
        ].contains(status);
      } else if (selectedFilter == 'Completed') {
        matchesStatus = ['completed', 'delivered'].contains(status);
      } else if (selectedFilter == 'Rejected') {
        matchesStatus = [
          'rejected',
          'cancelled',
          'canceled',
          'declined',
        ].contains(status);
      }

      if (!matchesStatus) return false;

      if (query.isNotEmpty) {
        final tripNum = (trip['tripNumber'] ?? trip['tripId'] ?? '')
            .toString()
            .toLowerCase();
        final pickup = (trip['pickup'] ?? trip['startLocation'] ?? '')
            .toString()
            .toLowerCase();
        final dest = (trip['destination'] ?? trip['endLocation'] ?? '')
            .toString()
            .toLowerCase();
        final vehicle = (trip['vehicleNumber'] ?? trip['vehiclePlate'] ?? '')
            .toString()
            .toLowerCase();
        return tripNum.contains(query) ||
            pickup.contains(query) ||
            dest.contains(query) ||
            status.contains(query) ||
            vehicle.contains(query);
      }

      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final activeCount = _dashboardMetrics?['activeTrips'] ?? 0;
    final upcomingCount = _dashboardMetrics?['upcomingTrips'] ?? 0;
    final completedCount = _dashboardMetrics?['completedTrips'] ?? 0;
    final totalCount = activeCount + upcomingCount + completedCount;

    final hasRecentTrip =
        _currentTrip != null &&
        (_currentTrip!['tripNumber'] != null ||
            _currentTrip!['tripId'] != null);

    final isFilteringOrSearching =
        _selectedFilterIndex != 0 || _searchQuery.trim().isNotEmpty;
    final filteredTrips = _filteredTrips;

    return ValueListenableBuilder<String>(
      valueListenable: LocalizationService.currentLanguageNotifier,
      builder: (context, currentLang, _) {
        return Scaffold(
          backgroundColor: const Color(0xFFF4F6FA),
          appBar: CustomAppBar(
            centerTitle: false,
            actions: const [],
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () =>
                  MainNavigationScreen.selectedTabNotifier.value = 2,
            ),
            title: Text(
              'Trips'.tr,
              style: GoogleFonts.poppins(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
          body: SafeArea(
            child: RefreshIndicator(
              color: const Color(0xFFF97316),
              backgroundColor: Colors.white,
              onRefresh: () async {
                _cachedDashboardMetrics = null;
                _cachedCurrentTrip = null;
                _cachedAllTrips = null;
                ApiService.clearApiCache('/driver/dashboard');
                ApiService.clearApiCache('/driver/trips/current');
                ApiService.clearApiCache('/driver/trips');
                await Future.any([
                  _loadTripsData(),
                  Future.delayed(const Duration(milliseconds: 500)),
                ]);
              },
              child: _isLoading
                  ? const Center(
                      child: Padding(
                        padding: EdgeInsets.all(40.0),
                        child: CircularProgressIndicator(
                          color: Color(0xFFF97316),
                        ),
                      ),
                    )
                  : SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(
                        parent: BouncingScrollPhysics(),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // 1. Search Bar & Filter Bar Row
                          Padding(
                            padding: const EdgeInsets.fromLTRB(
                              16.0,
                              12.0,
                              16.0,
                              4.0,
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Container(
                                    height: 48,
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 14.0,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(12.0),
                                      border: Border.all(
                                        color: _searchFocusNode.hasFocus
                                            ? AppColors.secondary
                                            : AppColors.divider,
                                        width: _searchFocusNode.hasFocus
                                            ? 1.8
                                            : 1.0,
                                      ),
                                      boxShadow: _searchFocusNode.hasFocus
                                          ? [
                                              BoxShadow(
                                                color: AppColors.secondary
                                                    .withAlpha(25),
                                                blurRadius: 6,
                                                offset: const Offset(0, 1),
                                              ),
                                            ]
                                          : null,
                                    ),
                                    child: Row(
                                      children: [
                                        Icon(
                                          Icons.search_rounded,
                                          color: _searchFocusNode.hasFocus
                                              ? AppColors.secondary
                                              : AppColors.secondaryText,
                                          size: 20,
                                        ),
                                        const SizedBox(width: 10.0),
                                        Expanded(
                                          child: TextField(
                                            controller: _searchController,
                                            focusNode: _searchFocusNode,
                                            onChanged: (val) {
                                              setState(() {
                                                _searchQuery = val;
                                              });
                                            },
                                            decoration: InputDecoration(
                                              hintText:
                                                  'Search for trips...'.tr,
                                              hintStyle: GoogleFonts.poppins(
                                                fontSize: 13.5,
                                                color: AppColors.secondaryText,
                                              ),
                                              border: InputBorder.none,
                                              enabledBorder: InputBorder.none,
                                              focusedBorder: InputBorder.none,
                                              isDense: true,
                                              contentPadding: EdgeInsets.zero,
                                            ),
                                          ),
                                        ),
                                        if (_searchQuery.isNotEmpty)
                                          GestureDetector(
                                            onTap: () {
                                              setState(() {
                                                _searchController.clear();
                                                _searchQuery = '';
                                              });
                                            },
                                            child: const Icon(
                                              Icons.close_rounded,
                                              size: 18,
                                              color: AppColors.secondaryText,
                                            ),
                                          ),
                                      ],
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 10.0),
                                // Filter Bar beside right to search bar
                                _buildFilterBar(context),
                              ],
                            ),
                          ),
                          AppSpacing.verticalSm,

                          if (isFilteringOrSearching) ...[
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.md,
                              ),
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    '${_filters[_selectedFilterIndex].tr} (${filteredTrips.length})',
                                    style: Theme.of(context)
                                        .textTheme
                                        .titleMedium
                                        ?.copyWith(
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.primaryText,
                                        ),
                                  ),
                                  if (_selectedFilterIndex != 0 ||
                                      _searchQuery.isNotEmpty)
                                    TextButton(
                                      onPressed: () {
                                        setState(() {
                                          _selectedFilterIndex = 0;
                                          _searchController.clear();
                                          _searchQuery = '';
                                        });
                                      },
                                      style: TextButton.styleFrom(
                                        foregroundColor: AppColors.secondary,
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 4,
                                        ),
                                        minimumSize: Size.zero,
                                        tapTargetSize:
                                            MaterialTapTargetSize.shrinkWrap,
                                      ),
                                      child: Text(
                                        'Reset'.tr,
                                        style: GoogleFonts.poppins(
                                          fontSize: 12.5,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 8),
                            if (filteredTrips.isEmpty)
                              _buildEmptyFilteredTripsCard(context)
                            else
                              ...filteredTrips.map(
                                (trip) => Padding(
                                  padding: const EdgeInsets.only(bottom: 12.0),
                                  child: _buildTripCard(context, trip),
                                ),
                              ),
                          ] else ...[
                            // Stats Row (Distinct Color-Coded Premium Cards)
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.md,
                              ),
                              child: IntrinsicHeight(
                                child: Row(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.stretch,
                                  children: [
                                    Expanded(
                                      child: _buildStatCard(
                                        context,
                                        label: 'Total Trips'.tr,
                                        value: totalCount.toString().padLeft(
                                          2,
                                          '0',
                                        ),
                                        accentColor: const Color(0xFF2563EB),
                                        gradientEnd: const Color(0xFFEFF6FF),
                                        borderColor: const Color(0xFFBFDBFE),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: _buildStatCard(
                                        context,
                                        label: 'Active'.tr,
                                        value: activeCount.toString().padLeft(
                                          2,
                                          '0',
                                        ),
                                        accentColor: const Color(0xFFEA580C),
                                        gradientEnd: const Color(0xFFFFF7ED),
                                        borderColor: const Color(0xFFFED7AA),
                                        showDot: true,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: _buildStatCard(
                                        context,
                                        label: 'Upcoming'.tr,
                                        value: upcomingCount.toString().padLeft(
                                          2,
                                          '0',
                                        ),
                                        accentColor: const Color(0xFF7C3AED),
                                        gradientEnd: const Color(0xFFF5F3FF),
                                        borderColor: const Color(0xFFDDD6FE),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),

                            const SizedBox(height: 12),

                            // Trip Categories (Color-Coded Gradient Action Cards)
                            _buildCategoryCard(
                              context,
                              title: 'Active Trips'.tr,
                              icon: Icons.sync_rounded,
                              accentColor: const Color(0xFFEA580C),
                              gradientEnd: const Color(0xFFFFF7ED),
                              borderColor: const Color(0xFFFED7AA),
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) =>
                                        const ActiveTripsScreen(),
                                  ),
                                ).then((_) => _loadTripsData());
                              },
                            ),
                            _buildCategoryCard(
                              context,
                              title: 'Upcoming Trips'.tr,
                              icon: Icons.schedule_rounded,
                              accentColor: const Color(0xFF2563EB),
                              gradientEnd: const Color(0xFFEFF6FF),
                              borderColor: const Color(0xFFBFDBFE),
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) =>
                                        const UpcomingTripsScreen(),
                                  ),
                                ).then((_) => _loadTripsData());
                              },
                            ),
                            _buildCategoryCard(
                              context,
                              title: 'Completed Trips'.tr,
                              icon: Icons.check_circle_outline_rounded,
                              accentColor: const Color(0xFF059669),
                              gradientEnd: const Color(0xFFECFDF5),
                              borderColor: const Color(0xFFA7F3D0),
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) =>
                                        const CompletedTripsScreen(),
                                  ),
                                ).then((_) => _loadTripsData());
                              },
                            ),

                            AppSpacing.verticalSm,

                            // Recent Trip Title
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.md,
                              ),
                              child: Text(
                                'Recent Trip'.tr,
                                style: Theme.of(context).textTheme.titleLarge
                                    ?.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.primaryText,
                                    ),
                              ),
                            ),

                            const SizedBox(height: 6),

                            // Recent Trip Card
                            if (hasRecentTrip)
                              _buildTripCard(context, _currentTrip!)
                            else
                              _buildEmptyRecentTripCard(context),
                          ],

                          AppSpacing.verticalLg,
                        ],
                      ),
                    ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildTripCard(BuildContext context, Map<String, dynamic> trip) {
    final tripNumber = (trip['tripNumber'] ?? trip['tripId'] ?? '--')
        .toString();
    final pickup = (trip['pickup'] ?? trip['startLocation'] ?? '--').toString();
    final destination = (trip['destination'] ?? trip['endLocation'] ?? '--')
        .toString();
    final status = (trip['status'] ?? 'Scheduled').toString();
    final statusLower = status.toLowerCase();

    Color badgeBg = AppColors.secondary.withValues(alpha: 0.12);
    Color badgeText = AppColors.secondary;
    if (statusLower == 'completed' || statusLower == 'delivered') {
      badgeBg = AppColors.success.withValues(alpha: 0.12);
      badgeText = AppColors.success;
    } else if (statusLower == 'rejected' ||
        statusLower == 'cancelled' ||
        statusLower == 'canceled') {
      badgeBg = AppColors.error.withValues(alpha: 0.12);
      badgeText = AppColors.error;
    } else if (statusLower == 'upcoming' ||
        statusLower == 'scheduled' ||
        statusLower == 'assigned') {
      badgeBg = AppColors.primary.withValues(alpha: 0.10);
      badgeText = AppColors.primary;
    }

    void openTripDetails() {
      if (statusLower == 'completed') {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => CompletedTripDetailsScreen(
              tripId: tripNumber,
              tripData: trip,
            ),
          ),
        ).then((_) => _loadTripsData());
      } else {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) =>
                TripDetailsScreen(tripId: tripNumber, tripData: trip),
          ),
        ).then((_) => _loadTripsData());
      }
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18.0),
          border: Border.all(color: const Color(0xFFE6ECF4)),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF0F172A).withValues(alpha: 0.045),
              blurRadius: 16,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(18.0),
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            borderRadius: BorderRadius.circular(18.0),
            onTap: openTripDetails,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Header Row
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
                              fontSize: 10,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            tripNumber.startsWith('#')
                                ? tripNumber
                                : '#$tripNumber',
                            style: GoogleFonts.poppins(
                              color: const Color(0xFF0F172A),
                              fontWeight: FontWeight.w800,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 5,
                        ),
                        decoration: BoxDecoration(
                          color: badgeBg,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: badgeText.withValues(alpha: 0.3),
                          ),
                        ),
                        child: Text(
                          status,
                          style: GoogleFonts.poppins(
                            color: badgeText,
                            fontWeight: FontWeight.w700,
                            fontSize: 10.5,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  // Timeline/Route Section inside soft tinted box
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
                              height: 30,
                              margin: const EdgeInsets.symmetric(vertical: 3.0),
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  colors: [
                                    Color(0xFF2563EB),
                                    AppColors.secondary,
                                  ],
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                ),
                                borderRadius: BorderRadius.circular(2),
                              ),
                            ),
                            const Icon(
                              Icons.location_on_rounded,
                              color: AppColors.secondary,
                              size: 16,
                            ),
                          ],
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Pickup',
                                    style: GoogleFonts.nunito(
                                      color: const Color(0xFF2563EB),
                                      fontWeight: FontWeight.w700,
                                      fontSize: 10.5,
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
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Destination',
                                    style: GoogleFonts.nunito(
                                      color: AppColors.secondary,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 10.5,
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

                  // View Details button
                  ElevatedButton(
                    onPressed: openTripDetails,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.secondary,
                      foregroundColor: Colors.white,
                      elevation: 2,
                      shadowColor: AppColors.secondary.withValues(alpha: 0.3),
                      padding: const EdgeInsets.symmetric(vertical: 11.0),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                    ),
                    child: Text(
                      'View Details'.tr,
                      style: GoogleFonts.poppins(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyFilteredTripsCard(BuildContext context) {
    final currentFilter = _filters[_selectedFilterIndex];
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 28.0),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: AppColors.divider),
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.search_off_rounded,
                size: 28,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'No Trips Found'.tr,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.primaryText,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              _searchQuery.trim().isNotEmpty
                  ? 'No trips match "$_searchQuery".'
                  : 'No $currentFilter trips available right now.',
              style: Theme.of(
                context,
              ).textTheme.bodySmall?.copyWith(color: AppColors.secondaryText),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyRecentTripCard(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: AppColors.divider),
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.route_outlined,
                size: 28,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'No Recent Trip',
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.primaryText,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'You do not have any assigned or completed trips yet.',
              style: Theme.of(
                context,
              ).textTheme.bodySmall?.copyWith(color: AppColors.secondaryText),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context, {
    required String label,
    required String value,
    required Color accentColor,
    required Color gradientEnd,
    required Color borderColor,
    bool showDot = false,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11.0, vertical: 11.0),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.white, gradientEnd],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(14.0),
        border: Border.all(color: borderColor, width: 1.0),
        boxShadow: [
          BoxShadow(
            color: accentColor.withValues(alpha: 0.09),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Container(
                width: 7,
                height: 7,
                decoration: BoxDecoration(
                  color: showDot
                      ? accentColor
                      : accentColor.withValues(alpha: 0.65),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 5),
              Expanded(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.nunito(
                    color: const Color(0xFF475569),
                    fontWeight: FontWeight.w700,
                    fontSize: 11,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 5),
          Text(
            value,
            style: GoogleFonts.poppins(
              color: accentColor,
              fontWeight: FontWeight.w800,
              fontSize: 21,
              height: 1.1,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryCard(
    BuildContext context, {
    required String title,
    required IconData icon,
    required Color accentColor,
    required Color gradientEnd,
    required Color borderColor,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: 5.0,
      ),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.white, gradientEnd],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        borderRadius: BorderRadius.circular(16.0),
        border: Border.all(color: borderColor, width: 1.0),
        boxShadow: [
          BoxShadow(
            color: accentColor.withValues(alpha: 0.08),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16.0),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16.0),
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 14.0,
              vertical: 11.0,
            ),
            child: Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [accentColor, accentColor.withValues(alpha: 0.8)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(11.0),
                    boxShadow: [
                      BoxShadow(
                        color: accentColor.withValues(alpha: 0.25),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Icon(icon, color: Colors.white, size: 19),
                ),
                const SizedBox(width: 13),
                Expanded(
                  child: Text(
                    title,
                    style: GoogleFonts.poppins(
                      color: const Color(0xFF0F172A),
                      fontWeight: FontWeight.w700,
                      fontSize: 14.5,
                    ),
                  ),
                ),
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: accentColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  child: Icon(
                    Icons.chevron_right_rounded,
                    color: accentColor,
                    size: 18,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFilterBar(BuildContext context) {
    const primaryDark = Color(0xFF101C2C);
    const primaryOrange = AppColors.secondary;
    const borderGray = AppColors.divider;
    const textPrimary = AppColors.primaryText;
    const textSecondary = AppColors.secondaryText;

    final isFiltered = _selectedFilterIndex != 0;
    final currentFilter = _filters[_selectedFilterIndex];

    return PopupMenuButton<int>(
      initialValue: _selectedFilterIndex,
      tooltip: 'Filter Trips',
      offset: const Offset(0, 52),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14.0),
        side: const BorderSide(color: Color(0xFFE2E8F0), width: 1.0),
      ),
      color: Colors.white,
      elevation: 6,
      onSelected: (int index) {
        setState(() {
          _selectedFilterIndex = index;
        });
      },
      itemBuilder: (BuildContext context) => <PopupMenuEntry<int>>[
        PopupMenuItem<int>(
          enabled: false,
          height: 32,
          child: Text(
            'FILTER BY STATUS'.tr,
            style: GoogleFonts.poppins(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: textSecondary,
              letterSpacing: 0.8,
            ),
          ),
        ),
        const PopupMenuDivider(height: 1),
        ...List.generate(_filters.length, (index) {
          final isSelected = _selectedFilterIndex == index;
          return PopupMenuItem<int>(
            value: index,
            height: 42,
            child: Row(
              children: [
                Icon(
                  isSelected
                      ? Icons.check_circle_rounded
                      : Icons.radio_button_unchecked_rounded,
                  color: isSelected ? primaryOrange : const Color(0xFF94A3B8),
                  size: 18,
                ),
                const SizedBox(width: 10),
                Text(
                  _filters[index].tr,
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected ? primaryDark : textPrimary,
                  ),
                ),
              ],
            ),
          );
        }),
      ],
      child: Container(
        height: 48,
        padding: const EdgeInsets.symmetric(horizontal: 12.0),
        decoration: BoxDecoration(
          color: isFiltered ? primaryDark : Colors.white,
          borderRadius: BorderRadius.circular(12.0),
          border: Border.all(
            color: isFiltered ? primaryDark : borderGray,
            width: 1.0,
          ),
          boxShadow: [
            BoxShadow(
              color: isFiltered
                  ? primaryDark.withAlpha(30)
                  : Colors.black.withAlpha(6),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.tune_rounded,
              size: 18,
              color: isFiltered ? Colors.white : primaryOrange,
            ),
            const SizedBox(width: 6),
            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 84),
              child: Text(
                currentFilter.tr,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.poppins(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: isFiltered ? Colors.white : textPrimary,
                ),
              ),
            ),
            const SizedBox(width: 2),
            Icon(
              Icons.keyboard_arrow_down_rounded,
              size: 18,
              color: isFiltered ? Colors.white70 : textSecondary,
            ),
          ],
        ),
      ),
    );
  }
}
