import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_radius.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';

class AssignmentDetailsScreen extends StatelessWidget {
  final String? tripId;

  const AssignmentDetailsScreen({super.key, this.tripId});

  @override
  Widget build(BuildContext context) {
    final activeId = tripId ?? '#FL-771';
    final isCompleted = activeId == '#TX-9021';
    final statusText = isCompleted ? 'Completed' : 'Scheduled';
    final statusColor = isCompleted ? AppColors.success : AppColors.secondary;
    final dateText = isCompleted ? 'Tuesday, Oct 24' : 'Wednesday, Oct 25';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        centerTitle: false,
        title: Text(
          'Assignment Details',
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
              // Trip ID & Status Header Card
              CustomCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          activeId,
                          style: GoogleFonts.poppins(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primaryText,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: statusColor,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            statusText,
                            style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      dateText,
                      style: GoogleFonts.nunito(
                        color: AppColors.secondaryText,
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              AppSpacing.verticalMd,

              // Simulated Map with Destination Label
              Container(
                height: 180,
                decoration: BoxDecoration(
                  color: const Color(0xFFE5E9F0),
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  border: Border.all(color: AppColors.divider),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(AppRadius.lg - 1),
                  child: Stack(
                    children: [
                      // Base Map Image Asset
                      Positioned.fill(
                        child: Image.asset(
                          'assets/images/map_preview.png',
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              color: const Color(0xFFF1F5F9),
                            );
                          },
                        ),
                      ),
                      // Exact Reference Map Painter overlay
                      Positioned.fill(
                        child: CustomPaint(
                          painter: _ExactReferenceMapPainter(),
                        ),
                      ),
                      // Map Icon Button in top right
                      Positioned(
                        top: 12,
                        right: 12,
                        child: Container(
                          width: 36,
                          height: 36,
                          decoration: const BoxDecoration(
                            color: Color(0xFF2E3B4E),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.map_outlined,
                            color: Colors.white,
                            size: 18,
                          ),
                        ),
                      ),
                      // Destination Location Tag at Bottom
                      Positioned(
                        bottom: 0,
                        left: 0,
                        right: 0,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.only(
                              bottomLeft: Radius.circular(16),
                              bottomRight: Radius.circular(16),
                            ),
                          ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.location_on,
                              color: AppColors.secondary,
                              size: 20,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              isCompleted ? 'Dallas, TX' : 'Indianapolis, IN',
                              style: GoogleFonts.poppins(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primaryText,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            AppSpacing.verticalMd,

              // Metrics Grid (4 items)
              Row(
                children: [
                  Expanded(
                    child: _buildMetricBox(
                      'DEPARTURE',
                      isCompleted ? '06:00 AM' : '08:00 AM',
                      isCompleted ? 'Completed' : 'Expected Oct 25',
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildMetricBox(
                      'ARRIVAL',
                      isCompleted ? '02:30 PM' : '11:30 AM',
                      isCompleted ? 'Completed' : 'Est. Delivery',
                    ),
                  ),
                ],
              ),
              AppSpacing.verticalSm,
              Row(
                children: [
                  Expanded(
                    child: _buildMetricBox(
                      'DISTANCE',
                      isCompleted ? '420 mi' : '184 mi',
                      'Total Route',
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildMetricBox(
                      'DURATION',
                      isCompleted ? '8h 30m' : '3h 30m',
                      'Shift Estimate',
                    ),
                  ),
                ],
              ),
              AppSpacing.verticalMd,

              // Load Details Card
              Text(
                'LOAD DETAILS',
                style: GoogleFonts.poppins(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: AppColors.secondaryText,
                  letterSpacing: 0.5,
                ),
              ),
              AppSpacing.verticalSm,
              CustomCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Icon(Icons.inventory_2_outlined, color: AppColors.secondary, size: 20),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Perishables',
                                style: GoogleFonts.poppins(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primaryText,
                                ),
                              ),
                              Text(
                                'Cargo Type',
                                style: GoogleFonts.nunito(
                                  fontSize: 11,
                                  color: AppColors.secondaryText,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              isCompleted ? '22.5 Tons' : '14.2 Tons',
                              style: GoogleFonts.poppins(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primaryText),
                            ),
                            Text(
                              'Weight',
                              style: GoogleFonts.nunito(
                                fontSize: 11,
                                color: AppColors.secondaryText,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    AppSpacing.verticalSm,
                    const Divider(color: AppColors.divider, height: 1),
                    AppSpacing.verticalSm,
                    Row(
                      children: [
                        Icon(Icons.widgets_outlined, color: AppColors.secondary, size: 20),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                isCompleted ? '32 Pallets' : '18 Pallets',
                                style: GoogleFonts.poppins(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primaryText,
                                ),
                              ),
                              Text(
                                'Standard Grade',
                                style: GoogleFonts.nunito(
                                  fontSize: 11,
                                  color: AppColors.secondaryText,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              AppSpacing.verticalLg,

              // Route Progress
              Text(
                'ROUTE PROGRESS',
                style: GoogleFonts.poppins(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: AppColors.secondaryText,
                  letterSpacing: 0.5,
                ),
              ),
              AppSpacing.verticalSm,
              CustomCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _buildRouteNode(
                      title: 'STOP 1: PICKUP',
                      name: 'Warehouse A',
                      address: '422 Logistics Way, Chicago IL',
                      isCompleted: true,
                      isLast: false,
                    ),
                    _buildRouteNode(
                      title: 'STOP 2: DELIVERY',
                      name: 'Logistics Hub',
                      address: isCompleted
                          ? '120 Industrial Hub, Dallas TX'
                          : '110 North Meridian St, Indianapolis IN',
                      isCompleted: isCompleted,
                      isLast: true,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricBox(String label, String value, String subText) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.poppins(
              fontSize: 9,
              color: AppColors.secondaryText,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryText,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            subText,
            style: GoogleFonts.nunito(
              fontSize: 10,
              color: AppColors.secondaryText,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRouteNode({
    required String title,
    required String name,
    required String address,
    required bool isCompleted,
    required bool isLast,
  }) {
    return Stack(
      children: [
        if (!isLast)
          Positioned(
            left: 5,
            top: 14,
            bottom: 0,
            child: Container(
              width: 2,
              color: AppColors.divider,
            ),
          ),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              margin: const EdgeInsets.only(top: 4),
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isCompleted ? AppColors.primaryText : AppColors.divider,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.poppins(
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        color: AppColors.secondary,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      name,
                      style: GoogleFonts.poppins(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryText,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      address,
                      style: GoogleFonts.nunito(
                        fontSize: 12,
                        color: AppColors.secondaryText,
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

class _ExactReferenceMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final streetPaint = Paint()
      ..color = const Color(0xFFCBD5E1)
      ..strokeWidth = 1.8
      ..style = PaintingStyle.stroke;

    final secondaryRoadPaint = Paint()
      ..color = const Color(0xFFE2E8F0)
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke;

    canvas.drawLine(Offset(0, size.height * 0.35), Offset(size.width, size.height * 0.25), secondaryRoadPaint);
    canvas.drawLine(Offset(0, size.height * 0.65), Offset(size.width, size.height * 0.55), streetPaint);
    canvas.drawLine(Offset(size.width * 0.15, 0), Offset(size.width * 0.45, size.height), streetPaint);
    canvas.drawLine(Offset(size.width * 0.6, 0), Offset(size.width * 0.85, size.height), secondaryRoadPaint);

    final routePaint = Paint()
      ..color = const Color(0xFF2563EB)
      ..strokeWidth = 4.2
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final routePath = Path();
    final startPt = Offset(size.width * 0.22, size.height * 0.28);
    final controlPt = Offset(size.width * 0.52, size.height * 0.48);
    final endPt = Offset(size.width * 0.78, size.height * 0.78);

    routePath.moveTo(startPt.dx, startPt.dy);
    routePath.quadraticBezierTo(controlPt.dx, controlPt.dy, endPt.dx, endPt.dy);

    canvas.drawPath(routePath, routePaint);

    final beaconCenter = Offset(size.width * 0.52, size.height * 0.48);
    
    final auraPaint = Paint()
      ..color = const Color(0xFF2563EB).withValues(alpha: 0.25)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(beaconCenter, 13.0, auraPaint);

    final beaconDotPaint = Paint()
      ..color = const Color(0xFF2563EB)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(beaconCenter, 7.5, beaconDotPaint);

    final beaconWhitePaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawCircle(beaconCenter, 3.0, beaconWhitePaint);

    final badgePaint = Paint()
      ..color = const Color(0xFFEAB308)
      ..style = PaintingStyle.fill;
    final badgeBorder = Paint()
      ..color = const Color(0xFF854D0E)
      ..strokeWidth = 1.0
      ..style = PaintingStyle.stroke;

    final badgeRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(size.width * 0.76, size.height * 0.20, 22, 16),
      const Radius.circular(4.0),
    );
    canvas.drawRRect(badgeRect, badgePaint);
    canvas.drawRRect(badgeRect, badgeBorder);

    final textPainter65 = TextPainter(
      text: TextSpan(
        text: '65',
        style: GoogleFonts.poppins(
          fontSize: 9.5,
          fontWeight: FontWeight.w800,
          color: const Color(0xFF1E293B),
        ),
      ),
      textDirection: TextDirection.ltr,
    );
    textPainter65.layout();
    textPainter65.paint(canvas, Offset(size.width * 0.76 + 5, size.height * 0.20 + 1));

    final lbNagarPainter = TextPainter(
      text: TextSpan(
        text: 'LB Nagar',
        style: GoogleFonts.poppins(
          fontSize: 11.5,
          fontWeight: FontWeight.w800,
          color: const Color(0xFF1E293B),
        ),
      ),
      textDirection: TextDirection.ltr,
    );
    lbNagarPainter.layout();
    lbNagarPainter.paint(canvas, Offset(size.width * 0.10, size.height * 0.30));

    final vanasthalipuramPainter = TextPainter(
      text: TextSpan(
        text: 'Vanasthalipuram',
        style: GoogleFonts.poppins(
          fontSize: 11.5,
          fontWeight: FontWeight.w800,
          color: const Color(0xFF1E293B),
        ),
      ),
      textDirection: TextDirection.ltr,
    );
    vanasthalipuramPainter.layout();
    vanasthalipuramPainter.paint(canvas, Offset(size.width * 0.38, size.height * 0.74));
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
