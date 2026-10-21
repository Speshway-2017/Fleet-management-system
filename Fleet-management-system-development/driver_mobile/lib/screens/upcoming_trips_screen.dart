import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_radius.dart';
import '../constants/app_spacing.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';
import '../widgets/custom_app_bar.dart';
import '../utils/date_formatter.dart';
import '../widgets/custom_card.dart';
import 'active_trips_screen.dart';
import 'trip_details_screen.dart';

class UpcomingTripsScreen extends StatefulWidget {
  const UpcomingTripsScreen({super.key});

  @override
  State<UpcomingTripsScreen> createState() => _UpcomingTripsScreenState();
}

class _UpcomingTripsScreenState extends State<UpcomingTripsScreen> {
  bool _isLoading = false;
  Map<String, dynamic>? _currentTrip;

  @override
  void initState() {
    super.initState();
    _fetchTripData();
    _setupSocketListeners();
  }

  void _setupSocketListeners() {
    SocketService.onEvent('trip:assigned', (_) => _fetchTripData());
    SocketService.onEvent('trip:status-updated', (_) => _fetchTripData());
    SocketService.onEvent('trip:15min-reminder', (data) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(data['message'] ?? 'Trip starts in 15 minutes!'),
            backgroundColor: AppColors.secondary,
            behavior: SnackBarBehavior.floating,
          ),
        );
        _fetchTripData();
      }
    });
  }

  Future<void> _fetchTripData() async {
    if (!mounted) return;
    try {
      final res = await ApiService.getCurrentTrip();
      if (res != null && res['data'] != null) {
        final trip = res['data'];
        final status = trip['status']?.toString() ?? '';
        const upcomingStatuses = [
          'Pending Driver Acceptance',
          'Assigned',
          'Scheduled',
          'Accepted'
        ];
        if (upcomingStatuses.contains(status)) {
          setState(() {
            _currentTrip = trip;
            _isLoading = false;
          });
        } else {
          setState(() {
            _currentTrip = null;
            _isLoading = false;
          });
        }
      } else {
        setState(() {
          _currentTrip = null;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  bool _isStartEnabled(String? departureTimeStr) {
    if (departureTimeStr == null || departureTimeStr.isEmpty) return true;
    try {
      final dep = DateTime.parse(departureTimeStr);
      final now = DateTime.now();
      return now.isAfter(dep.subtract(const Duration(minutes: 15)));
    } catch (_) {
      return true;
    }
  }

  Future<void> _handleRespond(String tripId, String action) async {
    try {
      await ApiService.respondToTripAssignment(tripId, action);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Trip assignment ${action == 'accept' ? 'accepted' : 'rejected'} successfully'),
            backgroundColor: action == 'accept' ? AppColors.success : AppColors.error,
          ),
        );
      }
      _fetchTripData();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _handleStartTrip(String tripId, String? departureTimeStr) async {
    if (!_isStartEnabled(departureTimeStr)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Trip button is locked. You can start the trip 15 minutes before scheduled departure.'),
          backgroundColor: AppColors.primary,
        ),
      );
      return;
    }

    try {
      await ApiService.updateTripStatus(tripId, 'In Progress');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🚀 Trip started! Live GPS tracking activated.'),
            backgroundColor: AppColors.success,
          ),
        );
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const ActiveTripsScreen()),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: AppColors.error,
          ),
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
          'Upcoming Trips',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: AppColors.background,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _fetchTripData,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
            child: _isLoading
                ? const Center(
                    child: Padding(
                      padding: EdgeInsets.all(40.0),
                      child: CircularProgressIndicator(),
                    ),
                  )
                : _currentTrip == null
                    ? _buildEmptyState()
                    : Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _buildTripCard(context, _currentTrip!),
                          const SizedBox(height: 16),
                        ],
                      ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(32),
        child: Column(
          children: [
            const Icon(Icons.event_available_outlined, size: 64, color: AppColors.secondaryText),
            const SizedBox(height: 16),
            Text(
              'No Upcoming Trips',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryText,
                  ),
            ),
            const SizedBox(height: 8),
            const Text(
              'You currently have no scheduled or assigned trips. Any new trip assigned by your fleet manager will appear here.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.secondaryText, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTripCard(BuildContext context, Map<String, dynamic> trip) {
    final tripId = trip['tripId'] ?? trip['_id'] ?? '#TRP-000';
    final tripNumber = trip['tripNumber'] ?? tripId;
    final pickup = trip['pickup'] ?? trip['startLocation'] ?? 'Pickup Point';
    final destination = trip['destination'] ?? trip['endLocation'] ?? 'Destination Point';
    final departureTime = formatIndianDateTime(trip['departureTime'] ?? 'Scheduled');
    final status = trip['status'] ?? 'Scheduled';
    final vehicle = trip['vehicle'] ?? 'Van / Truck';
    final managerName = trip['manager'] != null ? trip['manager']['name'] : 'Fleet Manager';
    final isAssigned = status == 'Assigned';
    final startEnabled = _isStartEnabled(trip['departureTime']);

    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '#$tripNumber',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: AppColors.primaryText,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: isAssigned
                      ? Colors.orange.withValues(alpha: 0.15)
                      : AppColors.secondary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(AppRadius.round),
                ),
                child: Text(
                  isAssigned ? 'Pending Action' : 'Upcoming',
                  style: TextStyle(
                    color: isAssigned ? Colors.deepOrange : AppColors.secondary,
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          Row(
            children: [
              const Icon(Icons.access_time_outlined, color: AppColors.secondaryText, size: 16),
              const SizedBox(width: 8),
              Text(
                departureTime,
                style: const TextStyle(
                  color: AppColors.secondaryText,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          _buildTimelineSegment(pickup, destination),

          const Padding(
            padding: EdgeInsets.symmetric(vertical: 12.0),
            child: Divider(color: AppColors.divider),
          ),

          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'VEHICLE',
                      style: TextStyle(
                        color: AppColors.secondaryText,
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      vehicle.toString(),
                      style: const TextStyle(
                        color: AppColors.primaryText,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'DISPATCHER',
                      style: TextStyle(
                        color: AppColors.secondaryText,
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      managerName.toString(),
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

          if (isAssigned) ...[
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _handleRespond(tripId.toString(), 'reject'),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppColors.error),
                      foregroundColor: AppColors.error,
                      padding: const EdgeInsets.symmetric(vertical: 12.0),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                    ),
                    child: const Text('Reject', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => _handleRespond(tripId.toString(), 'accept'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.success,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 12.0),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                    ),
                    child: const Text('Accept Trip', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ] else ...[
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: startEnabled ? () => _handleStartTrip(tripId.toString(), trip['departureTime']) : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: startEnabled ? AppColors.secondary : AppColors.disabledText.withValues(alpha: 0.4),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 12.0),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          startEnabled ? Icons.play_arrow : Icons.lock_clock,
                          size: 16,
                          color: startEnabled ? Colors.white : Colors.white70,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          startEnabled ? 'Start Trip' : 'Starts 15m Before',
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.bold,
                            color: startEnabled ? Colors.white : Colors.white70,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => TripDetailsScreen(tripId: tripId.toString(), tripData: trip),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 12.0),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                    ),
                    child: const Text(
                      'View Details',
                      style: TextStyle(
                        fontSize: 13.0,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTimelineSegment(String pickup, String destination) {
    return Column(
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              children: [
                const SizedBox(height: 2),
                const Icon(Icons.location_on, color: AppColors.secondary, size: 16),
                Container(width: 1.5, height: 22, color: AppColors.divider),
              ],
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                pickup,
                style: const TextStyle(
                  color: AppColors.primaryText,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Column(
              children: [
                Icon(Icons.flag_outlined, color: AppColors.primaryText, size: 16),
              ],
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                destination,
                style: const TextStyle(
                  color: AppColors.primaryText,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
