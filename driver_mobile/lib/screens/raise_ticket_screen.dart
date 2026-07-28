import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Driver Module - Raise Ticket Screen
/// 
/// Replicates the Fleet Management design system with Dark Navy header (#101C2C),
/// Operational Support card, category dropdown, priority selector (LOW, MEDIUM, HIGH),
/// subject, detailed description input, dashed attachment upload box, and orange Submit CTA.
class RaiseTicketScreen extends StatefulWidget {
  const RaiseTicketScreen({super.key});

  @override
  State<RaiseTicketScreen> createState() => _RaiseTicketScreenState();
}

class _RaiseTicketScreenState extends State<RaiseTicketScreen> {
  String _selectedCategory = 'Vehicle Maintenance';
  int _selectedPriorityIndex = 0; // 0: LOW, 1: MEDIUM, 2: HIGH

  final List<String> _categories = [
    'Vehicle Maintenance',
    'Tyre / Brake Issue',
    'Fuel / Payment Issue',
    'GPS / Technical Glitch',
    'Delivery Delay / Route Issue',
    'Breakdown Assistance',
  ];

  final List<String> _priorities = ['LOW', 'MEDIUM', 'HIGH'];

  void _showSubmitFeedback(BuildContext context) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Ticket submitted successfully!'),
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10.0),
        ),
      ),
    );
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    const primaryDark = Color(0xFF101C2C);
    const bgLight = Color(0xFFF7F8FA);
    const borderGray = Color(0xFFE2E8F0);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const primaryOrange = Color(0xFFFF7A1A);

    return Scaffold(
      backgroundColor: bgLight,
      appBar: AppBar(
        backgroundColor: primaryDark,
        elevation: 0,
        centerTitle: false,
        titleSpacing: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'Raise Ticket',
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
              // 1. Operational Support Banner Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16.0),
                  border: Border.all(color: borderGray, width: 1.0),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(6),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Operational Support',
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: textPrimary,
                      ),
                    ),
                    const SizedBox(height: 6.0),
                    Text(
                      'Report vehicle issues, delivery delays, or operational hurdles. Our dispatcher team typically responds within 15 minutes.',
                      style: GoogleFonts.nunito(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w500,
                        color: textSecondary,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20.0),

              // 2. Ticket Category Field
              _buildFieldLabel('TICKET CATEGORY'),
              const SizedBox(height: 6.0),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12.0),
                  border: Border.all(color: borderGray, width: 1.0),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedCategory,
                    isExpanded: true,
                    icon: const Icon(
                      Icons.keyboard_arrow_down_rounded,
                      color: textSecondary,
                    ),
                    style: GoogleFonts.poppins(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w600,
                      color: textPrimary,
                    ),
                    items: _categories.map((String category) {
                      return DropdownMenuItem<String>(
                        value: category,
                        child: Text(category),
                      );
                    }).toList(),
                    onChanged: (newValue) {
                      if (newValue != null) {
                        setState(() {
                          _selectedCategory = newValue;
                        });
                      }
                    },
                  ),
                ),
              ),

              const SizedBox(height: 18.0),

              // 3. Priority Level Selector (LOW, MEDIUM, HIGH)
              _buildFieldLabel('PRIORITY LEVEL'),
              const SizedBox(height: 6.0),
              Container(
                padding: const EdgeInsets.all(4.0),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(12.0),
                ),
                child: Row(
                  children: List.generate(_priorities.length, (index) {
                    final isSelected = _selectedPriorityIndex == index;
                    return Expanded(
                      child: GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedPriorityIndex = index;
                          });
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          padding: const EdgeInsets.symmetric(vertical: 10.0),
                          decoration: BoxDecoration(
                            color: isSelected ? primaryDark : Colors.transparent,
                            borderRadius: BorderRadius.circular(8.0),
                            boxShadow: isSelected
                                ? [
                                    BoxShadow(
                                      color: primaryDark.withAlpha(40),
                                      blurRadius: 4,
                                      offset: const Offset(0, 2),
                                    ),
                                  ]
                                : null,
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            _priorities[index],
                            style: GoogleFonts.poppins(
                              fontSize: 12,
                              fontWeight:
                                  isSelected ? FontWeight.w700 : FontWeight.w600,
                              color: isSelected ? Colors.white : textSecondary,
                            ),
                          ),
                        ),
                      ),
                    );
                  }),
                ),
              ),

              const SizedBox(height: 18.0),

              // 4. Subject Input Field
              _buildFieldLabel('SUBJECT'),
              const SizedBox(height: 6.0),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12.0),
                  border: Border.all(color: borderGray, width: 1.0),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 12.0),
                child: TextField(
                  style: GoogleFonts.poppins(
                    fontSize: 13.5,
                    color: textPrimary,
                  ),
                  decoration: InputDecoration(
                    hintText: 'Briefly summarize the issue',
                    hintStyle: GoogleFonts.poppins(
                      fontSize: 13,
                      color: textSecondary.withAlpha(180),
                    ),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
              ),

              const SizedBox(height: 18.0),

              // 5. Detailed Description Input Field
              _buildFieldLabel('DETAILED DESCRIPTION'),
              const SizedBox(height: 6.0),
              Container(
                height: 110,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12.0),
                  border: Border.all(color: borderGray, width: 1.0),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 12.0),
                child: TextField(
                  maxLines: null,
                  keyboardType: TextInputType.multiline,
                  style: GoogleFonts.nunito(
                    fontSize: 13.5,
                    color: textPrimary,
                  ),
                  decoration: InputDecoration(
                    hintText:
                        'Please provide specific details including vehicle ID or location coordinates if applicable...',
                    hintStyle: GoogleFonts.nunito(
                      fontSize: 13,
                      color: textSecondary.withAlpha(180),
                    ),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
              ),

              const SizedBox(height: 18.0),

              // 6. Attach Files/Photos Box
              _buildFieldLabel('ATTACH FILES/PHOTOS'),
              const SizedBox(height: 6.0),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 24.0, horizontal: 16.0),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(14.0),
                  border: Border.all(
                    color: const Color(0xFFCBD5E1),
                    width: 1.2,
                  ),
                ),
                child: Column(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: const Color(0xFFDBEAFE),
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                      child: const Icon(
                        Icons.cloud_upload_outlined,
                        color: Color(0xFF2563EB),
                        size: 24,
                      ),
                    ),
                    const SizedBox(height: 10.0),
                    Text(
                      'Tap to upload or drag and drop',
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2.0),
                    Text(
                      'PNG, JPG, PDF (Max 10MB per file)',
                      style: GoogleFonts.nunito(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w500,
                        color: textSecondary,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24.0),

              // 7. Submit Ticket Button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: () => _showSubmitFeedback(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryOrange,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14.0),
                    ),
                    textStyle: GoogleFonts.poppins(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('Submit Ticket'),
                      const SizedBox(width: 8.0),
                      const Icon(
                        Icons.send_rounded,
                        size: 18,
                        color: Colors.white,
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 14.0),

              // 8. Footer Disclaimer
              Center(
                child: RichText(
                  textAlign: TextAlign.center,
                  text: TextSpan(
                    style: GoogleFonts.nunito(
                      fontSize: 11.5,
                      color: textSecondary,
                    ),
                    children: [
                      const TextSpan(text: 'By submitting, you agree to our '),
                      TextSpan(
                        text: 'Operational Compliance Policy',
                        style: GoogleFonts.nunito(
                          fontWeight: FontWeight.w700,
                          color: primaryOrange,
                        ),
                      ),
                      const TextSpan(text: '.'),
                    ],
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

  Widget _buildFieldLabel(String label) {
    return Text(
      label,
      style: GoogleFonts.poppins(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        color: const Color(0xFF6B7280),
        letterSpacing: 0.5,
      ),
    );
  }
}
