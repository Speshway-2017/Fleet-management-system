import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../services/api_service.dart';

/// Driver Module - Raise Ticket Screen
/// 
/// Replicates the Fleet Management design system with Dark Navy header (#101C2C),
/// Operational Support card, category dropdown, priority selector (LOW, MEDIUM, HIGH),
/// subject, detailed description input, image attachment upload box with photo preview,
/// and orange Submit CTA connecting to live API.
class RaiseTicketScreen extends StatefulWidget {
  const RaiseTicketScreen({super.key});

  @override
  State<RaiseTicketScreen> createState() => _RaiseTicketScreenState();
}

class _RaiseTicketScreenState extends State<RaiseTicketScreen> {
  String _selectedCategory = 'Vehicle Maintenance';
  int _selectedPriorityIndex = 0; // 0: LOW, 1: MEDIUM, 2: HIGH

  final TextEditingController _subjectController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();

  dynamic _selectedImageFile; // File on mobile/desktop, or Uint8List on web
  Uint8List? _selectedImageBytes;
  String? _selectedImageName;

  bool _isSubmitting = false;

  final List<String> _categories = [
    'Vehicle Maintenance',
    'Tyre / Brake Issue',
    'Fuel / Payment Issue',
    'GPS / Technical Glitch',
    'Delivery Delay / Route Issue',
    'Breakdown Assistance',
  ];

  final List<String> _priorities = ['LOW', 'MEDIUM', 'HIGH'];

