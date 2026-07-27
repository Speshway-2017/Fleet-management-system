import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_radius.dart';
import '../constants/app_spacing.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';
import 'upcoming_trip_details_screen.dart';

class UpcomingTripsScreen extends StatelessWidget {
  const UpcomingTripsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        centerTitle: false,
        title: Text(
          'Upcoming Trips',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: AppColors.background,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildUpcomingTripCard(context),
              AppSpacing.verticalMd,
              _buildUpcomingTripCard(context),
              AppSpacing.verticalMd,
              _buildUpcomingTripCard(context),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildUpcomingTripCard(BuildContext context) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header: ID and Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '#TRP-8840',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: AppColors.primaryText,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.secondary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(AppRadius.round),
                ),
                child: const Text(
                  'Upcoming',
                  style: TextStyle(
                    color: AppColors.secondary,
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          // Scheduled Time Row
          const Row(
            children: [
              Icon(Icons.access_time_outlined, color: AppColors.secondaryText, size: 16),
              SizedBox(width: 8),
              Text(
                'Tomorrow, 08:00 AM',
                style: TextStyle(
                  color: AppColors.secondaryText,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Route Timeline Segment
          _buildTimelineSegment(context),

          const Padding(
            padding: EdgeInsets.symmetric(vertical: 12.0),
            child: Divider(color: AppColors.divider),
          ),

          // Details grid (Vehicle & Driver)
          const Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'VEHICLE',
                      style: TextStyle(
                        color: AppColors.secondaryText,
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Medium Van - BT 990',
                      style: TextStyle(
                        color: AppColors.primaryText,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'DRIVER',
                      style: TextStyle(
                        color: AppColors.secondaryText,
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Marcus Thorne',
                      style: TextStyle(
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

          const SizedBox(height: 16),

          // Footer Action Buttons
          Row(
            children: [
              // Start Trip (Disabled Outline Button)
              Expanded(
                child: OutlinedButton(
                  onPressed: null, // Disabled
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: AppColors.disabledText.withValues(alpha: 0.3)),
                    foregroundColor: AppColors.disabledText,
                    disabledForegroundColor: AppColors.disabledText.withValues(alpha: 0.6),
                    padding: const EdgeInsets.symmetric(vertical: 12.0),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                    ),
                  ),
                  child: const Text(
                    'Start Trip',
                    style: TextStyle(
                      fontSize: 14.0,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // View Details (Navy Primary Button)
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const UpcomingTripDetailsScreen(tripId: '#TRP-8840'),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 12.0),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                    ),
                  ),
                  child: const Text(
                    'View Details',
                    style: TextStyle(
                      fontSize: 14.0,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineSegment(BuildContext context) {
    return Column(
      children: [
        // Pickup node
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              children: [
                const SizedBox(height: 2),
                const Icon(
                  Icons.location_on,
                  color: AppColors.secondary,
                  size: 16,
                ),
                Container(
                  width: 1.5,
                  height: 22,
                  color: AppColors.divider,
                ),
              ],
            ),
            const SizedBox(width: 10),
            const Expanded(
              child: Text(
                'Central Logistics Hub, Berlin',
                style: TextStyle(
                  color: AppColors.primaryText,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
        // Destination node
        const Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              children: [
                Icon(
                  Icons.flag_outlined,
                  color: AppColors.primaryText,
                  size: 16,
                ),
              ],
            ),
            SizedBox(width: 10),
            Expanded(
              child: Text(
                'Retail Center West, Potsdam',
                style: TextStyle(
                  color: AppColors.primaryText,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
