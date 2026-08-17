import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme/app_colors.dart';

class DocumentPreviewDialog extends StatelessWidget {
  final String title;
  final String documentUrl;
  final String? documentName;

  const DocumentPreviewDialog({
    super.key,
    required this.title,
    required this.documentUrl,
    this.documentName,
  });

  static Future<void> open(
    BuildContext context, {
    required String title,
    required String documentUrl,
    String? documentName,
  }) async {
    final trimmed = documentUrl.trim();
    if (trimmed.isEmpty) return;

    final isImage = _isImageUrl(trimmed);

    if (isImage) {
      await showDialog(
        context: context,
        builder: (ctx) => DocumentPreviewDialog(
          title: title,
          documentUrl: trimmed,
          documentName: documentName,
        ),
      );
    } else {
      await launchDocumentUrl(context, trimmed, title: title);
    }
  }

  static bool _isImageUrl(String url) {
    final lower = url.toLowerCase();
    return lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.png') ||
        lower.endsWith('.webp') ||
        lower.endsWith('.gif') ||
        lower.endsWith('.bmp') ||
        lower.startsWith('data:image/') ||
        lower.contains('/image/upload/') ||
        lower.contains('fleet_pod') ||
        lower.contains('fleet_weighbridge') ||
        lower.contains('fleet_fuel_receipts') ||
        (lower.contains('cloudinary.com') && !lower.endsWith('.pdf'));
  }

  static Future<void> launchDocumentUrl(
    BuildContext context,
    String urlString, {
    String? title,
  }) async {
    final trimmed = urlString.trim();
    if (trimmed.isEmpty) return;

    try {
      final uri = Uri.parse(trimmed);
      bool launched = false;

      // Attempt 1: In-App Browser View
      try {
        launched = await launchUrl(uri, mode: LaunchMode.inAppBrowserView);
      } catch (e) {
        debugPrint('[DocumentPreview] InAppBrowserView error: $e');
      }

      // Attempt 2: External Application
      if (!launched) {
        try {
          launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
        } catch (e) {
          debugPrint('[DocumentPreview] ExternalApplication error: $e');
        }
      }

      // Attempt 3: Platform Default
      if (!launched) {
        try {
          launched = await launchUrl(uri);
        } catch (e) {
          debugPrint('[DocumentPreview] PlatformDefault error: $e');
        }
      }

      // Fallback: If URL launcher couldn't open, show image modal dialog
      if (!launched && context.mounted) {
        await showDialog(
          context: context,
          builder: (ctx) => DocumentPreviewDialog(
            title: title ?? 'Document Preview',
            documentUrl: trimmed,
          ),
        );
      }
    } catch (e) {
      debugPrint('[DocumentPreview] Parse error: $e');
      if (context.mounted) {
        await showDialog(
          context: context,
          builder: (ctx) => DocumentPreviewDialog(
            title: title ?? 'Document Preview',
            documentUrl: trimmed,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.black.withValues(alpha: 0.94),
      insetPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 24),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Top Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: Colors.white.withValues(alpha: 0.08),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        const Icon(Icons.photo_size_select_actual_outlined, color: AppColors.secondary, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            title,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.open_in_browser, color: Colors.white70, size: 22),
                        tooltip: 'Open in Browser',
                        onPressed: () {
                          launchUrl(Uri.parse(documentUrl), mode: LaunchMode.externalApplication);
                        },
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white, size: 22),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Zoomable Interactive Viewer
            Flexible(
              child: Container(
                constraints: const BoxConstraints(maxHeight: 520),
                color: Colors.black,
                child: InteractiveViewer(
                  panEnabled: true,
                  minScale: 0.8,
                  maxScale: 4.5,
                  child: Center(
                    child: Image.network(
                      documentUrl,
                      fit: BoxFit.contain,
                      loadingBuilder: (context, child, progress) {
                        if (progress == null) return child;
                        return Container(
                          height: 320,
                          alignment: Alignment.center,
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              CircularProgressIndicator(
                                value: progress.expectedTotalBytes != null
                                    ? progress.cumulativeBytesLoaded / progress.expectedTotalBytes!
                                    : null,
                                color: AppColors.secondary,
                              ),
                              const SizedBox(height: 12),
                              const Text(
                                'Loading high-res document...',
                                style: TextStyle(color: Colors.white70, fontSize: 12),
                              ),
                            ],
                          ),
                        );
                      },
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          height: 280,
                          padding: const EdgeInsets.all(24),
                          alignment: Alignment.center,
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.broken_image_outlined, size: 48, color: Colors.white54),
                              const SizedBox(height: 12),
                              const Text(
                                'Could not preview image directly.',
                                style: TextStyle(color: Colors.white70, fontSize: 13),
                              ),
                              const SizedBox(height: 16),
                              ElevatedButton.icon(
                                onPressed: () {
                                  launchUrl(Uri.parse(documentUrl), mode: LaunchMode.externalApplication);
                                },
                                icon: const Icon(Icons.open_in_new, size: 16),
                                label: const Text('Open in Browser'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.secondary,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ),
              ),
            ),

            // Bottom Info & Actions
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              color: Colors.white.withValues(alpha: 0.05),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Pinch to zoom in / out',
                    style: TextStyle(color: Colors.white54, fontSize: 11),
                  ),
                  TextButton.icon(
                    onPressed: () {
                      launchUrl(Uri.parse(documentUrl), mode: LaunchMode.externalApplication);
                    },
                    icon: const Icon(Icons.launch, size: 14, color: AppColors.secondary),
                    label: const Text(
                      'External Link',
                      style: TextStyle(color: AppColors.secondary, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
