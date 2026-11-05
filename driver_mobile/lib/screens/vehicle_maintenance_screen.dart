import '../services/localization_service.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import 'contact_fleet_manager_screen.dart';
import 'fuel_overview_screen.dart';
import 'raise_ticket_screen.dart';
import 'support_history_screen.dart';

/// Vehicle Maintenance Alert Data Item representation.
class MaintenanceAlertItem {
  final String title;
  final String subtitle;
  final String dueDate;
  final String statusText;
  final String priorityTag;
  final IconData icon;
  final Color accentColor;
  final Color iconBgColor;
  final Color iconColor;
  final Color tagBgColor;
  final Color tagTextColor;

  const MaintenanceAlertItem({
    required this.title,
    required this.subtitle,
    required this.dueDate,
    required this.statusText,
    required this.priorityTag,
    required this.icon,
    required this.accentColor,
    required this.iconBgColor,
    required this.iconColor,
    required this.tagBgColor,
    required this.tagTextColor,
  });
}

/// Driver Module - Vehicle Maintenance Screen
/// 
/// Replicates the Fleet Management design language, color palette, typography,
/// summary statistics, active maintenance alerts, last service insight, and
/// action navigation to Contact Fleet Manager screen.
/// Dynamically fetches real maintenance records created by Manager in MongoDB.
class VehicleMaintenanceScreen extends StatefulWidget {
  final Map<String, dynamic>? vehicle;

  const VehicleMaintenanceScreen({
    super.key,
    this.vehicle,
  });

  @override
  State<VehicleMaintenanceScreen> createState() => _VehicleMaintenanceScreenState();
}

class _VehicleMaintenanceScreenState extends State<VehicleMaintenanceScreen> {
  static const primaryOrange = Color(0xFFF97316);

  // Static cache for instant 0ms screen loading (Stale-While-Revalidate pattern)
  static Map<String, dynamic>? _cachedMaintenanceData;
  static bool? _cachedIsAssigned;
  static Map<String, dynamic>? _cachedVehicle;

  bool _isLoading = false;
  bool _isAssigned = false;
  Map<String, dynamic>? _vehicle;
  List<dynamic> _activeMaintenances = [];
  Map<String, dynamic>? _lastCompleted;
  int _upcomingCount = 0;
  int _overdueCount = 0;

  @override
  void initState() {
    super.initState();
    if (_cachedMaintenanceData != null) {
      _isAssigned = _cachedIsAssigned ?? (widget.vehicle != null);
      _vehicle = _cachedVehicle ?? widget.vehicle;
      _activeMaintenances = List<dynamic>.from(_cachedMaintenanceData!['activeMaintenances'] ?? []);
      _lastCompleted = _cachedMaintenanceData!['lastCompleted'] != null ? Map<String, dynamic>.from(_cachedMaintenanceData!['lastCompleted']) : null;
      _upcomingCount = _cachedMaintenanceData!['upcomingCount'] ?? 0;
      _overdueCount = _cachedMaintenanceData!['overdueCount'] ?? 0;
      _isLoading = false;
    } else if (widget.vehicle != null) {
      _isAssigned = true;
      _vehicle = widget.vehicle;
      _isLoading = false;
    } else {
      _isLoading = true;
    }
    _fetchMaintenanceData();
  }

