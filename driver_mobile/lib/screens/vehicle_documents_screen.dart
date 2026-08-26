import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../widgets/document_preview_dialog.dart';
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
/// in a clean card list bound to MongoDB vehicle data with live API sync.
class VehicleDocumentsScreen extends StatefulWidget {
  final Map<String, dynamic>? vehicle;

  const VehicleDocumentsScreen({
    super.key,
    this.vehicle,
  });

  @override
  State<VehicleDocumentsScreen> createState() => _VehicleDocumentsScreenState();
}

class _VehicleDocumentsScreenState extends State<VehicleDocumentsScreen> {
  Map<String, dynamic>? _vehicle;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _vehicle = widget.vehicle;
    _fetchAssignedVehicle();
  }

  Future<void> _fetchAssignedVehicle() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final res = await ApiService.getAssignedVehicle();
      debugPrint('[VehicleDocumentsScreen] API RESPONSE: $res');
      if (mounted && res != null && res['success'] == true) {
        final data = res['data'];
        if (data != null && data['vehicle'] is Map) {
          setState(() {
            _vehicle = Map<String, dynamic>.from(data['vehicle']);
            _isLoading = false;
          });
          debugPrint('[VehicleDocumentsScreen] Loaded vehicle documents: ${_vehicle?['documents']}');
          return;
        }
      }
    } catch (e) {
      debugPrint('[VehicleDocumentsScreen] Fetch vehicle error: $e');
    }

    if (mounted) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  String _sanitizeUrl(String rawUrl) {
    if (rawUrl.isEmpty) return '';
    var url = rawUrl.trim();
    final defaultHost = 'http://${ApiService.defaultLocalIp}:5000';

    url = url.replaceAll('http://localhost:5000', defaultHost);
    url = url.replaceAll('http://127.0.0.1:5000', defaultHost);

    if (url.startsWith('/')) {
      url = '$defaultHost$url';
    } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = '$defaultHost/$url';
    }
    return url;
  }

  String _extractDocUrl(Map<String, dynamic> veh, List<String> categoryKeys, List<String> fallbackKeys) {
    final docsObj = veh['documents'] is Map ? Map<String, dynamic>.from(veh['documents']) : <String, dynamic>{};

    for (final cat in categoryKeys) {
      final docItem = docsObj[cat];
      if (docItem != null) {
        if (docItem is String && docItem.trim().isNotEmpty) {
          return docItem.trim();
        } else if (docItem is Map) {
          final url = docItem['fileUrl'] ??
              docItem['url'] ??
              docItem['path'] ??
              docItem['documentUrl'] ??
              docItem['secure_url'] ??
              docItem['file'];
          if (url != null && url.toString().trim().isNotEmpty) {
            return url.toString().trim();
          }
        }
      }
    }

    for (final key in fallbackKeys) {
      final topVal = veh[key];
      if (topVal != null) {
        if (topVal is String && topVal.trim().isNotEmpty) {
          return topVal.trim();
        } else if (topVal is Map) {
          final url = topVal['fileUrl'] ?? topVal['url'] ?? topVal['secure_url'] ?? topVal['path'];
          if (url != null && url.toString().trim().isNotEmpty) {
            return url.toString().trim();
          }
        }
      }
    }

    return '';
  }

  List<VehicleDocumentItem> _buildDocumentList(Map<String, dynamic> veh) {
    final docsObj = veh['documents'] is Map ? Map<String, dynamic>.from(veh['documents']) : <String, dynamic>{};
    final insuranceDetails = veh['insuranceDetails'] is Map ? Map<String, dynamic>.from(veh['insuranceDetails']) : <String, dynamic>{};
    final permitDetails = veh['permitDetails'] is Map ? Map<String, dynamic>.from(veh['permitDetails']) : <String, dynamic>{};

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

    final rcDate = veh['rcExpiry'] ?? docsObj['rc']?['uploadDate'] ?? docsObj['rc']?['expiryDate'];
    final rcStatus = calcStatus(rcDate);
    final rcUrl = _extractDocUrl(veh, ['rc', 'registrationCertificate'], ['rcUrl', 'rcDocument', 'rcFile']);

    final insDate = veh['insuranceExpiry'] ?? insuranceDetails['expiryDate'] ?? docsObj['insurance']?['uploadDate'] ?? docsObj['insurance']?['expiryDate'];
    final insStatus = calcStatus(insDate);
    final insUrl = _extractDocUrl(veh, ['insurance', 'insuranceCertificate'], ['insuranceUrl', 'insuranceDocument', 'insuranceFile']);

    final pucDate = veh['pollutionExpiry'] ?? docsObj['puc']?['uploadDate'] ?? docsObj['puc']?['expiryDate'];
    final pucStatus = calcStatus(pucDate);
    final pucUrl = _extractDocUrl(veh, ['puc', 'pollution', 'pollutionUnderControl'], ['pollutionUrl', 'pucUrl', 'pucDocument']);

    final fitDate = veh['fitnessExpiry'] ?? docsObj['fitness']?['uploadDate'] ?? docsObj['fitness']?['expiryDate'];
    final fitStatus = calcStatus(fitDate);
    final fitUrl = _extractDocUrl(veh, ['fitness', 'fitnessCertificate'], ['fitnessUrl', 'fitnessDocument']);

    final permitDate = veh['permitExpiry'] ?? permitDetails['expiryDate'] ?? docsObj['permit']?['uploadDate'] ?? docsObj['permit']?['expiryDate'];
    final permitStatus = calcStatus(permitDate);
    final permitUrl = _extractDocUrl(veh, ['permit', 'permitDocument'], ['permitUrl', 'permitDocument']);

    final taxDate = docsObj['roadTax']?['uploadDate'] ?? docsObj['roadTax']?['expiryDate'];
    final taxStatus = calcStatus(taxDate);
    final taxUrl = _extractDocUrl(veh, ['roadTax', 'road_tax'], ['roadTaxUrl', 'roadTaxDocument']);

    return [
      VehicleDocumentItem(
        title: 'Registration Certificate (RC)',
        icon: Icons.card_membership_rounded,
        expiryDate: formatDate(rcDate),
        status: rcStatus['status'],
        statusBg: rcStatus['bg'],
        statusTextColor: rcStatus['text'],
        fileUrl: rcUrl,
      ),
      VehicleDocumentItem(
        title: 'Insurance Certificate',
        icon: Icons.verified_user_outlined,
        expiryDate: formatDate(insDate),
        status: insStatus['status'],
        statusBg: insStatus['bg'],
        statusTextColor: insStatus['text'],
        fileUrl: insUrl,
      ),
      VehicleDocumentItem(
        title: 'Pollution Under Control (PUC)',
        icon: Icons.eco_outlined,
        expiryDate: formatDate(pucDate),
        status: pucStatus['status'],
        statusBg: pucStatus['bg'],
        statusTextColor: pucStatus['text'],
        fileUrl: pucUrl,
      ),
      VehicleDocumentItem(
        title: 'Fitness Certificate',
        icon: Icons.health_and_safety_outlined,
        expiryDate: formatDate(fitDate),
        status: fitStatus['status'],
        statusBg: fitStatus['bg'],
        statusTextColor: fitStatus['text'],
        fileUrl: fitUrl,
      ),
      VehicleDocumentItem(
        title: 'Permit Document',
        icon: Icons.assignment_outlined,
        expiryDate: formatDate(permitDate),
        status: permitStatus['status'],
        statusBg: permitStatus['bg'],
        statusTextColor: permitStatus['text'],
        fileUrl: permitUrl,
      ),
      VehicleDocumentItem(
        title: 'Road Tax Receipt',
        icon: Icons.receipt_long_outlined,
        expiryDate: formatDate(taxDate),
        status: taxStatus['status'],
        statusBg: taxStatus['bg'],
        statusTextColor: taxStatus['text'],
        fileUrl: taxUrl,
      ),
    ];
  }

  void _showDocumentAction(BuildContext context, String action, VehicleDocumentItem doc) async {
    final messenger = ScaffoldMessenger.of(context);
    final sanitizedUrl = _sanitizeUrl(doc.fileUrl);

    debugPrint('[VehicleDocumentsScreen] [ACTION CLICKED] Action: $action | Document Type/Title: "${doc.title}" | Raw URL: "${doc.fileUrl}" | Sanitized URL: "$sanitizedUrl"');

    if (sanitizedUrl.isNotEmpty) {
      await DocumentPreviewDialog.open(
        context,
        title: doc.title,
        documentUrl: sanitizedUrl,
      );
      return;
    }

    messenger.hideCurrentSnackBar();
    messenger.showSnackBar(
      SnackBar(
        content: Text('No document file uploaded by manager for ${doc.title}'),
        duration: const Duration(seconds: 3),
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

    if (_isLoading && _vehicle == null) {
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
        body: const Center(
          child: CircularProgressIndicator(color: secondaryOrange),
        ),
      );
    }

    if (_vehicle == null) {
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

    final documents = _buildDocumentList(_vehicle!);

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
        child: RefreshIndicator(
          onRefresh: _fetchAssignedVehicle,
          color: secondaryOrange,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
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
                  'View official compliance certificates and licenses for ${_vehicle!['vehicleNumber'] ?? _vehicle!['registrationNumber'] ?? 'Assigned Vehicle'}.',
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
      ),
    );
  }
}
