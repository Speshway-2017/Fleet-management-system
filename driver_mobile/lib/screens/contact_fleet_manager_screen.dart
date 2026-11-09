import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../services/localization_service.dart';
import '../widgets/external_contact_modal.dart';
import '../utils/navigation_helper.dart';

/// Driver Module - Contact Fleet Manager Screen (Indian Fleet Data Context)
///
/// Replicates the Fleet Management design language, color palette, typography,
/// manager profile card, contact details, active assignment, action buttons,
/// and recent activity timeline with authentic Indian fleet logistics data.
class ContactFleetManagerScreen extends StatefulWidget {
  const ContactFleetManagerScreen({super.key});

  @override
  State<ContactFleetManagerScreen> createState() =>
      _ContactFleetManagerScreenState();
}

class _ContactFleetManagerScreenState extends State<ContactFleetManagerScreen> {
  String _managerName = 'G Sai Kiran';
  String _managerPhone = '+91 98765 43210';
  String _managerEmail = 'sai@fleet.com';
  String _driverName = 'Meghana';
  String _vehiclePlate = 'Unassigned';
  String _tripId = 'Unassigned';
  String _tripStatus = 'NO ACTIVE TRIP';
  String _route = 'No Active Route';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (auth.driver != null) {
      _driverName = auth.driver!.fullName.isNotEmpty
          ? auth.driver!.fullName
          : 'Meghana';
      if (auth.driver!.manager != null) {
        setState(() {
          _managerName = auth.driver!.manager!.name.isNotEmpty
              ? auth.driver!.manager!.name
              : 'G Sai Kiran';
          _managerPhone = auth.driver!.manager!.phone.isNotEmpty
              ? auth.driver!.manager!.phone
              : '+91 98765 43210';
          _managerEmail = auth.driver!.manager!.email.isNotEmpty
              ? auth.driver!.manager!.email
              : 'sai@fleet.com';
        });
      }
    }

