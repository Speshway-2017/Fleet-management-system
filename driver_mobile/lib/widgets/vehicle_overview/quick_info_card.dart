import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Executive Deep Navy Quick Info Card widget displaying color-accented vehicle service & expiry dates.
class QuickInfoCard extends StatelessWidget {
  final String lastService;
  final String nextService;
  final String insuranceExpiry;
  final String permitExpiry;

  const QuickInfoCard({
    super.key,
    this.lastService = 'N/A',
    this.nextService = 'N/A',
    this.insuranceExpiry = 'N/A',
    this.permitExpiry = 'N/A',
  });

  Widget _buildInfoCell(
    String label,
    String value, {
    required IconData icon,
    required Color accentColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 11.0),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.07),
        borderRadius: BorderRadius.circular(13.0),
        border: Border.all(color: accentColor.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: accentColor, size: 14),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.poppins(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w600,
                    color: Colors.white70,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 5),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.poppins(
              fontSize: 13.5,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0B1626), Color(0xFF13263E), Color(0xFF1B3452)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20.0),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0B1626).withValues(alpha: 0.24),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _buildInfoCell(
                  'Last Service',
                  lastService,
                  icon: Icons.build_circle_outlined,
                  accentColor: const Color(0xFF60A5FA),
                ),
              ),
              const SizedBox(width: 10.0),
              Expanded(
                child: _buildInfoCell(
                  'Next Service',
                  nextService,
                  icon: Icons.event_available_rounded,
                  accentColor: const Color(0xFFFB923C),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10.0),
          Row(
            children: [
              Expanded(
                child: _buildInfoCell(
                  'Insurance Expiry',
                  insuranceExpiry,
                  icon: Icons.verified_user_outlined,
                  accentColor: const Color(0xFF4ADE80),
                ),
              ),
              const SizedBox(width: 10.0),
              Expanded(
                child: _buildInfoCell(
                  'Permit Expiry',
                  permitExpiry,
                  icon: Icons.assignment_turned_in_outlined,
                  accentColor: const Color(0xFFA78BFA),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
