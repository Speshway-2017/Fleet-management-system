import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/api_service.dart';

/// Represents a Vehicle Document item data structure.
class VehicleDocumentItem {
  final String title;
  final IconData icon;
  final String expiryDate;
  final String status;
  final Color statusBg;
  final Color statusTextColor;
  final String fileUrl;

  const VehicleDocumentItem({
    required this.title,
    required this.icon,
    required this.expiryDate,
    required this.status,
    required this.statusBg,
    required this.statusTextColor,
    this.fileUrl = '',
  });
}

/// Driver Module - Vehicle Documents Screen
/// 
/// Displays all vehicle documents (RC, Insurance, PUC, Fitness, Permit, Road Tax)
/// in a clean card list bound to MongoDB vehicle data.
class VehicleDocumentsScreen extends StatelessWidget {
  final Map<String, dynamic>? vehicle;

  const VehicleDocumentsScreen({
    super.key,
    this.vehicle,
  });

  List<VehicleDocumentItem> _buildDocumentList(Map<String, dynamic> veh) {
    final docsObj = veh['documents'] as Map<String, dynamic>? ?? {};
    final insuranceDetails = veh['insuranceDetails'] as Map<String, dynamic>? ?? {};
    final permitDetails = veh['permitDetails'] as Map<String, dynamic>? ?? {};

    String formatDate(dynamic dateStr) {
      if (dateStr == null || dateStr.toString().isEmpty) return 'No Expiry Set';
      try {
        final dt = DateTime.parse(dateStr.toString());
        final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return 'Expires: ${months[dt.month - 1]} ${dt.day}, ${dt.year}';
      } catch (_) {
        return 'Expires: ${dateStr.toString()}';
      }
    }

    Map<String, dynamic> calcStatus(dynamic dateStr) {
      if (dateStr == null || dateStr.toString().isEmpty) {
        return {
          'status': 'Not Set',
          'bg': const Color(0xFFF3F4F6),
          'text': const Color(0xFF6B7280),
        };
      }
      try {
        final dt = DateTime.parse(dateStr.toString());
        final now = DateTime.now();
        final diffDays = dt.difference(now).inDays;
        if (diffDays < 0) {
          return {
            'status': 'Expired',
            'bg': const Color(0xFFFEE2E2),
            'text': const Color(0xFFDC2626),
          };
        } else if (diffDays <= 30) {
          return {
            'status': 'Expiring Soon',
            'bg': const Color(0xFFFEF3C7),
            'text': const Color(0xFFD97706),
          };
        } else {
          return {
            'status': 'Valid',
            'bg': const Color(0xFFDCFCE7),
            'text': const Color(0xFF15803D),
          };
        }
      } catch (_) {
        return {
          'status': 'Active',
          'bg': const Color(0xFFDCFCE7),
          'text': const Color(0xFF15803D),
        };
      }
    }

    final rcDate = veh['rcExpiry'] ?? docsObj['rc']?['uploadDate'];
    final rcStatus = calcStatus(rcDate);

    final insDate = veh['insuranceExpiry'] ?? insuranceDetails['expiryDate'] ?? docsObj['insurance']?['uploadDate'];
    final insStatus = calcStatus(insDate);

    final pucDate = veh['pollutionExpiry'] ?? docsObj['puc']?['uploadDate'];
    final pucStatus = calcStatus(pucDate);

    final fitDate = veh['fitnessExpiry'] ?? docsObj['fitness']?['uploadDate'];
    final fitStatus = calcStatus(fitDate);

    final permitDate = veh['permitExpiry'] ?? permitDetails['expiryDate'] ?? docsObj['permit']?['uploadDate'];
    final permitStatus = calcStatus(permitDate);

    final taxDate = docsObj['roadTax']?['uploadDate'];
    final taxStatus = calcStatus(taxDate);

    return [
      VehicleDocumentItem(
        title: 'Registration Certificate (RC)',
        icon: Icons.card_membership_rounded,
        expiryDate: formatDate(rcDate),
        status: rcStatus['status'],
        statusBg: rcStatus['bg'],
        statusTextColor: rcStatus['text'],
        fileUrl: docsObj['rc']?['fileUrl'] ?? '',
      ),
      VehicleDocumentItem(
        title: 'Insurance Certificate',
        icon: Icons.verified_user_outlined,
        expiryDate: formatDate(insDate),
        status: insStatus['status'],
        statusBg: insStatus['bg'],
        statusTextColor: insStatus['text'],
        fileUrl: docsObj['insurance']?['fileUrl'] ?? '',
      ),
      VehicleDocumentItem(
        title: 'Pollution Under Control (PUC)',
        icon: Icons.eco_outlined,
        expiryDate: formatDate(pucDate),
        status: pucStatus['status'],
        statusBg: pucStatus['bg'],
        statusTextColor: pucStatus['text'],
        fileUrl: docsObj['puc']?['fileUrl'] ?? '',
      ),
      VehicleDocumentItem(
        title: 'Fitness Certificate',
        icon: Icons.health_and_safety_outlined,
        expiryDate: formatDate(fitDate),
        status: fitStatus['status'],
        statusBg: fitStatus['bg'],
        statusTextColor: fitStatus['text'],
        fileUrl: docsObj['fitness']?['fileUrl'] ?? '',
      ),
      VehicleDocumentItem(
        title: 'Permit Document',
        icon: Icons.assignment_outlined,
        expiryDate: formatDate(permitDate),
        status: permitStatus['status'],
        statusBg: permitStatus['bg'],
        statusTextColor: permitStatus['text'],
        fileUrl: docsObj['permit']?['fileUrl'] ?? '',
      ),
      VehicleDocumentItem(
        title: 'Road Tax Receipt',
        icon: Icons.receipt_long_outlined,
        expiryDate: formatDate(taxDate),
        status: taxStatus['status'],
        statusBg: taxStatus['bg'],
        statusTextColor: taxStatus['text'],
        fileUrl: docsObj['roadTax']?['fileUrl'] ?? '',
      ),
    ];
  }

