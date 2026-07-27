import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Data model for Vehicle Status Screen backend integration.
class VehicleStatusData {
  final String vehicleNumber;
  final String vehicleType;
  final String driverName;
  final String odometer;
  final String tripStatus;
  final String currentLocation;
  final String currentSubLocation;
  final String speed;
  final String destination;
  final String lastUpdated;
  final String distanceTravelledToday;
  final String fuelLevelPercentage;
  final String engineStatus;
  final String lastServiceDate;
  final String lastServiceOdometer;
  final String nextServiceOdometer;
  final String nextServiceDate;

  const VehicleStatusData({
    this.vehicleNumber = 'TS09AB4589',
    this.vehicleType = 'Container Truck',
    this.driverName = 'Sai Kumar',
    this.odometer = '24,500 km',
    this.tripStatus = 'On Trip',
    this.currentLocation = 'LB Nagar, Hyderabad',
    this.currentSubLocation = 'Telangana, India',
    this.speed = '65 km/h',
    this.destination = 'Vijayawada Warehouse',
    this.lastUpdated = '2 mins ago',
    this.distanceTravelledToday = '120 km',
    this.fuelLevelPercentage = '75%',
    this.engineStatus = 'Running',
    this.lastServiceDate = '15 Jul 2026',
    this.lastServiceOdometer = 'at 22,300 km',
    this.nextServiceOdometer = '25,000 km',
    this.nextServiceDate = 'or 25 Aug 2026',
  });
}

/// Driver Module - Vehicle Status Screen
/// 
/// Replicates the reference Vehicle Status UI with exact layout, color palettes,
/// live map tracking, vehicle health gauges, trip timeline, and refresh triggers.
class VehicleStatusScreen extends StatefulWidget {
  final VehicleStatusData data;

  const VehicleStatusScreen({
    super.key,
    this.data = const VehicleStatusData(),
  });

  @override
  State<VehicleStatusScreen> createState() => _VehicleStatusScreenState();
}

class _VehicleStatusScreenState extends State<VehicleStatusScreen> {
  bool _isRefreshing = false;

