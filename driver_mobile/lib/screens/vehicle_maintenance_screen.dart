import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
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
class VehicleMaintenanceScreen extends StatelessWidget {
  const VehicleMaintenanceScreen({super.key});

  static const List<MaintenanceAlertItem> _alerts = [
    MaintenanceAlertItem(
      title: 'Engine Oil Change',
      subtitle: 'Critical engine health maintenance required.',
      dueDate: 'Due: 10 Oct 2023',
      statusText: 'OVERDUE',
      priorityTag: 'High',
      icon: Icons.water_drop_rounded,
      accentColor: Color(0xFFEF4444),
      iconBgColor: Color(0xFFFEE2E2),
      iconColor: Color(0xFFEF4444),
      tagBgColor: Color(0xFFFEE2E2),
      tagTextColor: Color(0xFFDC2626),
    ),
    MaintenanceAlertItem(
      title: 'Tyre Inspection',
      subtitle: 'Quarterly safety and tread depth check.',
      dueDate: 'Due: 25 Oct 2023',
      statusText: 'EXPIRING SOON',
      priorityTag: 'Medium',
      icon: Icons.build_rounded,
      accentColor: Color(0xFFF97316),
      iconBgColor: Color(0xFFFEF3C7),
      iconColor: Color(0xFFD97706),
      tagBgColor: Color(0xFFFEF3C7),
      tagTextColor: Color(0xFFD97706),
    ),
    MaintenanceAlertItem(
      title: 'Insurance Expiry',
      subtitle: 'Annual renewal of vehicle policy.',
      dueDate: 'Due: 15 Nov 2023',
      statusText: 'VALID',
      priorityTag: 'Low',
      icon: Icons.shield_outlined,
      accentColor: Color(0xFF101C2C),
      iconBgColor: Color(0xFFE0F2FE),
      iconColor: Color(0xFF0284C7),
      tagBgColor: Color(0xFFE0F2FE),
      tagTextColor: Color(0xFF0284C7),
    ),
  ];

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
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
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
                            color: Colors.black.withAlpha(6),
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
                                '02',
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
                            color: Colors.black.withAlpha(6),
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
                                decoration: const BoxDecoration(
                                  color: primaryOrange,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 8.0),
                              Text(
                                '01',
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
                    '3 Alerts Total',
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: primaryOrange,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14.0),

              // 3. Active Alerts List
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _alerts.length,
                separatorBuilder: (context, index) => const SizedBox(height: 14.0),
                itemBuilder: (context, index) {
                  final alert = _alerts[index];
                  return Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16.0),
                      border: Border.all(color: borderGray, width: 1.0),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(8),
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
                          // Left color accent bar
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
                                  // Header Row: Icon, Title & Subtitle, Priority Tag
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

                                  // Footer Row: Due Date & Status Badge Text
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

              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16.0),
                  border: Border.all(color: borderGray, width: 1.0),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(8),
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
                                fontSize: 10.5,
                                fontWeight: FontWeight.w600,
                                color: textSecondary,
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 2.0),
                            Text(
                              '₹14,500',
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
                        Text(
                          'Chakan Fleet Service Hub, Pune',
                          style: GoogleFonts.nunito(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: textSecondary,
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
          ),
        ),
      ),
    );
  }
}
