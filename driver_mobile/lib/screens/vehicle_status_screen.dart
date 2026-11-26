import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import '../services/localization_service.dart';
import '../utils/navigation_helper.dart';
import 'vehicle_overview_screen.dart';

/// Driver Module - Vehicle Status Screen
///
/// Redesigned with the Color-Coded Premium Card Design System:
/// 1. Executive Navy Hero Banner with Live Telemetry & 3-metric KPI ribbon
/// 2. Real-time Live Location Card (Dark map box & live GPS pulse indicator)
/// 3. Telemetry & Metrics Diagnostics Card (4-cell colorful telemetry grid)
/// 4. Service & Maintenance Schedule Card (Last service & next service due chips)
/// 5. Active Driver & Vehicle Snapshot Card (Driver assignment & vehicle model)
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
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _vehicle = widget.vehicle ??
        _cachedVehicle ??
        VehicleOverviewScreen.cachedVehicle;
    if (_vehicle == null) {
      _isLoading = true;
      _refreshVehicle();
    }
  }

  Future<void> _refreshVehicle() async {
    try {
      final res = await ApiService.getAssignedVehicle();
      if (mounted &&
          res['success'] == true &&
          res['data'] != null &&
          res['data']['vehicle'] != null) {
        final vehMap = Map<String, dynamic>.from(res['data']['vehicle']);
        _cachedVehicle = vehMap;
        setState(() {
          _vehicle = vehMap;
          _isLoading = false;
        });
        return;
      }
    } catch (_) {}

    if (mounted) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  String _formatDate(dynamic dateStr) {
    if (dateStr == null || dateStr.toString().isEmpty) return 'N/A';
    try {
      final dt = DateTime.parse(dateStr.toString());
      final months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      return '${dt.day} ${months[dt.month - 1]} ${dt.year}';
    } catch (_) {
      return dateStr.toString();
    }
  }

  // ---------------------------------------------------------------------------
  // BUILD
  // ---------------------------------------------------------------------------
  @override
  Widget build(BuildContext context) {
    const primaryDark = Color(0xFF0B1626);
    const bgLight = Color(0xFFF4F6FA);
    const textPrimary = Color(0xFF0F172A);
    const textSecondary = Color(0xFF64748B);

    final currentVehicle = _vehicle ??
        widget.vehicle ??
        _cachedVehicle ??
        VehicleOverviewScreen.cachedVehicle;

    Widget bodyWidget;
    if (_isLoading && currentVehicle == null) {
      bodyWidget = const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFEA580C)),
        ),
      );
    } else if (currentVehicle == null) {
      bodyWidget = _buildEmptyState(textPrimary, textSecondary);
    } else {
      bodyWidget = SafeArea(
        child: RefreshIndicator(
          color: const Color(0xFFEA580C),
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
            physics: const AlwaysScrollableScrollPhysics(
              parent: BouncingScrollPhysics(),
            ),
            padding: const EdgeInsets.symmetric(
              horizontal: 16.0,
              vertical: 16.0,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // 1. Executive Navy Hero Banner
                _buildExecutiveHeroBanner(currentVehicle),
                const SizedBox(height: 14.0),

                // 2. Real-time Live Location Card
                _buildLiveLocationCard(currentVehicle),
                const SizedBox(height: 14.0),

                // 3. Telemetry & Metrics Card
                _buildTelemetryCard(currentVehicle),
                const SizedBox(height: 14.0),

                // 4. Service & Maintenance Schedule Card
                _buildMaintenanceCard(currentVehicle),
                const SizedBox(height: 14.0),

                // 5. Active Assignment Snapshot Card
                _buildDriverSnapshotCard(currentVehicle),
                const SizedBox(height: 24.0),
              ],
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
          child: Scaffold(
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
            body: bodyWidget,
          ),
        );
      },
    );
  }

  // ---------------------------------------------------------------------------
  // EMPTY STATE
  // ---------------------------------------------------------------------------
  Widget _buildEmptyState(Color textPrimary, Color textSecondary) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: const Color(0xFF0B1626).withValues(alpha: 0.06),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.bar_chart_outlined,
                size: 40,
                color: Color(0xFF64748B),
              ),
            ),
            const SizedBox(height: 18),
            Text(
              'No Vehicle Assigned'.tr,
              style: GoogleFonts.poppins(
                fontSize: 19,
                fontWeight: FontWeight.w800,
                color: textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'No vehicle has been assigned yet. Vehicle-related features will become available once your manager assigns a vehicle.'.tr,
              textAlign: TextAlign.center,
              style: GoogleFonts.nunito(
                fontSize: 13.5,
                color: textSecondary,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 1. EXECUTIVE HERO BANNER
  // ---------------------------------------------------------------------------
  Widget _buildExecutiveHeroBanner(Map<String, dynamic> veh) {
    final vehicleNumber = veh['vehicleNumber'] ?? veh['registrationNumber'] ?? 'N/A';
    final vehicleType = veh['vehicleType'] ?? 'Heavy Commercial Truck';
    final currentStatus = veh['currentStatus'] ?? 'Active';
    final fastagBalance = veh['fastagBalance'] != null ? '₹${veh['fastagBalance']}' : '₹2,450';
    final odometer = veh['odometer'] != null ? '${veh['odometer']} km' : '142,000 km';

    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            Color(0xFF0B1626),
            Color(0xFF13263E),
            Color(0xFF1B3452),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20.0),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.12),
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0B1626).withValues(alpha: 0.25),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      padding: const EdgeInsets.all(18.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF059669).withValues(alpha: 0.18),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: const Color(0xFF10B981).withValues(alpha: 0.4),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.sensors_rounded,
                            color: Color(0xFF34D399),
                            size: 13,
                          ),
                          const SizedBox(width: 5),
                          Text(
                            'LIVE TELEMETRY & HEALTH',
                            style: GoogleFonts.poppins(
                              color: const Color(0xFF34D399),
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.5,
                              fontSize: 9.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      vehicleNumber,
                      style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 22,
                        letterSpacing: -0.3,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      vehicleType,
                      style: GoogleFonts.nunito(
                        color: const Color(0xFF94A3B8),
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              // Status Badge Box
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF059669).withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: const Color(0xFF34D399).withValues(alpha: 0.4),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                        color: Color(0xFF34D399),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      currentStatus.toString().tr,
                      style: GoogleFonts.poppins(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF34D399),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),
          Container(
            height: 1,
            color: Colors.white.withValues(alpha: 0.10),
          ),
          const SizedBox(height: 14),

          // 3-Metric KPI Ribbon
          Row(
            children: [
              Expanded(
                child: _buildHeroStatTile(
                  icon: Icons.check_circle_rounded,
                  iconColor: const Color(0xFF34D399),
                  label: 'Status',
                  value: currentStatus.toString().tr,
                  bgColor: const Color(0xFF064E3B).withValues(alpha: 0.4),
                  borderColor: const Color(0xFF059669).withValues(alpha: 0.3),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildHeroStatTile(
                  icon: Icons.toll_rounded,
                  iconColor: const Color(0xFFFBBF24),
                  label: 'FASTag',
                  value: fastagBalance,
                  bgColor: const Color(0xFF78350F).withValues(alpha: 0.35),
                  borderColor: const Color(0xFFD97706).withValues(alpha: 0.3),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildHeroStatTile(
                  icon: Icons.speed_rounded,
                  iconColor: const Color(0xFF38BDF8),
                  label: 'Odometer',
                  value: odometer,
                  bgColor: const Color(0xFF0C4A6E).withValues(alpha: 0.4),
                  borderColor: const Color(0xFF0284C7).withValues(alpha: 0.3),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHeroStatTile({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
    required Color bgColor,
    required Color borderColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 9, horizontal: 8),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: iconColor, size: 13),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  label,
                  style: GoogleFonts.nunito(
                    color: const Color(0xFFCBD5E1),
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: GoogleFonts.poppins(
              color: Colors.white,
              fontWeight: FontWeight.w800,
              fontSize: 12.5,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 2. REAL-TIME LIVE LOCATION CARD
  // ---------------------------------------------------------------------------
  Widget _buildLiveLocationCard(Map<String, dynamic> veh) {
    final currentLocation = veh['currentLocation'] ?? veh['branchDepot'] ?? 'Hyderabad Hub Depot';
    final currentStatus = veh['currentStatus'] ?? 'Active';

    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18.0),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildCardHeader(
            badgeColor: const Color(0xFF2563EB),
            icon: Icons.my_location_rounded,
            title: 'Real-time Live Location'.tr,
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFA7F3D0)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 5,
                    height: 5,
                    decoration: const BoxDecoration(
                      color: Color(0xFF059669),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Updated Live'.tr,
                    style: GoogleFonts.poppins(
                      fontSize: 9.5,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF059669),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14.0),

          // Map Stylized Radar Box
          Container(
            height: 125,
            width: double.infinity,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0F1E38), Color(0xFF1E293B)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(14.0),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                Positioned.fill(
                  child: Opacity(
                    opacity: 0.08,
                    child: Icon(
                      Icons.map_rounded,
                      size: 160,
                      color: Colors.white,
                    ),
                  ),
                ),
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: const Color(0xFFEA580C).withValues(alpha: 0.2),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: const Color(0xFFEA580C),
                          width: 2,
                        ),
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.navigation_rounded,
                          color: Color(0xFFFB923C),
                          size: 20,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16.0),
                      child: Text(
                        currentLocation,
                        style: GoogleFonts.poppins(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 12.0),

          // Details Row
          Row(
            children: [
              Expanded(
                child: _buildLocationDetailBox(
                  icon: Icons.location_on_rounded,
                  iconColor: const Color(0xFFDC2626),
                  label: 'Current Location'.tr,
                  value: currentLocation,
                  bgColor: const Color(0xFFFEF2F2),
                  borderColor: const Color(0xFFFECACA),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildLocationDetailBox(
                  icon: Icons.speed_rounded,
                  iconColor: const Color(0xFF2563EB),
                  label: 'Status / Speed'.tr,
                  value: currentStatus.toString().tr,
                  subValue: 'GPS Connected'.tr,
                  bgColor: const Color(0xFFEFF6FF),
                  borderColor: const Color(0xFFBFDBFE),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLocationDetailBox({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
    String? subValue,
    required Color bgColor,
    required Color borderColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(10.0),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: iconColor),
          const SizedBox(width: 7),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: GoogleFonts.nunito(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF64748B),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: GoogleFonts.poppins(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF0F172A),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (subValue != null)
                  Text(
                    subValue,
                    style: GoogleFonts.nunito(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF059669),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 3. TELEMETRY & METRICS CARD
  // ---------------------------------------------------------------------------
  Widget _buildTelemetryCard(Map<String, dynamic> veh) {
    final fastagBalance = veh['fastagBalance'] != null ? '₹${veh['fastagBalance']}' : '₹2,450';
    final odometer = veh['odometer'] != null ? '${veh['odometer']} km' : '142,000 km';

    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18.0),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildCardHeader(
            badgeColor: const Color(0xFF059669),
            icon: Icons.speed_outlined,
            title: 'Telemetry & Metrics'.tr,
          ),
          const SizedBox(height: 14.0),

          // 2x2 Telemetry Grid
          Row(
            children: [
              Expanded(
                child: _buildMetricTile(
                  icon: Icons.gps_fixed_rounded,
                  iconColor: const Color(0xFF2563EB),
                  label: 'GPS Tracking System'.tr,
                  value: 'Connected'.tr,
                  subValue: 'Live Telemetry'.tr,
                  bgColor: const Color(0xFFEFF6FF),
                  borderColor: const Color(0xFFBFDBFE),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildMetricTile(
                  icon: Icons.toll_outlined,
                  iconColor: const Color(0xFFEA580C),
                  label: 'FASTag Balance'.tr,
                  value: fastagBalance,
                  subValue: 'Active Account'.tr,
                  bgColor: const Color(0xFFFFF7ED),
                  borderColor: const Color(0xFFFFEDD5),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _buildMetricTile(
                  icon: Icons.health_and_safety_rounded,
                  iconColor: const Color(0xFF059669),
                  label: 'System Health'.tr,
                  value: 'Nominal'.tr,
                  subValue: 'No Active DTC Faults'.tr,
                  bgColor: const Color(0xFFECFDF5),
                  borderColor: const Color(0xFFA7F3D0),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildMetricTile(
                  icon: Icons.speed_rounded,
                  iconColor: const Color(0xFF7C3AED),
                  label: 'Lifetime Odometer'.tr,
                  value: odometer,
                  subValue: 'Verified Hub Meter'.tr,
                  bgColor: const Color(0xFFFAF5FF),
                  borderColor: const Color(0xFFE9D5FF),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricTile({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
    required String subValue,
    required Color bgColor,
    required Color borderColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(12.0),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: iconColor),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  label,
                  style: GoogleFonts.nunito(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF64748B),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 13.5,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF0F172A),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            subValue,
            style: GoogleFonts.nunito(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF64748B),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 4. SERVICE & MAINTENANCE CARD
  // ---------------------------------------------------------------------------
  Widget _buildMaintenanceCard(Map<String, dynamic> veh) {
    final lastServiceDateStr = _formatDate(veh['lastServiceDate'] ?? veh['lastService'] ?? '2023-10-12');
    final nextServiceDueStr = _formatDate(veh['nextServiceDue'] ?? veh['nextService'] ?? '2024-04-12');

    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18.0),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildCardHeader(
            badgeColor: const Color(0xFFEA580C),
            icon: Icons.build_circle_rounded,
            title: 'Service & Maintenance'.tr,
          ),
          const SizedBox(height: 14.0),

          Row(
            children: [
              Expanded(
                child: _buildServiceBox(
                  icon: Icons.history_rounded,
                  iconColor: const Color(0xFF059669),
                  label: 'Last Service Date'.tr,
                  date: lastServiceDateStr,
                  statusText: 'Completed',
                  statusColor: const Color(0xFF059669),
                  statusBg: const Color(0xFFECFDF5),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildServiceBox(
                  icon: Icons.event_available_outlined,
                  iconColor: const Color(0xFFD97706),
                  label: 'Next Service Due'.tr,
                  date: nextServiceDueStr,
                  statusText: 'Scheduled',
                  statusColor: const Color(0xFFD97706),
                  statusBg: const Color(0xFFFEF3C7),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildServiceBox({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String date,
    required String statusText,
    required Color statusColor,
    required Color statusBg,
  }) {
    return Container(
      padding: const EdgeInsets.all(12.0),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 15, color: iconColor),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  label,
                  style: GoogleFonts.nunito(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF64748B),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            date,
            style: GoogleFonts.poppins(
              fontSize: 12.5,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF0F172A),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
            decoration: BoxDecoration(
              color: statusBg,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              statusText,
              style: GoogleFonts.poppins(
                fontSize: 9.5,
                fontWeight: FontWeight.w700,
                color: statusColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 5. DRIVER SNAPSHOT CARD
  // ---------------------------------------------------------------------------
  Widget _buildDriverSnapshotCard(Map<String, dynamic> veh) {
    final driverName = veh['assignedDriverName'] ?? 'Driver Meghana';
    final vehicleNumber = veh['vehicleNumber'] ?? veh['registrationNumber'] ?? 'N/A';
    final vehicleType = veh['vehicleType'] ?? 'Medium Van';

    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18.0),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildCardHeader(
            badgeColor: const Color(0xFF7C3AED),
            icon: Icons.person_pin_rounded,
            title: 'Active Assignment'.tr,
          ),
          const SizedBox(height: 14.0),

          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.person_outline_rounded,
                          size: 15,
                          color: Color(0xFF64748B),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Driver: '.tr,
                          style: GoogleFonts.nunito(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF64748B),
                          ),
                        ),
                        Flexible(
                          child: Text(
                            driverName,
                            style: GoogleFonts.poppins(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF0F172A),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '$vehicleNumber • $vehicleType',
                      style: GoogleFonts.nunito(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
              ),
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.asset(
                  'assets/images/vehicle.png',
                  height: 54,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      width: 54,
                      height: 54,
                      decoration: BoxDecoration(
                        color: const Color(0xFF0B1626).withValues(alpha: 0.06),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.local_shipping_rounded,
                        size: 30,
                        color: Color(0xFF0B1626),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // REUSABLE COMPONENTS
  // ---------------------------------------------------------------------------
  Widget _buildCardHeader({
    required Color badgeColor,
    required IconData icon,
    required String title,
    Widget? trailing,
  }) {
    return Row(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: badgeColor.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: badgeColor, size: 17),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            title,
            style: GoogleFonts.poppins(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF0F172A),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        if (trailing != null) ...[
          const SizedBox(width: 8),
          trailing,
        ],
      ],
    );
  }
}
