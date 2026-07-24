import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_radius.dart';
import '../constants/app_spacing.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';

class RouteSheetScreen extends StatelessWidget {
  final String tripId;

  const RouteSheetScreen({
    super.key,
    this.tripId = '#TRP-9921',
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        centerTitle: false,
        title: Text(
          'Route Sheet',
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
              // 1. Trip ID Card
              _buildTripSummaryCard(context),
              AppSpacing.verticalSm,

              // 2. Tracking Card
              _buildTrackingCard(context),
              AppSpacing.verticalSm,

              // 3. Stats Grid (2x2)
              _buildRouteStatsGrid(context),
              AppSpacing.verticalSm,

              // 4. Current Speed Card
              _buildCurrentSpeedCard(context),
              AppSpacing.verticalSm,

              // 5. Route Timeline
              _buildRouteTimeline(context),
              AppSpacing.verticalSm,

              // 6. Navigation Notes
              _buildNavigationNotesCard(context),
              AppSpacing.verticalLg,

              // 7. Footer Actions
              _buildFooterActions(context),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTripSummaryCard(BuildContext context) {
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
                  const Text(
                    'TRIP ID',
                    style: TextStyle(
                      color: AppColors.secondaryText,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    tripId,
                    style: const TextStyle(
                      color: AppColors.primaryText,
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F5E9),
                  borderRadius: BorderRadius.circular(AppRadius.round),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.circle, color: Color(0xFF2E7D32), size: 8),
                    SizedBox(width: 6),
                    Text(
                      'In Progress',
                      style: TextStyle(
                        color: Color(0xFF2E7D32),
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                    ),
                  ],
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
              _buildInfoRow('Vehicle', 'AX 452'),
              _buildInfoRow('Driver', 'Meghana', alignRight: true),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTrackingCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7ED), // very soft orange/red
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: const Color(0xFFFFEDD5)),
      ),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.radar, color: AppColors.secondary, size: 20),
          SizedBox(width: 8),
          Text(
            'Live Tracking Active',
            style: TextStyle(
              color: AppColors.secondary,
              fontWeight: FontWeight.bold,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRouteStatsGrid(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      childAspectRatio: 2.1,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      children: [
        _buildStatCard('Est. Distance', '420 km'),
        _buildStatCard('Est. Duration', '6h 30m'),
        _buildStatCard('Remaining', '150 km', highlight: true),
        _buildStatCard('ETA', '14:45 PM'),
      ],
    );
  }

  Widget _buildStatCard(String label, String value, {bool highlight = false}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
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
            style: TextStyle(
              color: highlight ? AppColors.secondary : AppColors.primaryText,
              fontWeight: FontWeight.bold,
              fontSize: 15,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentSpeedCard(BuildContext context) {
    return CustomCard(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Current Speed',
                style: TextStyle(
                  color: AppColors.secondaryText,
                  fontSize: 10,
                ),
              ),
              SizedBox(height: 4),
              Text(
                '65 km/h',
                style: TextStyle(
                  color: AppColors.primaryText,
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                ),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.speed, color: Colors.blue.shade700, size: 20),
          ),
        ],
      ),
    );
  }

