import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_radius.dart';
import '../constants/app_spacing.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';

class UpdateTripStatusScreen extends StatefulWidget {
  final String tripId;

  const UpdateTripStatusScreen({
    super.key,
    required this.tripId,
  });

  @override
  State<UpdateTripStatusScreen> createState() => _UpdateTripStatusScreenState();
}

class _UpdateTripStatusScreenState extends State<UpdateTripStatusScreen> {
  // Currently selected status (default to 'En Route')
  String _selectedStatus = 'En Route';

  // Odometer and Remarks input controllers
  final TextEditingController _odometerController = TextEditingController();
  final TextEditingController _remarksController = TextEditingController();

  // Final Checklist state
  bool _vehicleConditionChecked = false;
  bool _documentsVerified = false;
  bool _gpsLocationConfirmed = false;

  // Photo attachments state
  String? _attachedPhotoPath;

  @override
  void dispose() {
    _odometerController.dispose();
    _remarksController.dispose();
    super.dispose();
  }

  // Action status definitions
  final List<Map<String, dynamic>> _statusItems = [
    {
      'label': 'Reached Pickup',
      'icon': Icons.location_on,
    },
    {
      'label': 'Goods Loaded',
      'icon': Icons.inventory_2_outlined,
    },
    {
      'label': 'Trip Started',
      'icon': Icons.local_shipping_outlined,
    },
    {
      'label': 'En Route',
      'icon': Icons.local_shipping,
    },
    {
      'label': 'Reached Destination',
      'icon': Icons.flag_outlined,
    },
    {
      'label': 'Goods Unloaded',
      'icon': Icons.outbox,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        centerTitle: false,
        title: Text(
          'Update Trip status',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: AppColors.background,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Top summary card
              _buildTopSummaryCard(context),
              AppSpacing.verticalSm,

              // 2. Select New Status Title
              _buildSectionTitle('Select New Status'),

              // 3. Status selection grid
              _buildStatusGrid(context),
              const SizedBox(height: 12),

              // 4. Trip Completed full-width option
              _buildTripCompletedOption(context),
              AppSpacing.verticalSm,

              // 5. Current Location Card
              _buildLocationCard(context),
              AppSpacing.verticalSm,

              // 6. Odometer Reading Field
              _buildOdometerField(context),
              AppSpacing.verticalSm,

              // 7. Remarks Field
              _buildRemarksField(context),
              AppSpacing.verticalSm,

              // 8. Attach Photo Proof Section
              _buildSectionTitle('Attach Photo Proof'),
              _buildPhotoProofSection(context),
              AppSpacing.verticalSm,

              // 9. Final Checklist
              _buildChecklistCard(context),
              AppSpacing.verticalLg,

              // 10. Footer Action Buttons
              _buildFooterButtons(context),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4.0, top: 8.0, bottom: 8.0),
      child: Text(
        title,
        style: const TextStyle(
          color: AppColors.primaryText,
          fontWeight: FontWeight.bold,
          fontSize: 14,
        ),
      ),
    );
  }

