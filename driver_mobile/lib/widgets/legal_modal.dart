import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class LegalModal {
  static void showTerms(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _LegalSheet(
        title: 'Terms & Conditions',
        subtitle: 'Fleet Driver Mobile • Last updated October 2026',
        icon: Icons.gavel_rounded,
        iconColor: const Color(0xFFF97316),
        iconBgColor: const Color(0xFFFFF7ED),
        sections: const [
          _LegalSection(
            number: '1',
            title: 'Acceptance & Authorized Use',
            content:
                'By accessing or using the Fleet Driver Mobile application, you acknowledge that you are an authorized driver designated by your Fleet Organization. You agree to abide by all platform rules and applicable regional transportation safety regulations.',
          ),
          _LegalSection(
            number: '2',
            title: 'Driver Responsibilities & Licensing',
            content:
                'Drivers must maintain a valid, unexpired Commercial Driver\'s License (CDL) or regional permit corresponding to their vehicle class. You must conduct pre-trip vehicle inspections, report defects immediately, and ensure sober, distraction-free driving at all times.',
          ),
          _LegalSection(
            number: '3',
            title: 'Real-Time Telemetry & Tracking',
            content:
                'While on duty or actively executing a assigned trip, the app continuously collects GPS location, speed, odometer readings, and route telemetry. This data is utilized solely for dispatch coordination, customer ETAs, and road safety scoring.',
          ),
          _LegalSection(
            number: '4',
            title: 'Account Security & Credential Protection',
            content:
                'Your driver profile credentials are strictly personal and non-transferable. You must immediately notify fleet dispatch if you suspect unauthorized access or compromise of your login credentials.',
          ),
          _LegalSection(
            number: '5',
            title: 'Compliance & Suspension',
            content:
                'Fleet Management reserves the right to restrict or revoke driver access in cases of reckless driving, policy non-compliance, unauthorized deviation from assigned manifests, or tampering with GPS/telemetry hardware.',
          ),
        ],
      ),
    );
  }

  static void showPrivacy(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _LegalSheet(
        title: 'Privacy Policy',
        subtitle: 'Fleet Driver Mobile • Last updated October 2026',
        icon: Icons.shield_outlined,
        iconColor: const Color(0xFF0284C7),
        iconBgColor: const Color(0xFFF0F9FF),
        sections: const [
          _LegalSection(
            number: '1',
            title: 'Data We Collect',
            content:
                'We collect driver identity details (name, employee ID, contact info), live GPS & route telemetry during active duty, odometer logs, uploaded fuel receipts, proof-of-delivery signatures, and vehicle condition reports.',
          ),
          _LegalSection(
            number: '2',
            title: 'How We Use Collected Information',
            content:
                'Collected information is processed to optimize dispatch routes, compute accurate turnaround times, calculate driver safety metrics, verify fuel claims, and generate automated delivery invoices.',
          ),
          _LegalSection(
            number: '3',
            title: 'Location Permissions & On-Duty Scope',
            content:
                'Background and high-accuracy GPS tracking is only active during scheduled shifts and active trips. When you sign off or enter off-duty status, continuous tracking is suspended in respect of your personal privacy.',
          ),
          _LegalSection(
            number: '4',
            title: 'Data Security & Zero Resale',
            content:
                'All telemetry and personal credentials transmitted between the mobile application and backend servers are secured using industry-standard TLS 1.3 encryption. Your data is never sold to advertisers or unauthorized third parties.',
          ),
          _LegalSection(
            number: '5',
            title: 'Your Rights & Questions',
            content:
                'You may review your past trip history, earnings logs, and safety score at any time in the app. For data retention inquiries or correction requests, contact your fleet manager or our 24/7 dispatcher support.',
          ),
        ],
      ),
    );
  }

  static void showAccountDeletion(
    BuildContext context, {
    VoidCallback? onConfirmDelete,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _LegalSheet(
        title: 'Delete Driver Account',
        subtitle: 'Fleet Driver Mobile • Account & Telemetry Removal',
        icon: Icons.delete_forever_rounded,
        iconColor: const Color(0xFFDC2626),
        iconBgColor: const Color(0xFFFEF2F2),
        primaryActionLabel: onConfirmDelete != null
            ? 'Confirm & Request Account Deletion'
            : 'I Understand',
        isDestructiveAction: onConfirmDelete != null,
        onPrimaryAction: onConfirmDelete != null
            ? () {
                Navigator.of(ctx).pop();
                onConfirmDelete();
              }
            : null,
        sections: const [
          _LegalSection(
            number: '1',
            title: 'Complete All Active Trips',
            content:
                'Ensure all assigned and in-progress delivery trips are completed before deleting your account. Hand in any pending Proof of Delivery (POD) slips, weighbridge receipts, and fuel bills.',
          ),
          _LegalSection(
            number: '2',
            title: 'Immediate Session & GPS Deactivation',
            content:
                'Upon confirmation, your driver mobile login sessions, JWT credentials, and background GPS location telemetry will be deactivated immediately. You will be logged out securely.',
          ),
          _LegalSection(
            number: '3',
            title: 'Personal Data Removal & Retention Disclosures',
            content:
                'All personal profile data (name, employee ID, avatar, contact phone, and email) is permanently purged within 30 days. Completed delivery manifests and tax/GST invoices are retained as required by transportation regulations.',
          ),
          _LegalSection(
            number: '4',
            title: 'Dispatcher Settlement & Notice',
            content:
                'Your Fleet Manager will be notified to finalize operational handover and settle any pending driver payouts or vehicle reassignments.',
          ),
        ],
      ),
    );
  }
}

