import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'fuel_entry_details_screen.dart';

/// Representation of a Fuel Entry history item.
class FuelHistoryItem {
  final String id;
  final String station;
  final String dateTime;
  final String quantity;
  final String cost;
  final String paymentMode;
  final String status;
  final Color statusBg;
  final Color statusText;

  const FuelHistoryItem({
    required this.id,
    required this.station,
    required this.dateTime,
    required this.quantity,
    required this.cost,
    required this.paymentMode,
    required this.status,
    required this.statusBg,
    required this.statusText,
  });
}

/// Driver Module - Fuel History Screen
/// 
/// Replicates the Fleet Management design system with Dark Navy header (#101C2C),
/// search bar, filter chips, and card list of submitted fuel entries.
class FuelHistoryScreen extends StatefulWidget {
  const FuelHistoryScreen({super.key});

  @override
  State<FuelHistoryScreen> createState() => _FuelHistoryScreenState();
}

class _FuelHistoryScreenState extends State<FuelHistoryScreen> {
  int _selectedFilterIndex = 0;
  final List<String> _filters = ['All', 'Verified', 'Pending', 'Approved'];

  static const List<FuelHistoryItem> _allEntries = [
    FuelHistoryItem(
      id: 'FL-4089',
      station: 'HP Fuel Station, Khalapur',
      dateTime: 'Oct 24, 2023 • 10:30 AM',
      quantity: '45.0 L (Diesel)',
      cost: '₹ 4,250.00',
      paymentMode: 'Fleet Card',
      status: 'Verified',
      statusBg: Color(0xFFDCFCE7),
      statusText: Color(0xFF15803D),
    ),
    FuelHistoryItem(
      id: 'FL-4022',
      station: 'IOCL Terminal, Navi Mumbai',
      dateTime: 'Oct 20, 2023 • 04:15 PM',
      quantity: '50.0 L (Diesel)',
      cost: '₹ 4,700.00',
      paymentMode: 'Fleet Card',
      status: 'Verified',
      statusBg: Color(0xFFDCFCE7),
      statusText: Color(0xFF15803D),
    ),
    FuelHistoryItem(
      id: 'FL-3980',
      station: 'BPCL Expressway Hub, Panvel',
      dateTime: 'Oct 15, 2023 • 08:45 AM',
      quantity: '40.0 L (Diesel)',
      cost: '₹ 3,760.00',
      paymentMode: 'Cash',
      status: 'Approved',
      statusBg: Color(0xFFDBEAFE),
      statusText: Color(0xFF1D4ED8),
    ),
    FuelHistoryItem(
      id: 'FL-3912',
      station: 'Reliance Petroleum, Lonavala',
      dateTime: 'Oct 10, 2023 • 02:20 PM',
      quantity: '38.0 L (Diesel)',
      cost: '₹ 3,572.00',
      paymentMode: 'UPI / Online',
      status: 'Approved',
      statusBg: Color(0xFFDBEAFE),
      statusText: Color(0xFF1D4ED8),
    ),
  ];

  List<FuelHistoryItem> get _filteredEntries {
    if (_selectedFilterIndex == 0) return _allEntries;
    final filterName = _filters[_selectedFilterIndex];
    return _allEntries.where((e) => e.status == filterName).toList();
  }

  @override
  Widget build(BuildContext context) {
    const primaryDark = Color(0xFF101C2C);
    const bgLight = Color(0xFFF7F8FA);
    const borderGray = Color(0xFFE2E8F0);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);

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
          'Fuel History',
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
              // 1. Search Bar
              Container(
                height: 48,
                padding: const EdgeInsets.symmetric(horizontal: 14.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12.0),
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
                    const Icon(
                      Icons.search_rounded,
                      color: textSecondary,
                      size: 22,
                    ),
                    const SizedBox(width: 10.0),
                    Expanded(
                      child: TextField(
                        readOnly: true,
                        decoration: InputDecoration(
                          hintText: 'Search Fuel Station or ID...',
                          hintStyle: GoogleFonts.poppins(
                            fontSize: 13.5,
                            color: textSecondary,
                          ),
                          border: InputBorder.none,
                          isDense: true,
                          contentPadding: EdgeInsets.zero,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16.0),

              // 2. Filter Chips Horizontal Scroll
              SizedBox(
                height: 36,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  itemCount: _filters.length,
                  separatorBuilder: (context, index) => const SizedBox(width: 8.0),
                  itemBuilder: (context, index) {
                    final isSelected = _selectedFilterIndex == index;
                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          _selectedFilterIndex = index;
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? primaryDark : Colors.white,
                          borderRadius: BorderRadius.circular(20.0),
                          border: Border.all(
                            color: isSelected ? primaryDark : borderGray,
                            width: 1.0,
                          ),
                          boxShadow: isSelected
                              ? [
                                  BoxShadow(
                                    color: primaryDark.withAlpha(40),
                                    blurRadius: 6,
                                    offset: const Offset(0, 2),
                                  ),
                                ]
                              : null,
                        ),
                        child: Text(
                          _filters[index],
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                            color: isSelected ? Colors.white : textPrimary,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 20.0),

              // 3. Fuel History List
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _filteredEntries.length,
                separatorBuilder: (context, index) => const SizedBox(height: 14.0),
                itemBuilder: (context, index) {
                  final entry = _filteredEntries[index];
                  return _buildHistoryCard(context, entry);
                },
              ),

              const SizedBox(height: 24.0),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHistoryCard(BuildContext context, FuelHistoryItem entry) {
    const borderGray = Color(0xFFE2E8F0);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const primaryOrange = Color(0xFFFF7A1A);

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => FuelEntryDetailsScreen(entry: entry),
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
          // Header Row: Station Name & Status Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '#${entry.id}',
                style: GoogleFonts.poppins(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: primaryOrange,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: entry.statusBg,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  entry.status,
                  style: GoogleFonts.poppins(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: entry.statusText,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 6.0),

          Text(
            entry.station,
            style: GoogleFonts.poppins(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: textPrimary,
            ),
          ),
          const SizedBox(height: 2.0),
          Text(
            entry.dateTime,
            style: GoogleFonts.nunito(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: textSecondary,
            ),
          ),

          const SizedBox(height: 12.0),
          const Divider(color: borderGray, height: 1.0),
          const SizedBox(height: 12.0),

          // Details Grid (Quantity, Cost, Payment Mode)
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'QUANTITY',
                      style: GoogleFonts.poppins(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w600,
                        color: textSecondary,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 2.0),
                    Text(
                      entry.quantity,
                      style: GoogleFonts.poppins(
                        fontSize: 13,
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
                      'TOTAL COST',
                      style: GoogleFonts.poppins(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w600,
                        color: textSecondary,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 2.0),
                    Text(
                      entry.cost,
                      style: GoogleFonts.poppins(
                        fontSize: 13,
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
                      'PAYMENT',
                      style: GoogleFonts.poppins(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w600,
                        color: textSecondary,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 2.0),
                    Text(
                      entry.paymentMode,
                      style: GoogleFonts.nunito(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                        color: textSecondary,
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
  );
}
}
