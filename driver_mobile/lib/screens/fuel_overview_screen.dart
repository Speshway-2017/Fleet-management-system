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
    _fetchOverviewData();
  }

  Future<void> _fetchOverviewData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      bool assigned = false;
      String vehNum = 'No Vehicle Assigned';
      try {
        final vehRes = await ApiService.getAssignedVehicle();
        if (vehRes != null && vehRes['success'] == true) {
          final vData = vehRes['data'];
          if (vData != null && vData['assigned'] == true && vData['vehicle'] != null) {
            final v = vData['vehicle'];
            assigned = true;
            vehNum = v['vehicleNumber'] ?? v['plateNumber'] ?? 'Assigned Vehicle';
          }
        }
      } catch (e) {
        debugPrint('Error fetching assigned vehicle: $e');
      }

      bool hasActive = false;
      try {
        final tripRes = await ApiService.getCurrentTrip();
        if (tripRes != null && tripRes['success'] == true && tripRes['data'] != null) {
          final tData = tripRes['data'];
          if (tData is Map && tData.isNotEmpty && tData['tripNumber'] != null) {
            final st = (tData['status'] ?? '').toString().toLowerCase();
            final activeStatuses = ['assigned', 'scheduled', 'in progress', 'accepted', 'on transit', 'enroute', 'reach pickup', 'pickup completed'];
            if (activeStatuses.contains(st)) {
              hasActive = true;
            }
          }
        }
      } catch (e) {
        debugPrint('Error fetching current trip: $e');
      }

      // ALWAYS fetch fuel records regardless of vehicle assignment to display history!
      try {
        final fuelRes = await ApiService.getDriverFuelRecords();
        if (fuelRes != null && fuelRes['success'] == true) {
          final List<dynamic> logs = fuelRes['data'] ?? [];
          double sumLiters = 0.0;
          for (var l in logs) {
            sumLiters += (_parseNumber(l['liters']) ?? 0.0);
          }
          _totalEntries = logs.length;
          _totalLiters = sumLiters;

          if (logs.isNotEmpty) {
            final latest = logs[0];
            _lastRefillCost = (_parseNumber(latest['amount']) ?? 0.0);
            _lastRefillLiters = (_parseNumber(latest['liters']) ?? 0.0);
          }
        }
      } catch (e) {
        debugPrint('Error fetching fuel records: $e');
      }

      if (mounted) {
        setState(() {
          _isAssigned = assigned;
          _vehicleNumber = vehNum;
          _hasActiveTrip = hasActive;
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
    const bgLight = Color(0xFFF7F8FA);
    const borderGray = Color(0xFFE2E8F0);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const primaryOrange = Color(0xFFFF7A1A);
    const successGreen = Color(0xFF22C55E);

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
          'Fuel Overview',
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
        child: _isLoading
            ? const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(primaryOrange),
                ),
              )
            : RefreshIndicator(
                onRefresh: _fetchOverviewData,
                color: primaryOrange,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Status Banner
                      if (!_isAssigned) ...[
                        Container(
                          width: double.infinity,
                          margin: const EdgeInsets.only(bottom: 16.0),
                          padding: const EdgeInsets.all(14.0),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEFF6FF), // Light blue box
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFBFDBFE)),
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
                                  'No vehicle is currently assigned. You can view your previous records, but new fuel entries will be available once a vehicle is assigned.',
                                  style: GoogleFonts.nunito(
                                    fontSize: 12.5,
                                    fontWeight: FontWeight.w600,
                                    color: const Color(0xFF1E40AF),
                                    height: 1.4,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ] else if (!_hasActiveTrip) ...[
                        Container(
                          width: double.infinity,
                          margin: const EdgeInsets.only(bottom: 16.0),
                          padding: const EdgeInsets.all(14.0),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFFBEB), // Light amber box
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFFCD34D)),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(
                                Icons.warning_amber_rounded,
                                color: Color(0xFFD97706),
                                size: 20,
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  'No active trip found. You can view your previous records, but adding new fuel entries is available only during an active trip.',
                                  style: GoogleFonts.nunito(
                                    fontSize: 12.5,
                                    fontWeight: FontWeight.w600,
                                    color: const Color(0xFF92400E),
                                    height: 1.4,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                            // 1. Vehicle Fuel Overview Card
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(18.0),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20.0),
                          border: Border.all(color: borderGray, width: 1.0),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withAlpha(6),
                              blurRadius: 10,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      _vehicleNumber,
                                      style: GoogleFonts.poppins(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w700,
                                        color: textPrimary,
                                      ),
                                    ),
                                    const SizedBox(height: 4.0),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFDCFCE7),
                                        borderRadius: BorderRadius.circular(12),
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
                                            'Active Vehicle',
                                            style: GoogleFonts.poppins(
                                              fontSize: 11,
                                              fontWeight: FontWeight.w600,
                                              color: const Color(0xFF15803D),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                Container(
                                  padding: const EdgeInsets.all(8.0),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF1F5F9),
                                    borderRadius: BorderRadius.circular(10.0),
                                  ),
                                  child: const Icon(
                                    Icons.local_gas_station_rounded,
                                    color: primaryDark,
                                    size: 24,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16.0),
                            const Divider(color: borderGray, height: 1.0),
                            const SizedBox(height: 16.0),

                            Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'TOTAL FUEL LOGS',
                                        style: GoogleFonts.poppins(
                                          fontSize: 10.5,
                                          fontWeight: FontWeight.w600,
                                          color: textSecondary,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                      const SizedBox(height: 2.0),
                                      Text(
                                        '$_totalEntries Entries',
                                        style: GoogleFonts.poppins(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w700,
                                          color: textPrimary,
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
                                        'LAST REFILL',
                                        style: GoogleFonts.poppins(
                                          fontSize: 10.5,
                                          fontWeight: FontWeight.w600,
                                          color: textSecondary,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                      const SizedBox(height: 2.0),
                                      Text(
                                        _lastRefillLiters > 0 ? '${_lastRefillLiters}L' : 'N/A',
                                        style: GoogleFonts.poppins(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w700,
                                          color: textPrimary,
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

                      const SizedBox(height: 24.0),

                      // 2. QUICK ACTIONS Section Header
                      _buildSectionHeader('QUICK ACTIONS'),
                      const SizedBox(height: 12.0),

                      Row(
                        children: [
                          Expanded(
                            child: _buildQuickActionCard(
                              context,
                              icon: Icons.add_circle_outline_rounded,
                              label: 'Add Fuel\nEntry',
                              isDisabled: !(_isAssigned && _hasActiveTrip),
                              onTap: () async {
                                if (!_isAssigned) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('No vehicle is currently assigned. New fuel entries will be available once a vehicle is assigned.'),
                                      backgroundColor: Colors.orange,
                                      behavior: SnackBarBehavior.floating,
                                    ),
                                  );
                                  return;
                                }
                                if (!_hasActiveTrip) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Adding fuel entries is only permitted during an active trip.'),
                                      backgroundColor: Colors.orange,
                                      behavior: SnackBarBehavior.floating,
                                    ),
                                  );
                                  return;
                                }
                                await Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => const AddFuelEntryScreen(),
                                  ),
                                );
                                _fetchOverviewData();
                              },
                            ),
                          ),
                          const SizedBox(width: 14.0),
                          Expanded(
                            child: _buildQuickActionCard(
                              context,
                              icon: Icons.history_rounded,
                              label: 'Fuel\nHistory',
                              isDisabled: false,
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => const FuelHistoryScreen(),
                                  ),
                                );
                              },
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 24.0),

                      // 3. FUEL STATISTICS Section Header
                      _buildSectionHeader('FUEL STATISTICS'),
                      const SizedBox(height: 12.0),

                      _buildStatCard(
                        context,
                        icon: Icons.local_gas_station_outlined,
                        title: 'Total Quantity Logged',
                        value: '${_totalLiters.toStringAsFixed(1)} L',
                      ),
                      const SizedBox(height: 12.0),
                      _buildStatCard(
                        context,
                        icon: Icons.account_balance_wallet_outlined,
                        title: 'Last Refill Cost',
                        value: _lastRefillCost > 0 ? '₹${_lastRefillCost.toStringAsFixed(2)}' : 'N/A',
                      ),

                      const SizedBox(height: 24.0),
                    ],
                  ),
                ),
              ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: GoogleFonts.poppins(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        color: const Color(0xFF6B7280),
        letterSpacing: 0.5,
      ),
    );
  }

  Widget _buildQuickActionCard(
    BuildContext context, {
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    bool isDisabled = false,
  }) {
    const borderGray = Color(0xFFE2E8F0);
    const textPrimary = Color(0xFF1F2937);

    return GestureDetector(
      onTap: onTap,
      child: Opacity(
        opacity: isDisabled ? 0.6 : 1.0,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 20.0, horizontal: 8.0),
          decoration: BoxDecoration(
            color: isDisabled ? const Color(0xFFF8FAFC) : Colors.white,
            borderRadius: BorderRadius.circular(16.0),
            border: Border.all(color: borderGray, width: 1.0),
            boxShadow: [
              if (!isDisabled)
                BoxShadow(
                  color: Colors.black.withAlpha(6),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
            ],
          ),
          child: Column(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: isDisabled ? const Color(0xFFF1F5F9) : const Color(0xFFF8FAFC),
                  shape: BoxShape.circle,
                  border: Border.all(color: borderGray, width: 1.0),
                ),
                child: Icon(
                  isDisabled ? Icons.lock_outline_rounded : icon,
                  color: isDisabled ? const Color(0xFF94A3B8) : textPrimary,
                  size: 22,
                ),
              ),
              const SizedBox(height: 10.0),
              Text(
                label,
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: isDisabled ? const Color(0xFF94A3B8) : textPrimary,
                  height: 1.2,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String value,
  }) {
    const borderGray = Color(0xFFE2E8F0);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);

    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16.0),
        border: Border.all(color: borderGray, width: 1.0),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(6),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12.0),
              border: Border.all(color: borderGray, width: 1.0),
            ),
            child: Icon(
              icon,
              color: textPrimary,
              size: 22,
            ),
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
                    fontWeight: FontWeight.w600,
                    color: textSecondary,
                  ),
                ),
                const SizedBox(height: 2.0),
                Text(
                  value,
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: textPrimary,
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
