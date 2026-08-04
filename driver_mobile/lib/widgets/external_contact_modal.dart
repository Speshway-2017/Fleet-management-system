import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

/// Shows a bottom sheet modal to contact Manager/Fleet Staff via External Apps:
/// - WhatsApp
/// - Phone Dialer
/// - SMS Messenger
/// - Email Client
void showExternalContactOptionsModal(
  BuildContext context, {
  String managerName = 'G Sai Kiran',
  String phone = '+91 98765 43210',
  String email = 'sai@fleet.com',
}) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (ctx) {
      final cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
      final formattedPhone = cleanPhone.length == 10 ? '91$cleanPhone' : cleanPhone;

      Future<void> launchExternal(String urlString) async {
        final uri = Uri.parse(urlString);
        try {
          if (await canLaunchUrl(uri)) {
            await launchUrl(uri, mode: LaunchMode.externalApplication);
          } else {
            await launchUrl(uri);
          }
        } catch (e) {
          if (ctx.mounted) {
            ScaffoldMessenger.of(ctx).showSnackBar(
              SnackBar(content: Text('Could not open external app: $urlString')),
            );
          }
        }
      }

      return Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24.0)),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Handle Bar
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2.0),
                ),
              ),
            ),
            const SizedBox(height: 16.0),

            // Header Card
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: const BoxDecoration(
                    color: Color(0xFF101C2C),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      managerName.isNotEmpty ? managerName[0].toUpperCase() : 'M',
                      style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 20,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 14.0),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        managerName,
                        style: GoogleFonts.poppins(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF1F2937),
                        ),
                      ),
                      Text(
                        'Fleet Dispatcher Manager • $phone',
                        style: GoogleFonts.nunito(
                          fontSize: 12,
                          color: const Color(0xFF6B7280),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Color(0xFF6B7280)),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),

            const SizedBox(height: 20.0),

            Text(
              'SELECT EXTERNAL APP',
              style: GoogleFonts.poppins(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: const Color(0xFF9CA3AF),
                letterSpacing: 0.8,
              ),
            ),
            const SizedBox(height: 12.0),

            // 1. WhatsApp Button
            _buildContactTile(
              icon: Icons.chat_bubble_rounded,
              iconBgColor: const Color(0xFF25D366),
              title: 'WhatsApp Messenger',
              subtitle: 'Send direct chat & voice notes',
              onTap: () {
                Navigator.pop(ctx);
                launchExternal('https://wa.me/$formattedPhone');
              },
            ),
            const SizedBox(height: 10.0),

            // 2. Phone Call Button
            _buildContactTile(
              icon: Icons.phone_in_talk_rounded,
              iconBgColor: const Color(0xFF2563EB),
              title: 'Phone Call / Dialer',
              subtitle: 'Call manager via system dialer ($phone)',
              onTap: () {
                Navigator.pop(ctx);
                launchExternal('tel:$phone');
              },
            ),
            const SizedBox(height: 10.0),

            // 3. SMS Message Button
            _buildContactTile(
              icon: Icons.sms_rounded,
              iconBgColor: const Color(0xFFD97706),
              title: 'SMS Text Message',
              subtitle: 'Send standard cellular SMS text',
              onTap: () {
                Navigator.pop(ctx);
                launchExternal('sms:$phone');
              },
            ),
            const SizedBox(height: 10.0),

            // 4. Email Button
            _buildContactTile(
              icon: Icons.email_rounded,
              iconBgColor: const Color(0xFF374151),
              title: 'Send Official Email',
              subtitle: 'Email dispatcher at $email',
              onTap: () {
                Navigator.pop(ctx);
                launchExternal('mailto:$email');
              },
            ),

            const SizedBox(height: 20.0),

            // WhatsApp Quick Templates Section
            Text(
              'QUICK WHATSAPP MESSAGES',
              style: GoogleFonts.poppins(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: const Color(0xFF9CA3AF),
                letterSpacing: 0.8,
              ),
            ),
            const SizedBox(height: 10.0),

            _buildTemplateChip(
              ctx,
              label: '⚡ "I am currently en-route and on schedule."',
              phone: formattedPhone,
              launchExternal: launchExternal,
            ),
            const SizedBox(height: 6.0),
            _buildTemplateChip(
              ctx,
              label: '⛽ "Reporting fuel refill & receipt update."',
              phone: formattedPhone,
              launchExternal: launchExternal,
            ),
            const SizedBox(height: 6.0),
            _buildTemplateChip(
              ctx,
              label: '📍 "Arrived at location / checking in."',
              phone: formattedPhone,
              launchExternal: launchExternal,
            ),

            const SizedBox(height: 12.0),
          ],
        ),
      );
    },
  );
}

Widget _buildContactTile({
  required IconData icon,
  required Color iconBgColor,
  required String title,
  required String subtitle,
  required VoidCallback onTap,
}) {
  return Material(
    color: const Color(0xFFF9FAFB),
    borderRadius: BorderRadius.circular(16.0),
    child: InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16.0),
      child: Container(
        padding: const EdgeInsets.all(14.0),
        decoration: BoxDecoration(
          border: Border.all(color: const Color(0xFFE5E7EB)),
          borderRadius: BorderRadius.circular(16.0),
        ),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: iconBgColor,
                borderRadius: BorderRadius.circular(12.0),
              ),
              child: Icon(icon, color: Colors.white, size: 22),
            ),
            const SizedBox(width: 14.0),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF1F2937),
                    ),
                  ),
                  Text(
                    subtitle,
                    style: GoogleFonts.nunito(
                      fontSize: 12,
                      color: const Color(0xFF6B7280),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.open_in_new_rounded, size: 18, color: Color(0xFF9CA3AF)),
          ],
        ),
      ),
    ),
  );
}

Widget _buildTemplateChip(
  BuildContext context, {
  required String label,
  required String phone,
  required Function(String) launchExternal,
}) {
  return InkWell(
    onTap: () {
      Navigator.pop(context);
      final encodedText = Uri.encodeComponent(label.replaceAll('"', ''));
      launchExternal('https://wa.me/$phone?text=$encodedText');
    },
    borderRadius: BorderRadius.circular(10.0),
    child: Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
      decoration: BoxDecoration(
        color: const Color(0xFFF3F4F6),
        borderRadius: BorderRadius.circular(10.0),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Text(
        label,
        style: GoogleFonts.nunito(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: const Color(0xFF374151),
        ),
      ),
    ),
  );
}