  Future<void> _fetchMaintenanceData() async {
    try {
      // Execute maintenance and assignment queries concurrently via Future.wait
      final results = await Future.wait([
        ApiService.getDriverMaintenance().catchError((_) => null),
        ApiService.getAssignedVehicle().catchError((_) => null),
      ]);
      final response = results[0];
      final vehRes = results[1];

      bool assigned = false;
      Map<String, dynamic>? vehObj;
      if (vehRes != null && vehRes['success'] == true) {
        final data = vehRes['data'];
        if (data != null && data['assigned'] == true && data['vehicle'] != null) {
          assigned = true;
          vehObj = Map<String, dynamic>.from(data['vehicle']);
        }
      }

      if (response != null && response['success'] == true) {
        final data = response['data'];
        if (data != null && data['assigned'] == true) {
          final vehicleData = data['vehicle'] != null ? Map<String, dynamic>.from(data['vehicle']) : vehObj ?? widget.vehicle;
          _cachedMaintenanceData = Map<String, dynamic>.from(data);
          _cachedIsAssigned = true;
          _cachedVehicle = vehicleData;

          if (mounted) {
            setState(() {
              _isAssigned = true;
              _vehicle = vehicleData;
              _activeMaintenances = List<dynamic>.from(data['activeMaintenances'] ?? []);
              _lastCompleted = data['lastCompleted'] != null ? Map<String, dynamic>.from(data['lastCompleted']) : null;
              _upcomingCount = data['upcomingCount'] ?? 0;
              _overdueCount = data['overdueCount'] ?? 0;
              _isLoading = false;
            });
            return;
          }
        }
      }

      // If neither response indicates an assigned vehicle
      if (!assigned && (response == null || response['data']?['assigned'] != true)) {
        _cachedIsAssigned = false;
        _cachedVehicle = null;
        _cachedMaintenanceData = null;
        if (mounted) {
          setState(() {
            _isAssigned = false;
            _vehicle = null;
            _activeMaintenances = [];
            _lastCompleted = null;
            _upcomingCount = 0;
            _overdueCount = 0;
            _isLoading = false;
          });
        }
        return;
      }
    } catch (_) {}

    // Fallback if endpoint returns unassigned or fails
    if (mounted) {
      setState(() {
        _isAssigned = widget.vehicle != null;
        _vehicle = widget.vehicle;
        _activeMaintenances = [];
        _lastCompleted = null;
        _upcomingCount = 0;
        _overdueCount = 0;
        _isLoading = false;
      });
    }
  }

  String _formatDate(dynamic dateStr) {
    if (dateStr == null || dateStr.toString().isEmpty) return 'N/A';
    try {
      final dt = DateTime.parse(dateStr.toString());
      final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return '${months[dt.month - 1]} ${dt.day}, ${dt.year}';
    } catch (_) {
      return dateStr.toString();
    }
  }

  MaintenanceAlertItem _mapMaintenanceToAlert(Map<String, dynamic> m) {
    final status = (m['status'] ?? 'Scheduled').toString();
    final serviceType = (m['serviceType'] ?? 'Vehicle Service').toString();
    final scheduledDate = m['scheduledDate'] ?? 'N/A';
    final comments = m['comments'] ?? m['garage'] ?? m['specialist'] ?? 'Maintenance work order created by manager';

    final isOverdue = status.toLowerCase() == 'overdue';
    final isInProgress = status.toLowerCase() == 'in progress';

    Color accentColor = const Color(0xFFF97316);
    Color iconBgColor = const Color(0xFFFEF3C7);
    Color iconColor = const Color(0xFFD97706);
    Color tagBgColor = const Color(0xFFFEF3C7);
    Color tagTextColor = const Color(0xFFD97706);
    String priorityTag = 'Medium';

    if (isInProgress) {
      accentColor = const Color(0xFFF97316);
      iconBgColor = const Color(0xFFFEF3C7);
      iconColor = const Color(0xFFD97706);
      tagBgColor = const Color(0xFFFEF3C7);
      tagTextColor = const Color(0xFFD97706);
      priorityTag = 'In Progress';
    } else if (isOverdue) {
      accentColor = const Color(0xFFEF4444);
      iconBgColor = const Color(0xFFFEE2E2);
      iconColor = const Color(0xFFEF4444);
      tagBgColor = const Color(0xFFFEE2E2);
      tagTextColor = const Color(0xFFDC2626);
      priorityTag = 'High';
    }

    return MaintenanceAlertItem(
      title: serviceType,
      subtitle: comments.toString(),
      dueDate: 'Due: $scheduledDate',
      statusText: status.toUpperCase(),
      priorityTag: priorityTag,
      icon: Icons.build_rounded,
      accentColor: accentColor,
      iconBgColor: iconBgColor,
      iconColor: iconColor,
      tagBgColor: tagBgColor,
      tagTextColor: tagTextColor,
    );
  }

