import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import '../services/localization_service.dart';
import '../utils/navigation_helper.dart';
import 'fuel_entry_details_screen.dart';

/// Driver Module - Fuel History Screen
///
/// Fetches live fuel entries from MongoDB (`GET /api/driver/fuel`).
/// Displays Date, Vehicle, Fuel Station, Amount, Liters, Receipt Thumbnail,
/// Approval Status badge (Green for Approved, Yellow for Pending, Red for Rejected),
/// and Rejection Reason if rejected. Displays empty state "No fuel records found." when empty.
class FuelHistoryScreen extends StatefulWidget {
  const FuelHistoryScreen({super.key});

  @override
  State<FuelHistoryScreen> createState() => _FuelHistoryScreenState();
}

class _FuelHistoryScreenState extends State<FuelHistoryScreen> {
  static List<dynamic>? _cachedFuelEntries;
  static bool? _cachedIsAssigned;

  bool _isLoading = true;
  List<dynamic> _fuelEntries = [];
  int _selectedFilterIndex = 0;
  final List<String> _filters = ['All', 'Approved', 'Pending', 'Rejected'];
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();
  String _searchQuery = '';
  bool _isAssigned = false;

  @override
  void initState() {
    super.initState();
    _searchFocusNode.addListener(() => setState(() {}));
    if (_cachedFuelEntries != null) {
      _fuelEntries = _cachedFuelEntries!;
      _isAssigned = _cachedIsAssigned ?? false;
      _isLoading = false;
    } else {
      _isLoading = true;
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted && _isLoading) setState(() => _isLoading = false);
      });
    }
    _fetchFuelRecords();
  }

  @override
  void dispose() {
    _searchFocusNode.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchFuelRecords() async {
    if (_cachedFuelEntries == null) {
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
        ApiService.getDriverFuelRecords().catchError((_) => null),
      ]);

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
            _cachedFuelEntries = data;
            _cachedIsAssigned = assigned;
            setState(() {
              _isAssigned = assigned;
              _fuelEntries = data;
              _isLoading = false;
            });
            return;
          }
        }
      }
    } catch (_) {}

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
    const primaryDark = Color(0xFF101C2C);
    const bgLight = Color(0xFFF7F8FA);
    const borderGray = Color(0xFFE2E8F0);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const primaryOrange = Color(0xFFFF7A1A);

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
                        _cachedFuelEntries = null;
                        _cachedIsAssigned = null;
                        ApiService.clearApiCache('/driver/fuel');
                        ApiService.clearApiCache('/driver/vehicle');
                        await Future.any([
                          _fetchFuelRecords(),
                          Future.delayed(const Duration(milliseconds: 500)),
                        ]);
                      },
                      color: primaryOrange,
                      child: SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(
                          parent: BouncingScrollPhysics(),
                        ),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20.0,
                          vertical: 16.0,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (!_isAssigned) ...[
                              Container(
                                width: double.infinity,
                                margin: const EdgeInsets.only(bottom: 16.0),
                                padding: const EdgeInsets.all(14.0),
                                decoration: BoxDecoration(
                                  color: const Color(
                                    0xFFEFF6FF,
                                  ), // Light blue box
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
                            // 1. Search Bar & Filter Bar Row
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
                                      borderRadius: BorderRadius.circular(12.0),
                                      border: Border.all(
                                        color: _searchFocusNode.hasFocus
                                            ? primaryOrange
                                            : borderGray,
                                        width: _searchFocusNode.hasFocus ? 1.8 : 1.0,
                                      ),
                                      boxShadow: _searchFocusNode.hasFocus
                                          ? [
                                              BoxShadow(
                                                color: primaryOrange.withAlpha(25),
                                                blurRadius: 6,
                                                offset: const Offset(0, 1),
                                              ),
                                            ]
                                          : null,
                                    ),
                                    child: Row(
                                      children: [
                                        Icon(
                                          Icons.search_rounded,
                                          color: _searchFocusNode.hasFocus
                                              ? primaryOrange
                                              : textSecondary,
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
                                              hintStyle: GoogleFonts.poppins(
                                                fontSize: 13.5,
                                                color: textSecondary,
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
                                              color: textSecondary,
                                            ),
                                          ),
                                      ],
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 10.0),
                                // Filter Bar dropdown button beside search bar
                                _buildFilterBar(
                                  context,
                                  primaryDark,
                                  primaryOrange,
                                  borderGray,
                                  textPrimary,
                                  textSecondary,
                                ),
                              ],
                            ),

                            const SizedBox(height: 20.0),

                            // 2. Fuel History List or Empty State
                            entriesToDisplay.isEmpty
                                ? Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.all(32),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(color: borderGray),
                                    ),
                                    child: Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        const Icon(
                                          Icons.local_gas_station_outlined,
                                          size: 64,
                                          color: textSecondary,
                                        ),
                                        const SizedBox(height: 16),
                                        Text(
                                          'No fuel records found'.tr,
                                          style: GoogleFonts.poppins(
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                            color: textPrimary,
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          'No fuel logs have been recorded for your profile.'
                                              .tr,
                                          textAlign: TextAlign.center,
                                          style: GoogleFonts.nunito(
                                            fontSize: 14,
                                            color: textSecondary,
                                          ),
                                        ),
                                      ],
                                    ),
                                  )
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

  Widget _buildHistoryCard(BuildContext context, Map<String, dynamic> entry) {
    const primaryDark = Color(0xFF101C2C);
    const borderGray = Color(0xFFE2E8F0);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const primaryOrange = Color(0xFFFF7A1A);

    final status = (entry['approvalStatus'] ?? 'Pending').toString();
    final isApproved = status == 'Approved';
    final isRejected = status == 'Rejected';

    Color statusBg = const Color(0xFFFEF3C7);
    Color statusText = const Color(0xFFD97706);

    if (isApproved) {
      statusBg = const Color(0xFFDCFCE7);
      statusText = const Color(0xFF15803D);
    } else if (isRejected) {
      statusBg = const Color(0xFFFEE2E2);
      statusText = const Color(0xFFDC2626);
    }

    final station = entry['fuelStation'] ?? entry['station'] ?? 'Fuel Station';
    final amount = entry['amount'] != null ? '₹ ${entry['amount']}' : '₹ 0.00';
    final liters = entry['liters'] != null ? '${entry['liters']} L' : '0.0 L';
    final vehicleId =
        entry['vehicleId'] ??
        (entry['vehicle'] is Map
            ? entry['vehicle']['vehicleNumber']
            : 'Vehicle');
    final dateStr = _formatDate(entry['createdAt']);
    final receiptImage = entry['receiptImage'] ?? entry['billUrl'] ?? '';
    final rejectionReason = entry['rejectionReason'] ?? '';

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => FuelEntryDetailsScreen(entryMap: entry),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(16.0),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16.0),
          border: Border.all(color: borderGray, width: 1.0),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(8),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row: Vehicle ID & Approval Status Badge
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.directions_bus_outlined,
                      size: 18,
                      color: primaryDark,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      vehicleId.toString(),
                      style: GoogleFonts.poppins(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: primaryDark,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: statusBg,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    status.toString().tr,
                    style: GoogleFonts.poppins(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: statusText,
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 8.0),

            // Station Name & Receipt Thumbnail Row
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Thumbnail preview if receipt exists
                if (receiptImage.toString().isNotEmpty) ...[
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      receiptImage.toString(),
                      width: 50,
                      height: 50,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        width: 50,
                        height: 50,
                        color: const Color(0xFFF1F5F9),
                        child: const Icon(
                          Icons.receipt_long_rounded,
                          color: textSecondary,
                          size: 24,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                ] else ...[
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(
                      Icons.local_gas_station_rounded,
                      color: primaryOrange,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 12),
                ],

                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${'Station'.tr}: ${station.toString()}',
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: textPrimary,
                        ),
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
                          Text(
                            '${'City'.tr}: ${entry['location'] ?? entry['city'] ?? 'N/A'}',
                            style: GoogleFonts.nunito(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: textPrimary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2.0),
                      Text(
                        dateStr,
                        style: GoogleFonts.nunito(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w600,
                          color: textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12.0),
            const Divider(color: borderGray, height: 1.0),
            const SizedBox(height: 12.0),

            // Details Grid (Quantity, Cost)
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'QUANTITY'.tr,
                        style: GoogleFonts.poppins(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w600,
                          color: textSecondary,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 2.0),
                      Text(
                        liters,
                        style: GoogleFonts.poppins(
                          fontSize: 14,
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
                        'TOTAL COST'.tr,
                        style: GoogleFonts.poppins(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w600,
                          color: textSecondary,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 2.0),
                      Text(
                        amount,
                        style: GoogleFonts.poppins(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: primaryOrange,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            // Display Rejection Reason if Rejected
            if (isRejected && rejectionReason.toString().isNotEmpty) ...[
              const SizedBox(height: 12.0),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10.0),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEE2E2),
                  borderRadius: BorderRadius.circular(10.0),
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
          ],
        ),
      ),
    );
  }

  Widget _buildFilterBar(
    BuildContext context,
    Color primaryDark,
    Color primaryOrange,
    Color borderGray,
    Color textPrimary,
    Color textSecondary,
  ) {
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
          borderRadius: BorderRadius.circular(12.0),
          border: Border.all(
            color: isFiltered ? primaryDark : borderGray,
            width: 1.0,
          ),
          boxShadow: [
            BoxShadow(
              color: isFiltered
                  ? primaryDark.withAlpha(30)
                  : Colors.black.withAlpha(6),
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
}
