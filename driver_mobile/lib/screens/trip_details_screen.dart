import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:convert';
import 'package:url_launcher/url_launcher.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_radius.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';
import '../widgets/upload_required_documents_dialog.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';
import '../utils/date_formatter.dart';
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



  Widget _buildDocumentStatusRow(String label, String rawStatusStr) {
    final statusTrim = rawStatusStr.trim();
    final statusLower = statusTrim.toLowerCase();

    Color badgeBg;
    Color badgeText;
    String displayStatus;
    IconData statusIcon;

    if (statusLower == 'approved') {
      displayStatus = 'Approved';
      badgeBg = const Color(0xFFDCFCE7);
      badgeText = const Color(0xFF15803D);
      statusIcon = Icons.check_circle_rounded;
    } else if (statusLower == 'rejected') {
      displayStatus = 'Rejected';
      badgeBg = const Color(0xFFFEE2E2);
      badgeText = const Color(0xFFB91C1C);
      statusIcon = Icons.cancel_rounded;
    } else if (statusLower == 'pending' || statusLower == 'pending approval' || statusLower == 'waiting for manager approval') {
      displayStatus = 'Pending Approval';
      badgeBg = const Color(0xFFFEF3C7);
      badgeText = const Color(0xFFB45309);
      statusIcon = Icons.hourglass_top_rounded;
    } else if (statusLower == 'uploaded') {
      displayStatus = 'Uploaded';
      badgeBg = const Color(0xFFDBEAFE);
      badgeText = const Color(0xFF1D4ED8);
      statusIcon = Icons.task_alt_rounded;
    } else {
      displayStatus = 'Not Uploaded';
      badgeBg = const Color(0xFFF3F4F6);
      badgeText = const Color(0xFF6B7280);
      statusIcon = Icons.remove_circle_outline_rounded;
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              label,
              style: GoogleFonts.nunito(
                fontSize: 13,
                color: AppColors.primaryText,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: badgeBg,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(statusIcon, size: 14, color: badgeText),
                const SizedBox(width: 5),
                Text(
                  displayStatus,
                  style: GoogleFonts.poppins(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: badgeText,
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
      return InkWell(
        onTap: () {
          String? invId;
          if (_trip?['tripInvoice'] is Map) {
            invId = (_trip!['tripInvoice'] as Map)['invoiceId']?.toString();
          }
          invId ??= _trip?['invoiceId']?.toString();

          String? invNum = value.isNotEmpty ? value : _trip?['invoiceNumber']?.toString();
          if ((invNum == null || invNum.isEmpty) && _trip?['tripInvoice'] is Map) {
            invNum = (_trip!['tripInvoice'] as Map)['invoiceNumber']?.toString();
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
        borderRadius: BorderRadius.circular(4),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: AppColors.secondary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(4),
            border: Border.all(color: AppColors.secondary.withValues(alpha: 0.3)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.visibility,
                size: 13,
                color: AppColors.secondary,
              ),
              const SizedBox(width: 4),
              Text(
                'View',
                style: GoogleFonts.poppins(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: AppColors.secondary,
                ),
              ),
            ],
          ),
        ),
      );
    }

    Widget buildDownloadButton() {
      return InkWell(
        onTap: () => printInvoice(_trip!, value),
        borderRadius: BorderRadius.circular(4),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: AppColors.success.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(4),
            border: Border.all(color: AppColors.success.withValues(alpha: 0.3)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.download,
                size: 13,
                color: AppColors.success,
              ),
              const SizedBox(width: 4),
              Text(
                'Download',
                style: GoogleFonts.poppins(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: AppColors.success,
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (isMobile) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 6.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    label,
                    style: GoogleFonts.nunito(
                      fontSize: 13,
                      color: AppColors.secondaryText,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Flexible(
                  child: Text(
                    value,
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primaryText,
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

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.nunito(
              fontSize: 13,
              color: AppColors.secondaryText,
              fontWeight: FontWeight.w500,
            ),
          ),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                value,
                style: GoogleFonts.poppins(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryText,
                ),
              ),
              if (hasInvoice) ...[
                const SizedBox(width: 8),
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
    if (widget.tripData != null) {
      _trip = widget.tripData;
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
    try {
      final cleanId = widget.tripId.replaceAll('#', '').trim();
      final res = await ApiService.getTripDetails(cleanId);
      if (res != null && res['data'] != null) {
        if (mounted) {
          setState(() {
            _trip = res['data'];
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

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.nunito(
              fontSize: 13,
              color: AppColors.secondaryText,
              fontWeight: FontWeight.w500,
            ),
          ),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryText,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final activeId = _trip?['tripNumber'] ?? widget.tripId;
    final rawStatus = (_trip?['status'] ?? 'Scheduled').toString();
    
    final isCompleted = rawStatus.toLowerCase() == 'completed';
    final isInProgress = rawStatus.toLowerCase() == 'in progress' || rawStatus.toLowerCase() == 'on transit' || rawStatus.toLowerCase() == 'enroute';
    final isAcceptedOrScheduled = ['accepted', 'scheduled', 'assigned'].contains(rawStatus.toLowerCase());
    final isPending = ['pending', 'pending driver acceptance'].contains(rawStatus.toLowerCase());
    
    final statusText = rawStatus.toUpperCase();
    final statusColor = isPending
        ? Colors.orange
        : (isAcceptedOrScheduled ? AppColors.secondary : (isCompleted ? AppColors.success : Colors.blue));

    // Dynamic or fallback locations
    final origin = _trip?['pickup'] ?? _trip?['startLocation'] ?? 'N/A';
    final destination = _trip?['destination'] ?? _trip?['endLocation'] ?? 'N/A';
    final distanceVal = _trip?['distance'] ?? _trip?['totalDistance'] ?? _trip?['estimatedDistance'] ?? _trip?['actualDistance'];
    final distance = (distanceVal != null && distanceVal != 0 && distanceVal != '0')
        ? (distanceVal.toString().toLowerCase().endsWith('km') || distanceVal.toString().toLowerCase().endsWith('mi')
            ? distanceVal.toString()
            : '$distanceVal km')
        : '0 km';

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

    // Manifest nodes
    final manifestNodes = isCompleted
        ? [
            _ManifestNode('Regional Logistics Hub', '$origin • 06:00 AM', true),
            _ManifestNode('Warehouse B', 'Midway Point • 08:30 AM', true),
            _ManifestNode('Distribution Center', 'Final Checkpoint • 12:00 PM', true),
            _ManifestNode('Destination Terminal', '$destination • 02:30 PM', true),
          ]
        : [
            _ManifestNode('Logistics Hub', '$origin • Departure', isInProgress || isCompleted),
            _ManifestNode('Midway Checkpoint', 'Enroute Terminal • Scheduled', isCompleted),
            _ManifestNode('Destination Terminal', '$destination • Arrival', isCompleted),
          ];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        centerTitle: false,
        title: Text(
          'Trip Details',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : SingleChildScrollView(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Trip Summary Card
                    CustomCard(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'TRIP ID',
                                      style: GoogleFonts.poppins(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.secondaryText,
                                      ),
                                    ),
                                    Text(
                                      activeId.startsWith('#') ? activeId : '#$activeId',
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.poppins(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.primaryText,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: statusColor.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  statusText,
                                  style: GoogleFonts.poppins(
                                    color: statusColor,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          AppSpacing.verticalMd,
                          // Multi-city Route & Fuel Stops Timeline
                          _buildRouteTimelineWidget(_trip),
                        ],
                      ),
                    ),
                    AppSpacing.verticalMd,

                    // 2-Metric Boxes Row
                    Row(
                      children: [
                        Expanded(
                          child: _buildMetricCard(
                            icon: Icons.alt_route_outlined,
                            label: 'Distance',
                            value: distance,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _buildMetricCard(
                            icon: Icons.access_time,
                            label: 'Est. Time',
                            value: estTime,
                          ),
                        ),
                      ],
                    ),
                    AppSpacing.verticalMd,

                    // Driver & Truck Info Card (Dark Navy)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0D1C2E),
                        borderRadius: BorderRadius.circular(AppRadius.lg),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 42,
                                height: 42,
                                decoration: BoxDecoration(
                                  border: Border.all(color: Colors.white24, width: 1.5),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(
                                  Icons.person,
                                  color: Colors.white70,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      driverName,
                                      style: GoogleFonts.poppins(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                                    Text(
                                      'VEHICLE: $truckId',
                                      style: GoogleFonts.nunito(
                                        fontSize: 12,
                                        color: Colors.white60,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          // Visual progress indicator line
                          Container(
                            height: 3,
                            decoration: BoxDecoration(
                              color: Colors.white12,
                              borderRadius: BorderRadius.circular(2),
                            ),
                            child: FractionallySizedBox(
                              alignment: Alignment.centerLeft,
                              widthFactor: isCompleted ? 1.0 : (isInProgress ? 0.65 : 0.0),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: AppColors.secondary,
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    AppSpacing.verticalMd,

                    // Cargo, Contact, Documents & Notes details card
                    CustomCard(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.inventory_2_outlined, color: AppColors.secondary, size: 18),
                              const SizedBox(width: 8),
                              Text(
                                'CARGO & SHIPMENT',
                                style: GoogleFonts.poppins(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.secondaryText,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                          const Divider(height: 24, color: AppColors.divider),
                          _buildDetailRow('Cargo Type', _trip?['cargoType'] ?? 'General Cargo'),
                          _buildDetailRow('Cargo Weight', weight),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              const Icon(Icons.contact_phone_outlined, color: AppColors.secondary, size: 18),
                              const SizedBox(width: 8),
                              Text(
                                'CONTACT & MANAGER',
                                style: GoogleFonts.poppins(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.secondaryText,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                          const Divider(height: 24, color: AppColors.divider),
                          _buildDetailRow('Dispatch Manager', managerName),
                          _buildDetailRow('Manager Phone', _trip?['manager']?['phone'] ?? 'N/A'),
                          _buildDetailRow('Manager Email', _trip?['manager']?['email'] ?? 'N/A'),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              const Icon(Icons.description_outlined, color: AppColors.secondary, size: 18),
                              const SizedBox(width: 8),
                              Text(
                                'DOCUMENTS STATUS',
                                style: GoogleFonts.poppins(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.secondaryText,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                          const Divider(height: 24, color: AppColors.divider),
                          Builder(
                            builder: (context) {
                              final podStatusStr = (_trip?['podStatus'] ?? _trip?['proofOfDelivery']?['status'] ?? 'Not Uploaded').toString();
                              final wbStatusStr = (_trip?['weighbridgeStatus'] ?? _trip?['weighbridgeSlip']?['status'] ?? 'Not Uploaded').toString();

                              return Column(
                                children: [
                                  _buildDocumentStatusRow('Proof of Delivery (POD)', podStatusStr),
                                  _buildDocumentStatusRow('Weighbridge Slip', wbStatusStr),
                                ],
                              );
                            },
                          ),
                          _buildInvoiceDetailRow('Trip Invoice', _trip?['invoiceNumber'] ?? 'N/A'),
                          if (_trip?['tripNotes'] != null && _trip!['tripNotes'].toString().isNotEmpty) ...[
                            const SizedBox(height: 16),
                            Row(
                              children: [
                                const Icon(Icons.note_alt_outlined, color: AppColors.secondary, size: 18),
                                const SizedBox(width: 8),
                                Text(
                                  'TRIP NOTES',
                                  style: GoogleFonts.poppins(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.secondaryText,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ],
                            ),
                            const Divider(height: 24, color: AppColors.divider),
                            Text(
                              _trip!['tripNotes'].toString(),
                              style: GoogleFonts.nunito(
                                fontSize: 13,
                                color: AppColors.primaryText,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    AppSpacing.verticalLg,

                    // TRIP MANIFEST Title
                    Text(
                      'TRIP MANIFEST',
                      style: GoogleFonts.poppins(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: AppColors.secondaryText,
                        letterSpacing: 0.5,
                      ),
                    ),
                    AppSpacing.verticalSm,

                    // Trip Manifest Timeline Card
                    CustomCard(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: List.generate(
                          manifestNodes.length,
                          (index) {
                            final node = manifestNodes[index];
                            return _buildManifestNodeItem(
                              node: node,
                              isLast: index == manifestNodes.length - 1,
                            );
                          },
                        ),
                      ),
                    ),

                    // Accept/Reject, Start Trip or Complete Trip buttons
                    if (isPending) ...[
                      const SizedBox(height: 24),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: _isSubmitting ? null : () => _handleRespond('reject'),
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: AppColors.error, width: 1.5),
                                foregroundColor: AppColors.error,
                                padding: const EdgeInsets.symmetric(vertical: 14.0),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10.0),
                                ),
                              ),
                              child: Text(
                                'Reject',
                                style: GoogleFonts.poppins(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: _isSubmitting ? null : () => _handleRespond('accept'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.success,
                                foregroundColor: Colors.white,
                                elevation: 0,
                                padding: const EdgeInsets.symmetric(vertical: 14.0),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10.0),
                                ),
                              ),
                              child: _isSubmitting
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                    )
                                  : Text(
                                      'Accept Trip',
                                      style: GoogleFonts.poppins(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                      ),
                                    ),
                            ),
                          ),
                        ],
                      ),
                    ] else if (isAcceptedOrScheduled) ...[
                      const SizedBox(height: 24),
                      Builder(
                        builder: (context) {
                          final depTime = _trip?['departureTime'] ?? _trip?['scheduledDeparture'];
                          final canStart = _isStartEnabled(depTime);

                          return Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              ElevatedButton.icon(
                                onPressed: (_isSubmitting || !canStart) ? null : _handleStartTrip,
                                icon: Icon(
                                  canStart ? Icons.play_arrow_rounded : Icons.lock_clock,
                                  color: Colors.white,
                                  size: 22,
                                ),
                                label: _isSubmitting
                                    ? const SizedBox(
                                        width: 20,
                                        height: 20,
                                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                      )
                                    : Text(
                                        canStart ? 'Start Trip' : 'Start Trip (Locked until 15m before departure)',
                                        style: GoogleFonts.poppins(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 14,
                                          color: Colors.white,
                                        ),
                                      ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: canStart ? const Color(0xFFFF6A00) : const Color(0xFF8E9CAE),
                                  disabledBackgroundColor: const Color(0xFF8E9CAE),
                                  disabledForegroundColor: Colors.white70,
                                  minimumSize: const Size(double.infinity, 50),
                                  elevation: 2,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              ),
                              if (!canStart) ...[
                                const SizedBox(height: 8),
                                Text(
                                  'Departure window opens 15 minutes before scheduled start.',
                                  style: GoogleFonts.nunito(
                                    fontSize: 11,
                                    color: AppColors.secondaryText,
                                    fontWeight: FontWeight.w600,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ],
                          );
                        },
                      ),
                    ] else if (rawStatus.toLowerCase() == 'in progress' || rawStatus.toLowerCase() == 'on transit') ...[
                      const SizedBox(height: 24),
                      Builder(
                        builder: (context) {
                          final isEnded = _isTripEnded(_trip);
                          final podStatusStr = (_trip?['podStatus'] ?? 'Not Uploaded').toString();
                          final wbStatusStr = (_trip?['weighbridgeStatus'] ?? 'Not Uploaded').toString();
                          final hasPod = ['uploaded', 'pending', 'approved'].contains(podStatusStr.toLowerCase());
                          final hasWb = ['uploaded', 'pending', 'approved'].contains(wbStatusStr.toLowerCase());
                          final canComplete = isEnded && hasPod && hasWb;

                          return Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              ElevatedButton.icon(
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => AddFuelEntryScreen(
                                        tripId: _trip?['_id']?.toString() ?? widget.tripId,
                                      ),
                                    ),
                                  );
                                },
                                icon: const Icon(Icons.local_gas_station_rounded, color: Colors.white),
                                label: Text(
                                  'Record Fuel Purchase',
                                  style: GoogleFonts.poppins(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                    color: Colors.white,
                                  ),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.secondary,
                                  foregroundColor: Colors.white,
                                  minimumSize: const Size(double.infinity, 48),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              ),
                              const SizedBox(height: 12),
                              if (!isEnded) ...[
                                ElevatedButton.icon(
                                  onPressed: _isSubmitting ? null : _handleEndTrip,
                                  icon: const Icon(Icons.flag_rounded, color: Colors.white, size: 20),
                                  label: _isSubmitting
                                      ? const SizedBox(
                                          width: 20,
                                          height: 20,
                                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                        )
                                      : Text(
                                          'End Trip',
                                          style: GoogleFonts.poppins(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 15,
                                            color: Colors.white,
                                          ),
                                        ),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFFDC2626),
                                    foregroundColor: Colors.white,
                                    minimumSize: const Size(double.infinity, 50),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Note: Click "End Trip" upon arrival at destination to unlock POD & Weighbridge slip uploads.',
                                  style: GoogleFonts.nunito(
                                    fontSize: 11,
                                    color: AppColors.secondaryText,
                                    fontWeight: FontWeight.w600,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ] else ...[
                                if (!canComplete) ...[
                                  Container(
                                    padding: const EdgeInsets.all(14.0),
                                    margin: const EdgeInsets.only(bottom: 12.0),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFFFFBEB),
                                      borderRadius: BorderRadius.circular(10.0),
                                      border: Border.all(color: const Color(0xFFFCD34D)),
                                    ),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            const Icon(Icons.info_outline, color: Color(0xFFD97706), size: 18),
                                            const SizedBox(width: 8),
                                            Expanded(
                                              child: Text(
                                                'Mandatory Uploads Required',
                                                style: GoogleFonts.poppins(
                                                  fontSize: 13,
                                                  fontWeight: FontWeight.bold,
                                                  color: const Color(0xFF92400E),
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 8),
                                        Row(
                                          children: [
                                            Icon(
                                              hasPod ? Icons.check_circle : Icons.radio_button_unchecked,
                                              color: hasPod ? const Color(0xFF16A34A) : const Color(0xFFD97706),
                                              size: 16,
                                            ),
                                            const SizedBox(width: 8),
                                            Text(
                                              '• Proof of Delivery (POD)${hasPod ? ' (Uploaded)' : ''}',
                                              style: GoogleFonts.nunito(
                                                fontSize: 12,
                                                fontWeight: hasPod ? FontWeight.bold : FontWeight.w600,
                                                color: hasPod ? const Color(0xFF16A34A) : const Color(0xFF92400E),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 4),
                                        Row(
                                          children: [
                                            Icon(
                                              hasWb ? Icons.check_circle : Icons.radio_button_unchecked,
                                              color: hasWb ? const Color(0xFF16A34A) : const Color(0xFFD97706),
                                              size: 16,
                                            ),
                                            const SizedBox(width: 8),
                                            Text(
                                              '• Weighbridge Slip${hasWb ? ' (Uploaded)' : ''}',
                                              style: GoogleFonts.nunito(
                                                fontSize: 12,
                                                fontWeight: hasWb ? FontWeight.bold : FontWeight.w600,
                                                color: hasWb ? const Color(0xFF16A34A) : const Color(0xFF92400E),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                                ElevatedButton.icon(
                                  onPressed: (_isSubmitting || !canComplete) ? null : _handleCompleteTrip,
                                  icon: Icon(
                                    canComplete ? Icons.check_circle : Icons.lock_rounded,
                                    color: Colors.white,
                                  ),
                                  label: _isSubmitting
                                      ? const SizedBox(
                                          width: 20,
                                          height: 20,
                                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                        )
                                      : Text(
                                          'Complete Trip',
                                          style: GoogleFonts.poppins(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 14,
                                            color: Colors.white,
                                          ),
                                        ),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: canComplete ? AppColors.primary : const Color(0xFF8E9CAE),
                                    disabledBackgroundColor: const Color(0xFF8E9CAE),
                                    disabledForegroundColor: Colors.white70,
                                    minimumSize: const Size(double.infinity, 48),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                ),
                              ],
                            ],
                          );
                        },
                      ),
                    ] else if (rawStatus.toLowerCase() == 'waiting for manager approval') ...[
                      const SizedBox(height: 24),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16.0),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFFBEB),
                          borderRadius: BorderRadius.circular(12.0),
                          border: Border.all(color: const Color(0xFFF59E0B), width: 1.5),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.hourglass_top_rounded, color: Color(0xFFD97706), size: 22),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    'Waiting for Manager Approval',
                                    style: GoogleFonts.poppins(
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                      color: const Color(0xFF92400E),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Text(
                              'Your trip completion request has been submitted.\n\nThe Fleet Manager is reviewing your uploaded documents. You will be notified once the review is complete.',
                              style: GoogleFonts.nunito(
                                fontSize: 13,
                                height: 1.4,
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
    );
  }

  Widget _buildMetricCard({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        children: [
          Icon(icon, color: AppColors.secondary, size: 22),
          const SizedBox(height: 6),
          Text(
            label,
            style: GoogleFonts.nunito(
              fontSize: 11,
              color: AppColors.secondaryText,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryText,
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
            left: 10,
            top: 20,
            bottom: 0,
            child: Container(
              width: 1.5,
              color: AppColors.secondary,
            ),
          ),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              margin: const EdgeInsets.only(top: 2),
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: node.isCompleted ? AppColors.secondary : AppColors.divider,
              ),
              child: node.isCompleted
                  ? const Icon(
                      Icons.check,
                      color: Colors.white,
                      size: 14,
                    )
                  : const SizedBox(),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 24.0),
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
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryText,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            node.subtitle,
                            style: GoogleFonts.nunito(
                              fontSize: 12,
                              color: AppColors.secondaryText,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      node.isCompleted ? 'COMPLETED' : 'PENDING',
                      style: GoogleFonts.poppins(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: node.isCompleted ? AppColors.secondary : AppColors.secondaryText,
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
            const Icon(Icons.alt_route_rounded, color: AppColors.secondary, size: 18),
            const SizedBox(width: 8),
            Text(
              'ONGOING TRIP ROUTE & FUEL STOPS',
              style: GoogleFonts.poppins(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: AppColors.secondaryText,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: nodes.length,
          itemBuilder: (context, index) {
            final node = nodes[index];
            final isFirst = index == 0;
            final isLast = index == nodes.length - 1;
            final isFuel = node.role == 'fuel_stop' || node.fuelData != null;

            Color dotColor = isFirst
                ? const Color(0xFF3B82F6)
                : (isLast
                    ? const Color(0xFFEF4444)
                    : (isFuel ? AppColors.success : const Color(0xFF64748B)));

            IconData iconData = isFirst
                ? Icons.trip_origin_rounded
                : (isLast
                    ? Icons.location_on_rounded
                    : (isFuel ? Icons.local_gas_station_rounded : Icons.location_city_rounded));

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: isFuel ? const EdgeInsets.symmetric(horizontal: 12, vertical: 8) : const EdgeInsets.symmetric(vertical: 2),
                  decoration: isFuel
                      ? BoxDecoration(
                          color: const Color(0xFFDCFCE7),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFF86EFAC)),
                        )
                      : null,
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(5),
                        decoration: BoxDecoration(
                          color: dotColor.withValues(alpha: 0.15),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(iconData, size: 16, color: dotColor),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (isFuel) ...[
                              Row(
                                children: [
                                  const Icon(Icons.location_on_rounded, size: 14, color: AppColors.success),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      '🟢 Fuel Purchased – ${node.city}',
                                      style: GoogleFonts.poppins(
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                        color: const Color(0xFF15803D),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              if (node.fuelData != null) ...[
                                const SizedBox(height: 2),
                                Text(
                                  '${node.fuelData!['fuelStation'] ?? 'Fuel Station'} • ${node.fuelData!['liters'] ?? 0}L',
                                  style: GoogleFonts.nunito(
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w600,
                                    color: const Color(0xFF166534),
                                  ),
                                ),
                              ],
                            ] else ...[
                              Row(
                                children: [
                                  const Icon(Icons.location_on_outlined, size: 14, color: AppColors.secondaryText),
                                  const SizedBox(width: 4),
                                  Text(
                                    isFirst ? 'Origin (${node.city})' : (isLast ? 'Destination (${node.city})' : node.city),
                                    style: GoogleFonts.poppins(
                                      fontSize: 13.5,
                                      fontWeight: isFirst || isLast ? FontWeight.bold : FontWeight.w600,
                                      color: AppColors.primaryText,
                                    ),
                                  ),
                                ],
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
                    padding: const EdgeInsets.only(left: 14.0, top: 4.0, bottom: 4.0),
                    child: Row(
                      children: [
                        Container(
                          width: 2,
                          height: 16,
                          color: nodes[index + 1].role == 'fuel_stop' ? AppColors.success : AppColors.divider,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '↓',
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: nodes[index + 1].role == 'fuel_stop' ? AppColors.success : AppColors.secondaryText,
                          ),
                        ),
                      ],
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
