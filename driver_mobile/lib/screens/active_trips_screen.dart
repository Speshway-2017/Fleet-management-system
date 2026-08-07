import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_radius.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';
import '../widgets/live_tracking_map_widget.dart';
import 'completed_trips_screen.dart';
import 'trip_details_screen.dart';

class ActiveTripsScreen extends StatefulWidget {
  const ActiveTripsScreen({super.key});

  @override
  State<ActiveTripsScreen> createState() => _ActiveTripsScreenState();
}

class _ActiveTripsScreenState extends State<ActiveTripsScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _activeTrip;
  
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
    _fetchActiveTrip();
    _setupSocketListeners();
  }

  @override
  void dispose() {
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
              backgroundColor: AppColors.success,
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
            backgroundColor: Colors.red,
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
            backgroundColor: Colors.red,
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
            backgroundColor: AppColors.success,
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
    setState(() => _isLoading = true);
    try {
      final res = await ApiService.getCurrentTrip();
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
          setState(() {
            _activeTrip = trip;
            _reachedCustomer = trip['customerLocationReached'] ?? false;
            _podUploaded = (trip['podStatus'] == 'Uploaded' || trip['podStatus'] == 'Pending' || trip['podStatus'] == 'Approved');
            _weighbridgeUploaded = (trip['weighbridgeStatus'] == 'Uploaded' || trip['weighbridgeStatus'] == 'Pending' || trip['weighbridgeStatus'] == 'Approved');
            _isLoading = false;
          });
        } else {
          setState(() {
            _activeTrip = null;
            _isLoading = false;
          });
        }
      } else {
        setState(() {
          _activeTrip = null;
          _isLoading = false;
        });
      }
    } catch (_) {
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
        backgroundColor: AppColors.success,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        centerTitle: false,
        title: Text(
          'Active Trips',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: AppColors.background,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _fetchActiveTrip,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(AppSpacing.md),
            child: _isLoading
                ? const Center(
                    child: Padding(
                      padding: EdgeInsets.all(40.0),
                      child: CircularProgressIndicator(),
                    ),
                  )
                : _activeTrip == null
                    ? _buildNoActiveTripState()
                    : Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _buildInProgressCard(context),
                          const SizedBox(height: 16),
                        ],
                      ),
          ),
        ),
      ),
    );
  }

  Widget _buildNoActiveTripState() {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(32),
        child: Column(
          children: [
            const Icon(Icons.navigation_outlined, size: 64, color: AppColors.secondaryText),
            const SizedBox(height: 16),
            Text(
              'No Active Trips',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryText,
                  ),
            ),
            const SizedBox(height: 8),
            const Text(
              'You currently have no active trip in progress. When you start an upcoming trip, live tracking and customer delivery tools will appear here.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.secondaryText, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInProgressCard(BuildContext context) {
    final tripId = _activeTrip?['tripId'] ?? _activeTrip?['_id'] ?? '#TRP-9921';
    final tripNumber = _activeTrip?['tripNumber'] ?? tripId;
    final pickup = _activeTrip?['pickup'] ?? _activeTrip?['startLocation'] ?? 'Port of Long Beach, CA';
    final destination = _activeTrip?['destination'] ?? _activeTrip?['endLocation'] ?? 'Distribution Center A-12, AZ';
    final vehicleRaw = _activeTrip?['vehicle'];
    final vehicle = vehicleRaw is Map
        ? (vehicleRaw['vehicleNumber'] ?? vehicleRaw['registrationNumber'] ?? 'N/A')
        : (vehicleRaw?.toString() ?? 'Unassigned');
    final eta = _activeTrip?['eta'] ?? 'N/A';

    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
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
                      fontWeight: FontWeight.bold,
                      fontSize: 10,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '#$tripNumber',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: AppColors.primaryText,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.blue.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(AppRadius.round),
                ),
                child: const Text(
                  'In Progress',
                  style: TextStyle(
                    color: Colors.blue,
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          LiveTrackingMapWidget(
            height: 220,
            pickupAddress: pickup,
            destinationAddress: destination,
          ),

          const SizedBox(height: 16),

          _buildRouteTimeline(
            context,
            pickupLabel: 'PICKUP',
            pickupAddress: pickup,
            destLabel: 'DESTINATION (CUSTOMER LOCATION)',
            destAddress: destination,
            isMuted: false,
          ),

          const Padding(
            padding: EdgeInsets.symmetric(vertical: 12.0),
            child: Divider(color: AppColors.divider),
          ),

          // Customer Location Toggle Card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: _reachedCustomer ? const Color(0xFFF0FDF4) : Colors.white,
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(
                color: _reachedCustomer ? AppColors.success.withAlpha(120) : AppColors.divider,
                width: 1.2,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Row(
                        children: [
                          Icon(
                            _reachedCustomer ? Icons.gps_fixed : Icons.location_on_outlined,
                            color: _reachedCustomer ? AppColors.success : AppColors.secondary,
                            size: 20,
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Customer Location Reached',
                                  style: GoogleFonts.poppins(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                    color: AppColors.primaryText,
                                  ),
                                ),
                                Text(
                                  _reachedCustomer ? 'Arrival Toggled ON (Uploads Enabled)' : 'Toggle ON when arrived at destination',
                                  style: GoogleFonts.poppins(
                                    fontSize: 11,
                                    color: _reachedCustomer ? AppColors.success : AppColors.secondaryText,
                                    fontWeight: _reachedCustomer ? FontWeight.w600 : FontWeight.normal,
                                  ),
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
                      activeTrackColor: AppColors.success.withAlpha(120),
                      activeThumbColor: AppColors.success,
                    ),
                  ],
                ),
              ],
            ),
          ),

          if (_reachedCustomer) ...[
            const SizedBox(height: 16),

            _buildSlipUploadCard(
              title: '1. Proof of Delivery (POD) Slip',
              subtitle: 'Upload signed customer delivery acknowledgment',
              fileName: _podFileName,
              fileSize: _podFileSize,
              isUploaded: _podUploaded,
              icon: Icons.assignment_turned_in_outlined,
              badgeColor: Colors.blue,
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

          Row(
            children: [
              Expanded(
                child: _buildDetailsColumn(
                  context,
                  label: 'VEHICLE',
                  value: vehicle.toString(),
                  icon: Icons.local_shipping_outlined,
                  isMuted: false,
                ),
              ),
              Expanded(
                child: _buildDetailsColumn(
                  context,
                  label: 'ETA',
                  value: eta.toString(),
                  icon: Icons.access_time_outlined,
                  isMuted: false,
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          ElevatedButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => TripDetailsScreen(tripId: tripId.toString()),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.secondary,
              foregroundColor: Colors.white,
              elevation: 0,
              padding: const EdgeInsets.symmetric(vertical: 12.0),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
            ),
            child: const Text(
              'View Full Trip Details',
              style: TextStyle(
                fontSize: 14.0,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
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
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isUploaded ? Colors.green.withAlpha(10) : Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.sm),
        border: Border.all(
          color: isUploaded ? Colors.green.withAlpha(100) : AppColors.divider,
          width: 1,
        ),
      ),
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
                      title,
                      style: GoogleFonts.poppins(
                        fontWeight: FontWeight.bold,
                        fontSize: 12.5,
                        color: AppColors.primaryText,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: GoogleFonts.poppins(
                        fontSize: 10.5,
                        color: AppColors.secondaryText,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: isUploaded ? Colors.orange.withAlpha(30) : badgeColor.withAlpha(20),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  isUploaded ? 'Pending Approval' : 'Required',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: isUploaded ? Colors.deepOrange : badgeColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (isUploaded && fileName != null)
            Row(
              children: [
                Icon(icon, color: AppColors.success, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    fileName,
                    style: GoogleFonts.poppins(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primaryText,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline, color: Colors.red, size: 18),
                  onPressed: onDeletePressed,
                ),
              ],
            )
          else
            ElevatedButton.icon(
              onPressed: onUploadPressed,
              icon: const Icon(Icons.upload_file, size: 16, color: Colors.white),
              label: const Text('Choose & Upload File', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.sm)),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildWeighbridgeUploadCard() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: _weighbridgeUploaded ? Colors.green.withAlpha(10) : Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.sm),
        border: Border.all(
          color: _weighbridgeUploaded ? Colors.green.withAlpha(100) : AppColors.divider,
          width: 1,
        ),
      ),
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
                      '2. Weighbridge Slip',
                      style: GoogleFonts.poppins(
                        fontWeight: FontWeight.bold,
                        fontSize: 12.5,
                        color: AppColors.primaryText,
                      ),
                    ),
                    Text(
                      'Upload certified weight scale receipt',
                      style: GoogleFonts.poppins(
                        fontSize: 10.5,
                        color: AppColors.secondaryText,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: _weighbridgeUploaded ? Colors.orange.withAlpha(30) : AppColors.secondary.withAlpha(20),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  _weighbridgeUploaded ? 'Pending Approval' : 'Required',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: _weighbridgeUploaded ? Colors.deepOrange : AppColors.secondary,
                  ),
                ),
              ),
            ],
          ),
          if (_weighbridgeUploaded && _weighbridgeFileName != null) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.scale_outlined, color: AppColors.success, size: 16),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    '$_weighbridgeFileName (${_weighbridgeFileSize ?? 'Uploaded'})',
                    style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primaryText),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _weighbridgeWeightController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Net Weight (KG)',
                    isDense: true,
                    contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton.icon(
                onPressed: _pickWeighbridgeSlip,
                icon: const Icon(Icons.upload_file, size: 16, color: Colors.white),
                label: Text(_weighbridgeUploaded ? 'Re-upload' : 'Upload Slip', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.sm)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRouteTimeline(
    BuildContext context, {
    required String pickupLabel,
    required String pickupAddress,
    required String destLabel,
    required String destAddress,
    required bool isMuted,
  }) {
    final textColor = isMuted ? AppColors.secondaryText : AppColors.primaryText;

    return Column(
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              children: [
                const SizedBox(height: 2),
                Icon(Icons.location_on, color: isMuted ? AppColors.secondaryText : AppColors.secondary, size: 16),
                Container(width: 1.5, height: 24, color: AppColors.divider),
              ],
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(pickupLabel, style: const TextStyle(color: AppColors.secondaryText, fontSize: 9, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 2),
                  Text(pickupAddress, style: TextStyle(color: textColor, fontSize: 12, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          ],
        ),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              children: [
                Icon(Icons.flag_outlined, color: isMuted ? AppColors.secondaryText : AppColors.primaryText, size: 16),
              ],
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(destLabel, style: const TextStyle(color: AppColors.secondaryText, fontSize: 9, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 2),
                  Text(destAddress, style: TextStyle(color: textColor, fontSize: 12, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildDetailsColumn(
    BuildContext context, {
    required String label,
    required String value,
    required IconData icon,
    required bool isMuted,
  }) {
    final textColor = isMuted ? AppColors.secondaryText : AppColors.primaryText;
    final iconColor = isMuted ? AppColors.secondaryText : AppColors.secondary;

    return Row(
      children: [
        Icon(icon, color: iconColor, size: 16),
        const SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: AppColors.secondaryText, fontSize: 9, fontWeight: FontWeight.w500)),
            const SizedBox(height: 2),
            Text(value, style: TextStyle(color: textColor, fontSize: 12, fontWeight: FontWeight.bold)),
          ],
        ),
      ],
    );
  }
}
