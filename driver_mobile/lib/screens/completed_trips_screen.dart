import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_radius.dart';
import '../constants/app_spacing.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';
import 'completed_trip_details_screen.dart';

class CompletedTripsScreen extends StatelessWidget {
  const CompletedTripsScreen({super.key});

  // Mock completed trips data
  final List<Map<String, dynamic>> _completedTrips = const [
    {
      'tripId': '#TRP-48291',
      'date': 'Oct 24, 2023 • 04:30 PM',
      'pickup': 'Central Logistics Hub, Berlin',
      'destination': 'Maritime Terminal B-12, Hamburg',
      'distance': '284 km',
      'duration': '3h 45m',
      'fuelUsed': '24.8 L',
    },
    {
      'tripId': '#TRP-48155',
      'date': 'Oct 23, 2023 • 09:15 AM',
      'pickup': 'Eastside Warehouse, Munich',
      'destination': 'Regional Distribution Center, Stuttgart',
      'distance': '232 km',
      'duration': '2h 55m',
      'fuelUsed': '19.2 L',
    },
    {
      'tripId': '#TRP-47902',
      'date': 'Oct 21, 2023 • 11:45 PM',
      'pickup': 'Airport Cargo Terminal, Frankfurt',
      'destination': 'City Logistics Center, Cologne',
      'distance': '190 km',
      'duration': '2h 10m',
      'fuelUsed': '15.5 L',
    },
  ];

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
        child: ListView.builder(
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
    );
  }

  Widget _buildCompletedTripCard(BuildContext context, Map<String, dynamic> trip) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header: Date & Status
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                trip['date'] as String,
                style: const TextStyle(
                  color: AppColors.secondaryText,
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
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
            trip['tripId'] as String,
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
                    Text(
                      'Pickup',
                      style: TextStyle(
                        color: AppColors.secondaryText,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      trip['pickup'] as String,
                      style: const TextStyle(
                        color: AppColors.primaryText,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'Destination',
                      style: TextStyle(
                        color: AppColors.secondaryText,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      trip['destination'] as String,
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
                  value: trip['distance'] as String,
                ),
                Container(width: 1, height: 24, color: AppColors.divider),
                _buildCardStat(
                  icon: Icons.access_time_outlined,
                  label: 'Duration',
                  value: trip['duration'] as String,
                ),
                Container(width: 1, height: 24, color: AppColors.divider),
                _buildCardStat(
                  icon: Icons.local_gas_station_outlined,
                  label: 'Fuel Used',
                  value: trip['fuelUsed'] as String,
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
                    tripId: trip['tripId'] as String,
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
