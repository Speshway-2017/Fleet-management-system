import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import '../services/localization_service.dart';
import '../utils/navigation_helper.dart';
import 'vehicle_overview_screen.dart';

/// Driver Module - Vehicle Details Screen
///
/// Redesigned with the Color-Coded Premium Card Design System:
/// 1. Executive Navy Hero Banner with Asset Specifications & 3-metric KPI ribbon
/// 2. Core Vehicle Specifications Card (Sapphire Blue badge & colorful 2x2 grid)
/// 3. Operational & Telemetry Status Card (Emerald Green badge & live depot chip)
/// 4. Assigned Driver Information Card (Royal Violet badge & contact rows)
/// 5. Technical & Legal Identification Card (Fleet Orange badge & VIN/Engine chips)
class VehicleDetailsScreen extends StatefulWidget {
  final Map<String, dynamic>? vehicle;

  const VehicleDetailsScreen({
    super.key,
    this.vehicle,
  });

  @override
  State<VehicleDetailsScreen> createState() => _VehicleDetailsScreenState();
}

class _VehicleDetailsScreenState extends State<VehicleDetailsScreen> {
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

  // ---------------------------------------------------------------------------
  // BUILD
  // ---------------------------------------------------------------------------
  @override
  Widget build(BuildContext context) {
    const primaryDark = Color(0xFF0B1626);
    const bgLight = Color(0xFFF4F6FA);
    const textPrimary = Color(0xFF0F172A);
    const textSecondary = Color(0xFF64748B);

    final currentVehicle = _vehicle ?? widget.vehicle;

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
                'Vehicle Details'.tr,
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              actions: const [],
            ),
            body: _isLoading && currentVehicle == null
                ? const Center(
                    child: CircularProgressIndicator(
                      valueColor:
                          AlwaysStoppedAnimation<Color>(Color(0xFFEA580C)),
                    ),
                  )
                : currentVehicle == null
                    ? _buildEmptyState(textPrimary, textSecondary)
                : SafeArea(
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

                            // 2. Core Vehicle Specifications Card
                            _buildCoreSpecsCard(currentVehicle),
                            const SizedBox(height: 14.0),

                            // 3. Operational Status & Depot Location Card
                            _buildOperationalStatusCard(currentVehicle),
                            const SizedBox(height: 14.0),

                            // 4. Assigned Driver Information Card
                            _buildDriverInfoCard(currentVehicle),
                            const SizedBox(height: 14.0),

                            // 5. Technical Identification Card
                            _buildTechnicalIdentifiersCard(currentVehicle),
                            const SizedBox(height: 24.0),
                          ],
                        ),
                      ),
                    ),
                  ),
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
                Icons.no_transfer_outlined,
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
    final registrationNumber = veh['registrationNumber'] ?? veh['vehicleNumber'] ?? 'N/A';
    final vehicleType = veh['vehicleType'] ?? 'Truck';
    final brand = veh['brand'] ?? 'Tata Motors';
    final model = veh['model'] ?? 'Prima 4028.S';
    final fuelType = veh['fuelType'] ?? 'Diesel';
    final payloadCap = veh['loadCapacity'] != null ? '${veh['loadCapacity']} Tons' : 'N/A';
    final odometer = veh['odometer'] != null ? '${veh['odometer']} km' : '0 km';

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
                        color: const Color(0xFFEA580C).withValues(alpha: 0.18),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: const Color(0xFFF97316).withValues(alpha: 0.4),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.directions_bus_filled_rounded,
                            color: Color(0xFFFB923C),
                            size: 13,
                          ),
                          const SizedBox(width: 5),
                          Text(
                            'FLEET ASSET PROFILE',
                            style: GoogleFonts.poppins(
                              color: const Color(0xFFFB923C),
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
                      '$brand $model • $vehicleType',
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
              // Squircle Plate Container
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: Colors.white.withValues(alpha: 0.18),
                  ),
                ),
                child: Column(
                  children: [
                    Text(
                      'IND',
                      style: GoogleFonts.poppins(
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF38BDF8),
                        letterSpacing: 1.0,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      registrationNumber,
                      style: GoogleFonts.poppins(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
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
                  icon: Icons.local_gas_station_rounded,
                  iconColor: const Color(0xFF38BDF8),
                  label: 'Fuel Type',
                  value: fuelType,
                  bgColor: const Color(0xFF0C4A6E).withValues(alpha: 0.4),
                  borderColor: const Color(0xFF0284C7).withValues(alpha: 0.3),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildHeroStatTile(
                  icon: Icons.inventory_2_rounded,
                  iconColor: const Color(0xFFFBBF24),
                  label: 'Payload',
                  value: payloadCap,
                  bgColor: const Color(0xFF78350F).withValues(alpha: 0.35),
                  borderColor: const Color(0xFFD97706).withValues(alpha: 0.3),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildHeroStatTile(
                  icon: Icons.speed_rounded,
                  iconColor: const Color(0xFF34D399),
                  label: 'Odometer',
                  value: odometer,
                  bgColor: const Color(0xFF064E3B).withValues(alpha: 0.4),
                  borderColor: const Color(0xFF059669).withValues(alpha: 0.3),
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
  // 2. CORE SPECIFICATIONS CARD
  // ---------------------------------------------------------------------------
  Widget _buildCoreSpecsCard(Map<String, dynamic> veh) {
    final brand = veh['brand'] ?? 'Tata Motors';
    final model = veh['model'] ?? 'Prima 4028.S';
    final mfgYear = veh['manufactureYear']?.toString() ??
        veh['manufacturingYear']?.toString() ??
        '2022';
    final payloadCap = veh['loadCapacity'] != null ? '${veh['loadCapacity']} Tons' : '18.5 Tons';
    final gvw = veh['gvw'] ?? '40,000 kg';

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
            icon: Icons.tune_rounded,
            title: 'Core Specifications'.tr,
          ),
          const SizedBox(height: 14),

          // 2x2 Colorful Spec Grid
          Row(
            children: [
              Expanded(
                child: _buildSpecBox(
                  icon: Icons.directions_car_rounded,
                  iconColor: const Color(0xFF2563EB),
                  bgColor: const Color(0xFFEFF6FF),
                  borderColor: const Color(0xFFBFDBFE),
                  label: 'Brand & Model'.tr,
                  value: '$brand $model',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildSpecBox(
                  icon: Icons.calendar_today_rounded,
                  iconColor: const Color(0xFF64748B),
                  bgColor: const Color(0xFFF8FAFC),
                  borderColor: const Color(0xFFE2E8F0),
                  label: 'Manufacturing Year'.tr,
                  value: mfgYear,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _buildSpecBox(
                  icon: Icons.fitness_center_rounded,
                  iconColor: const Color(0xFFD97706),
                  bgColor: const Color(0xFFFEF3C7),
                  borderColor: const Color(0xFFFDE68A),
                  label: 'Payload Capacity'.tr,
                  value: payloadCap,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildSpecBox(
                  icon: Icons.scale_rounded,
                  iconColor: const Color(0xFF7C3AED),
                  bgColor: const Color(0xFFEDE9FE),
                  borderColor: const Color(0xFFDDD6FE),
                  label: 'Gross Weight (GVW)'.tr,
                  value: gvw,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSpecBox({
    required IconData icon,
    required Color iconColor,
    required Color bgColor,
    required Color borderColor,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
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
              Icon(icon, size: 14, color: iconColor),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  label.toUpperCase(),
                  style: GoogleFonts.poppins(
                    fontSize: 9.5,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF64748B),
                    letterSpacing: 0.3,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 5),
          Text(
            value.isNotEmpty ? value : 'N/A',
            style: GoogleFonts.poppins(
              fontSize: 13,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF0F172A),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 3. OPERATIONAL STATUS & DEPOT CARD
  // ---------------------------------------------------------------------------
  Widget _buildOperationalStatusCard(Map<String, dynamic> veh) {
    final status = veh['currentStatus'] ?? 'Assigned';
    final currentLocation = veh['currentLocation'] ?? veh['branchDepot'] ?? 'Hyderabad Hub Depot';
    final odometer = veh['odometer'] != null ? '${veh['odometer']} km' : '0 km';

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
            icon: Icons.fact_check_rounded,
            title: 'Operational Status'.tr,
          ),
          const SizedBox(height: 14),

          // Status & Location Row
          Container(
            padding: const EdgeInsets.all(12.0),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFA7F3D0)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 7,
                        height: 7,
                        decoration: const BoxDecoration(
                          color: Color(0xFF059669),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 5),
                      Text(
                        status.toString().tr,
                        style: GoogleFonts.poppins(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF059669),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Row(
                    children: [
                      const Icon(
                        Icons.location_on_rounded,
                        size: 15,
                        color: Color(0xFFDC2626),
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          currentLocation,
                          style: GoogleFonts.nunito(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF334155),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Odometer Row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFBFDBFE)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.speed_rounded, size: 16, color: Color(0xFF2563EB)),
                    const SizedBox(width: 8),
                    Text(
                      'ODOMETER READING'.tr,
                      style: GoogleFonts.poppins(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF1E3A8A),
                        letterSpacing: 0.3,
                      ),
                    ),
                  ],
                ),
                Text(
                  odometer,
                  style: GoogleFonts.poppins(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF1E40AF),
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
  // 4. ASSIGNED DRIVER INFO CARD
  // ---------------------------------------------------------------------------
  Widget _buildDriverInfoCard(Map<String, dynamic> veh) {
    final driverName = veh['assignedDriverName'] ?? 'Assigned Driver';
    final driverEmpId = veh['assignedDriverEmpId'] ?? 'EMP-8842';
    final driverMobile = veh['assignedDriverPhone'] ?? '+91 98765 43210';
    final driverLicense = veh['assignedDriverLicense'] ?? 'DL-0420110098765';

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
            icon: Icons.badge_rounded,
            title: 'Assigned Driver'.tr,
          ),
          const SizedBox(height: 14),

          // Driver Identity Tile
          Container(
            padding: const EdgeInsets.all(12.0),
            decoration: BoxDecoration(
              color: const Color(0xFFFAF5FF),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE9D5FF)),
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF7C3AED), Color(0xFF9333EA)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Icon(Icons.person_rounded, color: Colors.white, size: 24),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              driverName,
                              style: GoogleFonts.poppins(
                                fontSize: 14.5,
                                fontWeight: FontWeight.w800,
                                color: const Color(0xFF0F172A),
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(Icons.verified_rounded, color: Color(0xFF2563EB), size: 15),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Employee ID: $driverEmpId',
                        style: GoogleFonts.nunito(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF6B21A8),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Contact Details Rows
          _buildInfoRow(
            icon: Icons.phone_android_rounded,
            iconColor: const Color(0xFF059669),
            label: 'Mobile Contact'.tr,
            value: driverMobile,
          ),
          const SizedBox(height: 8),
          _buildInfoRow(
            icon: Icons.card_membership_rounded,
            iconColor: const Color(0xFF2563EB),
            label: 'Driver License'.tr,
            value: driverLicense,
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 5. TECHNICAL IDENTIFIERS CARD
  // ---------------------------------------------------------------------------
  Widget _buildTechnicalIdentifiersCard(Map<String, dynamic> veh) {
    final engineNumber = veh['engineNumber'] ?? 'ENG-4028-IN-8890';
    final chassisNumber = veh['chassisNumber'] ?? 'MAT615370N3C09871';
    final registrationNumber = veh['registrationNumber'] ?? veh['vehicleNumber'] ?? 'N/A';

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
            icon: Icons.fingerprint_rounded,
            title: 'Technical Identifiers'.tr,
          ),
          const SizedBox(height: 14),

          _buildInfoRow(
            icon: Icons.memory_rounded,
            iconColor: const Color(0xFF2563EB),
            label: 'Engine Number'.tr,
            value: engineNumber,
          ),
          const SizedBox(height: 8),
          _buildInfoRow(
            icon: Icons.pin_rounded,
            iconColor: const Color(0xFFEA580C),
            label: 'Chassis Number (VIN)'.tr,
            value: chassisNumber,
          ),
          const SizedBox(height: 8),
          _buildInfoRow(
            icon: Icons.confirmation_number_outlined,
            iconColor: const Color(0xFF059669),
            label: 'Registration Certificate'.tr,
            value: registrationNumber,
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
          ),
        ),
      ],
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: iconColor),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              label,
              style: GoogleFonts.nunito(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF64748B),
              ),
            ),
          ),
          Flexible(
            child: Text(
              value,
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
    );
  }
}
