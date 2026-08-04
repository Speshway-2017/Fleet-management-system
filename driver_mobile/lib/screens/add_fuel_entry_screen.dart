import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:typed_data';
import '../services/api_service.dart';

/// Driver Module - Add Fuel Entry Screen
class AddFuelEntryScreen extends StatefulWidget {
  final String? tripId;
  const AddFuelEntryScreen({super.key, this.tripId});

  @override
  State<AddFuelEntryScreen> createState() => _AddFuelEntryScreenState();
}

class _AddFuelEntryScreenState extends State<AddFuelEntryScreen> {
  // Read-only / dynamic vehicle values
  String _assignedVehicle = 'Fetching vehicle...';
  String? _currentTripId;
  final String _driverName = 'Driver';
  final String _receiptFileSize = '1.2 MB';
  bool _isSubmitting = false;

  // Fuel Stations List
  final List<String> _fuelStations = const [
    'Indian Oil',
    'Bharat Petroleum',
    'HP Petrol Pump',
    'Reliance Petroleum',
    'Nayara Energy',
    'Shell India',
  ];
  String? _selectedStation;

  // Form selections
  String? _selectedFuelType = 'Diesel';
  final List<String> _fuelTypes = const ['Diesel', 'Petrol', 'CNG'];

  String? _selectedPaymentMode = 'Fleet Card';
  final List<String> _paymentModes = const ['Cash', 'UPI', 'Fleet Card'];

  final TextEditingController _quantityController = TextEditingController();
  final TextEditingController _costController = TextEditingController();
  final TextEditingController _dateTimeController = TextEditingController();
  final TextEditingController _odometerController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();

