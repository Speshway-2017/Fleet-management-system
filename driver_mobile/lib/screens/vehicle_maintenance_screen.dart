import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Data models for Vehicle Maintenance Screen backend integration.
class MaintenanceAlertItem {
  final String title;
  final String description;
  final String dueDate;
  final String statusText;
  final String priorityBadge; // 'High', 'Medium', 'Low'
  final Color accentColor;
  final Color iconBgColor;
  final IconData icon;

  const MaintenanceAlertItem({
    required this.title,
    required this.description,
    required this.dueDate,
    required this.statusText,
    required this.priorityBadge,
    required this.accentColor,
    required this.iconBgColor,
    required this.icon,
  });
}

/// Driver Module - Vehicle Maintenance Screen
/// 
/// Replicates the Vehicle Maintenance reference UI with pixel-perfect fidelity:
/// - Top App Bar with back navigation and fleet logo
/// - Service Summary stats cards (Upcoming Services: 02, Overdue Services: 01)
/// - Active Alerts section with color-coded priority badges and left accent borders
/// - Last Service Insight card
/// - Bottom "Contact Fleet Manager" call-to-action button
class VehicleMaintenanceScreen extends StatelessWidget {
  final int upcomingServicesCount;
  final int overdueServicesCount;

  const VehicleMaintenanceScreen({
    super.key,
    this.upcomingServicesCount = 2,
    this.overdueServicesCount = 1,
  });

  static const List<MaintenanceAlertItem> sampleAlerts = [
    MaintenanceAlertItem(
      title: 'Engine Oil Change',
      description: 'Critical engine health maintenance required.',
      dueDate: 'Due: 10 Oct 2023',
      statusText: 'OVERDUE',
      priorityBadge: 'High',
      accentColor: Color(0xFFDC2626),
      iconBgColor: Color(0xFFFEE2E2),
      icon: Icons.water_drop_rounded,
    ),
    MaintenanceAlertItem(
      title: 'Tyre Inspection',
      description: 'Quarterly safety and tread depth check.',
      dueDate: 'Due: 25 Oct 2023',
      statusText: 'EXPIRING SOON',
      priorityBadge: 'Medium',
      accentColor: Color(0xFFF97316),
      iconBgColor: Color(0xFFFFEDD5),
      icon: Icons.build_rounded,
    ),
    MaintenanceAlertItem(
      title: 'Insurance Expiry',
      description: 'Annual renewal of vehicle policy.',
      dueDate: 'Due: 15 Nov 2023',
      statusText: 'VALID',
      priorityBadge: 'Low',
      accentColor: Color(0xFF101C2C),
      iconBgColor: Color(0xFFE0F2FE),
      icon: Icons.shield_outlined,
    ),
  ];

