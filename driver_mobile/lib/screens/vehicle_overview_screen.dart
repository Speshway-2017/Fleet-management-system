import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../widgets/vehicle_overview/quick_info_card.dart';
import '../widgets/vehicle_overview/vehicle_action_tile.dart';
import '../widgets/vehicle_overview/vehicle_info_card.dart';
import 'vehicle_details_screen.dart';
import 'vehicle_documents_screen.dart';
import 'vehicle_maintenance_screen.dart';

/// Driver Module - Vehicle Overview Screen
/// 
/// Replicates the Fleet Management design language, color palette, typography,
/// and card layout from the Vehicle Overview reference specifications.
class VehicleOverviewScreen extends StatelessWidget {
  const VehicleOverviewScreen({super.key});

  void _showActionFeedback(BuildContext context, String actionName) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Opening $actionName...'),
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10.0),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    const primaryDark = Color(0xFF101C2C);
    const bgLight = Color(0xFFF7F8FA);
    const textPrimary = Color(0xFF1F2937);

    return Scaffold(
      backgroundColor: bgLight,
      appBar: AppBar(
        backgroundColor: primaryDark,
        elevation: 0,
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'Vehicle Overview',
          style: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8.0),
              ),
              padding: const EdgeInsets.all(4.0),
              child: Image.asset(
                'assets/images/logo.png',
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) {
                  return const Icon(
                    Icons.local_shipping_rounded,
                    color: primaryDark,
                    size: 20,
                  );
                },
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Vehicle Information & Statistics Card
              const VehicleInfoCard(),
              const SizedBox(height: 24.0),

              // 2. Actions & Details Section Header
              Text(
                'Actions & Details',
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: textPrimary,
                ),
              ),
              const SizedBox(height: 14.0),

              // 3. Operational Action Cards List
              VehicleActionTile(
                icon: Icons.info_outline_rounded,
                title: 'Vehicle Details',
                onTap: () {
                  debugPrint('Vehicle Details tile tapped');
                  try {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const VehicleDetailsScreen(),
                      ),
                    );
                  } catch (e, stackTrace) {
                    debugPrint('Error navigating to VehicleDetailsScreen: $e');
                    debugPrint(stackTrace.toString());
                  }
                },
              ),
              VehicleActionTile(
                icon: Icons.bar_chart_rounded,
                title: 'Vehicle Status',
                onTap: () => _showActionFeedback(context, 'Vehicle Status'),
              ),
              VehicleActionTile(
                icon: Icons.notifications_active_outlined,
                title: 'Maintenance Alerts',
                subtitle: '1 CRITICAL',
                subtitleColor: const Color(0xFFEF4444),
                onTap: () {
                  debugPrint('Maintenance Alerts tile tapped');
                  try {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const VehicleMaintenanceScreen(),
                      ),
                    );
                  } catch (e, stackTrace) {
                    debugPrint('Error navigating to VehicleMaintenanceScreen: $e');
                    debugPrint(stackTrace.toString());
                  }
                },
              ),
              VehicleActionTile(
                icon: Icons.folder_open_outlined,
                title: 'Vehicle Documents',
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const VehicleDocumentsScreen(),
                    ),
                  );
                },
              ),

              const SizedBox(height: 24.0),

              // 4. Quick Info Section Header
              Text(
                'Quick Info',
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: textPrimary,
                ),
              ),
              const SizedBox(height: 14.0),

              // 5. Quick Info Dark Navy Card
              const QuickInfoCard(),

              const SizedBox(height: 24.0),
            ],
          ),
        ),
      ),
    );
  }
}