    try {
      final res = await ApiService.getCurrentTrip();
      if (!mounted) return;
      if (res != null && res['success'] == true && res['data'] != null) {
        final data = res['data'];
        setState(() {
          _tripId = data['tripNumber'] ?? 'Unassigned';
          _vehiclePlate = data['vehiclePlate'] ?? 'Unassigned';
          _tripStatus = (data['status'] ?? 'Assigned').toString().toUpperCase();
          final start = data['startLocation'] ?? '';
          final end = data['endLocation'] ?? '';
          if (start.isNotEmpty && end.isNotEmpty) {
            _route = '$start → $end';
          }
        });
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    const primaryDark = Color(0xFF101C2C);
    const bgLight = Color(0xFFF7F8FA);
    const borderGray = Color(0xFFE5E7EB);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const primaryOrange = Color(0xFFF97316);
    const successGreen = Color(0xFF22C55E);
    const successBg = Color(0xFFDCFCE7);
    const successText = Color(0xFF15803D);

    return ValueListenableBuilder<String>(
      valueListenable: LocalizationService.currentLanguageNotifier,
      builder: (context, currentLang, _) {
        return PopScope(
          canPop: false,
          onPopInvokedWithResult: (didPop, result) {
            if (!didPop) SafeNavigation.pop(context, fallbackTab: 2);
          },
          child: Scaffold(
            backgroundColor: bgLight,
            appBar: AppBar(
              backgroundColor: primaryDark,
              elevation: 0,
              centerTitle: false,
              leading: IconButton(
                icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
                onPressed: () => SafeNavigation.pop(context, fallbackTab: 2),
              ),
              title: Text(
                'Contact Fleet manager'.tr,
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              actions: const [],
            ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16.0, 16.0, 16.0, 32.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Manager Profile Card
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
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Avatar with online status dot indicator
                        Stack(
                          children: [
                            Container(
                              width: 64,
                              height: 64,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: primaryDark.withAlpha(20),
                                border: Border.all(color: borderGray, width: 2),
                              ),
                              child: const Center(
                                child: Icon(
                                  Icons.person_rounded,
                                  size: 38,
                                  color: primaryDark,
                                ),
                              ),
                            ),
                            Positioned(
                              right: 2,
                              bottom: 2,
                              child: Container(
                                width: 14,
                                height: 14,
                                decoration: BoxDecoration(
                                  color: successGreen,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: Colors.white,
                                    width: 2,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(width: 14.0),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _managerName,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.poppins(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700,
                                  color: textPrimary,
                                ),
                              ),
                              const SizedBox(height: 2.0),
                              Text(
                                '${'Fleet Manager'.tr} • ID: FM-IN-2045',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.nunito(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: textSecondary,
                                ),
                              ),
                              const SizedBox(height: 8.0),
                              // Available Status Badge
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: successBg,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Container(
                                      width: 6,
                                      height: 6,
                                      decoration: const BoxDecoration(
                                        color: successText,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Flexible(
                                      child: Text(
                                        'Available'.tr,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: GoogleFonts.poppins(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                          color: successText,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16.0),
                    const Divider(color: borderGray, height: 1.0),
                    const SizedBox(height: 14.0),

                    // Sub-info Grid Row (Experience & Region)
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'EXPERIENCE'.tr,
                                style: GoogleFonts.poppins(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: textSecondary,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              const SizedBox(height: 2.0),
                              Text(
                                '12 Years',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.poppins(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8.0),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'REGION'.tr,
                                style: GoogleFonts.poppins(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: textSecondary,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              const SizedBox(height: 2.0),
                              Text(
                                'West & South Corridor',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.poppins(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16.0),

              // 2. Manager Contact Details Card
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
                  children: [
                    _buildContactItem(
                      icon: Icons.phone_outlined,
                      label: 'Phone'.tr,
                      value: _managerPhone,
                      subValue: 'Office: +91 22 6123 4567',
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 12.0),
                      child: Divider(color: borderGray, height: 1.0),
                    ),
                    _buildContactItem(
                      icon: Icons.mail_outline_rounded,
                      label: 'Email'.tr,
                      value: _managerEmail,
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 12.0),
                      child: Divider(color: borderGray, height: 1.0),
                    ),
                    _buildContactItem(
                      icon: Icons.location_on_outlined,
                      label: 'Office Address'.tr,
                      value:
                          'Fleet Operations Hub, Plot 42, Nhava Sheva Logistics Park, Navi Mumbai, Maharashtra - 400707',
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 12.0),
                      child: Divider(color: borderGray, height: 1.0),
                    ),
                    _buildContactItem(
                      icon: Icons.access_time_rounded,
                      label: 'Working Hours'.tr,
                      value: '08:00 AM – 07:00 PM',
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24.0),

              // 3. Active Assignment Section
              Text(
                'Active Assignment'.tr,
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: textPrimary,
                ),
              ),
              const SizedBox(height: 12.0),

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
                      children: [
                        Flexible(
                          child: Text(
                            'Status'.tr,
                            style: GoogleFonts.nunito(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: textSecondary,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8.0),
                        Flexible(
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: _tripStatus == 'NO ACTIVE TRIP'
                                  ? Colors.grey
                                  : successGreen,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              _tripStatus.tr,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.poppins(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12.0),
                    const Divider(color: borderGray, height: 1.0),
                    const SizedBox(height: 14.0),

                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Driver'.tr,
                                style: GoogleFonts.nunito(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: textSecondary,
                                ),
                              ),
                              Text(
                                _driverName,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.poppins(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8.0),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Vehicle'.tr,
                                style: GoogleFonts.nunito(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: textSecondary,
                                ),
                              ),
                              Text(
                                _vehiclePlate,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.poppins(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12.0),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Trip ID'.tr,
                                style: GoogleFonts.nunito(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: textSecondary,
                                ),
                              ),
                              Text(
                                _tripId,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.poppins(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8.0),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Route'.tr,
                                style: GoogleFonts.nunito(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: textSecondary,
                                ),
                              ),
                              Text(
                                _route,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.poppins(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20.0),

              // 4. Action Buttons (Call & Send Message)
              ConstrainedBox(
                constraints: const BoxConstraints(
                  minWidth: double.infinity,
                  minHeight: 50,
                ),
                child: ElevatedButton.icon(
                  onPressed: () {
                    showExternalContactOptionsModal(
                      context,
                      managerName: _managerName,
                      phone: _managerPhone,
                      email: _managerEmail,
                    );
                  },
                  icon: const Icon(Icons.phone_in_talk_rounded, size: 20),
                  label: Text('Call Fleet Manager'.tr),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryOrange,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
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
              const SizedBox(height: 12.0),
              ConstrainedBox(
                constraints: const BoxConstraints(
                  minWidth: double.infinity,
                  minHeight: 50,
                ),
                child: OutlinedButton.icon(
                  onPressed: () {
                    showExternalContactOptionsModal(
                      context,
                      managerName: _managerName,
                      phone: _managerPhone,
                      email: _managerEmail,
                    );
                  },
                  icon: const Icon(Icons.chat_bubble_outline_rounded, size: 20),
                  label: Text('Send Message'.tr),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: textPrimary,
                    side: const BorderSide(color: primaryDark, width: 1.5),
                    padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
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

              const SizedBox(height: 28.0),

              // 5. Recent Activity Section (Timeline)
              Text(
                'Recent Activity'.tr,
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: textPrimary,
                ),
              ),
              const SizedBox(height: 16.0),

              _buildTimelineItem(
                isFirst: true,
                isLast: false,
                isOrangeDot: true,
                title: 'Call Completed'.tr,
                subtitle: 'Discussed route adjustments near Hub corridors.'.tr,
                timestamp: 'Today'.tr,
              ),
              _buildTimelineItem(
                isFirst: false,
                isLast: false,
                isOrangeDot: false,
                title: 'Maintenance Talk'.tr,
                subtitle:
                    'Confirmed tire pressure check at departure terminal.'.tr,
                timestamp: 'Yesterday'.tr,
              ),
              _buildTimelineItem(
                isFirst: false,
                isLast: true,
                isOrangeDot: false,
                title: 'Trip Approval'.tr,
                subtitle: 'Assignment authorized for Logistics Hub terminal.'.tr,
                timestamp: '2 days ago'.tr,
              ),

              const SizedBox(height: 24.0),
            ],
          ),
        ),
      ),
    ),
    );
      },
    );
  }

  Widget _buildContactItem({
    required IconData icon,
    required String label,
    required String value,
    String? subValue,
  }) {
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const primaryOrange = Color(0xFFF97316);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: primaryOrange, size: 22),
        const SizedBox(width: 14.0),
        Expanded(
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
              Text(
                value,
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: textPrimary,
                ),
              ),
              if (subValue != null) ...[
                const SizedBox(height: 2.0),
                Text(
                  subValue,
                  style: GoogleFonts.nunito(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: textSecondary,
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTimelineItem({
    required bool isFirst,
    required bool isLast,
    required bool isOrangeDot,
    required String title,
    required String subtitle,
    required String timestamp,
  }) {
    const borderGray = Color(0xFFE5E7EB);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const primaryOrange = Color(0xFFF97316);

    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Timeline vertical connector line
          if (!isLast)
            Positioned(
              left: 11,
              top: 28,
              bottom: -12,
              child: Container(
                width: 2,
                color: const Color(0xFFE5E7EB),
              ),
            ),
          // Timeline indicator dot
          Positioned(
            left: 6,
            top: 18,
            child: Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: isOrangeDot ? primaryOrange : Colors.white,
                shape: BoxShape.circle,
                border: Border.all(
                  color: isOrangeDot
                      ? primaryOrange
                      : const Color(0xFFD1D5DB),
                  width: isOrangeDot ? 0 : 2,
                ),
              ),
            ),
          ),
          // Timeline Content Card
          Padding(
            padding: const EdgeInsets.only(left: 32.0),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14.0),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14.0),
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
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          title,
                          style: GoogleFonts.poppins(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: textPrimary,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8.0),
                      Text(
                        timestamp,
                        style: GoogleFonts.nunito(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: textSecondary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4.0),
                  Text(
                    subtitle,
                    style: GoogleFonts.nunito(
                      fontSize: 12.5,
                      fontStyle: FontStyle.italic,
                      fontWeight: FontWeight.w500,
                      color: textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
