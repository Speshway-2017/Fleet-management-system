import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Dark Navy Quick Info Card widget displaying vehicle service and expiry dates.
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

  Widget _buildInfoCell(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 11,
            fontWeight: FontWeight.w500,
            color: const Color(0xFF9CA3AF),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    const darkNavy = Color(0xFF101C2C);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20.0),
      decoration: BoxDecoration(
        color: darkNavy,
        borderRadius: BorderRadius.circular(16.0),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(20),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(child: _buildInfoCell('Last Service', lastService)),
              Expanded(child: _buildInfoCell('Next Service', nextService)),
            ],
          ),
          const SizedBox(height: 18.0),
          Row(
            children: [
              Expanded(child: _buildInfoCell('Insurance Expiry', insuranceExpiry)),
              Expanded(child: _buildInfoCell('Permit Expiry', permitExpiry)),
            ],
          ),
        ],
      ),
    );
  }
}
