import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../constants/app_colors.dart';
import '../constants/app_radius.dart';
import '../constants/app_spacing.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';
import '../services/api_service.dart';

class InvoiceScreen extends StatefulWidget {
  final String? invoiceNumber;
  final String? tripId;
  final Map<String, dynamic>? tripData;

  const InvoiceScreen({
    super.key,
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
      final targetId = (widget.tripId != null && widget.tripId!.trim().isNotEmpty)
          ? widget.tripId!
          : (widget.tripData?['tripNumber'] ?? widget.tripData?['_id'] ?? widget.invoiceNumber ?? '');
      final cleanId = targetId.toString().replaceAll('#', '').trim();

      if (cleanId.isNotEmpty) {
        final invRes = await ApiService.getInvoiceByTripId(cleanId);
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
      }

      if (widget.tripData != null) {
        final trip = widget.tripData!;
        final invNum = trip['invoiceNumber'] ?? (trip['tripInvoice'] is Map ? trip['tripInvoice']['invoiceNumber'] : null);
        if (invNum != null && invNum.toString().trim().isNotEmpty) {
          if (mounted) {
            setState(() {
              _invoiceData = _buildInvoiceFromTrip(trip);
              _isLoading = false;
              _noInvoiceExists = false;
            });
          }
          return;
        }
      }

      if (cleanId.isNotEmpty) {
        final tripRes = await ApiService.getTripDetails(cleanId);
        if (tripRes != null && tripRes['data'] != null) {
          final trip = Map<String, dynamic>.from(tripRes['data']);
          final invNum = trip['invoiceNumber'] ?? (trip['tripInvoice'] is Map ? trip['tripInvoice']['invoiceNumber'] : null);
          if (invNum != null && invNum.toString().trim().isNotEmpty) {
            if (mounted) {
              setState(() {
                _invoiceData = _buildInvoiceFromTrip(trip);
                _isLoading = false;
                _noInvoiceExists = false;
              });
            }
            return;
          }
        }
      }

      if (mounted) {
        setState(() {
          _isLoading = false;
          _noInvoiceExists = true;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _noInvoiceExists = true;
        });
      }
    }
  }