  Widget _buildRouteTimeline(BuildContext context) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Route Timeline',
            style: TextStyle(
              color: AppColors.primaryText,
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 16),
          // Stack of timeline steps
          _buildTimelineStep(
            title: 'Origin Warehouse',
            time: '08:00 AM',
            desc: 'Departure successful',
            status: TimelineStatus.done,
          ),
          _buildTimelineStep(
            title: 'Checkpoint 1',
            time: '09:45 AM',
            desc: 'Transit: 120 km',
            status: TimelineStatus.done,
          ),
          _buildTimelineStep(
            title: 'Current: NH-44 Crossing',
            time: 'Active',
            desc: 'In-transit, moving at 65 km/h',
            status: TimelineStatus.active,
          ),
          _buildTimelineStep(
            title: 'Destination Depot',
            time: 'Est. 14:45',
            desc: 'Distance left: 150 km',
            status: TimelineStatus.upcoming,
            isLast: true,
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineStep({
    required String title,
    required String time,
    required String desc,
    required TimelineStatus status,
    bool isLast = false,
  }) {
    Color nodeColor;
    Widget? activeBox;

    switch (status) {
      case TimelineStatus.done:
        nodeColor = AppColors.primaryText;
        break;
      case TimelineStatus.active:
        nodeColor = AppColors.secondary;
        // The active step gets a nice soft orange highlighted container card
        activeBox = Container(
          margin: const EdgeInsets.only(top: 4, bottom: 8),
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: const Color(0xFFFFF7ED),
            border: Border(
              left: const BorderSide(color: AppColors.secondary, width: 3),
              top: BorderSide(color: const Color(0xFFFFE4E6).withValues(alpha: 0.5)),
              right: BorderSide(color: const Color(0xFFFFE4E6).withValues(alpha: 0.5)),
              bottom: BorderSide(color: const Color(0xFFFFE4E6).withValues(alpha: 0.5)),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: Color(0xFF7C2D12),
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                  const Text(
                    'Active',
                    style: TextStyle(
                      color: AppColors.secondary,
                      fontWeight: FontWeight.bold,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 2),
              Text(
                desc,
                style: const TextStyle(
                  color: Color(0xFF9A3412),
                  fontSize: 11,
                ),
              ),
            ],
          ),
        );
        break;
      case TimelineStatus.upcoming:
        nodeColor = AppColors.secondaryText;
        break;
    }

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Node Column
          Column(
            children: [
              const SizedBox(height: 4),
              if (status == TimelineStatus.active)
                Container(
                  width: 14,
                  height: 14,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.secondary, width: 2),
                    color: Colors.white,
                  ),
                  child: Center(
                    child: Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.secondary,
                      ),
                    ),
                  ),
                )
              else
                Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: nodeColor,
                  ),
                ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 1.5,
                    color: status == TimelineStatus.done 
                        ? AppColors.primaryText 
                        : AppColors.divider,
                  ),
                ),
            ],
          ),
          const SizedBox(width: 14),
          // Content
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 16.0),
              child: status == TimelineStatus.active
                  ? activeBox!
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              title,
                              style: TextStyle(
                                color: status == TimelineStatus.done 
                                    ? AppColors.primaryText 
                                    : AppColors.secondaryText,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                            Text(
                              time,
                              style: const TextStyle(
                                color: AppColors.secondaryText,
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          desc,
                          style: const TextStyle(
                            color: AppColors.secondaryText,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavigationNotesCard(BuildContext context) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Navigation Notes',
            style: TextStyle(
              color: AppColors.primaryText,
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 14),
          _buildNoteRow(
            context,
            Icons.pin_drop_outlined,
            'Delivery Instructions',
            'Handover at Dock C. Use secondary entrance if main gate is congested.',
          ),
          const SizedBox(height: 12),
          _buildNoteRow(
            context,
            Icons.warning_amber_rounded,
            'Special Handling',
            'Fragile Electronics - Avoid sharp turns.',
            isCritical: true,
          ),
          const SizedBox(height: 12),
          _buildNoteRow(
            context,
            Icons.phone_in_talk_outlined,
            'Emergency Contact',
            '+1 (555) 012-3456 (Command Center)',
          ),
        ],
      ),
    );
  }

  Widget _buildNoteRow(
    BuildContext context,
    IconData icon,
    String title,
    String value, {
    bool isCritical = false,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          color: isCritical ? Colors.red.shade700 : AppColors.secondary,
          size: 18,
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: AppColors.secondaryText,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: TextStyle(
                  color: isCritical ? Colors.red.shade900 : AppColors.primaryText,
                  fontWeight: isCritical ? FontWeight.bold : FontWeight.normal,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFooterActions(BuildContext context) {
    return Column(
      children: [
        ElevatedButton.icon(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Downloading Route Sheet Document...')),
            );
          },
          icon: const Icon(Icons.download_outlined, color: Colors.white, size: 20),
          label: const Text(
            'Download Route Sheet',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            elevation: 0,
            minimumSize: const Size(double.infinity, 48),
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
          ),
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Opening Share Dialog for Route Sheet...')),
            );
          },
          icon: const Icon(Icons.share_outlined, color: AppColors.secondary, size: 20),
          label: const Text(
            'Share Route Details',
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

  Widget _buildInfoRow(String label, String value, {bool alignRight = false}) {
    return Column(
      crossAxisAlignment: alignRight ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppColors.secondaryText,
            fontSize: 9,
            fontWeight: FontWeight.bold,
          ),
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

enum TimelineStatus { done, active, upcoming }
