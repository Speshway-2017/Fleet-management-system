import 'dart:io' show File;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../constants/app_colors.dart';
import '../services/api_service.dart';

class UploadRequiredDocumentsDialog extends StatefulWidget {
  final String tripId;
  final Map<String, dynamic>? tripData;

  const UploadRequiredDocumentsDialog({
    super.key,
    required this.tripId,
    this.tripData,
  });

  static Future<bool?> show(BuildContext context, {required String tripId, Map<String, dynamic>? tripData}) {
    return showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (context) => UploadRequiredDocumentsDialog(
        tripId: tripId,
        tripData: tripData,
      ),
    );
  }

  @override
  State<UploadRequiredDocumentsDialog> createState() => _UploadRequiredDocumentsDialogState();
}

class _UploadRequiredDocumentsDialogState extends State<UploadRequiredDocumentsDialog> {
  bool _isLoadingStatus = true;
  bool _isUploadingPod = false;
  bool _podUploaded = false;
  String _podPathOrUrl = '';

  bool _isUploadingWb = false;
  bool _wbUploaded = false;
  String _wbPathOrUrl = '';

  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _fetchFreshStatusFromBackend();
  }

  Future<void> _fetchFreshStatusFromBackend() async {
    if (!mounted) return;
    setState(() {
      _isLoadingStatus = true;
    });

    try {
      final cleanId = widget.tripId.replaceAll('#', '').trim();
      final res = await ApiService.getTripDetails(cleanId);
      final tripMap = (res != null && res['data'] is Map<String, dynamic>)
          ? res['data'] as Map<String, dynamic>
          : widget.tripData;

      if (tripMap != null) {
        // Extract POD fields
        final podObj = tripMap['proofOfDelivery'] is Map<String, dynamic>
            ? tripMap['proofOfDelivery'] as Map<String, dynamic>
            : {};
        final podDetails = tripMap['podDetails'] is Map<String, dynamic>
            ? tripMap['podDetails'] as Map<String, dynamic>
            : {};

        final podStatusApi = (tripMap['podStatus'] ?? podObj['status'] ?? podDetails['status'] ?? '').toString();
        final podUrlApi = (tripMap['podUrl'] ?? podObj['url'] ?? podObj['deliveryPhotoUrl'] ?? podDetails['podDocumentUrl'] ?? '').toString();
        final podUploadedAtApi = podObj['uploadedAt'] ?? podDetails['deliveryDate'];

        _podUploaded = _computeIsUploaded(
          status: podStatusApi,
          url: podUrlApi,
          uploadedAt: podUploadedAtApi,
          localPath: _podPathOrUrl,
        );
        if (_podPathOrUrl.isEmpty && podUrlApi.isNotEmpty) {
          _podPathOrUrl = podUrlApi;
        }

        // Extract Weighbridge fields
        final wbObj = tripMap['weighbridgeSlip'] is Map<String, dynamic>
            ? tripMap['weighbridgeSlip'] as Map<String, dynamic>
            : {};
        final wbDetails = tripMap['weighbridgeDetails'] is Map<String, dynamic>
            ? tripMap['weighbridgeDetails'] as Map<String, dynamic>
            : {};

        final wbStatusApi = (tripMap['weighbridgeStatus'] ?? wbObj['status'] ?? wbDetails['status'] ?? '').toString();
        final wbUrlApi = (tripMap['weighbridgeUrl'] ?? wbObj['documentUrl'] ?? wbObj['url'] ?? wbDetails['documentUrl'] ?? '').toString();
        final wbUploadedAtApi = wbObj['uploadedAt'];

        _wbUploaded = _computeIsUploaded(
          status: wbStatusApi,
          url: wbUrlApi,
          uploadedAt: wbUploadedAtApi,
          localPath: _wbPathOrUrl,
        );
        if (_wbPathOrUrl.isEmpty && wbUrlApi.isNotEmpty) {
          _wbPathOrUrl = wbUrlApi;
        }

        debugPrint('================= TRIP DOCUMENTS DEBUG LOGS =================');
        debugPrint('POD status from API: "$podStatusApi"');
        debugPrint('POD URL: "$podUrlApi"');
        debugPrint('Final computed POD isUploaded: $_podUploaded');
        debugPrint('Weighbridge status from API: "$wbStatusApi"');
        debugPrint('Weighbridge URL: "$wbUrlApi"');
        debugPrint('Final computed Weighbridge isUploaded: $_wbUploaded');
        debugPrint('===========================================================');
      }
    } catch (e) {
      debugPrint('Error fetching fresh trip status in UploadRequiredDocumentsDialog: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoadingStatus = false;
        });
      }
    }
  }

  bool _computeIsUploaded({
    required String status,
    required String url,
    dynamic uploadedAt,
    required String localPath,
  }) {
    if (!kIsWeb && localPath.trim().isNotEmpty && File(localPath).existsSync()) {
      return true;
    }

    final cleanUrl = url.trim();
    final hasUrl = cleanUrl.isNotEmpty &&
        (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('data:image'));

    final hasUploadedAt = uploadedAt != null &&
        uploadedAt.toString().trim().isNotEmpty &&
        uploadedAt.toString().trim() != 'null';

    final cleanStatus = status.trim().toLowerCase();
    final isStatusUploaded = (cleanStatus == 'uploaded' || cleanStatus == 'approved' || cleanStatus == 'pending') &&
        cleanStatus != 'not uploaded';

    return (hasUrl || hasUploadedAt || (isStatusUploaded && hasUrl));
  }



  Future<void> _pickAndUploadPod(ImageSource source) async {
    final picker = ImagePicker();
    try {
      final photo = await picker.pickImage(source: source, imageQuality: 85, maxWidth: 1600);
      if (photo == null) return;

      setState(() {
        _isUploadingPod = true;
      });

      final bytes = await photo.readAsBytes();
      final uploadData = kIsWeb ? bytes : photo.path;

      final cleanId = widget.tripId.replaceAll('#', '').trim();
      final res = await ApiService.uploadProofOfDelivery(
        tripId: cleanId,
        customerName: widget.tripData?['deliveryAddress']?['contactPerson'] ?? 'Customer Receiver',
        receiverName: 'Verified Receiver',
        fileBytes: uploadData,
        fileName: photo.name,
      );

      if (res != null) {
        setState(() {
          _podUploaded = true;
          _podPathOrUrl = photo.path;
        });
        await _fetchFreshStatusFromBackend();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✅ Proof of Delivery (POD) uploaded successfully!'),
              backgroundColor: AppColors.success,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('POD upload failed: ${e.toString().replaceAll('Exception: ', '')}'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isUploadingPod = false;
        });
      }
    }
  }

  Future<void> _pickAndUploadWeighbridge(ImageSource source) async {
    final picker = ImagePicker();
    try {
      final photo = await picker.pickImage(source: source, imageQuality: 85, maxWidth: 1600);
      if (photo == null) return;

      setState(() {
        _isUploadingWb = true;
      });

      final bytes = await photo.readAsBytes();
      final uploadData = kIsWeb ? bytes : photo.path;

      final cleanId = widget.tripId.replaceAll('#', '').trim();
      final res = await ApiService.uploadWeighbridgeSlip(
        tripId: cleanId,
        grossWeight: 25000,
        tareWeight: 10000,
        netWeight: 15000,
        location: widget.tripData?['endLocation'] ?? 'Highway Weighbridge Station',
        fileBytes: uploadData,
        fileName: photo.name,
      );

      if (res != null) {
        setState(() {
          _wbUploaded = true;
          _wbPathOrUrl = photo.path;
        });
        await _fetchFreshStatusFromBackend();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✅ Weighbridge Slip uploaded successfully!'),
              backgroundColor: AppColors.success,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Weighbridge upload failed: ${e.toString().replaceAll('Exception: ', '')}'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isUploadingWb = false;
        });
      }
    }
  }

  void _showDocumentPreview(String docName, String pathOrUrl) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AppBar(
              title: Text(docName, style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold)),
              automaticallyImplyLeading: false,
              actions: [
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
              ],
              backgroundColor: AppColors.surface,
              foregroundColor: AppColors.primaryText,
              elevation: 0,
            ),
            Container(
              constraints: const BoxConstraints(maxHeight: 380),
              padding: const EdgeInsets.all(16),
              child: (pathOrUrl.startsWith('http') || pathOrUrl.startsWith('blob:'))
                  ? Image.network(pathOrUrl, fit: BoxFit.contain)
                  : (!kIsWeb && File(pathOrUrl).existsSync()
                      ? Image.file(File(pathOrUrl), fit: BoxFit.contain)
                      : const Center(
                          child: Icon(Icons.insert_drive_file_rounded, size: 64, color: AppColors.primary),
                        )),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleSubmitDocuments() async {
    if (!_podUploaded) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please upload Proof of Delivery.'),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }
    if (!_wbUploaded) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please upload Weighbridge Slip.'),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final cleanId = widget.tripId.replaceAll('#', '').trim();
      await ApiService.updateTripStatus(cleanId, 'Waiting for Manager Approval');

      if (mounted) {
        Navigator.pop(context, true);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Trip documents submitted successfully. Waiting for Manager Approval.'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Submission failed: ${e.toString().replaceAll('Exception: ', '')}'),
            backgroundColor: AppColors.error,
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
    final canSubmit = _podUploaded && _wbUploaded;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        if (!_podUploaded) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Please upload Proof of Delivery.'),
              backgroundColor: AppColors.error,
              behavior: SnackBarBehavior.floating,
            ),
          );
          return;
        }
        if (!_wbUploaded) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Please upload Weighbridge Slip.'),
              backgroundColor: AppColors.error,
              behavior: SnackBarBehavior.floating,
            ),
          );
          return;
        }
      },
      child: Dialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        child: SafeArea(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: 500,
              maxHeight: MediaQuery.of(context).size.height * 0.85,
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Header Title
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Upload Required Trip Documents',
                              style: GoogleFonts.poppins(
                                fontSize: 16.5,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primaryText,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Both documents are mandatory for trip completion',
                              style: GoogleFonts.nunito(
                                fontSize: 11.5,
                                color: AppColors.secondaryText,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Divider(height: 1, color: AppColors.divider),
                  const SizedBox(height: 12),

                  // Scrollable Body
                  Flexible(
                    child: SingleChildScrollView(
                      physics: const BouncingScrollPhysics(),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            if (_isLoadingStatus)
                              const Padding(
                                padding: EdgeInsets.symmetric(vertical: 24.0),
                                child: Center(
                                  child: Column(
                                    children: [
                                      CircularProgressIndicator(color: Color(0xFFFF6A00), strokeWidth: 2.5),
                                      SizedBox(height: 12),
                                      Text(
                                        'Checking document statuses...',
                                        style: TextStyle(fontSize: 12, color: AppColors.secondaryText),
                                      ),
                                    ],
                                  ),
                                ),
                              )
                            else ...[
                              // Section 1: Proof of Delivery (POD)
                              _buildFuelStyleUploadSection(
                                docTitle: 'Proof of Delivery (POD)',
                                docSubtitle: 'Delivery receipt or photo signed by receiver',
                                docIcon: Icons.assignment_turned_in_rounded,
                                isUploading: _isUploadingPod,
                                isUploaded: _podUploaded,
                                pathOrUrl: _podPathOrUrl,
                                onPickCamera: () => _pickAndUploadPod(ImageSource.camera),
                                onPickGallery: () => _pickAndUploadPod(ImageSource.gallery),
                                onViewTap: () => _showDocumentPreview('Proof of Delivery (POD)', _podPathOrUrl),
                              ),
                              const SizedBox(height: 20),

                              // Section 2: Weighbridge Slip
                              _buildFuelStyleUploadSection(
                                docTitle: 'Weighbridge Slip',
                                docSubtitle: 'Weight measurement slip from weighbridge station',
                                docIcon: Icons.scale_rounded,
                                isUploading: _isUploadingWb,
                                isUploaded: _wbUploaded,
                                pathOrUrl: _wbPathOrUrl,
                                onPickCamera: () => _pickAndUploadWeighbridge(ImageSource.camera),
                                onPickGallery: () => _pickAndUploadWeighbridge(ImageSource.gallery),
                                onViewTap: () => _showDocumentPreview('Weighbridge Slip', _wbPathOrUrl),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Sticky Action Submit Button
                  ElevatedButton.icon(
                    onPressed: (_isSubmitting || !canSubmit) ? null : _handleSubmitDocuments,
                    icon: Icon(
                      canSubmit ? Icons.check_circle_rounded : Icons.lock_rounded,
                      color: Colors.white,
                      size: 20,
                    ),
                    label: _isSubmitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : Text(
                            'Submit Documents',
                            style: GoogleFonts.poppins(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: canSubmit ? const Color(0xFFFF6A00) : const Color(0xFF8E9CAE),
                      disabledBackgroundColor: const Color(0xFF8E9CAE),
                      disabledForegroundColor: Colors.white70,
                      minimumSize: const Size(double.infinity, 48),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      elevation: canSubmit ? 2 : 0,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFuelStyleUploadSection({
    required String docTitle,
    required String docSubtitle,
    required IconData docIcon,
    required bool isUploading,
    required bool isUploaded,
    required String pathOrUrl,
    required VoidCallback onPickCamera,
    required VoidCallback onPickGallery,
    required VoidCallback onViewTap,
  }) {
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const borderGray = Color(0xFFE2E8F0);
    const primaryDark = Color(0xFF101C2C);

    String fileName = isUploaded ? pathOrUrl.split('/').last.split('?').first : '';
    if (fileName.isEmpty) {
      fileName = '${docTitle.toLowerCase().replaceAll(' ', '_')}.jpg';
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              docTitle,
              style: GoogleFonts.poppins(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: AppColors.primaryText,
              ),
            ),
            if (isUploaded)
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
                      '✓ Uploaded',
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
        const SizedBox(height: 8.0),

        if (isUploading)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 24.0, horizontal: 16.0),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(16.0),
              border: Border.all(color: const Color(0xFFCBD5E1), width: 1.2),
            ),
            child: Column(
              children: [
                const CircularProgressIndicator(color: Color(0xFFFF6A00), strokeWidth: 2.5),
                const SizedBox(height: 12),
                Text(
                  'Uploading $docTitle...',
                  style: GoogleFonts.nunito(fontSize: 12, color: AppColors.secondaryText, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          )
        else if (!isUploaded)
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

                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: onPickCamera,
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
                        onPressed: onPickGallery,
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
          )
        else
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
                    Container(
                      width: 54,
                      height: 54,
                      decoration: BoxDecoration(
                        color: const Color(0xFF101C2C),
                        borderRadius: BorderRadius.circular(10.0),
                      ),
                      child: Icon(
                        docIcon,
                        color: const Color(0xFFFF7A1A),
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12.0),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            fileName,
                            style: GoogleFonts.poppins(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: textPrimary,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2.0),
                          Text(
                            'Document attached successfully',
                            style: GoogleFonts.nunito(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF15803D),
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
                    if (pathOrUrl.isNotEmpty) ...[
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: onViewTap,
                          icon: const Icon(Icons.visibility_outlined, size: 16),
                          label: const Text('View'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.secondary,
                            side: const BorderSide(color: AppColors.secondary),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8.0),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 10.0),
                            textStyle: GoogleFonts.poppins(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10.0),
                    ],
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: onPickCamera,
                        icon: const Icon(Icons.refresh_rounded, size: 16, color: Colors.white),
                        label: const Text('Replace'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8.0),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 10.0),
                          textStyle: GoogleFonts.poppins(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
      ],
    );
  }
}
