import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../constants/app_colors.dart';
import '../constants/app_radius.dart';
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
    _checkInitialStatuses();
  }

  void _checkInitialStatuses() {
    if (widget.tripData != null) {
      final podStatus = (widget.tripData!['podStatus'] ?? '').toString().toLowerCase();
      if (['uploaded', 'pending', 'approved'].contains(podStatus) || widget.tripData!['proofOfDelivery'] != null) {
        _podUploaded = true;
        _podPathOrUrl = widget.tripData!['proofOfDelivery']?['url'] ?? widget.tripData!['proofOfDelivery']?['deliveryPhotoUrl'] ?? '';
      }

      final wbStatus = (widget.tripData!['weighbridgeStatus'] ?? '').toString().toLowerCase();
      if (['uploaded', 'pending', 'approved'].contains(wbStatus) || widget.tripData!['weighbridgeSlip'] != null) {
        _wbUploaded = true;
        _wbPathOrUrl = widget.tripData!['weighbridgeSlip']?['documentUrl'] ?? '';
      }
    }
  }

  void _showImageSourcePicker({required Function(ImageSource source) onSelected}) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      backgroundColor: AppColors.surface,
      builder: (context) {
        return SafeArea(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: AppColors.divider,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                Text(
                  'Select Document Source',
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryText,
                  ),
                ),
                const SizedBox(height: 16),
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFF6A00).withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.camera_alt_rounded, color: Color(0xFFFF6A00)),
                  ),
                  title: Text(
                    'Camera',
                    style: GoogleFonts.poppins(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                  subtitle: Text(
                    'Take a photo of the document using camera',
                    style: GoogleFonts.nunito(fontSize: 12, color: AppColors.secondaryText),
                  ),
                  onTap: () {
                    Navigator.pop(context);
                    onSelected(ImageSource.camera);
                  },
                ),
                const Divider(height: 1),
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.secondary.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.photo_library_rounded, color: AppColors.secondary),
                  ),
                  title: Text(
                    'Gallery',
                    style: GoogleFonts.poppins(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                  subtitle: Text(
                    'Choose an existing photo from gallery',
                    style: GoogleFonts.nunito(fontSize: 12, color: AppColors.secondaryText),
                  ),
                  onTap: () {
                    Navigator.pop(context);
                    onSelected(ImageSource.gallery);
                  },
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: () => Navigator.pop(context),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 44),
                    side: const BorderSide(color: AppColors.divider),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: Text(
                    'Cancel',
                    style: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: AppColors.secondaryText),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _pickAndUploadPod(ImageSource source) async {
    final picker = ImagePicker();
    try {
      final photo = await picker.pickImage(source: source, imageQuality: 85, maxWidth: 1600);
      if (photo == null) return;

      setState(() {
        _isUploadingPod = true;
      });

      final cleanId = widget.tripId.replaceAll('#', '').trim();
      final res = await ApiService.uploadProofOfDelivery(
        tripId: cleanId,
        customerName: widget.tripData?['deliveryAddress']?['contactPerson'] ?? 'Customer Receiver',
        receiverName: 'Verified Receiver',
        fileBytes: photo.path,
        fileName: photo.name,
      );

      if (res != null) {
        setState(() {
          _podUploaded = true;
          _podPathOrUrl = photo.path;
        });
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

      final cleanId = widget.tripId.replaceAll('#', '').trim();
      final res = await ApiService.uploadWeighbridgeSlip(
        tripId: cleanId,
        grossWeight: 25000,
        tareWeight: 10000,
        netWeight: 15000,
        location: widget.tripData?['endLocation'] ?? 'Highway Weighbridge Station',
        fileBytes: photo.path,
        fileName: photo.name,
      );

      if (res != null) {
        setState(() {
          _wbUploaded = true;
          _wbPathOrUrl = photo.path;
        });
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
              child: pathOrUrl.startsWith('http')
                  ? Image.network(pathOrUrl, fit: BoxFit.contain)
                  : (File(pathOrUrl).existsSync()
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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        child: Container(
          constraints: const BoxConstraints(maxWidth: 500),
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
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primaryText,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Both documents are mandatory for trip completion',
                          style: GoogleFonts.nunito(
                            fontSize: 12,
                            color: AppColors.secondaryText,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(height: 1, color: AppColors.divider),
              const SizedBox(height: 16),

              // Section 1: Proof of Delivery (POD)
              _buildDocumentSectionCard(
                title: 'Proof of Delivery (POD)',
                subtitle: 'Delivery receipt or photo signed by receiver',
                icon: Icons.assignment_turned_in_rounded,
                isUploading: _isUploadingPod,
                isUploaded: _podUploaded,
                pathOrUrl: _podPathOrUrl,
                onUploadTap: () {
                  _showImageSourcePicker(
                    onSelected: (source) => _pickAndUploadPod(source),
                  );
                },
              ),
              const SizedBox(height: 12),

              // Section 2: Weighbridge Slip
              _buildDocumentSectionCard(
                title: 'Weighbridge Slip',
                subtitle: 'Weight measurement slip from weighbridge station',
                icon: Icons.scale_rounded,
                isUploading: _isUploadingWb,
                isUploaded: _wbUploaded,
                pathOrUrl: _wbPathOrUrl,
                onUploadTap: () {
                  _showImageSourcePicker(
                    onSelected: (source) => _pickAndUploadWeighbridge(source),
                  );
                },
              ),
              const SizedBox(height: 24),

              // Action Submit Button
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
    );
  }

  Widget _buildDocumentSectionCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required bool isUploading,
    required bool isUploaded,
    required String pathOrUrl,
    required VoidCallback onUploadTap,
  }) {
    return Container(
      padding: const EdgeInsets.all(14.0),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(
          color: isUploaded ? AppColors.success.withValues(alpha: 0.5) : AppColors.divider,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: isUploaded
                      ? AppColors.success.withValues(alpha: 0.1)
                      : const Color(0xFFFF6A00).withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icon,
                  color: isUploaded ? AppColors.success : const Color(0xFFFF6A00),
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.poppins(
                        fontSize: 13.5,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryText,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: GoogleFonts.nunito(
                        fontSize: 11,
                        color: AppColors.secondaryText,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              // Status Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isUploaded
                      ? AppColors.success.withValues(alpha: 0.1)
                      : const Color(0xFFFFF3E0),
                  borderRadius: BorderRadius.circular(AppRadius.round),
                ),
                child: Text(
                  isUploaded ? '✓ Uploaded' : 'Not Uploaded',
                  style: GoogleFonts.poppins(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: isUploaded ? AppColors.success : const Color(0xFFE65100),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Upload or View/Replace Controls
          if (isUploading)
            const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 6.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFFF6A00))),
                    SizedBox(width: 10),
                    Text('Uploading document...', style: TextStyle(fontSize: 12, color: AppColors.secondaryText)),
                  ],
                ),
              ),
            )
          else if (!isUploaded)
            ElevatedButton.icon(
              onPressed: onUploadTap,
              icon: const Icon(Icons.upload_file_rounded, size: 16, color: Colors.white),
              label: Text(
                'Upload $title',
                style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFFF6A00),
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 40),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
            )
          else
            Row(
              children: [
                if (pathOrUrl.isNotEmpty) ...[
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _showDocumentPreview(title, pathOrUrl),
                      icon: const Icon(Icons.visibility_outlined, size: 16, color: AppColors.secondary),
                      label: Text(
                        'View',
                        style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.secondary),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.secondary),
                        minimumSize: const Size(0, 38),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                ],
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: onUploadTap,
                    icon: const Icon(Icons.refresh_rounded, size: 16, color: Colors.white),
                    label: Text(
                      'Replace',
                      style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      minimumSize: const Size(0, 38),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }
}
