import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_radius.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';
import 'trip_details_screen.dart';

class ActiveTripsScreen extends StatelessWidget {
  const ActiveTripsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        centerTitle: false,
        title: Text(
          'Active Trips',
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
              // 1. In Progress Trip Card
              _buildInProgressCard(context),
              AppSpacing.verticalMd,

              // 2. Upcoming Trip Card
              _buildUpcomingCard(context),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  // 1. In Progress Card Builder
  Widget _buildInProgressCard(BuildContext context) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'TRIP ID',
                    style: TextStyle(
                      color: AppColors.secondaryText,
                      fontWeight: FontWeight.bold,
                      fontSize: 10,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '#TRP-9921',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: AppColors.primaryText,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.blue.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(AppRadius.round),
                ),
                child: const Text(
                  'In Progress',
                  style: TextStyle(
                    color: Colors.blue,
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Route timeline segment
          _buildRouteTimeline(
            context,
            pickupLabel: 'PICKUP',
            pickupAddress: 'Port of Long Beach, CA',
            destLabel: 'DESTINATION',
            destAddress: 'Distribution Center A-12, AZ',
            isMuted: false,
          ),

          const Padding(
            padding: EdgeInsets.symmetric(vertical: 12.0),
            child: Divider(color: AppColors.divider),
          ),

          // Vehicle & ETA info row
          Row(
            children: [
              Expanded(
                child: _buildDetailsColumn(
                  context,
                  label: 'VEHICLE',
                  value: 'Heavy Duty - AX 452',
                  icon: Icons.local_shipping_outlined,
                  isMuted: false,
                ),
              ),
              Expanded(
                child: _buildDetailsColumn(
                  context,
                  label: 'ETA',
                  value: '14:45 PM',
                  icon: Icons.access_time_outlined,
                  isMuted: false,
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Trip Progress Bar Section
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Trip Progress',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.secondaryText,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                '65%',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.primaryText,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: const LinearProgressIndicator(
              value: 0.65,
              backgroundColor: AppColors.divider,
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.secondary),
              minHeight: 6,
            ),
          ),

          const SizedBox(height: 16),

          // View Details Action button
          ElevatedButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const TripDetailsScreen(tripId: '#TRP-9921'),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.secondary,
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
        ],
      ),
    );
  }

  // 2. Upcoming Card Builder
  Widget _buildUpcomingCard(BuildContext context) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'TRIP ID',
                    style: TextStyle(
                      color: AppColors.secondaryText,
                      fontWeight: FontWeight.bold,
                      fontSize: 10,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '#TRP-8840',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
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

          const SizedBox(height: 16),

          // Route timeline segment (Muted/Grey)
          _buildRouteTimeline(
            context,
            pickupLabel: 'PICKUP',
            pickupAddress: 'Regional Hub South, UX',
            destLabel: 'DESTINATION',
            destAddress: 'Main Warehouse, NV',
            isMuted: true,
          ),

          const Padding(
            padding: EdgeInsets.symmetric(vertical: 12.0),
            child: Divider(color: AppColors.divider),
          ),

          // Vehicle & Start Time info row
          Row(
            children: [
              Expanded(
                child: _buildDetailsColumn(
                  context,
                  label: 'VEHICLE',
                  value: 'Medium Van - BT 990',
                  icon: Icons.local_shipping_outlined,
                  isMuted: true,
                ),
              ),
              Expanded(
                child: _buildDetailsColumn(
                  context,
                  label: 'START TIME',
                  value: 'Tomorrow, 08:00',
                  icon: Icons.access_time_outlined,
                  isMuted: true,
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // View Details Action button (Outlined styled orange or light orange background)
          ElevatedButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const TripDetailsScreen(tripId: '#TRP-8840'),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.secondary.withValues(alpha: 0.12),
              foregroundColor: AppColors.secondary,
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
        ],
      ),
    );
  }

  // Common Route Timeline Widget
  Widget _buildRouteTimeline(
    BuildContext context, {
    required String pickupLabel,
    required String pickupAddress,
    required String destLabel,
    required String destAddress,
    required bool isMuted,
  }) {
    final dotColor = isMuted ? AppColors.secondaryText.withValues(alpha: 0.4) : Colors.blue;
    final pinColor = isMuted ? AppColors.secondaryText.withValues(alpha: 0.4) : AppColors.error;
    final textColor = isMuted ? AppColors.secondaryText.withValues(alpha: 0.7) : AppColors.primaryText;
    final labelColor = AppColors.secondaryText;

    return Column(
      children: [
        // Pickup row
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              children: [
                const SizedBox(height: 3),
                Container(
                  width: 14,
                  height: 14,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: dotColor, width: 2),
                    color: Colors.white,
                  ),
                ),
                // Dashed vertical connector line
                Container(
                  width: 1.5,
                  height: 24,
                  color: AppColors.divider,
                ),
              ],
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    pickupLabel,
                    style: TextStyle(color: labelColor, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    pickupAddress,
                    style: TextStyle(color: textColor, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ],
        ),
        // Destination row
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              children: [
                Icon(
                  isMuted ? Icons.location_on_outlined : Icons.location_on,
                  color: pinColor,
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
                    destLabel,
                    style: TextStyle(color: labelColor, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    destAddress,
                    style: TextStyle(color: textColor, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  // Common details column info with icon
  Widget _buildDetailsColumn(
    BuildContext context, {
    required String label,
    required String value,
    required IconData icon,
    required bool isMuted,
  }) {
    final valueTextColor = isMuted ? AppColors.secondaryText.withValues(alpha: 0.7) : AppColors.primaryText;
    final iconColor = isMuted ? AppColors.secondaryText.withValues(alpha: 0.4) : AppColors.primaryText;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
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
        Row(
          children: [
            Icon(icon, color: iconColor, size: 16),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                value,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: valueTextColor,
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