  // 1. Top summary card
  Widget _buildTopSummaryCard(BuildContext context) {
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
                    style: TextStyle(
                      color: AppColors.secondaryText,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    widget.tripId,
                    style: TextStyle(
                      color: AppColors.primaryText,
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.divider,
                  borderRadius: BorderRadius.circular(AppRadius.round),
                ),
                child: const Text(
                  'In Progress',
                  style: TextStyle(
                    color: AppColors.primaryText,
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(
                Icons.local_shipping,
                color: AppColors.secondary,
                size: 20,
              ),
              AppSpacing.horizontalSm,
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Vehicle Number',
                    style: TextStyle(
                      color: AppColors.secondaryText,
                      fontSize: 10,
                    ),
                  ),
                  const Text(
                    'TS09AB1234',
                    style: TextStyle(
                      color: AppColors.primaryText,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 3. Status selection grid
  Widget _buildStatusGrid(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _statusItems.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 2.1,
      ),
      itemBuilder: (context, index) {
        final item = _statusItems[index];
        final label = item['label'] as String;
        final icon = item['icon'] as IconData;
        final isSelected = _selectedStatus == label;

        return InkWell(
          onTap: () {
            setState(() {
              _selectedStatus = label;
            });
          },
          borderRadius: BorderRadius.circular(AppRadius.md),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            decoration: BoxDecoration(
              color: isSelected ? const Color(0xFFFFF3E0) : AppColors.surface,
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(
                color: isSelected ? AppColors.secondary : AppColors.divider,
                width: isSelected ? 1.5 : 1.0,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  icon,
                  color: AppColors.secondary,
                  size: 20,
                ),
                const SizedBox(height: 6),
                Text(
                  label,
                  style: TextStyle(
                    color: AppColors.primaryText,
                    fontSize: 12,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // 4. Trip Completed full-width option
  Widget _buildTripCompletedOption(BuildContext context) {
    final isSelected = _selectedStatus == 'Trip Completed';

    return InkWell(
      onTap: () {
        setState(() {
          _selectedStatus = 'Trip Completed';
        });
      },
      borderRadius: BorderRadius.circular(AppRadius.md),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(vertical: 14.0),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFFFF3E0) : AppColors.surface,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(
            color: isSelected ? AppColors.secondary : AppColors.divider,
            width: isSelected ? 1.5 : 1.0,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.check_circle_outline,
              color: AppColors.secondary,
              size: 20,
            ),
            const SizedBox(width: 8),
            Text(
              'Trip Completed',
              style: TextStyle(
                color: AppColors.primaryText,
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // 5. Current Location Card
  Widget _buildLocationCard(BuildContext context) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(
                    Icons.gps_fixed,
                    color: AppColors.primaryText,
                    size: 16,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Current Location',
                    style: TextStyle(
                      color: AppColors.primaryText,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
              InkWell(
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Auto-detecting current GPS coordinates...')),
                  );
                },
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.sync,
                      color: AppColors.secondary,
                      size: 14,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Auto-detect',
                      style: TextStyle(
                        color: AppColors.secondary,
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            'Distribution Center A-12, AZ',
            style: TextStyle(
              color: AppColors.primaryText,
              fontWeight: FontWeight.bold,
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            '33.4484° N, 112.0740° W',
            style: TextStyle(
              color: AppColors.secondaryText,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  // 6. Odometer Reading Field
  Widget _buildOdometerField(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Current Odometer Reading (km)',
          style: TextStyle(
            color: AppColors.primaryText,
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _odometerController,
          keyboardType: TextInputType.number,
          style: const TextStyle(fontSize: 14.0, color: AppColors.primaryText),
          decoration: InputDecoration(
            hintText: 'Enter reading',
            hintStyle: const TextStyle(color: AppColors.disabledText, fontSize: 13),
            prefixIcon: const Icon(Icons.speed, color: AppColors.disabledText, size: 20),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
            filled: true,
            fillColor: AppColors.background,
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppRadius.md),
              borderSide: const BorderSide(color: AppColors.divider),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppRadius.md),
              borderSide: const BorderSide(color: AppColors.secondary),
            ),
          ),
        ),
      ],
    );
  }

  // 7. Remarks Field
  Widget _buildRemarksField(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Remarks',
          style: TextStyle(
            color: AppColors.primaryText,
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _remarksController,
          maxLines: 3,
          style: const TextStyle(fontSize: 14.0, color: AppColors.primaryText),
          decoration: InputDecoration(
            hintText: 'Add trip update or remarks...',
            hintStyle: const TextStyle(color: AppColors.disabledText, fontSize: 13),
            contentPadding: const EdgeInsets.all(16.0),
            filled: true,
            fillColor: AppColors.background,
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppRadius.md),
              borderSide: const BorderSide(color: AppColors.divider),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppRadius.md),
              borderSide: const BorderSide(color: AppColors.secondary),
            ),
          ),
        ),
      ],
    );
  }

  // 8. Attach Photo Proof Section
  Widget _buildPhotoProofSection(BuildContext context) {
    return Row(
      children: [
        // Camera Capture
        Expanded(
          child: InkWell(
            onTap: () {
              setState(() {
                _attachedPhotoPath = 'camera';
              });
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Mock photo captured successfully!')),
              );
            },
            borderRadius: BorderRadius.circular(AppRadius.md),
            child: SizedBox(
              height: 72,
              child: CustomPaint(
                painter: DashedRectPainter(
                  color: AppColors.secondary.withValues(alpha: 0.5),
                  strokeWidth: 1.5,
                  gap: 4.0,
                ),
                child: Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0F4FA),
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        _attachedPhotoPath == 'camera' ? Icons.check_circle : Icons.camera_alt_outlined,
                        color: _attachedPhotoPath == 'camera' ? AppColors.success : AppColors.primaryText,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _attachedPhotoPath == 'camera' ? 'Photo Attached' : 'Capture Photo',
                        style: TextStyle(
                          color: AppColors.primaryText,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        // Gallery Pick
        Expanded(
          child: InkWell(
            onTap: () {
              setState(() {
                _attachedPhotoPath = 'gallery';
              });
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Mock photo selected from Gallery!')),
              );
            },
            borderRadius: BorderRadius.circular(AppRadius.md),
            child: Container(
              height: 72,
              decoration: BoxDecoration(
                color: const Color(0xFFF0F4FA),
                borderRadius: BorderRadius.circular(AppRadius.md),
                border: Border.all(color: AppColors.divider),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    _attachedPhotoPath == 'gallery' ? Icons.check_circle : Icons.image_outlined,
                    color: _attachedPhotoPath == 'gallery' ? AppColors.success : AppColors.primaryText,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _attachedPhotoPath == 'gallery' ? 'Photo Selected' : 'Gallery',
                    style: TextStyle(
                      color: AppColors.primaryText,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  // 9. Checklist Card
  Widget _buildChecklistCard(BuildContext context) {
    return CustomCard(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Final Checklist',
            style: TextStyle(
              color: AppColors.primaryText,
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 8),
          _buildChecklistItem(
            title: 'Vehicle condition checked',
            value: _vehicleConditionChecked,
            onChanged: (val) {
              setState(() {
                _vehicleConditionChecked = val ?? false;
              });
            },
          ),
          _buildChecklistItem(
            title: 'Delivery documents verified',
            value: _documentsVerified,
            onChanged: (val) {
              setState(() {
                _documentsVerified = val ?? false;
              });
            },
          ),
          _buildChecklistItem(
            title: 'GPS location confirmed',
            value: _gpsLocationConfirmed,
            onChanged: (val) {
              setState(() {
                _gpsLocationConfirmed = val ?? false;
              });
            },
          ),
        ],
      ),
    );
  }

  Widget _buildChecklistItem({
    required String title,
    required bool value,
    required ValueChanged<bool?> onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          SizedBox(
            width: 24,
            height: 24,
            child: Checkbox(
              value: value,
              onChanged: onChanged,
              activeColor: AppColors.secondary,
              side: const BorderSide(color: AppColors.disabledText, width: 1.5),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                color: AppColors.primaryText,
                fontSize: 13,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // 10. Footer Buttons
  Widget _buildFooterButtons(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          width: double.infinity,
          height: 48,
          child: ElevatedButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Trip status updated to "$_selectedStatus" successfully!'),
                ),
              );
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
            ),
            child: const Text(
              'UPDATE STATUS',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          height: 48,
          child: OutlinedButton(
            onPressed: () {
              Navigator.pop(context);
            },
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: AppColors.secondary, width: 1.5),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
            ),
            child: const Text(
              'CANCEL',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: AppColors.secondary,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// Custom Painter for dashed rect border
class DashedRectPainter extends CustomPainter {
  final Color color;
  final double strokeWidth;
  final double gap;

  DashedRectPainter({
    this.color = AppColors.secondary,
    this.strokeWidth = 1.0,
    this.gap = 4.0,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke;

    final double width = size.width;
    final double height = size.height;

    final path = Path();
    path.addRRect(RRect.fromRectAndRadius(
      Rect.fromLTWH(0, 0, width, height),
      const Radius.circular(AppRadius.md),
    ));

    for (final pathMetric in path.computeMetrics()) {
      double distance = 0.0;
      while (distance < pathMetric.length) {
        final len = distance + gap > pathMetric.length ? pathMetric.length - distance : gap;
        final extract = pathMetric.extractPath(distance, distance + len);
        canvas.drawPath(extract, paint);
        distance += gap * 2;
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