  @override
  Widget build(BuildContext context) {
    const primaryDark = Color(0xFF101C2C);
    const bgLight = Color(0xFFF7F8FA);

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
          'Vehicle Maintenance'.tr,
          style: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        actions: const [],
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(primaryOrange),
                ),
              )
            : RefreshIndicator(
                onRefresh: _fetchMaintenanceData,
                color: primaryOrange,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                  padding: const EdgeInsets.all(16.0),
                  child: !_isAssigned && _vehicle == null
                      ? _buildNoVehicleAssignedState()
                      : _buildMaintenanceContent(),
                ),
              ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: const Border(
            top: BorderSide(color: Color(0xFFE2E8F0), width: 1.0),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, -3),
            ),
          ],
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
        child: SafeArea(
          top: false,
          child: Row(
            children: [
              // 1. Vehicle Issues Button (View Tickets / History)
              Expanded(
                child: SizedBox(
                  height: 48,
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const SupportHistoryScreen()),
                      );
                    },
                    icon: const Icon(Icons.warning_amber_rounded, size: 18, color: Color(0xFF0F172A)),
                    label: Text(
                      'Vehicle Issues'.tr,
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF0F172A),
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFFCBD5E1), width: 1.5),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      backgroundColor: const Color(0xFFF8FAFC),
                      elevation: 0,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // 2. Raise Ticket Button (Create New Issue Ticket)
              Expanded(
                child: SizedBox(
                  height: 48,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      if (!_isAssigned && _vehicle == null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('No vehicle is currently assigned. Vehicle issue reporting will unlock once a vehicle is assigned.'),
                            backgroundColor: Color(0xFF0F172A),
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                        return;
                      }
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const RaiseTicketScreen()),
                      );
                    },
                    icon: const Icon(Icons.add_circle_outline_rounded, size: 18, color: Colors.white),
                    label: Text(
                      'Raise Ticket'.tr,
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryOrange,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNoVehicleAssignedState() {
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 76,
              height: 76,
              decoration: const BoxDecoration(
                color: Color(0xFFFFF7ED),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.build_circle_outlined, size: 44, color: Color(0xFFF97316)),
            ),
            const SizedBox(height: 16),
            Text(
              'No Vehicle Assigned',
              style: GoogleFonts.poppins(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'No vehicle has been assigned yet. You can inspect previous vehicle issues and fuel records, or contact your fleet manager for vehicle allocation.',
              textAlign: TextAlign.center,
              style: GoogleFonts.nunito(fontSize: 13.5, color: textSecondary, height: 1.4),
            ),
            const SizedBox(height: 24),
            // High-Contrast Quick Action Cards for Vehicle Issue & Fuel
            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const SupportHistoryScreen()),
                      );
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFCBD5E1), width: 1.5),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.04),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: const Color(0xFFFEE2E2),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.warning_amber_rounded, color: Color(0xFFDC2626), size: 22),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            'Vehicle Issues',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.poppins(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF0F172A),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFEF3C7),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              'VIEW TICKETS',
                              style: GoogleFonts.poppins(
                                fontSize: 9.5,
                                fontWeight: FontWeight.w800,
                                color: const Color(0xFFB45309),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: InkWell(
                    onTap: () {
                      if (!_isAssigned && _vehicle == null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('No vehicle is currently assigned. Vehicle issue reporting will unlock once a vehicle is assigned.'),
                            backgroundColor: Color(0xFF0F172A),
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                        return;
                      }
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const RaiseTicketScreen()),
                      );
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFCBD5E1), width: 1.5),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.04),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFF7ED),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.add_circle_outline_rounded, color: Color(0xFFF97316), size: 22),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            'Raise Ticket',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.poppins(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF0F172A),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFEDD5),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              'REPORT ISSUE',
                              style: GoogleFonts.poppins(
                                fontSize: 9.5,
                                fontWeight: FontWeight.w800,
                                color: const Color(0xFFC2410C),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const ContactFleetManagerScreen()),
                  );
                },
                icon: const Icon(Icons.support_agent_rounded, size: 18, color: Color(0xFF0F172A)),
                label: Text(
                  'Contact Fleet Manager'.tr,
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF0F172A),
                  ),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFF94A3B8), width: 1.5),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMaintenanceContent() {
    const borderGray = Color(0xFFE5E7EB);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);

    final alerts = _activeMaintenances.map((m) => _mapMaintenanceToAlert(Map<String, dynamic>.from(m))).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 1. Top Summary Cards (Upcoming & Overdue Services)
        Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16.0),
                  border: Border.all(color: borderGray, width: 1.0),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Upcoming Services'.tr,
                      style: GoogleFonts.nunito(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: textSecondary,
                      ),
                    ),
                    const SizedBox(height: 8.0),
                    Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: primaryOrange,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8.0),
                        Text(
                          _upcomingCount.toString().padLeft(2, '0'),
                          style: GoogleFonts.poppins(
                            fontSize: 26,
                            fontWeight: FontWeight.w800,
                            color: primaryOrange,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 14.0),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16.0),
                  border: Border.all(color: borderGray, width: 1.0),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Overdue Services'.tr,
                      style: GoogleFonts.nunito(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: textSecondary,
                      ),
                    ),
                    const SizedBox(height: 8.0),
                    Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: _overdueCount > 0 ? const Color(0xFFEF4444) : const Color(0xFF16A34A),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8.0),
                        Text(
                          _overdueCount.toString().padLeft(2, '0'),
                          style: GoogleFonts.poppins(
                            fontSize: 26,
                            fontWeight: FontWeight.w800,
                            color: _overdueCount > 0 ? const Color(0xFFEF4444) : const Color(0xFF16A34A),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: 24.0),

        // 2. Active Alerts Section Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Active Alerts'.tr,
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: textPrimary,
              ),
            ),
            Text(
              '${alerts.length} Alerts Total',
              style: GoogleFonts.poppins(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: alerts.isNotEmpty ? primaryOrange : const Color(0xFF16A34A),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14.0),

        // 3. Active Alerts List
        alerts.isEmpty
            ? Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: borderGray),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle_outline, color: Color(0xFF16A34A), size: 24),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'All systems operational. No active maintenance alerts for this vehicle.',
                        style: GoogleFonts.nunito(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: textSecondary,
                        ),
                      ),
                    ),
                  ],
                ),
              )
            : ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: alerts.length,
                separatorBuilder: (context, index) => const SizedBox(height: 14.0),
                itemBuilder: (context, index) {
                  final alert = alerts[index];
                  return Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16.0),
                      border: Border.all(color: borderGray, width: 1.0),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: IntrinsicHeight(
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Container(
                            width: 5,
                            color: alert.accentColor,
                          ),
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        width: 44,
                                        height: 44,
                                        decoration: BoxDecoration(
                                          color: alert.iconBgColor,
                                          borderRadius: BorderRadius.circular(12.0),
                                        ),
                                        child: Icon(
                                          alert.icon,
                                          color: alert.iconColor,
                                          size: 22,
                                        ),
                                      ),
                                      const SizedBox(width: 12.0),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              alert.title,
                                              style: GoogleFonts.poppins(
                                                fontSize: 15,
                                                fontWeight: FontWeight.w700,
                                                color: textPrimary,
                                              ),
                                            ),
                                            const SizedBox(height: 2.0),
                                            Text(
                                              alert.subtitle,
                                              style: GoogleFonts.nunito(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w500,
                                                color: textSecondary,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 10,
                                          vertical: 4,
                                        ),
                                        decoration: BoxDecoration(
                                          color: alert.tagBgColor,
                                          borderRadius: BorderRadius.circular(20),
                                        ),
                                        child: Text(
                                          alert.priorityTag,
                                          style: GoogleFonts.poppins(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w700,
                                            color: alert.tagTextColor,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),

                                  const SizedBox(height: 14.0),

                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: [
                                          Icon(
                                            Icons.calendar_today_outlined,
                                            size: 14,
                                            color: alert.accentColor,
                                          ),
                                          const SizedBox(width: 6.0),
                                          Text(
                                            alert.dueDate,
                                            style: GoogleFonts.poppins(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w600,
                                              color: alert.accentColor,
                                            ),
                                          ),
                                        ],
                                      ),
                                      Text(
                                        alert.statusText,
                                        style: GoogleFonts.poppins(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w800,
                                          color: alert.accentColor,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),

        const SizedBox(height: 24.0),

        // 4. Last Service Insight Section
        Text(
          'Last Service Insight'.tr,
          style: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: textPrimary,
          ),
        ),
        const SizedBox(height: 14.0),

        _buildLastServiceCard(),

        const SizedBox(height: 24.0),

        // 5. Contact Fleet Manager Bottom Button
        SizedBox(
          width: double.infinity,
          height: 48,
          child: OutlinedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const ContactFleetManagerScreen(),
                ),
              );
            },
            icon: const Icon(Icons.headset_mic_rounded, size: 20, color: Color(0xFF0F172A)),
            label: Text(
              'Contact Fleet Manager',
              style: GoogleFonts.poppins(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF0F172A),
              ),
            ),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Color(0xFFCBD5E1), width: 1.5),
              backgroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.0),
              ),
            ),
          ),
        ),

        const SizedBox(height: 24.0),
      ],
    );
  }

  Widget _buildLastServiceCard() {
    const borderGray = Color(0xFFE5E7EB);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);

    final lastComp = _lastCompleted;
    final lastDate = lastComp != null
        ? (lastComp['scheduledDate'] ?? _formatDate(lastComp['updatedAt']))
        : _formatDate(_vehicle?['lastServiceDate'] ?? _vehicle?['lastService']);
    final costStr = lastComp != null && lastComp['cost'] != null && lastComp['cost'].toString().isNotEmpty
        ? (lastComp['cost'].toString().startsWith('₹') ? lastComp['cost'].toString() : '₹${lastComp['cost']}')
        : 'N/A';
    final garageStr = lastComp != null
        ? (lastComp['garage'] ?? lastComp['specialist'] ?? _vehicle?['branchDepot'] ?? 'Fleet Service Hub')
        : (_vehicle?['branchDepot'] ?? _vehicle?['currentLocation'] ?? 'Fleet Service Hub');
    final commentsStr = lastComp != null && lastComp['comments'] != null && lastComp['comments'].toString().isNotEmpty
        ? '"${lastComp['comments']}"'
        : '"Routine vehicle service & inspection."';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16.0),
        border: Border.all(color: borderGray, width: 1.0),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
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
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'LAST SERVICE DATE',
                    style: GoogleFonts.poppins(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w600,
                      color: textSecondary,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 2.0),
                  Text(
                    lastDate,
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: textPrimary,
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'TOTAL COST',
                    style: GoogleFonts.poppins(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w600,
                      color: textSecondary,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 2.0),
                  Text(
                    costStr,
                    style: GoogleFonts.poppins(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: textPrimary,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12.0),
          Row(
            children: [
              const Icon(
                Icons.location_on_outlined,
                size: 16,
                color: textSecondary,
              ),
              const SizedBox(width: 6.0),
              Expanded(
                child: Text(
                  garageStr,
                  style: GoogleFonts.nunito(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: textSecondary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8.0),
          Row(
            children: [
              const Icon(
                Icons.notes_rounded,
                size: 16,
                color: textSecondary,
              ),
              const SizedBox(width: 6.0),
              Expanded(
                child: Text(
                  commentsStr,
                  style: GoogleFonts.nunito(
                    fontSize: 13,
                    fontStyle: FontStyle.italic,
                    fontWeight: FontWeight.w500,
                    color: textSecondary,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
