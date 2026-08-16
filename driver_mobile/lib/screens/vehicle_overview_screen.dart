import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import '../widgets/vehicle_overview/quick_info_card.dart';
import '../widgets/vehicle_overview/vehicle_action_tile.dart';
import '../widgets/vehicle_overview/vehicle_info_card.dart';
import 'vehicle_details_screen.dart';
import 'vehicle_documents_screen.dart';
import 'vehicle_maintenance_screen.dart';
import 'vehicle_status_screen.dart';

/// Driver Module - Vehicle Overview Screen
/// 
/// Connects dynamically to MongoDB backend `/api/driver/vehicle`.
/// Displays "No vehicle assigned" if driver has no assigned vehicle.
class VehicleOverviewScreen extends StatefulWidget {
  const VehicleOverviewScreen({super.key});

  @override
  State<VehicleOverviewScreen> createState() => _VehicleOverviewScreenState();
}

class _VehicleOverviewScreenState extends State<VehicleOverviewScreen> {
  bool _isLoading = false;
  bool _isAssigned = false;
  Map<String, dynamic>? _vehicle;

  @override
  void initState() {
    super.initState();
    _fetchVehicleData();
  }

  Future<void> _fetchVehicleData() async {
    try {
      final response = await ApiService.getAssignedVehicle();
      if (mounted) {
        if (response != null && response['success'] == true) {
          final data = response['data'];
          if (data != null && data['assigned'] == true && data['vehicle'] != null) {
            setState(() {
              _isAssigned = true;
              _vehicle = Map<String, dynamic>.from(data['vehicle']);
              _isLoading = false;
            });
          } else {
            setState(() {
              _isAssigned = false;
              _vehicle = null;
              _isLoading = false;
            });
          }
        } else {
          setState(() {
            _isAssigned = false;
            _vehicle = null;
            _isLoading = false;
          });
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isAssigned = false;
          _vehicle = null;
          _isLoading = false;
        });
      }
    }
  }

  String _formatDate(dynamic dateStr) {
    if (dateStr == null || dateStr.toString().isEmpty) return 'N/A';
    try {
      final dt = DateTime.parse(dateStr.toString());
      final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return '${months[dt.month - 1]} ${dt.day.toString().padLeft(2, '0')}, ${dt.year}';
    } catch (_) {
      return dateStr.toString();
    }
  }

  @override
  Widget build(BuildContext context) {
    const primaryDark = Color(0xFF101C2C);
    const bgLight = Color(0xFFF7F8FA);
    const primaryOrange = Color(0xFFF97316);

    return Scaffold(
      backgroundColor: bgLight,
      appBar: AppBar(
        backgroundColor: primaryDark,
        elevation: 0,
        centerTitle: false,
        titleSpacing: 0,
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
        child: _isLoading
            ? const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(primaryOrange),
                ),
              )
            : RefreshIndicator(
                onRefresh: _fetchVehicleData,
                color: primaryOrange,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                  padding: const EdgeInsets.all(16.0),
                  child: !_isAssigned || _vehicle == null
                      ? _buildNoVehicleAssignedState(context)
                      : _buildVehicleContent(context),
                ),
              ),
      ),
    );
  }

  Widget _buildNoVehicleAssignedState(BuildContext context) {
    const primaryDark = Color(0xFF101C2C);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const primaryOrange = Color(0xFFF97316);

    return Column(
      children: [
        const SizedBox(height: 60),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24.0),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFE5E7EB)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: primaryOrange.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.no_crash_outlined,
                  size: 42,
                  color: primaryOrange,
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'No Vehicle Assigned',
                style: GoogleFonts.poppins(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'A Fleet Manager has not assigned a vehicle to you yet.',
                textAlign: TextAlign.center,
                style: GoogleFonts.nunito(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: textSecondary,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _fetchVehicleData,
                icon: const Icon(Icons.refresh_rounded, color: Colors.white, size: 18),
                label: Text(
                  'Check Again',
                  style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14, color: Colors.white),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryDark,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildVehicleContent(BuildContext context) {
    const textPrimary = Color(0xFF1F2937);

    final veh = _vehicle!;
    final vehicleCode = veh['vehicleNumber'] ?? veh['registrationNumber'] ?? 'N/A';
    final brandModel = '${veh['brand'] ?? ''} ${veh['model'] ?? ''}'.trim();
    final vehicleType = brandModel.isNotEmpty ? brandModel : (veh['vehicleType'] ?? 'Truck');
    final regNum = veh['registrationNumber'] ?? veh['vehicleNumber'] ?? 'N/A';
    final fuelType = veh['fuelType'] ?? 'Diesel';
    final status = veh['currentStatus'] ?? 'Assigned';
    final imageUrl = veh['image'] ?? '';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 1. Vehicle Information & Statistics Card
        Hero(
          tag: 'vehicle_details_card',
          child: Material(
            type: MaterialType.transparency,
            child: VehicleInfoCard(
              vehicleCode: vehicleCode,
              vehicleType: vehicleType,
              registrationNumber: regNum,
              fuelType: fuelType,
              status: status,
              imageUrl: imageUrl,
            ),
          ),
        ),
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
          onTap: () async {
            await Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => VehicleDetailsScreen(vehicle: veh),
              ),
            );
            _fetchVehicleData();
          },
        ),
        VehicleActionTile(
          icon: Icons.bar_chart_rounded,
          title: 'Vehicle Status',
          onTap: () async {
            await Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => VehicleStatusScreen(vehicle: veh),
              ),
            );
            _fetchVehicleData();
          },
        ),
        VehicleActionTile(
          icon: Icons.notifications_active_outlined,
          title: 'Maintenance Alerts',
          subtitle: '1 CRITICAL',
          subtitleColor: const Color(0xFFEF4444),
          onTap: () async {
            await Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => VehicleMaintenanceScreen(vehicle: veh),
              ),
            );
            _fetchVehicleData();
          },
        ),
        VehicleActionTile(
          icon: Icons.folder_open_outlined,
          title: 'Vehicle Documents',
          onTap: () async {
            await Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => VehicleDocumentsScreen(vehicle: veh),
              ),
            );
            _fetchVehicleData();
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
        QuickInfoCard(
          lastService: _formatDate(veh['lastServiceDate'] ?? veh['lastService']),
          nextService: _formatDate(veh['nextServiceDue'] ?? veh['nextService']),
          insuranceExpiry: _formatDate(veh['insuranceExpiry']),
          permitExpiry: _formatDate(veh['permitExpiry']),
        ),

        const SizedBox(height: 24.0),
      ],
    );
  }
}
