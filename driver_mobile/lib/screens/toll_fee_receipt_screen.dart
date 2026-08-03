import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../constants/app_colors.dart';
import '../constants/app_radius.dart';
import '../constants/app_spacing.dart';
import '../services/api_service.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';

class TollFeeReceiptScreen extends StatefulWidget {
  final String receiptNumber;
  final String tripId;
  final Map<String, dynamic>? tripData;

  const TollFeeReceiptScreen({
    super.key,
    this.receiptNumber = '#TOLL-2023-8842',
    this.tripId = '#TRP-9921',
    this.tripData,
  });

  @override
  State<TollFeeReceiptScreen> createState() => _TollFeeReceiptScreenState();
}

class _TollFeeReceiptScreenState extends State<TollFeeReceiptScreen> {
  bool _isLoading = true;
  bool _isSubmitting = false;
  List<dynamic> _tolls = [];

  // Manual Form States
  bool _showManualForm = false;
  final _formKey = GlobalKey<FormState>();
  final _plazaController = TextEditingController();
  final _amountController = TextEditingController();
  final _dateTimeController = TextEditingController();
  final List<dynamic> _attachedFiles = [];
  final List<String> _attachedFileNames = [];

  @override
  void initState() {
    super.initState();
    _dateTimeController.text = DateTime.now().toString().split('.')[0];
    _fetchTolls();
  }

  @override
  void dispose() {
    _plazaController.dispose();
    _amountController.dispose();
    _dateTimeController.dispose();
    super.dispose();
  }

  Future<void> _fetchTolls() async {
    setState(() {
      _isLoading = true;
    });

    final cleanId = widget.tripId.replaceAll('#', '').trim();

    try {
      final res = await ApiService.getDriverTripTolls(cleanId);
      if (res != null && res['success'] == true) {
        setState(() {
          _tolls = res['data'] ?? [];
          _isLoading = false;
        });
      } else {
        setState(() {
          _tolls = [];
          _isLoading = false;
        });
      }
    } catch (_) {
      setState(() {
        _tolls = [];
        _isLoading = false;
      });
    }
  }

  Future<void> _pickImage() async {
    try {
      final XFile? file = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 85);
      if (file != null) {
        final bytes = await file.readAsBytes();
        setState(() {
          _attachedFiles.add(bytes);
          _attachedFileNames.add(file.name);
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to select receipt image: $e')),
        );
      }
    }
  }

