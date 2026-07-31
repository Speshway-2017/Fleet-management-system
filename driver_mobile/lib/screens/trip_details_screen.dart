import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_radius.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';
import '../services/api_service.dart';
import 'upcoming_trips_screen.dart';

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

  @override
  void initState() {
    super.initState();
    if (widget.tripData != null) {
      _trip = widget.tripData;
    } else {
      _fetchTripDetails();
    }
  }

  Future<void> _fetchTripDetails() async {
    setState(() {
      _isLoading = true;
    });
    try {
      final res = await ApiService.getCurrentTrip();
      if (res != null && res['data'] != null) {
        setState(() {
          _trip = res['data'];
          _isLoading = false;
        });
      } else {
        setState(() {
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
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
    } catch (e) {
      debugPrint('Respond API error: $e');
    }

    if (!mounted) return;

    setState(() {
      _isSubmitting = false;
    });

    if (action == 'accept') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✅ Trip assignment accepted! Moved to Upcoming Trips.'),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
          duration: Duration(seconds: 3),
        ),
      );
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => const UpcomingTripsScreen(),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Trip assignment rejected.'),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final activeId = _trip?['tripNumber'] ?? widget.tripId;
    final rawStatus = (_trip?['status'] ?? (widget.tripId.contains('846708') ? 'Assigned' : 'Scheduled')).toString();
    
    final isCompleted = rawStatus.toLowerCase() == 'completed' || widget.tripId == '#TX-9021' || widget.tripId == '#TRP-9921';
    final isInProgress = rawStatus.toLowerCase() == 'in progress' || rawStatus.toLowerCase() == 'on transit' || rawStatus.toLowerCase() == 'live';
    final isAccepted = rawStatus.toLowerCase() == 'accepted';
    
    // Trip needs driver response (Accept/Reject) if not yet accepted, in progress, or completed
    final isAssigned = !isCompleted && !isInProgress && !isAccepted;
    
    final statusText = isAssigned
        ? 'ASSIGNED'
        : (isAccepted ? 'ACCEPTED' : (isCompleted ? 'COMPLETED' : 'IN PROGRESS'));
    final statusColor = isAssigned
        ? Colors.orange
        : (isAccepted ? AppColors.secondary : (isCompleted ? AppColors.success : Colors.blue));

    // Dynamic or fallback locations
    final origin = _trip?['pickup'] ?? _trip?['startLocation'] ?? (isCompleted ? 'Dallas, IL' : 'Hyderabad');
    final destination = _trip?['destination'] ?? _trip?['endLocation'] ?? (isCompleted ? 'Detroit, MI' : 'Chennai');
    final distance = _trip?['distance'] ?? (isCompleted ? '420 mi' : '285 mi');
    final estTime = _trip?['eta'] ?? (isCompleted ? '8h 30m' : '5h 30m');
    final stopsCount = isCompleted ? '4' : '3';

    // Driver/Vehicle details
    final driverName = _trip?['driverName'] ?? (isCompleted ? 'Alex Johnson' : 'Sarah Jenkins');
    final truckId = _trip?['vehicle'] ?? (isCompleted ? 'VOLVO-902' : 'AP 39 EQ 2312');
    final weight = _trip?['cargoWeight'] != null ? '${_trip!['cargoWeight']} Tons' : (isCompleted ? '12.4 Tons' : '10.8 Tons');

    // Manifest nodes
    final manifestNodes = isCompleted
        ? [
            _ManifestNode('Regional Logistics Hub', 'Chicago, IL • 06:00 AM', true),
            _ManifestNode('Warehouse B', 'Gary, IN • 08:30 AM', true),
            _ManifestNode('Distribution Center', 'Ann Arbor, MI • 12:00 PM', true),
            _ManifestNode('Detroit Terminal', 'Detroit, MI • 02:30 PM', true),
          ]
        : [
            _ManifestNode('Logistics Hub', '$origin • Departure', false),
            _ManifestNode('Midway Checkpoint', 'Enroute Terminal • Scheduled', false),
            _ManifestNode('Destination Terminal', '$destination • Arrival', false),
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

                    // 3-Metric Boxes Row
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
                        const SizedBox(width: 8),
                        Expanded(
                          child: _buildMetricCard(
                            icon: Icons.pin_drop_outlined,
                            label: 'Stops',
                            value: stopsCount,
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
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    'WEIGHT',
                                    style: GoogleFonts.poppins(
                                      fontSize: 9,
                                      color: AppColors.secondary,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    weight,
                                    style: GoogleFonts.poppins(
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                ],
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
                              widthFactor: isCompleted ? 1.0 : 0.65,
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

                    // Accept and Reject action buttons for Assigned trips
                    if (isAssigned) ...[
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
                    ] else if (isAccepted) ...[
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(builder: (context) => const UpcomingTripsScreen()),
                          );
                        },
                        icon: const Icon(Icons.event_note, color: Colors.white),
                        label: Text(
                          'View in Upcoming Trips',
                          style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.secondary,
                          minimumSize: const Size(double.infinity, 48),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
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