  void _showDocumentAction(BuildContext context, String action, VehicleDocumentItem doc) async {
    final messenger = ScaffoldMessenger.of(context);
    final originalUrl = doc.fileUrl;
    debugPrint('[Vehicle Documents] Received action: $action, doc: ${doc.title}, Original URL: $originalUrl');
    
    if (originalUrl.isEmpty) {
      messenger.hideCurrentSnackBar();
      messenger.showSnackBar(
        SnackBar(
          content: Text('No document file uploaded for ${doc.title}'),
          duration: const Duration(seconds: 2),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10.0),
          ),
        ),
      );
      return;
    }

    // Show loading dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return const Center(
          child: Card(
            child: Padding(
              padding: EdgeInsets.all(20),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFF97316)),
                  ),
                  SizedBox(width: 16),
                  Text('Verifying document...'),
                ],
              ),
            ),
          ),
        );
      },
    );

    // Resolve relative path if needed
    String resolvedUrl = originalUrl;
    if (originalUrl.startsWith('/')) {
      try {
        final baseUrl = await ApiService.getBaseUrl();
        final serverUrl = baseUrl.replaceAll('/api', '');
        resolvedUrl = '$serverUrl$originalUrl';
      } catch (e) {
        debugPrint('[Vehicle Documents] Error resolving relative path: $e');
      }
    }

    debugPrint('[Vehicle Documents] Final Resolved URL: $resolvedUrl');

    bool isValid = false;
    // Check if it is a valid HTTP/HTTPS URL
    if (resolvedUrl.startsWith('http://') || resolvedUrl.startsWith('https://')) {
      // Check if it looks like a dummy/placeholder URL
      final lowerUrl = resolvedUrl.toLowerCase();
      if (!lowerUrl.contains('placeholder') && 
          !lowerUrl.contains('dummy') && 
          !lowerUrl.contains('example') && 
          !lowerUrl.contains('broken')) {
        isValid = true;
      }
    }

    // Dismiss loading dialog
    if (context.mounted) {
      Navigator.of(context).pop();
    }

    if (isValid) {
      try {
        final uri = Uri.parse(resolvedUrl);
        debugPrint('[Vehicle Documents] Launching URL: $resolvedUrl');
        final success = await launchUrl(uri, mode: LaunchMode.externalApplication);
        if (success) {
          return;
        }
        debugPrint('[Vehicle Documents] launchUrl returned false');
      } catch (launchError) {
        debugPrint('[Vehicle Documents] Error calling launchUrl: $launchError');
      }
    }

    // If not valid or launch fails
    if (context.mounted) {
      messenger.hideCurrentSnackBar();
      messenger.showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.error_outline_rounded, color: Colors.white),
              SizedBox(width: 8),
              Text('Document unavailable'),
            ],
          ),
          backgroundColor: const Color(0xFFDC2626), // red color for error
          duration: const Duration(seconds: 3),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10.0),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    const primaryDark = Color(0xFF101C2C);
    const bgLight = Color(0xFFF7F8FA);
    const borderGray = Color(0xFFE5E7EB);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const secondaryOrange = Color(0xFFF97316);

    if (vehicle == null) {
      return Scaffold(
        backgroundColor: bgLight,
        appBar: AppBar(
          backgroundColor: primaryDark,
          elevation: 0,
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
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.folder_off_outlined, size: 64, color: textSecondary),
                const SizedBox(height: 16),
                Text(
                  'No Vehicle Assigned',
                  style: GoogleFonts.poppins(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'No vehicle has been assigned yet. Vehicle-related features will become available once your manager assigns a vehicle.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.nunito(fontSize: 14, color: textSecondary),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final documents = _buildDocumentList(vehicle!);

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
                'View official compliance certificates and licenses for ${vehicle!['vehicleNumber'] ?? 'Assigned Vehicle'}.',
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
                itemCount: documents.length,
                separatorBuilder: (context, index) => const SizedBox(height: 14.0),
                itemBuilder: (context, index) {
                  final doc = documents[index];
                  return Container(
                    padding: const EdgeInsets.all(16.0),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16.0),
                      border: Border.all(color: borderGray, width: 1.0),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
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
                              onPressed: () => _showDocumentAction(context, 'Viewing', doc),
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
                              onPressed: () => _showDocumentAction(context, 'Downloading', doc),
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
