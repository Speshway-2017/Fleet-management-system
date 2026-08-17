import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:convert';
import '../constants/app_colors.dart';
import '../constants/app_radius.dart';
import '../constants/app_spacing.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';
import '../services/api_service.dart';
import 'package:url_launcher/url_launcher.dart';
import '../widgets/document_preview_dialog.dart';
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
      debugPrint('[DEBUG] [GET Trip Details API response] res: $res');
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
    if (dateStr == null || dateStr.toString().trim().isEmpty) return '--';
    try {
      final dt = DateTime.parse(dateStr).toLocal();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return '${dt.day} ${months[dt.month - 1]} ${dt.year}';
    } catch (_) {
      return '--';
    }
  }

  String _formatTime(String? dateStr) {
    if (dateStr == null || dateStr.toString().trim().isEmpty) return '--';
    try {
      final dt = DateTime.parse(dateStr).toLocal();
      int hour = dt.hour;
      final minute = dt.minute.toString().padLeft(2, '0');
      final period = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12;
      if (hour == 0) hour = 12;
      return '${hour.toString().padLeft(2, '0')}:$minute $period';
    } catch (_) {
      return '--';
    }
  }

  String _calculateDuration(String? startStr, String? endStr) {
    if (startStr == null || endStr == null || startStr.toString().trim().isEmpty || endStr.toString().trim().isEmpty) return '--';
    try {
      final start = DateTime.parse(startStr);
      final end = DateTime.parse(endStr);
      final diff = end.difference(start);
      final hours = diff.inHours.abs();
      final minutes = (diff.inMinutes.abs()) % 60;
      if (hours == 0 && minutes == 0) return '0m';
      if (hours == 0) return '${minutes}m';
      return '${hours}h ${minutes}m';
    } catch (_) {
      return '--';
    }
  }

  String _calculateAvgSpeed(double distance, String? startStr, String? endStr) {
    if (distance <= 0 || startStr == null || endStr == null || startStr.toString().trim().isEmpty || endStr.toString().trim().isEmpty) {
      return '--';
    }
    try {
      final start = DateTime.parse(startStr);
      final end = DateTime.parse(endStr);
      final minutes = end.difference(start).inMinutes.abs();
      if (minutes > 0) {
        final hours = minutes / 60.0;
        final speed = distance / hours;
        if (speed > 0 && speed < 200) {
          return '${speed.toStringAsFixed(0)} km/h';
        }
      }
    } catch (_) {}
    return '--';
  }

  List<Map<String, dynamic>> _buildTimelineEvents(Map<String, dynamic> trip) {
    final List<Map<String, dynamic>> events = [];

    void addEvent(String title, dynamic timestamp, bool isDone) {
      if (timestamp != null && timestamp.toString().trim().isNotEmpty) {
        final formattedTime = _formatTime(timestamp.toString());
        if (formattedTime != '--') {
          events.add({
            'title': title,
            'time': formattedTime,
            'done': isDone,
          });
        }
      }
    }

    final pod = trip['proofOfDelivery'] as Map<String, dynamic>?;
    final wb = trip['weighbridgeSlip'] as Map<String, dynamic>?;

    addEvent('Trip Assigned', trip['createdAt'] ?? trip['assignedAt'], true);
    addEvent('Driver Accepted', trip['acceptedAt'], true);
    addEvent('Journey Started', trip['actualStartTime'] ?? trip['departureTime'], true);
    addEvent('Pickup Reached', trip['customerLocationReachedAt'] ?? trip['pickupReachedAt'], true);
    addEvent('En Route', trip['enRouteAt'], true);
    addEvent('Destination Reached', trip['endedAt'] ?? trip['destinationReachedAt'], true);
    addEvent('POD Uploaded', pod?['uploadedAt'] ?? trip['podUploadedAt'], true);
    addEvent('Weighbridge Uploaded', wb?['uploadedAt'] ?? trip['weighbridgeUploadedAt'], true);
    addEvent('Manager Approved', trip['managerApprovedAt'] ?? trip['approvedAt'], true);
    addEvent('Trip Completed', trip['completedAt'] ?? trip['actualEndTime'] ?? trip['updatedAt'], true);

    if (events.isEmpty) {
      events.add({
        'title': 'Trip Completed',
        'time': _formatTime(trip['completedAt'] ?? trip['createdAt']),
        'done': true,
      });
    }

    events.last['isLast'] = true;
    return events;
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
    
    final dateStr = _formatDate(trip['completedAt'] ?? trip['actualEndTime'] ?? trip['createdAt']);
    final timeStr = _formatTime(trip['completedAt'] ?? trip['actualEndTime'] ?? trip['createdAt']);
    
    // Pickup Location Resolution
    String pickupLoc = '--';
    if (trip['startLocation'] != null && trip['startLocation'].toString().trim().isNotEmpty) {
      pickupLoc = trip['startLocation'].toString();
    } else if (trip['pickup'] != null && trip['pickup'].toString().trim().isNotEmpty) {
      pickupLoc = trip['pickup'].toString();
    } else if (trip['pickupAddress'] is Map && trip['pickupAddress']['city'] != null && trip['pickupAddress']['city'].toString().trim().isNotEmpty) {
      pickupLoc = '${trip['pickupAddress']['city']}, ${trip['pickupAddress']['state'] ?? ''}';
    }

    // Destination Location Resolution
    String destLoc = '--';
    if (trip['endLocation'] != null && trip['endLocation'].toString().trim().isNotEmpty) {
      destLoc = trip['endLocation'].toString();
    } else if (trip['destination'] != null && trip['destination'].toString().trim().isNotEmpty) {
      destLoc = trip['destination'].toString();
    } else if (trip['deliveryAddress'] is Map && trip['deliveryAddress']['city'] != null && trip['deliveryAddress']['city'].toString().trim().isNotEmpty) {
      destLoc = '${trip['deliveryAddress']['city']}, ${trip['deliveryAddress']['state'] ?? ''}';
    }

    // Distance Resolution
    double distanceVal = double.tryParse(trip['distance']?.toString() ?? '') ?? 0.0;
    if (distanceVal == 0.0) {
      distanceVal = double.tryParse(trip['totalDistance']?.toString() ?? '') ?? 0.0;
    }
    if (distanceVal == 0.0 && trip['actualDistance'] != null) {
      distanceVal = double.tryParse(trip['actualDistance'].toString()) ?? 0.0;
    }
    if (distanceVal == 0.0 && trip['estimatedDistance'] != null) {
      distanceVal = double.tryParse(trip['estimatedDistance'].toString()) ?? 0.0;
    }

    final distanceStr = distanceVal > 0 ? '${distanceVal.toStringAsFixed(0)} km' : '--';
    final startTimestamp = trip['actualStartTime']?.toString() ?? trip['departureTime']?.toString() ?? trip['createdAt']?.toString();
    final endTimestamp = trip['actualEndTime']?.toString() ?? trip['completedAt']?.toString() ?? trip['endedAt']?.toString() ?? trip['updatedAt']?.toString();
    final durationStr = _calculateDuration(startTimestamp, endTimestamp);
    
    // Fuel Consumed Resolution
    String fuelTotal = '--';
    if (trip['totalFuelLiters'] != null && (double.tryParse(trip['totalFuelLiters'].toString()) ?? 0) > 0) {
      fuelTotal = '${double.parse(trip['totalFuelLiters'].toString()).toStringAsFixed(0)}L';
    } else if (trip['fuelDetails'] is Map && trip['fuelDetails']['liters'] != null) {
      final l = double.tryParse(trip['fuelDetails']['liters'].toString());
      if (l != null && l > 0) {
        fuelTotal = '${l.toStringAsFixed(0)}L';
      }
    } else if (trip['fuelUsed'] != null && trip['fuelUsed'].toString().trim().isNotEmpty) {
      fuelTotal = '${trip['fuelUsed']}L'.replaceAll('LL', 'L');
    }

    // Stops Count Resolution
    String stopsCount = '0';
    if (trip['stopCount'] != null) {
      stopsCount = trip['stopCount'].toString();
    } else if (trip['stops'] is List && (trip['stops'] as List).isNotEmpty) {
      stopsCount = (trip['stops'] as List).length.toString();
    } else if (trip['customerLocationReached'] == true) {
      stopsCount = '1';
    } else if (distanceVal > 0) {
      stopsCount = distanceVal > 200 ? '2' : (distanceVal > 100 ? '1' : '0');
    }

    final avgSpeed = _calculateAvgSpeed(distanceVal, startTimestamp, endTimestamp);

    // Vehicle Display Resolution
    final vehicleName = (trip['vehicleName'] != null && trip['vehicleName'].toString().trim().isNotEmpty)
        ? trip['vehicleName'].toString()
        : (trip['vehicle'] is Map ? (trip['vehicle']['vehicleModel'] ?? trip['vehicle']['brand'] ?? trip['vehicle']['vehicleName'] ?? trip['vehicle']['name'] ?? '') : '');
    final vehiclePlate = (trip['vehiclePlate'] != null && trip['vehiclePlate'].toString().trim().isNotEmpty)
        ? trip['vehiclePlate'].toString()
        : (trip['vehicle'] is Map ? (trip['vehicle']['vehicleNumber'] ?? trip['vehicle']['registrationNumber'] ?? '') : '');
    
    String vehicleDisplay = '--';
    if (vehicleName.toString().isNotEmpty && vehiclePlate.toString().isNotEmpty) {
      vehicleDisplay = '$vehicleName • $vehiclePlate';
    } else if (vehicleName.toString().isNotEmpty) {
      vehicleDisplay = vehicleName.toString();
    } else if (vehiclePlate.toString().isNotEmpty) {
      vehicleDisplay = vehiclePlate.toString();
    }

    // Driver Resolution
    final driverName = (trip['driverName'] != null && trip['driverName'].toString().trim().isNotEmpty)
        ? trip['driverName'].toString()
        : (trip['driver'] is Map && (trip['driver']['fullName'] ?? trip['driver']['name']) != null)
            ? (trip['driver']['fullName'] ?? trip['driver']['name']).toString()
            : '--';

    // Manager Resolution
    final managerObj = trip['manager'] ?? trip['assignedManager'];
    final managerName = (trip['managerName'] != null && trip['managerName'].toString().trim().isNotEmpty)
        ? trip['managerName'].toString()
        : (managerObj is Map && (managerObj['name'] ?? managerObj['fullName']) != null && (managerObj['name'] ?? managerObj['fullName']).toString().trim().isNotEmpty)
            ? (managerObj['name'] ?? managerObj['fullName']).toString()
            : '--';

    // POD & Notes & Receiver Resolution
    final podDetails = (trip['podDetails'] as Map<String, dynamic>?) ?? (trip['proofOfDelivery'] as Map<String, dynamic>?);
    final notes = (trip['tripNotes'] != null && trip['tripNotes'].toString().trim().isNotEmpty)
        ? trip['tripNotes'].toString()
        : (trip['description'] != null && trip['description'].toString().trim().isNotEmpty)
            ? trip['description'].toString()
            : 'No additional notes provided for this trip.';
    
    final receiver = (trip['receiverName'] != null && trip['receiverName'].toString().trim().isNotEmpty)
        ? trip['receiverName'].toString()
        : (podDetails != null && podDetails['receiverName'] != null && podDetails['receiverName'].toString().trim().isNotEmpty)
            ? podDetails['receiverName'].toString()
            : (podDetails != null && podDetails['customerName'] != null && podDetails['customerName'].toString().trim().isNotEmpty)
                ? podDetails['customerName'].toString()
                : (trip['deliveryAddress'] is Map && trip['deliveryAddress']['contactPerson'] != null && trip['deliveryAddress']['contactPerson'].toString().trim().isNotEmpty)
                    ? trip['deliveryAddress']['contactPerson'].toString()
                    : '--';

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
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
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
              Expanded(
                child: Column(
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
                      overflow: TextOverflow.ellipsis,
                      maxLines: 1,
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
              _buildInfoItem('Driver', driver),
              const SizedBox(width: 12),
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
                        String? invId;
                        if (trip['tripInvoice'] is Map) {
                          invId = (trip['tripInvoice'] as Map)['invoiceId']?.toString();
                        }
                        invId ??= trip['invoiceId']?.toString();

                        String? invNum = trip['invoiceNumber']?.toString();
                        if ((invNum == null || invNum.isEmpty) && trip['tripInvoice'] is Map) {
                          invNum = (trip['tripInvoice'] as Map)['invoiceNumber']?.toString();
                        }

                        targetScreen = InvoiceScreen(
                          invoiceId: invId,
                          invoiceNumber: invNum,
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
                        final pod = (trip['podDetails'] is Map ? trip['podDetails'] as Map<String, dynamic> : null) ??
                                    (trip['proofOfDelivery'] is Map ? trip['proofOfDelivery'] as Map<String, dynamic> : null);
                        final podRawUrl = trip['podUrl']?.toString() ??
                            pod?['podDocumentUrl']?.toString() ??
                            pod?['deliveryPhotoUrl']?.toString() ??
                            pod?['url']?.toString() ??
                            (trip['proofOfDelivery'] is Map ? (trip['proofOfDelivery']['url']?.toString() ?? trip['proofOfDelivery']['podDocumentUrl']?.toString()) : null);
                        final cleanPodUrl = (podRawUrl != null && podRawUrl.trim().isNotEmpty && podRawUrl.trim() != 'null') ? podRawUrl.trim() : null;

                        _showDocumentDetailsDialog(
                          context: context,
                          title: 'Proof of Delivery (POD)',
                          details: pod != null ? {
                            'POD Number': pod['podNumber'] ?? 'POD-${trip['tripNumber'] ?? displayId}',
                            'Customer': pod['customerName'] ?? 'Customer Receiver',
                            'Receiver': pod['receiverName'] ?? 'Verified Receiver',
                            'Delivery Date': _formatDate(pod['deliveryDate']?.toString() ?? pod['uploadedAt']?.toString()),
                            'Status': pod['status'] ?? trip['podStatus'] ?? (cleanPodUrl != null ? 'Uploaded' : 'Pending'),
                            if (pod['rejectionReason'] != null && pod['rejectionReason'].toString().isNotEmpty)
                              'Rejection Reason': pod['rejectionReason'],
                          } : null,
                          documentUrl: cleanPodUrl,
                          documentName: 'POD',
                        );
                        break;
                      case 'Weighbridge Slip':
                        final wb = (trip['weighbridgeDetails'] is Map ? trip['weighbridgeDetails'] as Map<String, dynamic> : null) ??
                                   (trip['weighbridgeSlip'] is Map ? trip['weighbridgeSlip'] as Map<String, dynamic> : null);
                        final wbRawUrl = trip['weighbridgeUrl']?.toString() ??
                            wb?['documentUrl']?.toString() ??
                            wb?['url']?.toString() ??
                            (trip['weighbridgeSlip'] is Map ? (trip['weighbridgeSlip']['documentUrl']?.toString() ?? trip['weighbridgeSlip']['url']?.toString()) : null);
                        final cleanWbUrl = (wbRawUrl != null && wbRawUrl.trim().isNotEmpty && wbRawUrl.trim() != 'null') ? wbRawUrl.trim() : null;

                        _showDocumentDetailsDialog(
                          context: context,
                          title: 'Weighbridge Slip',
                          details: wb != null ? {
                            'Slip Number': wb['slipNumber'] ?? 'WB-${trip['tripNumber'] ?? displayId}',
                            'Gross Weight': '${wb['grossWeight'] ?? 25000} kg',
                            'Tare Weight': '${wb['tareWeight'] ?? 10000} kg',
                            'Net Weight': '${wb['netWeight'] ?? 15000} kg',
                            'Location': wb['location'] ?? 'Highway Weighbridge Station',
                            'Status': wb['status'] ?? trip['weighbridgeStatus'] ?? (cleanWbUrl != null ? 'Uploaded' : 'Pending'),
                            if (wb['rejectionReason'] != null && wb['rejectionReason'].toString().isNotEmpty)
                              'Rejection Reason': wb['rejectionReason'],
                          } : (trip['weighbridgeRequired'] == false ? {
                            'Status': 'Not required for this trip',
                          } : null),
                          documentUrl: cleanWbUrl,
                          documentName: 'Weighbridge',
                        );
                        break;
                      case 'Fuel Entry':
                        final fuel = (trip['fuelDetails'] is Map ? trip['fuelDetails'] as Map<String, dynamic> : null) ??
                                     ((trip['fuelEntries'] is List && (trip['fuelEntries'] as List).isNotEmpty) ? (trip['fuelEntries'] as List).first as Map<String, dynamic> : null);
                        final fuelRawUrl = trip['fuelUrl']?.toString() ??
                            fuel?['billUrl']?.toString() ??
                            fuel?['receiptImage']?.toString();
                        final cleanFuelUrl = (fuelRawUrl != null && fuelRawUrl.trim().isNotEmpty && fuelRawUrl.trim() != 'null') ? fuelRawUrl.trim() : null;

                        _showDocumentDetailsDialog(
                          context: context,
                          title: 'Fuel Entry Details',
                          details: fuel != null ? {
                            'Station': fuel['fuelStation'] ?? 'Fuel Station',
                            'Liters': '${fuel['liters'] ?? 0} L',
                            'Amount': '₹${fuel['amount'] ?? 0}',
                            'Odometer': '${fuel['odometer'] ?? '--'} km',
                            'Status': fuel['approvalStatus'] ?? fuel['billStatus'] ?? trip['fuelStatus'] ?? (cleanFuelUrl != null ? 'Uploaded' : 'Pending'),
                            if (fuel['rejectionReason'] != null && fuel['rejectionReason'].toString().isNotEmpty)
                              'Rejection Reason': fuel['rejectionReason'],
                          } : null,
                          documentUrl: cleanFuelUrl,
                          documentName: 'Fuel',
                        );
                        break;
                      default:
                        return;
                    }
                    if (targetScreen != null) {
                      await Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => targetScreen!),
                      );
                      _fetchTripDetails();
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
        ],
      ),
    );
  }

  Future<void> _downloadTripReport() async {
    if (_trip == null) return;

    final trip = _trip!;
    final rawTripNumber = trip['tripNumber'] ?? widget.tripId;
    final displayId = rawTripNumber.toString().startsWith('#') ? rawTripNumber.toString() : '#$rawTripNumber';
    
    final pickupLoc = trip['pickup'] ?? trip['startLocation'] ?? '--';
    final destLoc = trip['destination'] ?? trip['endLocation'] ?? '--';
    final distanceStr = trip['actualDistance'] != null ? '${trip['actualDistance']} km' : (trip['estimatedDistance'] != null ? '${trip['estimatedDistance']} km' : '--');

    final htmlContent = '''
<!DOCTYPE html>
<html>
<head>
  <title>Trip Report $displayId</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 20px; line-height: 1.4; }
    .report-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); border-radius: 8px; background: #fff; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f97316; padding-bottom: 20px; margin-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #101c2c; }
    .logo span { color: #f97316; }
    .company-details { text-align: right; font-size: 12px; color: #666; }
    .footer { text-align: center; font-size: 11px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="report-box">
    <div class="header">
      <div class="logo">Speshway <span>Logistics</span></div>
      <div class="company-details">
        <strong>Speshway Logistics Pvt Ltd</strong><br>
        Trip Report $displayId<br>
        Pickup: $pickupLoc | Destination: $destLoc<br>
        Distance: $distanceStr
      </div>
    </div>
    <div class="footer">
      System-generated Completed Trip Report from Speshway Logistics.
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 500);
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
      }
    } catch (_) {}
  }

  Future<void> _shareTripReport() async {
    if (_trip == null) return;

    final trip = _trip!;
    final rawTripNumber = trip['tripNumber'] ?? widget.tripId;
    final displayId = rawTripNumber.toString().startsWith('#') ? rawTripNumber.toString() : '#$rawTripNumber';
    final pickupLoc = trip['pickup'] ?? trip['startLocation'] ?? '--';
    final destLoc = trip['destination'] ?? trip['endLocation'] ?? '--';
    final distanceStr = trip['actualDistance'] != null ? '${trip['actualDistance']} km' : '--';

    final shareText = 'Speshway Logistics - Completed Trip Report $displayId\n'
        'From: $pickupLoc\n'
        'To: $destLoc\n'
        'Distance: $distanceStr\n'
        'Status: Completed';

    await Clipboard.setData(ClipboardData(text: shareText));
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('📋 Trip Report summary copied to clipboard!'),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  // 9. Bottom Actions
  Widget _buildFooterActions(BuildContext context) {
    return Column(
      children: [
        ElevatedButton.icon(
          onPressed: _downloadTripReport,
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
          onPressed: _shareTripReport,
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
    return Expanded(
      child: Column(
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
            overflow: TextOverflow.ellipsis,
            maxLines: 1,
          ),
        ],
      ),
    );
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
        debugPrint('[DEBUG] [Document View Dialog] Title: $title, DocumentName: $documentName, DocumentUrl: $documentUrl, Details: $details');
        final isUploaded = details != null || (documentUrl != null && documentUrl.isNotEmpty);
        
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16.0),
          ),
          insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
          backgroundColor: AppColors.background,
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 450),
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            title,
                            style: const TextStyle(
                              color: AppColors.primaryText,
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                            ),
                            overflow: TextOverflow.ellipsis,
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
                                  Flexible(
                                    child: Text(
                                      key,
                                      style: const TextStyle(color: AppColors.secondaryText, fontSize: 13),
                                    ),
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
                                Flexible(
                                  child: Text(
                                    key,
                                    style: const TextStyle(color: AppColors.secondaryText, fontSize: 13),
                                  ),
                                ),
                                const SizedBox(width: 12),
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
                          DocumentPreviewDialog.open(
                            context,
                            title: '$documentName Document',
                            documentUrl: documentUrl,
                            documentName: documentName,
                          );
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
        ),
      ),
    );
  },
);
  }
}
