import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'fuel_history_screen.dart';

/// Driver Module - Fuel Entry Details Screen
/// 
/// Displays complete details for a submitted fuel history entry:
/// - Dark Navy Header (#101C2C) with title 'Fuel Entry Details' & company logo
/// - Entry status card (Verified / Approved / Pending Manager Approval) with verification metadata
/// - Detailed metrics grid: Vehicle ID (TS09AB4589), Trip ID (TRP-9901), Driver (Satya Narayana),
///   Station, Fuel Type, Quantity, Cost, Payment Mode, and Odometer reading
/// - Interactive Uploaded Fuel Receipt Viewer Modal with realistic itemized fuel receipt, stamp, and download options
/// - Manager verification timeline log.
class FuelEntryDetailsScreen extends StatelessWidget {
  final FuelHistoryItem entry;

  const FuelEntryDetailsScreen({
    super.key,
    required this.entry,
  });

  void _openReceiptViewerModal(BuildContext context) {
    const primaryDark = Color(0xFF101C2C);
    const borderGray = Color(0xFFE2E8F0);
    const textSecondary = Color(0xFF6B7280);
    const primaryOrange = Color(0xFFFF7A1A);

    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (ctx) {
        return Dialog(
          backgroundColor: Colors.white,
          insetPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20.0),
          ),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 420),
            padding: const EdgeInsets.all(18.0),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Modal Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: primaryOrange.withAlpha(25),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(
                              Icons.receipt_long_rounded,
                              color: primaryOrange,
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            '${entry.id}_Receipt.jpg',
                            style: GoogleFonts.poppins(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: primaryDark,
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, size: 20, color: textSecondary),
                        onPressed: () => Navigator.of(ctx).pop(),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12.0),
                  const Divider(color: borderGray, height: 1.0),
                  const SizedBox(height: 16.0),