  Future<void> _handleManualSubmit() async {
    if (_formKey.currentState == null || !_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    final cleanId = widget.tripId.replaceAll('#', '').trim();

    try {
      final double amountPaid = double.tryParse(_amountController.text) ?? 0.0;

      await ApiService.createTripTollEntry(
        tollPlazaName: _plazaController.text.trim(),
        amountPaid: amountPaid,
        tripId: cleanId,
        dateTime: _dateTimeController.text.trim(),
        imageFiles: _attachedFiles,
        imageNames: _attachedFileNames,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Manual toll receipt uploaded successfully!'),
            backgroundColor: AppColors.success,
          ),
        );
        setState(() {
          _showManualForm = false;
          _plazaController.clear();
          _amountController.clear();
          _attachedFiles.clear();
          _attachedFileNames.clear();
        });
        _fetchTolls();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Submission failed: ${e.toString().replaceAll('Exception: ', '')}'),
            backgroundColor: AppColors.error,
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
    final isDesktop = MediaQuery.of(context).size.width > 768;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        centerTitle: false,
        title: Text(
          'Toll Fee Receipts',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: AppColors.background,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
            : Stack(
                children: [
                  SingleChildScrollView(
                    padding: EdgeInsets.symmetric(
                      horizontal: isDesktop ? MediaQuery.of(context).size.width * 0.2 : AppSpacing.md,
                      vertical: AppSpacing.md,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // 1. Receipt Header Card
                        _buildReceiptHeaderCard(context),
                        const SizedBox(height: 16),

                        Text(
                          'TOLL TRANSACTIONS',
                          style: GoogleFonts.poppins(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: AppColors.secondaryText,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 8),

                        // Toll Transactions List or Empty warning
                        if (_tolls.isEmpty)
                          _buildEmptyTollsCard()
                        else
                          ..._tolls.map((t) => _buildTollTransactionCard(context, t)),

                        const SizedBox(height: 16),

                        // Form for manual upload if no tolls exist
                        if (_tolls.isEmpty) ...[
                          if (!_showManualForm)
                            ElevatedButton.icon(
                              onPressed: () {
                                setState(() {
                                  _showManualForm = true;
                                });
                              },
                              icon: const Icon(Icons.upload_file, color: Colors.white),
                              label: Text(
                                'UPLOAD MANUAL TOLL RECEIPT',
                                style: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.secondary,
                                minimumSize: const Size(double.infinity, 48),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.sm)),
                              ),
                            )
                          else
                            _buildManualUploadForm(),
                        ],
                        const SizedBox(height: 40),
                      ],
                    ),
                  ),
                  if (_isSubmitting)
                    Container(
                      color: Colors.black.withOpacity(0.5),
                      child: const Center(
                        child: CircularProgressIndicator(color: AppColors.primary),
                      ),
                    ),
                ],
              ),
      ),
    );
  }

  Widget _buildReceiptHeaderCard(BuildContext context) {
    final vehicle = widget.tripData != null 
        ? (widget.tripData!['vehicle'] != null 
            ? (widget.tripData!['vehicle']['registrationNumber'] ?? widget.tripData!['vehicle']['vehicleNumber']) 
            : 'Assigned Vehicle')
        : 'Assigned Vehicle';

    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'TRIP ID',
                    style: GoogleFonts.poppins(
                      color: AppColors.secondaryText,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    widget.tripId,
                    style: GoogleFonts.poppins(
                      color: AppColors.primaryText,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.success.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(AppRadius.round),
                ),
                child: Text(
                  'Verified',
                  style: GoogleFonts.poppins(
                    color: AppColors.success,
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                  ),
                ),
              ),
            ],
          ),
          const Divider(height: 24, color: AppColors.divider),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildInfoRow('RECEIPT NO', widget.receiptNumber),
              _buildInfoRow('VEHICLE', vehicle.toString(), alignRight: true),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTollTransactionCard(BuildContext context, dynamic toll) {
    final name = toll['tollPlazaName'] ?? 'General Toll Plaza';
    final amount = toll['amountPaid'] ?? toll['amount'] ?? 0;
    final dateStr = toll['dateTime'] != null ? toll['dateTime'].toString().split('T')[0] : 'Today';
    final timeStr = toll['dateTime'] != null 
        ? (toll['dateTime'].toString().contains('T') 
            ? toll['dateTime'].toString().split('T')[1].substring(0, 5) 
            : 'Recently') 
        : 'Recently';
    final method = toll['paymentMethod'] ?? 'FASTag';

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 6.0),
      child: CustomCard(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                  child: const Icon(Icons.toll, color: Colors.blue, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: GoogleFonts.poppins(
                          color: AppColors.primaryText,
                          fontWeight: FontWeight.bold,
                          fontSize: 13.5,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Date: $dateStr • Time: $timeStr',
                        style: GoogleFonts.nunito(
                          color: AppColors.secondaryText,
                          fontSize: 11.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const Divider(height: 24, color: AppColors.divider),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Amount Paid',
                  style: GoogleFonts.nunito(
                    color: AppColors.secondaryText,
                    fontSize: 12.5,
                  ),
                ),
                Text(
                  '₹$amount',
                  style: GoogleFonts.poppins(
                    color: AppColors.secondary,
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Payment Mode',
                  style: GoogleFonts.nunito(
                    color: AppColors.secondaryText,
                    fontSize: 12.5,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: method == 'FASTag' ? Colors.green.withOpacity(0.1) : Colors.orange.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    method,
                    style: GoogleFonts.poppins(
                      color: method == 'FASTag' ? Colors.green : Colors.orange,
                      fontWeight: FontWeight.bold,
                      fontSize: 11,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyTollsCard() {
    return CustomCard(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.warning_amber_rounded,
            size: 48,
            color: Colors.orange,
          ),
          const SizedBox(height: 12),
          Text(
            'No toll transactions found',
            style: GoogleFonts.poppins(
              fontSize: 14.5,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryText,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'No automated FASTag logs were detected for this trip. If you paid cash or crossed tolls manually, please upload the receipt details below.',
            textAlign: TextAlign.center,
            style: GoogleFonts.nunito(
              fontSize: 12,
              color: AppColors.secondaryText,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildManualUploadForm() {
    return Form(
      key: _formKey,
      child: CustomCard(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Manual Toll Receipt Form',
                  style: GoogleFonts.poppins(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryText,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: AppColors.error, size: 20),
                  onPressed: () {
                    setState(() {
                      _showManualForm = false;
                    });
                  },
                ),
              ],
            ),
            const SizedBox(height: 12),
            _buildInputField(
              controller: _plazaController,
              label: 'Toll Plaza Name',
              hint: 'e.g. vasad Toll Plaza',
              validator: (val) => val == null || val.trim().isEmpty ? 'Plaza Name is required' : null,
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildInputField(
                    controller: _amountController,
                    label: 'Amount Paid (₹)',
                    hint: 'e.g. 180',
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    validator: (val) {
                      if (val == null || val.trim().isEmpty) return 'Required';
                      if (double.tryParse(val) == null || double.parse(val) <= 0) return 'Invalid';
                      return null;
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildInputField(
                    controller: _dateTimeController,
                    label: 'Crossed Date/Time',
                    hint: 'YYYY-MM-DD HH:MM',
                    validator: (val) => val == null || val.trim().isEmpty ? 'Date is required' : null,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              'RECEIPT IMAGES',
              style: GoogleFonts.poppins(
                fontSize: 10.5,
                fontWeight: FontWeight.bold,
                color: AppColors.secondaryText,
              ),
            ),
            const SizedBox(height: 8),
            InkWell(
              onTap: _pickImage,
              child: Container(
                height: 80,
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.divider),
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  color: Colors.grey.shade50,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.add_photo_alternate_outlined, color: AppColors.secondary, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      'Attach Receipt Photo',
                      style: GoogleFonts.nunito(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.secondary),
                    ),
                  ],
                ),
              ),
            ),
            if (_attachedFiles.isNotEmpty) ...[
              const SizedBox(height: 12),
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _attachedFiles.length,
                itemBuilder: (ctx, index) {
                  return Container(
                    margin: const EdgeInsets.symmetric(vertical: 4.0),
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.divider),
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.receipt_long_outlined, color: Colors.blue, size: 24),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            _attachedFileNames[index],
                            style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: AppColors.error, size: 16),
                          onPressed: () {
                            setState(() {
                              _attachedFiles.removeAt(index);
                              _attachedFileNames.removeAt(index);
                            });
                          },
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isSubmitting ? null : _handleManualSubmit,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                minimumSize: const Size(double.infinity, 48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.sm)),
              ),
              child: Text(
                _isSubmitting ? 'UPLOADING...' : 'SUBMIT MANUAL RECEIPT',
                style: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String label,
    required String hint,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: GoogleFonts.poppins(
            fontSize: 10.5,
            fontWeight: FontWeight.bold,
            color: AppColors.secondaryText,
          ),
        ),
        const SizedBox(height: 4),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          validator: validator,
          style: GoogleFonts.poppins(fontSize: 12.5, fontWeight: FontWeight.bold, color: AppColors.primaryText),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: GoogleFonts.poppins(fontSize: 12.5, color: AppColors.secondaryText),
            isDense: true,
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            filled: true,
            fillColor: Colors.white,
            enabledBorder: OutlineInputBorder(borderSide: const BorderSide(color: AppColors.divider)),
            focusedBorder: OutlineInputBorder(borderSide: const BorderSide(color: AppColors.secondary)),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value, {bool alignRight = false}) {
    return Column(
      crossAxisAlignment: alignRight ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppColors.secondaryText,
            fontSize: 9,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            color: AppColors.primaryText,
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
      ],
    );
  }
}
