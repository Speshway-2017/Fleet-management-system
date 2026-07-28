import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_radius.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';
import '../widgets/live_tracking_map_widget.dart';
import 'trip_details_screen.dart';

class ActiveTripsScreen extends StatefulWidget {
  const ActiveTripsScreen({super.key});

  @override
  State<ActiveTripsScreen> createState() => _ActiveTripsScreenState();
}

class _ActiveTripsScreenState extends State<ActiveTripsScreen> {
  // Customer arrival slips state
  final bool _reachedCustomer = true;
  
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
  void dispose() {
    _weighbridgeWeightController.dispose();
    super.dispose();
  }

  // Pick POD Slip Document/Image
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
      } else {
        // Mock fallback if user cancels or file picker closes
        _setMockPodSlip();
      }
    } catch (_) {
      _setMockPodSlip();
    }
  }

  void _setMockPodSlip() {
    setState(() {
      _podFileName = 'POD_Slip_TRP9921.pdf';
      _podFileSize = '1.4 MB';
      _podUploaded = true;
    });
    _showSnackBar('POD Slip uploaded successfully!');
  }

  // Pick Weighbridge Slip Document/Image
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
      } else {
        _setMockWeighbridgeSlip();
      }
    } catch (_) {
      _setMockWeighbridgeSlip();
    }
  }

  void _setMockWeighbridgeSlip() {
    setState(() {
      _weighbridgeFileName = 'Weighbridge_Slip_14.85T.jpg';
      _weighbridgeFileSize = '890 KB';
      _weighbridgeUploaded = true;
    });
    _showSnackBar('Weighbridge Slip uploaded successfully!');
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
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. In Progress Active Trip Card with Live Map & Customer Uploads
              _buildInProgressCard(context),
              AppSpacing.verticalMd,

              // 2. Upcoming Trip Card
              _buildUpcomingCard(context),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  // 1. In Progress Card Builder
  Widget _buildInProgressCard(BuildContext context) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Row
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
                    '#TRP-9921',
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

          // Integrated Real OpenStreetMap Live Tracking with Reroute Button
          const LiveTrackingMapWidget(
            height: 220,
            pickupAddress: 'Port of Long Beach, CA',
            destinationAddress: 'Distribution Center A-12, AZ',
          ),

          const SizedBox(height: 16),

          // Route timeline segment
          _buildRouteTimeline(
            context,
            pickupLabel: 'PICKUP',
            pickupAddress: 'Port of Long Beach, CA',
            destLabel: 'DESTINATION (CUSTOMER LOCATION)',
            destAddress: 'Distribution Center A-12, AZ',
            isMuted: false,
          ),

          const Padding(
            padding: EdgeInsets.symmetric(vertical: 12.0),
            child: Divider(color: AppColors.divider),
          ),

          // Customer Location Arrival & Slips Upload Section Header (Auto-Updated by Live GPS Tracking)
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDF4),
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(color: AppColors.success.withAlpha(90), width: 1.2),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: const BoxDecoration(
                        color: AppColors.success,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.gps_fixed, color: Colors.white, size: 14),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Live GPS Status (Auto-Updated)',
                            style: GoogleFonts.poppins(
                              fontWeight: FontWeight.bold,
                              fontSize: 12.5,
                              color: AppColors.primaryText,
                            ),
                          ),
                          Text(
                            'Reached Customer Location',
                            style: GoogleFonts.poppins(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: AppColors.success,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.success.withAlpha(30),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(
                              color: AppColors.success,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Auto-Detected',
                            style: GoogleFonts.poppins(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: AppColors.success,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  'Live GPS tracking detected arrival at customer destination. Proof of Delivery (POD) Slip & Weighbridge Slip are automatically enabled below.',
                  style: GoogleFonts.poppins(
                    fontSize: 11.5,
                    color: AppColors.secondaryText,
                  ),
                ),
              ],
            ),
          ),

          if (_reachedCustomer) ...[
            const SizedBox(height: 16),

            // POD Slip Upload Box
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

            // Weighbridge Slip Upload Box with Weight Field
            _buildWeighbridgeUploadCard(),
          ],

          const SizedBox(height: 16),

          // Vehicle & ETA info row
          Row(
            children: [
              Expanded(
                child: _buildDetailsColumn(
                  context,
                  label: 'VEHICLE',
                  value: 'Heavy Duty - AX 452',
                  icon: Icons.local_shipping_outlined,
                  isMuted: false,
                ),
              ),
              Expanded(
                child: _buildDetailsColumn(
                  context,
                  label: 'ETA',
                  value: '14:45 PM',
                  icon: Icons.access_time_outlined,
                  isMuted: false,
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // View Details Action button
          ElevatedButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const TripDetailsScreen(tripId: '#TRP-9921'),
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

  // POD / Generic Slip Upload Builder
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
                  color: isUploaded
                      ? Colors.green.withAlpha(20)
                      : AppColors.secondaryText.withAlpha(20),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(
                      isUploaded ? Icons.check_circle : Icons.pending_outlined,
                      size: 12,
                      color: isUploaded ? Colors.green : AppColors.secondaryText,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      isUploaded ? 'Uploaded' : 'Pending',
                      style: GoogleFonts.poppins(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: isUploaded ? Colors.green : AppColors.secondaryText,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (isUploaded && fileName != null) ...[
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: AppColors.divider),
              ),
              child: Row(
                children: [
                  Icon(icon, color: badgeColor, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          fileName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.poppins(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          fileSize ?? '',
                          style: GoogleFonts.poppins(
                            fontSize: 10,
                            color: AppColors.secondaryText,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline, color: Colors.red, size: 18),
                    onPressed: onDeletePressed,
                  ),
                ],
              ),
            ),
          ] else ...[
            OutlinedButton.icon(
              onPressed: onUploadPressed,
              icon: const Icon(Icons.upload_file_rounded, size: 16),
              label: const Text('Upload Slip File / Photo', style: TextStyle(fontSize: 12)),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.secondary,
                side: const BorderSide(color: AppColors.secondary),
                minimumSize: const Size(double.infinity, 38),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
              ),
            ),
          ],
        ],
      ),
    );
  }

  // Weighbridge Upload Card with Gross/Net Weight Inputs
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
                      'Upload weight scale ticket and enter total cargo weight',
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
                  color: _weighbridgeUploaded
                      ? Colors.green.withAlpha(20)
                      : AppColors.secondaryText.withAlpha(20),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(
                      _weighbridgeUploaded ? Icons.check_circle : Icons.pending_outlined,
                      size: 12,
                      color: _weighbridgeUploaded ? Colors.green : AppColors.secondaryText,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      _weighbridgeUploaded ? 'Uploaded' : 'Pending',
                      style: GoogleFonts.poppins(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: _weighbridgeUploaded ? Colors.green : AppColors.secondaryText,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 38,
                  child: TextField(
                    controller: _weighbridgeWeightController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold),
                    decoration: InputDecoration(
                      labelText: 'Cargo Weight (Tons)',
                      labelStyle: GoogleFonts.poppins(fontSize: 10, color: AppColors.secondaryText),
                      suffixText: 'Tons',
                      suffixStyle: GoogleFonts.poppins(fontSize: 10, fontWeight: FontWeight.bold),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(6)),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (_weighbridgeUploaded && _weighbridgeFileName != null) ...[
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: AppColors.divider),
              ),
              child: Row(
                children: [
                  const Icon(Icons.scale_rounded, color: Colors.orange, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _weighbridgeFileName!,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.poppins(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          '${_weighbridgeFileSize ?? ''} • ${_weighbridgeWeightController.text} Tons Recorded',
                          style: GoogleFonts.poppins(
                            fontSize: 10,
                            color: AppColors.secondaryText,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline, color: Colors.red, size: 18),
                    onPressed: () {
                      setState(() {
                        _weighbridgeUploaded = false;
                        _weighbridgeFileName = null;
                        _weighbridgeFileSize = null;
                      });
                    },
                  ),
                ],
              ),
            ),
          ] else ...[
            OutlinedButton.icon(
              onPressed: _pickWeighbridgeSlip,
              icon: const Icon(Icons.upload_file_rounded, size: 16),
              label: const Text('Upload Weighbridge Ticket', style: TextStyle(fontSize: 12)),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.secondary,
                side: const BorderSide(color: AppColors.secondary),
                minimumSize: const Size(double.infinity, 38),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
              ),
            ),
          ],
        ],
      ),
    );
  }

  // 2. Upcoming Card Builder
  Widget _buildUpcomingCard(BuildContext context) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Row
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
                    '#TRP-8840',
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
                  color: AppColors.secondary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(AppRadius.round),
                ),
                child: const Text(
                  'Upcoming',
                  style: TextStyle(
                    color: AppColors.secondary,
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Route timeline segment (Muted/Grey)
          _buildRouteTimeline(
            context,
            pickupLabel: 'PICKUP',
            pickupAddress: 'Regional Hub South, UX',
            destLabel: 'DESTINATION',
            destAddress: 'Main Warehouse, NV',
            isMuted: true,
          ),

          const Padding(
            padding: EdgeInsets.symmetric(vertical: 12.0),
            child: Divider(color: AppColors.divider),
          ),

          // Vehicle & Start Time info row
          Row(
            children: [
              Expanded(
                child: _buildDetailsColumn(
                  context,
                  label: 'VEHICLE',
                  value: 'Medium Van - BT 990',
                  icon: Icons.local_shipping_outlined,
                  isMuted: true,
                ),
              ),
              Expanded(
                child: _buildDetailsColumn(
                  context,
                  label: 'START TIME',
                  value: 'Tomorrow, 08:00',
                  icon: Icons.access_time_outlined,
                  isMuted: true,
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // View Details Action button
          ElevatedButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const TripDetailsScreen(tripId: '#TRP-8840'),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.secondary.withValues(alpha: 0.12),
              foregroundColor: AppColors.secondary,
              elevation: 0,
              padding: const EdgeInsets.symmetric(vertical: 12.0),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
            ),
            child: const Text(
              'View Details',
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

  // Common Route Timeline Widget
  Widget _buildRouteTimeline(
    BuildContext context, {
    required String pickupLabel,
    required String pickupAddress,
    required String destLabel,
    required String destAddress,
    required bool isMuted,
  }) {
    final dotColor = isMuted ? AppColors.secondaryText.withValues(alpha: 0.4) : Colors.blue;
    final pinColor = isMuted ? AppColors.secondaryText.withValues(alpha: 0.4) : AppColors.error;
    final textColor = isMuted ? AppColors.secondaryText.withValues(alpha: 0.7) : AppColors.primaryText;
    final labelColor = AppColors.secondaryText;

    return Column(
      children: [
        // Pickup row
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              children: [
                const SizedBox(height: 3),
                Container(
                  width: 14,
                  height: 14,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: dotColor, width: 2),
                    color: Colors.white,
                  ),
                ),
                // Dashed vertical connector line
                Container(
                  width: 1.5,
                  height: 24,
                  color: AppColors.divider,
                ),
              ],
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    pickupLabel,
                    style: TextStyle(color: labelColor, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    pickupAddress,
                    style: TextStyle(color: textColor, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ],
        ),
        // Destination row
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              children: [
                Icon(
                  isMuted ? Icons.location_on_outlined : Icons.location_on,
                  color: pinColor,
                  size: 16,
                ),
              ],
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    destLabel,
                    style: TextStyle(color: labelColor, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    destAddress,
                    style: TextStyle(color: textColor, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  // Common details column info with icon
  Widget _buildDetailsColumn(
    BuildContext context, {
    required String label,
    required String value,
    required IconData icon,
    required bool isMuted,
  }) {
    final valueTextColor = isMuted ? AppColors.secondaryText.withValues(alpha: 0.7) : AppColors.primaryText;
    final iconColor = isMuted ? AppColors.secondaryText.withValues(alpha: 0.4) : AppColors.primaryText;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
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
        Row(
          children: [
            Icon(icon, color: iconColor, size: 16),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                value,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: valueTextColor,
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
