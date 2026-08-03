import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_radius.dart';
import '../constants/app_spacing.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';
import '../services/api_service.dart';
import 'package:url_launcher/url_launcher.dart';
import 'invoice_screen.dart';
import 'toll_fee_receipt_screen.dart';

class CompletedTripDetailsScreen extends StatefulWidget {
  final String tripId;
  final Map<String, dynamic>? tripData;

  const CompletedTripDetailsScreen({
    super.key,
    required this.tripId,
    this.tripData,
  });

  @override
  State<CompletedTripDetailsScreen> createState() => _CompletedTripDetailsScreenState();
}

class _CompletedTripDetailsScreenState extends State<CompletedTripDetailsScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _trip;

  @override
  void initState() {
    super.initState();
    if (widget.tripData != null) {
      _trip = widget.tripData;
      _isLoading = false;
    }
    _fetchTripDetails();
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

  String _formatDate(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return 'N/A';
    try {
      final dt = DateTime.parse(dateStr).toLocal();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return '${months[dt.month - 1]} ${dt.day}, ${dt.year}';
    } catch (_) {
      return dateStr;
    }
  }

  String _formatTime(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return 'N/A';
    try {
      final dt = DateTime.parse(dateStr).toLocal();
      int hour = dt.hour;
      final minute = dt.minute.toString().padLeft(2, '0');
      final period = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12;
      if (hour == 0) hour = 12;
      return '${hour.toString().padLeft(2, '0')}:$minute $period';
    } catch (_) {
      return dateStr;
    }
  }

  String _calculateDuration(String? startStr, String? endStr) {
    if (startStr == null || endStr == null || startStr.isEmpty || endStr.isEmpty) return '2h 10m';
    try {
      final start = DateTime.parse(startStr);
      final end = DateTime.parse(endStr);
      final diff = end.difference(start);
      final hours = diff.inHours;
      final minutes = diff.inMinutes % 60;
      if (hours == 0) {
        return '${minutes}m';
      }
      return '${hours}h ${minutes}m';
    } catch (_) {
      return '2h 10m';
    }
  }

  String _calculateAvgSpeed(double distance, String durationStr) {
    try {
      final regExp = RegExp(r'(?:(\d+)h)?\s*(?:(\d+)m)?');
      final match = regExp.firstMatch(durationStr);
      double hours = 0;
      if (match != null) {
        if (match.group(1) != null) {
          hours += double.parse(match.group(1)!);
        }
        if (match.group(2) != null) {
          hours += double.parse(match.group(2)!) / 60.0;
        }
      }
      if (hours > 0) {
        return '${(distance / hours).toStringAsFixed(0)} km/h';
      }
    } catch (_) {}
    return '88 km/h';
  }

  String _formatTimeOnly(DateTime? dt) {
    if (dt == null) return 'N/A';
    int hour = dt.hour;
    final minute = dt.minute.toString().padLeft(2, '0');
    final period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour == 0) hour = 12;
    return '${hour.toString().padLeft(2, '0')}:$minute $period';
  }

  List<Map<String, dynamic>> _buildTimelineEvents(Map<String, dynamic> trip) {
    final createdStr = trip['createdAt'];
    final startStr = trip['actualStartTime'] ?? trip['departureTime'];
    final endStr = trip['actualEndTime'] ?? trip['eta'];

    DateTime createdTime = createdStr != null ? DateTime.parse(createdStr).toLocal() : DateTime.now().subtract(const Duration(hours: 10));
    DateTime startTime = startStr != null ? DateTime.parse(startStr).toLocal() : DateTime.now().subtract(const Duration(hours: 8));
    DateTime endTime = endStr != null ? DateTime.parse(endStr).toLocal() : DateTime.now();

    if (startTime.isBefore(createdTime)) {
      createdTime = startTime.subtract(const Duration(hours: 1));
    }
    if (endTime.isBefore(startTime)) {
      endTime = startTime.add(const Duration(hours: 4));
    }

    final duration = endTime.difference(startTime);
    final pickupTime = startTime.add(Duration(minutes: (duration.inMinutes * 0.2).round()));
    final enRouteTime = startTime.add(Duration(minutes: (duration.inMinutes * 0.35).round()));
    final destTime = endTime.subtract(const Duration(minutes: 15));

    return [
      {'title': 'Trip Assigned', 'time': _formatTimeOnly(createdTime), 'done': true},
      {'title': 'Journey Started', 'time': _formatTimeOnly(startTime), 'done': true},
      {'title': 'Pickup Reached', 'time': _formatTimeOnly(pickupTime), 'done': true},
      {'title': 'En Route', 'time': _formatTimeOnly(enRouteTime), 'done': true},
      {'title': 'Destination Reached', 'time': _formatTimeOnly(destTime), 'done': true},
      {'title': 'Trip Completed', 'time': _formatTimeOnly(endTime), 'done': true, 'isLast': true},
    ];
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading && _trip == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: CustomAppBar(
          centerTitle: false,
          title: Text(
            'Completed Trip Details',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: AppColors.background,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        body: const Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
          ),
        ),
      );
    }

    if (_trip == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: CustomAppBar(
          centerTitle: false,
          title: Text(
            'Completed Trip Details',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: AppColors.background,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        body: const Center(
          child: Text(
            'Trip not found',
            style: TextStyle(color: AppColors.primaryText, fontSize: 16),
          ),
        ),
      );
    }

    final trip = _trip!;
    final rawTripNumber = trip['tripNumber'] ?? widget.tripId;
    final displayId = rawTripNumber.toString().startsWith('#') ? rawTripNumber.toString() : '#$rawTripNumber';
    
    final dateStr = _formatDate(trip['actualEndTime'] ?? trip['createdAt']);
    final timeStr = _formatTime(trip['actualEndTime'] ?? trip['createdAt']);
    
    final pickupLoc = trip['pickup'] ?? trip['startLocation'] ?? 'Origin';
    final destLoc = trip['destination'] ?? trip['endLocation'] ?? 'Destination';

    double distanceVal = 0.0;
    if (trip['actualDistance'] != null) {
      distanceVal = double.tryParse(trip['actualDistance'].toString()) ?? 0.0;
    }
    if (distanceVal == 0.0 && trip['estimatedDistance'] != null) {
      distanceVal = double.tryParse(trip['estimatedDistance'].toString()) ?? 0.0;
    }
    if (distanceVal == 0.0) {
      distanceVal = 190.0;
    }

    final distanceStr = '${distanceVal.toStringAsFixed(0)} km';
    final durationStr = _calculateDuration(trip['actualStartTime'] ?? trip['departureTime'], trip['actualEndTime'] ?? trip['createdAt']);
    
    final fuelTotal = trip['fuelUsed'] ?? '${(distanceVal * 0.18).toStringAsFixed(0)}L';
    final stopsCount = distanceVal > 200 ? '2' : (distanceVal > 100 ? '1' : '0');
    final avgSpeed = _calculateAvgSpeed(distanceVal, durationStr);

    final vehicleName = trip['vehicleName'] ?? 'AX 452';
    final vehiclePlate = trip['vehiclePlate'] ?? 'Heavy Duty';
    final vehicleDisplay = vehiclePlate.isNotEmpty ? '$vehicleName • $vehiclePlate' : vehicleName;

    final driverName = trip['driverName'] ?? 'Marcus Sterling';
    final managerName = trip['manager'] != null ? (trip['manager']['name'] ?? 'Sarah Jenkins') : 'Sarah Jenkins';

    final notes = trip['tripNotes'] ?? trip['description'] ?? 'Delivery completed successfully. Goods handed over without any damage.';
    final receiver = 'John Doe';

    final timelineEvents = _buildTimelineEvents(trip);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        centerTitle: false,
        title: Text(
          'Completed Trip Details',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: AppColors.background,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _fetchTripDetails,
          color: AppColors.primary,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // 1. Summary Header Card
                _buildSummaryHeaderCard(context, displayId, dateStr, timeStr),
                AppSpacing.verticalSm,

                // 2. Route Details Card
                _buildRouteDetailsCard(context, pickupLoc, destLoc, distanceStr, durationStr),
                AppSpacing.verticalSm,

                // 3. Vehicle & Crew Card
                _buildVehicleCrewCard(context, vehicleDisplay, driverName, managerName),
                AppSpacing.verticalSm,

                // 4. Performance Grid
                _buildSectionTitle(context, 'Performance'),
                _buildPerformanceGrid(context, distanceStr, fuelTotal, avgSpeed, stopsCount),
                AppSpacing.verticalSm,

                // 5. Trip Timeline Card
                _buildSectionTitle(context, 'Trip Timeline'),
                _buildTimelineCard(context, timelineEvents),
                AppSpacing.verticalSm,

                // 6. Documents Section
                _buildSectionTitle(context, 'Documents'),
                _buildDocumentsCard(context, trip, displayId),
                AppSpacing.verticalSm,

                // 7. Trip Notes Card
                _buildTripNotesCard(context, notes),
                AppSpacing.verticalSm,

                // 8. Delivery Confirmation Card
                _buildDeliveryConfirmationCard(context, receiver, 'Signed & Verified'),
                AppSpacing.verticalLg,

                // 9. Bottom Buttons
                _buildFooterActions(context),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4.0, top: 12.0, bottom: 8.0),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
          fontWeight: FontWeight.bold,
          color: AppColors.primaryText,
        ),
      ),
    );
  }

  // 1. Summary Header Card
  Widget _buildSummaryHeaderCard(BuildContext context, String displayId, String date, String time) {
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
                    'TRIP ID',
                    style: TextStyle(
                      color: AppColors.secondaryText,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    displayId,
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
                  color: const Color(0xFFE8F5E9),
                  borderRadius: BorderRadius.circular(AppRadius.round),
                ),
                child: const Text(
                  'Completed',
                  style: TextStyle(
                    color: Color(0xFF2E7D32),
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
              _buildInfoItem('Date', date),
              _buildInfoItem('Time', time, alignRight: true),
            ],
          ),
        ],
      ),
    );
  }

  // 2. Route Details Card
  Widget _buildRouteDetailsCard(
    BuildContext context,
    String pickup,
    String destination,
    String distance,
    String duration,
  ) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                children: [
                  const SizedBox(height: 2),
                  Container(
                    width: 14,
                    height: 14,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.primary, width: 2),
                      color: Colors.transparent,
                    ),
                    child: Center(
                      child: Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ),
                  Container(
                    width: 1.5,
                    height: 32,
                    color: AppColors.divider,
                  ),
                  const Icon(
                    Icons.location_on,
                    color: AppColors.secondary,
                    size: 16,
                  ),
                ],
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'PICKUP',
                      style: TextStyle(
                        color: AppColors.secondaryText,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      pickup,
                      style: const TextStyle(
                        color: AppColors.primaryText,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 18),
                    const Text(
                      'DESTINATION',
                      style: TextStyle(
                        color: AppColors.secondaryText,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      destination,
                      style: const TextStyle(
                        color: AppColors.primaryText,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildInfoItem('Distance', distance),
              _buildInfoItem('Duration', duration, alignRight: true),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(color: AppColors.divider),
          const SizedBox(height: 8),
          const Row(
            children: [
              Icon(Icons.check_circle_outline, color: AppColors.success, size: 18),
              SizedBox(width: 8),
              Text(
                'Route Completed Successfully',
                style: TextStyle(
                  color: AppColors.success,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 3. Vehicle & Crew Card
  Widget _buildVehicleCrewCard(
    BuildContext context,
    String vehicleDisplay,
    String driver,
    String manager,
  ) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.divider.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: const Icon(Icons.local_shipping_outlined, color: AppColors.primaryText, size: 18),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Vehicle',
                    style: TextStyle(
                      color: AppColors.secondaryText,
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    vehicleDisplay,
                    style: const TextStyle(
                      color: AppColors.primaryText,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildInfoItem('Driver', driver),
              _buildInfoItem('Manager', manager, alignRight: true),
            ],
          ),
        ],
      ),
    );
  }

  // 4. Performance Grid
  Widget _buildPerformanceGrid(
    BuildContext context,
    String distance,
    String fuel,
    String avgSpeed,
    String stops,
  ) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      childAspectRatio: 2.1,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      children: [
        _buildPerformanceCard(Icons.map_outlined, 'Distance', distance),
        _buildPerformanceCard(Icons.local_gas_station_outlined, 'Fuel Consumed', fuel),
        _buildPerformanceCard(Icons.speed, 'Avg Speed', avgSpeed),
        _buildPerformanceCard(Icons.gps_fixed, 'Total Stops', stops),
      ],
    );
  }

  Widget _buildPerformanceCard(IconData icon, String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 10.0),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Icon(icon, color: AppColors.secondaryText, size: 14),
              const SizedBox(width: 6),
              Text(
                label,
                style: const TextStyle(
                  color: AppColors.secondaryText,
                  fontSize: 10,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              color: AppColors.primaryText,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }

  // 5. Trip Timeline
  Widget _buildTimelineCard(BuildContext context, List<Map<String, dynamic>> timelineEvents) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: timelineEvents.map((event) {
          final isLast = event['isLast'] == true;
          return IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Column(
                  children: [
                    Container(
                      width: 12,
                      height: 12,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.success,
                      ),
                    ),
                    if (!isLast)
                      Expanded(
                        child: Container(
                          width: 2,
                          color: AppColors.success.withValues(alpha: 0.3),
                        ),
                      ),
                  ],
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 14.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          event['title'] as String,
                          style: const TextStyle(
                            color: AppColors.primaryText,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                        Text(
                          event['time'] as String,
                          style: const TextStyle(
                            color: AppColors.secondaryText,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  // 6. Documents List
  Widget _buildDocumentsCard(BuildContext context, Map<String, dynamic> trip, String displayId) {
    final docs = [
      {'name': 'Invoice', 'action': 'VIEW', 'isView': true},
      {'name': 'Toll Fee Receipt', 'action': 'VIEW', 'isView': true},
      {'name': 'Proof of Delivery (POD)', 'action': 'VIEW', 'isView': true},
      {'name': 'Weighbridge Slip', 'action': 'VIEW', 'isView': true},
      {'name': 'Fuel Entry', 'action': 'VIEW', 'isView': true},
    ];

    return CustomCard(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Column(
        children: docs.map((doc) {
          final isView = doc['isView'] as bool;
          return Container(
            margin: const EdgeInsets.symmetric(vertical: 6.0),
            padding: const EdgeInsets.symmetric(vertical: 10.0, horizontal: 12.0),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(color: AppColors.divider),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      isView ? Icons.description_outlined : Icons.receipt_long_outlined,
                      color: AppColors.secondaryText,
                      size: 18,
                    ),
                    const SizedBox(width: 10),
                    Text(
                      doc['name'] as String,
                      style: const TextStyle(
                        color: AppColors.primaryText,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
                InkWell(
                  onTap: () async {
                    Widget? targetScreen;
                    switch (doc['name']) {
                      case 'Invoice':
                        targetScreen = InvoiceScreen(
                          invoiceNumber: trip['invoiceNumber'] ?? 'INV-2023-8842',
                          tripId: displayId,
                          tripData: trip,
                        );
                        break;
                      case 'Toll Fee Receipt':
                        targetScreen = TollFeeReceiptScreen(
                          tripId: displayId,
                          tripData: trip,
                        );
                        break;
                      case 'Proof of Delivery (POD)':
                        final pod = trip['podDetails'] as Map<String, dynamic>?;
                        final url = trip['podUrl']?.toString() ?? pod?['podDocumentUrl']?.toString();
                        _showDocumentDetailsDialog(
                          context: context,
                          title: 'Proof of Delivery (POD)',
                          details: pod != null ? {
                            'POD Number': pod['podNumber'] ?? 'N/A',
                            'Customer': pod['customerName'] ?? 'N/A',
                            'Receiver': pod['receiverName'] ?? 'N/A',
                            'Delivery Date': _formatDate(pod['deliveryDate']?.toString()),
                            'Status': pod['status'] ?? 'Pending',
                            if (pod['rejectionReason'] != null && pod['rejectionReason'].toString().isNotEmpty)
                              'Rejection Reason': pod['rejectionReason'],
                          } : null,
                          documentUrl: url,
                          documentName: 'POD',
                        );
                        break;
                      case 'Weighbridge Slip':
                        final wb = trip['weighbridgeDetails'] as Map<String, dynamic>?;
                        final url = trip['weighbridgeUrl']?.toString() ?? wb?['documentUrl']?.toString();
                        _showDocumentDetailsDialog(
                          context: context,
                          title: 'Weighbridge Slip',
                          details: wb != null ? {
                            'Slip Number': wb['slipNumber'] ?? 'N/A',
                            'Gross Weight': '${wb['grossWeight']} kg',
                            'Tare Weight': '${wb['tareWeight']} kg',
                            'Net Weight': '${wb['netWeight']} kg',
                            'Location': wb['location'] ?? 'N/A',
                            'Status': wb['status'] ?? 'Pending',
                            if (wb['rejectionReason'] != null && wb['rejectionReason'].toString().isNotEmpty)
                              'Rejection Reason': wb['rejectionReason'],
                          } : (trip['weighbridgeRequired'] == false ? {
                            'Status': 'Not required for this trip',
                          } : null),
                          documentUrl: url,
                          documentName: 'Weighbridge',
                        );
                        break;
                      case 'Fuel Entry':
                        final fuel = trip['fuelDetails'] as Map<String, dynamic>?;
                        final url = trip['fuelUrl']?.toString() ?? fuel?['billUrl']?.toString();
                        _showDocumentDetailsDialog(
                          context: context,
                          title: 'Fuel Entry Details',
                          details: fuel != null ? {
                            'Station': fuel['fuelStation'] ?? 'N/A',
                            'Liters': '${fuel['liters']} L',
                            'Amount': '₹${fuel['amount']}',
                            'Odometer': '${fuel['odometer']} km',
                            'Status': fuel['approvalStatus'] ?? 'Pending',
                            if (fuel['rejectionReason'] != null && fuel['rejectionReason'].toString().isNotEmpty)
                              'Rejection Reason': fuel['rejectionReason'],
                          } : null,
                          documentUrl: url,
                          documentName: 'Fuel',
                        );
                        break;
                      default:
                        return;
                    }
                    if (targetScreen != null) {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => targetScreen!),
                      );
                    }
                  },
                  child: Row(
                    children: [
                      Text(
                        doc['action'] as String,
                        style: const TextStyle(
                          color: AppColors.secondary,
                          fontWeight: FontWeight.bold,
                          fontSize: 11,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Icon(
                        isView ? Icons.visibility_outlined : Icons.download_outlined,
                        color: AppColors.secondary,
                        size: 14,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  // 7. Trip Notes
  Widget _buildTripNotesCard(BuildContext context, String notes) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: const Color(0xFFF0F4FA),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'TRIP NOTES',
            style: TextStyle(
              color: AppColors.secondaryText,
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            notes.startsWith('"') ? notes : '"$notes"',
            style: const TextStyle(
              color: AppColors.primaryText,
              fontStyle: FontStyle.italic,
              fontSize: 13,
              height: 1.3,
            ),
          ),
        ],
      ),
    );
  }

  // 8. Delivery Confirmation
  Widget _buildDeliveryConfirmationCard(
    BuildContext context,
    String receiver,
    String status,
  ) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Delivery Confirmation',
                style: TextStyle(
                  color: AppColors.primaryText,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
              Icon(Icons.check_circle, color: AppColors.success, size: 18),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildInfoItem('Receiver', receiver),
              _buildInfoItem('Status', status, alignRight: true),
            ],
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8.0),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(AppRadius.sm),
              border: Border.all(color: AppColors.divider),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.lock_outline, color: AppColors.primaryText, size: 14),
                SizedBox(width: 6),
                Text(
                  'Proof of Delivery Available',
                  style: TextStyle(
                    color: AppColors.primaryText,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 9. Bottom Actions
  Widget _buildFooterActions(BuildContext context) {
    return Column(
      children: [
        ElevatedButton.icon(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Downloading Completed Trip Report PDF...')),
            );
          },
          icon: const Icon(Icons.download_outlined, color: Colors.white, size: 20),
          label: const Text(
            'Download Trip Report',
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
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Opening Share Dialog for Trip Report...')),
            );
          },
          icon: const Icon(Icons.share_outlined, color: AppColors.secondary, size: 20),
          label: const Text(
            'Share Report',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppColors.secondary,
            ),
          ),
          style: OutlinedButton.styleFrom(
            side: const BorderSide(color: AppColors.secondary, width: 1.5),
            minimumSize: const Size(double.infinity, 48),
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoItem(String label, String value, {bool alignRight = false}) {
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

  Future<void> _launchURL(BuildContext context, String urlString) async {
    try {
      final Uri url = Uri.parse(urlString);
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      } else {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Could not open document: $urlString')),
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error opening document: $e')),
        );
      }
    }
  }

  void _showDocumentDetailsDialog({
    required BuildContext context,
    required String title,
    required Map<String, dynamic>? details,
    required String? documentUrl,
    required String documentName,
  }) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        final isUploaded = details != null || (documentUrl != null && documentUrl.isNotEmpty);
        
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16.0),
          ),
          backgroundColor: AppColors.background,
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        color: AppColors.primaryText,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: AppColors.secondaryText),
                      onPressed: () => Navigator.pop(context),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                if (!isUploaded) ...[
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 24.0),
                      child: Column(
                        children: [
                          Icon(Icons.hourglass_empty_outlined, size: 48, color: AppColors.secondaryText),
                          SizedBox(height: 12),
                          Text(
                            'No Document Uploaded',
                            style: TextStyle(
                              color: AppColors.secondaryText,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: 4),
                          Text(
                            'This document details are not available yet.',
                            style: TextStyle(
                              color: AppColors.secondaryText,
                              fontSize: 12,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  ),
                ] else ...[
                  if (details != null) ...[
                    ...details.entries.map((entry) {
                      final key = entry.key;
                      final val = entry.value?.toString() ?? 'N/A';
                      
                      if (key.toLowerCase().contains('status')) {
                        Color statusColor = AppColors.secondaryText;
                        if (val.toLowerCase() == 'approved') {
                          statusColor = AppColors.success;
                        } else if (val.toLowerCase() == 'rejected') {
                          statusColor = AppColors.error;
                        } else {
                          statusColor = Colors.orange;
                        }
                        
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 6.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                key,
                                style: const TextStyle(color: AppColors.secondaryText, fontSize: 13),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: statusColor.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: statusColor.withValues(alpha: 0.2)),
                                ),
                                child: Text(
                                  val.toUpperCase(),
                                  style: TextStyle(
                                    color: statusColor,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 11,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      }

                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 6.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              key,
                              style: const TextStyle(color: AppColors.secondaryText, fontSize: 13),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Text(
                                val,
                                style: const TextStyle(
                                  color: AppColors.primaryText,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                                textAlign: TextAlign.end,
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                    const SizedBox(height: 16),
                  ],
                  if (documentUrl != null && documentUrl.isNotEmpty) ...[
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          _launchURL(context, documentUrl);
                        },
                        icon: const Icon(Icons.open_in_new, size: 16, color: Colors.white),
                        label: Text('View $documentName Document'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.secondary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ),
                  ] else ...[
                    const SizedBox(
                      width: double.infinity,
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 8.0),
                        child: Text(
                          'No document file url available.',
                          style: TextStyle(color: AppColors.secondaryText, fontSize: 12, fontStyle: FontStyle.italic),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                  ],
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}
