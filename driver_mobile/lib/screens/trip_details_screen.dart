import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_radius.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';
import 'update_trip_status_screen.dart';
import 'e_way_bill_screen.dart';
import 'invoice_screen.dart';
import 'route_sheet_screen.dart';

class TripDetailsScreen extends StatelessWidget {
  final String tripId;

  const TripDetailsScreen({
    super.key,
    required this.tripId,
  });

  @override
  Widget build(BuildContext context) {
    // Determine data based on tripId to make it look dynamic
    final isTrp9921 = tripId == '#TRP-9921';
    final vehicleName = isTrp9921 ? 'AX 452 • HeavyDuty' : 'AX 312 • MediumDuty';
    final driverName = isTrp9921 ? 'Marcus Sterling' : 'Sarah Jenkins';
    final scheduledStart = isTrp9921 ? '07:30 AM' : '09:15 AM';
    final remainingDist = isTrp9921 ? '120 km' : '45 km';
    final etaText = isTrp9921 ? '14:45 PM' : '11:30 AM';
    final tripProgress = isTrp9921 ? 0.65 : 0.85;
    final progressPercent = '${(tripProgress * 100).toInt()}%';
    
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        centerTitle: false,
        title: Text(
          'Active Trip Details',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: AppColors.background,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Trip Header Summary Card
              _buildHeaderCard(context, vehicleName, driverName, scheduledStart),
              AppSpacing.verticalSm,

              // 2. Route Path Indicator Card
              _buildRouteProgressCard(context, remainingDist, etaText),
              AppSpacing.verticalSm,

              // 3. Specs Row (Fuel & Capacity)
              _buildSpecsRow(context),
              AppSpacing.verticalSm,

              // 4. Trip Progress Card
              _buildProgressCard(context, progressPercent, tripProgress),
              AppSpacing.verticalSm,

              // 5. Trip Timeline Card
              _buildTimelineCard(context),
              AppSpacing.verticalSm,

              // 6. Documents Section
              _buildDocumentsSection(context),
              AppSpacing.verticalSm,

              // 7. Trip Expenses Card
              _buildExpensesCard(context),
              AppSpacing.verticalMd,

              // 8. Footer Actions
              _buildFooterActions(context),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  // 1. Trip Header Card Builder
  Widget _buildHeaderCard(BuildContext context, String vehicleName, String driverName, String scheduledStart) {
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
                    'TRIP ID $tripId',
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: AppColors.secondaryText,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                      fontSize: 10,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    vehicleName,
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
                  color: AppColors.secondary.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(AppRadius.round),
                ),
                child: const Text(
                  'In Progress',
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
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Driver',
                    style: TextStyle(
                      color: AppColors.secondaryText,
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    driverName,
                    style: TextStyle(
                      color: AppColors.primaryText.withValues(alpha: 0.9),
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text(
                    'Scheduled Start',
                    style: TextStyle(
                      color: AppColors.secondaryText,
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    scheduledStart,
                    style: const TextStyle(
                      color: AppColors.primaryText,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 2. Route Progress Card Builder
  Widget _buildRouteProgressCard(BuildContext context, String remainingDist, String etaText) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Graphic section (Pickup -> Drop-off Curve)
          SizedBox(
            height: 70,
            child: Stack(
              children: [
                // Dotted Curve background
                Positioned.fill(
                  child: CustomPaint(
                    painter: DottedCurvePainter(),
                  ),
                ),
                // Pickup node (Bottom Left)
                Align(
                  alignment: Alignment.bottomLeft,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                      border: Border.all(color: AppColors.divider),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.04),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.location_on_outlined, size: 14, color: AppColors.secondaryText),
                        SizedBox(width: 4),
                        Text(
                          'Pickup',
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.secondaryText),
                        ),
                      ],
                    ),
                  ),
                ),
                // Drop-off node (Bottom Right)
                Align(
                  alignment: Alignment.bottomRight,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                      border: Border.all(color: AppColors.divider),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.04),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.flag_outlined, size: 14, color: AppColors.secondary),
                        SizedBox(width: 4),
                        Text(
                          'Drop-off',
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.secondaryText),
                        ),
                      ],
                    ),
                  ),
                ),
                // Steering / Remaining Dist Badge (Top Center)
                Align(
                  alignment: Alignment.topCenter,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.black,
                      borderRadius: BorderRadius.circular(AppRadius.round),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.directions_car_filled_outlined, size: 12, color: Colors.white),
                        const SizedBox(width: 6),
                        Text(
                          '$remainingDist left',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Address details
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Pickup Location',
                      style: TextStyle(color: AppColors.secondaryText, fontSize: 10, fontWeight: FontWeight.w500),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Port of Long Beach, CA',
                      style: TextStyle(color: AppColors.primaryText, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
              SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'Destination',
                      style: TextStyle(color: AppColors.secondaryText, fontSize: 10, fontWeight: FontWeight.w500),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Dist. Center A-12, AZ',
                      style: TextStyle(color: AppColors.primaryText, fontSize: 13, fontWeight: FontWeight.bold),
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
          
          // Remaining Distance & ETA
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Remaining Dist.',
                    style: TextStyle(color: AppColors.secondaryText, fontSize: 10, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    remainingDist,
                    style: const TextStyle(color: AppColors.primaryText, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text(
                    'ETA',
                    style: TextStyle(color: AppColors.secondaryText, fontSize: 10, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    etaText,
                    style: const TextStyle(
                      color: AppColors.secondary,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 3. Specs Row Builder
  Widget _buildSpecsRow(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: CustomCard(
            padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 12.0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.blue.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                  child: const Icon(Icons.local_gas_station_outlined, color: Colors.blue, size: 20),
                ),
                const SizedBox(width: 10),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Fuel Type',
                      style: TextStyle(color: AppColors.secondaryText, fontSize: 10, fontWeight: FontWeight.w500),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Diesel',
                      style: TextStyle(color: AppColors.primaryText, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: CustomCard(
            padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 12.0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.blue.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                  child: const Icon(Icons.shopping_bag_outlined, color: Colors.blue, size: 20),
                ),
                const SizedBox(width: 10),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Capacity',
                      style: TextStyle(color: AppColors.secondaryText, fontSize: 10, fontWeight: FontWeight.w500),
                    ),
                    SizedBox(height: 2),
                    Text(
                      '15 Tons',
                      style: TextStyle(color: AppColors.primaryText, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // 4. Trip Progress Card Builder
  Widget _buildProgressCard(BuildContext context, String progressPercent, double progressValue) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Trip Progress',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  color: AppColors.primaryText,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                progressPercent,
                style: const TextStyle(
                  color: Color(0xFF8B4513), // Custom reddish brown
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Custom progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progressValue,
              backgroundColor: Colors.blue.withValues(alpha: 0.08),
              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF8B4513)), // Progress color matching the brown in mockup
              minHeight: 8,
            ),
          ),
          const SizedBox(height: 12),
          // Progress stages
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildProgressStageNode('Started', isActive: true),
              _buildProgressStageNode('En Route', isActive: true),
              _buildProgressStageNode('Near End', isActive: false),
              _buildProgressStageNode('Arrived', isActive: false),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProgressStageNode(String label, {required bool isActive}) {
    return Column(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isActive ? const Color(0xFF8B4513) : AppColors.divider,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            color: isActive ? AppColors.primaryText : AppColors.secondaryText,
            fontSize: 9,
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }

  // 5. Trip Timeline Card Builder
  Widget _buildTimelineCard(BuildContext context) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Trip Timeline',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
              color: AppColors.primaryText,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          // Timeline list
          _buildTimelineItem(
            context,
            title: 'Trip Started',
            subtitle: '08:08 AM • Warehouse 4',
            isCompleted: true,
            isLast: false,
          ),
          _buildTimelineItem(
            context,
            title: 'Checkpoint 1',
            subtitle: '10:38 AM • Interstate 10W',
            isCompleted: true,
            isLast: false,
          ),
          _buildTimelineItem(
            context,
            title: 'Current Location',
            subtitle: 'Near Port of Long Beach vicinity',
            isCurrent: true,
            isLast: true,
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineItem(
    BuildContext context, {
    required String title,
    required String subtitle,
    bool isCompleted = false,
    bool isCurrent = false,
    bool isLast = false,
  }) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Left side: Line and Indicator
          Column(
            children: [
              Container(
                width: 14,
                height: 14,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isCurrent ? Colors.white : (isCompleted ? AppColors.primary : AppColors.divider),
                  border: isCurrent
                      ? Border.all(color: const Color(0xFF8B4513), width: 3.5)
                      : (isCompleted ? null : Border.all(color: AppColors.divider, width: 2)),
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 1.5,
                    color: AppColors.divider,
                  ),
                ),
            ],
          ),
          const SizedBox(width: 12),
          // Right side: Content
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      color: isCurrent ? const Color(0xFF8B4513) : AppColors.primaryText,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
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

  // 6. Documents Section Builder
  Widget _buildDocumentsSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4.0, vertical: 8.0),
          child: Text(
            'Documents',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: AppColors.primaryText,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        CustomCard(
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              _buildDocumentRow(
                context,
                title: 'E-Way Bill',
                icon: Icons.description_outlined,
                targetScreen: EWayBillScreen(tripId: tripId),
                hasDownload: true,
              ),
              const Divider(color: AppColors.divider),
              _buildDocumentRow(
                context,
                title: 'Invoice',
                icon: Icons.assignment_outlined,
                targetScreen: InvoiceScreen(tripId: tripId),
              ),
              const Divider(color: AppColors.divider),
              _buildDocumentRow(
                context,
                title: 'Route Sheet',
                icon: Icons.map_outlined,
                targetScreen: RouteSheetScreen(tripId: tripId),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDocumentRow(
    BuildContext context, {
    required String title,
    required IconData icon,
    required Widget targetScreen,
    bool hasDownload = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 10.0),
      child: Row(
        children: [
          Icon(icon, color: AppColors.secondaryText, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                color: AppColors.primaryText,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ),
          // View Button
          GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => targetScreen),
              );
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.blue.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: const Text(
                'View',
                style: TextStyle(
                  color: Colors.blue,
                  fontWeight: FontWeight.bold,
                  fontSize: 11,
                ),
              ),
            ),
          ),
          if (hasDownload) ...[
            const SizedBox(width: 8),
            // Download Icon Button
            GestureDetector(
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Downloading $title...')),
                );
              },
              child: Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppColors.primaryText,
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: const Icon(Icons.file_download_outlined, color: Colors.white, size: 14),
              ),
            ),
          ],
        ],
      ),
    );
  }

  // 7. Trip Expenses Card Builder
  Widget _buildExpensesCard(BuildContext context) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Trip Expenses',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  color: AppColors.primaryText,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.green.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(AppRadius.round),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.check_circle, color: Colors.green, size: 10),
                    SizedBox(width: 4),
                    Text(
                      'Uploaded',
                      style: TextStyle(color: Colors.green, fontSize: 9, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Toll Fee Receipt #TX-221',
            style: TextStyle(color: AppColors.secondaryText, fontSize: 11),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppColors.primaryText,
                    elevation: 0,
                    shadowColor: Colors.transparent,
                    side: const BorderSide(color: AppColors.divider),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.sm)),
                    padding: const EdgeInsets.symmetric(vertical: 10.0),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.camera_alt_outlined, size: 16, color: AppColors.primaryText),
                      SizedBox(width: 6),
                      Text('Capture', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppColors.primaryText,
                    elevation: 0,
                    shadowColor: Colors.transparent,
                    side: const BorderSide(color: AppColors.divider),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.sm)),
                    padding: const EdgeInsets.symmetric(vertical: 10.0),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.picture_as_pdf_outlined, size: 16, color: AppColors.primaryText),
                      SizedBox(width: 6),
                      Text('PDF', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 8. Footer Actions
  Widget _buildFooterActions(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Report Vehicle Issue (Error warning design)
        ElevatedButton(
          onPressed: () {},
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFFFFEBEA),
            foregroundColor: const Color(0xFFD92D20),
            shadowColor: Colors.transparent,
            elevation: 0,
            side: const BorderSide(color: Color(0xFFFECDCA)),
            padding: const EdgeInsets.symmetric(vertical: 14.0),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
          ),
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.warning_amber_rounded, size: 20, color: Color(0xFFD92D20)),
              SizedBox(width: 8),
              Text(
                'Report Vehicle Issue',
                style: TextStyle(fontSize: 15.0, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
        
        AppSpacing.verticalSm,

        // Update Trip Status (Navy primary)
        ElevatedButton(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => UpdateTripStatusScreen(
                  tripId: tripId,
                ),
              ),
            );
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14.0),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
          ),
          child: const Text(
            'Update Trip Status',
            style: TextStyle(fontSize: 15.0, fontWeight: FontWeight.bold),
          ),
        ),

        AppSpacing.verticalSm,

        // End Trip (Secondary Orange Outlined)
        OutlinedButton(
          onPressed: () {},
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.secondary,
            side: const BorderSide(color: AppColors.secondary, width: 1.5),
            padding: const EdgeInsets.symmetric(vertical: 14.0),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
          ),
          child: const Text(
            'End Trip',
            style: TextStyle(fontSize: 15.0, fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }
}

// Custom Painter to draw curved dotted route line
class DottedCurvePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.divider
      ..strokeWidth = 2.0
      ..style = PaintingStyle.stroke;

    final path = Path();
    // Start at bottom left, offset slightly for alignment inside the Stack
    path.moveTo(40, size.height - 15);
    // Control point creates arc curving upward, end point at bottom right
    path.quadraticBezierTo(size.width / 2, 8, size.width - 40, size.height - 15);

    const double dashWidth = 4.0;
    const double dashSpace = 4.0;
    double distance = 0.0;

    for (final pathMetric in path.computeMetrics()) {
      while (distance < pathMetric.length) {
        final extract = pathMetric.extractPath(distance, distance + dashWidth);
        canvas.drawPath(extract, paint);
        distance += dashWidth + dashSpace;
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
