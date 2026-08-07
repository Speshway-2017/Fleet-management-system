import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_radius.dart';
import '../constants/app_spacing.dart';
import '../services/api_service.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';
import '../utils/date_formatter.dart';
import 'completed_trip_details_screen.dart';

class CompletedTripsScreen extends StatefulWidget {
  const CompletedTripsScreen({super.key});

  @override
  State<CompletedTripsScreen> createState() => _CompletedTripsScreenState();
}

class _CompletedTripsScreenState extends State<CompletedTripsScreen> {
  bool _isLoading = true;
  List<Map<String, dynamic>> _completedTrips = [];

  @override
  void initState() {
    super.initState();
    _fetchCompletedTrips();
  }

  Future<void> _fetchCompletedTrips() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final res = await ApiService.get('/driver/trips?status=Completed');
      if (res != null && res['data'] is List) {
        final List list = res['data'];
        setState(() {
          _completedTrips = List<Map<String, dynamic>>.from(list);
          _isLoading = false;
        });
      } else {
        setState(() {
          _completedTrips = [];
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _completedTrips = [];
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        centerTitle: false,
        title: Text(
          'Completed Trips',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: AppColors.background,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _fetchCompletedTrips,
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _completedTrips.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(AppSpacing.md),
                      itemCount: _completedTrips.length,
                      itemBuilder: (context, index) {
                        final trip = _completedTrips[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: AppSpacing.md),
                          child: _buildCompletedTripCard(context, trip),
                        );
                      },
                    ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(32),
        child: Column(
          children: [
            const Icon(Icons.check_circle_outline, size: 64, color: AppColors.secondaryText),
            const SizedBox(height: 16),
            Text(
              'No Completed Trips',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryText,
                  ),
            ),
            const SizedBox(height: 8),
            const Text(
              'You have no completed trips recorded yet. When your assigned manager approves your uploaded POD and Weighbridge slips, completed trips will be listed here.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.secondaryText, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCompletedTripCard(BuildContext context, Map<String, dynamic> trip) {
    final rawTripId = trip['tripId'] ?? trip['_id'] ?? '#TRP-000';
    final tripNumber = trip['tripNumber'] ?? rawTripId.toString();
    final displayId = tripNumber.toString().startsWith('#') ? tripNumber.toString() : '#$tripNumber';
    final pickup = trip['pickup'] ?? trip['startLocation'] ?? 'Origin';
    final destination = trip['destination'] ?? trip['endLocation'] ?? 'Destination';
    final date = formatIndianDateTime(trip['actualEndTime'] ?? trip['createdAt'] ?? 'Completed');
    double distanceVal = double.tryParse(trip['actualDistance']?.toString() ?? '') ?? 0.0;
    if (distanceVal == 0.0) {
      distanceVal = double.tryParse(trip['estimatedDistance']?.toString() ?? '') ?? 0.0;
    }
    if (distanceVal == 0.0) {
      distanceVal = 240.0;
    }
    final distance = '${distanceVal.toStringAsFixed(0)} km';

    final departureTimeStr = trip['departureTime'] ?? trip['actualStartTime'];
    final departureTime = departureTimeStr != null ? DateTime.tryParse(departureTimeStr.toString()) : null;
    final actualEndTimeStr = trip['actualEndTime'] ?? trip['createdAt'];
    final actualEndTime = actualEndTimeStr != null ? DateTime.tryParse(actualEndTimeStr.toString()) : null;
    final createdAt = trip['createdAt'] != null ? DateTime.tryParse(trip['createdAt'].toString()) : null;
    
    final startTime = departureTime ?? createdAt ?? DateTime.now();
    final endTime = actualEndTime ?? createdAt ?? DateTime.now();
    final durationDiff = endTime.difference(startTime);
    final durationHours = durationDiff.inHours;
    final durationMins = durationDiff.inMinutes.remainder(60);
    final duration = durationHours > 0 ? '${durationHours}h ${durationMins}m' : '${durationMins}m';

    final fuelDetails = trip['fuelDetails'] as Map<String, dynamic>?;
    final fuelUsedVal = fuelDetails != null ? fuelDetails['liters'] : null;
    final fuelUsed = fuelUsedVal != null 
        ? '${double.tryParse(fuelUsedVal.toString())?.toStringAsFixed(0) ?? fuelUsedVal} L'
        : '30 L';

    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header: Date & Status
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  date,
                  style: const TextStyle(
                    color: AppColors.secondaryText,
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F5E9),
                  borderRadius: BorderRadius.circular(AppRadius.round),
                ),
                child: const Text(
                  'Completed',
                  style: TextStyle(
                    color: Color(0xFF2E7D32),
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          // Trip ID
          Text(
            displayId,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: AppColors.primaryText,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),

          // Route Timeline Info
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                children: [
                  const SizedBox(height: 2),
                  const Icon(
                    Icons.radio_button_checked,
                    color: AppColors.secondary,
                    size: 15,
                  ),
                  Container(
                    width: 1.5,
                    height: 24,
                    color: AppColors.divider,
                  ),
                  const Icon(
                    Icons.location_on,
                    color: AppColors.primaryText,
                    size: 15,
                  ),
                ],
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Pickup',
                      style: TextStyle(
                        color: AppColors.secondaryText,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      pickup.toString(),
                      style: const TextStyle(
                        color: AppColors.primaryText,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 10),
                    const Text(
                      'Destination',
                      style: TextStyle(
                        color: AppColors.secondaryText,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      destination.toString(),
                      style: const TextStyle(
                        color: AppColors.primaryText,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Stats row
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 12.0),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(color: AppColors.divider),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildCardStat(
                  icon: Icons.map_outlined,
                  label: 'Distance',
                  value: distance.toString(),
                ),
                Container(width: 1, height: 24, color: AppColors.divider),
                _buildCardStat(
                  icon: Icons.access_time_outlined,
                  label: 'Duration',
                  value: duration.toString(),
                ),
                Container(width: 1, height: 24, color: AppColors.divider),
                _buildCardStat(
                  icon: Icons.local_gas_station_outlined,
                  label: 'Fuel Used',
                  value: fuelUsed.toString(),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // View Summary Button
          OutlinedButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => CompletedTripDetailsScreen(
                    tripId: displayId,
                    tripData: trip,
                  ),
                ),
              );
            },
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: AppColors.secondary, width: 1.5),
              foregroundColor: AppColors.secondary,
              padding: const EdgeInsets.symmetric(vertical: 12.0),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
            ),
            child: const Text(
              'View Summary',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCardStat({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Column(
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: AppColors.secondaryText, size: 13),
            const SizedBox(width: 4),
            Text(
              label,
              style: const TextStyle(
                color: AppColors.secondaryText,
                fontSize: 9,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            color: AppColors.primaryText,
            fontWeight: FontWeight.bold,
            fontSize: 12,
          ),
        ),
      ],
    );
  }
}