  @override
  void dispose() {
    _subjectController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? photo = await picker.pickImage(
        source: source,
        imageQuality: 80,
        maxWidth: 1600,
      );

      if (photo != null) {
        if (kIsWeb) {
          final bytes = await photo.readAsBytes();
          setState(() {
            _selectedImageBytes = bytes;
            _selectedImageFile = bytes;
            _selectedImageName = photo.name;
          });
        } else {
          final bytes = await photo.readAsBytes();
          setState(() {
            _selectedImageFile = File(photo.path);
            _selectedImageBytes = bytes;
            _selectedImageName = photo.name;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to select image: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _showImagePickerModal() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (BuildContext context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Attach Ticket Photo',
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF101C2C),
                  ),
                ),
                const SizedBox(height: 16),
                ListTile(
                  leading: const Icon(Icons.camera_alt_rounded, color: Color(0xFFFF7A1A)),
                  title: Text(
                    'Take Photo with Camera',
                    style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w600),
                  ),
                  onTap: () {
                    Navigator.pop(context);
                    _pickImage(ImageSource.camera);
                  },
                ),
                const Divider(),
                ListTile(
                  leading: const Icon(Icons.photo_library_rounded, color: Color(0xFF2563EB)),
                  title: Text(
                    'Choose from Gallery',
                    style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w600),
                  ),
                  onTap: () {
                    Navigator.pop(context);
                    _pickImage(ImageSource.gallery);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _removeSelectedImage() {
    setState(() {
      _selectedImageFile = null;
      _selectedImageBytes = null;
      _selectedImageName = null;
    });
  }

  Future<void> _submitTicket() async {
    final subject = _subjectController.text.trim();
    final description = _descriptionController.text.trim();

    if (subject.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a brief subject summarizing the issue.'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final priority = _priorities[_selectedPriorityIndex];

      await ApiService.createDriverTicket(
        category: _selectedCategory,
        priority: priority,
        subject: subject,
        description: description,
        imageFile: _selectedImageBytes ?? _selectedImageFile,
        imageName: _selectedImageName ?? 'ticket_photo.jpg',
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ticket submitted successfully! Manager has been notified.'),
            backgroundColor: Colors.green.shade700,
            duration: const Duration(seconds: 3),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10.0),
            ),
          ),
        );
        Navigator.of(context).pop(true); // Return true to refresh history list
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to submit ticket: ${e.toString().replaceAll('Exception:', '').trim()}'),
            backgroundColor: Colors.red.shade700,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
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
              TextField(
                controller: _subjectController,
                style: GoogleFonts.poppins(
                  fontSize: 13.5,
                  color: textPrimary,
                ),
                decoration: InputDecoration(
                  hintText: 'Briefly summarize the issue (e.g. Engine Overheating)',
                  hintStyle: GoogleFonts.poppins(
                    fontSize: 13,
                    color: textSecondary.withAlpha(180),
                  ),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 12.0),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.0),
                    borderSide: const BorderSide(color: borderGray, width: 1.0),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.0),
                    borderSide: const BorderSide(color: primaryOrange, width: 1.5),
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.0),
                    borderSide: const BorderSide(color: borderGray, width: 1.0),
                  ),
                ),
              ),

              const SizedBox(height: 18.0),

              // 5. Detailed Description Input Field
              _buildFieldLabel('DETAILED DESCRIPTION'),
              const SizedBox(height: 6.0),
              TextField(
                controller: _descriptionController,
                minLines: 4,
                maxLines: 6,
                keyboardType: TextInputType.multiline,
                style: GoogleFonts.nunito(
                  fontSize: 13.5,
                  color: textPrimary,
                ),
                decoration: InputDecoration(
                  hintText:
                      'Please provide specific details including vehicle condition, location or breakdown symptoms...',
                  hintStyle: GoogleFonts.nunito(
                    fontSize: 13,
                    color: textSecondary.withAlpha(180),
                  ),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 12.0),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.0),
                    borderSide: const BorderSide(color: borderGray, width: 1.0),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.0),
                    borderSide: const BorderSide(color: primaryOrange, width: 1.5),
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.0),
                    borderSide: const BorderSide(color: borderGray, width: 1.0),
                  ),
                ),
              ),

              const SizedBox(height: 18.0),

              // 6. Attach Files/Photos Box with Image Preview
              _buildFieldLabel('ATTACH FILES/PHOTOS'),
              const SizedBox(height: 6.0),
              GestureDetector(
                onTap: _showImagePickerModal,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16.0),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(14.0),
                    border: Border.all(
                      color: _selectedImageBytes != null ? primaryOrange : const Color(0xFFCBD5E1),
                      width: _selectedImageBytes != null ? 1.8 : 1.2,
                    ),
                  ),
                  child: _selectedImageBytes != null
                      ? Stack(
                          children: [
                            Row(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(10.0),
                                  child: Image.memory(
                                    _selectedImageBytes!,
                                    width: 70,
                                    height: 70,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                                const SizedBox(width: 14.0),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          const Icon(Icons.check_circle_rounded, color: Colors.green, size: 16),
                                          const SizedBox(width: 4),
                                          Text(
                                            'Photo Attached',
                                            style: GoogleFonts.poppins(
                                              fontSize: 13,
                                              fontWeight: FontWeight.w700,
                                              color: textPrimary,
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 4.0),
                                      Text(
                                        _selectedImageName ?? 'ticket_photo.jpg',
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: GoogleFonts.nunito(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                          color: textSecondary,
                                        ),
                                      ),
                                      const SizedBox(height: 4.0),
                                      Text(
                                        'Tap to change photo',
                                        style: GoogleFonts.poppins(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                          color: primaryOrange,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            Positioned(
                              top: 0,
                              right: 0,
                              child: GestureDetector(
                                onTap: _removeSelectedImage,
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: const BoxDecoration(
                                    color: Colors.red,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.close_rounded,
                                    color: Colors.white,
                                    size: 14,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        )
                      : Column(
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
                              'Tap to upload or take a photo',
                              style: GoogleFonts.poppins(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: textPrimary,
                              ),
                            ),
                            const SizedBox(height: 2.0),
                            Text(
                              'Camera, PNG, JPG (Max 10MB)',
                              style: GoogleFonts.nunito(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w500,
                                color: textSecondary,
                              ),
                            ),
                          ],
                        ),
                ),
              ),

              const SizedBox(height: 24.0),

              // 7. Submit Ticket Button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submitTicket,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryOrange,
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: primaryOrange.withAlpha(150),
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14.0),
                    ),
                    textStyle: GoogleFonts.poppins(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2.5,
                          ),
                        )
                      : Row(
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
