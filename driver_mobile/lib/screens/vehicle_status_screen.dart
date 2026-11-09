import '../services/api_service.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/localization_service.dart';
import '../utils/navigation_helper.dart';

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
  static Map<String, dynamic>? _cachedVehicle;
  Map<String, dynamic>? _vehicle;

  @override
  void initState() {
    super.initState();
    _vehicle = widget.vehicle ?? _cachedVehicle;
  }

  Future<void> _refreshVehicle() async {
    try {
      final res = await ApiService.getAssignedVehicle();
      if (mounted && res['success'] == true && res['data'] != null && res['data']['vehicle'] != null) {
        final vehMap = Map<String, dynamic>.from(res['data']['vehicle']);
        _cachedVehicle = vehMap;
        setState(() {
          _vehicle = vehMap;
        });
      }
    } catch (_) {}
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

    final Widget page;
    final currentVehicle = _vehicle ?? widget.vehicle;
    if (currentVehicle == null) {
      page = Scaffold(
        backgroundColor: bgLight,
        appBar: AppBar(
          backgroundColor: primaryDark,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
            onPressed: () => SafeNavigation.pop(context, fallbackTab: 0),
          ),
          title: Text(
            'Vehicle Status'.tr,
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
                  'No Vehicle Assigned'.tr,
                  style: GoogleFonts.poppins(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'No vehicle has been assigned yet. Vehicle-related features will become available once your manager assigns a vehicle.'.tr,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.nunito(fontSize: 14, color: textSecondary),
                ),
              ],
            ),
          ),
        ),
      );
    } else {
      final veh = currentVehicle;
      final vehicleNumber = veh['vehicleNumber'] ?? veh['registrationNumber'] ?? 'N/A';
      final vehicleType = veh['vehicleType'] ?? 'Truck';
      final driverName = veh['assignedDriverName'] ?? 'Driver';
      final odometer = veh['odometer'] != null ? '${veh['odometer']} km' : '0 km';
      final currentStatus = veh['currentStatus'] ?? 'Assigned';
      final currentLocation = veh['currentLocation'] ?? veh['branchDepot'] ?? 'N/A';
      final fastagBalance = veh['fastagBalance'] != null ? '₹${veh['fastagBalance']}' : '₹0';
      final lastServiceDateStr = _formatDate(veh['lastServiceDate'] ?? veh['lastService']);
      final nextServiceDueStr = _formatDate(veh['nextServiceDue'] ?? veh['nextService']);

      page = Scaffold(
        backgroundColor: bgLight,
        appBar: AppBar(
          backgroundColor: primaryDark,
          elevation: 0,
          centerTitle: false,
          titleSpacing: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
            onPressed: () => SafeNavigation.pop(context, fallbackTab: 0),
          ),
        title: Text(
          'Vehicle Status'.tr,
          style: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        actions: const [],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          color: accentOrange,
          backgroundColor: Colors.white,
          onRefresh: () async {
            _cachedVehicle = null;
            ApiService.clearApiCache('/driver/vehicle');
            await Future.any([
              _refreshVehicle(),
              Future.delayed(const Duration(milliseconds: 500)),
            ]);
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
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
                                'Driver: '.tr,
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
                            'ODOMETER'.tr,
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
                                  currentStatus.toString().tr,
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
                        _buildSectionHeader(Icons.my_location_rounded, 'Real-time Live Location'.tr),
                        Text(
                          'Updated Live'.tr,
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
                            label: 'Current Location'.tr,
                            value: currentLocation,
                          ),
                        ),
                        Expanded(
                          child: _buildLiveDetailItem(
                            icon: Icons.speed_rounded,
                            iconColor: primaryDark,
                            label: 'Status / Speed'.tr,
                            value: currentStatus.toString().tr,
                            subValue: 'GPS Connected'.tr,
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
                    _buildSectionHeader(Icons.speed_outlined, 'Telemetry & Metrics'.tr),
                    const SizedBox(height: 14.0),
                    Row(
                      children: [
                        Expanded(
                          child: _buildLiveDetailItem(
                            icon: Icons.gps_fixed_rounded,
                            iconColor: primaryDark,
                            label: 'GPS Tracking System'.tr,
                            value: 'Connected'.tr,
                            subValue: 'Live Telemetry'.tr,
                          ),
                        ),
                        Expanded(
                          child: _buildLiveDetailItem(
                            icon: Icons.toll_outlined,
                            iconColor: successGreen,
                            label: 'FASTag Balance'.tr,
                            value: fastagBalance,
                            subValue: 'Active Account'.tr,
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
                            label: 'Last Service Date'.tr,
                            value: lastServiceDateStr,
                          ),
                        ),
                        Expanded(
                          child: _buildLiveDetailItem(
                            icon: Icons.event_available_outlined,
                            iconColor: primaryDark,
                            label: 'Next Service Due'.tr,
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
      ),
    );
    }

    return ValueListenableBuilder<String>(
      valueListenable: LocalizationService.currentLanguageNotifier,
      builder: (context, currentLang, _) {
        return PopScope(
          canPop: false,
          onPopInvokedWithResult: (didPop, result) {
            if (!didPop) SafeNavigation.pop(context, fallbackTab: 0);
          },
          child: page,
        );
      },
    );
  }
}