  // Receipt Upload State
  bool _receiptUploaded = false;
  String _receiptFileName = '';
  Uint8List? _imageBytes;
  String? _imagePath;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _currentTripId = widget.tripId;
    _fetchVehicleInfo();
    _dateTimeController.text = DateTime.now().toString().split('.')[0];
  }

  @override
  void dispose() {
    _quantityController.dispose();
    _costController.dispose();
    _dateTimeController.dispose();
    _odometerController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _fetchVehicleInfo() async {
    if (_currentTripId == null) {
      try {
        final currentTripRes = await ApiService.get('/driver/trips/current');
        if (currentTripRes != null && currentTripRes['data'] != null) {
          final tripData = currentTripRes['data'];
          setState(() {
            _currentTripId = tripData['tripId']?.toString() ?? tripData['_id']?.toString() ?? '';
          });
        }
      } catch (_) {}
    }
    try {
      final res = await ApiService.getAssignedVehicle();
      if (mounted && res != null && res['success'] == true) {
        final data = res['data'];
        if (data != null && data['assigned'] == true && data['vehicle'] != null) {
          final v = data['vehicle'];
          setState(() {
            _assignedVehicle = v['vehicleNumber'] ?? v['plateNumber'] ?? 'Assigned Vehicle';
            if (v['odometer'] != null) {
              _odometerController.text = v['odometer'].toString();
            }
          });
        } else {
          setState(() {
            _assignedVehicle = 'No Vehicle Assigned';
          });
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _assignedVehicle = 'Assigned Vehicle';
        });
      }
    }
  }

  Future<void> _pickReceiptImage(ImageSource source) async {
    try {
      final XFile? file = await _picker.pickImage(source: source, imageQuality: 85);
      if (file != null) {
        final bytes = await file.readAsBytes();
        setState(() {
          _receiptUploaded = true;
          _receiptFileName = file.name;
          _imageBytes = bytes;
          _imagePath = file.path;
        });

        if (mounted) {
          ScaffoldMessenger.of(context).hideCurrentSnackBar();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  const Icon(Icons.check_circle, color: Color(0xFF22C55E), size: 20),
                  const SizedBox(width: 8),
                  Expanded(child: Text('Receipt attached (${file.name}) successfully!')),
                ],
              ),
              duration: const Duration(seconds: 2),
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.0)),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        _showWarning('Failed to select receipt image: $e');
      }
    }
  }

  void _openReceiptViewerModal(BuildContext context) {
    const primaryDark = Color(0xFF101C2C);
    const borderGray = Color(0xFFE2E8F0);
    const textSecondary = Color(0xFF6B7280);
    const primaryOrange = Color(0xFFFF7A1A);

    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (ctx) {
        return Dialog(
          backgroundColor: Colors.white,
          insetPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20.0)),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 420),
            padding: const EdgeInsets.all(18.0),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Modal Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: primaryOrange.withAlpha(25),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(
                              Icons.receipt_long_rounded,
                              color: primaryOrange,
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            _receiptFileName,
                            style: GoogleFonts.poppins(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: primaryDark,
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, size: 20, color: textSecondary),
                        onPressed: () => Navigator.of(ctx).pop(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12.0),
                  const Divider(color: borderGray, height: 1.0),
                  const SizedBox(height: 16.0),

                  // Receipt Invoice Preview Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16.0),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFAFAFA),
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
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: const BoxDecoration(
                            color: primaryDark,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.local_gas_station_rounded,
                            color: primaryOrange,
                            size: 26,
                          ),
                        ),
                        const SizedBox(height: 8.0),
                        Text(
                          (_selectedStation ?? 'HP PETROL PUMP').toUpperCase(),
                          textAlign: TextAlign.center,
                          style: GoogleFonts.poppins(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: primaryDark,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Text(
                          'Fuel Receipt Attachment',
                          style: GoogleFonts.nunito(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                            color: textSecondary,
                          ),
                        ),
                        const SizedBox(height: 12.0),
                        const Divider(color: borderGray, height: 1.0),
                        const SizedBox(height: 12.0),

                        _buildReceiptRow('Vehicle Reg', _assignedVehicle),
                        _buildReceiptRow('Trip ID', _currentTripId ?? 'N/A'),
                        _buildReceiptRow('Driver Name', _driverName),
                        _buildReceiptRow('Fuel Station', _selectedStation ?? 'N/A'),
                        _buildReceiptRow('Fuel Type', _selectedFuelType ?? 'N/A'),
                        _buildReceiptRow('Quantity', '${_quantityController.text} L'),
                        _buildReceiptRow('Payment Mode', _selectedPaymentMode ?? 'N/A'),
                        _buildReceiptRow('File Size', _receiptFileSize),

                        const SizedBox(height: 12.0),
                        const Divider(color: borderGray, height: 1.0),
                        const SizedBox(height: 12.0),

                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'TOTAL AMOUNT',
                              style: GoogleFonts.poppins(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: primaryDark,
                              ),
                            ),
                            Text(
                              '₹ ${_costController.text}',
                              style: GoogleFonts.poppins(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: primaryOrange,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20.0),

                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () => Navigator.of(ctx).pop(),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primaryOrange,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.0)),
                      ),
                      child: Text(
                        'Close Preview',
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildReceiptRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.nunito(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF6B7280),
            ),
          ),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF1F2937),
            ),
          ),
        ],
      ),
    );
  }

  void _showWarning(String message) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: const Color(0xFFDC2626),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.0)),
      ),
    );
  }

  Future<void> _showSubmitFeedback(BuildContext context) async {
    if (_selectedStation == null) {
      _showWarning('Please select a Fuel Station.');
      return;
    }
    if (_selectedFuelType == null) {
      _showWarning('Please select a Fuel Type.');
      return;
    }
    if (_quantityController.text.trim().isEmpty) {
      _showWarning('Please enter Quantity in Liters.');
      return;
    }
    if (_costController.text.trim().isEmpty) {
      _showWarning('Please enter Fuel Cost.');
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final double amt = double.tryParse(_costController.text.trim()) ?? 0.0;
      final double ltr = double.tryParse(_quantityController.text.trim()) ?? 0.0;

      final dynamic imgFile = _imageBytes ?? _imagePath;

      final response = await ApiService.createFuelEntry(
        fuelStation: _selectedStation!,
        amount: amt,
        liters: ltr,
        tripId: _currentTripId,
        odometer: double.tryParse(_odometerController.text.trim()),
        fuelType: _selectedFuelType,
        dateTime: _dateTimeController.text.trim(),
        notes: _notesController.text.trim(),
        imageFile: imgFile,
        imageName: _receiptFileName,
      );

      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });

        if (response != null && response['success'] == true) {
          _showSuccessModal();
        } else {
          _showWarning(response?['message'] ?? 'Failed to submit fuel entry.');
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
        _showWarning('Error submitting fuel entry: $e');
      }
    }
  }

  void _showSuccessModal() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.0)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8.0),
              decoration: const BoxDecoration(
                color: Color(0xFFDCFCE7),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_rounded, color: Color(0xFF15803D), size: 22),
            ),
            const SizedBox(width: 10.0),
            Expanded(
              child: Text(
                'Fuel Entry Submitted',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF1F2937),
                ),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Your fuel receipt has been uploaded and sent to Fleet Management for verification.',
              style: GoogleFonts.nunito(
                fontSize: 13,
                color: const Color(0xFF6B7280),
              ),
            ),
            const SizedBox(height: 14.0),
            Container(
              padding: const EdgeInsets.all(12.0),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(10.0),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  _buildSummaryRow('Vehicle ID', _assignedVehicle),
                  _buildSummaryRow('Station', _selectedStation ?? ''),
                  _buildSummaryRow('Fuel Type', _selectedFuelType ?? ''),
                  _buildSummaryRow('Quantity', '${_quantityController.text} L'),
                  _buildSummaryRow('Cost', '₹ ${_costController.text}'),
                  _buildSummaryRow('Status', 'Pending Manager Approval'),
                ],
              ),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              _resetForm();
              Navigator.of(context).pop();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF7A1A),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.0)),
            ),
            child: Text(
              'Done',
              style: GoogleFonts.poppins(fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.nunito(fontSize: 12, color: const Color(0xFF6B7280)),
          ),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF1F2937),
            ),
          ),
        ],
      ),
    );
  }

  void _resetForm() {
    setState(() {
      _selectedStation = null;
      _selectedFuelType = null;
      _selectedPaymentMode = null;
      _quantityController.clear();
      _costController.clear();
      _dateTimeController.clear();
      _odometerController.clear();
      _receiptUploaded = false;
    });
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Form fields reset.'),
        duration: const Duration(milliseconds: 1500),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10.0),
        ),
      ),
    );
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
          'Add Fuel Entry',
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
              // 1. ASSIGNED VEHICLE (READ-ONLY FIELD AT THE TOP)
              _buildFieldLabel('Assigned Vehicle'),
              const SizedBox(height: 6.0),
              _buildReadOnlyFieldContainer(
                value: _assignedVehicle,
                icon: Icons.directions_bus_outlined,
              ),

              const SizedBox(height: 14.0),

              // 2. CURRENT TRIP ID (READ-ONLY FIELD DIRECTLY BELOW)
              _buildFieldLabel('Current Trip ID'),
              const SizedBox(height: 6.0),
              _buildReadOnlyFieldContainer(
                value: _currentTripId ?? 'N/A',
                icon: Icons.alt_route_rounded,
              ),

              const SizedBox(height: 20.0),

              // 3. FUEL ENTRY FORM
              Text(
                'Fuel Entry Details',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: textPrimary,
                ),
              ),
              const SizedBox(height: 14.0),

              // Field: Fuel Station * (Dropdown Selector)
              _buildRequiredLabel('Fuel Station'),
              const SizedBox(height: 6.0),
              _buildStyledDropdown(
                value: _selectedStation,
                hintText: 'Select Fuel Station',
                items: _fuelStations,
                prefixIcon: Icons.local_gas_station_outlined,
                onChanged: (val) {
                  if (val != null) setState(() => _selectedStation = val);
                },
              ),

              const SizedBox(height: 16.0),

              // Field: Fuel Type * Dropdown & Quantity (Liters) * Row
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildRequiredLabel('Fuel Type'),
                        const SizedBox(height: 6.0),
                        _buildStyledDropdown(
                          value: _selectedFuelType,
                          hintText: 'Select Fuel Type',
                          items: _fuelTypes,
                          onChanged: (val) {
                            if (val != null) setState(() => _selectedFuelType = val);
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12.0),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildRequiredLabel('Quantity (Liters)'),
                        const SizedBox(height: 6.0),
                        _buildStyledTextField(
                          controller: _quantityController,
                          hintText: 'e.g. 45.0',
                          keyboardType: TextInputType.number,
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16.0),

              // Field: Fuel Cost (₹) * & Odometer Reading (KM) * Row
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildRequiredLabel('Fuel Cost (₹)'),
                        const SizedBox(height: 6.0),
                        _buildStyledTextField(
                          controller: _costController,
                          hintText: 'e.g. 4250.00',
                          keyboardType: TextInputType.number,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12.0),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildRequiredLabel('Odometer Reading (KM)'),
                        const SizedBox(height: 6.0),
                        _buildStyledTextField(
                          controller: _odometerController,
                          hintText: 'e.g. 142850',
                          keyboardType: TextInputType.number,
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16.0),

              // Field: Date & Time * & Payment Mode * Row
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildRequiredLabel('Date & Time'),
                        const SizedBox(height: 6.0),
                        _buildStyledTextField(
                          controller: _dateTimeController,
                          hintText: 'e.g. Oct 24, 2023 • 10:30 AM',
                          prefixIcon: Icons.calendar_today_outlined,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12.0),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildRequiredLabel('Payment Mode'),
                        const SizedBox(height: 6.0),
                        _buildStyledDropdown(
                          value: _selectedPaymentMode,
                          hintText: 'Select Payment Mode',
                          items: _paymentModes,
                          onChanged: (val) {
                            if (val != null) setState(() => _selectedPaymentMode = val);
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16.0),

              // Field: Notes (Optional)
              _buildFieldLabel('Notes (Optional)'),
              const SizedBox(height: 6.0),
              _buildNotesField(
                controller: _notesController,
                hintText: 'Add any special notes or comments here...',
              ),

              const SizedBox(height: 24.0),

              // 4. UPLOAD FUEL RECEIPT SECTION
              Text(
                'Upload Fuel Receipt',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: textPrimary,
                ),
              ),
              const SizedBox(height: 10.0),

              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 18.0, horizontal: 16.0),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(16.0),
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
                    const SizedBox(height: 8.0),
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
                      'Supported formats: JPG, PNG, PDF (Max 10MB)',
                      style: GoogleFonts.nunito(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w500,
                        color: textSecondary,
                      ),
                    ),
                    const SizedBox(height: 14.0),

                    // Working Camera & Gallery Buttons
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => _pickReceiptImage(ImageSource.camera),
                            icon: const Icon(Icons.camera_alt_outlined, size: 18),
                            label: const Text('Camera'),
                            style: OutlinedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: primaryDark,
                              side: const BorderSide(color: borderGray, width: 1.2),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10.0),
                              ),
                              padding: const EdgeInsets.symmetric(vertical: 12.0),
                              textStyle: GoogleFonts.poppins(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12.0),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => _pickReceiptImage(ImageSource.gallery),
                            icon: const Icon(Icons.photo_library_outlined, size: 18),
                            label: const Text('Gallery'),
                            style: OutlinedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: primaryDark,
                              side: const BorderSide(color: borderGray, width: 1.2),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10.0),
                              ),
                              padding: const EdgeInsets.symmetric(vertical: 12.0),
                              textStyle: GoogleFonts.poppins(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20.0),

              // 5. RECEIPT PREVIEW CARD & INFO NOTE (ONLY REVEALED AFTER UPLOAD)
              if (_receiptUploaded) ...[
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Receipt Preview',
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: textPrimary,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFDCFCE7),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.check_circle_rounded,
                            color: Color(0xFF15803D),
                            size: 14,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Receipt Uploaded Successfully',
                            style: GoogleFonts.poppins(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF15803D),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10.0),

                // Enhanced Receipt Preview Card with View & Remove Actions
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12.0),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16.0),
                    border: Border.all(color: borderGray, width: 1.0),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(8),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          // Thumbnail
                          Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                              color: const Color(0xFF101C2C),
                              borderRadius: BorderRadius.circular(10.0),
                            ),
                            child: const Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.receipt_long_rounded,
                                  color: Color(0xFFFF7A1A),
                                  size: 26,
                                ),
                                Text(
                                  'JPG',
                                  style: TextStyle(
                                    color: Colors.white70,
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 14.0),
                          // Receipt File Details
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _receiptFileName,
                                  style: GoogleFonts.poppins(
                                    fontSize: 13.5,
                                    fontWeight: FontWeight.w700,
                                    color: textPrimary,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 2.0),
                                Text(
                                  'File Size: $_receiptFileSize',
                                  style: GoogleFonts.nunito(
                                    fontSize: 12,
                                    color: textSecondary,
                                  ),
                                ),
                                Text(
                                  'Uploaded: Oct 24, 2023 • 10:30 AM',
                                  style: GoogleFonts.nunito(
                                    fontSize: 12,
                                    color: textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12.0),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () => _openReceiptViewerModal(context),
                              icon: const Icon(Icons.visibility_outlined, size: 16),
                              label: const Text('View Receipt'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: primaryDark,
                                side: const BorderSide(color: borderGray, width: 1.0),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10.0),
                                ),
                                padding: const EdgeInsets.symmetric(vertical: 10.0),
                                textStyle: GoogleFonts.poppins(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10.0),
                          IconButton(
                            onPressed: () {
                              setState(() {
                                _receiptUploaded = false;
                              });
                            },
                            icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 20),
                            tooltip: 'Remove Receipt',
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12.0),

                // 6. MANAGER APPROVAL INFO NOTE
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 10.0),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFF6FF),
                    borderRadius: BorderRadius.circular(10.0),
                    border: Border.all(color: const Color(0xFFBFDBFE), width: 1.0),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.info_outline_rounded,
                        color: Color(0xFF1D4ED8),
                        size: 18,
                      ),
                      const SizedBox(width: 8.0),
                      Expanded(
                        child: Text(
                          'This fuel entry will be submitted to your Fleet Manager for approval.',
                          style: GoogleFonts.nunito(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF1E40AF),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24.0),
              ],

              // 7. BOTTOM BUTTONS (Submit & Reset Form)
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : () => _showSubmitFeedback(context),
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
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2.5,
                          ),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text('Submit Fuel Entry'),
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

              const SizedBox(height: 12.0),

              SizedBox(
                width: double.infinity,
                height: 50,
                child: OutlinedButton.icon(
                  onPressed: _resetForm,
                  icon: const Icon(Icons.refresh_rounded, size: 18),
                  label: const Text('Reset Form'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: primaryDark,
                    side: const BorderSide(color: primaryDark, width: 1.5),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14.0),
                    ),
                    textStyle: GoogleFonts.poppins(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
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

  // Read-Only Field Builder (Assigned Vehicle & Current Trip ID)
  Widget _buildReadOnlyFieldContainer({
    required String value,
    required IconData icon,
  }) {
    const borderGray = Color(0xFFE2E8F0);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);

    return SizedBox(
      height: 50,
      child: InputDecorator(
        decoration: InputDecoration(
          filled: true,
          fillColor: const Color(0xFFF1F5F9), // Subtle grey indicating read-only
          isDense: true,
          contentPadding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 14.0),
          prefixIcon: Icon(
            icon,
            color: textSecondary,
            size: 20,
          ),
          suffixIcon: const Icon(
            Icons.lock_outline_rounded,
            color: textSecondary,
            size: 18,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8.0),
            borderSide: const BorderSide(color: borderGray, width: 1.0),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8.0),
            borderSide: const BorderSide(color: borderGray, width: 1.0),
          ),
        ),
        child: Text(
          value,
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: textPrimary,
          ),
        ),
      ),
    );
  }

  Widget _buildFieldLabel(String label) {
    return Text(
      label.toUpperCase(),
      style: GoogleFonts.poppins(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        color: const Color(0xFF6B7280),
        letterSpacing: 0.5,
      ),
    );
  }

  // Refined Input TextField (16px large text font, subtle 8px border)
  Widget _buildStyledTextField({
    required TextEditingController controller,
    required String hintText,
    IconData? prefixIcon,
    TextInputType keyboardType = TextInputType.text,
  }) {
    const borderGray = Color(0xFFE2E8F0);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);

    return SizedBox(
      height: 50,
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        style: GoogleFonts.poppins(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: textPrimary,
        ),
        decoration: InputDecoration(
          filled: true,
          fillColor: Colors.white,
          isDense: true,
          hintText: hintText,
          hintStyle: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.w400,
            color: const Color(0xFF9CA3AF),
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 14.0),
          prefixIcon: prefixIcon != null
              ? Icon(
                  prefixIcon,
                  color: textSecondary,
                  size: 20,
                )
              : null,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8.0),
            borderSide: const BorderSide(color: borderGray, width: 1.0),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8.0),
            borderSide: const BorderSide(color: borderGray, width: 1.0),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8.0),
            borderSide: const BorderSide(color: Color(0xFFFF7A1A), width: 1.5),
          ),
        ),
      ),
    );
  }

  // Multiline notes text field
  Widget _buildNotesField({
    required TextEditingController controller,
    required String hintText,
  }) {
    const borderGray = Color(0xFFE2E8F0);
    const textPrimary = Color(0xFF1F2937);

    return TextField(
      controller: controller,
      keyboardType: TextInputType.multiline,
      maxLines: 3,
      style: GoogleFonts.poppins(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: textPrimary,
      ),
      decoration: InputDecoration(
        filled: true,
        fillColor: Colors.white,
        isDense: true,
        hintText: hintText,
        hintStyle: GoogleFonts.poppins(
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: const Color(0xFF9CA3AF),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 14.0),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.0),
          borderSide: const BorderSide(color: borderGray, width: 1.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.0),
          borderSide: const BorderSide(color: borderGray, width: 1.0),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.0),
          borderSide: const BorderSide(color: Color(0xFFFF7A1A), width: 1.5),
        ),
      ),
    );
  }

  // Refined Dropdown Selector
  Widget _buildStyledDropdown({
    required String? value,
    required String hintText,
    required List<String> items,
    IconData? prefixIcon,
    required ValueChanged<String?> onChanged,
  }) {
    const borderGray = Color(0xFFE2E8F0);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);

    return SizedBox(
      height: 50,
      child: DropdownButtonFormField<String>(
        initialValue: value,
        hint: Text(
          hintText,
          style: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.w400,
            color: const Color(0xFF9CA3AF),
          ),
        ),
        isExpanded: true,
        icon: const Icon(
          Icons.keyboard_arrow_down_rounded,
          color: textSecondary,
          size: 20,
        ),
        style: GoogleFonts.poppins(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: textPrimary,
        ),
        decoration: InputDecoration(
          filled: true,
          fillColor: Colors.white,
          isDense: true,
          contentPadding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 12.0),
          prefixIcon: prefixIcon != null
              ? Icon(
                  prefixIcon,
                  color: textSecondary,
                  size: 20,
                )
              : null,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8.0),
            borderSide: const BorderSide(color: borderGray, width: 1.0),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8.0),
            borderSide: const BorderSide(color: borderGray, width: 1.0),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8.0),
            borderSide: const BorderSide(color: Color(0xFFFF7A1A), width: 1.5),
          ),
        ),
        items: items.map((String item) {
          return DropdownMenuItem<String>(
            value: item,
            child: Text(
              item,
              style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: textPrimary,
              ),
            ),
          );
        }).toList(),
        onChanged: onChanged,
      ),
    );
  }

  Widget _buildRequiredLabel(String label) {
    return RichText(
      text: TextSpan(
        style: GoogleFonts.poppins(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: const Color(0xFF6B7280),
          letterSpacing: 0.5,
        ),
        children: [
          TextSpan(text: label.toUpperCase()),
          const TextSpan(
            text: ' *',
            style: TextStyle(
              color: Color(0xFFEF4444),
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