  Widget _buildSummaryCard(String label, String count) {
    const textSecondary = Color(0xFF6B7280);
    const borderGray = Color(0xFFE5E7EB);
    const primaryOrange = Color(0xFFF97316);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14.0),
        border: Border.all(color: borderGray, width: 1.0),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.nunito(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: textSecondary,
            ),
          ),
          const SizedBox(height: 6.0),
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
                count,
                style: GoogleFonts.poppins(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: primaryOrange,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAlertCard(BuildContext context, MaintenanceAlertItem alert) {
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const borderGray = Color(0xFFE5E7EB);

    // Dynamic colors for priority badges
    Color badgeBg;
    Color badgeTextColor;

    switch (alert.priorityBadge) {
      case 'High':
        badgeBg = const Color(0xFFFEE2E2);
        badgeTextColor = const Color(0xFFDC2626);
        break;
      case 'Medium':
        badgeBg = const Color(0xFFFFEDD5);
        badgeTextColor = const Color(0xFFC2410C);
        break;
      case 'Low':
      default:
        badgeBg = const Color(0xFFE0F2FE);
        badgeTextColor = const Color(0xFF0369A1);
        break;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14.0),
        border: Border.all(color: borderGray, width: 1.0),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(14.0),
        child: Container(
          decoration: BoxDecoration(
            border: Border(
              left: BorderSide(color: alert.accentColor, width: 4.5),
            ),
          ),
          padding: const EdgeInsets.all(14.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Row: Icon + Title + Description + Priority Badge
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: alert.iconBgColor,
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                    child: Icon(
                      alert.icon,
                      color: alert.accentColor,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 12.0),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              alert.title,
                              style: GoogleFonts.poppins(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: textPrimary,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 3,
                              ),
                              decoration: BoxDecoration(
                                color: badgeBg,
                                borderRadius: BorderRadius.circular(12.0),
                              ),
                              child: Text(
                                alert.priorityBadge,
                                style: GoogleFonts.poppins(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: badgeTextColor,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2.0),
                        Text(
                          alert.description,
                          style: GoogleFonts.nunito(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12.0),

              // Bottom Row: Due Date on Left, Status Badge on Right
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
    );
  }

  @override
  Widget build(BuildContext context) {
    const primaryDark = Color(0xFF101C2C);
    const bgLight = Color(0xFFF7F8FA);
    const borderGray = Color(0xFFE5E7EB);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
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
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1. Summary Stats Cards (Upcoming & Overdue Services)
                    Row(
                      children: [
                        Expanded(
                          child: _buildSummaryCard(
                            'Upcoming Services',
                            upcomingServicesCount < 10
                                ? '0$upcomingServicesCount'
                                : '$upcomingServicesCount',
                          ),
                        ),
                        const SizedBox(width: 12.0),
                        Expanded(
                          child: _buildSummaryCard(
                            'Overdue Services',
                            overdueServicesCount < 10
                                ? '0$overdueServicesCount'
                                : '$overdueServicesCount',
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 20.0),

                    // 2. Active Alerts Section Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Active Alerts',
                          style: GoogleFonts.poppins(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: textPrimary,
                          ),
                        ),
                        Text(
                          '${sampleAlerts.length} Alerts Total',
                          style: GoogleFonts.poppins(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: primaryOrange,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12.0),

                    // 3. Active Alerts List
                    ...sampleAlerts.map((alert) => _buildAlertCard(context, alert)),

                    const SizedBox(height: 16.0),

                    // 4. Last Service Insight Section Header & Card
                    Text(
                      'Last Service Insight',
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: textPrimary,
                      ),
                    ),
                    const SizedBox(height: 12.0),

                    Container(
                      padding: const EdgeInsets.all(16.0),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14.0),
                        border: Border.all(color: borderGray, width: 1.0),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.02),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Top Row: Last Service Date & Total Cost
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'LAST SERVICE DATE',
                                    style: GoogleFonts.poppins(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w600,
                                      color: textSecondary,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '15 Sept 2023',
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
                                      fontSize: 10,
                                      fontWeight: FontWeight.w600,
                                      color: textSecondary,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '\$450',
                                    style: GoogleFonts.poppins(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w800,
                                      color: textPrimary,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),

                          const SizedBox(height: 14.0),

                          // Location Row
                          Row(
                            children: [
                              const Icon(
                                Icons.location_on_outlined,
                                size: 16,
                                color: textSecondary,
                              ),
                              const SizedBox(width: 8.0),
                              Text(
                                'Central Fleet Hub',
                                style: GoogleFonts.nunito(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: textSecondary,
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 8.0),

                          // Notes Row
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(
                                Icons.notes_rounded,
                                size: 16,
                                color: textSecondary,
                              ),
                              const SizedBox(width: 8.0),
                              Expanded(
                                child: Text(
                                  '"Routine checkup, replaced minor filters."',
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
                    ),

                    const SizedBox(height: 20.0),
                  ],
                ),
              ),
            ),

            // 5. Bottom Sticky "Contact Fleet Manager" Action Button
            Container(
              padding: const EdgeInsets.all(16.0),
              decoration: const BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 8,
                    offset: Offset(0, -2),
                  ),
                ],
              ),
              child: SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).hideCurrentSnackBar();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: const Text('Calling Fleet Manager...'),
                        duration: const Duration(seconds: 2),
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10.0),
                        ),
                      ),
                    );
                  },
                  icon: const Icon(
                    Icons.support_agent_rounded,
                    color: Colors.white,
                    size: 20,
                  ),
                  label: Text(
                    'Contact Fleet Manager',
                    style: GoogleFonts.poppins(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryOrange,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12.0),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
