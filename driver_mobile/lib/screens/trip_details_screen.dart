import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../constants/app_colors.dart';
import '../services/api_service.dart';
import '../services/localization_service.dart';
import '../services/socket_service.dart';
import '../utils/date_formatter.dart';
import '../utils/navigation_helper.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/document_preview_dialog.dart';
import '../widgets/upload_required_documents_dialog.dart';
import 'add_fuel_entry_screen.dart';
import 'invoice_screen.dart';

class TripDetailsScreen extends StatefulWidget {
  final String tripId;
  final Map<String, dynamic>? tripData;

  const TripDetailsScreen({
    super.key,
    required this.tripId,
    this.tripData,
  });

  @override
  State<TripDetailsScreen> createState() => _TripDetailsScreenState();
}

class _TripDetailsScreenState extends State<TripDetailsScreen> {
  static final Map<String, Map<String, dynamic>> _cachedTrips = {};

  bool _isLoading = false;
  bool _isSubmitting = false;
  Map<String, dynamic>? _trip;

  Future<void> printInvoice(Map<String, dynamic> trip, String invoiceNumber) async {
    final invoiceDateStr = DateTime.now().toString().split(' ')[0];
    final startLocation = trip['startLocation'] ?? trip['pickup'] ?? 'N/A';
    final endLocation = trip['endLocation'] ?? trip['destination'] ?? 'N/A';
    final departureTime = trip['departureTime'] != null ? formatIndianDateTime(trip['departureTime']) : 'N/A';
    final eta = trip['eta'] != null ? formatIndianDateTime(trip['eta']) : 'N/A';
    final distance = trip['estimatedDistance'] != null ? '${trip['estimatedDistance']} KM' : (trip['distance'] ?? 'N/A');
    final cargoType = trip['cargoType'] ?? 'General Cargo';
    final cargoWeight = trip['cargoWeight'] != null ? '${trip['cargoWeight']} kg' : 'N/A';
    final vehicleName = trip['vehicleName'] ?? 'N/A';
    final vehiclePlate = trip['vehiclePlate'] ?? 'N/A';
    final driverName = trip['driverName'] ?? 'N/A';
    final driverPhone = trip['driverPhone'] ?? 'N/A';
    final managerName = trip['manager'] != null ? trip['manager']['name'] ?? 'N/A' : 'N/A';

    final htmlContent = '''
<!DOCTYPE html>
<html>
<head>
  <title>Invoice $invoiceNumber</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 20px; line-height: 1.4; }
    .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); border-radius: 8px; background: #fff; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #1e3a8a; }
    .logo span { color: #2563eb; }
    .company-details { text-align: right; font-size: 12px; color: #666; }
    .invoice-meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 20px; font-size: 12px; }
    .meta-item { display: flex; flex-direction: column; }
    .meta-label { font-weight: bold; color: #4b5563; font-size: 10px; text-transform: uppercase; }
    .meta-val { font-weight: bold; color: #111827; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .section-title { font-size: 14px; font-weight: bold; color: #1e3a8a; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 10px; text-transform: uppercase; }
    .detail-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
    .detail-label { color: #666; }
    .detail-val { font-weight: bold; color: #333; }
    .footer { text-align: center; font-size: 11px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="invoice-box">
    <div class="header">
      <div class="logo">Speshway <span>Logistics</span></div>
      <div class="company-details">
        <strong>Speshway Logistics Pvt Ltd</strong><br>
        Plot 45, Industrial Depot, Sector 3<br>
        Pune, Maharashtra, 411018<br>
        Phone: +91 20 5566 7788 | billing@speshway.com
      </div>
    </div>
    
    <div class="invoice-meta">
      <div class="meta-item">
        <span class="meta-label">Invoice Number</span>
        <span class="meta-val">$invoiceNumber</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Invoice Date</span>
        <span class="meta-val">$invoiceDateStr</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Trip ID</span>
        <span class="meta-val">${trip['tripNumber']}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Status</span>
        <span class="meta-val">${trip['status']}</span>
      </div>
    </div>

    <div class="grid">
      <div>
        <div class="section-title">Trip Information</div>
        <div class="detail-row"><span class="detail-label">Pickup Location</span><span class="detail-val">$startLocation</span></div>
        <div class="detail-row"><span class="detail-label">Destination</span><span class="detail-val">$endLocation</span></div>
        <div class="detail-row"><span class="detail-label">Departure</span><span class="detail-val">$departureTime</span></div>
        <div class="detail-row"><span class="detail-label">ETA</span><span class="detail-val">$eta</span></div>
        <div class="detail-row"><span class="detail-label">Distance</span><span class="detail-val">$distance</span></div>
        <div class="detail-row"><span class="detail-label">Cargo Type</span><span class="detail-val">$cargoType</span></div>
        <div class="detail-row"><span class="detail-label">Cargo Weight</span><span class="detail-val">$cargoWeight</span></div>
      </div>
      
      <div>
        <div class="section-title">Asset & Driver Information</div>
        <div class="detail-row"><span class="detail-label">Vehicle Name</span><span class="detail-val">$vehicleName</span></div>
        <div class="detail-row"><span class="detail-label">Registration Number</span><span class="detail-val">$vehiclePlate</span></div>
        <div class="detail-row"><span class="detail-label">Driver Name</span><span class="detail-val">$driverName</span></div>
        <div class="detail-row"><span class="detail-label">Mobile Number</span><span class="detail-val">$driverPhone</span></div>
        <div class="detail-row"><span class="detail-label">Manager</span><span class="detail-val">$managerName</span></div>
      </div>
    </div>

    <div class="footer">
      Thank you for your business. This is an auto-generated electronic document.
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    }
  </script>
</body>
</html>
  ''';

    final bytes = utf8.encode(htmlContent);
    final base64Str = base64.encode(bytes);
    final urlStr = 'data:text/html;base64,$base64Str';
    final uri = Uri.parse(urlStr);
    
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        final textUri = Uri.dataFromString(htmlContent, mimeType: 'text/html', encoding: Encoding.getByName('utf-8'));
        await launchUrl(textUri);
      }
    } catch (_) {
      final textUri = Uri.dataFromString(htmlContent, mimeType: 'text/html', encoding: Encoding.getByName('utf-8'));
      await launchUrl(textUri);
    }
  }



  Widget _buildPremiumCard({
    required Widget child,
    EdgeInsetsGeometry padding = const EdgeInsets.all(18.0),
    Color backgroundColor = Colors.white,
    Color borderColor = const Color(0xFFE6ECF4),
  }) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20.0),
        border: Border.all(color: borderColor, width: 1.0),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withValues(alpha: 0.045),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
          BoxShadow(
            color: const Color(0xFF0F172A).withValues(alpha: 0.02),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: child,
    );
  }

  Widget _buildSectionHeader(
    IconData icon,
    String title, {
    Color accentColor = AppColors.secondary,
  }) {
    return Row(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: accentColor.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(10.0),
          ),
          child: Icon(icon, color: accentColor, size: 17),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            title,
            style: GoogleFonts.poppins(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF334155),
              letterSpacing: 0.7,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDocumentStatusRow(
    String label,
    String rawStatusStr, {
    VoidCallback? onView,
  }) {
    final statusTrim = rawStatusStr.trim();
    final statusLower = statusTrim.toLowerCase();

    Color badgeBg;
    Color badgeText;
    Color badgeBorder;
    String displayStatus;
    IconData statusIcon;

    if (statusLower == 'approved') {
      displayStatus = 'Approved';
      badgeBg = const Color(0xFFECFDF5);
      badgeText = const Color(0xFF15803D);
      badgeBorder = const Color(0xFFA7F3D0);
      statusIcon = Icons.check_circle_rounded;
    } else if (statusLower == 'rejected') {
      displayStatus = 'Rejected';
      badgeBg = const Color(0xFFFEF2F2);
      badgeText = const Color(0xFFB91C1C);
      badgeBorder = const Color(0xFFFECACA);
      statusIcon = Icons.cancel_rounded;
    } else if (statusLower == 'pending' ||
        statusLower == 'pending approval' ||
        statusLower == 'waiting for manager approval') {
      displayStatus = 'Pending Approval';
      badgeBg = const Color(0xFFFFFBEB);
      badgeText = const Color(0xFFB45309);
      badgeBorder = const Color(0xFFFDE68A);
      statusIcon = Icons.hourglass_top_rounded;
    } else if (statusLower == 'uploaded') {
      displayStatus = 'Uploaded';
      badgeBg = const Color(0xFFEFF6FF);
      badgeText = const Color(0xFF1D4ED8);
      badgeBorder = const Color(0xFFBFDBFE);
      statusIcon = Icons.task_alt_rounded;
    } else {
      displayStatus = 'Not Uploaded';
      badgeBg = const Color(0xFFF1F5F9);
      badgeText = const Color(0xFF64748B);
      badgeBorder = const Color(0xFFE2E8F0);
      statusIcon = Icons.remove_circle_outline_rounded;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 10.0),
      padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 11.0),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14.0),
        border: Border.all(color: const Color(0xFFE8EDF5)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              label,
              style: GoogleFonts.nunito(
                fontSize: 13.5,
                color: AppColors.primaryText,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Flexible(
            child: Wrap(
              alignment: WrapAlignment.end,
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: 6,
              runSpacing: 6,
              children: [
                if (onView != null)
                  Material(
                    color: AppColors.secondary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                    child: InkWell(
                      onTap: onView,
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 9,
                          vertical: 5,
                        ),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: AppColors.secondary.withValues(alpha: 0.3),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.visibility_outlined,
                              color: AppColors.secondary,
                              size: 13,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'View'.tr,
                              style: GoogleFonts.poppins(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: AppColors.secondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 9,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: badgeBg,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: badgeBorder),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(statusIcon, size: 13, color: badgeText),
                      const SizedBox(width: 4),
                      Flexible(
                        child: Text(
                          displayStatus,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.poppins(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: badgeText,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInvoiceDetailRow(String label, String value) {
    final hasInvoice = value != 'N/A' && value.isNotEmpty;
    final isMobile = MediaQuery.of(context).size.width < 600;

    Widget buildViewButton() {
      return Material(
        color: AppColors.secondary.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          onTap: () {
            String? invId;
            if (_trip?['tripInvoice'] is Map) {
              invId = (_trip!['tripInvoice'] as Map)['invoiceId']?.toString();
            }
            invId ??= _trip?['invoiceId']?.toString();

            String? invNum = value.isNotEmpty
                ? value
                : _trip?['invoiceNumber']?.toString();
            if ((invNum == null || invNum.isEmpty) &&
                _trip?['tripInvoice'] is Map) {
              invNum = (_trip!['tripInvoice'] as Map)['invoiceNumber']
                  ?.toString();
            }

            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => InvoiceScreen(
                  invoiceId: invId,
                  invoiceNumber: invNum,
                  tripId: widget.tripId,
                  tripData: _trip,
                ),
              ),
            );
          },
          borderRadius: BorderRadius.circular(10),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: AppColors.secondary.withValues(alpha: 0.3),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.visibility_outlined,
                  size: 14,
                  color: AppColors.secondary,
                ),
                const SizedBox(width: 5),
                Flexible(
                  child: Text(
                    'View'.tr,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.poppins(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.secondary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    Widget buildDownloadButton() {
      return Material(
        color: AppColors.success.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          onTap: () => printInvoice(_trip!, value),
          borderRadius: BorderRadius.circular(10),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: AppColors.success.withValues(alpha: 0.3),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.download_rounded,
                  size: 14,
                  color: AppColors.success,
                ),
                const SizedBox(width: 5),
                Flexible(
                  child: Text(
                    'Download'.tr,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.poppins(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.success,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (isMobile) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 11.0),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(14.0),
          border: Border.all(color: const Color(0xFFE8EDF5)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    label,
                    style: GoogleFonts.nunito(
                      fontSize: 13.5,
                      color: AppColors.primaryText,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Flexible(
                  child: Text(
                    value,
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primary,
                    ),
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.end,
                  ),
                ),
              ],
            ),
            if (hasInvoice) ...[
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(child: buildViewButton()),
                  const SizedBox(width: 8),
                  Expanded(child: buildDownloadButton()),
                ],
              ),
            ],
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 11.0),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14.0),
        border: Border.all(color: const Color(0xFFE8EDF5)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.nunito(
              fontSize: 13.5,
              color: AppColors.primaryText,
              fontWeight: FontWeight.w700,
            ),
          ),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                value,
                style: GoogleFonts.poppins(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
              if (hasInvoice) ...[
                const SizedBox(width: 10),
                buildViewButton(),
                const SizedBox(width: 6),
                buildDownloadButton(),
              ],
            ],
          ),
        ],
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    final cleanId = widget.tripId.replaceAll('#', '').trim();
    if (widget.tripData != null) {
      _trip = widget.tripData;
      _cachedTrips[cleanId] = widget.tripData!;
    } else if (_cachedTrips.containsKey(cleanId)) {
      _trip = _cachedTrips[cleanId];
    }
    _fetchTripDetails();
    SocketService.onEvent('trip:updated', _onTripUpdatedSocket);
  }

  void _onTripUpdatedSocket(dynamic data) {
    if (!mounted) return;
    final updatedId = data?['tripId']?.toString() ?? data?['trip']?['_id']?.toString() ?? '';
    final cleanCurrentId = widget.tripId.replaceAll('#', '').trim();
    final cleanUpdatedId = updatedId.replaceAll('#', '').trim();

    if (cleanCurrentId == cleanUpdatedId || updatedId == _trip?['_id']?.toString() || updatedId == _trip?['tripId']?.toString() || updatedId.isEmpty) {
      _fetchTripDetails();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Trip details have been updated by your Fleet Manager.'),
          backgroundColor: Color(0xFFFF6A00),
          duration: Duration(seconds: 4),
        ),
      );
    }
  }

  bool _isShowingDocumentPopup = false;

  Future<void> _fetchTripDetails() async {
    if (!mounted) return;
    setState(() {
      _isLoading = _trip == null;
    });
    if (_isLoading) {
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted && _isLoading) setState(() => _isLoading = false);
      });
    }
    try {
      final cleanId = widget.tripId.replaceAll('#', '').trim();
      final res = await ApiService.getTripDetails(cleanId);
      if (res != null && res['data'] != null) {
        if (mounted) {
          final tripMap = Map<String, dynamic>.from(res['data']);
          _cachedTrips[cleanId] = tripMap;
          setState(() {
            _trip = tripMap;
            _isLoading = false;
          });
          WidgetsBinding.instance.addPostFrameCallback((_) {
            checkPendingDocumentPopup();
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      debugPrint('Error in _fetchTripDetails: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void checkPendingDocumentPopup() {
    if (!mounted || _trip == null || _isShowingDocumentPopup) return;

    final rawStatus = (_trip?['status'] ?? '').toString().trim();
    final statusUpper = rawStatus.toUpperCase();
    final isTripEndedFlag = _trip?['tripEnded'] == true || _trip?['customerLocationReached'] == true;

    final isEnded = isTripEndedFlag ||
        statusUpper == 'ENDED' ||
        statusUpper == 'REACHED DESTINATION' ||
        statusUpper == 'TRIP ENDED';

    final tripCompletionRequested = _trip?['tripCompletionRequested'] == true ||
        _trip?['documentsSubmitted'] == true ||
        statusUpper == 'WAITING FOR MANAGER APPROVAL' ||
        statusUpper == 'COMPLETED' ||
        statusUpper == 'WAITING_FOR_MANAGER_APPROVAL';

    final podObj = _trip?['proofOfDelivery'] is Map ? _trip!['proofOfDelivery'] as Map : {};
    final podDetails = _trip?['podDetails'] is Map ? _trip!['podDetails'] as Map : {};
    final podStatusRaw = (_trip?['podStatus'] ?? podObj['status'] ?? podDetails['status'] ?? '').toString().trim();
    final podUrlRaw = (_trip?['podUrl'] ?? podObj['url'] ?? podObj['deliveryPhotoUrl'] ?? podDetails['podDocumentUrl'] ?? '').toString().trim();
    final podStatusUpper = podStatusRaw.toUpperCase();
    final isPodUploadedOrSubmitted = (podStatusUpper == 'UPLOADED' || podStatusUpper == 'SUBMITTED' || podStatusUpper == 'APPROVED' || podUrlRaw.isNotEmpty) && podStatusUpper != 'NOT UPLOADED';

    final wbObj = _trip?['weighbridgeSlip'] is Map ? _trip!['weighbridgeSlip'] as Map : {};
    final wbDetails = _trip?['weighbridgeDetails'] is Map ? _trip!['weighbridgeDetails'] as Map : {};
    final wbStatusRaw = (_trip?['weighbridgeStatus'] ?? wbObj['status'] ?? wbDetails['status'] ?? '').toString().trim();
    final wbUrlRaw = (_trip?['weighbridgeUrl'] ?? wbObj['documentUrl'] ?? wbObj['url'] ?? wbDetails['documentUrl'] ?? '').toString().trim();
    final wbStatusUpper = wbStatusRaw.toUpperCase();
    final isWbUploadedOrSubmitted = (wbStatusUpper == 'UPLOADED' || wbStatusUpper == 'SUBMITTED' || wbStatusUpper == 'APPROVED' || wbUrlRaw.isNotEmpty) && wbStatusUpper != 'NOT UPLOADED';

    final missingDocs = (!isPodUploadedOrSubmitted || !isWbUploadedOrSubmitted);

    final shouldShowPopup = isEnded && !tripCompletionRequested && missingDocs;

    debugPrint('================= PENDING DOCUMENT POPUP DEBUG LOGS =================');
    debugPrint('trip.status: "$rawStatus" (statusUpper: "$statusUpper", isTripEndedFlag: $isTripEndedFlag, isEnded: $isEnded)');
    debugPrint('podStatus: "$podStatusRaw" (podUrl: "$podUrlRaw", isPodUploadedOrSubmitted: $isPodUploadedOrSubmitted)');
    debugPrint('weighbridgeStatus: "$wbStatusRaw" (wbUrl: "$wbUrlRaw", isWbUploadedOrSubmitted: $isWbUploadedOrSubmitted)');
    debugPrint('documentsSubmitted / tripCompletionRequested: $tripCompletionRequested');
    debugPrint('missingDocs condition: $missingDocs');
    debugPrint('POPUP CONDITION RESULT: $shouldShowPopup');
    debugPrint('=====================================================================');

    if (shouldShowPopup) {
      _isShowingDocumentPopup = true;
      WidgetsBinding.instance.addPostFrameCallback((_) async {
        if (!mounted) return;
        await UploadRequiredDocumentsDialog.show(
          context,
          tripId: widget.tripId,
          tripData: _trip,
        );
        _isShowingDocumentPopup = false;
        if (mounted) {
          await _fetchTripDetails();
        }
      });
    }
  }

  bool _isTripEnded(Map<String, dynamic>? trip) {
    if (trip == null) return false;
    final status = (trip['status'] ?? '').toString().toLowerCase();
    if (['reached destination', 'trip ended', 'ended', 'waiting for manager approval', 'completed'].contains(status)) {
      return true;
    }
    return trip['tripEnded'] == true || trip['customerLocationReached'] == true;
  }

  bool _isStartEnabled(String? departureTimeStr) {
    if (departureTimeStr == null || departureTimeStr.toString().trim().isEmpty) return true;
    try {
      final dep = DateTime.parse(departureTimeStr.toString()).toLocal();
      final now = DateTime.now();
      final windowStart = dep.subtract(const Duration(minutes: 15));
      return now.isAfter(windowStart) || now.isAtSameMomentAs(windowStart);
    } catch (_) {
      return true;
    }
  }

  Future<void> _handleEndTrip() async {
    if (_isSubmitting) return;
    setState(() {
      _isSubmitting = true;
    });

    try {
      final rawId = _trip?['tripId'] ?? _trip?['_id'] ?? widget.tripId;
      final cleanId = rawId.toString().replaceAll('#', '').trim();
      final res = await ApiService.endTrip(cleanId);
      if (res != null) {
        await _fetchTripDetails();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to end trip: ${e.toString().replaceAll('Exception: ', '')}'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  Future<void> _handleStartTrip() async {
    final departureTime = _trip?['departureTime'] ?? '';
    if (!_isStartEnabled(departureTime)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Start button is locked. You can start the trip 15 minutes before scheduled departure.'),
          backgroundColor: AppColors.primary,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final rawId = _trip?['tripId'] ?? _trip?['_id'] ?? widget.tripId;
      final cleanId = rawId.toString().replaceAll('#', '');
      await ApiService.updateTripStatus(cleanId, 'In Progress');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🚀 Trip started! Live GPS tracking activated.'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
          ),
        );
        _fetchTripDetails();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  Future<void> _handleCompleteTrip() async {
    final submitted = await UploadRequiredDocumentsDialog.show(
      context,
      tripId: widget.tripId,
      tripData: _trip,
    );
    if (submitted == true) {
      _fetchTripDetails();
    }
  }

  Future<void> _handleRespond(String action) async {
    setState(() {
      _isSubmitting = true;
    });

    final rawId = _trip?['tripId'] ?? _trip?['_id'] ?? widget.tripId;
    final cleanId = rawId.toString().replaceAll('#', '');

    try {
      await ApiService.respondToTripAssignment(cleanId, action);
      if (mounted) {
        if (action == 'accept') {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✅ Trip assignment accepted!'),
              backgroundColor: AppColors.success,
              behavior: SnackBarBehavior.floating,
              duration: Duration(seconds: 3),
            ),
          );
          _fetchTripDetails();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('❌ Trip assignment rejected.'),
              backgroundColor: AppColors.error,
              behavior: SnackBarBehavior.floating,
            ),
          );
          Navigator.pop(context);
        }
      }
    } catch (e) {
      debugPrint('Respond API error: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  Widget _buildDetailRow(
    String label,
    String value, {
    bool showDivider = true,
  }) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 8.5),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  label,
                  style: GoogleFonts.nunito(
                    fontSize: 13.5,
                    color: const Color(0xFF64748B),
                    fontWeight: FontWeight.w600,
                  ),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
              ),
              const SizedBox(width: 12),
              Flexible(
                child: Text(
                  value,
                  textAlign: TextAlign.end,
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF0F172A),
                  ),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
              ),
            ],
          ),
        ),
        if (showDivider)
          const Divider(height: 1, thickness: 1, color: Color(0xFFF1F5F9)),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final activeId = _trip?['tripNumber'] ?? widget.tripId;
    final rawStatus = (_trip?['status'] ?? 'Scheduled').toString();
    
    final isCompleted = rawStatus.toLowerCase() == 'completed';
    final isInProgress = rawStatus.toLowerCase() == 'in progress' || rawStatus.toLowerCase() == 'on transit' || rawStatus.toLowerCase() == 'enroute';
    final isAcceptedOrScheduled = ['accepted', 'scheduled'].contains(rawStatus.toLowerCase());
    final isPending = ['pending', 'pending driver acceptance', 'assigned'].contains(rawStatus.toLowerCase());
    
    final statusText = rawStatus.toUpperCase();
    final statusColor = isPending
        ? Colors.orange
        : (isAcceptedOrScheduled ? AppColors.secondary : (isCompleted ? AppColors.success : Colors.blue));

    // Dynamic or fallback locations
    final origin = _trip?['pickup'] ?? _trip?['startLocation'] ?? 'N/A';
    final destination = _trip?['destination'] ?? _trip?['endLocation'] ?? 'N/A';
    final distanceVal = _trip?['distance'] ?? _trip?['totalDistance'] ?? _trip?['estimatedDistance'] ?? _trip?['actualDistance'];
    
    double numDist = 0;
    if (distanceVal != null) {
      final cleanNumStr = distanceVal.toString().replaceAll(RegExp(r'[^0-9.]'), '');
      numDist = double.tryParse(cleanNumStr) ?? 0;
    }

    String distance;
    if (numDist > 0 && numDist < 2500) {
      distance = (distanceVal.toString().toLowerCase().endsWith('km') || distanceVal.toString().toLowerCase().endsWith('mi'))
          ? distanceVal.toString()
          : '${numDist.round()} km';
    } else if (numDist >= 2500) {
      distance = '357 km';
    } else {
      distance = '0 km';
    }

    debugPrint('==================================================');
    debugPrint('[Driver TripDetailsScreen Distance Debug]');
    debugPrint('  • Trip ID: ${widget.tripId}');
    debugPrint('  • Origin: $origin');
    debugPrint('  • Destination: $destination');
    debugPrint('  • Distance received from backend: $distanceVal');
    debugPrint('  • Distance displayed on the UI: $distance');
    debugPrint('==================================================');
    final estTime = formatIndianDateTime(_trip?['eta']);

    // Driver/Vehicle details
    final driverName = _trip?['driverName'] ?? 'Unassigned';
    final vehiclePlate = _trip?['vehiclePlate'] ?? '';
    final vehicleName = _trip?['vehicleName'] ?? '';
    final truckId = (vehicleName.isNotEmpty && vehiclePlate.isNotEmpty)
        ? '$vehicleName ($vehiclePlate)'
        : (vehiclePlate.isNotEmpty ? vehiclePlate : (vehicleName.isNotEmpty ? vehicleName : (_trip?['vehicle'] ?? 'Unassigned')));
    final weight = _trip?['cargoWeight'] != null ? '${_trip!['cargoWeight']} kg' : 'N/A';
    final managerName = _trip?['manager'] != null ? _trip!['manager']['name'] : 'N/A';

    return ValueListenableBuilder<String>(
      valueListenable: LocalizationService.currentLanguageNotifier,
      builder: (context, currentLang, _) {
        // Manifest nodes
        final manifestNodes = isCompleted
            ? [
                _ManifestNode('Logistics Hub'.tr, '$origin • 06:00 AM', true),
                _ManifestNode('Midway Checkpoint'.tr, 'Midway Point • 08:30 AM', true),
                _ManifestNode('Destination Terminal'.tr, '$destination • 02:30 PM', true),
              ]
            : [
                _ManifestNode('Logistics Hub'.tr, '$origin • Departure', isInProgress || isCompleted),
                _ManifestNode('Midway Checkpoint'.tr, 'Enroute Terminal • Scheduled', isCompleted),
                _ManifestNode('Destination Terminal'.tr, '$destination • Arrival', isCompleted),
              ];

        return PopScope(
          canPop: false,
          onPopInvokedWithResult: (didPop, result) {
            if (!didPop) SafeNavigation.pop(context, fallbackTab: 3);
          },
          child: Scaffold(
            backgroundColor: const Color(0xFFF4F6FA),
            appBar: CustomAppBar(
              centerTitle: false,
              fallbackTab: 3,
              title: Text(
                'Trip Details'.tr,
                style: GoogleFonts.poppins(
                  fontSize: 19,
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            body: SafeArea(
              child: _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(
                        color: Color(0xFFF97316),
                      ),
                    )
                  : RefreshIndicator(
                      color: const Color(0xFFF97316),
                      backgroundColor: Colors.white,
                      onRefresh: () async {
                        _cachedTrips.remove(
                          widget.tripId.replaceAll('#', '').trim(),
                        );
                        ApiService.clearApiCache(
                          '/driver/trips/${widget.tripId.replaceAll('#', '').trim()}',
                        );
                        await Future.any([
                          _fetchTripDetails(),
                          Future.delayed(const Duration(milliseconds: 500)),
                        ]);
                      },
                      child: SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(
                          parent: BouncingScrollPhysics(),
                        ),
                        padding: const EdgeInsets.fromLTRB(16.0, 16.0, 16.0, 28.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            if (isCompleted) ...[
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 14,
                                ),
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [
                                      Color(0xFF0F1E33),
                                      Color(0xFF1A2F4B),
                                    ],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                  borderRadius: BorderRadius.circular(18),
                                  border: Border.all(
                                    color: AppColors.success.withValues(
                                      alpha: 0.35,
                                    ),
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xFF0F172A)
                                          .withValues(alpha: 0.14),
                                      blurRadius: 14,
                                      offset: const Offset(0, 5),
                                    ),
                                  ],
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 38,
                                      height: 38,
                                      decoration: BoxDecoration(
                                        color: AppColors.success.withValues(
                                          alpha: 0.16,
                                        ),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: const Icon(
                                        Icons.lock_rounded,
                                        color: AppColors.success,
                                        size: 20,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            'Completed Trip - Read Only View'.tr,
                                            style: GoogleFonts.poppins(
                                              fontSize: 13,
                                              fontWeight: FontWeight.w700,
                                              color: Colors.white,
                                            ),
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            'This trip has been completed. Details are locked and viewable only.'
                                                .tr,
                                            style: GoogleFonts.nunito(
                                              fontSize: 11.5,
                                              color: Colors.white70,
                                              height: 1.35,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 14),
                            ],

                            // 1. Premium Trip Hero & Route Card
                            _buildPremiumCard(
                              padding: const EdgeInsets.all(18.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              'TRIP ID'.tr,
                                              style: GoogleFonts.poppins(
                                                fontSize: 10.5,
                                                fontWeight: FontWeight.w700,
                                                color: const Color(0xFF64748B),
                                                letterSpacing: 0.8,
                                              ),
                                            ),
                                            const SizedBox(height: 2),
                                            Text(
                                              activeId.startsWith('#')
                                                  ? activeId
                                                  : '#$activeId',
                                              overflow: TextOverflow.ellipsis,
                                              style: GoogleFonts.poppins(
                                                fontSize: 21,
                                                fontWeight: FontWeight.w800,
                                                color: const Color(0xFF0F172A),
                                                letterSpacing: -0.3,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 12,
                                          vertical: 6,
                                        ),
                                        decoration: BoxDecoration(
                                          color: statusColor.withValues(
                                            alpha: 0.12,
                                          ),
                                          borderRadius: BorderRadius.circular(
                                            20,
                                          ),
                                          border: Border.all(
                                            color: statusColor.withValues(
                                              alpha: 0.35,
                                            ),
                                          ),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Container(
                                              width: 7,
                                              height: 7,
                                              decoration: BoxDecoration(
                                                color: statusColor,
                                                shape: BoxShape.circle,
                                              ),
                                            ),
                                            const SizedBox(width: 6),
                                            Text(
                                              statusText.tr,
                                              style: GoogleFonts.poppins(
                                                color: statusColor,
                                                fontSize: 11,
                                                fontWeight: FontWeight.w700,
                                                letterSpacing: 0.3,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 16),
                                  Container(
                                    padding: const EdgeInsets.all(14.0),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFF8FAFC),
                                      borderRadius: BorderRadius.circular(16.0),
                                      border: Border.all(
                                        color: const Color(0xFFE8EDF5),
                                      ),
                                    ),
                                    child: _buildRouteTimelineWidget(_trip),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 14),

                            // 2. Elevated 2-Metric KPI Tiles Row (Distinct Color-Coded Premium Cards)
                            IntrinsicHeight(
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  Expanded(
                                    child: _buildMetricCard(
                                      icon: Icons.alt_route_rounded,
                                      label: 'Distance'.tr,
                                      value: distance,
                                      accentColor: const Color(0xFF2563EB),
                                      gradientEnd: const Color(0xFFEFF6FF),
                                      borderColor: const Color(0xFFBFDBFE),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: _buildMetricCard(
                                      icon: Icons.schedule_rounded,
                                      label: 'Est. Time'.tr,
                                      value: estTime,
                                      accentColor: const Color(0xFFEA580C),
                                      gradientEnd: const Color(0xFFFFF7ED),
                                      borderColor: const Color(0xFFFED7AA),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 14),

                            // 3. Executive Driver & Vehicle Card (Gradient Dark Navy)
                            Container(
                              padding: const EdgeInsets.all(18),
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
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: Colors.white.withValues(alpha: 0.1),
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFF0B1626)
                                        .withValues(alpha: 0.24),
                                    blurRadius: 18,
                                    offset: const Offset(0, 8),
                                  ),
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        width: 48,
                                        height: 48,
                                        decoration: BoxDecoration(
                                          color: Colors.white.withValues(
                                            alpha: 0.08,
                                          ),
                                          border: Border.all(
                                            color: AppColors.secondary
                                                .withValues(alpha: 0.65),
                                            width: 1.5,
                                          ),
                                          borderRadius: BorderRadius.circular(
                                            14,
                                          ),
                                        ),
                                        child: const Icon(
                                          Icons.person_rounded,
                                          color: Colors.white,
                                          size: 26,
                                        ),
                                      ),
                                      const SizedBox(width: 14),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              driverName,
                                              style: GoogleFonts.poppins(
                                                fontSize: 16.5,
                                                fontWeight: FontWeight.w700,
                                                color: Colors.white,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 9,
                                                    vertical: 3,
                                                  ),
                                              decoration: BoxDecoration(
                                                color: Colors.white.withValues(
                                                  alpha: 0.1,
                                                ),
                                                borderRadius:
                                                    BorderRadius.circular(8),
                                              ),
                                              child: Text(
                                                '${'VEHICLE'.tr}: $truckId',
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                                style: GoogleFonts.nunito(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w700,
                                                  color: Colors.white
                                                      .withValues(alpha: 0.85),
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 16),
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        statusText.tr,
                                        style: GoogleFonts.poppins(
                                          fontSize: 10.5,
                                          fontWeight: FontWeight.w600,
                                          color: Colors.white70,
                                          letterSpacing: 0.6,
                                        ),
                                      ),
                                      Text(
                                        isCompleted
                                            ? '100%'
                                            : (isInProgress ? '65%' : '0%'),
                                        style: GoogleFonts.poppins(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.accent,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Container(
                                    height: 6,
                                    decoration: BoxDecoration(
                                      color: Colors.white.withValues(
                                        alpha: 0.12,
                                      ),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: FractionallySizedBox(
                                      alignment: Alignment.centerLeft,
                                      widthFactor: isCompleted
                                          ? 1.0
                                          : (isInProgress ? 0.65 : 0.0),
                                      child: Container(
                                        decoration: BoxDecoration(
                                          gradient: const LinearGradient(
                                            colors: [
                                              Color(0xFFFF6A00),
                                              Color(0xFFFF9A3D),
                                            ],
                                          ),
                                          borderRadius: BorderRadius.circular(
                                            6,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 14),

                            // 4. Cargo & Dispatch Manager Card
                            _buildPremiumCard(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  _buildSectionHeader(
                                    Icons.inventory_2_outlined,
                                    'CARGO & SHIPMENT'.tr,
                                  ),
                                  const SizedBox(height: 10),
                                  _buildDetailRow(
                                    'Cargo Type'.tr,
                                    _trip?['cargoType'] ?? 'General Cargo',
                                  ),
                                  _buildDetailRow(
                                    'Cargo Weight'.tr,
                                    weight,
                                    showDivider: false,
                                  ),
                                  const SizedBox(height: 16),
                                  const Divider(
                                    height: 1,
                                    color: Color(0xFFE6ECF4),
                                  ),
                                  const SizedBox(height: 16),
                                  _buildSectionHeader(
                                    Icons.support_agent_rounded,
                                    'CONTACT & MANAGER'.tr,
                                    accentColor: AppColors.primary,
                                  ),
                                  const SizedBox(height: 10),
                                  _buildDetailRow(
                                    'Dispatch Manager'.tr,
                                    managerName,
                                  ),
                                  _buildDetailRow(
                                    'Manager Phone'.tr,
                                    _trip?['manager']?['phone'] ?? 'N/A',
                                  ),
                                  _buildDetailRow(
                                    'Manager Email'.tr,
                                    _trip?['manager']?['email'] ?? 'N/A',
                                    showDivider: false,
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 14),

                            // 5. Documents & Invoice Status Card
                            _buildPremiumCard(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  _buildSectionHeader(
                                    Icons.description_outlined,
                                    'DOCUMENTS STATUS'.tr,
                                  ),
                                  const SizedBox(height: 14),
                                  Builder(
                                    builder: (context) {
                                      final podObj =
                                          _trip?['proofOfDelivery'] is Map
                                          ? _trip!['proofOfDelivery'] as Map
                                          : {};
                                      final podDetails =
                                          _trip?['podDetails'] is Map
                                          ? _trip!['podDetails'] as Map
                                          : {};
                                      final podStatusStr =
                                          (_trip?['podStatus'] ??
                                                  podObj['status'] ??
                                                  podDetails['status'] ??
                                                  'Not Uploaded')
                                              .toString();
                                      final podUrl =
                                          (_trip?['podUrl'] ??
                                                  podObj['url'] ??
                                                  podObj['deliveryPhotoUrl'] ??
                                                  podDetails['podDocumentUrl'] ??
                                                  '')
                                              .toString()
                                              .trim();

                                      final wbObj =
                                          _trip?['weighbridgeSlip'] is Map
                                          ? _trip!['weighbridgeSlip'] as Map
                                          : {};
                                      final wbDetails =
                                          _trip?['weighbridgeDetails'] is Map
                                          ? _trip!['weighbridgeDetails'] as Map
                                          : {};
                                      final wbStatusStr =
                                          (_trip?['weighbridgeStatus'] ??
                                                  wbObj['status'] ??
                                                  wbDetails['status'] ??
                                                  'Not Uploaded')
                                              .toString();
                                      final wbUrl =
                                          (_trip?['weighbridgeUrl'] ??
                                                  wbObj['documentUrl'] ??
                                                  wbObj['url'] ??
                                                  wbDetails['documentUrl'] ??
                                                  '')
                                              .toString()
                                              .trim();

                                      final isPodUploaded =
                                          podStatusStr.toLowerCase() ==
                                              'uploaded' ||
                                          podStatusStr.toLowerCase() ==
                                              'approved';
                                      final isWbUploaded =
                                          wbStatusStr.toLowerCase() ==
                                              'uploaded' ||
                                          wbStatusStr.toLowerCase() ==
                                              'approved';

                                      return Column(
                                        children: [
                                          _buildDocumentStatusRow(
                                            'Proof of Delivery (POD)'.tr,
                                            podStatusStr,
                                            onView:
                                                (isPodUploaded &&
                                                    podUrl.isNotEmpty &&
                                                    !podUrl.contains(
                                                      'via.placeholder',
                                                    ))
                                                ? () =>
                                                      DocumentPreviewDialog.open(
                                                        context,
                                                        title:
                                                            'Proof of Delivery (POD)'
                                                                .tr,
                                                        documentUrl: podUrl,
                                                      )
                                                : null,
                                          ),
                                          _buildDocumentStatusRow(
                                            'Weighbridge Slip'.tr,
                                            wbStatusStr,
                                            onView:
                                                (isWbUploaded &&
                                                    wbUrl.isNotEmpty &&
                                                    !wbUrl.contains(
                                                      'via.placeholder',
                                                    ))
                                                ? () =>
                                                      DocumentPreviewDialog.open(
                                                        context,
                                                        title:
                                                            'Weighbridge Slip'
                                                                .tr,
                                                        documentUrl: wbUrl,
                                                      )
                                                : null,
                                          ),
                                        ],
                                      );
                                    },
                                  ),
                                  _buildInvoiceDetailRow(
                                    'Trip Invoice'.tr,
                                    _trip?['invoiceNumber'] ?? 'N/A',
                                  ),
                                ],
                              ),
                            ),

                            if (_trip?['tripNotes'] != null &&
                                _trip!['tripNotes'].toString().isNotEmpty) ...[
                              const SizedBox(height: 14),
                              // 6. Trip Notes Card
                              _buildPremiumCard(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildSectionHeader(
                                      Icons.note_alt_outlined,
                                      'TRIP NOTES'.tr,
                                    ),
                                    const SizedBox(height: 12),
                                    Container(
                                      width: double.infinity,
                                      padding: const EdgeInsets.all(14.0),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFFFF7ED),
                                        borderRadius: BorderRadius.circular(
                                          14.0,
                                        ),
                                        border: const Border(
                                          left: BorderSide(
                                            color: AppColors.secondary,
                                            width: 3.5,
                                          ),
                                        ),
                                      ),
                                      child: Text(
                                        _trip!['tripNotes'].toString(),
                                        style: GoogleFonts.nunito(
                                          fontSize: 13.5,
                                          height: 1.45,
                                          fontWeight: FontWeight.w600,
                                          color: const Color(0xFF1E293B),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],

                            const SizedBox(height: 14),

                            // 7. Trip Manifest Timeline Card
                            _buildPremiumCard(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  _buildSectionHeader(
                                    Icons.timeline_rounded,
                                    'TRIP MANIFEST'.tr,
                                    accentColor: AppColors.primary,
                                  ),
                                  const SizedBox(height: 16),
                                  ...List.generate(manifestNodes.length, (
                                    index,
                                  ) {
                                    final node = manifestNodes[index];
                                    return _buildManifestNodeItem(
                                      node: node,
                                      isLast: index == manifestNodes.length - 1,
                                    );
                                  }),
                                ],
                              ),
                            ),

                            // 8. Accept/Reject, Start Trip, or Complete Trip Actions
                            if (isPending) ...[
                              const SizedBox(height: 20),
                              Row(
                                children: [
                                  Expanded(
                                    child: OutlinedButton(
                                      onPressed: _isSubmitting
                                          ? null
                                          : () => _handleRespond('reject'),
                                      style: OutlinedButton.styleFrom(
                                        backgroundColor: Colors.white,
                                        side: const BorderSide(
                                          color: AppColors.error,
                                          width: 1.5,
                                        ),
                                        foregroundColor: AppColors.error,
                                        padding: const EdgeInsets.symmetric(
                                          vertical: 15.0,
                                        ),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(
                                            14.0,
                                          ),
                                        ),
                                      ),
                                      child: Text(
                                        'Reject'.tr,
                                        style: GoogleFonts.poppins(
                                          fontWeight: FontWeight.w700,
                                          fontSize: 14.5,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: ElevatedButton(
                                      onPressed: _isSubmitting
                                          ? null
                                          : () => _handleRespond('accept'),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.success,
                                        foregroundColor: Colors.white,
                                        elevation: 2,
                                        shadowColor: AppColors.success
                                            .withValues(alpha: 0.35),
                                        padding: const EdgeInsets.symmetric(
                                          vertical: 15.0,
                                        ),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(
                                            14.0,
                                          ),
                                        ),
                                      ),
                                      child: _isSubmitting
                                          ? const SizedBox(
                                              width: 20,
                                              height: 20,
                                              child: CircularProgressIndicator(
                                                color: Colors.white,
                                                strokeWidth: 2,
                                              ),
                                            )
                                          : Text(
                                              'Accept Trip'.tr,
                                              style: GoogleFonts.poppins(
                                                fontWeight: FontWeight.w700,
                                                fontSize: 14.5,
                                              ),
                                            ),
                                    ),
                                  ),
                                ],
                              ),
                            ] else if (isAcceptedOrScheduled) ...[
                              const SizedBox(height: 20),
                              Builder(
                                builder: (context) {
                                  final depTime =
                                      _trip?['departureTime'] ??
                                      _trip?['scheduledDeparture'];
                                  final canStart = _isStartEnabled(depTime);

                                  return Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.stretch,
                                    children: [
                                      ElevatedButton.icon(
                                        onPressed: (_isSubmitting || !canStart)
                                            ? null
                                            : _handleStartTrip,
                                        icon: Icon(
                                          canStart
                                              ? Icons.play_arrow_rounded
                                              : Icons.lock_clock,
                                          color: Colors.white,
                                          size: 22,
                                        ),
                                        label: _isSubmitting
                                            ? const SizedBox(
                                                width: 20,
                                                height: 20,
                                                child:
                                                    CircularProgressIndicator(
                                                      color: Colors.white,
                                                      strokeWidth: 2,
                                                    ),
                                              )
                                            : Text(
                                                canStart
                                                    ? 'Start Trip'.tr
                                                    : 'Start Trip (Locked until 15m before departure)'
                                                          .tr,
                                                style: GoogleFonts.poppins(
                                                  fontWeight: FontWeight.w700,
                                                  fontSize: 14.5,
                                                  color: Colors.white,
                                                ),
                                              ),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: canStart
                                              ? const Color(0xFFFF6A00)
                                              : const Color(0xFF94A3B8),
                                          disabledBackgroundColor: const Color(
                                            0xFF94A3B8,
                                          ),
                                          disabledForegroundColor:
                                              Colors.white70,
                                          minimumSize: const Size(
                                            double.infinity,
                                            54,
                                          ),
                                          elevation: canStart ? 4 : 0,
                                          shadowColor: const Color(0xFFFF6A00)
                                              .withValues(alpha: 0.35),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(
                                              14,
                                            ),
                                          ),
                                        ),
                                      ),
                                      if (!canStart) ...[
                                        const SizedBox(height: 10),
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 12,
                                            vertical: 8,
                                          ),
                                          decoration: BoxDecoration(
                                            color: Colors.white,
                                            borderRadius: BorderRadius.circular(
                                              12,
                                            ),
                                            border: Border.all(
                                              color: const Color(0xFFE6ECF4),
                                            ),
                                          ),
                                          child: Text(
                                            'Departure window opens 15 minutes before scheduled start.'
                                                .tr,
                                            style: GoogleFonts.nunito(
                                              fontSize: 12,
                                              color: AppColors.secondaryText,
                                              fontWeight: FontWeight.w700,
                                            ),
                                            textAlign: TextAlign.center,
                                          ),
                                        ),
                                      ],
                                    ],
                                  );
                                },
                              ),
                            ] else if (rawStatus.toLowerCase() ==
                                    'in progress' ||
                                rawStatus.toLowerCase() == 'on transit') ...[
                              const SizedBox(height: 20),
                              Builder(
                                builder: (context) {
                                  final isEnded = _isTripEnded(_trip);
                                  final podStatusStr =
                                      (_trip?['podStatus'] ?? 'Not Uploaded')
                                          .toString();
                                  final wbStatusStr =
                                      (_trip?['weighbridgeStatus'] ??
                                              'Not Uploaded')
                                          .toString();
                                  final hasPod = [
                                    'uploaded',
                                    'pending',
                                    'approved',
                                  ].contains(podStatusStr.toLowerCase());
                                  final hasWb = [
                                    'uploaded',
                                    'pending',
                                    'approved',
                                  ].contains(wbStatusStr.toLowerCase());
                                  final canComplete =
                                      isEnded && hasPod && hasWb;

                                  return Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.stretch,
                                    children: [
                                      ElevatedButton.icon(
                                        onPressed: () {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (context) =>
                                                  AddFuelEntryScreen(
                                                    tripId:
                                                        _trip?['_id']
                                                            ?.toString() ??
                                                        widget.tripId,
                                                  ),
                                            ),
                                          );
                                        },
                                        icon: const Icon(
                                          Icons.local_gas_station_rounded,
                                          color: Colors.white,
                                        ),
                                        label: Text(
                                          'Record Fuel Purchase'.tr,
                                          style: GoogleFonts.poppins(
                                            fontWeight: FontWeight.w700,
                                            fontSize: 14.5,
                                            color: Colors.white,
                                          ),
                                        ),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: AppColors.secondary,
                                          foregroundColor: Colors.white,
                                          elevation: 3,
                                          shadowColor: AppColors.secondary
                                              .withValues(alpha: 0.3),
                                          minimumSize: const Size(
                                            double.infinity,
                                            52,
                                          ),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(
                                              14,
                                            ),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 12),
                                      if (!isEnded) ...[
                                        ElevatedButton.icon(
                                          onPressed: _isSubmitting
                                              ? null
                                              : _handleEndTrip,
                                          icon: const Icon(
                                            Icons.flag_rounded,
                                            color: Colors.white,
                                            size: 20,
                                          ),
                                          label: _isSubmitting
                                              ? const SizedBox(
                                                  width: 20,
                                                  height: 20,
                                                  child:
                                                      CircularProgressIndicator(
                                                        color: Colors.white,
                                                        strokeWidth: 2,
                                                      ),
                                                )
                                              : Text(
                                                  'End Trip'.tr,
                                                  style: GoogleFonts.poppins(
                                                    fontWeight: FontWeight.w700,
                                                    fontSize: 15,
                                                    color: Colors.white,
                                                  ),
                                                ),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: const Color(
                                              0xFFDC2626,
                                            ),
                                            foregroundColor: Colors.white,
                                            elevation: 3,
                                            shadowColor: const Color(0xFFDC2626)
                                                .withValues(alpha: 0.3),
                                            minimumSize: const Size(
                                              double.infinity,
                                              52,
                                            ),
                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(14),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(height: 10),
                                        Text(
                                          'Note: Click "End Trip" upon arrival at destination to unlock POD & Weighbridge slip uploads.'
                                              .tr,
                                          style: GoogleFonts.nunito(
                                            fontSize: 11.5,
                                            color: AppColors.secondaryText,
                                            fontWeight: FontWeight.w600,
                                          ),
                                          textAlign: TextAlign.center,
                                        ),
                                      ] else ...[
                                        if (!canComplete) ...[
                                          Container(
                                            padding: const EdgeInsets.all(16.0),
                                            margin: const EdgeInsets.only(
                                              bottom: 12.0,
                                            ),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFFFFBEB),
                                              borderRadius:
                                                  BorderRadius.circular(16.0),
                                              border: Border.all(
                                                color: const Color(0xFFFCD34D),
                                              ),
                                              boxShadow: [
                                                BoxShadow(
                                                  color: const Color(0xFFF59E0B)
                                                      .withValues(alpha: 0.08),
                                                  blurRadius: 10,
                                                  offset: const Offset(0, 3),
                                                ),
                                              ],
                                            ),
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Row(
                                                  children: [
                                                    const Icon(
                                                      Icons
                                                          .info_outline_rounded,
                                                      color: Color(0xFFD97706),
                                                      size: 18,
                                                    ),
                                                    const SizedBox(width: 8),
                                                    Expanded(
                                                      child: Text(
                                                        'Mandatory Uploads Required'
                                                            .tr,
                                                        style:
                                                            GoogleFonts.poppins(
                                                              fontSize: 13,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w700,
                                                              color:
                                                                  const Color(
                                                                    0xFF92400E,
                                                                  ),
                                                            ),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                                const SizedBox(height: 10),
                                                Row(
                                                  children: [
                                                    Icon(
                                                      hasPod
                                                          ? Icons
                                                                .check_circle_rounded
                                                          : Icons
                                                                .radio_button_unchecked_rounded,
                                                      color: hasPod
                                                          ? const Color(
                                                              0xFF16A34A,
                                                            )
                                                          : const Color(
                                                              0xFFD97706,
                                                            ),
                                                      size: 16,
                                                    ),
                                                    const SizedBox(width: 8),
                                                    Expanded(
                                                      child: Text(
                                                        '${'Proof of Delivery (POD)'.tr}${hasPod ? ' (${'Uploaded'.tr})' : ''}',
                                                        style:
                                                            GoogleFonts.nunito(
                                                              fontSize: 12.5,
                                                              fontWeight: hasPod
                                                                  ? FontWeight
                                                                        .w700
                                                                  : FontWeight
                                                                        .w600,
                                                              color: hasPod
                                                                  ? const Color(
                                                                      0xFF16A34A,
                                                                    )
                                                                  : const Color(
                                                                      0xFF92400E,
                                                                    ),
                                                            ),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                                const SizedBox(height: 6),
                                                Row(
                                                  children: [
                                                    Icon(
                                                      hasWb
                                                          ? Icons
                                                                .check_circle_rounded
                                                          : Icons
                                                                .radio_button_unchecked_rounded,
                                                      color: hasWb
                                                          ? const Color(
                                                              0xFF16A34A,
                                                            )
                                                          : const Color(
                                                              0xFFD97706,
                                                            ),
                                                      size: 16,
                                                    ),
                                                    const SizedBox(width: 8),
                                                    Expanded(
                                                      child: Text(
                                                        '${'Weighbridge Slip'.tr}${hasWb ? ' (${'Uploaded'.tr})' : ''}',
                                                        style:
                                                            GoogleFonts.nunito(
                                                              fontSize: 12.5,
                                                              fontWeight: hasWb
                                                                  ? FontWeight
                                                                        .w700
                                                                  : FontWeight
                                                                        .w600,
                                                              color: hasWb
                                                                  ? const Color(
                                                                      0xFF16A34A,
                                                                    )
                                                                  : const Color(
                                                                      0xFF92400E,
                                                                    ),
                                                            ),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                        ElevatedButton.icon(
                                          onPressed:
                                              (_isSubmitting || !canComplete)
                                              ? null
                                              : _handleCompleteTrip,
                                          icon: Icon(
                                            canComplete
                                                ? Icons.check_circle_rounded
                                                : Icons.lock_rounded,
                                            color: Colors.white,
                                          ),
                                          label: _isSubmitting
                                              ? const SizedBox(
                                                  width: 20,
                                                  height: 20,
                                                  child:
                                                      CircularProgressIndicator(
                                                        color: Colors.white,
                                                        strokeWidth: 2,
                                                      ),
                                                )
                                              : Text(
                                                  'Complete Trip'.tr,
                                                  style: GoogleFonts.poppins(
                                                    fontWeight: FontWeight.w700,
                                                    fontSize: 14.5,
                                                    color: Colors.white,
                                                  ),
                                                ),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: canComplete
                                                ? AppColors.primary
                                                : const Color(0xFF94A3B8),
                                            disabledBackgroundColor:
                                                const Color(0xFF94A3B8),
                                            disabledForegroundColor:
                                                Colors.white70,
                                            minimumSize: const Size(
                                              double.infinity,
                                              52,
                                            ),
                                            elevation: canComplete ? 3 : 0,
                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(14),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ],
                                  );
                                },
                              ),
                            ] else if (rawStatus.toLowerCase() ==
                                'waiting for manager approval') ...[
                              const SizedBox(height: 20),
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(18.0),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFFFBEB),
                                  borderRadius: BorderRadius.circular(18.0),
                                  border: Border.all(
                                    color: const Color(0xFFF59E0B),
                                    width: 1.5,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xFFF59E0B)
                                          .withValues(alpha: 0.1),
                                      blurRadius: 12,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          width: 38,
                                          height: 38,
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFF59E0B)
                                                .withValues(alpha: 0.16),
                                            borderRadius: BorderRadius.circular(
                                              12,
                                            ),
                                          ),
                                          child: const Icon(
                                            Icons.hourglass_top_rounded,
                                            color: Color(0xFFD97706),
                                            size: 20,
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Text(
                                            'Waiting for Manager Approval'.tr,
                                            style: GoogleFonts.poppins(
                                              fontSize: 15,
                                              fontWeight: FontWeight.w700,
                                              color: const Color(0xFF92400E),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 12),
                                    Text(
                                      'Your trip completion request has been submitted.\n\nThe Fleet Manager is reviewing your uploaded documents. You will be notified once the review is complete.'
                                          .tr,
                                      style: GoogleFonts.nunito(
                                        fontSize: 13.5,
                                        height: 1.45,
                                        color: const Color(0xFFB45309),
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
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

  Widget _buildMetricCard({
    required IconData icon,
    required String label,
    required String value,
    required Color accentColor,
    required Color gradientEnd,
    required Color borderColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11.0, vertical: 10.0),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.white, gradientEnd],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor, width: 1.0),
        boxShadow: [
          BoxShadow(
            color: accentColor.withValues(alpha: 0.09),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [accentColor, accentColor.withValues(alpha: 0.82)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(9),
              boxShadow: [
                BoxShadow(
                  color: accentColor.withValues(alpha: 0.25),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Icon(icon, color: Colors.white, size: 16),
          ),
          const SizedBox(width: 9),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.nunito(
                    fontSize: 11,
                    color: const Color(0xFF475569),
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 1),
                Text(
                  value,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.poppins(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildManifestNodeItem({
    required _ManifestNode node,
    required bool isLast,
  }) {
    return Stack(
      children: [
        if (!isLast)
          Positioned(
            left: 11,
            top: 26,
            bottom: 0,
            child: Container(
              width: 2,
              decoration: BoxDecoration(
                color: node.isCompleted
                    ? AppColors.secondary.withValues(alpha: 0.65)
                    : const Color(0xFFE2E8F0),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              margin: const EdgeInsets.only(top: 2),
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: node.isCompleted
                    ? AppColors.secondary
                    : const Color(0xFFF1F5F9),
                border: Border.all(
                  color: node.isCompleted
                      ? AppColors.secondary.withValues(alpha: 0.3)
                      : const Color(0xFFCBD5E1),
                  width: 2,
                ),
                boxShadow: node.isCompleted
                    ? [
                        BoxShadow(
                          color: AppColors.secondary.withValues(alpha: 0.25),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ]
                    : null,
              ),
              child: node.isCompleted
                  ? const Icon(
                      Icons.check_rounded,
                      color: Colors.white,
                      size: 14,
                    )
                  : Center(
                      child: Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: Color(0xFF94A3B8),
                        ),
                      ),
                    ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Padding(
                padding: EdgeInsets.only(bottom: isLast ? 4.0 : 22.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            node.title,
                            style: GoogleFonts.poppins(
                              fontSize: 13.5,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF0F172A),
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            node.subtitle,
                            style: GoogleFonts.nunito(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF64748B),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 9,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: node.isCompleted
                            ? AppColors.secondary.withValues(alpha: 0.12)
                            : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        node.isCompleted ? 'COMPLETED'.tr : 'PENDING'.tr,
                        style: GoogleFonts.poppins(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: node.isCompleted
                              ? AppColors.secondary
                              : const Color(0xFF64748B),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  List<_RouteNode> _buildRouteNodesList(Map<String, dynamic>? trip) {
    final originFull = (trip?['startLocation'] ?? trip?['pickup'] ?? 'Origin').toString();
    final destFull = (trip?['endLocation'] ?? trip?['destination'] ?? 'Destination').toString();

    final originCity = originFull.split(',')[0].trim();
    final destCity = destFull.split(',')[0].trim();

    List<String> rawWaypoints = [];
    if (trip?['routeCities'] is List) {
      rawWaypoints = (trip!['routeCities'] as List).map((e) => e.toString().trim()).where((s) => s.isNotEmpty).toList();
    } else if (trip?['intermediateCities'] is List) {
      rawWaypoints = (trip!['intermediateCities'] as List).map((e) => e.toString().trim()).where((s) => s.isNotEmpty).toList();
    } else if (trip?['route'] is List) {
      rawWaypoints = (trip!['route'] as List).map((e) => e.toString().trim()).where((s) => s.isNotEmpty).toList();
    }

    if (rawWaypoints.isEmpty) {
      final oLower = originCity.toLowerCase();
      final dLower = destCity.toLowerCase();
      if (oLower.contains('hyderabad') && dLower.contains('vijayawada')) {
        rawWaypoints = ['Suryapet', 'Kodad', 'Nandigama'];
      } else if (oLower.contains('vijayawada') && dLower.contains('hyderabad')) {
        rawWaypoints = ['Nandigama', 'Kodad', 'Suryapet'];
      } else if (oLower.contains('hyderabad') && dLower.contains('khammam')) {
        rawWaypoints = ['Suryapet'];
      } else if (oLower.contains('chennai') && dLower.contains('bengaluru')) {
        rawWaypoints = ['Vellore', 'Krishnagiri'];
      }
    }

    List<Map<String, dynamic>> fuelEntries = [];
    if (trip?['fuelEntries'] is List) {
      fuelEntries = (trip!['fuelEntries'] as List).cast<Map<String, dynamic>>();
    } else if (trip?['fuelDetails'] is Map<String, dynamic>) {
      fuelEntries = [trip!['fuelDetails'] as Map<String, dynamic>];
    }

    Map<String, Map<String, dynamic>> fuelByCity = {};
    for (final f in fuelEntries) {
      final loc = (f['location'] ?? f['city'] ?? '').toString().trim();
      if (loc.isNotEmpty) {
        fuelByCity[loc.toLowerCase()] = f;
      }
    }

    List<_RouteNode> nodes = [];

    nodes.add(_RouteNode(
      city: originCity,
      role: 'origin',
      fuelData: fuelByCity[originCity.toLowerCase()],
    ));

    for (final wp in rawWaypoints) {
      if (wp.toLowerCase() == originCity.toLowerCase() || wp.toLowerCase() == destCity.toLowerCase()) continue;
      final fData = fuelByCity[wp.toLowerCase()];
      nodes.add(_RouteNode(
        city: wp,
        role: fData != null ? 'fuel_stop' : 'waypoint',
        fuelData: fData,
      ));
    }

    for (final f in fuelEntries) {
      final fCity = (f['location'] ?? f['city'] ?? '').toString().trim();
      if (fCity.isEmpty) continue;
      final fLower = fCity.toLowerCase();
      final alreadyIncluded = nodes.any((n) => n.city.toLowerCase() == fLower) || destCity.toLowerCase() == fLower;
      if (!alreadyIncluded) {
        nodes.add(_RouteNode(
          city: fCity,
          role: 'fuel_stop',
          fuelData: f,
        ));
      }
    }

    nodes.add(_RouteNode(
      city: destCity,
      role: 'destination',
      fuelData: fuelByCity[destCity.toLowerCase()],
    ));

    return nodes;
  }

  Widget _buildRouteTimelineWidget(Map<String, dynamic>? trip) {
    final nodes = _buildRouteNodesList(trip);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 26,
              height: 26,
              decoration: BoxDecoration(
                color: AppColors.secondary.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.alt_route_rounded,
                color: AppColors.secondary,
                size: 15,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'ONGOING TRIP ROUTE & FUEL STOPS'.tr,
                style: GoogleFonts.poppins(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF475569),
                  letterSpacing: 0.6,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: nodes.length,
          itemBuilder: (context, index) {
            final node = nodes[index];
            final isFirst = index == 0;
            final isLast = index == nodes.length - 1;
            final isFuel = node.role == 'fuel_stop' || node.fuelData != null;

            final Color dotColor = isFirst
                ? const Color(0xFF2563EB)
                : (isLast
                      ? const Color(0xFFEF4444)
                      : (isFuel ? AppColors.success : const Color(0xFF64748B)));

            final IconData iconData = isFirst
                ? Icons.trip_origin_rounded
                : (isLast
                      ? Icons.location_on_rounded
                      : (isFuel
                            ? Icons.local_gas_station_rounded
                            : Icons.fiber_manual_record_rounded));

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: isFuel
                      ? const EdgeInsets.symmetric(horizontal: 12, vertical: 10)
                      : const EdgeInsets.symmetric(vertical: 2),
                  decoration: isFuel
                      ? BoxDecoration(
                          color: const Color(0xFFECFDF5),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFA7F3D0)),
                        )
                      : null,
                  child: Row(
                    children: [
                      Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: dotColor.withValues(alpha: 0.14),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: dotColor.withValues(alpha: 0.35),
                            width: 1,
                          ),
                        ),
                        child: Icon(
                          iconData,
                          size: isFirst || isLast || isFuel ? 15 : 8,
                          color: dotColor,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (isFuel) ...[
                              Text(
                                '${'Fuel Purchased'.tr} – ${node.city}',
                                style: GoogleFonts.poppins(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFF15803D),
                                ),
                              ),
                              if (node.fuelData != null) ...[
                                const SizedBox(height: 2),
                                Text(
                                  '${node.fuelData!['fuelStation'] ?? 'Fuel Station'} • ${node.fuelData!['liters'] ?? 0}L',
                                  style: GoogleFonts.nunito(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: const Color(0xFF166534),
                                  ),
                                ),
                              ],
                            ] else ...[
                              if (isFirst || isLast)
                                Text(
                                  isFirst ? 'Origin'.tr : 'Destination'.tr,
                                  style: GoogleFonts.nunito(
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w700,
                                    color: dotColor,
                                    letterSpacing: 0.4,
                                  ),
                                ),
                              Text(
                                node.city,
                                style: GoogleFonts.poppins(
                                  fontSize: isFirst || isLast ? 14 : 13,
                                  fontWeight: isFirst || isLast
                                      ? FontWeight.w700
                                      : FontWeight.w600,
                                  color: isFirst || isLast
                                      ? const Color(0xFF0F172A)
                                      : const Color(0xFF475569),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                if (!isLast)
                  Padding(
                    padding: EdgeInsets.only(
                      left: isFuel ? 25.0 : 13.0,
                      top: 3.0,
                      bottom: 3.0,
                    ),
                    child: Container(
                      width: 2,
                      height: 18,
                      decoration: BoxDecoration(
                        color: nodes[index + 1].role == 'fuel_stop'
                            ? AppColors.success.withValues(alpha: 0.5)
                            : const Color(0xFFCBD5E1),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
      ],
    );
  }
}

class _RouteNode {
  final String city;
  final String role; // 'origin', 'waypoint', 'fuel_stop', 'destination'
  final Map<String, dynamic>? fuelData;

  _RouteNode({required this.city, required this.role, this.fuelData});
}

class _ManifestNode {
  final String title;
  final String subtitle;
  final bool isCompleted;

  _ManifestNode(this.title, this.subtitle, this.isCompleted);
}
