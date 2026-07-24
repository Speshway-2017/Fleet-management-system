import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_radius.dart';
import '../constants/app_spacing.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';
import 'invoice_screen.dart';
import 'toll_fee_receipt_screen.dart';
import 'e_way_bill_screen.dart';
import 'route_sheet_screen.dart';

class CompletedTripDetailsScreen extends StatelessWidget {
  final String tripId;

  const CompletedTripDetailsScreen({
    super.key,
    required this.tripId,
  });

  @override
  Widget build(BuildContext context) {
    // Make variables dynamic based on trip ID for UI richness
    final isTrp48291 = tripId == '#TRP-48291';
    final isTrp48155 = tripId == '#TRP-48155';
    
    final dateStr = isTrp48291 ? 'Oct 24, 2023' : (isTrp48155 ? 'Oct 23, 2023' : 'Oct 21, 2023');
    final timeStr = isTrp48291 ? '16:45 PM' : (isTrp48155 ? '12:10 PM' : '23:55 PM');
    
    final pickupLoc = isTrp48291 
        ? 'Central Logistics Hub, Berlin' 
        : (isTrp48155 ? 'Eastside Warehouse, Munich' : 'Airport Cargo Terminal, Frankfurt');
        
    final destLoc = isTrp48291 
        ? 'Maritime Terminal B-12, Hamburg' 
        : (isTrp48155 ? 'Regional Distribution Center, Stuttgart' : 'City Logistics Center, Cologne');

    final distanceStr = isTrp48291 ? '284 km' : (isTrp48155 ? '232 km' : '190 km');
    final durationStr = isTrp48291 ? '3h 45m' : (isTrp48155 ? '2h 55m' : '2h 10m');
    final fuelTotal = isTrp48291 ? '52L' : (isTrp48155 ? '44L' : '36L');
    final stopsCount = isTrp48291 ? '2' : (isTrp48155 ? '1' : '0');
    final avgSpeed = isTrp48291 ? '76 km/h' : (isTrp48155 ? '79 km/h' : '88 km/h');

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
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Summary Header Card
              _buildSummaryHeaderCard(context, dateStr, timeStr),
              AppSpacing.verticalSm,

              // 2. Route Details Card
              _buildRouteDetailsCard(context, pickupLoc, destLoc, distanceStr, durationStr),
              AppSpacing.verticalSm,

              // 3. Vehicle & Crew Card
              _buildVehicleCrewCard(context),
              AppSpacing.verticalSm,

              // 4. Performance Grid
              _buildSectionTitle(context, 'Performance'),
              _buildPerformanceGrid(context, distanceStr, fuelTotal, avgSpeed, stopsCount),
              AppSpacing.verticalSm,

              // 5. Trip Timeline Card
              _buildSectionTitle(context, 'Trip Timeline'),
              _buildTimelineCard(context),
              AppSpacing.verticalSm,

              // 6. Documents Section
              _buildSectionTitle(context, 'Documents'),
              _buildDocumentsCard(context),
              AppSpacing.verticalSm,

              // 7. Trip Notes Card
              _buildTripNotesCard(context),
              AppSpacing.verticalSm,

              // 8. Delivery Confirmation Card
              _buildDeliveryConfirmationCard(context),
              AppSpacing.verticalLg,

              // 9. Bottom Buttons
              _buildFooterActions(context),
              const SizedBox(height: 24),
            ],
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
  Widget _buildSummaryHeaderCard(BuildContext context, String date, String time) {
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
                    tripId,
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
                  // Double circle icon
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
          // Distance / Duration Row aligned to edges
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
          // Route Completed tag
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
  Widget _buildVehicleCrewCard(BuildContext context) {
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
                    tripId == '#TRP-47902' ? 'AX 312 • Medium Duty' : 'AX 452 • Heavy Duty',
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
              _buildInfoItem('Driver', 'Marcus Sterling'),
              _buildInfoItem('Manager', 'Sarah Jenkins', alignRight: true),
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
  Widget _buildTimelineCard(BuildContext context) {
    final timelineEvents = [
      {'title': 'Trip Assigned', 'time': '07:00 AM', 'done': true},
      {'title': 'Journey Started', 'time': '08:00 AM', 'done': true},
      {'title': 'Pickup Reached', 'time': '09:30 AM', 'done': true},
      {'title': 'En Route', 'time': '10:00 AM', 'done': true},
      {'title': 'Destination Reached', 'time': '16:30 PM', 'done': true},
      {'title': 'Trip Completed', 'time': '16:45 PM', 'done': true, 'isLast': true},
    ];

    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: timelineEvents.map((event) {
          final isLast = event['isLast'] == true;
          return IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Icon column
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
                // Content
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
  Widget _buildDocumentsCard(BuildContext context) {
    final docs = [
      {'name': 'E-Way Bill', 'action': 'VIEW', 'isView': true},
      {'name': 'Invoice', 'action': 'VIEW', 'isView': true},
      {'name': 'Route Sheet', 'action': 'VIEW', 'isView': true},
      {'name': 'Toll Fee Receipt', 'action': 'VIEW', 'isView': true},
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
                  onTap: () {
                    Widget targetScreen;
                    switch (doc['name']) {
                      case 'E-Way Bill':
                        targetScreen = const EWayBillScreen();
                        break;
                      case 'Invoice':
                        targetScreen = const InvoiceScreen();
                        break;
                      case 'Route Sheet':
                        targetScreen = const RouteSheetScreen();
                        break;
                      case 'Toll Fee Receipt':
                        targetScreen = const TollFeeReceiptScreen();
                        break;
                      default:
                        return;
                    }
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => targetScreen),
                    );
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
  Widget _buildTripNotesCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: const Color(0xFFF0F4FA),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.divider),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'TRIP NOTES',
            style: TextStyle(
              color: AppColors.secondaryText,
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          SizedBox(height: 8),
          Text(
            '"Delivery completed successfully. Goods handed over without any damage."',
            style: TextStyle(
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
  Widget _buildDeliveryConfirmationCard(BuildContext context) {
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
              _buildInfoItem('Receiver', 'John Doe'),
              _buildInfoItem('Status', 'Signed & Verified', alignRight: true),
            ],
          ),
          const SizedBox(height: 14),
          // Proof of Delivery Available tag
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

  // Info Column builder helper (edge-aligned option)
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
}
