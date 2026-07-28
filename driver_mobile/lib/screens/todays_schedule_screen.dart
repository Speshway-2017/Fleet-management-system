import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_radius.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';

class TodaysScheduleScreen extends StatelessWidget {
  const TodaysScheduleScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        centerTitle: false,
        title: Text(
          "Today's Schedule",
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
              // Header Date Banner
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(color: AppColors.divider),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.calendar_today_outlined,
                      size: 16,
                      color: AppColors.primaryText,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'October 24, 2023',
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryText,
                      ),
                    ),
                  ],
                ),
              ),
              AppSpacing.verticalMd,

              // Track in Progress Card
              CustomCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: AppColors.secondary,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'TRACK IN PROGRESS',
                          style: GoogleFonts.poppins(
                            color: AppColors.secondary,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                    AppSpacing.verticalMd,
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'ETA',
                                style: GoogleFonts.poppins(
                                  fontSize: 10,
                                  color: AppColors.secondaryText,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                '14:45 PM',
                                style: GoogleFonts.poppins(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primaryText,
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
                                'DISTANCE',
                                style: GoogleFonts.poppins(
                                  fontSize: 10,
                                  color: AppColors.secondaryText,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                '12.4 mi',
                                style: GoogleFonts.poppins(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primaryText,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    AppSpacing.verticalMd,

                    // Map Container
                    Container(
                      height: 120,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(AppRadius.md),
                        border: Border.all(color: AppColors.divider),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(AppRadius.md - 1),
                        child: Stack(
                          children: [
                            Positioned.fill(
                              child: Image.asset(
                                'assets/images/map_preview.png',
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) {
                                  return Container(
                                    color: const Color(0xFFEBF0F6),
                                  );
                                },
                              ),
                            ),
                            Positioned.fill(
                              child: CustomPaint(
                                painter: _ExactReferenceMapPainter(),
                              ),
                            ),
                            // Location Banner and Reroute button on top
                            Positioned(
                              left: 12,
                              right: 12,
                              bottom: 12,
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Container(
                                      padding: const EdgeInsets.all(8),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(8),
                                        boxShadow: [
                                          BoxShadow(
                                            color: Colors.black.withValues(alpha: 0.08),
                                            blurRadius: 4,
                                            offset: const Offset(0, 2),
                                          ),
                                        ],
                                      ),
                                      child: Row(
                                        children: [
                                          Icon(
                                            Icons.local_shipping,
                                            color: AppColors.primaryText,
                                            size: 22,
                                          ),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [
                                                Text(
                                                  'Current Location',
                                                  style: GoogleFonts.poppins(
                                                    fontSize: 9,
                                                    color: AppColors.secondaryText,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                                Text(
                                                  'I-90 Express, Chicago, IL',
                                                  overflow: TextOverflow.ellipsis,
                                                  style: GoogleFonts.poppins(
                                                    fontSize: 11,
                                                    fontWeight: FontWeight.bold,
                                                    color: AppColors.primaryText,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  ElevatedButton.icon(
                                    onPressed: () {},
                                    icon: const Icon(Icons.navigation_outlined, size: 16),
                                    label: Text(
                                      'REROUTE',
                                      style: GoogleFonts.poppins(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppColors.secondary,
                                      foregroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                      elevation: 0,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              AppSpacing.verticalMd,

              // Pickup Card
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(color: AppColors.divider),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'PICKUP',
                      style: GoogleFonts.poppins(
                        fontSize: 9,
                        color: AppColors.secondaryText,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Central Logistics Hub',
                      style: GoogleFonts.poppins(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryText,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '4500 Terminal St, Chicago, IL',
                      style: GoogleFonts.nunito(
                        fontSize: 12,
                        color: AppColors.secondaryText,
                      ),
                    ),
                  ],
                ),
              ),
              AppSpacing.verticalSm,

              // Dropoff Card
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(color: AppColors.divider),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'DROPOFF',
                      style: GoogleFonts.poppins(
                        fontSize: 9,
                        color: AppColors.secondaryText,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Retail Center North',
                      style: GoogleFonts.poppins(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryText,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '892 Skyline Dr, Evanston, IL',
                      style: GoogleFonts.nunito(
                        fontSize: 12,
                        color: AppColors.secondaryText,
                      ),
                    ),
                  ],
                ),
              ),
              AppSpacing.verticalMd,

              // Quick Action Card (Dark Navy)
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF0D1C2E),
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                ),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Quick Action',
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Current delivery is 85% complete. You can stage the next route now.',
                      style: GoogleFonts.nunito(
                        fontSize: 13,
                        color: Colors.white70,
                      ),
                    ),
                    AppSpacing.verticalMd,
                    ElevatedButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.play_arrow, size: 20),
                      label: Text(
                        'Start Next Stop',
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.secondary,
                        foregroundColor: Colors.white,
                        minimumSize: const Size(double.infinity, 48),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                      ),
                    ),
                  ],
                ),
              ),
              AppSpacing.verticalLg,

              // Remaining Stops Title
              Text(
                'REMAINING STOPS',
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryText,
                  letterSpacing: 0.5,
                ),
              ),
              AppSpacing.verticalMd,

              // Remaining Stops Card
              CustomCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _buildStopItem(
                      title: 'Stop #4: Warehouse B',
                      subtitle: '1200 Industrial Way, IL',
                      time: '15:30',
                      isActive: true,
                      isLast: false,
                    ),
                    _buildStopItem(
                      title: 'Stop #5: City Outlet',
                      subtitle: '55 Main Square, IL',
                      time: '16:45',
                      isActive: false,
                      isLast: false,
                    ),
                    _buildStopItem(
                      title: 'Stop #6: Logistics Depo',
                      subtitle: 'End of Day Turn-in',
                      time: '18:00',
                      isActive: false,
                      isLast: true,
                    ),
                  ],
                ),
              ),
              AppSpacing.verticalMd,

              // Stats row

              _buildStatMetricCard(
                label: 'AVG. SPEED',
                value: '54 mph',
                tag: 'Optimal',
                icon: Icons.speed_outlined,
              ),
              AppSpacing.verticalSm,

              _buildStatMetricCard(
                label: 'TOTAL DRIVE TIME',
                value: '6h 12m',
                tag: 'On Track',
                icon: Icons.access_time_outlined,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStopItem({
    required String title,
    required String subtitle,
    required String time,
    required bool isActive,
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
                color: isActive ? AppColors.secondary : AppColors.divider,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 20.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            style: GoogleFonts.poppins(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryText,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            subtitle,
                            style: GoogleFonts.nunito(
                              fontSize: 11,
                              color: AppColors.secondaryText,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.divider,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        time,
                        style: GoogleFonts.poppins(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryText,
                        ),
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

  Widget _buildStatMetricCard({
    required String label,
    required String value,
    required String tag,
    required IconData icon,
  }) {
    return CustomCard(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.secondary.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: AppColors.secondary, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: GoogleFonts.poppins(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    color: AppColors.secondaryText,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: GoogleFonts.poppins(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryText,
                  ),
                ),
              ],
            ),
          ),
          Text(
            tag,
            style: GoogleFonts.poppins(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF8B5E3C), // Styled brown accent tag
            ),
          ),
        ],
      ),
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
