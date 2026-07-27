import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_radius.dart';
import '../constants/app_spacing.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';

// --- MAIN E-WAY BILL SCREEN (Image 4) ---
class EWayBillScreen extends StatelessWidget {
  final String billNumber;
  final String tripId;

  const EWayBillScreen({
    super.key,
    this.billNumber = '#EWB-4429-1022',
    this.tripId = '#TRP-8840',
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        centerTitle: false,
        title: Text(
          'E-Way Bill',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: AppColors.background,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Header validation summary card
              _buildHeaderCard(context),
              AppSpacing.verticalSm,

              // 2. Shipment Details Card
              _buildShipmentDetailsCard(context),
              AppSpacing.verticalSm,

              // 3. Document Preview Card
              _buildDocumentTapPreviewCard(context),
              AppSpacing.verticalSm,

              // 4. Verification Success Card
              _buildVerificationCard(context),
              AppSpacing.verticalLg,

              // 5. Footer Buttons
              _buildFooterActions(context),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderCard(BuildContext context) {
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
                    billNumber,
                    style: const TextStyle(
                      color: AppColors.primaryText,
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                  const SizedBox(height: 2),
                  const Text(
                    'Generated: Oct 24, 2023',
                    style: TextStyle(
                      color: AppColors.secondaryText,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F5E9),
                  borderRadius: BorderRadius.circular(AppRadius.round),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.check, color: Color(0xFF2E7D32), size: 12),
                    SizedBox(width: 4),
                    Text(
                      'VALID',
                      style: TextStyle(
                        color: Color(0xFF2E7D32),
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 12.0),
            child: Divider(color: AppColors.divider),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildInfoRow('VALID UNTIL', 'Oct 30, 2023'),
              _buildInfoRow('TRIP ID', tripId, alignRight: true),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildInfoRow('VEHICLE NUMBER', 'TS09AB1234'),
              _buildInfoRow('MODE', 'Road (Heavy Truck)', alignRight: true),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildShipmentDetailsCard(BuildContext context) {
    return CustomCard(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Icon(Icons.local_shipping, color: Colors.blue.shade700, size: 18),
              ),
              const SizedBox(width: 12),
              const Text(
                'Shipment Details',
                style: TextStyle(
                  color: AppColors.primaryText,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Route timeline dots
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                children: [
                  const SizedBox(height: 2),
                  const Icon(Icons.circle, color: AppColors.primary, size: 8),
                  Container(width: 1.5, height: 32, color: AppColors.divider),
                  const Icon(Icons.circle, color: AppColors.secondary, size: 8),
                ],
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'PICKUP: GLOBAL LOGISTICS HUB',
                      style: TextStyle(color: AppColors.secondaryText, fontSize: 9, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      'Chicago, IL',
                      style: TextStyle(color: AppColors.primaryText, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 18),
                    Text(
                      'DELIVERY: DISTRIBUTION CENTER 12',
                      style: TextStyle(color: AppColors.secondaryText, fontSize: 9, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      'Detroit, MI',
                      style: TextStyle(color: AppColors.primaryText, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(color: AppColors.divider),
          const SizedBox(height: 12),
          _buildDetailRow('CONSIGNEE GSTIN', '07AAACR3401R1Z1'),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildInfoRow('INVOICE NO.', 'INV-99021'),
              _buildInfoRow('DISTANCE', '420.5 km', alignRight: true),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.blue.shade50.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'GOODS DESCRIPTION',
                  style: TextStyle(color: AppColors.secondaryText, fontSize: 9, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 4),
                Text(
                  'Industrial Equipment (2 Units)',
                  style: TextStyle(color: AppColors.primaryText, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 2),
                Text(
                  'Total Weight: 12,400 kg',
                  style: TextStyle(color: AppColors.secondaryText, fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDocumentTapPreviewCard(BuildContext context) {
    return CustomCard(
      padding: const EdgeInsets.symmetric(vertical: 24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.description, color: Colors.blue.shade700, size: 40),
          const SizedBox(height: 8),
          const Text(
            'E-Way_Bill_4429.pdf',
            style: TextStyle(
              color: AppColors.primaryText,
              fontWeight: FontWeight.bold,
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 8),
          GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const EWayBillPreviewScreen(),
                ),
              );
            },
            child: const Text(
              'Tap to Preview Document',
              style: TextStyle(
                color: AppColors.secondary,
                fontWeight: FontWeight.bold,
                fontSize: 13,
                decoration: TextDecoration.underline,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVerificationCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12.0),
      decoration: BoxDecoration(
        color: const Color(0xFFE8F5E9),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: const Color(0xFFC8E6C9)),
      ),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.verified, color: Color(0xFF2E7D32), size: 20),
          SizedBox(width: 8),
          Text(
            'VERIFIED SUCCESSFULLY',
            style: TextStyle(
              color: Color(0xFF2E7D32),
              fontWeight: FontWeight.bold,
              fontSize: 13,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFooterActions(BuildContext context) {
    return Column(
      children: [
        ElevatedButton.icon(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Downloading E-Way Bill PDF...')),
            );
          },
          icon: const Icon(Icons.download_outlined, color: Colors.white, size: 20),
          label: const Text(
            'Download PDF',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            elevation: 0,
            minimumSize: const Size(double.infinity, 48),
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
          ),
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Opening Share Dialog for E-Way Bill...')),
            );
          },
          icon: const Icon(Icons.share_outlined, color: AppColors.secondary, size: 20),
          label: const Text(
            'Share Document',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppColors.secondary,
            ),
          ),
          style: OutlinedButton.styleFrom(
            side: const BorderSide(color: AppColors.secondary, width: 1.5),
            minimumSize: const Size(double.infinity, 48),
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppColors.secondaryText,
            fontSize: 13,
          ),
        ),
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
            fontSize: 12,
          ),
        ),
      ],
    );
  }
}

// --- E-WAY BILL PREVIEW DOCUMENT (Image 3) ---
class EWayBillPreviewScreen extends StatelessWidget {
  const EWayBillPreviewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FC),
      appBar: CustomAppBar(
        centerTitle: false,
        title: Text(
          'E-Way Bill Preview',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: AppColors.background,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Container(
                  padding: const EdgeInsets.all(20.0),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      )
                    ],
                    border: Border.all(color: AppColors.divider),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Header Layout
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Text(
                                'E-WAY BILL',
                                style: TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.primaryText,
                                ),
                              ),
                              SizedBox(height: 4),
                              Text(
                                'Government of Logistics & Transport',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: AppColors.secondaryText,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Container(
                                width: 70,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: Colors.blue.shade50,
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(color: Colors.blue.shade100),
                                ),
                                child: const Icon(Icons.qr_code, color: AppColors.primary, size: 28),
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'EWB-ID: 4512 8902341',
                                style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      const Divider(thickness: 1.5, color: Colors.black87),
                      const SizedBox(height: 12),

                      // Parameter grid
                      GridView.count(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisCount: 2,
                        childAspectRatio: 2.8,
                        children: [
                          _buildGridItem('E-WAY BILL NO', '1712 4589 3321'),
                          _buildGridItem('GENERATED DATE', '24 Oct 2023 14:30'),
                          _buildGridItem('VALID FROM', '24 Oct 2023'),
                          _buildGridItem('VALID UNTIL', '27 Oct 2023'),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Part A
                      _buildSubSectionHeader('PART A: CONSIGNOR DETAILS'),
                      const SizedBox(height: 8),
                      _buildTextDetail('GSTIN / NAME', '27AAAAA0000A1Z5 - Kinetic Fleet Corp'),
                      const SizedBox(height: 6),
                      _buildTextDetail('DISPATCH FROM', 'Plot 45, Logistics Hub, Phase II, Mumbai, MH - 400001'),
                      const SizedBox(height: 16),

                      // Part B
                      _buildSubSectionHeader('PART B: CONSIGNEE DETAILS'),
                      const SizedBox(height: 8),
                      _buildTextDetail('GSTIN / NAME', '07BBBBB1111B2Z6 - Northern Retail Ltd'),
                      const SizedBox(height: 6),
                      _buildTextDetail('SHIP TO', 'Warehouse 7, Sector 18, Okhla Industrial Area, Delhi - 110020'),
                      const SizedBox(height: 20),

                      // Item Details Table
                      _buildSubSectionHeader('ITEM DETAILS'),
                      const SizedBox(height: 8),
                      _buildItemTable(),
                      const SizedBox(height: 20),

                      // Transportation
                      _buildSubSectionHeader('TRANSPORTATION INFO'),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildGridItem('Transporter ID', 'TRNS-9921-X'),
                          _buildGridItem('Vehicle No', 'MH-01-CU-8822'),
                          _buildGridItem('Distance', '1,450 KM'),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
            // Footer Action
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              color: Colors.white,
              child: SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Downloading E-Way Bill PDF Document...')),
                    );
                  },
                  icon: const Icon(Icons.download, color: Colors.white, size: 20),
                  label: const Text(
                    'Download PDF (2.4 MB)',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGridItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          label.toUpperCase(),
          style: const TextStyle(fontSize: 8, color: AppColors.secondaryText, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primaryText),
        ),
      ],
    );
  }

  Widget _buildSubSectionHeader(String title) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: Color(0xFFC05621), // orange-brown
          ),
        ),
        const SizedBox(height: 2),
        const Divider(thickness: 0.8),
      ],
    );
  }

  Widget _buildTextDetail(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 8, color: AppColors.secondaryText, fontWeight: FontWeight.w500),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primaryText),
        ),
      ],
    );
  }

  Widget _buildItemTable() {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Table Header
          Container(
            color: Colors.blue.shade50,
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            child: Row(
              children: const [
                SizedBox(width: 40, child: Text('HSN', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold))),
                Expanded(child: Text('Description', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold))),
                SizedBox(width: 40, child: Text('Qty', textAlign: TextAlign.right, style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold))),
                SizedBox(width: 60, child: Text('Value', textAlign: TextAlign.right, style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold))),
              ],
            ),
          ),
          const Divider(height: 1),
          // Rows
          _buildItemTableRow('8708', 'Automotive Spare Parts - Grade A', '1200', '₹4,50,000'),
          const Divider(height: 1),
          _buildItemTableRow('4016', 'Rubber Gaskets & Seals', '500', '₹85,000'),
          const Divider(height: 1),
          // Total
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            color: Colors.grey.shade50,
            child: Row(
              children: const [
                Spacer(),
                Text('Total Taxable Value:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primaryText)),
                SizedBox(width: 8),
                Text('₹5,35,000', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primaryText)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildItemTableRow(String hsn, String desc, String qty, String val) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      child: Row(
        children: [
          SizedBox(width: 40, child: Text(hsn, style: const TextStyle(fontSize: 10, color: AppColors.primaryText))),
          Expanded(
            child: Text(
              desc,
              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primaryText),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          SizedBox(width: 40, child: Text(qty, style: const TextStyle(fontSize: 10, color: AppColors.primaryText), textAlign: TextAlign.right)),
          SizedBox(width: 60, child: Text(val, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primaryText), textAlign: TextAlign.right)),
        ],
      ),
    );
  }
}
