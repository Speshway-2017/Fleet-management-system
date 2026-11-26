import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import '../services/localization_service.dart';
import '../utils/navigation_helper.dart';
import 'fuel_entry_details_screen.dart';

/// Driver Module - Fuel History Screen
///
/// Fetches live fuel entries from MongoDB (`GET /api/driver/fuel`).
/// Displays Executive Hero Card, Date, Vehicle, Fuel Station, Amount, Liters,
/// Receipt Thumbnail, Approval Status badge (Green for Approved, Amber for Pending, Red for Rejected),
/// and Rejection Reason if rejected.
class FuelHistoryScreen extends StatefulWidget {
  const FuelHistoryScreen({super.key});

  static List<dynamic>? cachedFuelEntries;
  static bool? cachedIsAssigned;

  static void clearCache() {
    cachedFuelEntries = null;
    cachedIsAssigned = null;
  }

  @override
  State<FuelHistoryScreen> createState() => _FuelHistoryScreenState();
}

class _FuelHistoryScreenState extends State<FuelHistoryScreen> {
  bool _isLoading = true;
  List<dynamic> _fuelEntries = [];
  int _selectedFilterIndex = 0;
  final List<String> _filters = ['All', 'Approved', 'Pending', 'Rejected'];
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();
  String _searchQuery = '';
  bool _isAssigned = false;
  Timer? _loadingTimer;

  @override
  void initState() {
    super.initState();
    _searchFocusNode.addListener(() => setState(() {}));
    if (FuelHistoryScreen.cachedFuelEntries != null) {
      _fuelEntries = FuelHistoryScreen.cachedFuelEntries!;
      _isAssigned = FuelHistoryScreen.cachedIsAssigned ?? false;
      _isLoading = false;
    } else {
      _isLoading = true;
      if (!ApiService.isTest) {
        _loadingTimer?.cancel();
        _loadingTimer = Timer(const Duration(milliseconds: 500), () {
          if (mounted && _isLoading) setState(() => _isLoading = false);
        });
      }
    }
    _fetchFuelRecords();
  }

