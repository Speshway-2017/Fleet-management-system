import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Vehicle Information Card displaying banner image, status badge, details, and 3 key metrics.
class VehicleInfoCard extends StatelessWidget {
  final String vehicleCode;
  final String vehicleType;
  final String registrationNumber;
  final String fuelType;
  final String status;
  final String imageUrl;

  const VehicleInfoCard({
    super.key,
    this.vehicleCode = 'N/A',
    this.vehicleType = 'Vehicle',
    this.registrationNumber = 'N/A',
    this.fuelType = 'Diesel',
    this.status = 'Available',
    this.imageUrl = '',
  });

  @override
  Widget build(BuildContext context) {
    const primaryDark = Color(0xFF101C2C);
    const secondaryOrange = Color(0xFFF97316);
    const borderGray = Color(0xFFE5E7EB);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16.0),
        border: Border.all(color: borderGray, width: 1.0),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner Image & Active Badge Container
          Stack(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16.0),
                  topRight: Radius.circular(16.0),
                ),
                child: imageUrl.startsWith('http')
                    ? Image.network(
                        imageUrl,
                        height: 180,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => _buildImageFallback(primaryDark, textSecondary),
                      )
                    : Image.asset(
                        'assets/images/white_van.png',
                        height: 180,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => _buildImageFallback(primaryDark, textSecondary),
                      ),
              ),

              // Status Badge (Top-Right)
              Positioned(
                top: 14,
                right: 14,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFDCFCE7),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFF86EFAC), width: 1),
                  ),
                  child: Text(
                    status,
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF15803D),
                    ),
                  ),
                ),
              ),
            ],
          ),

          // Vehicle Identity Details Section
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Left Column: Vehicle Code, Type, and Registration
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            vehicleCode,
                            style: GoogleFonts.poppins(
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                              color: textPrimary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '$vehicleType • $registrationNumber',
                            style: GoogleFonts.nunito(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Right Column: Fuel Type
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          'FUEL TYPE',
                          style: GoogleFonts.poppins(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: textSecondary,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          fuelType,
                          style: GoogleFonts.poppins(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: secondaryOrange,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImageFallback(Color primaryDark, Color textSecondary) {
    return Container(
      height: 180,
      width: double.infinity,
      decoration: const BoxDecoration(
        color: Color(0xFFE2E8F0),
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(16.0),
          topRight: Radius.circular(16.0),
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.airport_shuttle_outlined,
            size: 64,
            color: primaryDark,
          ),
          const SizedBox(height: 8),
          Text(
            'Fleet Vehicle Preview',
            style: TextStyle(
              color: textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
