import 'main_navigation_screen.dart';
import '../services/localization_service.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import 'add_fuel_entry_screen.dart';
import 'fuel_history_screen.dart';

/// Driver Module - Fuel Overview Screen
/// 
/// Dynamically fetches real fuel records and assigned vehicle info from backend.
/// Replicates the Fleet Management design system without dummy hardcoded values.
class FuelOverviewScreen extends StatefulWidget {
  const FuelOverviewScreen({super.key});

  @override
  State<FuelOverviewScreen> createState() => _FuelOverviewScreenState();
}

class _FuelOverviewScreenState extends State<FuelOverviewScreen> {
  static Map<String, dynamic>? _cachedFuelData;

  bool _isLoading = true;
  bool _isAssigned = false;
  bool _hasActiveTrip = false;
  String _vehicleNumber = 'Assigned Vehicle';
  double _lastRefillCost = 0.0;
  double _lastRefillLiters = 0.0;
  double _totalLiters = 0.0;
  int _totalEntries = 0;

  @override
  void initState() {
    super.initState();
    if (_cachedFuelData != null) {
      _isAssigned = _cachedFuelData!['isAssigned'] ?? false;
      _vehicleNumber = _cachedFuelData!['vehicleNumber'] ?? 'Assigned Vehicle';
      _hasActiveTrip = _cachedFuelData!['hasActiveTrip'] ?? false;
      _lastRefillCost = _cachedFuelData!['lastRefillCost'] ?? 0.0;
      _lastRefillLiters = _cachedFuelData!['lastRefillLiters'] ?? 0.0;
      _totalLiters = _cachedFuelData!['totalLiters'] ?? 0.0;
      _totalEntries = _cachedFuelData!['totalEntries'] ?? 0;
      _isLoading = false;
    } else {
      _isLoading = true;
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted && _isLoading) setState(() => _isLoading = false);
      });
    }
    _fetchOverviewData();
  }

  Future<void> _fetchOverviewData() async {
    if (_cachedFuelData == null) {
      setState(() {
        _isLoading = true;
      });
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted && _isLoading) setState(() => _isLoading = false);
      });
    }

    try {
      final results = await Future.wait([
        ApiService.getAssignedVehicle().catchError((_) => null),
        ApiService.getCurrentTrip().catchError((_) => null),
        ApiService.getDriverFuelRecords().catchError((_) => null),
      ]);

      final vehRes = results[0];
      final tripRes = results[1];
      final fuelRes = results[2];

      bool assigned = false;
      String vehNum = 'No Vehicle Assigned';
      if (vehRes != null && vehRes['success'] == true) {
        final vData = vehRes['data'];
        if (vData != null && vData['assigned'] == true && vData['vehicle'] != null) {
          final v = vData['vehicle'];
          assigned = true;
          vehNum = v['vehicleNumber'] ?? v['plateNumber'] ?? 'Assigned Vehicle';
        }
      }

      bool hasActive = false;
      if (tripRes != null && tripRes['success'] == true && tripRes['data'] != null) {
        final tData = tripRes['data'];
        if (tData is Map && tData.isNotEmpty && tData['tripNumber'] != null) {
          final st = (tData['status'] ?? '').toString().toLowerCase();
          final activeStatuses = ['assigned', 'scheduled', 'in progress', 'accepted', 'on transit', 'enroute', 'reach pickup', 'pickup completed', 'pending driver acceptance', 'ready to dispatch', 'start trip'];
          if (activeStatuses.contains(st)) {
            hasActive = true;
          }
        }
      }

      double sumLiters = 0.0;
      int entries = 0;
      double refillCost = 0.0;
      double refillLiters = 0.0;
      if (fuelRes != null && fuelRes['success'] == true) {
        final List<dynamic> logs = fuelRes['data'] ?? [];
        for (var l in logs) {
          sumLiters += (_parseNumber(l['liters']) ?? 0.0);
        }
        entries = logs.length;
        if (logs.isNotEmpty) {
          final latest = logs[0];
          refillCost = (_parseNumber(latest['amount']) ?? 0.0);
          refillLiters = (_parseNumber(latest['liters']) ?? 0.0);
        }
      }

      _cachedFuelData = {
        'isAssigned': assigned,
        'vehicleNumber': vehNum,
        'hasActiveTrip': hasActive,
        'totalEntries': entries,
        'totalLiters': sumLiters,
        'lastRefillCost': refillCost,
        'lastRefillLiters': refillLiters,
      };

      if (mounted) {
        setState(() {
          _isAssigned = assigned;
          _vehicleNumber = vehNum;
          _hasActiveTrip = hasActive;
          _totalEntries = entries;
          _totalLiters = sumLiters;
          _lastRefillCost = refillCost;
          _lastRefillLiters = refillLiters;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  static double? _parseNumber(dynamic val) {
    if (val == null) return null;
    return double.tryParse(val.toString());
  }

  @override
  Widget build(BuildContext context) {
    const primaryDark = Color(0xFF101C2C);
    const bgLight = Color(0xFFF4F6FA);
    const primaryOrange = Color(0xFFFF7A1A);
    const successGreen = Color(0xFF4ADE80);

    return ValueListenableBuilder<String>(
      valueListenable: LocalizationService.currentLanguageNotifier,
      builder: (context, currentLang, _) {
        return Scaffold(
          backgroundColor: bgLight,
          appBar: AppBar(
            backgroundColor: primaryDark,
            elevation: 0,
            centerTitle: false,
            titleSpacing: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
              onPressed: () =>
                  MainNavigationScreen.selectedTabNotifier.value = 2,
            ),
            title: Text(
              'Fuel Overview'.tr,
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
            actions: const [],
          ),
          body: SafeArea(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(primaryOrange),
                    ),
                  )
                : RefreshIndicator(
                    onRefresh: () async {
                      _cachedFuelData = null;
                      ApiService.clearApiCache('/driver/fuel');
                      ApiService.clearApiCache('/driver/vehicle');
                      ApiService.clearApiCache('/driver/trips/current');
                      await Future.any([
                        _fetchOverviewData(),
                        Future.delayed(const Duration(milliseconds: 500)),
                      ]);
                    },
                    color: primaryOrange,
                    child: SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(
                        parent: BouncingScrollPhysics(),
                      ),
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Status Banner
                          if (!_isAssigned && !_hasActiveTrip) ...[
                            Container(
                              width: double.infinity,
                              margin: const EdgeInsets.only(bottom: 16.0),
                              padding: const EdgeInsets.all(14.0),
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  colors: [Color(0xFFEFF6FF), Color(0xFFDBEAFE)],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: const Color(0xFF93C5FD),
                                ),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Icon(
                                    Icons.info_outline_rounded,
                                    color: Color(0xFF2563EB),
                                    size: 20,
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Text(
                                      'No vehicle or trip is currently assigned. Fuel logging will become available once a vehicle or trip is assigned to you.'
                                          .tr,
                                      style: GoogleFonts.nunito(
                                        fontSize: 12.5,
                                        fontWeight: FontWeight.w700,
                                        color: const Color(0xFF1E40AF),
                                        height: 1.4,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],

                          // 1. Vehicle Fuel Overview Hero Card (Executive Deep Navy Gradient)
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(20.0),
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
                              borderRadius: BorderRadius.circular(22.0),
                              border: Border.all(
                                color: Colors.white.withValues(alpha: 0.1),
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF0B1626)
                                      .withValues(alpha: 0.25),
                                  blurRadius: 18,
                                  offset: const Offset(0, 8),
                                ),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            _vehicleNumber,
                                            overflow: TextOverflow.ellipsis,
                                            style: GoogleFonts.poppins(
                                              fontSize: 19,
                                              fontWeight: FontWeight.w800,
                                              color: Colors.white,
                                            ),
                                          ),
                                          const SizedBox(height: 6.0),
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 10,
                                              vertical: 4,
                                            ),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFF22C55E)
                                                  .withValues(alpha: 0.18),
                                              borderRadius:
                                                  BorderRadius.circular(20),
                                              border: Border.all(
                                                color: successGreen.withValues(
                                                  alpha: 0.4,
                                                ),
                                              ),
                                            ),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Container(
                                                  width: 7,
                                                  height: 7,
                                                  decoration:
                                                      const BoxDecoration(
                                                        color: successGreen,
                                                        shape: BoxShape.circle,
                                                      ),
                                                ),
                                                const SizedBox(width: 6),
                                                Text(
                                                  'Active Vehicle'.tr,
                                                  style: GoogleFonts.poppins(
                                                    fontSize: 11,
                                                    fontWeight: FontWeight.w700,
                                                    color: const Color(
                                                      0xFF86EFAC,
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Container(
                                      width: 44,
                                      height: 44,
                                      decoration: BoxDecoration(
                                        gradient: const LinearGradient(
                                          colors: [
                                            Color(0xFFFF6A00),
                                            Color(0xFFFF9238),
                                          ],
                                          begin: Alignment.topLeft,
                                          end: Alignment.bottomRight,
                                        ),
                                        borderRadius: BorderRadius.circular(13),
                                        boxShadow: [
                                          BoxShadow(
                                            color: const Color(0xFFFF6A00)
                                                .withValues(alpha: 0.35),
                                            blurRadius: 10,
                                            offset: const Offset(0, 4),
                                          ),
                                        ],
                                      ),
                                      child: const Icon(
                                        Icons.local_gas_station_rounded,
                                        color: Colors.white,
                                        size: 22,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16.0),
                                Container(
                                  height: 1,
                                  color: Colors.white.withValues(alpha: 0.1),
                                ),
                                const SizedBox(height: 14.0),
                                Row(
                                  children: [
                                    Expanded(
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 12,
                                          vertical: 10,
                                        ),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withValues(
                                            alpha: 0.08,
                                          ),
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                          border: Border.all(
                                            color: Colors.white.withValues(
                                              alpha: 0.08,
                                            ),
                                          ),
                                        ),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              'TOTAL FUEL LOGS'.tr,
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: GoogleFonts.poppins(
                                                fontSize: 10,
                                                fontWeight: FontWeight.w600,
                                                color: Colors.white60,
                                                letterSpacing: 0.5,
                                              ),
                                            ),
                                            const SizedBox(height: 3.0),
                                            Text(
                                              '$_totalEntries ${'Entries'.tr}',
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: GoogleFonts.poppins(
                                                fontSize: 15,
                                                fontWeight: FontWeight.w700,
                                                color: Colors.white,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 12,
                                          vertical: 10,
                                        ),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withValues(
                                            alpha: 0.08,
                                          ),
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                          border: Border.all(
                                            color: Colors.white.withValues(
                                              alpha: 0.08,
                                            ),
                                          ),
                                        ),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              'LAST REFILL'.tr,
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: GoogleFonts.poppins(
                                                fontSize: 10,
                                                fontWeight: FontWeight.w600,
                                                color: Colors.white60,
                                                letterSpacing: 0.5,
                                              ),
                                            ),
                                            const SizedBox(height: 3.0),
                                            Text(
                                              _lastRefillLiters > 0
                                                  ? '${_lastRefillLiters}L'
                                                  : 'N/A',
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: GoogleFonts.poppins(
                                                fontSize: 15,
                                                fontWeight: FontWeight.w700,
                                                color: const Color(0xFFFB923C),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: 22.0),

                          // 2. QUICK ACTIONS Section Header
                          _buildSectionHeader('QUICK ACTIONS'.tr),
                          const SizedBox(height: 12.0),

                          IntrinsicHeight(
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                Expanded(
                                  child: _buildQuickActionCard(
                                    context,
                                    icon: Icons.add_circle_outline_rounded,
                                    label: 'Add Fuel\nEntry'.tr,
                                    accentColor: const Color(0xFFEA580C),
                                    gradientEnd: const Color(0xFFFFF7ED),
                                    borderColor: const Color(0xFFFED7AA),
                                    isDisabled:
                                        !(_isAssigned || _hasActiveTrip),
                                    onTap: () async {
                                      if (!_isAssigned && !_hasActiveTrip) {
                                        ScaffoldMessenger.of(
                                          context,
                                        ).showSnackBar(
                                          SnackBar(
                                            content: Row(
                                              children: [
                                                const Icon(
                                                  Icons.lock_outline_rounded,
                                                  color: Colors.white,
                                                  size: 18,
                                                ),
                                                const SizedBox(width: 8),
                                                Expanded(
                                                  child: Text(
                                                    'Fuel logging is locked: Requires an assigned vehicle or active trip.'
                                                        .tr,
                                                  ),
                                                ),
                                              ],
                                            ),
                                            backgroundColor: const Color(
                                              0xFF1E293B,
                                            ),
                                            behavior: SnackBarBehavior.floating,
                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(10.0),
                                            ),
                                          ),
                                        );
                                        return;
                                      }
                                      await Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) =>
                                              const AddFuelEntryScreen(),
                                        ),
                                      );
                                      _fetchOverviewData();
                                    },
                                  ),
                                ),
                                const SizedBox(width: 12.0),
                                Expanded(
                                  child: _buildQuickActionCard(
                                    context,
                                    icon: Icons.history_rounded,
                                    label: 'Fuel\nHistory'.tr,
                                    accentColor: const Color(0xFF2563EB),
                                    gradientEnd: const Color(0xFFEFF6FF),
                                    borderColor: const Color(0xFFBFDBFE),
                                    isDisabled: false,
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) =>
                                              const FuelHistoryScreen(),
                                        ),
                                      );
                                    },
                                  ),
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: 22.0),

                          // 3. FUEL STATISTICS Section Header
                          _buildSectionHeader('FUEL STATISTICS'.tr),
                          const SizedBox(height: 12.0),

                          _buildStatCard(
                            context,
                            icon: Icons.local_gas_station_rounded,
                            title: 'Total Quantity Logged'.tr,
                            value: '${_totalLiters.toStringAsFixed(1)} L',
                            accentColor: const Color(0xFF059669),
                            gradientEnd: const Color(0xFFECFDF5),
                            borderColor: const Color(0xFFA7F3D0),
                          ),
                          const SizedBox(height: 12.0),
                          _buildStatCard(
                            context,
                            icon: Icons.account_balance_wallet_rounded,
                            title: 'Last Refill Cost'.tr,
                            value: _lastRefillCost > 0
                                ? '₹${_lastRefillCost.toStringAsFixed(2)}'
                                : 'N/A',
                            accentColor: const Color(0xFF7C3AED),
                            gradientEnd: const Color(0xFFF5F3FF),
                            borderColor: const Color(0xFFDDD6FE),
                          ),

                          const SizedBox(height: 24.0),
                        ],
                      ),
                    ),
                  ),
          ),
        );
      },
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: GoogleFonts.poppins(
        fontSize: 11.5,
        fontWeight: FontWeight.w700,
        color: const Color(0xFF475569),
        letterSpacing: 0.7,
      ),
    );
  }

  Widget _buildQuickActionCard(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color accentColor,
    required Color gradientEnd,
    required Color borderColor,
    required VoidCallback onTap,
    bool isDisabled = false,
  }) {
    final effectiveAccent = isDisabled ? const Color(0xFFD97706) : accentColor;
    final effectiveEnd = isDisabled ? const Color(0xFFFFFBEB) : gradientEnd;
    final effectiveBorder = isDisabled ? const Color(0xFFFCD34D) : borderColor;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 18.0, horizontal: 12.0),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.white, effectiveEnd],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(18.0),
          border: Border.all(
            color: effectiveBorder,
            width: isDisabled ? 1.4 : 1.0,
          ),
          boxShadow: [
            BoxShadow(
              color: effectiveAccent.withValues(alpha: 0.09),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    effectiveAccent,
                    effectiveAccent.withValues(alpha: 0.8),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(13.0),
                boxShadow: [
                  BoxShadow(
                    color: effectiveAccent.withValues(alpha: 0.28),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Icon(
                isDisabled ? Icons.lock_outline_rounded : icon,
                color: Colors.white,
                size: 22,
              ),
            ),
            const SizedBox(height: 11.0),
            Text(
              label,
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF0F172A),
                height: 1.25,
              ),
            ),
            if (isDisabled) ...[
              const SizedBox(height: 6.0),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8.0,
                  vertical: 2.0,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(6.0),
                  border: Border.all(
                    color: const Color(0xFFF59E0B),
                    width: 0.8,
                  ),
                ),
                child: Text(
                  'LOCKED',
                  style: GoogleFonts.poppins(
                    fontSize: 9.0,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFFB45309),
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String value,
    required Color accentColor,
    required Color gradientEnd,
    required Color borderColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 13.0),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.white, gradientEnd],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        borderRadius: BorderRadius.circular(16.0),
        border: Border.all(color: borderColor, width: 1.0),
        boxShadow: [
          BoxShadow(
            color: accentColor.withValues(alpha: 0.09),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [accentColor, accentColor.withValues(alpha: 0.8)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(12.0),
              boxShadow: [
                BoxShadow(
                  color: accentColor.withValues(alpha: 0.25),
                  blurRadius: 7,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Icon(icon, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 14.0),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.nunito(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF475569),
                  ),
                ),
                const SizedBox(height: 2.0),
                Text(
                  value,
                  style: GoogleFonts.poppins(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