  void _handleRefresh() {
    setState(() {
      _isRefreshing = true;
    });
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Updating live vehicle telemetry...'),
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10.0),
        ),
      ),
    );
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        setState(() {
          _isRefreshing = false;
        });
      }
    });
  }

  Widget _buildSectionHeader(IconData icon, String title) {
    const textPrimary = Color(0xFF1F2937);

    return Row(
      children: [
        Icon(icon, color: textPrimary, size: 20),
        const SizedBox(width: 8.0),
        Text(
          title,
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildLiveDetailItem({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
    String? subValue,
  }) {
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: iconColor),
        const SizedBox(width: 8.0),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: GoogleFonts.nunito(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: textSecondary,
                ),
              ),
              const SizedBox(height: 1),
              Text(
                value,
                style: GoogleFonts.poppins(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: textPrimary,
                ),
              ),
              if (subValue != null)
                Text(
                  subValue,
                  style: GoogleFonts.nunito(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: textSecondary,
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildHealthCard({
    required IconData icon,
    required String title,
    required String value,
    Widget? extraWidget,
  }) {
    const borderGray = Color(0xFFE5E7EB);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const successGreen = Color(0xFF16A34A);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10.0, vertical: 12.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: borderGray, width: 1.0),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, color: successGreen, size: 22),
          const SizedBox(height: 6.0),
          Text(
            title,
            textAlign: TextAlign.center,
            style: GoogleFonts.nunito(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: textSecondary,
            ),
          ),
          const SizedBox(height: 4.0),
          Text(
            value,
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: textPrimary,
            ),
          ),
          if (extraWidget != null) ...[
            const SizedBox(height: 4.0),
            extraWidget,
          ],
        ],
      ),
    );
  }

  Widget _buildTimelineStep({
    required String title,
    required String timeText,
    required bool isCompleted,
    required bool isCurrent,
    required bool isLast,
  }) {
    const successGreen = Color(0xFF16A34A);
    const primaryOrange = Color(0xFFF97316);
    const borderGray = Color(0xFFD1D5DB);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF9CA3AF);

    Color circleColor;
    Widget indicatorWidget;

    if (isCompleted) {
      circleColor = successGreen;
      indicatorWidget = const Icon(Icons.check, size: 12, color: Colors.white);
    } else if (isCurrent) {
      circleColor = primaryOrange;
      indicatorWidget = Container(
        width: 8,
        height: 8,
        decoration: const BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
        ),
      );
    } else {
      circleColor = borderGray;
      indicatorWidget = const SizedBox.shrink();
    }

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Left Timeline Circle & Line
          Column(
            children: [
              Container(
                width: 20,
                height: 20,
                decoration: BoxDecoration(
                  color: circleColor,
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: indicatorWidget,
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    color: isCompleted ? successGreen : borderGray,
                  ),
                ),
            ],
          ),
          const SizedBox(width: 12.0),

          // Right Step Details
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      fontWeight: isCurrent || isCompleted
                          ? FontWeight.w700
                          : FontWeight.w500,
                      color: isCurrent
                          ? primaryOrange
                          : (isCompleted ? textPrimary : textSecondary),
                    ),
                  ),
                  const SizedBox(height: 2.0),
                  Text(
                    timeText,
                    style: GoogleFonts.nunito(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isCurrent ? primaryOrange.withValues(alpha: 0.9) : textSecondary,
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

  @override
  Widget build(BuildContext context) {
    const primaryDark = Color(0xFF101C2C);
    const bgLight = Color(0xFFF7F8FA);
    const borderGray = Color(0xFFE5E7EB);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const successGreen = Color(0xFF16A34A);
    const primaryOrange = Color(0xFFF97316);

    return Scaffold(
      backgroundColor: bgLight,
      appBar: AppBar(
        backgroundColor: primaryDark,
        elevation: 0,
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'Vehicle Status',
          style: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8.0),
              ),
              padding: const EdgeInsets.all(4.0),
              child: Image.asset(
                'assets/images/logo.png',
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) {
                  return const Icon(
                    Icons.local_shipping_rounded,
                    color: primaryDark,
                    size: 20,
                  );
                },
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // CARD 1: Header Vehicle Overview Card
              Container(
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16.0),
                  border: Border.all(color: borderGray, width: 1.0),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Left Vehicle Info
                    Expanded(
                      flex: 6,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.data.vehicleNumber,
                            style: GoogleFonts.poppins(
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                              color: textPrimary,
                            ),
                          ),
                          Text(
                            widget.data.vehicleType,
                            style: GoogleFonts.nunito(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: textSecondary,
                            ),
                          ),
                          const SizedBox(height: 10.0),
                          Row(
                            children: [
                              const Icon(
                                Icons.person_outline_rounded,
                                size: 16,
                                color: textSecondary,
                              ),
                              const SizedBox(width: 4.0),
                              Text(
                                'Driver: ',
                                style: GoogleFonts.nunito(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: textSecondary,
                                ),
                              ),
                              Text(
                                widget.data.driverName,
                                style: GoogleFonts.poppins(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: textPrimary,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12.0),
                          Text(
                            'ODOMETER',
                            style: GoogleFonts.poppins(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: textSecondary,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: 2.0),
                          Text(
                            widget.data.odometer,
                            style: GoogleFonts.poppins(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: primaryDark,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Right Status Badge & Commercial Truck Asset Image
                    Expanded(
                      flex: 5,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFDCFCE7),
                              borderRadius: BorderRadius.circular(12.0),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 6,
                                  height: 6,
                                  decoration: const BoxDecoration(
                                    color: successGreen,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  widget.data.tripStatus,
                                  style: GoogleFonts.poppins(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: successGreen,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 8.0),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8.0),
                            child: Image.asset(
                              'assets/images/vehicle.png',
                              height: 90,
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) {
                                return Container(
                                  height: 85,
                                  width: double.infinity,
                                  decoration: BoxDecoration(
                                    color: bgLight,
                                    borderRadius: BorderRadius.circular(8.0),
                                  ),
                                  child: const Icon(
                                    Icons.local_shipping_rounded,
                                    size: 48,
                                    color: primaryDark,
                                  ),
                                );
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16.0),

              // CARD 2: Live Tracking Card with Left Map Preview & Right Telemetry List
              Container(
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16.0),
                  border: Border.all(color: borderGray, width: 1.0),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSectionHeader(Icons.location_on_outlined, 'Live Tracking'),
                    const SizedBox(height: 14.0),

                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Left: Map Visual Preview Container (Exact Match to Reference Screen)
                        Expanded(
                          flex: 5,
                          child: Container(
                            height: 180,
                            decoration: BoxDecoration(
                              color: const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(12.0),
                              border: Border.all(color: borderGray, width: 1.0),
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(11.0),
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
                                  // Exact Reference Map Painter overlay (streets, route line, location labels & Highway 65 badge)
                                  Positioned.fill(
                                    child: CustomPaint(
                                      painter: _ExactReferenceMapPainter(),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(width: 14.0),

                        // Right: Live Tracking Details List
                        Expanded(
                          flex: 6,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildLiveDetailItem(
                                icon: Icons.location_on,
                                iconColor: const Color(0xFF2563EB),
                                label: 'Current Location',
                                value: widget.data.currentLocation,
                                subValue: widget.data.currentSubLocation,
                              ),
                              const Padding(
                                padding: EdgeInsets.symmetric(vertical: 8.0),
                                child: Divider(color: borderGray, height: 1.0),
                              ),
                              _buildLiveDetailItem(
                                icon: Icons.speed_rounded,
                                iconColor: primaryOrange,
                                label: 'Speed',
                                value: widget.data.speed,
                              ),
                              const Padding(
                                padding: EdgeInsets.symmetric(vertical: 8.0),
                                child: Divider(color: borderGray, height: 1.0),
                              ),
                              _buildLiveDetailItem(
                                icon: Icons.flag_rounded,
                                iconColor: successGreen,
                                label: 'Destination',
                                value: widget.data.destination,
                              ),
                              const Padding(
                                padding: EdgeInsets.symmetric(vertical: 8.0),
                                child: Divider(color: borderGray, height: 1.0),
                              ),
                              _buildLiveDetailItem(
                                icon: Icons.access_time_rounded,
                                iconColor: const Color(0xFF2563EB),
                                label: 'Last Updated',
                                value: widget.data.lastUpdated,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16.0),

              // CARD 3: Speed & Distance Stats Row (2 Equal Columns)
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(14.0),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14.0),
                        border: Border.all(color: borderGray, width: 1.0),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.02),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(
                                Icons.speed_rounded,
                                color: primaryOrange,
                                size: 18,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'Speed',
                                style: GoogleFonts.nunito(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: textSecondary,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8.0),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.baseline,
                            textBaseline: TextBaseline.alphabetic,
                            children: [
                              Text(
                                widget.data.speed.split(' ')[0],
                                style: GoogleFonts.poppins(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w800,
                                  color: textPrimary,
                                ),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                'km/h',
                                style: GoogleFonts.nunito(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12.0),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(14.0),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14.0),
                        border: Border.all(color: borderGray, width: 1.0),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.02),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(
                                Icons.near_me_outlined,
                                color: primaryOrange,
                                size: 18,
                              ),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  'Distance Travelled',
                                  style: GoogleFonts.nunito(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: textSecondary,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8.0),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.baseline,
                            textBaseline: TextBaseline.alphabetic,
                            children: [
                              Text(
                                widget.data.distanceTravelledToday.split(' ')[0],
                                style: GoogleFonts.poppins(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w800,
                                  color: textPrimary,
                                ),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                'km',
                                style: GoogleFonts.nunito(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: textSecondary,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'Today',
                                style: GoogleFonts.nunito(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16.0),

              // CARD 4: Vehicle Health Card (4 Columns)
              Container(
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16.0),
                  border: Border.all(color: borderGray, width: 1.0),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSectionHeader(Icons.monitor_heart_outlined, 'Vehicle Health'),
                    const SizedBox(height: 14.0),

                    Row(
                      children: [
                        // 1. Engine Status
                        Expanded(
                          child: _buildHealthCard(
                            icon: Icons.engineering_rounded,
                            title: 'Engine Status',
                            value: widget.data.engineStatus,
                            extraWidget: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Container(
                                  width: 6,
                                  height: 6,
                                  decoration: const BoxDecoration(
                                    color: successGreen,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  'Normal',
                                  style: GoogleFonts.nunito(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600,
                                    color: textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 8.0),

                        // 3. Last Service
                        Expanded(
                          child: _buildHealthCard(
                            icon: Icons.build_rounded,
                            title: 'Last Service',
                            value: widget.data.lastServiceDate,
                            extraWidget: Text(
                              widget.data.lastServiceOdometer,
                              textAlign: TextAlign.center,
                              style: GoogleFonts.nunito(
                                fontSize: 9.5,
                                fontWeight: FontWeight.w600,
                                color: textSecondary,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8.0),

                        // 4. Next Service
                        Expanded(
                          child: _buildHealthCard(
                            icon: Icons.calendar_month_rounded,
                            title: 'Next Service',
                            value: widget.data.nextServiceOdometer,
                            extraWidget: Text(
                              widget.data.nextServiceDate,
                              textAlign: TextAlign.center,
                              style: GoogleFonts.nunito(
                                fontSize: 9.5,
                                fontWeight: FontWeight.w600,
                                color: textSecondary,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16.0),

              // CARD 5: Trip Timeline Card
              Container(
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16.0),
                  border: Border.all(color: borderGray, width: 1.0),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSectionHeader(Icons.access_time_rounded, 'Trip Timeline'),
                    const SizedBox(height: 16.0),

                    _buildTimelineStep(
                      title: 'Trip Assigned',
                      timeText: '08:00 AM • Today',
                      isCompleted: true,
                      isCurrent: false,
                      isLast: false,
                    ),
                    _buildTimelineStep(
                      title: 'Driver Accepted',
                      timeText: '08:15 AM • Today',
                      isCompleted: true,
                      isCurrent: false,
                      isLast: false,
                    ),
                    _buildTimelineStep(
                      title: 'Trip Started',
                      timeText: '09:15 AM • Today',
                      isCompleted: true,
                      isCurrent: false,
                      isLast: false,
                    ),
                    _buildTimelineStep(
                      title: 'Current Location',
                      timeText: '10:45 AM • Moving North on NH 65',
                      isCompleted: false,
                      isCurrent: true,
                      isLast: false,
                    ),
                    _buildTimelineStep(
                      title: 'Expected Arrival',
                      timeText: '06:30 PM • Today',
                      isCompleted: false,
                      isCurrent: false,
                      isLast: true,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20.0),

              // Bottom Refresh Live Status Button & Auto-refresh Subtext
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton.icon(
                  onPressed: _isRefreshing ? null : _handleRefresh,
                  icon: _isRefreshing
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Icon(
                          Icons.refresh_rounded,
                          color: Colors.white,
                          size: 20,
                        ),
                  label: Text(
                    'Refresh Live Status',
                    style: GoogleFonts.poppins(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryDark,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12.0),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8.0),
              Center(
                child: Text(
                  'Auto refresh in 30 sec',
                  style: GoogleFonts.nunito(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: textSecondary,
                  ),
                ),
              ),
              const SizedBox(height: 16.0),
            ],
          ),
        ),
      ),
    );
  }
}

/// Custom painter to render exact reference map graphics (streets, blue route line, highway 65 badge, labels & beacon)
class _ExactReferenceMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // 1. Street Grid Lines (Secondary Streets)
    final streetPaint = Paint()
      ..color = const Color(0xFFCBD5E1)
      ..strokeWidth = 1.8
      ..style = PaintingStyle.stroke;

    final secondaryRoadPaint = Paint()
      ..color = const Color(0xFFE2E8F0)
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke;

    // Horizontal & diagonal street grid lines
    canvas.drawLine(Offset(0, size.height * 0.35), Offset(size.width, size.height * 0.25), secondaryRoadPaint);
    canvas.drawLine(Offset(0, size.height * 0.65), Offset(size.width, size.height * 0.55), streetPaint);
    canvas.drawLine(Offset(size.width * 0.15, 0), Offset(size.width * 0.45, size.height), streetPaint);
    canvas.drawLine(Offset(size.width * 0.6, 0), Offset(size.width * 0.85, size.height), secondaryRoadPaint);

    // 2. Main Blue Route Path
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

    // 3. Live Location Beacon Marker (Middle of Blue Route)
    final beaconCenter = Offset(size.width * 0.52, size.height * 0.48);
    
    // Outer Translucent Aura Ring
    final auraPaint = Paint()
      ..color = const Color(0xFF2563EB).withValues(alpha: 0.25)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(beaconCenter, 13.0, auraPaint);

    // Inner Solid Blue Dot
    final beaconDotPaint = Paint()
      ..color = const Color(0xFF2563EB)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(beaconCenter, 7.5, beaconDotPaint);

    // Center White Dot
    final beaconWhitePaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawCircle(beaconCenter, 3.0, beaconWhitePaint);

    // 4. Yellow Highway "65" Badge
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

    // Highway "65" text
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

    // 5. Text Label "LB Nagar" (Top Left)
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

    // 6. Text Label "Vanasthalipuram" (Bottom Center/Right)
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
