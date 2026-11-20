import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../constants/app_colors.dart';
import '../services/api_service.dart';
import '../services/localization_service.dart';
import '../utils/navigation_helper.dart';
import '../widgets/custom_app_bar.dart';
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
  State<CompletedTripDetailsScreen> createState() =>
      _CompletedTripDetailsScreenState();
}

class _CompletedTripDetailsScreenState
    extends State<CompletedTripDetailsScreen> {
  static final Map<String, Map<String, dynamic>> _cachedCompletedDetails = {};

  bool _isLoading = true;
  Map<String, dynamic>? _trip;

  @override
  void initState() {
    super.initState();
    final cleanId = widget.tripId.replaceAll('#', '').trim();
    if (widget.tripData != null) {
      _trip = widget.tripData;
      _cachedCompletedDetails[cleanId] = widget.tripData!;
      _isLoading = false;
    } else if (_cachedCompletedDetails.containsKey(cleanId)) {
      _trip = _cachedCompletedDetails[cleanId];
      _isLoading = false;
    }
    _fetchTripDetails();
  }

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
      debugPrint('[DEBUG] [GET Trip Details API response] res: $res');
      if (res != null && res['data'] != null && res['data'] is Map) {
        if (mounted) {
          final tripMap = Map<String, dynamic>.from(res['data'] as Map);
          _cachedCompletedDetails[cleanId] = tripMap;
          setState(() {
            _trip = tripMap;
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

  String _formatDate(dynamic dateStr) {
    if (dateStr == null) return '--';
    final str = dateStr.toString().trim();
    if (str.isEmpty || str == 'null') return '--';
    try {
      final dt = DateTime.parse(str).toLocal();
      const months = [
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
        'Dec'
      ];
      return '${dt.day} ${months[dt.month - 1]} ${dt.year}';
    } catch (_) {
      return '--';
    }
  }

  String _formatTime(dynamic dateStr) {
    if (dateStr == null) return '--';
    final str = dateStr.toString().trim();
    if (str.isEmpty || str == 'null') return '--';
    try {
      final dt = DateTime.parse(str).toLocal();
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

  String _calculateDuration(dynamic startVal, dynamic endVal) {
    if (startVal == null || endVal == null) return '--';
    final startStr = startVal.toString().trim();
    final endStr = endVal.toString().trim();
    if (startStr.isEmpty ||
        startStr == 'null' ||
        endStr.isEmpty ||
        endStr == 'null') {
      return '--';
    }
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

  String _calculateAvgSpeed(double distance, dynamic startVal, dynamic endVal) {
    if (distance <= 0 || startVal == null || endVal == null) return '--';
    final startStr = startVal.toString().trim();
    final endStr = endVal.toString().trim();
    if (startStr.isEmpty ||
        startStr == 'null' ||
        endStr.isEmpty ||
        endStr == 'null') {
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
      if (timestamp != null) {
        final str = timestamp.toString().trim();
        if (str.isNotEmpty && str != 'null') {
          final formattedTime = _formatTime(str);
          if (formattedTime != '--') {
            events.add({
              'title': title,
              'time': formattedTime,
              'done': isDone,
            });
          }
        }
      }
    }

    final pod = trip['proofOfDelivery'] is Map
        ? Map<String, dynamic>.from(trip['proofOfDelivery'] as Map)
        : null;
    final wb = trip['weighbridgeSlip'] is Map
        ? Map<String, dynamic>.from(trip['weighbridgeSlip'] as Map)
        : null;

    addEvent('Trip Assigned', trip['createdAt'] ?? trip['assignedAt'], true);
    addEvent('Driver Accepted', trip['acceptedAt'], true);
    addEvent('Journey Started',
        trip['actualStartTime'] ?? trip['departureTime'], true);
    addEvent('Pickup Reached',
        trip['customerLocationReachedAt'] ?? trip['pickupReachedAt'], true);
    addEvent('En Route', trip['enRouteAt'], true);
    addEvent('Destination Reached',
        trip['endedAt'] ?? trip['destinationReachedAt'], true);
    addEvent('POD Uploaded', pod?['uploadedAt'] ?? trip['podUploadedAt'], true);
    addEvent('Weighbridge Uploaded',
        wb?['uploadedAt'] ?? trip['weighbridgeUploadedAt'], true);
    addEvent('Manager Approved',
        trip['managerApprovedAt'] ?? trip['approvedAt'], true);
    addEvent('Trip Completed',
        trip['completedAt'] ?? trip['actualEndTime'] ?? trip['updatedAt'], true);

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
    return ValueListenableBuilder<String>(
      valueListenable: LocalizationService.currentLanguageNotifier,
      builder: (context, currentLang, _) {
        Widget page;
        if (_isLoading && _trip == null) {
          page = Scaffold(
            backgroundColor: const Color(0xFFF4F6FA),
            appBar: CustomAppBar(
              centerTitle: false,
              fallbackTab: 3,
              backgroundColor: AppColors.primary,
              title: Text(
                'Completed Trip Details'.tr,
                style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 18,
                ),
              ),
            ),
            body: const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF2563EB)),
              ),
            ),
          );
        } else if (_trip == null) {
          page = Scaffold(
            backgroundColor: const Color(0xFFF4F6FA),
            appBar: CustomAppBar(
              centerTitle: false,
              fallbackTab: 3,
              backgroundColor: AppColors.primary,
              title: Text(
                'Completed Trip Details'.tr,
                style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 18,
                ),
              ),
            ),
            body: Center(
              child: Text(
                'Trip not found'.tr,
                style: GoogleFonts.poppins(
                  color: const Color(0xFF475569),
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          );
        } else {
          final trip = _trip!;
          final rawTripNumber = trip['tripNumber'] ?? widget.tripId;
          final displayId = rawTripNumber.toString().startsWith('#')
              ? rawTripNumber.toString()
              : '#$rawTripNumber';

          final dateStr = _formatDate(
              trip['completedAt'] ?? trip['actualEndTime'] ?? trip['createdAt']);
          final timeStr = _formatTime(
              trip['completedAt'] ?? trip['actualEndTime'] ?? trip['createdAt']);

          // Pickup Location Resolution
          String pickupLoc = '--';
          if (trip['startLocation'] != null &&
              trip['startLocation'].toString().trim().isNotEmpty) {
            pickupLoc = trip['startLocation'].toString();
          } else if (trip['pickup'] != null &&
              trip['pickup'].toString().trim().isNotEmpty) {
            pickupLoc = trip['pickup'].toString();
          } else if (trip['pickupAddress'] is Map &&
              trip['pickupAddress']['city'] != null &&
              trip['pickupAddress']['city'].toString().trim().isNotEmpty) {
            pickupLoc =
                '${trip['pickupAddress']['city']}, ${trip['pickupAddress']['state'] ?? ''}';
          }

          // Destination Location Resolution
          String destLoc = '--';
          if (trip['endLocation'] != null &&
              trip['endLocation'].toString().trim().isNotEmpty) {
            destLoc = trip['endLocation'].toString();
          } else if (trip['destination'] != null &&
              trip['destination'].toString().trim().isNotEmpty) {
            destLoc = trip['destination'].toString();
          } else if (trip['deliveryAddress'] is Map &&
              trip['deliveryAddress']['city'] != null &&
              trip['deliveryAddress']['city'].toString().trim().isNotEmpty) {
            destLoc =
                '${trip['deliveryAddress']['city']}, ${trip['deliveryAddress']['state'] ?? ''}';
          }

          // Distance Resolution
          double distanceVal =
              double.tryParse(trip['distance']?.toString() ?? '') ?? 0.0;
          if (distanceVal == 0.0) {
            distanceVal =
                double.tryParse(trip['totalDistance']?.toString() ?? '') ?? 0.0;
          }
          if (distanceVal == 0.0 && trip['actualDistance'] != null) {
            distanceVal =
                double.tryParse(trip['actualDistance'].toString()) ?? 0.0;
          }
          if (distanceVal == 0.0 && trip['estimatedDistance'] != null) {
            distanceVal =
                double.tryParse(trip['estimatedDistance'].toString()) ?? 0.0;
          }

          final distanceStr =
              distanceVal > 0 ? '${distanceVal.toStringAsFixed(0)} km' : '--';
          final startTimestamp = trip['actualStartTime']?.toString() ??
              trip['departureTime']?.toString() ??
              trip['createdAt']?.toString();
          final endTimestamp = trip['actualEndTime']?.toString() ??
              trip['completedAt']?.toString() ??
              trip['endedAt']?.toString() ??
              trip['updatedAt']?.toString();
          final durationStr = _calculateDuration(startTimestamp, endTimestamp);

          // Fuel Consumed Resolution
          String fuelTotal = '--';
          if (trip['totalFuelLiters'] != null &&
              (double.tryParse(trip['totalFuelLiters'].toString()) ?? 0) > 0) {
            fuelTotal =
                '${double.parse(trip['totalFuelLiters'].toString()).toStringAsFixed(0)}L';
          } else if (trip['fuelDetails'] is Map &&
              trip['fuelDetails']['liters'] != null) {
            final l =
                double.tryParse(trip['fuelDetails']['liters'].toString());
            if (l != null && l > 0) {
              fuelTotal = '${l.toStringAsFixed(0)}L';
            }
          } else if (trip['fuelUsed'] != null &&
              trip['fuelUsed'].toString().trim().isNotEmpty) {
            fuelTotal = '${trip['fuelUsed']}L'.replaceAll('LL', 'L');
          }

          // Stops Count Resolution
          String stopsCount = '0';
          if (trip['stopCount'] != null) {
            stopsCount = trip['stopCount'].toString();
          } else if (trip['stops'] is List &&
              (trip['stops'] as List).isNotEmpty) {
            stopsCount = (trip['stops'] as List).length.toString();
          } else if (trip['customerLocationReached'] == true) {
            stopsCount = '1';
          } else if (distanceVal > 0) {
            stopsCount =
                distanceVal > 200 ? '2' : (distanceVal > 100 ? '1' : '0');
          }

          final avgSpeed =
              _calculateAvgSpeed(distanceVal, startTimestamp, endTimestamp);

          // Vehicle Display Resolution
          final vehicleName = (trip['vehicleName'] != null &&
                  trip['vehicleName'].toString().trim().isNotEmpty)
              ? trip['vehicleName'].toString()
              : (trip['vehicle'] is Map
                  ? (trip['vehicle']['vehicleModel'] ??
                      trip['vehicle']['brand'] ??
                      trip['vehicle']['vehicleName'] ??
                      trip['vehicle']['name'] ??
                      '')
                  : '');
          final vehiclePlate = (trip['vehiclePlate'] != null &&
                  trip['vehiclePlate'].toString().trim().isNotEmpty)
              ? trip['vehiclePlate'].toString()
              : (trip['vehicle'] is Map
                  ? (trip['vehicle']['vehicleNumber'] ??
                      trip['vehicle']['registrationNumber'] ??
                      '')
                  : '');

          String vehicleDisplay = '--';
          if (vehicleName.toString().isNotEmpty &&
              vehiclePlate.toString().isNotEmpty) {
            vehicleDisplay = '$vehicleName • $vehiclePlate';
          } else if (vehicleName.toString().isNotEmpty) {
            vehicleDisplay = vehicleName.toString();
          } else if (vehiclePlate.toString().isNotEmpty) {
            vehicleDisplay = vehiclePlate.toString();
          }

          // Driver Resolution
          final driverName = (trip['driverName'] != null &&
                  trip['driverName'].toString().trim().isNotEmpty)
              ? trip['driverName'].toString()
              : (trip['driver'] is Map &&
                      (trip['driver']['fullName'] ?? trip['driver']['name']) !=
                          null)
                  ? (trip['driver']['fullName'] ?? trip['driver']['name'])
                      .toString()
                  : '--';

          // Manager Resolution
          final managerObj = trip['manager'] ?? trip['assignedManager'];
          final managerName = (trip['managerName'] != null &&
                  trip['managerName'].toString().trim().isNotEmpty)
              ? trip['managerName'].toString()
              : (managerObj is Map &&
                      (managerObj['name'] ?? managerObj['fullName']) != null &&
                      (managerObj['name'] ?? managerObj['fullName'])
                          .toString()
                          .trim()
                          .isNotEmpty)
                  ? (managerObj['name'] ?? managerObj['fullName']).toString()
                  : '--';

          // POD & Notes & Receiver Resolution
          final podDetails = trip['podDetails'] is Map
              ? Map<String, dynamic>.from(trip['podDetails'] as Map)
              : (trip['proofOfDelivery'] is Map
                  ? Map<String, dynamic>.from(trip['proofOfDelivery'] as Map)
                  : null);

          final notes = (trip['tripNotes'] != null &&
                  trip['tripNotes'].toString().trim().isNotEmpty)
              ? trip['tripNotes'].toString()
              : (trip['description'] != null &&
                      trip['description'].toString().trim().isNotEmpty)
                  ? trip['description'].toString()
                  : 'No additional notes provided for this trip.';

          final receiver = (trip['receiverName'] != null &&
                  trip['receiverName'].toString().trim().isNotEmpty)
              ? trip['receiverName'].toString()
              : (podDetails != null &&
                      podDetails['receiverName'] != null &&
                      podDetails['receiverName'].toString().trim().isNotEmpty)
                  ? podDetails['receiverName'].toString()
                  : (podDetails != null &&
                          podDetails['customerName'] != null &&
                          podDetails['customerName']
                              .toString()
                              .trim()
                              .isNotEmpty)
                      ? podDetails['customerName'].toString()
                      : (trip['deliveryAddress'] is Map &&
                              trip['deliveryAddress']['contactPerson'] !=
                                  null &&
                              trip['deliveryAddress']['contactPerson']
                                  .toString()
                                  .trim()
                                  .isNotEmpty)
                          ? trip['deliveryAddress']['contactPerson'].toString()
                          : '--';

          final timelineEvents = _buildTimelineEvents(trip);

          page = Scaffold(
            backgroundColor: const Color(0xFFF4F6FA),
            appBar: CustomAppBar(
              centerTitle: false,
              fallbackTab: 3,
              backgroundColor: AppColors.primary,
              title: Text(
                'Completed Trip Details'.tr,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            body: SafeArea(
              child: RefreshIndicator(
                onRefresh: () async {
                  _cachedCompletedDetails.remove(
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
                color: const Color(0xFF2563EB),
                backgroundColor: Colors.white,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(
                    parent: BouncingScrollPhysics(),
                  ),
                  padding:
                      const EdgeInsets.fromLTRB(16.0, 16.0, 16.0, 28.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // 1. Summary Header Card (Executive Navy Hero with Green Completed Badge)
                      _buildSummaryHeaderCard(
                          context, displayId, dateStr, timeStr),
                      const SizedBox(height: 14),

                      // 2. Route Details Card
                      _buildRouteDetailsCard(
                        context,
                        pickupLoc,
                        destLoc,
                        distanceStr,
                        durationStr,
                      ),
                      const SizedBox(height: 14),

                      // 3. Vehicle & Crew Card
                      _buildVehicleCrewCard(
                        context,
                        vehicleDisplay,
                        driverName,
                        managerName,
                      ),
                      const SizedBox(height: 18),

                      // 4. Performance KPI Grid (Distinct Color-Coded Premium Cards)
                      _buildSectionTitle(
                        context,
                        'Performance'.tr,
                        icon: Icons.insights_rounded,
                        accentColor: const Color(0xFF2563EB),
                        tintColor: const Color(0xFFEFF6FF),
                        borderColor: const Color(0xFFBFDBFE),
                      ),
                      _buildPerformanceGrid(
                        context,
                        distanceStr,
                        fuelTotal,
                        avgSpeed,
                        stopsCount,
                      ),
                      const SizedBox(height: 18),

                      // 5. Trip Timeline Card
                      _buildSectionTitle(
                        context,
                        'Trip Timeline'.tr,
                        icon: Icons.timeline_rounded,
                        accentColor: const Color(0xFF059669),
                        tintColor: const Color(0xFFECFDF5),
                        borderColor: const Color(0xFFA7F3D0),
                      ),
                      _buildTimelineCard(context, timelineEvents),
                      const SizedBox(height: 18),

                      // 6. Documents Section
                      _buildSectionTitle(
                        context,
                        'Documents'.tr,
                        icon: Icons.folder_copy_rounded,
                        accentColor: const Color(0xFF7C3AED),
                        tintColor: const Color(0xFFF5F3FF),
                        borderColor: const Color(0xFFDDD6FE),
                      ),
                      _buildDocumentsCard(context, trip, displayId),
                      const SizedBox(height: 14),

                      // 7. Trip Notes Card
                      _buildTripNotesCard(context, notes),
                      const SizedBox(height: 14),

                      // 8. Delivery Confirmation Card
                      _buildDeliveryConfirmationCard(
                        context,
                        receiver,
                        'Signed & Verified',
                      ),
                      const SizedBox(height: 22),

                      // 9. Bottom Actions
                      _buildFooterActions(context),
                      const SizedBox(height: 12),
                    ],
                  ),
                ),
              ),
            ),
          );
        }

        return PopScope(
          canPop: false,
          onPopInvokedWithResult: (didPop, result) {
            if (!didPop) SafeNavigation.pop(context, fallbackTab: 3);
          },
          child: page,
        );
      },
    );
  }

  Widget _buildPremiumCard({
    required Widget child,
    EdgeInsetsGeometry padding = const EdgeInsets.all(18.0),
    Color backgroundColor = Colors.white,
    Color borderColor = const Color(0xFFE6ECF4),
    Gradient? gradient,
    Color? shadowColor,
  }) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: gradient == null ? backgroundColor : null,
        gradient: gradient,
        borderRadius: BorderRadius.circular(20.0),
        border: Border.all(color: borderColor, width: 1.0),
        boxShadow: [
          BoxShadow(
            color: (shadowColor ?? const Color(0xFF0F172A)).withValues(alpha: 0.05),
            blurRadius: 16,
            offset: const Offset(0, 5),
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

  Widget _buildSectionTitle(
    BuildContext context,
    String title, {
    required IconData icon,
    required Color accentColor,
    required Color tintColor,
    required Color borderColor,
  }) {
    return Padding(
      padding: const EdgeInsets.only(left: 2.0, bottom: 10.0),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: tintColor,
              borderRadius: BorderRadius.circular(10.0),
              border: Border.all(color: borderColor, width: 1.0),
            ),
            child: Icon(icon, color: accentColor, size: 16),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              title,
              style: GoogleFonts.poppins(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF0F172A),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // 1. Summary Header Card (Executive Deep Navy Hero with Emerald Glow)
  Widget _buildSummaryHeaderCard(
    BuildContext context,
    String displayId,
    String date,
    String time,
  ) {
    return Container(
      padding: const EdgeInsets.all(20.0),
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
        borderRadius: BorderRadius.circular(22.0),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.12),
          width: 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0B1626).withValues(alpha: 0.28),
            blurRadius: 22,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: Color(0xFF4ADE80),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'TRIP ID'.tr,
                          style: GoogleFonts.poppins(
                            color: Colors.white70,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      displayId,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 22,
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
                  vertical: 6.5,
                ),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF059669), Color(0xFF047857)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF059669).withValues(alpha: 0.35),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.check_circle_rounded,
                      color: Colors.white,
                      size: 14,
                    ),
                    const SizedBox(width: 5),
                    Text(
                      'Completed'.tr,
                      style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 11.5,
                        letterSpacing: 0.2,
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
            color: Colors.white.withValues(alpha: 0.12),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(13),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.10),
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF59E0B).withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.calendar_today_rounded,
                          color: Color(0xFFFBBF24),
                          size: 14,
                        ),
                      ),
                      const SizedBox(width: 9),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Date'.tr,
                              style: GoogleFonts.nunito(
                                color: Colors.white60,
                                fontSize: 10.5,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            Text(
                              date,
                              overflow: TextOverflow.ellipsis,
                              maxLines: 1,
                              style: GoogleFonts.poppins(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                                fontSize: 12.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(13),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.10),
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: const Color(0xFF38BDF8).withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.schedule_rounded,
                          color: Color(0xFF38BDF8),
                          size: 15,
                        ),
                      ),
                      const SizedBox(width: 9),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Time'.tr,
                              style: GoogleFonts.nunito(
                                color: Colors.white60,
                                fontSize: 10.5,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            Text(
                              time,
                              overflow: TextOverflow.ellipsis,
                              maxLines: 1,
                              style: GoogleFonts.poppins(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                                fontSize: 12.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
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
    return _buildPremiumCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF2563EB), Color(0xFF1D4ED8)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(10.0),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF2563EB).withValues(alpha: 0.28),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.alt_route_rounded,
                  color: Colors.white,
                  size: 17,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'ROUTE OVERVIEW'.tr,
                  style: GoogleFonts.poppins(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF334155),
                    letterSpacing: 0.7,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(14.0),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Colors.white, Color(0xFFF8FAFC)],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
              borderRadius: BorderRadius.circular(16.0),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Column(
                  children: [
                    Container(
                      width: 26,
                      height: 26,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFFEFF6FF),
                        border: Border.all(
                          color: const Color(0xFF2563EB),
                          width: 2.2,
                        ),
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.trip_origin_rounded,
                          color: Color(0xFF2563EB),
                          size: 13,
                        ),
                      ),
                    ),
                    Container(
                      width: 2.5,
                      height: 40,
                      margin: const EdgeInsets.symmetric(vertical: 3),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF2563EB), Color(0xFF059669)],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    Container(
                      width: 26,
                      height: 26,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFFECFDF5),
                        border: Border.all(
                          color: const Color(0xFF059669),
                          width: 2.2,
                        ),
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.location_on_rounded,
                          color: Color(0xFF059669),
                          size: 15,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEFF6FF),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFFBFDBFE)),
                        ),
                        child: Text(
                          'PICKUP'.tr,
                          style: GoogleFonts.poppins(
                            color: const Color(0xFF2563EB),
                            fontSize: 9.5,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.6,
                          ),
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        pickup,
                        style: GoogleFonts.poppins(
                          color: const Color(0xFF0F172A),
                          fontSize: 13.5,
                          fontWeight: FontWeight.w700,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 18),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFECFDF5),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFFA7F3D0)),
                        ),
                        child: Text(
                          'DESTINATION'.tr,
                          style: GoogleFonts.poppins(
                            color: const Color(0xFF059669),
                            fontSize: 9.5,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.6,
                          ),
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        destination,
                        style: GoogleFonts.poppins(
                          color: const Color(0xFF0F172A),
                          fontSize: 13.5,
                          fontWeight: FontWeight.w700,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Colors.white, Color(0xFFEFF6FF)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFBFDBFE)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 30,
                        height: 30,
                        decoration: BoxDecoration(
                          color: const Color(0xFF2563EB).withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.straighten_rounded,
                          color: Color(0xFF2563EB),
                          size: 16,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Distance'.tr,
                              style: GoogleFonts.nunito(
                                color: const Color(0xFF64748B),
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            Text(
                              distance,
                              overflow: TextOverflow.ellipsis,
                              maxLines: 1,
                              style: GoogleFonts.poppins(
                                color: const Color(0xFF0F172A),
                                fontWeight: FontWeight.w800,
                                fontSize: 13.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Colors.white, Color(0xFFF5F3FF)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFDDD6FE)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 30,
                        height: 30,
                        decoration: BoxDecoration(
                          color: const Color(0xFF7C3AED).withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.timer_rounded,
                          color: Color(0xFF7C3AED),
                          size: 16,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Duration'.tr,
                              style: GoogleFonts.nunito(
                                color: const Color(0xFF64748B),
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            Text(
                              duration,
                              overflow: TextOverflow.ellipsis,
                              maxLines: 1,
                              style: GoogleFonts.poppins(
                                color: const Color(0xFF0F172A),
                                fontWeight: FontWeight.w800,
                                fontSize: 13.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9.5),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFECFDF5), Color(0xFFE0F2FE)],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
              borderRadius: BorderRadius.circular(13),
              border: Border.all(color: const Color(0xFFA7F3D0)),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.verified_rounded,
                  color: Color(0xFF059669),
                  size: 18,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Route Completed Successfully'.tr,
                    style: GoogleFonts.poppins(
                      color: const Color(0xFF047857),
                      fontWeight: FontWeight.w700,
                      fontSize: 12.5,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
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
    return _buildPremiumCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFFF6A00), Color(0xFFEA580C)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFEA580C).withValues(alpha: 0.32),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.local_shipping_rounded,
                  color: Colors.white,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Vehicle'.tr,
                      style: GoogleFonts.nunito(
                        color: const Color(0xFF64748B),
                        fontSize: 11.5,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      vehicleDisplay,
                      style: GoogleFonts.poppins(
                        color: const Color(0xFF0F172A),
                        fontWeight: FontWeight.w700,
                        fontSize: 14.5,
                      ),
                      overflow: TextOverflow.ellipsis,
                      maxLines: 1,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Divider(height: 1, color: Color(0xFFE8EDF5)),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Colors.white, Color(0xFFEFF6FF)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(13),
                    border: Border.all(color: const Color(0xFFBFDBFE)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: const Color(0xFF2563EB).withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.person_rounded,
                          size: 16,
                          color: Color(0xFF2563EB),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Driver'.tr,
                              style: GoogleFonts.nunito(
                                color: const Color(0xFF64748B),
                                fontSize: 10.5,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            Text(
                              driver,
                              overflow: TextOverflow.ellipsis,
                              maxLines: 1,
                              style: GoogleFonts.poppins(
                                color: const Color(0xFF0F172A),
                                fontWeight: FontWeight.w700,
                                fontSize: 12.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Colors.white, Color(0xFFF5F3FF)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(13),
                    border: Border.all(color: const Color(0xFFDDD6FE)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: const Color(0xFF7C3AED).withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.support_agent_rounded,
                          size: 16,
                          color: Color(0xFF7C3AED),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Manager'.tr,
                              style: GoogleFonts.nunito(
                                color: const Color(0xFF64748B),
                                fontSize: 10.5,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            Text(
                              manager,
                              overflow: TextOverflow.ellipsis,
                              maxLines: 1,
                              style: GoogleFonts.poppins(
                                color: const Color(0xFF0F172A),
                                fontWeight: FontWeight.w700,
                                fontSize: 12.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 4. Performance KPI Grid (Compact Color-Coded Premium Cards)
  Widget _buildPerformanceGrid(
    BuildContext context,
    String distance,
    String fuel,
    String avgSpeed,
    String stops,
  ) {
    return Column(
      children: [
        IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: _buildPerformanceCard(
                  icon: Icons.map_rounded,
                  label: 'Distance'.tr,
                  value: distance,
                  accentColor: const Color(0xFF2563EB),
                  gradientEnd: const Color(0xFFEFF6FF),
                  borderColor: const Color(0xFFBFDBFE),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildPerformanceCard(
                  icon: Icons.local_gas_station_rounded,
                  label: 'Fuel Consumed'.tr,
                  value: fuel,
                  accentColor: const Color(0xFFEA580C),
                  gradientEnd: const Color(0xFFFFF7ED),
                  borderColor: const Color(0xFFFED7AA),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),
        IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: _buildPerformanceCard(
                  icon: Icons.speed_rounded,
                  label: 'Avg Speed'.tr,
                  value: avgSpeed,
                  accentColor: const Color(0xFF059669),
                  gradientEnd: const Color(0xFFECFDF5),
                  borderColor: const Color(0xFFA7F3D0),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildPerformanceCard(
                  icon: Icons.pin_drop_rounded,
                  label: 'Total Stops'.tr,
                  value: stops,
                  accentColor: const Color(0xFF7C3AED),
                  gradientEnd: const Color(0xFFF5F3FF),
                  borderColor: const Color(0xFFDDD6FE),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPerformanceCard({
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
        borderRadius: BorderRadius.circular(15.0),
        border: Border.all(color: borderColor, width: 1.0),
        boxShadow: [
          BoxShadow(
            color: accentColor.withValues(alpha: 0.10),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [accentColor, accentColor.withValues(alpha: 0.82)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(10.0),
              boxShadow: [
                BoxShadow(
                  color: accentColor.withValues(alpha: 0.28),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Icon(icon, color: Colors.white, size: 17),
          ),
          const SizedBox(width: 9),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.nunito(
                    color: const Color(0xFF475569),
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 1),
                Text(
                  value,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.poppins(
                    color: const Color(0xFF0F172A),
                    fontWeight: FontWeight.w800,
                    fontSize: 14.5,
                    letterSpacing: -0.2,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 5. Trip Timeline
  Widget _buildTimelineCard(
    BuildContext context,
    List<Map<String, dynamic>> timelineEvents,
  ) {
    return _buildPremiumCard(
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
                      width: 18,
                      height: 18,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFF059669),
                        border: Border.all(
                          color: const Color(0xFFA7F3D0),
                          width: 3,
                        ),
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.check_rounded,
                          color: Colors.white,
                          size: 10,
                        ),
                      ),
                    ),
                    if (!isLast)
                      Expanded(
                        child: Container(
                          width: 2.5,
                          margin: const EdgeInsets.symmetric(vertical: 2),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF059669), Color(0xFF34D399)],
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                            ),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Padding(
                    padding: EdgeInsets.only(bottom: isLast ? 2.0 : 16.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            (event['title']?.toString() ?? '').tr,
                            style: GoogleFonts.poppins(
                              color: const Color(0xFF0F172A),
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 9,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                                color: const Color(0xFFE2E8F0), width: 0.8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.schedule_rounded,
                                size: 11,
                                color: Color(0xFF64748B),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                event['time']?.toString() ?? '',
                                style: GoogleFonts.nunito(
                                  color: const Color(0xFF475569),
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
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
  Widget _buildDocumentsCard(
    BuildContext context,
    Map<String, dynamic> trip,
    String displayId,
  ) {
    final docs = [
      {
        'name': 'Invoice',
        'action': 'VIEW',
        'isView': true,
        'icon': Icons.receipt_long_rounded,
        'color': const Color(0xFF2563EB),
        'tint': const Color(0xFFEFF6FF),
        'border': const Color(0xFFBFDBFE),
      },
      {
        'name': 'Toll Fee Receipt',
        'action': 'VIEW',
        'isView': true,
        'icon': Icons.toll_rounded,
        'color': const Color(0xFFD97706),
        'tint': const Color(0xFFFFFBEB),
        'border': const Color(0xFFFDE68A),
      },
      {
        'name': 'Proof of Delivery (POD)',
        'action': 'VIEW',
        'isView': true,
        'icon': Icons.verified_outlined,
        'color': const Color(0xFF059669),
        'tint': const Color(0xFFECFDF5),
        'border': const Color(0xFFA7F3D0),
      },
      {
        'name': 'Weighbridge Slip',
        'action': 'VIEW',
        'isView': true,
        'icon': Icons.scale_rounded,
        'color': const Color(0xFF7C3AED),
        'tint': const Color(0xFFF5F3FF),
        'border': const Color(0xFFDDD6FE),
      },
      {
        'name': 'Fuel Entry',
        'action': 'VIEW',
        'isView': true,
        'icon': Icons.local_gas_station_rounded,
        'color': const Color(0xFFEA580C),
        'tint': const Color(0xFFFFF7ED),
        'border': const Color(0xFFFED7AA),
      },
    ];

    return _buildPremiumCard(
      padding: const EdgeInsets.all(14.0),
      child: Column(
        children: docs.map((doc) {
          final isView = doc['isView'] as bool;
          final icon = doc['icon'] as IconData;
          final color = doc['color'] as Color;
          final tint = doc['tint'] as Color;
          final border = doc['border'] as Color;

          return Container(
            margin: const EdgeInsets.symmetric(vertical: 4.5),
            padding: const EdgeInsets.symmetric(
              vertical: 10.0,
              horizontal: 12.0,
            ),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.white, tint.withValues(alpha: 0.6)],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
              borderRadius: BorderRadius.circular(14.0),
              border: Border.all(color: border, width: 1.0),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [color, color.withValues(alpha: 0.85)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: [
                            BoxShadow(
                              color: color.withValues(alpha: 0.28),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Icon(icon, color: Colors.white, size: 18),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          (doc['name']?.toString() ?? '').tr,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.poppins(
                            color: const Color(0xFF0F172A),
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Material(
                  color: Colors.transparent,
                  child: InkWell(
                    borderRadius: BorderRadius.circular(10),
                    onTap: () async {
                      Widget? targetScreen;
                      switch (doc['name']) {
                        case 'Invoice':
                          String? invId;
                          if (trip['tripInvoice'] is Map) {
                            invId = (trip['tripInvoice'] as Map)['invoiceId']
                                ?.toString();
                          }
                          invId ??= trip['invoiceId']?.toString();

                          String? invNum = trip['invoiceNumber']?.toString();
                          if ((invNum == null || invNum.isEmpty) &&
                              trip['tripInvoice'] is Map) {
                            invNum =
                                (trip['tripInvoice'] as Map)['invoiceNumber']
                                    ?.toString();
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
                          final pod = trip['podDetails'] is Map
                              ? Map<String, dynamic>.from(
                                  trip['podDetails'] as Map)
                              : (trip['proofOfDelivery'] is Map
                                  ? Map<String, dynamic>.from(
                                      trip['proofOfDelivery'] as Map)
                                  : null);
                          final podRawUrl = trip['podUrl']?.toString() ??
                              pod?['podDocumentUrl']?.toString() ??
                              pod?['deliveryPhotoUrl']?.toString() ??
                              pod?['url']?.toString();
                          final cleanPodUrl = (podRawUrl != null &&
                                  podRawUrl.trim().isNotEmpty &&
                                  podRawUrl.trim() != 'null')
                              ? podRawUrl.trim()
                              : null;

                          _showDocumentDetailsDialog(
                            context: context,
                            title: 'Proof of Delivery (POD)',
                            details: pod != null
                                ? {
                                    'POD Number': pod['podNumber'] ??
                                        'POD-${trip['tripNumber'] ?? displayId}',
                                    'Customer': pod['customerName'] ??
                                        'Customer Receiver',
                                    'Receiver': pod['receiverName'] ??
                                        'Verified Receiver',
                                    'Delivery Date': _formatDate(
                                      pod['deliveryDate']?.toString() ??
                                          pod['uploadedAt']?.toString(),
                                    ),
                                    'Status': pod['status'] ??
                                        trip['podStatus'] ??
                                        (cleanPodUrl != null
                                            ? 'Uploaded'
                                            : 'Pending'),
                                    if (pod['rejectionReason'] != null &&
                                        pod['rejectionReason']
                                            .toString()
                                            .isNotEmpty)
                                      'Rejection Reason':
                                          pod['rejectionReason'],
                                  }
                                : null,
                            documentUrl: cleanPodUrl,
                            documentName: 'POD',
                          );
                          break;
                        case 'Weighbridge Slip':
                          final wb = trip['weighbridgeDetails'] is Map
                              ? Map<String, dynamic>.from(
                                  trip['weighbridgeDetails'] as Map)
                              : (trip['weighbridgeSlip'] is Map
                                  ? Map<String, dynamic>.from(
                                      trip['weighbridgeSlip'] as Map)
                                  : null);
                          final wbRawUrl =
                              trip['weighbridgeUrl']?.toString() ??
                                  wb?['documentUrl']?.toString() ??
                                  wb?['url']?.toString();
                          final cleanWbUrl = (wbRawUrl != null &&
                                  wbRawUrl.trim().isNotEmpty &&
                                  wbRawUrl.trim() != 'null')
                              ? wbRawUrl.trim()
                              : null;

                          _showDocumentDetailsDialog(
                            context: context,
                            title: 'Weighbridge Slip',
                            details: wb != null
                                ? {
                                    'Slip Number': wb['slipNumber'] ??
                                        'WB-${trip['tripNumber'] ?? displayId}',
                                    'Gross Weight':
                                        '${wb['grossWeight'] ?? 25000} kg',
                                    'Tare Weight':
                                        '${wb['tareWeight'] ?? 10000} kg',
                                    'Net Weight':
                                        '${wb['netWeight'] ?? 15000} kg',
                                    'Location': wb['location'] ??
                                        'Highway Weighbridge Station',
                                    'Status': wb['status'] ??
                                        trip['weighbridgeStatus'] ??
                                        (cleanWbUrl != null
                                            ? 'Uploaded'
                                            : 'Pending'),
                                    if (wb['rejectionReason'] != null &&
                                        wb['rejectionReason']
                                            .toString()
                                            .isNotEmpty)
                                      'Rejection Reason':
                                          wb['rejectionReason'],
                                  }
                                : (trip['weighbridgeRequired'] == false
                                    ? {
                                        'Status':
                                            'Not required for this trip',
                                      }
                                    : null),
                            documentUrl: cleanWbUrl,
                            documentName: 'Weighbridge',
                          );
                          break;
                        case 'Fuel Entry':
                          final fuel = trip['fuelDetails'] is Map
                              ? Map<String, dynamic>.from(
                                  trip['fuelDetails'] as Map)
                              : ((trip['fuelEntries'] is List &&
                                      (trip['fuelEntries'] as List)
                                          .isNotEmpty)
                                  ? Map<String, dynamic>.from(
                                      (trip['fuelEntries'] as List).first
                                          as Map)
                                  : null);
                          final fuelRawUrl =
                              trip['fuelUrl']?.toString() ??
                                  fuel?['billUrl']?.toString() ??
                                  fuel?['receiptImage']?.toString();
                          final cleanFuelUrl = (fuelRawUrl != null &&
                                  fuelRawUrl.trim().isNotEmpty &&
                                  fuelRawUrl.trim() != 'null')
                              ? fuelRawUrl.trim()
                              : null;

                          _showDocumentDetailsDialog(
                            context: context,
                            title: 'Fuel Entry Details',
                            details: fuel != null
                                ? {
                                    'Station': fuel['fuelStation'] ??
                                        'Fuel Station',
                                    'Liters': '${fuel['liters'] ?? 0} L',
                                    'Amount': '₹${fuel['amount'] ?? 0}',
                                    'Odometer':
                                        '${fuel['odometer'] ?? '--'} km',
                                    'Status': fuel['approvalStatus'] ??
                                        fuel['billStatus'] ??
                                        trip['fuelStatus'] ??
                                        (cleanFuelUrl != null
                                            ? 'Uploaded'
                                            : 'Pending'),
                                    if (fuel['rejectionReason'] != null &&
                                        fuel['rejectionReason']
                                            .toString()
                                            .isNotEmpty)
                                      'Rejection Reason':
                                          fuel['rejectionReason'],
                                  }
                                : null,
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
                          MaterialPageRoute(
                            builder: (context) => targetScreen!,
                          ),
                        );
                        if (mounted) {
                          _fetchTripDetails();
                        }
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 11,
                        vertical: 6.5,
                      ),
                      decoration: BoxDecoration(
                        color: color.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: color.withValues(alpha: 0.35),
                          width: 1.0,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            (doc['action']?.toString() ?? '').tr,
                            style: GoogleFonts.poppins(
                              color: color,
                              fontWeight: FontWeight.w700,
                              fontSize: 11,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Icon(
                            isView
                                ? Icons.visibility_outlined
                                : Icons.download_outlined,
                            color: color,
                            size: 13.5,
                          ),
                        ],
                      ),
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

  // 7. Trip Notes
  Widget _buildTripNotesCard(BuildContext context, String notes) {
    return _buildPremiumCard(
      gradient: const LinearGradient(
        colors: [Colors.white, Color(0xFFFFFBEB)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      borderColor: const Color(0xFFFDE68A),
      shadowColor: const Color(0xFFD97706),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFD97706).withValues(alpha: 0.28),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.format_quote_rounded,
                  color: Colors.white,
                  size: 18,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'TRIP NOTES'.tr,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.poppins(
                    color: const Color(0xFF78350F),
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.7,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14.0),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.85),
              borderRadius: BorderRadius.circular(14.0),
              border: const Border(
                left: BorderSide(color: Color(0xFFD97706), width: 3.5),
              ),
            ),
            child: Text(
              notes.startsWith('"') ? notes : '"$notes"',
              style: GoogleFonts.nunito(
                color: const Color(0xFF1E293B),
                fontStyle: FontStyle.italic,
                fontWeight: FontWeight.w600,
                fontSize: 13.5,
                height: 1.45,
              ),
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
    return _buildPremiumCard(
      gradient: const LinearGradient(
        colors: [Colors.white, Color(0xFFF0FDF4)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      borderColor: const Color(0xFFBBF7D0),
      shadowColor: const Color(0xFF16A34A),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF16A34A), Color(0xFF15803D)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(11),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF16A34A).withValues(alpha: 0.32),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.verified_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Delivery Confirmation'.tr,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.poppins(
                          color: const Color(0xFF0F172A),
                          fontWeight: FontWeight.w700,
                          fontSize: 14.5,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              const Icon(
                Icons.check_circle_rounded,
                color: Color(0xFF16A34A),
                size: 20,
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFDCFCE7)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Receiver'.tr,
                        style: GoogleFonts.nunito(
                          color: const Color(0xFF64748B),
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        receiver,
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                        style: GoogleFonts.poppins(
                          color: const Color(0xFF0F172A),
                          fontWeight: FontWeight.w700,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFA7F3D0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Status'.tr,
                        style: GoogleFonts.nunito(
                          color: const Color(0xFF166534),
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        status.tr,
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                        style: GoogleFonts.poppins(
                          color: const Color(0xFF15803D),
                          fontWeight: FontWeight.w700,
                          fontSize: 12.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
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
    final displayId = rawTripNumber.toString().startsWith('#')
        ? rawTripNumber.toString()
        : '#$rawTripNumber';

    final pickupLoc = trip['pickup'] ?? trip['startLocation'] ?? '--';
    final destLoc = trip['destination'] ?? trip['endLocation'] ?? '--';
    final distanceStr = trip['actualDistance'] != null
        ? '${trip['actualDistance']} km'
        : (trip['estimatedDistance'] != null
            ? '${trip['estimatedDistance']} km'
            : '--');

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
      } else {
        final textUri = Uri.dataFromString(
          htmlContent,
          mimeType: 'text/html',
          encoding: Encoding.getByName('utf-8'),
        );
        await launchUrl(textUri, mode: LaunchMode.externalApplication);
      }
    } catch (_) {
      try {
        final textUri = Uri.dataFromString(
          htmlContent,
          mimeType: 'text/html',
          encoding: Encoding.getByName('utf-8'),
        );
        await launchUrl(textUri, mode: LaunchMode.externalApplication);
      } catch (_) {}
    }
  }

  Future<void> _shareTripReport() async {
    if (_trip == null) return;

    final trip = _trip!;
    final rawTripNumber = trip['tripNumber'] ?? widget.tripId;
    final displayId = rawTripNumber.toString().startsWith('#')
        ? rawTripNumber.toString()
        : '#$rawTripNumber';
    final pickupLoc = trip['pickup'] ?? trip['startLocation'] ?? '--';
    final destLoc = trip['destination'] ?? trip['endLocation'] ?? '--';
    final distanceStr = trip['actualDistance'] != null
        ? '${trip['actualDistance']} km'
        : '--';

    final shareText = 'Speshway Logistics - Completed Trip Report $displayId\n'
        'From: $pickupLoc\n'
        'To: $destLoc\n'
        'Distance: $distanceStr\n'
        'Status: Completed';

    await Clipboard.setData(ClipboardData(text: shareText));
    if (mounted && context.mounted) {
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
        Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16.0),
            gradient: const LinearGradient(
              colors: [
                Color(0xFF0B1626),
                Color(0xFF13263E),
                Color(0xFF1B3452),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF0B1626).withValues(alpha: 0.28),
                blurRadius: 14,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: ElevatedButton.icon(
            onPressed: _downloadTripReport,
            icon: const Icon(
              Icons.download_rounded,
              color: Colors.white,
              size: 20,
            ),
            label: Text(
              'Download Trip Report'.tr,
              style: GoogleFonts.poppins(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.transparent,
              foregroundColor: Colors.white,
              shadowColor: Colors.transparent,
              minimumSize: const Size(double.infinity, 52),
              padding: const EdgeInsets.symmetric(
                  vertical: 14, horizontal: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16.0),
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: _shareTripReport,
          icon: const Icon(
            Icons.share_rounded,
            color: Color(0xFFEA580C),
            size: 19,
          ),
          label: Text(
            'Share Report'.tr,
            style: GoogleFonts.poppins(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: const Color(0xFFEA580C),
            ),
          ),
          style: OutlinedButton.styleFrom(
            backgroundColor: Colors.white,
            side: const BorderSide(color: Color(0xFFFED7AA), width: 1.4),
            minimumSize: const Size(double.infinity, 52),
            padding: const EdgeInsets.symmetric(
                vertical: 14, horizontal: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16.0),
            ),
            shadowColor: const Color(0xFFEA580C).withValues(alpha: 0.08),
            elevation: 1,
          ),
        ),
      ],
    );
  }

  void _showDocumentDetailsDialog({
    required BuildContext context,
    required String title,
    required Map<String, dynamic>? details,
    required String? documentUrl,
    required String documentName,
  }) {
    final parentContext = context;
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        debugPrint(
            '[DEBUG] [Document View Dialog] Title: $title, DocumentName: $documentName, DocumentUrl: $documentUrl, Details: $details');
        final isUploaded = details != null ||
            (documentUrl != null && documentUrl.isNotEmpty);

        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20.0),
          ),
          insetPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
          backgroundColor: Colors.white,
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
                            style: GoogleFonts.poppins(
                              color: const Color(0xFF0F172A),
                              fontWeight: FontWeight.w700,
                              fontSize: 17,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close,
                              color: Color(0xFF64748B)),
                          onPressed: () => Navigator.pop(dialogContext),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    if (!isUploaded) ...[
                      Center(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 24.0),
                          child: Column(
                            children: [
                              const Icon(Icons.hourglass_empty_outlined,
                                  size: 48, color: Color(0xFF94A3B8)),
                              const SizedBox(height: 12),
                              Text(
                                'No Document Uploaded'.tr,
                                style: GoogleFonts.poppins(
                                  color: const Color(0xFF0F172A),
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'This document details are not available yet.'
                                    .tr,
                                style: GoogleFonts.nunito(
                                  color: const Color(0xFF64748B),
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
                            Color statusColor = const Color(0xFF64748B);
                            Color statusBg = const Color(0xFFF1F5F9);
                            Color statusBorder = const Color(0xFFE2E8F0);

                            if (val.toLowerCase() == 'approved') {
                              statusColor = const Color(0xFF059669);
                              statusBg = const Color(0xFFECFDF5);
                              statusBorder = const Color(0xFFA7F3D0);
                            } else if (val.toLowerCase() == 'rejected') {
                              statusColor = const Color(0xFFDC2626);
                              statusBg = const Color(0xFFFEF2F2);
                              statusBorder = const Color(0xFFFECACA);
                            } else {
                              statusColor = const Color(0xFFD97706);
                              statusBg = const Color(0xFFFFFBEB);
                              statusBorder = const Color(0xFFFDE68A);
                            }

                            return Padding(
                              padding:
                                  const EdgeInsets.symmetric(vertical: 6.0),
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Flexible(
                                    child: Text(
                                      key.tr,
                                      style: GoogleFonts.nunito(
                                        color: const Color(0xFF64748B),
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 2.5),
                                    decoration: BoxDecoration(
                                      color: statusBg,
                                      borderRadius:
                                          BorderRadius.circular(6),
                                      border:
                                          Border.all(color: statusBorder),
                                    ),
                                    child: Text(
                                      val.toUpperCase().tr,
                                      style: GoogleFonts.poppins(
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
                            padding:
                                const EdgeInsets.symmetric(vertical: 6.0),
                            child: Row(
                              mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                              children: [
                                Flexible(
                                  child: Text(
                                    key.tr,
                                    style: GoogleFonts.nunito(
                                      color: const Color(0xFF64748B),
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    val,
                                    style: GoogleFonts.poppins(
                                      color: const Color(0xFF0F172A),
                                      fontWeight: FontWeight.w700,
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
                      if (documentUrl != null &&
                          documentUrl.isNotEmpty) ...[
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () {
                              Navigator.pop(dialogContext);
                              if (parentContext.mounted) {
                                DocumentPreviewDialog.open(
                                  parentContext,
                                  title: '$documentName Document',
                                  documentUrl: documentUrl,
                                  documentName: documentName,
                                );
                              }
                            },
                            icon: const Icon(Icons.open_in_new,
                                size: 16, color: Colors.white),
                            label: Text(
                              '${'View'.tr} $documentName',
                              style: GoogleFonts.poppins(
                                fontWeight: FontWeight.w700,
                                fontSize: 13.5,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF2563EB),
                              foregroundColor: Colors.white,
                              padding:
                                  const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                          ),
                        ),
                      ] else ...[
                        SizedBox(
                          width: double.infinity,
                          child: Padding(
                            padding:
                                const EdgeInsets.symmetric(vertical: 8.0),
                            child: Text(
                              'No document file url available.'.tr,
                              style: GoogleFonts.nunito(
                                color: const Color(0xFF64748B),
                                fontSize: 12,
                                fontStyle: FontStyle.italic,
                              ),
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
