import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Driver Module - Vehicle Status Screen
/// 
/// Replicates the reference Vehicle Status UI with exact layout, color palettes,
/// live telemetry cards, vehicle health gauges, and refresh triggers.
class VehicleStatusScreen extends StatefulWidget {
  final Map<String, dynamic>? vehicle;

  const VehicleStatusScreen({
    super.key,
    this.vehicle,
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

  String _formatDate(dynamic dateStr) {
    if (dateStr == null || dateStr.toString().isEmpty) return 'N/A';
    try {
      final dt = DateTime.parse(dateStr.toString());
      final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return '${dt.day} ${months[dt.month - 1]} ${dt.year}';
    } catch (_) {
      return dateStr.toString();
    }
  }

  @override
  Widget build(BuildContext context) {
    const primaryDark = Color(0xFF101C2C);
    const bgLight = Color(0xFFF7F8FA);
    const borderGray = Color(0xFFE5E7EB);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const successGreen = Color(0xFF16A34A);
    const accentOrange = Color(0xFFF97316);

    if (widget.vehicle == null) {
      return Scaffold(
        backgroundColor: bgLight,
        appBar: AppBar(
          backgroundColor: primaryDark,
          elevation: 0,
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
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.bar_chart_outlined, size: 64, color: textSecondary),
                const SizedBox(height: 16),
                Text(
                  'No Vehicle Assigned',
                  style: GoogleFonts.poppins(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'No vehicle has been assigned yet. Vehicle-related features will become available once your manager assigns a vehicle.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.nunito(fontSize: 14, color: textSecondary),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final veh = widget.vehicle!;
    final vehicleNumber = veh['vehicleNumber'] ?? veh['registrationNumber'] ?? 'N/A';
    final vehicleType = veh['vehicleType'] ?? 'Truck';
    final driverName = veh['assignedDriverName'] ?? 'Driver';
    final odometer = veh['odometer'] != null ? '${veh['odometer']} km' : '0 km';
    final currentStatus = veh['currentStatus'] ?? 'Assigned';
    final currentLocation = veh['currentLocation'] ?? veh['branchDepot'] ?? 'N/A';
    final fuelCapacity = veh['fuelCapacity'] != null ? '${veh['fuelCapacity']} L' : 'N/A';
    final fastagBalance = veh['fastagBalance'] != null ? '₹${veh['fastagBalance']}' : '₹0';
    final lastServiceDateStr = _formatDate(veh['lastServiceDate'] ?? veh['lastService']);
    final nextServiceDueStr = _formatDate(veh['nextServiceDue'] ?? veh['nextService']);

    return Scaffold(
      backgroundColor: bgLight,
      appBar: AppBar(
        backgroundColor: primaryDark,
        elevation: 0,
        centerTitle: false,
        titleSpacing: 0,
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
          IconButton(
            icon: Icon(
              Icons.refresh_rounded,
              color: Colors.white,
              size: _isRefreshing ? 20 : 24,
            ),
            onPressed: _handleRefresh,
            tooltip: 'Refresh Telemetry',
          ),
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
                            vehicleNumber,
                            style: GoogleFonts.poppins(
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                              color: textPrimary,
                            ),
                          ),
                          Text(
                            vehicleType,
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
                                driverName,
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
                          Text(
                            odometer,
                            style: GoogleFonts.poppins(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              color: textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Right Vehicle Image Preview & Status Pill
                    Expanded(
                      flex: 5,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFDCFCE7),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: const Color(0xFF86EFAC)),
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
                                const SizedBox(width: 4),
                                Text(
                                  currentStatus,
                                  style: GoogleFonts.poppins(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: successGreen,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 10),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.asset(
                              'assets/images/vehicle.png',
                              height: 72,
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) {
                                return const Icon(
                                  Icons.local_shipping_rounded,
                                  size: 60,
                                  color: primaryDark,
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

              // CARD 2: Real-time Live Tracking Card
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
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildSectionHeader(Icons.my_location_rounded, 'Real-time Live Location'),
                        Text(
                          'Updated Live',
                          style: GoogleFonts.nunito(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: textSecondary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12.0),

                    // Map Container Placeholder
                    Container(
                      height: 130,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          Icon(
                            Icons.map_rounded,
                            size: 80,
                            color: Colors.white.withValues(alpha: 0.15),
                          ),
                          Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(
                                Icons.navigation_rounded,
                                color: accentOrange,
                                size: 32,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                currentLocation,
                                style: GoogleFonts.poppins(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 14.0),

                    // Live Details Grid
                    Row(
                      children: [
                        Expanded(
                          child: _buildLiveDetailItem(
                            icon: Icons.location_on_outlined,
                            iconColor: accentOrange,
                            label: 'Current Location',
                            value: currentLocation,
                          ),
                        ),
                        Expanded(
                          child: _buildLiveDetailItem(
                            icon: Icons.speed_rounded,
                            iconColor: primaryDark,
                            label: 'Status / Speed',
                            value: currentStatus,
                            subValue: 'GPS Connected',
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16.0),

              // CARD 3: Vehicle Health & Telemetry Gauges
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
                    _buildSectionHeader(Icons.speed_outlined, 'Telemetry & Metrics'),
                    const SizedBox(height: 14.0),
                    Row(
                      children: [
                        Expanded(
                          child: _buildLiveDetailItem(
                            icon: Icons.local_gas_station_outlined,
                            iconColor: accentOrange,
                            label: 'Fuel Tank Capacity',
                            value: fuelCapacity,
                            subValue: 'Diesel',
                          ),
                        ),
                        Expanded(
                          child: _buildLiveDetailItem(
                            icon: Icons.toll_outlined,
                            iconColor: successGreen,
                            label: 'FASTag Balance',
                            value: fastagBalance,
                            subValue: 'Active Account',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12.0),
                    const Divider(color: borderGray, height: 1.0),
                    const SizedBox(height: 12.0),
                    Row(
                      children: [
                        Expanded(
                          child: _buildLiveDetailItem(
                            icon: Icons.history_rounded,
                            iconColor: primaryDark,
                            label: 'Last Service Date',
                            value: lastServiceDateStr,
                          ),
                        ),
                        Expanded(
                          child: _buildLiveDetailItem(
                            icon: Icons.event_available_outlined,
                            iconColor: primaryDark,
                            label: 'Next Service Due',
                            value: nextServiceDueStr,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24.0),
            ],
          ),
        ),
      ),
    );
  }
}
