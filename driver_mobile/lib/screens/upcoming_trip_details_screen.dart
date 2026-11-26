import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_radius.dart';
import '../services/api_service.dart';
import '../widgets/custom_app_bar.dart';
import '../utils/date_formatter.dart';
import '../widgets/custom_card.dart';
import 'active_trips_screen.dart';
import 'upcoming_trips_screen.dart';
import '../utils/navigation_helper.dart';
import '../services/localization_service.dart';

class UpcomingTripDetailsScreen extends StatefulWidget {
  final String tripId;

  const UpcomingTripDetailsScreen({
    super.key,
    required this.tripId,
  });

  @override
  State<UpcomingTripDetailsScreen> createState() => _UpcomingTripDetailsScreenState();
}

class _UpcomingTripDetailsScreenState extends State<UpcomingTripDetailsScreen> {
  static final Map<String, Map<String, dynamic>> _cachedUpcomingDetails = {};

  bool _isLoading = false;
  Map<String, dynamic>? _trip;

  @override
  void initState() {
    super.initState();
    final cleanId = widget.tripId.replaceAll('#', '').trim();
    if (_cachedUpcomingDetails.containsKey(cleanId)) {
      _trip = _cachedUpcomingDetails[cleanId];
      _isLoading = false;
    } else {
      _isLoading = true;
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted && _isLoading) setState(() => _isLoading = false);
      });
    }
    _fetchDetails();
  }

  Future<void> _fetchDetails() async {
    try {
      dynamic res;
      if (widget.tripId.isNotEmpty) {
        res = await ApiService.getTripDetails(widget.tripId);
      }
      if (res == null || res['data'] == null) {
        res = await ApiService.getCurrentTrip();
      }
      if (res != null && res['data'] != null) {
        final trip = res['data'];
        final status = (trip['status']?.toString() ?? '').toLowerCase();
        final isUpcoming = status.contains('pending') ||
            ['assigned', 'scheduled', 'accepted', 'upcoming'].contains(status);
        if (isUpcoming) {
          final tripMap = Map<String, dynamic>.from(trip);
          final cleanId = widget.tripId.replaceAll('#', '').trim();
          _cachedUpcomingDetails[cleanId] = tripMap;
          setState(() {
            _trip = tripMap;
            _isLoading = false;
          });
        } else {
          setState(() {
            _trip = null;
            _isLoading = false;
          });
        }
      } else {
        setState(() {
          _trip = null;
          _isLoading = false;
        });
      }
    } catch (_) {
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

  Future<void> _handleStartTrip() async {
    final departureTime = _trip?['departureTime'] ?? '';
    if (!_isStartEnabled(departureTime)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Start button is locked. You can start the trip 15 minutes before scheduled departure.'.tr),
          backgroundColor: AppColors.primary,
        ),
      );
      return;
    }

    try {
      final idToUse = _trip?['tripId'] ?? _trip?['_id'] ?? widget.tripId;
      await ApiService.updateTripStatus(idToUse.toString(), 'In Progress');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('🚀 Trip started! Live GPS tracking activated.'.tr),
            backgroundColor: AppColors.success,
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
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final displayId = _trip?['tripNumber'] ?? widget.tripId;
    final pickup = _trip?['pickup'] ?? _trip?['startLocation'] ?? 'Central Logistics Hub, Berlin';
    final destination = _trip?['destination'] ?? _trip?['endLocation'] ?? 'Retail Center West, Potsdam';
    final vehicle = _trip?['vehicle'] ?? 'Medium Van - BT 990';
    final departureTime = formatIndianDateTime(_trip?['departureTime'] ?? 'Tomorrow, 08:00 AM');
    final managerName = _trip?['manager'] != null ? _trip!['manager']['name'] : 'Sarah Jenkins';

    return ValueListenableBuilder<String>(
      valueListenable: LocalizationService.currentLanguageNotifier,
      builder: (context, _, _) {
        return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop) SafeNavigation.pop(context, fallbackTab: 3);
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: CustomAppBar(
          centerTitle: false,
          fallbackTab: 3,
          title: Text(
            'Upcoming Trip Details'.tr,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: AppColors.background,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: AppColors.secondary))
            : RefreshIndicator(
                color: AppColors.secondary,
                backgroundColor: Colors.white,
                onRefresh: () async {
                  _cachedUpcomingDetails.remove(widget.tripId.replaceAll('#', '').trim());
                  ApiService.clearApiCache();
                  await Future.any([
                    _fetchDetails(),
                    Future.delayed(const Duration(milliseconds: 500)),
                  ]);
                },
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                  padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // 1. Trip Header Summary Card
                    _buildTripSummaryCard(context, displayId, departureTime),
                    AppSpacing.verticalSm,

                    // 2. Route Information
                    _buildSectionHeader(context, 'Route Information'.tr),
                    _buildRouteInfoCard(context, pickup, destination),
                    AppSpacing.verticalSm,

                    // 3. Vehicle Information
                    _buildVehicleInfoCard(context, vehicle),
                    AppSpacing.verticalSm,

                    // 4. Schedule & Dispatcher
                    _buildScheduleCard(context, departureTime, managerName),
                    AppSpacing.verticalSm,

                    // 5. Trip Instructions
                    _buildSectionHeader(context, 'Trip Instructions'.tr),
                    _buildInstructionsCard(context),
                    AppSpacing.verticalLg,

                    // 6. Footer Actions
                    _buildFooterActions(context, departureTime),
                    const SizedBox(height: 24),
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

  // Section Header Helper
  Widget _buildSectionHeader(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4.0, top: 8.0, bottom: 8.0),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
          fontWeight: FontWeight.bold,
          color: AppColors.primaryText,
        ),
      ),
    );
  }

  // 1. Trip Summary Card
  Widget _buildTripSummaryCard(BuildContext context, String id, String time) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'TRIP ID'.tr,
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: AppColors.secondaryText,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                      fontSize: 10,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '#$id',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: AppColors.primaryText,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.secondary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(AppRadius.round),
                ),
                child: Text(
                  'Upcoming'.tr,
                  style: TextStyle(
                    color: AppColors.secondary,
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                  ),
                ),
              ),
            ],
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 12.0),
            child: Divider(color: AppColors.divider),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildInfoItem(context, 'Departure Schedule'.tr, time),
              _buildInfoItem(context, 'Priority'.tr, 'Normal'.tr, alignRight: true),
            ],
          ),
        ],
      ),
    );
  }

  // 2. Route Info Card
  Widget _buildRouteInfoCard(BuildContext context, String pickup, String destination) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                children: [
                  const SizedBox(height: 2),
                  Container(
                    width: 14,
                    height: 14,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.primary, width: 2),
                      color: Colors.transparent,
                    ),
                    child: Center(
                      child: Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ),
                  Container(
                    width: 1.5,
                    height: 32,
                    color: AppColors.divider,
                  ),
                  const Icon(
                    Icons.location_on,
                    color: AppColors.secondary,
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
                      'Pickup'.tr,
                      style: TextStyle(
                        color: AppColors.secondaryText,
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      pickup,
                      style: const TextStyle(
                        color: AppColors.primaryText,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 18),
                    Text(
                      'Destination'.tr,
                      style: TextStyle(
                        color: AppColors.secondaryText,
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      destination,
                      style: const TextStyle(
                        color: AppColors.primaryText,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 3. Vehicle Info Card
  Widget _buildVehicleInfoCard(BuildContext context, String vehicle) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildCardHeader(
            context,
            icon: Icons.local_shipping_outlined,
            title: 'Vehicle Information'.tr,
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildInfoItem(context, 'Assigned Vehicle'.tr, vehicle),
              _buildInfoItem(context, 'Fuel'.tr, 'Diesel'.tr, alignRight: true),
            ],
          ),
        ],
      ),
    );
  }

  // 4. Schedule Card
  Widget _buildScheduleCard(BuildContext context, String depTime, String manager) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildCardHeader(
            context,
            icon: Icons.access_time,
            title: 'Schedule & Dispatcher'.tr,
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildInfoItem(context, 'Departure Time'.tr, depTime),
              _buildInfoItem(context, 'Dispatch Manager'.tr, manager, alignRight: true),
            ],
          ),
        ],
      ),
    );
  }

  // 5. Instructions Card
  Widget _buildInstructionsCard(BuildContext context) {
    final instructions = [
      'Reach pickup location 15 mins early'.tr,
      'Verify shipment documents & weighbridge clearance'.tr,
      'Perform vehicle safety inspection before starting trip'.tr,
      'Follow assigned route and report delays to dispatcher'.tr,
    ];

    return CustomCard(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
      child: Column(
        children: instructions.map((instruction) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 6.0),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.check_circle_outline,
                  color: AppColors.success,
                  size: 18,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    instruction,
                    style: const TextStyle(
                      color: AppColors.primaryText,
                      fontSize: 13,
                      height: 1.3,
                    ),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Future<void> _handleRespond(String action) async {
    final idToUse = _trip?['tripId'] ?? _trip?['_id'] ?? widget.tripId;
    final cleanId = idToUse.toString().replaceAll('#', '');
    try {
      await ApiService.respondToTripAssignment(cleanId, action);
    } catch (_) {}
    if (!mounted) return;
    if (action == 'accept') {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✅ Trip assignment accepted! Moved to Upcoming Trips.'.tr),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
        ),
      );
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const UpcomingTripsScreen()),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Trip assignment rejected.'.tr),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
      Navigator.pop(context);
    }
  }

  // 6. Footer Action Buttons
  Widget _buildFooterActions(BuildContext context, String departureTime) {
    final status = _trip?['status']?.toString() ?? 'Scheduled';
    final isAssigned = status.toLowerCase() == 'assigned';
    final startEnabled = _isStartEnabled(departureTime);

    if (isAssigned) {
      return Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () => _handleRespond('reject'),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.error, width: 1.5),
                foregroundColor: AppColors.error,
                padding: const EdgeInsets.symmetric(vertical: 14.0),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
              ),
              child: Text('Reject'.tr, style: const TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: ElevatedButton(
              onPressed: () => _handleRespond('accept'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.success,
                foregroundColor: Colors.white,
                elevation: 0,
                padding: const EdgeInsets.symmetric(vertical: 14.0),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
              ),
              child: Text('Accept Trip'.tr, style: const TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      );
    }

    return Column(
      children: [
        // Start Trip Button
        ElevatedButton.icon(
          onPressed: startEnabled ? _handleStartTrip : null,
          icon: Icon(
            startEnabled ? Icons.play_circle_outline : Icons.lock_clock,
            color: Colors.white,
            size: 20,
          ),
          label: Text(
            startEnabled ? 'Start Trip'.tr : 'Start Trip (Locked until 15m before)'.tr,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: startEnabled ? AppColors.secondary : const Color(0xFF8E9CAE),
            elevation: 0,
            minimumSize: const Size(double.infinity, 48),
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
          ),
        ),
        const SizedBox(height: 12),
        // Contact Dispatcher
        OutlinedButton.icon(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Connecting to dispatcher support dialer...'.tr),
              ),
            );
          },
          icon: const Icon(Icons.headset_mic_outlined, color: AppColors.secondary, size: 20),
          label: Text(
            'Contact Dispatcher'.tr,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppColors.secondary,
            ),
          ),
          style: OutlinedButton.styleFrom(
            side: const BorderSide(color: AppColors.secondary, width: 1.5),
            minimumSize: const Size(double.infinity, 48),
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCardHeader(BuildContext context, {required IconData icon, required String title}) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.divider.withValues(alpha: 0.5),
            borderRadius: BorderRadius.circular(AppRadius.sm),
          ),
          child: Icon(icon, color: AppColors.primaryText, size: 18),
        ),
        const SizedBox(width: 12),
        Text(
          title,
          style: const TextStyle(
            color: AppColors.primaryText,
            fontWeight: FontWeight.bold,
            fontSize: 14,
          ),
        ),
      ],
    );
  }

  Widget _buildInfoItem(BuildContext context, String label, String value, {bool alignRight = false}) {
    return Expanded(
      child: Column(
        crossAxisAlignment: alignRight ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppColors.secondaryText,
              fontSize: 10,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              color: AppColors.primaryText,
              fontWeight: FontWeight.bold,
              fontSize: 13,
            ),
            overflow: TextOverflow.ellipsis,
            maxLines: 1,
          ),
        ],
      ),
    );
  }
}
