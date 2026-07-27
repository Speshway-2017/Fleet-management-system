import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Data model representing Indian Fleet Vehicle Details for backend integration.
class VehicleDetailsData {
  final String vehicleNumber;
  final String registrationNumber;
  final String vehicleType;
  final String brand;
  final String model;
  final String manufacturingYear;
  final String payloadCapacity;
  final String gvw;
  final String fuelType;
  final String status;
  final String lastUpdated;
  final String currentTrip;
  final String availability;
  final String currentLocation;
  final String driverName;
  final String driverEmpId;
  final String driverMobile;
  final String driverLicense;
  final String engineNumber;
  final String chassisNumber;
  final String currentOdometer;

  const VehicleDetailsData({
    this.vehicleNumber = 'TS09AB4589',
    this.registrationNumber = 'TS09AB4589',
    this.vehicleType = 'Heavy Duty Truck',
    this.brand = 'Tata Motors',
    this.model = 'Prima 5530.S',
    this.manufacturingYear = '2023',
    this.payloadCapacity = '20 Tons',
    this.gvw = '36 Tons',
    this.fuelType = 'Diesel',
    this.status = 'Active',
    this.lastUpdated = 'Updated Today • 10:30 AM',
    this.currentTrip = 'TRP-9921',
    this.availability = 'Assigned',
    this.currentLocation = 'Hyderabad, Telangana',
    this.driverName = 'Sai Kumar',
    this.driverEmpId = 'EMP-1025',
    this.driverMobile = '+91 9876543210',
    this.driverLicense = 'TS0920210012456',
    this.engineNumber = 'ENG-7721',
    this.chassisNumber = 'CHS-1102',
    this.currentOdometer = '45,230 km',
  });
}

/// Driver Module - Vehicle Details Screen
/// 
/// Tailored for Indian Fleet Management standards featuring 4 clean card sections:
/// 1. Basic Vehicle Information
/// 2. Operational Vehicle Status
/// 3. Assigned Driver Information
/// 4. Technical Specifications
class VehicleDetailsScreen extends StatelessWidget {
  final VehicleDetailsData data;

  const VehicleDetailsScreen({
    super.key,
    this.data = const VehicleDetailsData(),
  });

