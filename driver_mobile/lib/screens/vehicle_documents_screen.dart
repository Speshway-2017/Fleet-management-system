import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Represents a Vehicle Document item data structure.
class VehicleDocumentItem {
  final String title;
  final IconData icon;
  final String expiryDate;
  final String status;
  final Color statusBg;
  final Color statusTextColor;

  const VehicleDocumentItem({
    required this.title,
    required this.icon,
    required this.expiryDate,
    required this.status,
    required this.statusBg,
    required this.statusTextColor,
  });
}

/// Driver Module - Vehicle Documents Screen
/// 
/// Displays all vehicle documents (RC, Insurance, PUC, Fitness, Permit, Road Tax)
/// in a clean, Material 3 card list with status badges, view, and download actions.
class VehicleDocumentsScreen extends StatelessWidget {
  const VehicleDocumentsScreen({super.key});

  static const List<VehicleDocumentItem> _documents = [
    VehicleDocumentItem(
      title: 'Registration Certificate (RC)',
      icon: Icons.card_membership_rounded,
      expiryDate: 'Expires: Oct 15, 2027',
      status: 'Valid',
      statusBg: Color(0xFFDCFCE7),
      statusTextColor: Color(0xFF15803D),
    ),
    VehicleDocumentItem(
      title: 'Insurance Certificate',
      icon: Icons.verified_user_outlined,
      expiryDate: 'Expires: Dec 20, 2026',
      status: 'Valid',
      statusBg: Color(0xFFDCFCE7),
      statusTextColor: Color(0xFF15803D),
    ),
    VehicleDocumentItem(
      title: 'Pollution Under Control (PUC)',
      icon: Icons.eco_outlined,
      expiryDate: 'Expires: Aug 10, 2026',
      status: 'Expiring Soon',
      statusBg: Color(0xFFFEF3C7),
      statusTextColor: Color(0xFFD97706),
    ),
    VehicleDocumentItem(
      title: 'Fitness Certificate',
      icon: Icons.health_and_safety_outlined,
      expiryDate: 'Expires: Nov 30, 2026',
      status: 'Valid',
      statusBg: Color(0xFFDCFCE7),
      statusTextColor: Color(0xFF15803D),
    ),
    VehicleDocumentItem(
      title: 'Permit Document',
      icon: Icons.assignment_outlined,
      expiryDate: 'Expires: Jan 15, 2027',
      status: 'Valid',
      statusBg: Color(0xFFDCFCE7),
      statusTextColor: Color(0xFF15803D),
    ),
    VehicleDocumentItem(
      title: 'Road Tax Receipt',
      icon: Icons.receipt_long_outlined,
      expiryDate: 'Expires: Mar 31, 2027',
      status: 'Valid',
      statusBg: Color(0xFFDCFCE7),
      statusTextColor: Color(0xFF15803D),
    ),
  ];

  void _showDocumentAction(BuildContext context, String action, String docTitle) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$action $docTitle...'),
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10.0),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    const primaryDark = Color(0xFF101C2C);
    const bgLight = Color(0xFFF7F8FA);
    const borderGray = Color(0xFFE5E7EB);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const secondaryOrange = Color(0xFFF97316);

    return Scaffold(
      backgroundColor: bgLight,
      appBar: AppBar(
        backgroundColor: primaryDark,
        elevation: 0,
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'Vehicle Documents',
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
              Text(
                'All Vehicle Documents',
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: textPrimary,
                ),
              ),
              const SizedBox(height: 6.0),
              Text(
                'View and download official compliance certificates and licenses.',
                style: GoogleFonts.nunito(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: textSecondary,
                ),
              ),
              const SizedBox(height: 16.0),

              // Documents List
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _documents.length,
                separatorBuilder: (context, index) => const SizedBox(height: 14.0),
                itemBuilder: (context, index) {
                  final doc = _documents[index];
                  return Container(
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
                        // Header Row: Icon, Title & Expiry, Status Badge
                        Row(
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: primaryDark,
                                borderRadius: BorderRadius.circular(12.0),
                              ),
                              child: Icon(
                                doc.icon,
                                color: Colors.white,
                                size: 22,
                              ),
                            ),
                            const SizedBox(width: 14.0),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    doc.title,
                                    style: GoogleFonts.poppins(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: textPrimary,
                                    ),
                                  ),
                                  const SizedBox(height: 2.0),
                                  Text(
                                    doc.expiryDate,
                                    style: GoogleFonts.nunito(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: doc.statusBg,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                doc.status,
                                style: GoogleFonts.poppins(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: doc.statusTextColor,
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 12.0),
                        const Divider(color: borderGray, height: 1.0),
                        const SizedBox(height: 12.0),

                        // Action Buttons Row: View & Download
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            OutlinedButton.icon(
                              onPressed: () => _showDocumentAction(context, 'Viewing', doc.title),
                              icon: const Icon(Icons.visibility_outlined, size: 16),
                              label: const Text('View'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: primaryDark,
                                side: const BorderSide(color: borderGray),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8.0),
                                ),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 14,
                                  vertical: 8,
                                ),
                                textStyle: GoogleFonts.poppins(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            const SizedBox(width: 10.0),
                            ElevatedButton.icon(
                              onPressed: () => _showDocumentAction(context, 'Downloading', doc.title),
                              icon: const Icon(Icons.file_download_outlined, size: 16),
                              label: const Text('Download'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: secondaryOrange,
                                foregroundColor: Colors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8.0),
                                ),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 14,
                                  vertical: 8,
                                ),
                                textStyle: GoogleFonts.poppins(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),

              const SizedBox(height: 24.0),
            ],
          ),
        ),
      ),
    );
  }
}
