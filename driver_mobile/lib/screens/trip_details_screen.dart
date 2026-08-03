import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:convert';
import 'package:url_launcher/url_launcher.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_radius.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';
import '../utils/date_formatter.dart';

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
  bool _isUploadingPod = false;
  bool _isUploadingWeighbridge = false;
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

  void _showInvoiceDialog(BuildContext context, Map<String, dynamic> trip, String invoiceNo) {
    showDialog(
      context: context,
      builder: (context) {
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

        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 500),
            padding: const EdgeInsets.all(24),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Speshway Logistics',
                            style: GoogleFonts.poppins(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppColors.secondary,
                            ),
                          ),
                          Text(
                            'Billing & Dispatch',
                            style: GoogleFonts.nunito(
                              fontSize: 11,
                              color: AppColors.secondaryText,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const Divider(height: 24, color: AppColors.divider),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.divider.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      children: [
                        _buildRowItem('Invoice Number', invoiceNo, isBoldValue: true),
                        const SizedBox(height: 4),
                        _buildRowItem('Invoice Date', DateTime.now().toString().split(' ')[0]),
                        const SizedBox(height: 4),
                        _buildRowItem('Trip ID', trip['tripNumber'] ?? 'N/A'),
                        const SizedBox(height: 4),
                        _buildRowItem('Trip Status', trip['status'] ?? 'N/A', isBoldValue: true),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'TRIP DETAILS',
                    style: GoogleFonts.poppins(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppColors.secondaryText,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const Divider(height: 12, color: AppColors.divider),
                  _buildRowItem('Pickup Location', startLocation),
                  _buildRowItem('Destination', endLocation),
                  _buildRowItem('Departure', departureTime),
                  _buildRowItem('ETA', eta),
                  _buildRowItem('Distance', distance),
                  _buildRowItem('Cargo Type', cargoType),
                  _buildRowItem('Cargo Weight', cargoWeight),
                  const SizedBox(height: 16),
                  Text(
                    'ASSETS & DRIVER',
                    style: GoogleFonts.poppins(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppColors.secondaryText,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const Divider(height: 12, color: AppColors.divider),
                  _buildRowItem('Vehicle Name', vehicleName),
                  _buildRowItem('Vehicle Plate', vehiclePlate),
                  _buildRowItem('Driver Name', driverName),
                  _buildRowItem('Driver Phone', driverPhone),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.pop(context),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.divider),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          child: Text(
                            'Close',
                            style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.secondaryText),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            Navigator.pop(context);
                            printInvoice(trip, invoiceNo);
                          },
                          icon: const Icon(Icons.download, size: 16, color: Colors.white),
                          label: Text(
                            'Download',
                            style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.success,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
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

  Widget _buildDocumentRow(
    String label,
    String status, {
    required bool isUploaded,
    required bool isUploading,
    required VoidCallback onUpload,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
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
                  isUploaded ? 'Status: Uploaded ✅' : 'Status: Pending Upload ⚠️',
                  style: GoogleFonts.poppins(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: isUploaded ? AppColors.success : const Color(0xFFD97706),
                  ),
                ),
              ],
            ),
          ),
          ElevatedButton.icon(
            onPressed: (isUploading || isUploaded) ? null : onUpload,
            icon: isUploading
                ? const SizedBox(
                    width: 12,
                    height: 12,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : Icon(
                    isUploaded ? Icons.check_circle : Icons.upload_file_rounded,
                    size: 14,
                    color: Colors.white,
                  ),
            label: Text(
              isUploaded ? 'Uploaded' : 'Upload',
              style: GoogleFonts.poppins(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: isUploaded ? AppColors.success : AppColors.secondary,
              disabledBackgroundColor: isUploaded ? AppColors.success : const Color(0xFF9CA3AF),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRowItem(String label, String value, {bool isBoldValue = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.nunito(
              fontSize: 12,
              color: AppColors.secondaryText,
              fontWeight: FontWeight.w500,
            ),
          ),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 12,
              fontWeight: isBoldValue ? FontWeight.bold : FontWeight.w600,
              color: AppColors.primaryText,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInvoiceDetailRow(String label, String value) {
    final hasInvoice = value != 'N/A' && value.isNotEmpty;
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
                InkWell(
                  onTap: () => _showInvoiceDialog(context, _trip!, value),
                  borderRadius: BorderRadius.circular(4),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.secondary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: AppColors.secondary.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.visibility,
                          size: 12,
                          color: AppColors.secondary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'View',
                          style: GoogleFonts.poppins(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: AppColors.secondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                InkWell(
                  onTap: () => printInvoice(_trip!, value),
                  borderRadius: BorderRadius.circular(4),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.success.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: AppColors.success.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.download,
                          size: 12,
                          color: AppColors.success,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Download',
                          style: GoogleFonts.poppins(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: AppColors.success,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
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
        }
      } else {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  bool _isStartEnabled(String? departureTimeStr) {
    return true;
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

  Future<void> _uploadPodFromDetails() async {
    setState(() => _isUploadingPod = true);
    try {
      final rawId = _trip?['tripId'] ?? _trip?['_id'] ?? widget.tripId;
      final cleanId = rawId.toString().replaceAll('#', '').trim();
      await ApiService.uploadProofOfDelivery(
        tripId: cleanId,
        customerName: _trip?['deliveryAddress']?['contactPerson'] ?? 'Customer Receiver',
        receiverName: 'Verified Receiver',
        customerSignatureUrl: 'https://via.placeholder.com/300x100.png?text=Signature',
        deliveryPhotoUrl: 'https://via.placeholder.com/300x300.png?text=Delivery+Photo',
        podDocumentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Proof of Delivery (POD) uploaded successfully!'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
          ),
        );
        _fetchTripDetails();
      }
    } catch (e, stack) {
      debugPrint('POD Upload Exception: $e\n$stack');
      if (mounted) {
        final errStr = e.toString().replaceAll('Exception: ', '');
        final isEngineError = errStr.contains('is not defined') || errStr.contains('ReferenceError') || errStr.contains('TypeError');
        final msg = isEngineError ? 'Unable to upload document. Please try again.' : errStr;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(msg),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isUploadingPod = false);
    }
  }

  Future<void> _uploadWeighbridgeFromDetails() async {
    setState(() => _isUploadingWeighbridge = true);
    try {
      final rawId = _trip?['tripId'] ?? _trip?['_id'] ?? widget.tripId;
      final cleanId = rawId.toString().replaceAll('#', '').trim();
      await ApiService.uploadWeighbridgeSlip(
        tripId: cleanId,
        grossWeight: 25000,
        tareWeight: 10000,
        netWeight: 15000,
        location: _trip?['endLocation'] ?? 'Highway Weighbridge Station',
        documentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Weighbridge Slip uploaded successfully!'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
          ),
        );
        _fetchTripDetails();
      }
    } catch (e, stack) {
      debugPrint('Weighbridge Upload Exception: $e\n$stack');
      if (mounted) {
        final errStr = e.toString().replaceAll('Exception: ', '');
        final isEngineError = errStr.contains('is not defined') || errStr.contains('ReferenceError') || errStr.contains('TypeError');
        final msg = isEngineError ? 'Unable to upload document. Please try again.' : errStr;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(msg),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isUploadingWeighbridge = false);
    }
  }

  Future<void> _handleCompleteTrip() async {
    final podStatus = (_trip?['podStatus'] ?? 'Not Uploaded').toString();
    final weighbridgeStatus = (_trip?['weighbridgeStatus'] ?? 'Not Uploaded').toString();
    final hasPod = ['uploaded', 'pending', 'approved'].contains(podStatus.toLowerCase());
    final hasWeighbridge = ['uploaded', 'pending', 'approved'].contains(weighbridgeStatus.toLowerCase());

    if (!hasPod || !hasWeighbridge) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please upload both Proof of Delivery and Weighbridge Slip before completing the trip.'),
          backgroundColor: AppColors.error,
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
      final cleanId = rawId.toString().replaceAll('#', '').trim();
      await ApiService.updateTripStatus(cleanId, 'Completed');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Trip completed successfully!'),
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
    final origin = _trip?['pickup'] ?? _trip?['startLocation'] ?? 'Hyderabad';
    final destination = _trip?['destination'] ?? _trip?['endLocation'] ?? 'Chennai';
    final distanceVal = _trip?['estimatedDistance'] ?? _trip?['distance'];
    final distance = (distanceVal != null && distanceVal != 0 && distanceVal != '0')
        ? (distanceVal.toString().endsWith('km') || distanceVal.toString().endsWith('mi')
            ? distanceVal.toString()
            : '$distanceVal km')
        : '285 km';
    final estTime = formatIndianDateTime(_trip?['eta']);

    // Driver/Vehicle details
    final driverName = _trip?['driverName'] ?? 'Unassigned';
    final vehiclePlate = _trip?['vehiclePlate'] ?? '';
    final vehicleName = _trip?['vehicleName'] ?? '';
    final truckId = (vehicleName.isNotEmpty && vehiclePlate.isNotEmpty)
        ? '$vehicleName ($vehiclePlate)'
        : (vehiclePlate.isNotEmpty ? vehiclePlate : (vehicleName.isNotEmpty ? vehicleName : (_trip?['vehicle'] ?? 'Unassigned')));
    final weight = _trip?['cargoWeight'] != null ? '${_trip!['cargoWeight']} Tons' : 'N/A';
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
                          // Path display (Origin to Destination)
                          Stack(
                            children: [
                              Positioned(
                                left: 5,
                                top: 10,
                                bottom: 10,
                                child: Container(
                                  width: 1,
                                  color: AppColors.divider,
                                  child: const VerticalDivider(
                                    color: Colors.grey,
                                    thickness: 1,
                                    indent: 4,
                                    endIndent: 4,
                                  ),
                                ),
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        width: 10,
                                        height: 10,
                                        decoration: const BoxDecoration(
                                          color: Color(0xFF3B82F6),
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              'Origin',
                                              style: GoogleFonts.poppins(
                                                fontSize: 9,
                                                color: AppColors.secondaryText,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                            Text(
                                              origin,
                                              style: GoogleFonts.poppins(
                                                fontSize: 14,
                                                fontWeight: FontWeight.bold,
                                                color: AppColors.primaryText,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 16),
                                  Row(
                                    children: [
                                      Container(
                                        width: 10,
                                        height: 10,
                                        decoration: const BoxDecoration(
                                          color: Color(0xFFEF4444),
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              'Destination',
                                              style: GoogleFonts.poppins(
                                                fontSize: 9,
                                                color: AppColors.secondaryText,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                            Text(
                                              destination,
                                              style: GoogleFonts.poppins(
                                                fontSize: 14,
                                                fontWeight: FontWeight.bold,
                                                color: AppColors.primaryText,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
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
                              final podStatusStr = (_trip?['podStatus'] ?? 'Not Uploaded').toString();
                              final wbStatusStr = (_trip?['weighbridgeStatus'] ?? 'Not Uploaded').toString();
                              final hasPod = ['uploaded', 'pending', 'approved'].contains(podStatusStr.toLowerCase());
                              final hasWb = ['uploaded', 'pending', 'approved'].contains(wbStatusStr.toLowerCase());

                              return Column(
                                children: [
                                  _buildDocumentRow(
                                    'Proof of Delivery (POD)',
                                    podStatusStr,
                                    isUploaded: hasPod,
                                    isUploading: _isUploadingPod,
                                    onUpload: _uploadPodFromDetails,
                                  ),
                                  _buildDocumentRow(
                                    'Weighbridge Slip',
                                    wbStatusStr,
                                    isUploaded: hasWb,
                                    isUploading: _isUploadingWeighbridge,
                                    onUpload: _uploadWeighbridgeFromDetails,
                                  ),
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
                      ElevatedButton.icon(
                        onPressed: _isSubmitting ? null : _handleStartTrip,
                        icon: const Icon(
                          Icons.play_arrow_rounded,
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
                                'Start Trip',
                                style: GoogleFonts.poppins(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                  color: Colors.white,
                                ),
                              ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFFF6A00),
                          foregroundColor: Colors.white,
                          minimumSize: const Size(double.infinity, 50),
                          elevation: 2,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                    ] else if (rawStatus.toLowerCase() == 'in progress' || rawStatus.toLowerCase() == 'on transit') ...[
                      const SizedBox(height: 24),
                      Builder(
                        builder: (context) {
                          final podStatusStr = (_trip?['podStatus'] ?? 'Not Uploaded').toString();
                          final wbStatusStr = (_trip?['weighbridgeStatus'] ?? 'Not Uploaded').toString();
                          final hasPod = ['uploaded', 'pending', 'approved'].contains(podStatusStr.toLowerCase());
                          final hasWb = ['uploaded', 'pending', 'approved'].contains(wbStatusStr.toLowerCase());
                          final canComplete = hasPod && hasWb;

                          return Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
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
                              MouseRegion(
                                cursor: canComplete ? SystemMouseCursors.click : SystemMouseCursors.forbidden,
                                child: ElevatedButton.icon(
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
                              ),
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
}

class _ManifestNode {
  final String title;
  final String subtitle;
  final bool isCompleted;

  _ManifestNode(this.title, this.subtitle, this.isCompleted);
}
