import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Reusable Color-Coded Action Tile widget for Vehicle Overview details and actions.
class VehicleActionTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Color? subtitleColor;
  final Color accentColor;
  final Color gradientEnd;
  final Color borderColor;
  final VoidCallback onTap;

  const VehicleActionTile({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.subtitleColor,
    this.accentColor = const Color(0xFF101C2C),
    this.gradientEnd = const Color(0xFFF8FAFC),
    this.borderColor = const Color(0xFFE5E7EB),
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    const textPrimary = Color(0xFF0F172A);

    return Container(
      margin: const EdgeInsets.only(bottom: 11.0),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.white, gradientEnd],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        borderRadius: BorderRadius.circular(16.0),
        border: Border.all(color: borderColor, width: 1.0),
        boxShadow: [
          BoxShadow(
            color: accentColor.withValues(alpha: 0.08),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16.0),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16.0),
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 14.0,
              vertical: 12.0,
            ),
            child: Row(
              children: [
                // Leading Color-Coded Gradient Icon Squircle
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [accentColor, accentColor.withValues(alpha: 0.82)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(12.0),
                    boxShadow: [
                      BoxShadow(
                        color: accentColor.withValues(alpha: 0.26),
                        blurRadius: 7,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Icon(icon, color: Colors.white, size: 20),
                ),
                const SizedBox(width: 14.0),

                // Title and Optional Subtitle Pill
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        title,
                        style: GoogleFonts.poppins(
                          fontSize: 14.5,
                          fontWeight: FontWeight.w700,
                          color: textPrimary,
                        ),
                      ),
                      if (subtitle != null && subtitle!.isNotEmpty) ...[
                        const SizedBox(height: 3),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 7,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: (subtitleColor ?? accentColor).withValues(
                              alpha: 0.12,
                            ),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            subtitle!,
                            style: GoogleFonts.poppins(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: subtitleColor ?? accentColor,
                              letterSpacing: 0.4,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),

                // Trailing Colored Arrow Chip
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: accentColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  child: Icon(
                    Icons.chevron_right_rounded,
                    color: accentColor,
                    size: 19,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
