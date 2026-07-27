import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_radius.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';

class TripDetailsScreen extends StatelessWidget {
  final String tripId;

  const TripDetailsScreen({
    super.key,
    required this.tripId,
  });

  @override
  Widget build(BuildContext context) {
    // Dynamic data configuration based on tripId
    final isCompleted = tripId == '#TX-9021' || tripId == '#TRP-9921';
    final activeId = tripId;
    final statusText = isCompleted ? 'COMPLETED' : 'SCHEDULED';
    final statusColor = isCompleted ? AppColors.success : AppColors.secondaryText;
    
    // Details
    final origin = isCompleted ? 'Dallas, IL' : 'Houston, TX';
    final destination = isCompleted ? 'Detroit, MI' : 'Houston Port, TX';
    final distance = isCompleted ? '420 mi' : '285 mi';
    final estTime = isCompleted ? '8h 30m' : '5h 30m';
    final stopsCount = isCompleted ? '4' : '3';
    
    // Driver Details
    final driverName = isCompleted ? 'Alex Johnson' : 'Sarah Jenkins';
    final truckId = isCompleted ? 'VOLVO-902' : 'FORD-104';
    final weight = isCompleted ? '12.4 Tons' : '10.8 Tons';

    // Manifest nodes
    final manifestNodes = isCompleted
        ? [
            _ManifestNode('Regional Logistics Hub', 'Chicago, IL • 06:00 AM', true),
            _ManifestNode('Warehouse B', 'Gary, IN • 08:30 AM', true),
            _ManifestNode('Distribution Center', 'Ann Arbor, MI • 12:00 PM', true),
            _ManifestNode('Detroit Terminal', 'Detroit, MI • 02:30 PM', true),
          ]
        : [
            _ManifestNode('Houston Logistics Hub', 'Houston, TX • 03:45 PM', false),
            _ManifestNode('Galveston Warehouses', 'Galveston, TX • 06:30 PM', false),
            _ManifestNode('Houston Port Terminals', 'Houston Port • 09:15 PM', false),
          ];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        centerTitle: false,
        title: Text(
          'Trip Details',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: Colors.white,
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
              // Trip Summary Card
              CustomCard(
                padding: const EdgeInsets.all(16),
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
                              'TRIP ID',
                              style: GoogleFonts.poppins(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: AppColors.secondaryText,
                              ),
                            ),
                            Text(
                              activeId,
                              style: GoogleFonts.poppins(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primaryText,
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: statusColor.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            statusText,
                            style: GoogleFonts.poppins(
                              color: statusColor,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    AppSpacing.verticalMd,
                    // Path display (Origin to Destination)
                    Stack(
                      children: [
                        Positioned(
                          left: 5,
                          top: 10,
                          bottom: 10,
                          child: Container(
                            width: 1,
                            color: AppColors.divider,
                            child: const VerticalDivider(
                              color: Colors.grey,
                              thickness: 1,
                              indent: 4,
                              endIndent: 4,
                            ),
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 10,
                                  height: 10,
                                  decoration: const BoxDecoration(
                                    color: AppColors.secondary,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Origin',
                                        style: GoogleFonts.poppins(
                                          fontSize: 9,
                                          color: AppColors.secondaryText,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      Text(
                                        origin,
                                        style: GoogleFonts.poppins(
                                          fontSize: 14,
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.primaryText,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Row(
                              children: [
                                Container(
                                  width: 10,
                                  height: 10,
                                  decoration: const BoxDecoration(
                                    color: AppColors.secondary,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Destination',
                                        style: GoogleFonts.poppins(
                                          fontSize: 9,
                                          color: AppColors.secondaryText,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      Text(
                                        destination,
                                        style: GoogleFonts.poppins(
                                          fontSize: 14,
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.primaryText,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              AppSpacing.verticalMd,

              // 3-Metric Boxes Row
              Row(
                children: [
                  Expanded(
                    child: _buildMetricCard(
                      icon: Icons.alt_route_outlined,
                      label: 'Distance',
                      value: distance,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildMetricCard(
                      icon: Icons.access_time,
                      label: 'Est. Time',
                      value: estTime,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildMetricCard(
                      icon: Icons.pin_drop_outlined,
                      label: 'Stops',
                      value: stopsCount,
                    ),
                  ),
                ],
              ),
              AppSpacing.verticalMd,

              // Driver & Truck Info Card (Dark Navy)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF0D1C2E),
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      children: [
                        // Avatar placeholder matching the screenshot
                        Container(
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.white24, width: 1.5),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(
                            Icons.person,
                            color: Colors.white70,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                driverName,
                                style: GoogleFonts.poppins(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              Text(
                                'ID: $truckId',
                                style: GoogleFonts.nunito(
                                  fontSize: 12,
                                  color: Colors.white60,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              'WEIGHT',
                              style: GoogleFonts.poppins(
                                fontSize: 9,
                                color: AppColors.secondary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              weight,
                              style: GoogleFonts.poppins(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Visual progress indicator line
                    Container(
                      height: 3,
                      decoration: BoxDecoration(
                        color: Colors.white12,
                        borderRadius: BorderRadius.circular(2),
                      ),
                      child: FractionallySizedBox(
                        alignment: Alignment.centerLeft,
                        widthFactor: isCompleted ? 1.0 : 0.0,
                        child: Container(
                          decoration: BoxDecoration(
                            color: AppColors.secondary,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              AppSpacing.verticalLg,

              // TRIP MANIFEST Title
              Text(
                'TRIP MANIFEST',
                style: GoogleFonts.poppins(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: AppColors.secondaryText,
                  letterSpacing: 0.5,
                ),
              ),
              AppSpacing.verticalSm,

              // Trip Manifest Timeline Card
              CustomCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: List.generate(
                    manifestNodes.length,
                    (index) {
                      final node = manifestNodes[index];
                      return _buildManifestNodeItem(
                        node: node,
                        isLast: index == manifestNodes.length - 1,
                      );
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricCard({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        children: [
          Icon(icon, color: AppColors.secondary, size: 22),
          const SizedBox(height: 6),
          Text(
            label,
            style: GoogleFonts.nunito(
              fontSize: 11,
              color: AppColors.secondaryText,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryText,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildManifestNodeItem({
    required _ManifestNode node,
    required bool isLast,
  }) {
    return Stack(
      children: [
        if (!isLast)
          Positioned(
            left: 10,
            top: 20,
            bottom: 0,
            child: Container(
              width: 1.5,
              color: AppColors.secondary,
            ),
          ),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              margin: const EdgeInsets.only(top: 2),
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: node.isCompleted ? AppColors.secondary : AppColors.divider,
              ),
              child: node.isCompleted
                  ? const Icon(
                      Icons.check,
                      color: Colors.white,
                      size: 14,
                    )
                  : const SizedBox(),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 24.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            node.title,
                            style: GoogleFonts.poppins(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryText,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            node.subtitle,
                            style: GoogleFonts.nunito(
                              fontSize: 12,
                              color: AppColors.secondaryText,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      node.isCompleted ? 'COMPLETED' : 'PENDING',
                      style: GoogleFonts.poppins(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: node.isCompleted ? AppColors.secondary : AppColors.secondaryText,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _ManifestNode {
  final String title;
  final String subtitle;
  final bool isCompleted;

  _ManifestNode(this.title, this.subtitle, this.isCompleted);
}
