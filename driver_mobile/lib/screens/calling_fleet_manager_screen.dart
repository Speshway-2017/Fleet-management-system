import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Driver Module - Calling Fleet Manager Screen
/// 
/// Replicates a professional Android calling interface adapted for an Indian
/// Fleet Management application. Displays active call timer, Ramesh Kumar's profile,
/// current assignment details, 2x3 circular call controls, and end call CTA.
class CallingFleetManagerScreen extends StatelessWidget {
  const CallingFleetManagerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    const primaryDark = Color(0xFF101C2C);
    const bgLight = Color(0xFFFFFFFF);
    const borderGray = Color(0xFFE2E8F0);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const orangeAccent = Color(0xFFFF7A1A);
    const successGreen = Color(0xFF22C55E);
    const successBg = Color(0xFFDCFCE7);
    const successText = Color(0xFF15803D);
    const endCallRed = Color(0xFFDC2626);
    const controlBg = Color(0xFFF1F5F9);

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
          'Calling Fleet Manager',
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
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 8.0),

              // 1. Profile Section
              Stack(
                alignment: Alignment.bottomRight,
                children: [
                  Container(
                    width: 104,
                    height: 104,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: primaryDark.withAlpha(15),
                      border: Border.all(color: borderGray, width: 3),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(12),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Center(
                      child: Icon(
                        Icons.person_rounded,
                        size: 56,
                        color: primaryDark,
                      ),
                    ),
                  ),
                  Positioned(
                    right: 4,
                    bottom: 4,
                    child: Container(
                      width: 18,
                      height: 18,
                      decoration: BoxDecoration(
                        color: successGreen,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 3),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12.0),

              Text(
                'Rajesh Sharma',
                style: GoogleFonts.poppins(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: textPrimary,
                ),
              ),
              const SizedBox(height: 2.0),
              Text(
                'Fleet Manager',
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: textSecondary,
                ),
              ),
              const SizedBox(height: 2.0),
              Text(
                'Operations Department',
                style: GoogleFonts.nunito(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: textSecondary,
                ),
              ),
              const SizedBox(height: 8.0),

              // Green Status Badge
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
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
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                        color: successText,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Available',
                      style: GoogleFonts.poppins(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w600,
                        color: successText,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20.0),

              // 2. Call Status Section
              Text(
                '00:18',
                style: GoogleFonts.poppins(
                  fontSize: 34,
                  fontWeight: FontWeight.w800,
                  color: textPrimary,
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 2.0),
              Text(
                'Calling...',
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: textSecondary,
                ),
              ),
              const SizedBox(height: 8.0),

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.phone_in_talk_rounded,
                    size: 20,
                    color: orangeAccent,
                  ),
                  const SizedBox(width: 8.0),
                  Text(
                    '+91 98765 43210',
                    style: GoogleFonts.poppins(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: textPrimary,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24.0),

              // 3. Current Assignment Card
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
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Current Assignment',
                      style: GoogleFonts.poppins(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: textPrimary,
                      ),
                    ),
                    const SizedBox(height: 12.0),
                    const Divider(color: borderGray, height: 1.0),
                    const SizedBox(height: 12.0),

                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'TRIP ID',
                                style: GoogleFonts.poppins(
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w600,
                                  color: textSecondary,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              const SizedBox(height: 2.0),
                              Text(
                                'TRP-9901',
                                style: GoogleFonts.poppins(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'VEHICLE',
                                style: GoogleFonts.poppins(
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w600,
                                  color: textSecondary,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              const SizedBox(height: 2.0),
                              Text(
                                'MH12PQ8820',
                                style: GoogleFonts.poppins(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'ROUTE',
                                style: GoogleFonts.poppins(
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w600,
                                  color: textSecondary,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              const SizedBox(height: 2.0),
                              Text(
                                'Mumbai → Pune',
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

              const SizedBox(height: 28.0),

              // 4. Call Controls Grid (2x3 Grid)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildCallControlButton(
                    icon: Icons.mic_off_rounded,
                    label: 'Mute',
                    isActive: false,
                    isDisabled: false,
                    controlBg: controlBg,
                    activeBg: orangeAccent,
                  ),
                  _buildCallControlButton(
                    icon: Icons.volume_up_rounded,
                    label: 'Speaker',
                    isActive: false,
                    isDisabled: false,
                    controlBg: controlBg,
                    activeBg: orangeAccent,
                  ),
                  _buildCallControlButton(
                    icon: Icons.bluetooth_rounded,
                    label: 'Bluetooth',
                    isActive: true,
                    isDisabled: false,
                    controlBg: controlBg,
                    activeBg: orangeAccent,
                  ),
                ],
              ),
              const SizedBox(height: 20.0),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildCallControlButton(
                    icon: Icons.dialpad_rounded,
                    label: 'Keypad',
                    isActive: false,
                    isDisabled: false,
                    controlBg: controlBg,
                    activeBg: orangeAccent,
                  ),
                  _buildCallControlButton(
                    icon: Icons.person_add_rounded,
                    label: 'Add Call',
                    isActive: false,
                    isDisabled: false,
                    controlBg: controlBg,
                    activeBg: orangeAccent,
                  ),
                  _buildCallControlButton(
                    icon: Icons.videocam_off_rounded,
                    label: 'Video',
                    isActive: false,
                    isDisabled: true,
                    controlBg: controlBg,
                    activeBg: orangeAccent,
                  ),
                ],
              ),

              const SizedBox(height: 32.0),

              // 5. End Call Button
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton.icon(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.call_end_rounded, size: 24),
                  label: const Text('End Call'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: endCallRed,
                    foregroundColor: Colors.white,
                    elevation: 2,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(28.0),
                    ),
                    textStyle: GoogleFonts.poppins(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 16.0),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCallControlButton({
    required IconData icon,
    required String label,
    required bool isActive,
    required bool isDisabled,
    required Color controlBg,
    required Color activeBg,
  }) {
    const textPrimary = Color(0xFF1F2937);
    const textDisabled = Color(0xFF9CA3AF);

    final bg = isActive
        ? activeBg
        : (isDisabled ? controlBg.withAlpha(128) : controlBg);
    final iconColor = isActive
        ? Colors.white
        : (isDisabled ? textDisabled : textPrimary);
    final textColor = isDisabled ? textDisabled : textPrimary;

    return Column(
      children: [
        Container(
          width: 58,
          height: 58,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: bg,
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: activeBg.withAlpha(80),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ]
                : null,
          ),
          child: Icon(
            icon,
            color: iconColor,
            size: 24,
          ),
        ),
        const SizedBox(height: 8.0),
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 12,
            fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
            color: textColor,
          ),
        ),
      ],
    );
  }
}
