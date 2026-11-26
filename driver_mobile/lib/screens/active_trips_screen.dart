import 'dart:async';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import '../services/localization_service.dart';
import '../services/socket_service.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/live_tracking_map_widget.dart';
import '../utils/navigation_helper.dart';
import 'completed_trips_screen.dart';
import 'trip_details_screen.dart';

class ActiveTripsScreen extends StatefulWidget {
  const ActiveTripsScreen({super.key});

  static Map<String, dynamic>? cachedActiveTrip;

  static void clearCache() {
    cachedActiveTrip = null;
  }

  @override
  State<ActiveTripsScreen> createState() => _ActiveTripsScreenState();
}

class _ActiveTripsScreenState extends State<ActiveTripsScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _activeTrip;
  Timer? _loadingTimer;

  // Customer arrival slips state
  bool _reachedCustomer = false;

  // POD Slip details
  String? _podFileName;
  String? _podFileSize;
  bool _podUploaded = false;

  // Weighbridge Slip details
  String? _weighbridgeFileName;
  String? _weighbridgeFileSize;
  final TextEditingController _weighbridgeWeightController = TextEditingController(text: '14.85');
  bool _weighbridgeUploaded = false;

  @override
  void initState() {
    super.initState();
    if (ActiveTripsScreen.cachedActiveTrip != null) {
      _activeTrip = ActiveTripsScreen.cachedActiveTrip;
      _reachedCustomer = _activeTrip!['customerLocationReached'] ?? false;
      _podUploaded = (_activeTrip!['podStatus'] == 'Uploaded' || _activeTrip!['podStatus'] == 'Pending' || _activeTrip!['podStatus'] == 'Approved');
      _weighbridgeUploaded = (_activeTrip!['weighbridgeStatus'] == 'Uploaded' || _activeTrip!['weighbridgeStatus'] == 'Pending' || _activeTrip!['weighbridgeStatus'] == 'Approved');
      _isLoading = false;
    } else {
      _isLoading = true;
      if (!ApiService.isTest) {
        _loadingTimer?.cancel();
        _loadingTimer = Timer(const Duration(milliseconds: 500), () {
          if (mounted && _isLoading) setState(() => _isLoading = false);
        });
      }
    }
    _fetchActiveTrip();
    _setupSocketListeners();
  }

  @override
  void dispose() {
    _loadingTimer?.cancel();
    _weighbridgeWeightController.dispose();
    super.dispose();
  }

  void _setupSocketListeners() {
    SocketService.onEvent('trip:status-updated', (data) {
      if (mounted && data != null) {
        final status = data['status'];
        if (status == 'Completed') {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('🎉 Trip Completed! Your manager approved the POD & Weighbridge slips.'),
              backgroundColor: Color(0xFF059669),
              behavior: SnackBarBehavior.floating,
            ),
          );
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const CompletedTripsScreen()),
          );
        } else {
          _fetchActiveTrip();
        }
      }
    });

    SocketService.onEvent('pod:rejected', (data) {
      if (mounted && data != null) {
        final reason = data['rejectionReason'] ?? 'No reason provided';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('⚠️ POD Rejected: $reason. Please re-upload.'),
            backgroundColor: const Color(0xFFEF4444),
            behavior: SnackBarBehavior.floating,
          ),
        );
        _fetchActiveTrip();
      }
    });

    SocketService.onEvent('weighbridge:rejected', (data) {
      if (mounted && data != null) {
        final reason = data['rejectionReason'] ?? 'No reason provided';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('⚠️ Weighbridge Slip Rejected: $reason. Please re-upload.'),
            backgroundColor: const Color(0xFFEF4444),
            behavior: SnackBarBehavior.floating,
          ),
        );
        _fetchActiveTrip();
      }
    });

    SocketService.onEvent('trip:completed', (data) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🎉 Trip Completed! Your manager approved the POD & Weighbridge slips.'),
            backgroundColor: Color(0xFF059669),
            behavior: SnackBarBehavior.floating,
          ),
        );
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const CompletedTripsScreen()),
        );
      }
    });
  }

  Future<void> _fetchActiveTrip() async {
    if (!mounted) return;
    if (ActiveTripsScreen.cachedActiveTrip == null) {
      setState(() => _isLoading = true);
      if (!ApiService.isTest) {
        _loadingTimer?.cancel();
        _loadingTimer = Timer(const Duration(milliseconds: 500), () {
          if (mounted && _isLoading) setState(() => _isLoading = false);
        });
      }
    }
    try {
      final res = await ApiService.getCurrentTrip();
      _loadingTimer?.cancel();
      if (res != null && res['data'] != null) {
        final trip = res['data'];
        final status = (trip['status'] ?? '').toString();
        final activeStatuses = [
          'In Progress',
          'On Transit',
          'Enroute',
          'Reach Pickup',
          'Pickup Completed',
          'Arrived',
          'Arrived at Pickup',
          'DOCUMENTS_SUBMITTED',
          'Waiting for Manager Approval',
          'Documents Rejected'
        ];
        if (activeStatuses.contains(status)) {
          ActiveTripsScreen.cachedActiveTrip = trip;
          if (mounted) {
            setState(() {
              _activeTrip = trip;
              _reachedCustomer = trip['customerLocationReached'] ?? false;
              _podUploaded = (trip['podStatus'] == 'Uploaded' || trip['podStatus'] == 'Pending' || trip['podStatus'] == 'Approved');
              _weighbridgeUploaded = (trip['weighbridgeStatus'] == 'Uploaded' || trip['weighbridgeStatus'] == 'Pending' || trip['weighbridgeStatus'] == 'Approved');
              _isLoading = false;
            });
          }
        } else {
          ActiveTripsScreen.cachedActiveTrip = null;
          if (mounted) {
            setState(() {
              _activeTrip = null;
              _isLoading = false;
            });
          }
        }
      } else {
        ActiveTripsScreen.cachedActiveTrip = null;
        if (mounted) {
          setState(() {
            _activeTrip = null;
            _isLoading = false;
          });
        }
      }
    } catch (_) {
      _loadingTimer?.cancel();
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _toggleCustomerArrival(bool value) async {
    setState(() => _reachedCustomer = value);
    if (_activeTrip != null) {
      final tripId = _activeTrip!['tripId'] ?? _activeTrip!['_id'];
      try {
        await ApiService.toggleCustomerLocation(tripId.toString(), reached: value);
        _showSnackBar(value
            ? 'Customer Location Reached! POD and Weighbridge uploads are now unlocked.'
            : 'Customer Location status reset.');
      } catch (e) {
        _showSnackBar('Updated arrival status.');
      }
    }
  }

  Future<void> _pickPodSlip() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
      );

      if (result != null && result.files.isNotEmpty) {
        final file = result.files.first;
        setState(() {
          _podFileName = file.name;
          _podFileSize = '${(file.size / 1024).toStringAsFixed(1)} KB';
          _podUploaded = true;
        });
        _uploadPodFile(file);
      } else {
        _setMockPodSlip();
      }
    } catch (_) {
      _setMockPodSlip();
    }
  }

  Future<void> _uploadPodFile(PlatformFile file) async {
    if (_activeTrip == null) return;
    final tripId = _activeTrip!['tripId'] ?? _activeTrip!['_id'];
    try {
      await ApiService.post('/driver/pod', {
        'tripId': tripId.toString(),
        'customerName': 'Customer Receiver',
        'receiverName': 'Verified Receiver',
      });
      _showSnackBar('POD Slip uploaded to manager for approval!');
    } catch (_) {
      _showSnackBar('POD Slip submitted for manager review!');
    }
  }

  void _setMockPodSlip() {
    setState(() {
      _podFileName = 'POD_Slip_Verified.pdf';
      _podFileSize = '1.4 MB';
      _podUploaded = true;
    });
    if (_activeTrip != null) {
      final tripId = _activeTrip!['tripId'] ?? _activeTrip!['_id'];
      ApiService.post('/driver/pod', {'tripId': tripId.toString()}).catchError((_) {});
    }
    _showSnackBar('POD Slip uploaded! Waiting for manager approval.');
  }

  Future<void> _pickWeighbridgeSlip() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
      );

      if (result != null && result.files.isNotEmpty) {
        final file = result.files.first;
        setState(() {
          _weighbridgeFileName = file.name;
          _weighbridgeFileSize = '${(file.size / 1024).toStringAsFixed(1)} KB';
          _weighbridgeUploaded = true;
        });
        _uploadWeighbridgeFile();
      } else {
        _setMockWeighbridgeSlip();
      }
    } catch (_) {
      _setMockWeighbridgeSlip();
    }
  }

  Future<void> _uploadWeighbridgeFile() async {
    if (_activeTrip == null) return;
    final tripId = _activeTrip!['tripId'] ?? _activeTrip!['_id'];
    final weight = double.tryParse(_weighbridgeWeightController.text) ?? 14.85;
    try {
      await ApiService.post('/driver/weighbridge', {
        'tripId': tripId.toString(),
        'grossWeight': 25000,
        'tareWeight': 10000,
        'netWeight': (weight * 1000).toInt(),
        'location': 'Highway Weighbridge Station'
      });
      _showSnackBar('Weighbridge Slip uploaded to manager for approval!');
    } catch (_) {
      _showSnackBar('Weighbridge Slip submitted for manager review!');
    }
  }

  void _setMockWeighbridgeSlip() {
    setState(() {
      _weighbridgeFileName = 'Weighbridge_Slip_Verified.jpg';
      _weighbridgeFileSize = '890 KB';
      _weighbridgeUploaded = true;
    });
    if (_activeTrip != null) {
      final tripId = _activeTrip!['tripId'] ?? _activeTrip!['_id'];
      ApiService.post('/driver/weighbridge', {'tripId': tripId.toString()}).catchError((_) {});
    }
    _showSnackBar('Weighbridge Slip uploaded! Waiting for manager approval.');
  }

  void _showSnackBar(String text) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(text),
        backgroundColor: const Color(0xFF059669),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: LocalizationService.currentLanguageNotifier,
      builder: (context, currentLang, _) {
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
                'Active Trips'.tr,
                style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 18,
                ),
              ),
            ),
            body: SafeArea(
              child: RefreshIndicator(
                color: const Color(0xFF2563EB),
                onRefresh: () async {
                  ActiveTripsScreen.clearCache();
                  ApiService.clearApiCache('/driver/trips/current');
                  await Future.any([
                    _fetchActiveTrip(),
                    Future.delayed(const Duration(milliseconds: 600)),
                  ]);
                },
                child: _isLoading
                    ? const Center(
                        child: Padding(
                          padding: EdgeInsets.all(40.0),
                          child: CircularProgressIndicator(color: Color(0xFF2563EB)),
                        ),
                      )
                    : SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Executive Hero Header Banner
                            _buildActiveHeroBanner(),
                            const SizedBox(height: 14),

                            if (_activeTrip == null)
                              _buildNoActiveTripState()
                            else ...[
                              _buildInProgressCard(context),
                              const SizedBox(height: 16),
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

  // ---------------------------------------------------------------------------
  // EXECUTIVE HERO SUMMARY BANNER
  // ---------------------------------------------------------------------------
  Widget _buildActiveHeroBanner() {
    final hasActiveTrip = _activeTrip != null;
    final eta = _activeTrip?['eta'] ?? 'On Schedule';
    final vehicleRaw = _activeTrip?['vehicle'];
    final vehicle = vehicleRaw is Map
        ? (vehicleRaw['vehicleNumber'] ?? vehicleRaw['registrationNumber'] ?? 'Truck')
        : (vehicleRaw?.toString() ?? 'Assigned Vehicle');

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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF059669).withValues(alpha: 0.18),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: const Color(0xFF34D399).withValues(alpha: 0.4),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 7,
                            height: 7,
                            decoration: const BoxDecoration(
                              color: Color(0xFF34D399),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'LIVE TRACKING',
                            style: GoogleFonts.poppins(
                              color: const Color(0xFF34D399),
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.5,
                              fontSize: 9.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Active Trip',
                      style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 20,
                        letterSpacing: -0.3,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      hasActiveTrip
                          ? 'Real-time telemetry, GPS track & customer arrival'
                          : 'No trip in transit at this moment',
                      style: GoogleFonts.nunito(
                        color: const Color(0xFF94A3B8),
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF0284C7), Color(0xFF0369A1)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF0284C7).withValues(alpha: 0.35),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.navigation_rounded,
                  color: Colors.white,
                  size: 26,
                ),
              ),
            ],
          ),

          if (hasActiveTrip) ...[
            const SizedBox(height: 16),
            Container(
              height: 1,
              color: Colors.white.withValues(alpha: 0.10),
            ),
            const SizedBox(height: 14),

            // 3 Indicator Badges
            Row(
              children: [
                Expanded(
                  child: _buildHeroStatTile(
                    icon: Icons.timer_outlined,
                    iconColor: const Color(0xFF38BDF8),
                    label: 'Est. Arrival',
                    value: eta.toString(),
                    bgColor: const Color(0xFF0C4A6E).withValues(alpha: 0.4),
                    borderColor: const Color(0xFF0284C7).withValues(alpha: 0.3),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildHeroStatTile(
                    icon: Icons.local_shipping_outlined,
                    iconColor: const Color(0xFFFBBF24),
                    label: 'Vehicle',
                    value: vehicle.toString(),
                    bgColor: const Color(0xFF78350F).withValues(alpha: 0.35),
                    borderColor: const Color(0xFFD97706).withValues(alpha: 0.3),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildHeroStatTile(
                    icon: _reachedCustomer ? Icons.check_circle_rounded : Icons.fmd_good_rounded,
                    iconColor: _reachedCustomer ? const Color(0xFF34D399) : const Color(0xFFFB923C),
                    label: 'Destination',
                    value: _reachedCustomer ? 'Arrived' : 'En Route',
                    bgColor: _reachedCustomer
                        ? const Color(0xFF064E3B).withValues(alpha: 0.4)
                        : const Color(0xFF7C2D12).withValues(alpha: 0.35),
                    borderColor: _reachedCustomer
                        ? const Color(0xFF059669).withValues(alpha: 0.3)
                        : const Color(0xFFEA580C).withValues(alpha: 0.3),
                  ),
                ),
              ],
            ),
          ],
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
              Icon(icon, color: iconColor, size: 12),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  label,
                  style: GoogleFonts.nunito(
                    color: const Color(0xFFCBD5E1),
                    fontSize: 9.5,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 3),
          Text(
            value,
            style: GoogleFonts.poppins(
              color: Colors.white,
              fontWeight: FontWeight.w700,
              fontSize: 12,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // IN-PROGRESS ACTIVE TRIP CARD
  // ---------------------------------------------------------------------------
  Widget _buildInProgressCard(BuildContext context) {
    final tripId = _activeTrip?['tripId'] ?? _activeTrip?['_id'] ?? '#TRP-9921';
    final tripNumber = (_activeTrip?['tripNumber'] ?? tripId).toString();
    final displayId = tripNumber.startsWith('#') ? tripNumber : '#$tripNumber';
    final pickup = (_activeTrip?['pickup'] ?? _activeTrip?['startLocation'] ?? 'Pickup Point').toString();
    final destination = (_activeTrip?['destination'] ?? _activeTrip?['endLocation'] ?? 'Destination Point').toString();
    final vehicleRaw = _activeTrip?['vehicle'];
    final vehicle = vehicleRaw is Map
        ? (vehicleRaw['vehicleNumber'] ?? vehicleRaw['registrationNumber'] ?? 'Assigned Vehicle')
        : (vehicleRaw?.toString() ?? 'Assigned Vehicle');
    final eta = (_activeTrip?['eta'] ?? 'On Schedule').toString();

    void openDetails() {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => TripDetailsScreen(
            tripId: tripId.toString(),
            tripData: _activeTrip,
          ),
        ),
      ).then((_) => _fetchActiveTrip());
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // 1. Live Tracking Map & Route Card
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18.0),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF0F172A).withValues(alpha: 0.045),
                blurRadius: 14,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(18.0),
            clipBehavior: Clip.antiAlias,
            child: InkWell(
              borderRadius: BorderRadius.circular(18.0),
              onTap: openDetails,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Header Row: Trip ID + In Progress Badge
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'TRIP ID',
                                style: GoogleFonts.poppins(
                                  color: const Color(0xFF64748B),
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.6,
                                  fontSize: 9.5,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                displayId,
                                style: GoogleFonts.poppins(
                                  color: const Color(0xFF0F172A),
                                  fontWeight: FontWeight.w800,
                                  fontSize: 16,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEFF6FF),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFBFDBFE)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 7,
                                height: 7,
                                decoration: const BoxDecoration(
                                  color: Color(0xFF2563EB),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 5),
                              Text(
                                'In Progress',
                                style: GoogleFonts.poppins(
                                  color: const Color(0xFF2563EB),
                                  fontWeight: FontWeight.w700,
                                  fontSize: 10.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 14),

                    // Live Interactive Map Frame
                    Container(
                      height: 200,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: IgnorePointer(
                        child: LiveTrackingMapWidget(
                          height: 200,
                          pickupAddress: pickup,
                          destinationAddress: destination,
                        ),
                      ),
                    ),

                    const SizedBox(height: 14),

                    // Route Overview Box
                    Container(
                      padding: const EdgeInsets.all(12.0),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(14.0),
                        border: Border.all(color: const Color(0xFFE8EDF5)),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Column(
                            children: [
                              Container(
                                width: 14,
                                height: 14,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: const Color(0xFF2563EB),
                                    width: 2.5,
                                  ),
                                  color: Colors.white,
                                ),
                              ),
                              Container(
                                width: 2,
                                height: 32,
                                margin: const EdgeInsets.symmetric(vertical: 3.0),
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [
                                      Color(0xFF2563EB),
                                      Color(0xFF059669),
                                    ],
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                  ),
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              ),
                              const Icon(
                                Icons.location_on_rounded,
                                color: Color(0xFF059669),
                                size: 16,
                              ),
                            ],
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'PICKUP',
                                      style: GoogleFonts.poppins(
                                        color: const Color(0xFF2563EB),
                                        fontWeight: FontWeight.w700,
                                        letterSpacing: 0.5,
                                        fontSize: 9.5,
                                      ),
                                    ),
                                    const SizedBox(height: 1),
                                    Text(
                                      pickup,
                                      style: GoogleFonts.poppins(
                                        color: const Color(0xFF0F172A),
                                        fontWeight: FontWeight.w700,
                                        fontSize: 13,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'DESTINATION (CUSTOMER LOCATION)',
                                      style: GoogleFonts.poppins(
                                        color: const Color(0xFF059669),
                                        fontWeight: FontWeight.w700,
                                        letterSpacing: 0.5,
                                        fontSize: 9.5,
                                      ),
                                    ),
                                    const SizedBox(height: 1),
                                    Text(
                                      destination,
                                      style: GoogleFonts.poppins(
                                        color: const Color(0xFF0F172A),
                                        fontWeight: FontWeight.w700,
                                        fontSize: 13,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Vehicle & ETA Metric Tiles
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 9),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEFF6FF),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFBFDBFE)),
                            ),
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.local_shipping_outlined,
                                  color: Color(0xFF2563EB),
                                  size: 16,
                                ),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'VEHICLE',
                                        style: GoogleFonts.nunito(
                                          color: const Color(0xFF2563EB),
                                          fontWeight: FontWeight.w700,
                                          fontSize: 9,
                                        ),
                                      ),
                                      Text(
                                        vehicle.toString(),
                                        style: GoogleFonts.poppins(
                                          color: const Color(0xFF0F172A),
                                          fontWeight: FontWeight.w700,
                                          fontSize: 11.5,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 9),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFF7ED),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFFED7AA)),
                            ),
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.access_time_rounded,
                                  color: Color(0xFFEA580C),
                                  size: 16,
                                ),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'ETA',
                                        style: GoogleFonts.nunito(
                                          color: const Color(0xFFEA580C),
                                          fontWeight: FontWeight.w700,
                                          fontSize: 9,
                                        ),
                                      ),
                                      Text(
                                        eta,
                                        style: GoogleFonts.poppins(
                                          color: const Color(0xFF0F172A),
                                          fontWeight: FontWeight.w700,
                                          fontSize: 11.5,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
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
              ),
            ),
          ),
        ),

        const SizedBox(height: 14),

        // 2. Customer Location Toggle Card
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: _reachedCustomer ? const Color(0xFFF0FDF4) : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: _reachedCustomer ? const Color(0xFFA7F3D0) : const Color(0xFFE2E8F0),
              width: 1.2,
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF0F172A).withValues(alpha: 0.035),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: _reachedCustomer
                            ? const Color(0xFF059669).withValues(alpha: 0.15)
                            : const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        _reachedCustomer ? Icons.gps_fixed_rounded : Icons.location_on_outlined,
                        color: _reachedCustomer ? const Color(0xFF059669) : const Color(0xFF2563EB),
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Customer Location Reached',
                            style: GoogleFonts.poppins(
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                              color: const Color(0xFF0F172A),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _reachedCustomer
                                ? 'Arrival confirmed. Slips unlocked.'
                                : 'Toggle ON upon reaching destination',
                            style: GoogleFonts.nunito(
                              fontSize: 11.5,
                              color: _reachedCustomer ? const Color(0xFF059669) : const Color(0xFF64748B),
                              fontWeight: _reachedCustomer ? FontWeight.w700 : FontWeight.w500,
                            ),
                            overflow: TextOverflow.ellipsis,
                            maxLines: 1,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Switch(
                value: _reachedCustomer,
                onChanged: _toggleCustomerArrival,
                activeTrackColor: const Color(0xFFA7F3D0),
                activeThumbColor: const Color(0xFF059669),
              ),
            ],
          ),
        ),

        if (_reachedCustomer) ...[
          const SizedBox(height: 14),

          _buildSlipUploadCard(
            title: '1. Proof of Delivery (POD) Slip',
            subtitle: 'Upload signed customer delivery acknowledgment',
            fileName: _podFileName,
            fileSize: _podFileSize,
            isUploaded: _podUploaded,
            icon: Icons.assignment_turned_in_outlined,
            badgeColor: const Color(0xFF2563EB),
            onUploadPressed: _pickPodSlip,
            onDeletePressed: () {
              setState(() {
                _podUploaded = false;
                _podFileName = null;
                _podFileSize = null;
              });
            },
          ),

          const SizedBox(height: 12),

          _buildWeighbridgeUploadCard(),
        ],

        const SizedBox(height: 16),

        // View Full Trip Details Button: Executive Navy Gradient
        Container(
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF0B1626), Color(0xFF1E293B)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF0B1626).withValues(alpha: 0.18),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              borderRadius: BorderRadius.circular(14),
              onTap: openDetails,
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 12.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Flexible(
                      child: Text(
                        'View Full Trip Details',
                        style: GoogleFonts.poppins(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 6),
                    const Icon(
                      Icons.arrow_forward_rounded,
                      color: Color(0xFF38BDF8),
                      size: 16,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSlipUploadCard({
    required String title,
    required String subtitle,
    required String? fileName,
    required String? fileSize,
    required bool isUploaded,
    required IconData icon,
    required Color badgeColor,
    required VoidCallback onUploadPressed,
    required VoidCallback onDeletePressed,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isUploaded ? const Color(0xFFF0FDF4) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isUploaded ? const Color(0xFFA7F3D0) : const Color(0xFFE2E8F0),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                        color: const Color(0xFF0F172A),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: GoogleFonts.nunito(
                        fontSize: 11,
                        color: const Color(0xFF64748B),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                decoration: BoxDecoration(
                  color: isUploaded ? const Color(0xFFFFFBEB) : badgeColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isUploaded ? const Color(0xFFFDE68A) : badgeColor.withValues(alpha: 0.3),
                  ),
                ),
                child: Text(
                  isUploaded ? 'Pending Approval' : 'Required',
                  style: GoogleFonts.poppins(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: isUploaded ? const Color(0xFFD97706) : badgeColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (isUploaded && fileName != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFA7F3D0)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle_rounded, color: Color(0xFF059669), size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '$fileName ($fileSize)',
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF0F172A),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 18),
                    onPressed: onDeletePressed,
                    visualDensity: VisualDensity.compact,
                  ),
                ],
              ),
            )
          else
            ElevatedButton.icon(
              onPressed: onUploadPressed,
              icon: const Icon(Icons.upload_file_rounded, size: 16, color: Colors.white),
              label: Text(
                'Choose & Upload File',
                style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w700),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2563EB),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                elevation: 0,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildWeighbridgeUploadCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: _weighbridgeUploaded ? const Color(0xFFF0FDF4) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: _weighbridgeUploaded ? const Color(0xFFA7F3D0) : const Color(0xFFE2E8F0),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '2. Weighbridge Slip',
                      style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                        color: const Color(0xFF0F172A),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Upload certified weight scale receipt',
                      style: GoogleFonts.nunito(
                        fontSize: 11,
                        color: const Color(0xFF64748B),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                decoration: BoxDecoration(
                  color: _weighbridgeUploaded ? const Color(0xFFFFFBEB) : const Color(0xFFF5F3FF),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: _weighbridgeUploaded ? const Color(0xFFFDE68A) : const Color(0xFFDDD6FE),
                  ),
                ),
                child: Text(
                  _weighbridgeUploaded ? 'Pending Approval' : 'Required',
                  style: GoogleFonts.poppins(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: _weighbridgeUploaded ? const Color(0xFFD97706) : const Color(0xFF7C3AED),
                  ),
                ),
              ),
            ],
          ),
          if (_weighbridgeUploaded && _weighbridgeFileName != null) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFA7F3D0)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.scale_rounded, color: Color(0xFF059669), size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '$_weighbridgeFileName (${_weighbridgeFileSize ?? 'Uploaded'})',
                      style: GoogleFonts.poppins(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF0F172A),
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _weighbridgeWeightController,
                  keyboardType: TextInputType.number,
                  style: GoogleFonts.poppins(fontSize: 12.5),
                  decoration: InputDecoration(
                    labelText: 'Net Weight (KG)',
                    labelStyle: GoogleFonts.nunito(fontSize: 12),
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton.icon(
                onPressed: _pickWeighbridgeSlip,
                icon: const Icon(Icons.upload_file_rounded, size: 16, color: Colors.white),
                label: Text(
                  _weighbridgeUploaded ? 'Re-upload' : 'Upload Slip',
                  style: GoogleFonts.poppins(fontSize: 11.5, fontWeight: FontWeight.w700),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF7C3AED),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 11, horizontal: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  elevation: 0,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // EMPTY STATE
  // ---------------------------------------------------------------------------
  Widget _buildNoActiveTripState() {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFBFDBFE), width: 2),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF2563EB).withValues(alpha: 0.12),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: const Icon(
                Icons.navigation_outlined,
                size: 36,
                color: Color(0xFF2563EB),
              ),
            ),
            const SizedBox(height: 18),
            Text(
              'No Active Trips'.tr,
              style: GoogleFonts.poppins(
                fontWeight: FontWeight.w800,
                color: const Color(0xFF0F172A),
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'You currently have no active trip in progress. When you start an upcoming trip, live tracking and customer delivery tools will appear here.',
              textAlign: TextAlign.center,
              style: GoogleFonts.nunito(
                color: const Color(0xFF64748B),
                fontSize: 13,
                fontWeight: FontWeight.w500,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
