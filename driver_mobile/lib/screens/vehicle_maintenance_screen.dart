import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import 'contact_fleet_manager_screen.dart';

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
  bool _isLoading = true;
  bool _isAssigned = false;
  Map<String, dynamic>? _vehicle;
  List<dynamic> _activeMaintenances = [];
  Map<String, dynamic>? _lastCompleted;
  int _upcomingCount = 0;
  int _overdueCount = 0;

  @override
  void initState() {
    super.initState();
    _fetchMaintenanceData();
  }

  Future<void> _fetchMaintenanceData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final response = await ApiService.getDriverMaintenance();
      if (mounted) {
        if (response != null && response['success'] == true) {
          final data = response['data'];
          if (data != null && data['assigned'] == true) {
            setState(() {
              _isAssigned = true;
              _vehicle = data['vehicle'] != null ? Map<String, dynamic>.from(data['vehicle']) : widget.vehicle;
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
    const primaryOrange = Color(0xFFF97316);

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
          'Vehicle Maintenance',
          style: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white),
            onPressed: _fetchMaintenanceData,
            tooltip: 'Refresh Maintenance',
          ),
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
    );
  }

  Widget _buildNoVehicleAssignedState() {
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.build_circle_outlined, size: 64, color: textSecondary),
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
              'Maintenance alerts and service schedules are unavailable because no vehicle is assigned to your profile.',
              textAlign: TextAlign.center,
              style: GoogleFonts.nunito(fontSize: 14, color: textSecondary),
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
    const primaryOrange = Color(0xFFF97316);

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
                      'Upcoming Services',
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
                      'Overdue Services',
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
              'Active Alerts',
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
          'Last Service Insight',
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
          height: 52,
          child: ElevatedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const ContactFleetManagerScreen(),
                ),
              );
            },
            icon: const Icon(Icons.headset_mic_rounded, size: 20),
            label: const Text('Contact Fleet Manager'),
            style: ElevatedButton.styleFrom(
              backgroundColor: primaryOrange,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.0),
              ),
              textStyle: GoogleFonts.poppins(
                fontSize: 15,
                fontWeight: FontWeight.w700,
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
