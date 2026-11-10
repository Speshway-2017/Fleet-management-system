import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../utils/navigation_helper.dart';
import '../services/localization_service.dart';

/// Driver Module - Fuel Entry Details Screen
class FuelEntryDetailsScreen extends StatelessWidget {
  final Map<String, dynamic>? entryMap;

  const FuelEntryDetailsScreen({
    super.key,
    this.entryMap,
  });

  Map<String, dynamic> get _data {
    return entryMap ?? {};
  }

  void _openReceiptViewerModal(BuildContext context, String imageUrl) {
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
                            'Fuel Receipt Image'.tr,
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

                  Container(
                    width: double.infinity,
                    constraints: const BoxConstraints(maxHeight: 380),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(16.0),
                      border: Border.all(color: borderGray),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: imageUrl.isNotEmpty
                        ? Image.network(
                            imageUrl,
                            fit: BoxFit.contain,
                            errorBuilder: (context, error, stackTrace) => Center(
                              child: Padding(
                                padding: const EdgeInsets.all(24.0),
                                child: Text('No receipt image available.'.tr),
                              ),
                            ),
                          )
                        : Center(
                            child: Padding(
                              padding: const EdgeInsets.all(24.0),
                              child: Text('No receipt uploaded.'.tr),
                            ),
                          ),
                  ),

                  const SizedBox(height: 20.0),

                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () => Navigator.of(ctx).pop(),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primaryOrange,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                        textStyle: GoogleFonts.poppins(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      child: Text('Close'.tr),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: LocalizationService.currentLanguageNotifier,
      builder: (context, _, _) {
        const primaryDark = Color(0xFF101C2C);
        const bgLight = Color(0xFFF7F8FA);
        const borderGray = Color(0xFFE2E8F0);
        const textPrimary = Color(0xFF1F2937);
        const textSecondary = Color(0xFF6B7280);
        const primaryOrange = Color(0xFFFF7A1A);

        final d = _data;
    final status = (d['approvalStatus'] ?? 'Pending').toString();
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

    final station = d['fuelStation'] ?? d['station'] ?? 'Fuel Station';
    final amount = d['amount'] != null ? (d['amount'].toString().startsWith('₹') ? d['amount'].toString() : '₹ ${d['amount']}') : '₹ 0.00';
    final liters = d['liters'] != null ? (d['liters'].toString().contains('L') ? d['liters'].toString() : '${d['liters']} L') : '0.0 L';
    final vehicleId = d['vehicleId'] ?? (d['vehicle'] is Map ? d['vehicle']['vehicleNumber'] : 'Assigned Vehicle');
    final driverName = d['driver'] ?? 'Driver';
    final receiptImage = d['receiptImage'] ?? d['billUrl'] ?? '';
    final rejectionReason = d['rejectionReason'] ?? '';
    final odometer = d['odometer'] != null ? '${d['odometer']} km' : 'N/A';

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
          'Fuel Entry Details'.tr,
          style: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        actions: const [],
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
                        color: statusBg,
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                      child: Icon(
                        isApproved
                            ? Icons.verified_rounded
                            : (isRejected ? Icons.cancel_rounded : Icons.hourglass_top_rounded),
                        color: statusText,
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
                                'STATUS'.tr,
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
                                  color: statusBg,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  status.tr,
                                  style: GoogleFonts.poppins(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: statusText,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2.0),
                          Text(
                            isApproved
                                ? 'Approved by Fleet Manager'.tr
                                : (isRejected ? 'Rejected by Fleet Manager'.tr : 'Pending Manager Verification'.tr),
                            style: GoogleFonts.poppins(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              if (isRejected && rejectionReason.toString().isNotEmpty) ...[
                const SizedBox(height: 12.0),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12.0),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEE2E2),
                    borderRadius: BorderRadius.circular(12.0),
                    border: Border.all(color: const Color(0xFFFCA5A5)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline_rounded, color: Color(0xFFDC2626), size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Rejection Reason:'.tr,
                              style: GoogleFonts.poppins(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF991B1B),
                              ),
                            ),
                            Text(
                              rejectionReason.toString(),
                              style: GoogleFonts.nunito(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: const Color(0xFFB91C1C),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 20.0),

              // 2. Fuel Entry Details Grid Card
              Text(
                'Fuel Entry Summary'.tr,
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
                    _buildDetailRow('Fuel Station'.tr, station.toString(), isBold: true),
                    const SizedBox(height: 8),
                    _buildDetailRow('Purchase Location (City)'.tr, (d['location'] ?? d['city'] ?? 'N/A').toString(), isBold: true),
                    const Divider(color: borderGray, height: 16),
                    _buildDetailRow('Vehicle Number'.tr, vehicleId.toString()),
                    const SizedBox(height: 8),
                    _buildDetailRow('Driver Name'.tr, driverName.toString()),
                    const SizedBox(height: 8),
                    _buildDetailRow('Quantity Filled'.tr, liters.toString()),
                    const SizedBox(height: 8),
                    _buildDetailRow('Total Cost'.tr, amount.toString(), valueColor: primaryOrange, isBold: true),
                    const SizedBox(height: 8),
                    _buildDetailRow('Odometer Reading'.tr, odometer),
                  ],
                ),
              ),

              const SizedBox(height: 20.0),

              // 3. Uploaded Receipt Document Card
              Text(
                'Attached Receipt'.tr,
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
                        receiptImage.toString().isNotEmpty
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(10.0),
                                child: Image.network(
                                  receiptImage.toString(),
                                  width: 50,
                                  height: 50,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) => Container(
                                    width: 50,
                                    height: 50,
                                    color: const Color(0xFF101C2C),
                                    child: const Icon(Icons.receipt_long_rounded, color: primaryOrange, size: 26),
                                  ),
                                ),
                              )
                            : Container(
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
                                receiptImage.toString().isNotEmpty ? 'Fuel Receipt Image'.tr : 'No Receipt Attached'.tr,
                                style: GoogleFonts.poppins(
                                  fontSize: 13.5,
                                  fontWeight: FontWeight.w700,
                                  color: textPrimary,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2.0),
                              Text(
                                receiptImage.toString().isNotEmpty ? 'Uploaded to Cloudinary'.tr : 'No receipt image uploaded'.tr,
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
                            onPressed: () => _openReceiptViewerModal(context, receiptImage.toString()),
                            icon: const Icon(Icons.visibility_outlined, size: 16),
                            label: Text('View Receipt'.tr),
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
}
