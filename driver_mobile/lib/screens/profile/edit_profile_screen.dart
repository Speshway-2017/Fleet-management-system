import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import '../../theme/app_colors.dart';
import '../../widgets/custom_app_bar.dart';
import '../../providers/auth_provider.dart';
import 'profile_screen.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  
  // Text Controllers pre-filled with driver details
  final _nameController = TextEditingController();
  final _employeeIdController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _dobController = TextEditingController();
  final _addressController = TextEditingController();
  final _emergencyContactController = TextEditingController();
  final _licenseNumberController = TextEditingController();
  final _licenseClassController = TextEditingController();
  final _expiryDateController = TextEditingController();
  final _issuingStateController = TextEditingController();
  final _vehicleController = TextEditingController();

  String _profilePhotoUrl = '';
  DateTime? _selectedDob;
  DateTime? _selectedLicenseExpiry;

  @override
  void initState() {
    super.initState();
    _profilePhotoUrl = ProfileState.profilePhotoUrlNotifier.value;

    final driver = Provider.of<AuthProvider>(context, listen: false).driver;
    if (driver != null) {
      _nameController.text = driver.fullName;
      _employeeIdController.text = driver.employeeId.isNotEmpty ? driver.employeeId : driver.id;
      _emailController.text = driver.email;
      _phoneController.text = driver.phoneNumber;
      _addressController.text = driver.address;
      _licenseNumberController.text = driver.licenseNumber;
      _licenseClassController.text = driver.licenseType;
      _issuingStateController.text = driver.branch;
      _vehicleController.text = driver.assignedVehicle;

      _selectedDob = DateTime.tryParse(driver.dob);
      _selectedLicenseExpiry = DateTime.tryParse(driver.licenseExpiry);

      if (_selectedDob != null) {
        _dobController.text = _formatLongDate(_selectedDob!);
      }
      if (_selectedLicenseExpiry != null) {
        _expiryDateController.text = _formatShortDate(_selectedLicenseExpiry!);
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _employeeIdController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _dobController.dispose();
    _addressController.dispose();
    _emergencyContactController.dispose();
    _licenseNumberController.dispose();
    _licenseClassController.dispose();
    _expiryDateController.dispose();
    _issuingStateController.dispose();
    _vehicleController.dispose();
    super.dispose();
  }

  String _formatLongDate(DateTime date) {
    final months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }

  String _formatShortDate(DateTime date) {
    final shortMonths = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${shortMonths[date.month - 1]} ${date.day}, ${date.year}';
  }

  // Date selection helper
  Future<void> _selectDate(BuildContext context, TextEditingController controller, DateTime initialDate, bool isShortFormat) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime(1950),
      lastDate: DateTime(2040),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.secondary,
              onPrimary: Colors.white,
              onSurface: AppColors.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        controller.text = isShortFormat ? _formatShortDate(picked) : _formatLongDate(picked);
        if (isShortFormat) {
          _selectedLicenseExpiry = picked;
        } else {
          _selectedDob = picked;
        }
      });
    }
  }

  Future<void> _pickImageFromDevice() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.image,
        withData: true,
      );
      if (result != null && result.files.isNotEmpty) {
        final file = result.files.first;
        final bytes = file.bytes;
        if (bytes != null) {
          final base64String = base64Encode(bytes);
          final extension = file.extension ?? 'jpg';
          final dataUri = 'data:image/$extension;base64,$base64String';
          
          setState(() {
            _profilePhotoUrl = dataUri;
          });
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Image loaded from device. Click Save Changes to upload.'),
              backgroundColor: AppColors.success,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error picking image: $e'),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  // Image Upload / Change Selector sheet
  void _showPhotoOptions() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16.0)),
      ),
      builder: (BuildContext context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 16.0),
                child: Text(
                  'Change Profile Photo',
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              ListTile(
                leading: const Icon(Icons.camera_alt, color: AppColors.secondary),
                title: Text('Take Photo', style: GoogleFonts.poppins()),
                onTap: () {
                  Navigator.pop(context);
                  _mockPhotoChange('Camera');
                },
              ),
              ListTile(
                leading: const Icon(Icons.folder_open_rounded, color: AppColors.secondary),
                title: Text('Upload from Device', style: GoogleFonts.poppins()),
                onTap: () {
                  Navigator.pop(context);
                  _pickImageFromDevice();
                },
              ),
              ListTile(
                leading: const Icon(Icons.delete_outline, color: AppColors.error),
                title: Text('Reset to Default', style: GoogleFonts.poppins(color: AppColors.error)),
                onTap: () {
                  Navigator.pop(context);
                  setState(() {
                    _profilePhotoUrl = '';
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Profile photo reset to default.'),
                      backgroundColor: AppColors.info,
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _mockPhotoChange(String source) {
    setState(() {
      // Switch to a different mock network image headshot
      _profilePhotoUrl = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?fit=crop&w=300&h=300';
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Mock photo loaded successfully from $source.'),
        backgroundColor: AppColors.success,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  // Handle Save / Submit validation
  Future<void> _saveChanges() async {
    if (_formKey.currentState!.validate()) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext context) {
          return const Center(
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.secondary),
            ),
          );
        },
      );

      final auth = Provider.of<AuthProvider>(context, listen: false);

      final payload = {
        'fullName': _nameController.text.trim(),
        'email': _emailController.text.trim().toLowerCase(),
        'phone': _phoneController.text.trim(),
        'address': _addressController.text.trim(),
        'licenseNumber': _licenseNumberController.text.trim(),
        'licenseType': _licenseClassController.text.trim(),
        'profileImage': _profilePhotoUrl,
        'branch': _issuingStateController.text.trim(),
        if (_selectedDob != null) 'dob': _selectedDob!.toIso8601String(),
        if (_selectedLicenseExpiry != null) 'licenseExpiry': _selectedLicenseExpiry!.toIso8601String(),
      };

      final success = await auth.updateProfile(payload);

      if (mounted) {
        Navigator.pop(context); // Close loading spinner
      }

      if (success) {
        ProfileState.profilePhotoUrlNotifier.value = _profilePhotoUrl;
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Profile updated successfully!'),
              backgroundColor: AppColors.success,
              behavior: SnackBarBehavior.floating,
            ),
          );
          Navigator.pop(context); // Return to Profile screen
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(auth.errorMessage ?? 'Failed to update profile'),
              backgroundColor: AppColors.error,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      }
    }
  }

  Widget _buildAvatarImage() {
    if (_profilePhotoUrl.isEmpty) {
      return const Icon(
        Icons.person,
        size: 64,
        color: AppColors.textDisabled,
      );
    }
    
    if (_profilePhotoUrl.startsWith('data:image') && _profilePhotoUrl.contains('base64,')) {
      try {
        final base64Content = _profilePhotoUrl.split('base64,').last;
        final bytes = base64Decode(base64Content);
        return Image.memory(
          bytes,
          fit: BoxFit.cover,
        );
      } catch (e) {
        return const Icon(
          Icons.person,
          size: 64,
          color: AppColors.textDisabled,
        );
      }
    }
    
    return Image.network(
      _profilePhotoUrl,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) {
        return const Icon(
          Icons.person,
          size: 64,
          color: AppColors.textDisabled,
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: CustomAppBar(
        centerTitle: false,
        titleSpacing: 0.0,
        backgroundColor: AppColors.primary,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Edit Profile',
          style: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        actions: [
          Container(
            width: 32,
            height: 32,
            margin: const EdgeInsets.only(right: 16.0),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8.0),
            ),
            padding: const EdgeInsets.all(4.0),
            alignment: Alignment.center,
            child: Image.asset(
              'assets/logo.png',
              fit: BoxFit.contain,
              errorBuilder: (context, error, stackTrace) {
                return const Icon(
                  Icons.local_shipping,
                  color: AppColors.primary,
                  size: 18,
                );
              },
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Form(
          key: _formKey,
          autovalidateMode: AutovalidateMode.onUserInteraction,
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Profile Avatar with Camera change button
                Center(
                  child: Stack(
                    children: [
                      Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.textPrimary.withAlpha(20),
                              blurRadius: 16,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: ClipOval(
                          child: _buildAvatarImage(),
                        ),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: GestureDetector(
                          onTap: _showPhotoOptions,
                          child: Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              color: AppColors.secondary,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: Colors.white,
                                width: 2.5,
                              ),
                            ),
                            child: const Icon(
                              Icons.camera_alt,
                              color: Colors.white,
                              size: 16,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Center(
                  child: Column(
                    children: [
                      Text(
                        'Alex Johnson',
                        style: GoogleFonts.poppins(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Driver ID: FF-9821',
                        style: GoogleFonts.nunito(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),

                // SECTION 1: Personal Information
                _buildSectionHeader('Personal Information'),
                const SizedBox(height: 16),
                _buildInputField(
                  label: 'Full Name',
                  controller: _nameController,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Full Name is required';
                    }
                    if (value.trim().length < 3) {
                      return 'Full Name must be at least 3 characters';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                _buildInputField(
                  label: 'Employee ID (Read-only)',
                  controller: _employeeIdController,
                  readOnly: true,
                ),
                const SizedBox(height: 16),
                _buildInputField(
                  label: 'Date of Birth',
                  controller: _dobController,
                  prefixIcon: Icons.calendar_today_outlined,
                  readOnly: true,
                  onTap: () => _selectDate(context, _dobController, DateTime(1988, 10, 12), false),
                ),
                const SizedBox(height: 28),

                // SECTION 2: Contact Information
                _buildSectionHeader('Contact Information'),
                const SizedBox(height: 16),
                _buildInputField(
                  label: 'Email Address',
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Email is required';
                    }
                    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
                    if (!emailRegex.hasMatch(value.trim())) {
                      return 'Enter a valid email address';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                _buildInputField(
                  label: 'Phone Number',
                  controller: _phoneController,
                  prefixIcon: Icons.phone_outlined,
                  keyboardType: TextInputType.phone,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Phone Number is required';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                _buildInputField(
                  label: 'Address',
                  controller: _addressController,
                  prefixIcon: Icons.location_on_outlined,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Address is required';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 28),

                // SECTION 3: License Details
                _buildSectionHeader('License Details'),
                const SizedBox(height: 16),
                _buildInputField(
                  label: 'License Number',
                  controller: _licenseNumberController,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'License Number is required';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                _buildInputField(
                  label: 'License Class',
                  controller: _licenseClassController,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'License Class is required';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                _buildInputField(
                  label: 'Expiry Date',
                  controller: _expiryDateController,
                  prefixIcon: Icons.calendar_today_outlined,
                  readOnly: true,
                  onTap: () => _selectDate(context, _expiryDateController, DateTime(2026, 10, 12), true),
                ),
                const SizedBox(height: 16),
                _buildInputField(
                  label: 'Issuing State',
                  controller: _issuingStateController,
                ),
                const SizedBox(height: 36),

                // Action Buttons (Cancel / Save Changes)
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(context),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppColors.divider, width: 1.5),
                          minimumSize: const Size(double.infinity, 54),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12.0),
                          ),
                        ),
                        child: Text(
                          'Cancel',
                          style: GoogleFonts.poppins(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _saveChanges,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.secondary,
                          minimumSize: const Size(double.infinity, 54),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12.0),
                          ),
                          elevation: 0,
                        ),
                        child: Text(
                          'Save Changes',
                          style: GoogleFonts.poppins(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Row(
      children: [
        Container(
          width: 4,
          height: 20,
          decoration: BoxDecoration(
            color: AppColors.secondary,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: GoogleFonts.poppins(
            fontSize: 17,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildInputField({
    required String label,
    required TextEditingController controller,
    IconData? prefixIcon,
    bool readOnly = false,
    VoidCallback? onTap,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.nunito(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          readOnly: readOnly,
          onTap: onTap,
          keyboardType: keyboardType,
          validator: validator,
          style: GoogleFonts.poppins(
            fontSize: 14.5,
            fontWeight: FontWeight.w500,
            color: readOnly ? AppColors.textDisabled : AppColors.textPrimary,
          ),
          decoration: InputDecoration(
            filled: true,
            fillColor: readOnly ? AppColors.surface : Colors.white,
            prefixIcon: prefixIcon != null
                ? Icon(
                    prefixIcon,
                    color: AppColors.textSecondary,
                    size: 20,
                  )
                : null,
            contentPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10.0),
              borderSide: const BorderSide(color: AppColors.divider, width: 1.0),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10.0),
              borderSide: const BorderSide(color: AppColors.secondary, width: 1.5),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10.0),
              borderSide: const BorderSide(color: AppColors.error, width: 1.0),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10.0),
              borderSide: const BorderSide(color: AppColors.error, width: 1.5),
            ),
          ),
        ),
      ],
    );
  }
}