class _LegalSection {
  final String number;
  final String title;
  final String content;

  const _LegalSection({
    required this.number,
    required this.title,
    required this.content,
  });
}

class _LegalSheet extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color iconColor;
  final Color iconBgColor;
  final List<_LegalSection> sections;
  final String? primaryActionLabel;
  final bool isDestructiveAction;
  final VoidCallback? onPrimaryAction;

  const _LegalSheet({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.iconColor,
    required this.iconBgColor,
    required this.sections,
    this.primaryActionLabel,
    this.isDestructiveAction = false,
    this.onPrimaryAction,
  });

  @override
  Widget build(BuildContext context) {
    final maxHeight = MediaQuery.of(context).size.height * 0.85;

    return Container(
      constraints: BoxConstraints(maxHeight: maxHeight),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Drag Handle
            Container(
              margin: const EdgeInsets.only(top: 10, bottom: 8),
              width: 42,
              height: 4.5,
              decoration: BoxDecoration(
                color: const Color(0xFFE2E8F0),
                borderRadius: BorderRadius.circular(3),
              ),
            ),

            // Header Row
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 16, 12),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: iconBgColor,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: iconColor.withValues(alpha: 0.2)),
                    ),
                    child: Icon(icon, color: iconColor, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          subtitle,
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: const Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close_rounded, color: Color(0xFF64748B), size: 22),
                    style: IconButton.styleFrom(
                      backgroundColor: const Color(0xFFF1F5F9),
                      padding: const EdgeInsets.all(8),
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1, color: Color(0xFFF1F5F9)),

            // Scrollable Content
            Flexible(
              child: ListView.separated(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
                itemCount: sections.length,
                separatorBuilder: (context, index) => const SizedBox(height: 14),
                itemBuilder: (ctx, index) {
                  final sec = sections[index];
                  return Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 22,
                              height: 22,
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: iconColor,
                                shape: BoxShape.circle,
                              ),
                              child: Text(
                                sec.number,
                                style: GoogleFonts.plusJakartaSans(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                sec.title,
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFF1E293B),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          sec.content,
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 12.5,
                            height: 1.5,
                            color: const Color(0xFF475569),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),

            const Divider(height: 1, color: Color(0xFFF1F5F9)),

            // Bottom Action
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: onPrimaryAction ?? () => Navigator.of(context).pop(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isDestructiveAction
                        ? const Color(0xFFDC2626)
                        : const Color(0xFF0F1E36),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: Text(
                    primaryActionLabel ?? 'I Understand & Accept',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
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