  Widget _buildSectionHeader(IconData icon, String title) {
    const primaryDark = Color(0xFF101C2C);
    const textPrimary = Color(0xFF1F2937);

    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6.0),
            decoration: BoxDecoration(
              color: primaryDark.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(8.0),
            ),
            child: Icon(icon, color: primaryDark, size: 18),
          ),
          const SizedBox(width: 10.0),
          Text(
            title,
            style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSpecCell(String label, String value) {
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: GoogleFonts.poppins(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: textSecondary,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 3),
        Text(
          value,
          style: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildTechSpecRow(String label, String value) {
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.nunito(
              fontSize: 14,
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
        ],
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
    const successGreen = Color(0xFF16A34A);

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
          'Vehicle Details',
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
              // CARD 1: Basic Vehicle Information Card
              Container(
                padding: const EdgeInsets.all(18.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16.0),
                  border: Border.all(color: borderGray, width: 1.0),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSectionHeader(Icons.local_shipping_outlined, 'Basic Information'),
                    
                    // Top Header Row: Vehicle Number, Registration & Vehicle Type Badge
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              data.vehicleNumber,
                              style: GoogleFonts.poppins(
                                fontSize: 20,
                                fontWeight: FontWeight.w800,
                                color: textPrimary,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Reg: ${data.registrationNumber}',
                              style: GoogleFonts.nunito(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: textSecondary,
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: primaryDark,
                            borderRadius: BorderRadius.circular(8.0),
                          ),
                          child: Text(
                            data.vehicleType,
                            style: GoogleFonts.poppins(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18.0),

                    // Specs Grid - Row 1: Brand & Model
                    Row(
                      children: [
                        Expanded(child: _buildSpecCell('Brand', data.brand)),
                        Expanded(child: _buildSpecCell('Model', data.model)),
                      ],
                    ),
                    const SizedBox(height: 16.0),

                    // Specs Grid - Row 2: Mfg Year & Payload Capacity
                    Row(
                      children: [
                        Expanded(child: _buildSpecCell('Manufacturing Year', data.manufacturingYear)),
                        Expanded(child: _buildSpecCell('Payload Capacity', data.payloadCapacity)),
                      ],
                    ),
                    const SizedBox(height: 16.0),

                    // Specs Grid - Row 3: GVW & Fuel Type
                    Row(
                      children: [
                        Expanded(child: _buildSpecCell('GVW', data.gvw)),
                        Expanded(child: _buildSpecCell('Fuel Type', data.fuelType)),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16.0),

              // CARD 2: Vehicle Operational Status Card (with Left Green Accent Bar)
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16.0),
                  border: Border.all(color: borderGray, width: 1.0),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16.0),
                  child: Container(
                    decoration: const BoxDecoration(
                      border: Border(
                        left: BorderSide(color: successGreen, width: 4.5),
                      ),
                    ),
                    padding: const EdgeInsets.all(18.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSectionHeader(Icons.sensors_rounded, 'Vehicle Status'),
                        
                        // Status Header Row: Active indicator on Left, Last Updated on Right
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: const BoxDecoration(
                                    color: successGreen,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  data.status,
                                  style: GoogleFonts.poppins(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: successGreen,
                                  ),
                                ),
                              ],
                            ),
                            Text(
                              data.lastUpdated,
                              style: GoogleFonts.nunito(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: textSecondary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14.0),

                        // Inner Box: Current Trip, Availability & Current Location
                        Container(
                          padding: const EdgeInsets.all(14.0),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF9FAFB),
                            borderRadius: BorderRadius.circular(12.0),
                            border: Border.all(color: borderGray, width: 0.8),
                          ),
                          child: Column(
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Current Trip',
                                          style: GoogleFonts.poppins(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w500,
                                            color: textSecondary,
                                          ),
                                        ),
                                        const SizedBox(height: 3),
                                        Text(
                                          data.currentTrip,
                                          style: GoogleFonts.poppins(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w800,
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
                                          'Availability',
                                          style: GoogleFonts.poppins(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w500,
                                            color: textSecondary,
                                          ),
                                        ),
                                        const SizedBox(height: 3),
                                        Text(
                                          data.availability,
                                          style: GoogleFonts.poppins(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w800,
                                            color: textPrimary,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10.0),
                              const Divider(color: borderGray, height: 1.0),
                              const SizedBox(height: 10.0),
                              Row(
                                children: [
                                  const Icon(
                                    Icons.location_on_outlined,
                                    size: 16,
                                    color: Color(0xFFF97316),
                                  ),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      data.currentLocation,
                                      style: GoogleFonts.poppins(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w700,
                                        color: textPrimary,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 16.0),

              // CARD 3: Assigned Driver Card
              Container(
                padding: const EdgeInsets.all(18.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16.0),
                  border: Border.all(color: borderGray, width: 1.0),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSectionHeader(Icons.person_outline_rounded, 'Driver Information'),
                    
                    // Driver Info Row: Avatar + Name & Emp ID
                    Row(
                      children: [
                        Container(
                          width: 46,
                          height: 46,
                          decoration: const BoxDecoration(
                            color: primaryDark,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.person_rounded,
                            color: Colors.white,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 14.0),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              data.driverName,
                              style: GoogleFonts.poppins(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: textPrimary,
                              ),
                            ),
                            const SizedBox(height: 1),
                            Text(
                              data.driverEmpId,
                              style: GoogleFonts.nunito(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 14.0),
                    const Divider(color: borderGray, height: 1.0),
                    const SizedBox(height: 14.0),

                    // Mobile & License Info Grid
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Mobile Number',
                                style: GoogleFonts.poppins(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500,
                                  color: textSecondary,
                                ),
                              ),
                              const SizedBox(height: 3.0),
                              Text(
                                data.driverMobile,
                                style: GoogleFonts.poppins(
                                  fontSize: 13,
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
                                'License Number',
                                style: GoogleFonts.poppins(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500,
                                  color: textSecondary,
                                ),
                              ),
                              const SizedBox(height: 3.0),
                              Text(
                                data.driverLicense,
                                style: GoogleFonts.poppins(
                                  fontSize: 13,
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

              // CARD 4: Technical Specifications Card
              Container(
                padding: const EdgeInsets.all(18.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16.0),
                  border: Border.all(color: borderGray, width: 1.0),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSectionHeader(Icons.precision_manufacturing_outlined, 'Technical Specifications'),
                    _buildTechSpecRow('Engine Number', data.engineNumber),
                    const Divider(color: borderGray, height: 1.0),
                    _buildTechSpecRow('Chassis Number', data.chassisNumber),
                    const Divider(color: borderGray, height: 1.0),
                    _buildTechSpecRow('Current Odometer', data.currentOdometer),
                    const Divider(color: borderGray, height: 1.0),
                    _buildTechSpecRow('Gross Vehicle Weight (GVW)', data.gvw),
                    const Divider(color: borderGray, height: 1.0),
                    _buildTechSpecRow('Payload Capacity', data.payloadCapacity),
                    const Divider(color: borderGray, height: 1.0),
                    _buildTechSpecRow('Fuel Type', data.fuelType),
                  ],
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
