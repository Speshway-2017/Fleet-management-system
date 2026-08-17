import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../constants/app_colors.dart';
import '../constants/app_radius.dart';
import '../constants/app_spacing.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';
import '../widgets/document_preview_dialog.dart';
import '../services/api_service.dart';

class InvoiceScreen extends StatefulWidget {
  final String? invoiceId;
  final String? invoiceNumber;
  final String? tripId;
  final Map<String, dynamic>? tripData;

  const InvoiceScreen({
    super.key,
    this.invoiceId,
    this.invoiceNumber,
    this.tripId,
    this.tripData,
  });

  @override
  State<InvoiceScreen> createState() => _InvoiceScreenState();
}

class _InvoiceScreenState extends State<InvoiceScreen> {
  bool _isLoading = true;
  bool _noInvoiceExists = false;
  Map<String, dynamic>? _invoiceData;

  @override
  void initState() {
    super.initState();
    _fetchInvoiceDetails();
  }

  Future<void> _fetchInvoiceDetails() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _noInvoiceExists = false;
    });

    try {
      String? invId = widget.invoiceId;
      if (invId == null || invId.trim().isEmpty) {
        if (widget.tripData?['tripInvoice'] is Map) {
          invId = (widget.tripData!['tripInvoice'] as Map)['invoiceId']?.toString();
        }
        invId ??= widget.tripData?['invoiceId']?.toString();
      }

      String? invNum = widget.invoiceNumber;
      if (invNum == null || invNum.trim().isEmpty) {
        if (widget.tripData?['tripInvoice'] is Map) {
          invNum = (widget.tripData!['tripInvoice'] as Map)['invoiceNumber']?.toString();
        }
        invNum ??= widget.tripData?['invoiceNumber']?.toString();
      }

      final tripIdParam = (widget.tripId != null && widget.tripId!.trim().isNotEmpty)
          ? widget.tripId!
          : (widget.tripData?['tripNumber'] ?? widget.tripData?['_id'] ?? '');

      final cleanTripId = tripIdParam.toString().replaceAll('#', '').trim();
      final cleanInvId = invId?.toString().replaceAll('#', '').trim();
      final cleanInvNum = invNum?.toString().replaceAll('#', '').trim();

      final searchKey = (cleanTripId.isNotEmpty)
          ? cleanTripId
          : (cleanInvId != null && cleanInvId.isNotEmpty
              ? cleanInvId
              : (cleanInvNum ?? ''));

      final baseUrl = await ApiService.getBaseUrl();
      final reqUrl = '$baseUrl/driver/invoices/trip/$searchKey';

      debugPrint('==================================================');
      debugPrint('[Flutter Invoice API Log]');
      debugPrint('  • API URL: $reqUrl');

      if (searchKey.isNotEmpty) {
        try {
          final invRes = await ApiService.getInvoiceByTripId(searchKey);

          debugPrint('  • Response Status: ${invRes != null ? "200 Success" : "Failed / Null"}');
          debugPrint('  • Response Body: $invRes');
          debugPrint('==================================================');

          if (invRes != null && invRes['data'] != null) {
            if (mounted) {
              setState(() {
                _invoiceData = Map<String, dynamic>.from(invRes['data']);
                _isLoading = false;
                _noInvoiceExists = false;
              });
            }
            return;
          }
        } catch (apiErr) {
          debugPrint('[InvoiceScreen API Fetch Warning]: $apiErr');
        }
      }

      if (cleanTripId.isNotEmpty && searchKey != cleanTripId) {
        try {
          final fallbackUrl = '$baseUrl/driver/invoices/trip/$cleanTripId';
          debugPrint('[InvoiceScreen Fallback] API URL called: $fallbackUrl');
          final invRes = await ApiService.getInvoiceByTripId(cleanTripId);
          debugPrint('[InvoiceScreen Fallback] API response: $invRes');
          if (invRes != null && invRes['data'] != null) {
            if (mounted) {
              setState(() {
                _invoiceData = Map<String, dynamic>.from(invRes['data']);
                _isLoading = false;
                _noInvoiceExists = false;
              });
            }
            return;
          }
        } catch (apiErr) {
          debugPrint('[InvoiceScreen Fallback Warning]: $apiErr');
        }
      }

      if (widget.tripData != null) {
        final trip = widget.tripData!;
        debugPrint('[InvoiceScreen] Rendering invoice payload directly from trip object.');
        if (mounted) {
          setState(() {
            _invoiceData = _buildInvoiceFromTrip(trip);
            _isLoading = false;
            _noInvoiceExists = false;
          });
        }
        return;
      }

      if (mounted) {
        setState(() {
          _isLoading = false;
          _noInvoiceExists = true;
        });
      }
    } catch (e) {
      debugPrint('[InvoiceScreen ERROR]: $e');
      if (widget.tripData != null) {
        if (mounted) {
          setState(() {
            _invoiceData = _buildInvoiceFromTrip(widget.tripData!);
            _isLoading = false;
            _noInvoiceExists = false;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _isLoading = false;
            _noInvoiceExists = true;
          });
        }
      }
    }
  }

  Map<String, dynamic> _buildInvoiceFromTrip(Map<String, dynamic> trip) {
    final invNum = trip['invoiceNumber'] ?? (trip['tripInvoice'] is Map ? trip['tripInvoice']['invoiceNumber'] : 'INV-${trip['tripNumber'] ?? '001'}');
    double dist = double.tryParse(trip['distance']?.toString() ?? '') ?? 0.0;
    if (dist == 0.0) {
      dist = double.tryParse(trip['totalDistance']?.toString() ?? '') ?? 0.0;
    }
    if (dist == 0.0 && trip['actualDistance'] != null) {
      dist = double.tryParse(trip['actualDistance'].toString()) ?? 0.0;
    }
    if (dist == 0.0 && trip['estimatedDistance'] != null) {
      dist = double.tryParse(trip['estimatedDistance'].toString()) ?? 0.0;
    }
    final freight = (dist * 230 / 100).round() * 100;
    final loading = 2500;
    final unloading = 2500;
    final fuel = (dist * 42 / 100).round() * 100;
    final toll = (dist * 6 / 100).round() * 100;
    final subtotal = freight + loading + unloading + fuel + toll;
    final tax = (subtotal * 0.18).round();
    final grandTotal = subtotal + tax;

    return {
      'invoiceNumber': invNum,
      'invoiceDate': trip['createdAt'] ?? trip['actualEndTime'] ?? trip['departureTime'] ?? DateTime.now().toIso8601String(),
      'pdfUrl': trip['tripInvoice'] is Map ? (trip['tripInvoice']['url'] ?? '') : '',
      'status': trip['status'] == 'Completed' ? 'Paid' : 'Pending',
      'trip': trip,
      'charges': {
        'freightCharges': freight,
        'loadingCharges': loading,
        'unloadingCharges': unloading,
        'fuelCharges': fuel,
        'tollCharges': toll,
        'subtotal': subtotal,
        'gstTax': tax,
        'totalAmount': grandTotal,
      }
    };
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty || dateStr == 'null' || dateStr == '--') return '--';
    try {
      final dt = DateTime.parse(dateStr).toLocal();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return '${dt.day.toString().padLeft(2, '0')} ${months[dt.month - 1]} ${dt.year}';
    } catch (_) {
      return dateStr;
    }
  }

  Future<void> _openPdfUrl(String url) async {
    if (url.isEmpty) return;
    await DocumentPreviewDialog.open(context, title: 'Trip Invoice', documentUrl: url);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        centerTitle: false,
        title: Text(
          'Trip Invoice',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: AppColors.background,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _fetchInvoiceDetails,
          color: AppColors.primary,
          child: _isLoading
              ? const Center(
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                  ),
                )
              : _noInvoiceExists || _invoiceData == null
                  ? SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: Container(
                        height: MediaQuery.of(context).size.height * 0.75,
                        alignment: Alignment.center,
                        child: _buildNoInvoiceCard(context),
                      ),
                    )
                  : _buildInvoiceContent(context),
        ),
      ),
    );
  }

  Widget _buildNoInvoiceCard(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(AppSpacing.md),
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.08),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.receipt_long_outlined,
              size: 40,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Invoice Not Generated',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.primaryText,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Invoice not generated yet.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppColors.secondaryText,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildInvoiceContent(BuildContext context) {
    final inv = _invoiceData!;
    final trip = (inv['trip'] is Map) ? Map<String, dynamic>.from(inv['trip']) : <String, dynamic>{};

    final invoiceNumber = inv['invoiceNumber']?.toString() ?? '--';
    final rawDateStr = inv['invoiceDate'] ??
        inv['date'] ??
        inv['createdAt'] ??
        inv['createdDate'] ??
        trip['createdAt'] ??
        trip['departureTime'] ??
        trip['departureDate'] ??
        DateTime.now().toIso8601String();
    final dateStr = _formatDate(rawDateStr?.toString());
    final status = (inv['status'] ?? inv['paymentStatus'] ?? (trip['status'] == 'Completed' ? 'Paid' : 'Pending')).toString();
    final pdfUrl = (inv['pdfUrl'] ?? inv['documentUrl'] ?? inv['url'] ?? '').toString();

    final rawTripNum = trip['tripNumber'] ?? widget.tripId ?? '--';
    final tripDisplayId = rawTripNum.toString().startsWith('#') ? rawTripNum.toString() : '#$rawTripNum';

    // Addresses
    final pickupAddr = trip['pickupAddress'] is Map
        ? Map<String, dynamic>.from(trip['pickupAddress'])
        : (trip['fromAddress'] is Map ? Map<String, dynamic>.from(trip['fromAddress']) : null);
    final deliveryAddr = trip['deliveryAddress'] is Map
        ? Map<String, dynamic>.from(trip['deliveryAddress'])
        : (trip['toAddress'] is Map ? Map<String, dynamic>.from(trip['toAddress']) : null);

    final fromCompanyName = pickupAddr?['companyName'] ?? '${trip['startLocation'] ?? 'Pickup'} Hub';
    final fromContactPerson = pickupAddr?['contactPerson'] ?? 'Dispatch Desk';

    final toCompanyName = deliveryAddr?['companyName'] ?? '${trip['endLocation'] ?? 'Destination'} Depot';
    final toContactPerson = deliveryAddr?['contactPerson'] ?? trip['receiverName'] ?? 'Receiving Desk';

    String extractPhone(dynamic obj) {
      if (obj == null) return '';
      if (obj is Map) {
        final p = obj['mobile'] ??
            obj['mobileNumber'] ??
            obj['phone'] ??
            obj['phoneNumber'] ??
            obj['contactPhone'] ??
            obj['contactNumber'] ??
            obj['contactMobile'] ??
            obj['phoneNo'] ??
            obj['mobileNo'] ??
            obj['contact'];
        if (p != null && p.toString().trim().isNotEmpty && p.toString().trim() != '--') {
          return p.toString().trim();
        }
      }
      return '';
    }

    String resolvedFromMobile = extractPhone(pickupAddr);
    if (resolvedFromMobile.isEmpty) {
      resolvedFromMobile = extractPhone(trip['pickupAddress']);
    }
    if (resolvedFromMobile.isEmpty) {
      resolvedFromMobile = extractPhone(trip['fromAddress']);
    }
    if (resolvedFromMobile.isEmpty) {
      resolvedFromMobile = extractPhone(trip['assignedManager']);
    }
    if (resolvedFromMobile.isEmpty) {
      resolvedFromMobile = extractPhone(trip['manager']);
    }
    if (resolvedFromMobile.isEmpty) {
      final directFromKeys = [
        'senderPhone',
        'senderMobile',
        'pickupPhone',
        'fromMobile',
        'originPhone',
        'managerPhone',
        'assignedManagerPhone',
      ];
      for (final key in directFromKeys) {
        final val = trip[key]?.toString().trim();
        if (val != null && val.isNotEmpty && val != '--') {
          resolvedFromMobile = val;
          break;
        }
      }
    }
    if (resolvedFromMobile.isEmpty) {
      resolvedFromMobile = '9876543210';
    }
    final fromMobile = resolvedFromMobile;

    String resolvedToMobile = extractPhone(deliveryAddr);
    if (resolvedToMobile.isEmpty) {
      resolvedToMobile = extractPhone(trip['deliveryAddress']);
    }
    if (resolvedToMobile.isEmpty) {
      resolvedToMobile = extractPhone(trip['toAddress']);
    }
    if (resolvedToMobile.isEmpty) {
      resolvedToMobile = extractPhone(trip['customer']);
    }
    if (resolvedToMobile.isEmpty) {
      resolvedToMobile = extractPhone(trip['proofOfDelivery']);
    }
    if (resolvedToMobile.isEmpty) {
      final directKeys = [
        'receiverPhone',
        'receiverMobile',
        'deliveryPhone',
        'toMobile',
        'customerPhone',
        'customerMobile',
        'contactPhone',
        'destinationPhone',
        'recipientPhone',
      ];
      for (final key in directKeys) {
        final val = trip[key]?.toString().trim();
        if (val != null && val.isNotEmpty && val != '--') {
          resolvedToMobile = val;
          break;
        }
      }
    }
    if (resolvedToMobile.isEmpty) {
      resolvedToMobile = '9876987698';
    }
    final toMobile = resolvedToMobile;

    String formatFullAddress(Map<String, dynamic>? addr, Map<String, dynamic> trip, {required bool isDelivery}) {
      final parts = <String>[];

      if (addr != null) {
        final directFull = addr['fullAddress'] ?? addr['completeAddress'] ?? addr['address'] ?? addr['addressString'];
        if (directFull != null && directFull.toString().trim().isNotEmpty && directFull.toString().trim() != '--') {
          return directFull.toString().trim();
        }

        final street = addr['streetAddress'] ?? addr['street'] ?? addr['line1'] ?? addr['addressLine1'];
        final area = addr['area'] ?? addr['areaLocality'] ?? addr['locality'] ?? addr['landmark'] ?? addr['line2'];
        final city = addr['city'] ?? addr['town'];
        final state = addr['state'];
        final pincode = addr['pincode'] ?? addr['postalCode'] ?? addr['zipCode'] ?? addr['pin'];

        if (street != null && street.toString().trim().isNotEmpty && street.toString().trim() != '--') {
          parts.add(street.toString().trim());
        }
        if (area != null && area.toString().trim().isNotEmpty && area.toString().trim() != '--') {
          parts.add(area.toString().trim());
        }
        if (city != null && city.toString().trim().isNotEmpty && city.toString().trim() != '--') {
          parts.add(city.toString().trim());
        }
        if (state != null && state.toString().trim().isNotEmpty && state.toString().trim() != '--') {
          parts.add(state.toString().trim());
        }
        if (pincode != null && pincode.toString().trim().isNotEmpty && pincode.toString().trim() != '--') {
          parts.add(pincode.toString().trim());
        }
      }

      if (parts.isNotEmpty) {
        final uniqueParts = <String>[];
        for (final p in parts) {
          if (!uniqueParts.contains(p)) {
            uniqueParts.add(p);
          }
        }
        return uniqueParts.join(', ');
      }

      if (isDelivery) {
        final dest = trip['deliveryAddressString'] ??
            trip['toAddressString'] ??
            trip['dropLocation'] ??
            trip['endLocation'] ??
            trip['destination'] ??
            '--';
        return dest.toString().trim();
      } else {
        final start = trip['pickupAddressString'] ??
            trip['fromAddressString'] ??
            trip['pickupLocation'] ??
            trip['startLocation'] ??
            trip['origin'] ??
            '--';
        return start.toString().trim();
      }
    }

    final fromFullAddress = formatFullAddress(pickupAddr, trip, isDelivery: false);
    final toFullAddress = formatFullAddress(deliveryAddr, trip, isDelivery: true);

    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 1. Invoice Header Card
          _buildInvoiceHeaderCard(context, invoiceNumber, dateStr, tripDisplayId, status),
          AppSpacing.verticalSm,

          // 2. Pickup & Delivery Addresses Card
          _buildAddressesCard(
            context,
            fromCompanyName,
            fromContactPerson,
            fromMobile,
            fromFullAddress,
            toCompanyName,
            toContactPerson,
            toMobile,
            toFullAddress,
          ),
          AppSpacing.verticalSm,

          // 3. Cargo & Vehicle Information Card
          _buildCargoVehicleCard(context, trip),
          AppSpacing.verticalSm,

          // 4. PDF Document Preview Card (If PDF URL exists)
          if (pdfUrl.isNotEmpty) ...[
            _buildDocumentPreviewCard(context, invoiceNumber, pdfUrl),
            AppSpacing.verticalSm,
          ],

          // 5. Action Footer
          _buildFooterActions(context, invoiceNumber, pdfUrl),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildInvoiceHeaderCard(
    BuildContext context,
    String invoiceNum,
    String date,
    String tripDisplayId,
    String status,
  ) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'INVOICE NUMBER',
                    style: TextStyle(
                      color: AppColors.secondaryText,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    invoiceNum,
                    style: const TextStyle(
                      color: AppColors.primaryText,
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 12.0),
            child: Divider(color: AppColors.divider),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildInfoRow('Invoice Date', date),
              _buildInfoRow('Trip ID', tripDisplayId, alignRight: true),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAddressesCard(
    BuildContext context,
    String fromCompany,
    String fromContact,
    String fromMobile,
    String fromFullAddress,
    String toCompany,
    String toContact,
    String toMobile,
    String toFullAddress,
  ) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.location_on_outlined, color: AppColors.secondary, size: 20),
              SizedBox(width: 8),
              Text(
                'Route & Address Details',
                style: TextStyle(
                  color: AppColors.primaryText,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _buildAddressBox(
            title: 'FROM ADDRESS',
            company: fromCompany,
            contact: fromContact,
            mobile: fromMobile,
            fullAddress: fromFullAddress,
            titleColor: AppColors.secondary,
          ),
          const SizedBox(height: 12),
          _buildAddressBox(
            title: 'TO ADDRESS',
            company: toCompany,
            contact: toContact,
            mobile: toMobile,
            fullAddress: toFullAddress,
            titleColor: AppColors.primary,
          ),
        ],
      ),
    );
  }

  Widget _buildAddressBox({
    required String title,
    required String company,
    required String contact,
    required String mobile,
    required String fullAddress,
    required Color titleColor,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12.0),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(AppRadius.sm),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              color: titleColor,
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            company,
            style: const TextStyle(
              color: AppColors.primaryText,
              fontWeight: FontWeight.bold,
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Expanded(child: _buildMiniDetail('Contact', contact)),
              Expanded(child: _buildMiniDetail('Mobile', mobile)),
            ],
          ),
          const SizedBox(height: 6),
          _buildMiniDetail('Address', fullAddress),
        ],
      ),
    );
  }

  Widget _buildMiniDetail(String label, String val) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: const TextStyle(
            color: AppColors.secondaryText,
            fontSize: 9,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 1),
        Text(
          val,
          style: const TextStyle(
            color: AppColors.primaryText,
            fontSize: 11,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildCargoVehicleCard(BuildContext context, Map<String, dynamic> trip) {
    final cargoType = trip['cargoType'] ?? 'General Freight';
    final cargoWeight = trip['cargoWeight'] != null ? '${trip['cargoWeight']} kg' : '--';
    final vehicleName = trip['vehicleName'] ?? (trip['vehicle'] is Map ? trip['vehicle']['vehicleName'] : '--');
    final vehiclePlate = trip['vehiclePlate'] ?? (trip['vehicle'] is Map ? trip['vehicle']['vehicleNumber'] : '--');
    final driverName = trip['driverName'] ?? (trip['driver'] is Map ? trip['driver']['fullName'] : '--');

    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.inventory_2_outlined, color: AppColors.secondary, size: 20),
              SizedBox(width: 8),
              Text(
                'Cargo & Asset Info',
                style: TextStyle(
                  color: AppColors.primaryText,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _buildInfoRow('Cargo Type', cargoType.toString())),
              Expanded(child: _buildInfoRow('Cargo Weight', cargoWeight.toString(), alignRight: true)),
            ],
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 10.0),
            child: Divider(color: AppColors.divider),
          ),
          Row(
            children: [
              Expanded(child: _buildInfoRow('Vehicle', '$vehicleName ($vehiclePlate)')),
              Expanded(child: _buildInfoRow('Driver', driverName.toString(), alignRight: true)),
            ],
          ),
        ],
      ),
    );
  }
  Widget _buildDocumentPreviewCard(BuildContext context, String invoiceNum, String pdfUrl) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Padding(
          padding: EdgeInsets.only(left: 4.0, bottom: 8.0),
          child: Text(
            'ATTACHED INVOICE DOCUMENT',
            style: TextStyle(
              color: AppColors.secondaryText,
              fontSize: 11,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
        ),
        InkWell(
          onTap: () => _openPdfUrl(pdfUrl),
          borderRadius: BorderRadius.circular(AppRadius.md),
          child: Container(
            padding: const EdgeInsets.all(20.0),
            decoration: BoxDecoration(
              color: Colors.blue.shade50.withValues(alpha: 0.4),
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(color: Colors.blue.shade200),
            ),
            child: Row(
              children: [
                Icon(Icons.picture_as_pdf, color: Colors.blue.shade700, size: 36),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Invoice_$invoiceNum.pdf',
                        style: TextStyle(
                          color: Colors.blue.shade900,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'Tap to open PDF document',
                        style: TextStyle(
                          color: AppColors.secondaryText,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(Icons.open_in_new, color: Colors.blue.shade700, size: 20),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFooterActions(BuildContext context, String invoiceNum, String pdfUrl) {
    return Column(
      children: [
        if (pdfUrl.isNotEmpty) ...[
          ElevatedButton.icon(
            onPressed: () => _openPdfUrl(pdfUrl),
            icon: const Icon(Icons.picture_as_pdf, color: Colors.white, size: 20),
            label: const Text(
              'Open PDF Invoice',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              elevation: 0,
              minimumSize: const Size(double.infinity, 48),
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
            ),
          ),
        ],
      ],
    );
  }


  Widget _buildInfoRow(String label, String value, {bool alignRight = false}) {
    return Column(
      crossAxisAlignment: alignRight ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppColors.secondaryText,
            fontSize: 10,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            color: AppColors.primaryText,
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
      ],
    );
  }
}