  @override
  void dispose() {
    _loadingTimer?.cancel();
    _searchFocusNode.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchFuelRecords() async {
    if (FuelHistoryScreen.cachedFuelEntries == null) {
      setState(() {
        _isLoading = true;
      });
      if (!ApiService.isTest) {
        _loadingTimer?.cancel();
        _loadingTimer = Timer(const Duration(milliseconds: 500), () {
          if (mounted && _isLoading) setState(() => _isLoading = false);
        });
      }
    }

    try {
      final results = await Future.wait([
        ApiService.getAssignedVehicle().catchError((_) => null),
        ApiService.getDriverFuelRecords().catchError((_) => null),
      ]);

      _loadingTimer?.cancel();

      final vehRes = results[0];
      final res = results[1];

      bool assigned = false;
      if (vehRes != null && vehRes['success'] == true) {
        final vData = vehRes['data'];
        if (vData != null &&
            vData['assigned'] == true &&
            vData['vehicle'] != null) {
          assigned = true;
        }
      }

      if (mounted) {
        if (res != null && res['success'] == true) {
          final data = res['data'];
          if (data != null && data is List) {
            FuelHistoryScreen.cachedFuelEntries = data;
            FuelHistoryScreen.cachedIsAssigned = assigned;
            setState(() {
              _isAssigned = assigned;
              _fuelEntries = data;
              _isLoading = false;
            });
            return;
          }
        }
      }
    } catch (_) {
      _loadingTimer?.cancel();
    }

    if (mounted) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  List<dynamic> get _filteredEntries {
    var list = _fuelEntries;
    if (_selectedFilterIndex != 0) {
      final filterName = _filters[_selectedFilterIndex];
      list = list.where((e) {
        final status = (e['approvalStatus'] ?? 'Pending').toString();
        return status.toLowerCase() == filterName.toLowerCase();
      }).toList();
    }
    if (_searchQuery.trim().isNotEmpty) {
      final q = _searchQuery.trim().toLowerCase();
      list = list.where((e) {
        final station = (e['fuelStation'] ?? e['station'] ?? '')
            .toString()
            .toLowerCase();
        final vehicle =
            (e['vehicleId'] ??
                    (e['vehicle'] is Map
                        ? e['vehicle']['vehicleNumber']
                        : '') ??
                    '')
                .toString()
                .toLowerCase();
        final city = (e['purchaseLocation'] ?? e['city'] ?? '')
            .toString()
            .toLowerCase();
        final amount = (e['amount'] ?? '').toString().toLowerCase();
        final liters = (e['liters'] ?? '').toString().toLowerCase();
        final reason = (e['rejectionReason'] ?? '').toString().toLowerCase();
        return station.contains(q) ||
            vehicle.contains(q) ||
            city.contains(q) ||
            amount.contains(q) ||
            liters.contains(q) ||
            reason.contains(q);
      }).toList();
    }
    return list;
  }

  double get _totalLiters {
    double total = 0.0;
    for (final e in _fuelEntries) {
      if (e is Map) {
        final l = double.tryParse((e['liters'] ?? '').toString());
        if (l != null) total += l;
      }
    }
    return total;
  }

  double get _totalSpent {
    double total = 0.0;
    for (final e in _fuelEntries) {
      if (e is Map) {
        final a = double.tryParse(
          (e['amount'] ?? '')
              .toString()
              .replaceAll('₹', '')
              .replaceAll(',', '')
              .trim(),
        );
        if (a != null) total += a;
      }
    }
    return total;
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
      final hour = dt.hour > 12 ? dt.hour - 12 : (dt.hour == 0 ? 12 : dt.hour);
      final ampm = dt.hour >= 12 ? 'PM' : 'AM';
      final min = dt.minute.toString().padLeft(2, '0');
      return '${months[dt.month - 1]} ${dt.day}, ${dt.year} • $hour:$min $ampm';
    } catch (_) {
      return dateStr.toString();
    }
  }

  @override
  Widget build(BuildContext context) {
    const primaryDark = Color(0xFF0B1626);
    const bgLight = Color(0xFFF4F6FA);
    const borderGray = Color(0xFFE2E8F0);
    const primaryOrange = Color(0xFFEA580C);

    final entriesToDisplay = _filteredEntries;

    return ValueListenableBuilder<String>(
      valueListenable: LocalizationService.currentLanguageNotifier,
      builder: (context, currentLang, _) {
        return PopScope(
          canPop: false,
          onPopInvokedWithResult: (didPop, result) {
            if (!didPop) SafeNavigation.pop(context, fallbackTab: 1);
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
                onPressed: () => SafeNavigation.pop(context, fallbackTab: 1),
              ),
              title: Text(
                'Fuel History'.tr,
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
                        valueColor: AlwaysStoppedAnimation<Color>(
                          primaryOrange,
                        ),
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: () async {
                        FuelHistoryScreen.clearCache();
                        ApiService.clearApiCache('/driver/fuel');
                        ApiService.clearApiCache('/driver/vehicle');
                        await Future.any([
                          _fetchFuelRecords(),
                          Future.delayed(const Duration(milliseconds: 600)),
                        ]);
                      },
                      color: primaryOrange,
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
                            // 1. Executive Hero Summary Card
                            _buildExecutiveHeroBanner(),
                            const SizedBox(height: 14.0),

                            // 2. Unassigned Vehicle Notice
                            if (!_isAssigned) ...[
                              Container(
                                width: double.infinity,
                                margin: const EdgeInsets.only(bottom: 14.0),
                                padding: const EdgeInsets.all(14.0),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFEFF6FF),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: const Color(0xFFBFDBFE),
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
                                        'No vehicle is currently assigned. You can view your previous records, but new fuel entries will be available once a vehicle is assigned.'
                                            .tr,
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
                            ],

                            // 3. Search Bar & Filter Bar Row
                            Row(
                              children: [
                                Expanded(
                                  child: Container(
                                    height: 48,
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 14.0,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(14.0),
                                      border: Border.all(
                                        color: _searchFocusNode.hasFocus
                                            ? primaryOrange
                                            : borderGray,
                                        width: _searchFocusNode.hasFocus ? 1.8 : 1.0,
                                      ),
                                      boxShadow: [
                                        BoxShadow(
                                          color: const Color(0xFF0F172A)
                                              .withValues(alpha: 0.035),
                                          blurRadius: 8,
                                          offset: const Offset(0, 2),
                                        ),
                                      ],
                                    ),
                                    child: Row(
                                      children: [
                                        Icon(
                                          Icons.search_rounded,
                                          color: _searchFocusNode.hasFocus
                                              ? primaryOrange
                                              : const Color(0xFF64748B),
                                          size: 20,
                                        ),
                                        const SizedBox(width: 10.0),
                                        Expanded(
                                          child: TextField(
                                            controller: _searchController,
                                            focusNode: _searchFocusNode,
                                            onChanged: (val) {
                                              setState(() {
                                                _searchQuery = val;
                                              });
                                            },
                                            decoration: InputDecoration(
                                              hintText:
                                                  'Search Station or Vehicle...'
                                                      .tr,
                                              hintStyle: GoogleFonts.nunito(
                                                fontSize: 13.5,
                                                color: const Color(0xFF94A3B8),
                                              ),
                                              border: InputBorder.none,
                                              enabledBorder: InputBorder.none,
                                              focusedBorder: InputBorder.none,
                                              isDense: true,
                                              contentPadding: EdgeInsets.zero,
                                            ),
                                          ),
                                        ),
                                        if (_searchQuery.isNotEmpty)
                                          GestureDetector(
                                            onTap: () {
                                              setState(() {
                                                _searchController.clear();
                                                _searchQuery = '';
                                              });
                                            },
                                            child: const Icon(
                                              Icons.close_rounded,
                                              size: 18,
                                              color: Color(0xFF64748B),
                                            ),
                                          ),
                                      ],
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 10.0),
                                // Filter dropdown beside search bar
                                _buildFilterBar(context),
                              ],
                            ),

                            // Filter / Search Match Count
                            if (_searchQuery.trim().isNotEmpty ||
                                _selectedFilterIndex != 0) ...[
                              const SizedBox(height: 8.0),
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                child: Text(
                                  'Showing ${entriesToDisplay.length} of ${_fuelEntries.length} fuel logs',
                                  style: GoogleFonts.nunito(
                                    color: const Color(0xFF64748B),
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],

                            const SizedBox(height: 14.0),

                            // 4. Fuel History List or Empty State
                            entriesToDisplay.isEmpty
                                ? _buildEmptyState()
                                : ListView.separated(
                                    shrinkWrap: true,
                                    physics:
                                        const NeverScrollableScrollPhysics(),
                                    itemCount: entriesToDisplay.length,
                                    separatorBuilder: (context, index) =>
                                        const SizedBox(height: 14.0),
                                    itemBuilder: (context, index) {
                                      final entry = Map<String, dynamic>.from(
                                        entriesToDisplay[index],
                                      );
                                      return _buildHistoryCard(context, entry);
                                    },
                                  ),

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
  // EXECUTIVE HERO SUMMARY BANNER
  // ---------------------------------------------------------------------------
  Widget _buildExecutiveHeroBanner() {
    final totalLogs = _fuelEntries.length;
    final totalLitersVal = _totalLiters;
    final totalSpentVal = _totalSpent;

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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
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
                            Icons.local_gas_station_rounded,
                            color: Color(0xFFFB923C),
                            size: 13,
                          ),
                          const SizedBox(width: 5),
                          Text(
                            'FUEL LOGS ARCHIVE',
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
                    const SizedBox(height: 8),
                    Text(
                      'Fuel Expense Records',
                      style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 20,
                        letterSpacing: -0.3,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'All recorded refills, costs & manager approvals',
                      style: GoogleFonts.nunito(
                        color: const Color(0xFF94A3B8),
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFFF6A00), Color(0xFFEA580C)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFEA580C).withValues(alpha: 0.35),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.local_gas_station_rounded,
                  color: Colors.white,
                  size: 26,
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

          // 3-Metric Indicator Ribbon
          Row(
            children: [
              Expanded(
                child: _buildHeroStatTile(
                  icon: Icons.receipt_long_rounded,
                  iconColor: const Color(0xFF34D399),
                  label: 'Total Logs',
                  value: '$totalLogs',
                  bgColor: const Color(0xFF064E3B).withValues(alpha: 0.4),
                  borderColor: const Color(0xFF059669).withValues(alpha: 0.3),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildHeroStatTile(
                  icon: Icons.water_drop_rounded,
                  iconColor: const Color(0xFF38BDF8),
                  label: 'Total Liters',
                  value: '${totalLitersVal.toStringAsFixed(0)} L',
                  bgColor: const Color(0xFF0C4A6E).withValues(alpha: 0.4),
                  borderColor: const Color(0xFF0284C7).withValues(alpha: 0.3),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildHeroStatTile(
                  icon: Icons.currency_rupee_rounded,
                  iconColor: const Color(0xFFFBBF24),
                  label: 'Total Spent',
                  value: '₹ ${totalSpentVal.toStringAsFixed(0)}',
                  bgColor: const Color(0xFF78350F).withValues(alpha: 0.35),
                  borderColor: const Color(0xFFD97706).withValues(alpha: 0.3),
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
              Icon(icon, color: iconColor, size: 12),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  label,
                  style: GoogleFonts.nunito(
                    color: const Color(0xFFCBD5E1),
                    fontSize: 9.5,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 3),
          Text(
            value,
            style: GoogleFonts.poppins(
              color: Colors.white,
              fontWeight: FontWeight.w700,
              fontSize: 12,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // COLOR-CODED PREMIUM FUEL CARD
  // ---------------------------------------------------------------------------
  Widget _buildHistoryCard(BuildContext context, Map<String, dynamic> entry) {
    const primaryDark = Color(0xFF0B1626);
    const borderGray = Color(0xFFE2E8F0);
    const textPrimary = Color(0xFF0F172A);
    const textSecondary = Color(0xFF64748B);
    const primaryOrange = Color(0xFFEA580C);

    final status = (entry['approvalStatus'] ?? 'Pending').toString();
    final isApproved = status == 'Approved';
    final isRejected = status == 'Rejected';

    Color statusBg = const Color(0xFFFFFBEB);
    Color statusBorder = const Color(0xFFFDE68A);
    Color statusText = const Color(0xFFD97706);
    IconData statusIcon = Icons.hourglass_top_rounded;

    if (isApproved) {
      statusBg = const Color(0xFFECFDF5);
      statusBorder = const Color(0xFFA7F3D0);
      statusText = const Color(0xFF059669);
      statusIcon = Icons.check_circle_rounded;
    } else if (isRejected) {
      statusBg = const Color(0xFFFEF2F2);
      statusBorder = const Color(0xFFFECACA);
      statusText = const Color(0xFFDC2626);
      statusIcon = Icons.cancel_rounded;
    }

    final station = (entry['fuelStation'] ?? entry['station'] ?? 'Fuel Station').toString();
    final amount = entry['amount'] != null ? '₹ ${entry['amount']}' : '₹ 0.00';
    final liters = entry['liters'] != null ? '${entry['liters']} L' : '0.0 L';
    final vehicleId =
        entry['vehicleId'] ??
        (entry['vehicle'] is Map
            ? entry['vehicle']['vehicleNumber']
            : 'Assigned Vehicle');
    final dateStr = _formatDate(entry['createdAt']);
    final receiptImage = entry['receiptImage'] ?? entry['billUrl'] ?? '';
    final rejectionReason = entry['rejectionReason'] ?? '';
    final odometer = entry['odometer'] != null ? '${entry['odometer']} km' : null;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18.0),
        border: Border.all(color: borderGray, width: 1.0),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withValues(alpha: 0.045),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(18.0),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          borderRadius: BorderRadius.circular(18.0),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => FuelEntryDetailsScreen(entryMap: entry),
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header Row: Vehicle Tile + Status Badge
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      child: Row(
                        children: [
                          Container(
                            width: 38,
                            height: 38,
                            decoration: BoxDecoration(
                              color: const Color(0xFFEFF6FF),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: const Color(0xFFBFDBFE),
                              ),
                            ),
                            child: const Icon(
                              Icons.local_shipping_rounded,
                              size: 19,
                              color: Color(0xFF2563EB),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'VEHICLE',
                                  style: GoogleFonts.poppins(
                                    fontSize: 9.0,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 0.5,
                                    color: const Color(0xFF2563EB),
                                  ),
                                ),
                                Text(
                                  vehicleId.toString(),
                                  style: GoogleFonts.poppins(
                                    fontSize: 14.5,
                                    fontWeight: FontWeight.w800,
                                    color: primaryDark,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4.5,
                      ),
                      decoration: BoxDecoration(
                        color: statusBg,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: statusBorder),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(statusIcon, color: statusText, size: 13),
                          const SizedBox(width: 4),
                          Text(
                            status.toString().tr,
                            style: GoogleFonts.poppins(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: statusText,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 12.0),

                // Station, City & Date Info Box
                Container(
                  padding: const EdgeInsets.all(12.0),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(14.0),
                    border: Border.all(color: const Color(0xFFE8EDF5)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Thumbnail preview if receipt exists
                      if (receiptImage.toString().isNotEmpty) ...[
                        ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: Image.network(
                            receiptImage.toString(),
                            width: 52,
                            height: 52,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                Container(
                              width: 52,
                              height: 52,
                              decoration: BoxDecoration(
                                color: const Color(0xFFFFF7ED),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: const Color(0xFFFED7AA),
                                ),
                              ),
                              child: const Icon(
                                Icons.receipt_long_rounded,
                                color: primaryOrange,
                                size: 24,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                      ] else ...[
                        Container(
                          width: 52,
                          height: 52,
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF7ED),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: const Color(0xFFFED7AA),
                            ),
                          ),
                          child: const Icon(
                            Icons.local_gas_station_rounded,
                            color: primaryOrange,
                            size: 26,
                          ),
                        ),
                        const SizedBox(width: 12),
                      ],

                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${'Station'.tr}: $station',
                              style: GoogleFonts.poppins(
                                fontSize: 13.5,
                                fontWeight: FontWeight.w700,
                                color: textPrimary,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 3.0),
                            Row(
                              children: [
                                const Icon(
                                  Icons.location_on_rounded,
                                  size: 13,
                                  color: primaryOrange,
                                ),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    '${'City'.tr}: ${entry['location'] ?? entry['city'] ?? 'N/A'}',
                                    style: GoogleFonts.nunito(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      color: const Color(0xFF475569),
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 3.0),
                            Row(
                              children: [
                                const Icon(
                                  Icons.access_time_rounded,
                                  size: 12,
                                  color: Color(0xFF94A3B8),
                                ),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    dateStr,
                                    style: GoogleFonts.nunito(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: textSecondary,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12.0),

                // Color-Coded KPI Metric Cards
                Row(
                  children: [
                    // Quantity: Sapphire Blue
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          vertical: 8,
                          horizontal: 8,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEFF6FF),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFBFDBFE)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(
                                  Icons.water_drop_rounded,
                                  color: Color(0xFF2563EB),
                                  size: 12,
                                ),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    'QUANTITY'.tr,
                                    style: GoogleFonts.nunito(
                                      color: const Color(0xFF2563EB),
                                      fontSize: 9.5,
                                      fontWeight: FontWeight.w700,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 3),
                            Text(
                              liters,
                              style: GoogleFonts.poppins(
                                color: const Color(0xFF1E3A8A),
                                fontWeight: FontWeight.w700,
                                fontSize: 13,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),

                    // Total Cost: Fleet Orange
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          vertical: 8,
                          horizontal: 8,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFF7ED),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFFED7AA)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(
                                  Icons.currency_rupee_rounded,
                                  color: primaryOrange,
                                  size: 12,
                                ),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    'TOTAL COST'.tr,
                                    style: GoogleFonts.nunito(
                                      color: primaryOrange,
                                      fontSize: 9.5,
                                      fontWeight: FontWeight.w700,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 3),
                            Text(
                              amount,
                              style: GoogleFonts.poppins(
                                color: const Color(0xFF7C2D12),
                                fontWeight: FontWeight.w800,
                                fontSize: 14,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Odometer (if recorded): Royal Violet
                    if (odometer != null) ...[
                      const SizedBox(width: 8),
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            vertical: 8,
                            horizontal: 8,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF5F3FF),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: const Color(0xFFDDD6FE),
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(
                                    Icons.speed_rounded,
                                    color: Color(0xFF7C3AED),
                                    size: 12,
                                  ),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      'ODOMETER'.tr,
                                      style: GoogleFonts.nunito(
                                        color: const Color(0xFF7C3AED),
                                        fontSize: 9.5,
                                        fontWeight: FontWeight.w700,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 3),
                              Text(
                                odometer,
                                style: GoogleFonts.poppins(
                                  color: const Color(0xFF4C1D95),
                                  fontWeight: FontWeight.w700,
                                  fontSize: 12,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ],
                ),

                // Rejection Reason Alert if Rejected
                if (isRejected && rejectionReason.toString().isNotEmpty) ...[
                  const SizedBox(height: 12.0),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(10.0),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(12.0),
                      border: Border.all(color: const Color(0xFFFCA5A5)),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.error_outline_rounded,
                          color: Color(0xFFDC2626),
                          size: 18,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            '${'Rejection Reason'.tr}: ${rejectionReason.toString()}',
                            style: GoogleFonts.nunito(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFFB91C1C),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 12.0),

                // Bottom Action CTA
                Container(
                  padding: const EdgeInsets.symmetric(
                    vertical: 8.0,
                    horizontal: 10.0,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'View Full Details'.tr,
                        style: GoogleFonts.poppins(
                          color: primaryDark,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Icon(
                        Icons.arrow_forward_rounded,
                        color: Color(0xFF2563EB),
                        size: 14,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // FILTER BAR POPUP
  // ---------------------------------------------------------------------------
  Widget _buildFilterBar(BuildContext context) {
    const primaryDark = Color(0xFF0B1626);
    const borderGray = Color(0xFFE2E8F0);
    const textPrimary = Color(0xFF0F172A);
    const textSecondary = Color(0xFF64748B);
    const primaryOrange = Color(0xFFEA580C);

    final isFiltered = _selectedFilterIndex != 0;
    final currentFilter = _filters[_selectedFilterIndex];

    return PopupMenuButton<int>(
      initialValue: _selectedFilterIndex,
      tooltip: 'Filter Fuel Records',
      offset: const Offset(0, 52),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14.0),
        side: const BorderSide(color: Color(0xFFE2E8F0), width: 1.0),
      ),
      color: Colors.white,
      elevation: 6,
      onSelected: (int index) {
        setState(() {
          _selectedFilterIndex = index;
        });
      },
      itemBuilder: (BuildContext context) => <PopupMenuEntry<int>>[
        PopupMenuItem<int>(
          enabled: false,
          height: 32,
          child: Text(
            'FILTER BY STATUS'.tr,
            style: GoogleFonts.poppins(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: textSecondary,
              letterSpacing: 0.8,
            ),
          ),
        ),
        const PopupMenuDivider(height: 1),
        ...List.generate(_filters.length, (index) {
          final isSelected = _selectedFilterIndex == index;
          return PopupMenuItem<int>(
            value: index,
            height: 42,
            child: Row(
              children: [
                Icon(
                  isSelected
                      ? Icons.check_circle_rounded
                      : Icons.radio_button_unchecked_rounded,
                  color: isSelected ? primaryOrange : const Color(0xFF94A3B8),
                  size: 18,
                ),
                const SizedBox(width: 10),
                Text(
                  _filters[index].tr,
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected ? primaryDark : textPrimary,
                  ),
                ),
              ],
            ),
          );
        }),
      ],
      child: Container(
        height: 48,
        padding: const EdgeInsets.symmetric(horizontal: 12.0),
        decoration: BoxDecoration(
          color: isFiltered ? primaryDark : Colors.white,
          borderRadius: BorderRadius.circular(14.0),
          border: Border.all(
            color: isFiltered ? primaryDark : borderGray,
            width: 1.0,
          ),
          boxShadow: [
            BoxShadow(
              color: isFiltered
                  ? primaryDark.withValues(alpha: 0.15)
                  : const Color(0xFF0F172A).withValues(alpha: 0.035),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.tune_rounded,
              size: 18,
              color: isFiltered ? Colors.white : primaryOrange,
            ),
            const SizedBox(width: 6),
            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 80),
              child: Text(
                currentFilter.tr,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.poppins(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: isFiltered ? Colors.white : textPrimary,
                ),
              ),
            ),
            const SizedBox(width: 4),
            Icon(
              Icons.keyboard_arrow_down_rounded,
              size: 18,
              color: isFiltered ? Colors.white : textSecondary,
            ),
          ],
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // EMPTY STATE
  // ---------------------------------------------------------------------------
  Widget _buildEmptyState() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: const Color(0xFFFFF7ED),
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFFFED7AA), width: 2),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFEA580C).withValues(alpha: 0.12),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: const Icon(
              Icons.local_gas_station_rounded,
              size: 36,
              color: Color(0xFFEA580C),
            ),
          ),
          const SizedBox(height: 18),
          Text(
            'No fuel records found'.tr,
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _searchQuery.isNotEmpty || _selectedFilterIndex != 0
                ? 'No fuel records matched your active filter or search query.'
                : 'No fuel logs have been recorded for your profile.'.tr,
            textAlign: TextAlign.center,
            style: GoogleFonts.nunito(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: const Color(0xFF64748B),
              height: 1.4,
            ),
          ),
          if (_searchQuery.isNotEmpty || _selectedFilterIndex != 0) ...[
            const SizedBox(height: 16),
            TextButton.icon(
              onPressed: () {
                setState(() {
                  _searchController.clear();
                  _searchQuery = '';
                  _selectedFilterIndex = 0;
                });
              },
              icon: const Icon(Icons.clear_all_rounded, size: 16),
              label: const Text('Reset Filters'),
              style: TextButton.styleFrom(
                foregroundColor: const Color(0xFF2563EB),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