  Map<String, dynamic> _buildInvoiceFromTrip(Map<String, dynamic> trip) {
    final invNum = trip['invoiceNumber'] ?? (trip['tripInvoice'] is Map ? trip['tripInvoice']['invoiceNumber'] : 'INV-${trip['tripNumber'] ?? '001'}');
    double dist = 0.0;
    if (trip['actualDistance'] != null) {
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
      'invoiceDate': trip['createdAt'] ?? trip['actualEndTime'],
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
    if (dateStr == null || dateStr.isEmpty) return '--';
    try {
      final dt = DateTime.parse(dateStr).toLocal();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return '${dt.day} ${months[dt.month - 1]} ${dt.year}';
    } catch (_) {
      return dateStr;
    }
  }

  String _formatCurrency(num value) {
    final str = value.round().toString();
    final RegExp reg = RegExp(r'(\d)(?=(\d{3})+(?!\d))');
    return '₹${str.replaceAllMapped(reg, (Match match) => '${match[1]},')}';
  }

  Future<void> _openPdfUrl(String url) async {
    if (url.isEmpty) return;
    try {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Could not open document URL.')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error launching document: $e')),
        );
      }
    }
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
            'No Invoice Found',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.primaryText,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'No invoice has been generated for this trip.',
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
    final charges = (inv['charges'] is Map) ? Map<String, dynamic>.from(inv['charges']) : <String, dynamic>{};

    final invoiceNumber = inv['invoiceNumber']?.toString() ?? '--';
    final dateStr = _formatDate(inv['invoiceDate']?.toString());
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
    final fromMobile = pickupAddr?['mobile'] ?? pickupAddr?['mobileNumber'] ?? trip['driverPhone'] ?? '--';
    final fromStreet = pickupAddr?['streetAddress'] ?? trip['startLocation'] ?? '--';
    final fromCity = pickupAddr?['city'] ?? trip['startLocation'] ?? '--';
    final fromState = pickupAddr?['state'] ?? '';

    final toCompanyName = deliveryAddr?['companyName'] ?? '${trip['endLocation'] ?? 'Destination'} Depot';
    final toContactPerson = deliveryAddr?['contactPerson'] ?? trip['receiverName'] ?? 'Receiving Desk';
    final toMobile = deliveryAddr?['mobile'] ?? deliveryAddr?['mobileNumber'] ?? '--';
    final toStreet = deliveryAddr?['streetAddress'] ?? trip['endLocation'] ?? '--';
    final toCity = deliveryAddr?['city'] ?? trip['endLocation'] ?? '--';
    final toState = deliveryAddr?['state'] ?? '';

    // Charges
    final num freight = charges['freightCharges'] ?? 0;
    final num loading = charges['loadingCharges'] ?? 0;
    final num unloading = charges['unloadingCharges'] ?? 0;
    final num fuel = charges['fuelCharges'] ?? 0;
    final num toll = charges['tollCharges'] ?? 0;
    final num subtotal = charges['subtotal'] ?? (freight + loading + unloading + fuel + toll);
    final num tax = charges['gstTax'] ?? (subtotal * 0.18);
    final num total = charges['totalAmount'] ?? (subtotal + tax);

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
            fromStreet,
            fromCity,
            fromState,
            toCompanyName,
            toContactPerson,
            toMobile,
            toStreet,
            toCity,
            toState,
          ),
          AppSpacing.verticalSm,

          // 3. Cargo & Vehicle Information Card
          _buildCargoVehicleCard(context, trip),
          AppSpacing.verticalSm,

          // 4. Financial Summary Card
          _buildSummaryCard(
            context,
            _formatCurrency(freight),
            _formatCurrency(loading),
            _formatCurrency(unloading),
            _formatCurrency(fuel),
            _formatCurrency(toll),
            _formatCurrency(tax),
            _formatCurrency(total),
          ),
          AppSpacing.verticalSm,

          // 5. PDF Document Preview Card (If PDF URL exists)
          if (pdfUrl.isNotEmpty) ...[
            _buildDocumentPreviewCard(context, invoiceNumber, pdfUrl),
            AppSpacing.verticalSm,
          ],

          // 6. Action Footer
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
    final isPaid = status.toLowerCase() == 'paid';
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
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: isPaid ? const Color(0xFFE8F5E9) : const Color(0xFFFFF3E0),
                  borderRadius: BorderRadius.circular(AppRadius.round),
                ),
                child: Text(
                  status,
                  style: TextStyle(
                    color: isPaid ? const Color(0xFF2E7D32) : const Color(0xFFE65100),
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                  ),
                ),
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
    String fromStreet,
    String fromCity,
    String fromState,
    String toCompany,
    String toContact,
    String toMobile,
    String toStreet,
    String toCity,
    String toState,
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
            street: fromStreet,
            city: fromCity,
            state: fromState,
            titleColor: AppColors.secondary,
          ),
          const SizedBox(height: 12),
          _buildAddressBox(
            title: 'TO ADDRESS',
            company: toCompany,
            contact: toContact,
            mobile: toMobile,
            street: toStreet,
            city: toCity,
            state: toState,
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
    required String street,
    required String city,
    required String state,
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
          _buildMiniDetail('Address', '$street, $city ${state.isNotEmpty ? "- $state" : ""}'),
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

  Widget _buildSummaryCard(
    BuildContext context,
    String freight,
    String loading,
    String unloading,
    String fuel,
    String toll,
    String tax,
    String grandTotal,
  ) {
    return CustomCard(
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
            decoration: const BoxDecoration(
              color: Color(0xFFF0F4FA),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(AppRadius.lg),
                topRight: Radius.circular(AppRadius.lg),
              ),
            ),
            child: const Text(
              'Charges Summary',
              style: TextStyle(
                color: AppColors.primaryText,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                _buildSummaryRow('Freight Charges', freight),
                const SizedBox(height: 10),
                _buildSummaryRow('Loading Charges', loading),
                const SizedBox(height: 10),
                _buildSummaryRow('Unloading Charges', unloading),
                const SizedBox(height: 10),
                _buildSummaryRow('Fuel Expenses', fuel),
                const SizedBox(height: 10),
                _buildSummaryRow('Toll Charges', toll),
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 12.0),
                  child: Divider(color: AppColors.divider),
                ),
                _buildSummaryRow('GST / Tax (18%)', tax),
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Total Amount',
                      style: TextStyle(
                        color: AppColors.primaryText,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    Text(
                      grandTotal,
                      style: const TextStyle(
                        color: AppColors.secondary,
                        fontWeight: FontWeight.bold,
                        fontSize: 20,
                      ),
                    ),
                  ],
                ),
              ],
            ),
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

  Widget _buildSummaryRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppColors.secondaryText,
            fontSize: 13,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            color: AppColors.primaryText,
            fontWeight: FontWeight.w600,
            fontSize: 13,
          ),
        ),
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