                  // Realistic Itemized Fuel Receipt Container
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16.0),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFAFAFA),
                      borderRadius: BorderRadius.circular(16.0),
                      border: Border.all(color: borderGray, width: 1.0),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(8),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        // Station Name & Logo
                        Container(
                          width: 48,
                          height: 48,
                          decoration: const BoxDecoration(
                            color: primaryDark,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.local_gas_station_rounded,
                            color: primaryOrange,
                            size: 26,
                          ),
                        ),
                        const SizedBox(height: 8.0),
                        Text(
                          entry.station.toUpperCase(),
                          textAlign: TextAlign.center,
                          style: GoogleFonts.poppins(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: primaryDark,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Text(
                          'Tax Invoice / Fuel Receipt',
                          style: GoogleFonts.nunito(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                            color: textSecondary,
                          ),
                        ),
                        const SizedBox(height: 12.0),
                        const Divider(color: borderGray, height: 1.0),
                        const SizedBox(height: 12.0),

                        // Itemized Details Table
                        _buildReceiptRow('Receipt No.', 'RCP-2023-${entry.id}'),
                        _buildReceiptRow('Date & Time', entry.dateTime),
                        _buildReceiptRow('Vehicle Reg', 'TS09AB4589'),
                        _buildReceiptRow('Trip ID', 'TRP-9901'),
                        _buildReceiptRow('Driver Name', 'Satya Narayana'),
                        _buildReceiptRow('Fuel Product', entry.quantity.contains('Diesel') ? 'High Speed Diesel (HSD)' : 'Super Petrol'),
                        _buildReceiptRow('Rate / Liter', '₹ 94.44 / L'),
                        _buildReceiptRow('Quantity', entry.quantity),
                        _buildReceiptRow('Payment Mode', '${entry.paymentMode} (**** 8842)'),

                        const SizedBox(height: 12.0),
                        const Divider(color: borderGray, height: 1.0),
                        const SizedBox(height: 12.0),

                        // Grand Total Row
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'TOTAL PAID',
                              style: GoogleFonts.poppins(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: primaryDark,
                                letterSpacing: 0.5,
                              ),
                            ),
                            Text(
                              entry.cost,
                              style: GoogleFonts.poppins(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: primaryOrange,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 16.0),

                        // Verification Stamp Badge
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFDCFCE7),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFF86EFAC), width: 1),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.verified_rounded,
                                color: Color(0xFF15803D),
                                size: 16,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'OFFICIALLY VERIFIED & APPROVED',
                                style: GoogleFonts.poppins(
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w800,
                                  color: const Color(0xFF15803D),
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20.0),

                  // Action Buttons (Download PDF & Close)
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Downloading ${entry.id}_Receipt.pdf...'),
                                duration: const Duration(seconds: 2),
                                behavior: SnackBarBehavior.floating,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                            );
                          },
                          icon: const Icon(Icons.download_rounded, size: 18),
                          label: const Text('Download PDF'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: primaryDark,
                            side: const BorderSide(color: borderGray, width: 1.2),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12.0),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 12.0),
                            textStyle: GoogleFonts.poppins(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12.0),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => Navigator.of(ctx).pop(),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: primaryOrange,
                            foregroundColor: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12.0),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 12.0),
                            textStyle: GoogleFonts.poppins(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          child: const Text('Close'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildReceiptRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.nunito(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF6B7280),
            ),
          ),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF1F2937),
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
    const borderGray = Color(0xFFE2E8F0);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const primaryOrange = Color(0xFFFF7A1A);

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
          '#${entry.id} Details',
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
              // 1. Status Banner Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16.0),
                  border: Border.all(color: borderGray, width: 1.0),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(6),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: entry.statusBg,
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                      child: Icon(
                        Icons.verified_rounded,
                        color: entry.statusText,
                        size: 26,
                      ),
                    ),
                    const SizedBox(width: 14.0),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'STATUS',
                                style: GoogleFonts.poppins(
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w600,
                                  color: textSecondary,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
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
                          const SizedBox(height: 2.0),
                          Text(
                            'Approved by Fleet Manager',
                            style: GoogleFonts.poppins(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: textPrimary,
                            ),
                          ),
                          Text(
                            entry.dateTime,
                            style: GoogleFonts.nunito(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20.0),

              // 2. Fuel Entry Details Grid Card
              Text(
                'Fuel Entry Summary',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: textPrimary,
                ),
              ),
              const SizedBox(height: 10.0),

              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16.0),
                  border: Border.all(color: borderGray, width: 1.0),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(6),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    _buildDetailRow('Fuel Station', entry.station, isBold: true),
                    const Divider(color: borderGray, height: 16),
                    _buildDetailRow('Vehicle Number', 'TS09AB4589'),
                    const SizedBox(height: 8),
                    _buildDetailRow('Current Trip ID', 'TRP-9901'),
                    const SizedBox(height: 8),
                    _buildDetailRow('Driver Name', 'Satya Narayana'),
                    const SizedBox(height: 8),
                    _buildDetailRow('Fuel Type', entry.quantity.contains('Diesel') ? 'Diesel' : 'Petrol'),
                    const SizedBox(height: 8),
                    _buildDetailRow('Quantity Filled', entry.quantity),
                    const SizedBox(height: 8),
                    _buildDetailRow('Total Cost', entry.cost, valueColor: primaryOrange, isBold: true),
                    const SizedBox(height: 8),
                    _buildDetailRow('Payment Mode', entry.paymentMode),
                    const SizedBox(height: 8),
                    _buildDetailRow('Odometer Reading', '1,42,850 km'),
                  ],
                ),
              ),

              const SizedBox(height: 20.0),

              // 3. Uploaded Receipt Document Card
              Text(
                'Attached Receipt',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: textPrimary,
                ),
              ),
              const SizedBox(height: 10.0),

              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16.0),
                  border: Border.all(color: borderGray, width: 1.0),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(6),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 50,
                          height: 50,
                          decoration: BoxDecoration(
                            color: const Color(0xFF101C2C),
                            borderRadius: BorderRadius.circular(10.0),
                          ),
                          child: const Icon(
                            Icons.receipt_long_rounded,
                            color: primaryOrange,
                            size: 26,
                          ),
                        ),
                        const SizedBox(width: 12.0),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${entry.id}_Receipt.jpg',
                                style: GoogleFonts.poppins(
                                  fontSize: 13.5,
                                  fontWeight: FontWeight.w700,
                                  color: textPrimary,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2.0),
                              Text(
                                '1.8 MB • Verified Document',
                                style: GoogleFonts.nunito(
                                  fontSize: 12,
                                  color: textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12.0),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => _openReceiptViewerModal(context),
                            icon: const Icon(Icons.visibility_outlined, size: 16),
                            label: const Text('View Receipt'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: primaryDark,
                              side: const BorderSide(color: borderGray, width: 1.0),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10.0),
                              ),
                              padding: const EdgeInsets.symmetric(vertical: 10.0),
                              textStyle: GoogleFonts.poppins(
                                fontSize: 12.5,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20.0),

              // 4. Verification Activity Timeline
              Text(
                'Approval Timeline',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: textPrimary,
                ),
              ),
              const SizedBox(height: 10.0),

              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16.0),
                  border: Border.all(color: borderGray, width: 1.0),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(6),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    _buildTimelineItem(
                      title: 'Submitted by Driver Satya Narayana',
                      time: entry.dateTime,
                      isCompleted: true,
                    ),
                    _buildTimelineItem(
                      title: 'OCR & Receipt Pre-Validated',
                      time: 'Auto-verified',
                      isCompleted: true,
                    ),
                    _buildTimelineItem(
                      title: 'Approved by Fleet Manager (Rajesh Sharma)',
                      time: 'Status: ${entry.status}',
                      isCompleted: true,
                      isLast: true,
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

  Widget _buildDetailRow(String label, String value, {Color? valueColor, bool isBold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.nunito(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF6B7280),
          ),
        ),
        Text(
          value,
          style: GoogleFonts.poppins(
            fontSize: 13.5,
            fontWeight: isBold ? FontWeight.w700 : FontWeight.w600,
            color: valueColor ?? const Color(0xFF1F2937),
          ),
        ),
      ],
    );
  }

  Widget _buildTimelineItem({
    required String title,
    required String time,
    required bool isCompleted,
    bool isLast = false,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 14,
              height: 14,
              decoration: BoxDecoration(
                color: isCompleted ? const Color(0xFF22C55E) : const Color(0xFFCBD5E1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.check,
                color: Colors.white,
                size: 9,
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 28,
                color: const Color(0xFFE2E8F0),
              ),
          ],
        ),
        const SizedBox(width: 12.0),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(bottom: 12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.poppins(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF1F2937),
                  ),
                ),
                Text(
                  time,
                  style: GoogleFonts.nunito(
                    fontSize: 11.5,
                    color: const Color(0xFF6B7280),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
