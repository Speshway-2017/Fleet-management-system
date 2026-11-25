import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../widgets/document_preview_dialog.dart';
import '../services/api_service.dart';
import '../services/localization_service.dart';
import '../utils/navigation_helper.dart';

/// Represents a Vehicle Document item data structure.
class VehicleDocumentItem {
  final String title;
  final IconData icon;
  final Color iconColor;
  final Color iconBg;
  final Color iconBorder;
  final String expiryDate;
  final String status;
  final Color statusBg;
  final Color statusTextColor;
  final Color statusBorder;
  final String fileUrl;

  const VehicleDocumentItem({
    required this.title,
    required this.icon,
    required this.iconColor,
    required this.iconBg,
    required this.iconBorder,
    required this.expiryDate,
    required this.status,
    required this.statusBg,
    required this.statusTextColor,
    required this.statusBorder,
    this.fileUrl = '',
  });
}

/// Driver Module - Vehicle Documents Screen
///
/// Redesigned with the Color-Coded Premium Card Design System:
/// 1. Executive Navy Hero Banner with Compliance Overview & 3-metric KPI ribbon
/// 2. Color-Coded Document Cards (RC, Insurance, PUC, Fitness, Permit, Road Tax)
/// 3. Document preview status chip & action buttons (View & Download)
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
  static Map<String, dynamic>? _cachedVehicle;
  Map<String, dynamic>? _vehicle;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _vehicle = widget.vehicle ?? _cachedVehicle;
    _isLoading = _vehicle == null;
    if (_isLoading) {
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted && _isLoading) setState(() => _isLoading = false);
      });
    }
    _fetchAssignedVehicle();
  }

  Future<void> _fetchAssignedVehicle() async {
    if (_vehicle == null) {
      setState(() {
        _isLoading = true;
      });
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted && _isLoading) setState(() => _isLoading = false);
      });
    }

    try {
      final res = await ApiService.getAssignedVehicle();
      debugPrint('[VehicleDocumentsScreen] API RESPONSE: $res');
      if (mounted && res != null && res['success'] == true) {
        final data = res['data'];
        if (data != null && data['vehicle'] is Map) {
          final vehMap = Map<String, dynamic>.from(data['vehicle']);
          _cachedVehicle = vehMap;
          setState(() {
            _vehicle = vehMap;
            _isLoading = false;
          });
          debugPrint(
            '[VehicleDocumentsScreen] Loaded vehicle documents: ${_vehicle?['documents']}',
          );
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
    final defaultHost = ApiService.activeHost;

    url = url.replaceAll('http://localhost:5000', defaultHost);
    url = url.replaceAll('http://127.0.0.1:5000', defaultHost);
    url = url.replaceAll(RegExp(r'http://192\.168\.\d+\.\d+:5000'), defaultHost);
    url = url.replaceAll(RegExp(r'http://10\.\d+\.\d+\.\d+:5000'), defaultHost);

    if (url.startsWith('/')) {
      url = '$defaultHost$url';
    } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = '$defaultHost/$url';
    }
    return url;
  }

  String _extractDocUrl(
    Map<String, dynamic> veh,
    List<String> categoryKeys,
    List<String> fallbackKeys,
  ) {
    final docsObj = veh['documents'] is Map
        ? Map<String, dynamic>.from(veh['documents'])
        : <String, dynamic>{};

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
          final url = topVal['fileUrl'] ??
              topVal['url'] ??
              topVal['secure_url'] ??
              topVal['path'];
          if (url != null && url.toString().trim().isNotEmpty) {
            return url.toString().trim();
          }
        }
      }
    }

    return '';
  }

  List<VehicleDocumentItem> _buildDocumentList(Map<String, dynamic> veh) {
    final docsObj = veh['documents'] is Map
        ? Map<String, dynamic>.from(veh['documents'])
        : <String, dynamic>{};
    final insuranceDetails = veh['insuranceDetails'] is Map
        ? Map<String, dynamic>.from(veh['insuranceDetails'])
        : <String, dynamic>{};
    final permitDetails = veh['permitDetails'] is Map
        ? Map<String, dynamic>.from(veh['permitDetails'])
        : <String, dynamic>{};

    String formatDate(dynamic dateStr) {
      if (dateStr == null || dateStr.toString().isEmpty) return 'No Expiry Set';
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
          'border': const Color(0xFFE5E7EB),
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
            'border': const Color(0xFFFECACA),
          };
        } else if (diffDays <= 30) {
          return {
            'status': 'Expiring Soon',
            'bg': const Color(0xFFFEF3C7),
            'text': const Color(0xFFD97706),
            'border': const Color(0xFFFDE68A),
          };
        } else {
          return {
            'status': 'Valid',
            'bg': const Color(0xFFECFDF5),
            'text': const Color(0xFF059669),
            'border': const Color(0xFFA7F3D0),
          };
        }
      } catch (_) {
        return {
          'status': 'Active',
          'bg': const Color(0xFFECFDF5),
          'text': const Color(0xFF059669),
          'border': const Color(0xFFA7F3D0),
        };
      }
    }

    final rcDate = veh['rcExpiry'] ??
        docsObj['rc']?['uploadDate'] ??
        docsObj['rc']?['expiryDate'];
    final rcStatus = calcStatus(rcDate);
    final rcUrl = _extractDocUrl(
      veh,
      ['rc', 'registrationCertificate'],
      ['rcUrl', 'rcDocument', 'rcFile'],
    );

    final insDate = veh['insuranceExpiry'] ??
        insuranceDetails['expiryDate'] ??
        docsObj['insurance']?['uploadDate'] ??
        docsObj['insurance']?['expiryDate'];
    final insStatus = calcStatus(insDate);
    final insUrl = _extractDocUrl(
      veh,
      ['insurance', 'insuranceCertificate'],
      ['insuranceUrl', 'insuranceDocument', 'insuranceFile'],
    );

    final pucDate = veh['pollutionExpiry'] ??
        docsObj['puc']?['uploadDate'] ??
        docsObj['puc']?['expiryDate'];
    final pucStatus = calcStatus(pucDate);
    final pucUrl = _extractDocUrl(
      veh,
      ['puc', 'pollution', 'pollutionUnderControl'],
      ['pollutionUrl', 'pucUrl', 'pucDocument'],
    );

    final fitDate = veh['fitnessExpiry'] ??
        docsObj['fitness']?['uploadDate'] ??
        docsObj['fitness']?['expiryDate'];
    final fitStatus = calcStatus(fitDate);
    final fitUrl = _extractDocUrl(
      veh,
      ['fitness', 'fitnessCertificate'],
      ['fitnessUrl', 'fitnessDocument'],
    );

    final permitDate = veh['permitExpiry'] ??
        permitDetails['expiryDate'] ??
        docsObj['permit']?['uploadDate'] ??
        docsObj['permit']?['expiryDate'];
    final permitStatus = calcStatus(permitDate);
    final permitUrl = _extractDocUrl(
      veh,
      ['permit', 'permitDocument'],
      ['permitUrl', 'permitDocument'],
    );

    final taxDate = docsObj['roadTax']?['uploadDate'] ??
        docsObj['roadTax']?['expiryDate'];
    final taxStatus = calcStatus(taxDate);
    final taxUrl = _extractDocUrl(
      veh,
      ['roadTax', 'road_tax'],
      ['roadTaxUrl', 'roadTaxDocument'],
    );

    return [
      VehicleDocumentItem(
        title: 'Registration Certificate (RC)'.tr,
        icon: Icons.card_membership_rounded,
        iconColor: const Color(0xFF2563EB),
        iconBg: const Color(0xFFEFF6FF),
        iconBorder: const Color(0xFFBFDBFE),
        expiryDate: formatDate(rcDate),
        status: (rcStatus['status'] as String).tr,
        statusBg: rcStatus['bg'],
        statusTextColor: rcStatus['text'],
        statusBorder: rcStatus['border'],
        fileUrl: rcUrl,
      ),
      VehicleDocumentItem(
        title: 'Insurance Certificate'.tr,
        icon: Icons.verified_user_outlined,
        iconColor: const Color(0xFF059669),
        iconBg: const Color(0xFFECFDF5),
        iconBorder: const Color(0xFFA7F3D0),
        expiryDate: formatDate(insDate),
        status: (insStatus['status'] as String).tr,
        statusBg: insStatus['bg'],
        statusTextColor: insStatus['text'],
        statusBorder: insStatus['border'],
        fileUrl: insUrl,
      ),
      VehicleDocumentItem(
        title: 'Pollution Under Control (PUC)'.tr,
        icon: Icons.eco_outlined,
        iconColor: const Color(0xFF0D9488),
        iconBg: const Color(0xFFF0FDFA),
        iconBorder: const Color(0xFF99F6E4),
        expiryDate: formatDate(pucDate),
        status: (pucStatus['status'] as String).tr,
        statusBg: pucStatus['bg'],
        statusTextColor: pucStatus['text'],
        statusBorder: pucStatus['border'],
        fileUrl: pucUrl,
      ),
      VehicleDocumentItem(
        title: 'Fitness Certificate'.tr,
        icon: Icons.health_and_safety_outlined,
        iconColor: const Color(0xFF7C3AED),
        iconBg: const Color(0xFFFAF5FF),
        iconBorder: const Color(0xFFE9D5FF),
        expiryDate: formatDate(fitDate),
        status: (fitStatus['status'] as String).tr,
        statusBg: fitStatus['bg'],
        statusTextColor: fitStatus['text'],
        statusBorder: fitStatus['border'],
        fileUrl: fitUrl,
      ),
      VehicleDocumentItem(
        title: 'Permit Document'.tr,
        icon: Icons.assignment_outlined,
        iconColor: const Color(0xFFEA580C),
        iconBg: const Color(0xFFFFF7ED),
        iconBorder: const Color(0xFFFFEDD5),
        expiryDate: formatDate(permitDate),
        status: (permitStatus['status'] as String).tr,
        statusBg: permitStatus['bg'],
        statusTextColor: permitStatus['text'],
        statusBorder: permitStatus['border'],
        fileUrl: permitUrl,
      ),
      VehicleDocumentItem(
        title: 'Road Tax Receipt'.tr,
        icon: Icons.receipt_long_outlined,
        iconColor: const Color(0xFF4F46E5),
        iconBg: const Color(0xFFEEF2FF),
        iconBorder: const Color(0xFFC7D2FE),
        expiryDate: formatDate(taxDate),
        status: (taxStatus['status'] as String).tr,
        statusBg: taxStatus['bg'],
        statusTextColor: taxStatus['text'],
        statusBorder: taxStatus['border'],
        fileUrl: taxUrl,
      ),
    ];
  }

  void _showDocumentAction(
    BuildContext context,
    String action,
    VehicleDocumentItem doc,
  ) async {
    final messenger = ScaffoldMessenger.of(context);
    final sanitizedUrl = _sanitizeUrl(doc.fileUrl);

    debugPrint(
      '[VehicleDocumentsScreen] [ACTION CLICKED] Action: $action | Document Type/Title: "${doc.title}" | Raw URL: "${doc.fileUrl}" | Sanitized URL: "$sanitizedUrl"',
    );

    if (sanitizedUrl.isNotEmpty) {
      if (action == 'Downloading') {
        await DocumentPreviewDialog.launchDocumentUrl(
          context,
          sanitizedUrl,
          title: doc.title,
        );
      } else {
        await DocumentPreviewDialog.open(
          context,
          title: doc.title,
          documentUrl: sanitizedUrl,
        );
      }
      return;
    }

    messenger.hideCurrentSnackBar();
    messenger.showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(
              Icons.info_outline_rounded,
              color: Colors.white,
              size: 18,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'No document file uploaded by manager for ${doc.title}',
                style: GoogleFonts.nunito(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF0B1626),
        duration: const Duration(seconds: 3),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12.0),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // BUILD
  // ---------------------------------------------------------------------------
  @override
  Widget build(BuildContext context) {
    const primaryDark = Color(0xFF0B1626);
    const bgLight = Color(0xFFF4F6FA);
    const textPrimary = Color(0xFF0F172A);
    const textSecondary = Color(0xFF64748B);
    const secondaryOrange = Color(0xFFEA580C);

    Widget page;
    if (_isLoading && _vehicle == null) {
      page = Scaffold(
        backgroundColor: bgLight,
        appBar: AppBar(
          backgroundColor: primaryDark,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
            onPressed: () => SafeNavigation.pop(context, fallbackTab: 0),
          ),
          title: Text(
            'Vehicle Documents'.tr,
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
    } else if (_vehicle == null) {
      page = Scaffold(
        backgroundColor: bgLight,
        appBar: AppBar(
          backgroundColor: primaryDark,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
            onPressed: () => SafeNavigation.pop(context, fallbackTab: 0),
          ),
          title: Text(
            'Vehicle Documents'.tr,
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(28.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0B1626).withValues(alpha: 0.06),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.folder_off_outlined,
                    size: 40,
                    color: Color(0xFF64748B),
                  ),
                ),
                const SizedBox(height: 18),
                Text(
                  'No Vehicle Assigned'.tr,
                  style: GoogleFonts.poppins(
                    fontSize: 19,
                    fontWeight: FontWeight.w800,
                    color: textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'No vehicle has been assigned yet. Vehicle-related features will become available once your manager assigns a vehicle.'.tr,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.nunito(
                    fontSize: 13.5,
                    color: textSecondary,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    } else {
      final documents = _buildDocumentList(_vehicle!);

      page = Scaffold(
        backgroundColor: bgLight,
        appBar: AppBar(
          backgroundColor: primaryDark,
          elevation: 0,
          centerTitle: false,
          titleSpacing: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
            onPressed: () => SafeNavigation.pop(context, fallbackTab: 0),
          ),
          title: Text(
            'Vehicle Documents'.tr,
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
          actions: const [],
        ),
        body: SafeArea(
          child: RefreshIndicator(
            onRefresh: () async {
              _cachedVehicle = null;
              ApiService.clearApiCache('/driver/vehicle');
              await Future.any([
                _fetchAssignedVehicle(),
                Future.delayed(const Duration(milliseconds: 500)),
              ]);
            },
            color: secondaryOrange,
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
                  // 1. Executive Navy Hero Banner
                  _buildExecutiveHeroBanner(_vehicle!, documents),
                  const SizedBox(height: 16.0),

                  // 2. Document Cards List
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: documents.length,
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: 14.0),
                    itemBuilder: (context, index) {
                      final doc = documents[index];
                      return _buildDocumentCard(context, doc);
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

    return ValueListenableBuilder<String>(
      valueListenable: LocalizationService.currentLanguageNotifier,
      builder: (context, currentLang, _) {
        return PopScope(
          canPop: false,
          onPopInvokedWithResult: (didPop, result) {
            if (!didPop) SafeNavigation.pop(context, fallbackTab: 0);
          },
          child: page,
        );
      },
    );
  }

  // ---------------------------------------------------------------------------
  // 1. EXECUTIVE HERO BANNER
  // ---------------------------------------------------------------------------
  Widget _buildExecutiveHeroBanner(
    Map<String, dynamic> veh,
    List<VehicleDocumentItem> docs,
  ) {
    final vehiclePlate = veh['vehicleNumber'] ?? veh['registrationNumber'] ?? 'Assigned Vehicle';
    int validCount = 0;
    int reviewCount = 0;
    for (final d in docs) {
      final s = d.status.toLowerCase();
      if (s.contains('valid') || s.contains('active')) {
        validCount++;
      } else {
        reviewCount++;
      }
    }

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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
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
                            Icons.folder_shared_rounded,
                            color: Color(0xFFFB923C),
                            size: 13,
                          ),
                          const SizedBox(width: 5),
                          Text(
                            'COMPLIANCE & LEGAL',
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
                    const SizedBox(height: 10),
                    Text(
                      'All Vehicle Documents'.tr,
                      style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 20,
                        letterSpacing: -0.3,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '${'View official compliance certificates and licenses for'.tr} $vehiclePlate.',
                      style: GoogleFonts.nunito(
                        color: const Color(0xFF94A3B8),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        height: 1.35,
                      ),
                    ),
                  ],
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

          // 3-Metric KPI Ribbon
          Row(
            children: [
              Expanded(
                child: _buildHeroStatTile(
                  icon: Icons.description_rounded,
                  iconColor: const Color(0xFF38BDF8),
                  label: 'Compliance Docs',
                  value: '${docs.length} Items',
                  bgColor: const Color(0xFF0C4A6E).withValues(alpha: 0.4),
                  borderColor: const Color(0xFF0284C7).withValues(alpha: 0.3),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildHeroStatTile(
                  icon: Icons.verified_rounded,
                  iconColor: const Color(0xFF34D399),
                  label: 'Valid Certificates',
                  value: '$validCount Valid',
                  bgColor: const Color(0xFF064E3B).withValues(alpha: 0.4),
                  borderColor: const Color(0xFF059669).withValues(alpha: 0.3),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildHeroStatTile(
                  icon: Icons.warning_amber_rounded,
                  iconColor: const Color(0xFFFBBF24),
                  label: 'Needs Attention',
                  value: '$reviewCount Review',
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
              Icon(icon, color: iconColor, size: 13),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  label,
                  style: GoogleFonts.nunito(
                    color: const Color(0xFFCBD5E1),
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: GoogleFonts.poppins(
              color: Colors.white,
              fontWeight: FontWeight.w800,
              fontSize: 12.5,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 2. COLOR-CODED DOCUMENT CARD
  // ---------------------------------------------------------------------------
  Widget _buildDocumentCard(BuildContext context, VehicleDocumentItem doc) {
    const textPrimary = Color(0xFF0F172A);
    const textSecondary = Color(0xFF64748B);
    final hasFile = doc.fileUrl.isNotEmpty;

    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18.0),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Header Row: Squircle Icon, Title & Expiry, Status Badge
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: doc.iconBg,
                  borderRadius: BorderRadius.circular(14.0),
                  border: Border.all(color: doc.iconBorder),
                ),
                child: Icon(
                  doc.icon,
                  color: doc.iconColor,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12.0),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      doc.title,
                      style: GoogleFonts.poppins(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w700,
                        color: textPrimary,
                      ),
                    ),
                    const SizedBox(height: 3.0),
                    Row(
                      children: [
                        const Icon(
                          Icons.calendar_today_rounded,
                          size: 13,
                          color: textSecondary,
                        ),
                        const SizedBox(width: 5.0),
                        Expanded(
                          child: Text(
                            doc.expiryDate,
                            style: GoogleFonts.nunito(
                              fontSize: 12,
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
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: doc.statusBg,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: doc.statusBorder),
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

          // File Availability Indicator
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: hasFile ? const Color(0xFFF0FDF4) : const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: hasFile ? const Color(0xFFBBF7D0) : const Color(0xFFE2E8F0),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  hasFile
                      ? Icons.check_circle_outline_rounded
                      : Icons.pending_outlined,
                  size: 14,
                  color: hasFile ? const Color(0xFF16A34A) : const Color(0xFF94A3B8),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    hasFile
                        ? 'Official File Attached (PDF / Image Preview)'
                        : 'Awaiting Document Upload by Fleet Manager',
                    style: GoogleFonts.nunito(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: hasFile ? const Color(0xFF15803D) : const Color(0xFF64748B),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 14.0),
          const Divider(color: Color(0xFFE2E8F0), height: 1.0),
          const SizedBox(height: 14.0),

          // Action Buttons: Redesigned Full-Width 50/50 View & Download Row
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _showDocumentAction(context, 'Viewing', doc),
                  icon: Icon(
                    Icons.visibility_rounded,
                    size: 17,
                    color: hasFile ? doc.iconColor : const Color(0xFF64748B),
                  ),
                  label: Text(
                    'View'.tr,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  style: OutlinedButton.styleFrom(
                    foregroundColor:
                        hasFile ? doc.iconColor : const Color(0xFF64748B),
                    backgroundColor:
                        hasFile ? doc.iconBg : const Color(0xFFF8FAFC),
                    side: BorderSide(
                      color:
                          hasFile ? doc.iconBorder : const Color(0xFFE2E8F0),
                      width: 1.2,
                    ),
                    minimumSize: const Size(0, 44),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12.0),
                    ),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 10,
                    ),
                    textStyle: GoogleFonts.poppins(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.1,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10.0),
              Expanded(
                child: Container(
                  height: 44,
                  decoration: BoxDecoration(
                    gradient: hasFile
                        ? const LinearGradient(
                            colors: [
                              Color(0xFFEA580C),
                              Color(0xFFF97316),
                            ],
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                          )
                        : null,
                    color: hasFile ? null : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(12.0),
                    border: hasFile
                        ? null
                        : Border.all(
                            color: const Color(0xFFE2E8F0),
                            width: 1.2,
                          ),
                    boxShadow: hasFile
                        ? [
                            BoxShadow(
                              color: const Color(0xFFEA580C)
                                  .withValues(alpha: 0.25),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ]
                        : null,
                  ),
                  child: ElevatedButton.icon(
                    onPressed: () =>
                        _showDocumentAction(context, 'Downloading', doc),
                    icon: Icon(
                      Icons.download_rounded,
                      size: 17,
                      color:
                          hasFile ? Colors.white : const Color(0xFF64748B),
                    ),
                    label: Text(
                      'Download'.tr,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      foregroundColor:
                          hasFile ? Colors.white : const Color(0xFF64748B),
                      elevation: 0,
                      minimumSize: const Size(0, 44),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 10,
                      ),
                      textStyle: GoogleFonts.poppins(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.1,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
