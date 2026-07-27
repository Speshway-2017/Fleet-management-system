import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Data representation of a timeline update item in Ticket Details.
class TicketUpdateItem {
  final String author;
  final String role;
  final String timestamp;
  final String message;
  final IconData icon;
  final Color iconBg;

  const TicketUpdateItem({
    required this.author,
    required this.role,
    required this.timestamp,
    required this.message,
    required this.icon,
    required this.iconBg,
  });
}

/// Driver Module - Ticket Details Screen
/// 
/// Displays detailed ticket information based on the 2nd reference mock:
/// - Dark Navy AppBar (#101C2C) with ticket ID & category subtitle
/// - Original Description card with timestamp & horizontal attachments (3)
/// - Updates & Conversation vertical timeline with author roles, timestamps, & cards
/// - Fixed bottom reply bar with attachment trigger & orange send button
class TicketDetailsScreen extends StatelessWidget {
  final String ticketId;
  final String category;
  final String description;
  final String raisedDate;
  final String vehicleNumber;

  const TicketDetailsScreen({
    super.key,
    this.ticketId = 'TK-1024',
    this.category = 'VEHICLE MAINTENANCE',
    this.description =
        'Abnormal engine vibration detected during highway cruising (65km/h+). The issue seems to originate from the front axle. Fuel efficiency has dropped by 12% over the last 200 km. Requesting immediate diagnostic check before the next long-haul route.',
    this.raisedDate = 'Oct 24, 2023 • 05:30 AM',
    this.vehicleNumber = 'TS09AB4589',
  });

  static const List<TicketUpdateItem> _updates = [
    TicketUpdateItem(
      author: 'Fleet Support',
      role: 'Rajesh Sharma',
      timestamp: '08:15 AM',
      message:
          "Ticket acknowledged. We've assigned Senior Mechanic Ramesh to this case. Please ensure the vehicle is parked at Bay 4 by 2:00 PM today for preliminary inspection.",
      icon: Icons.headset_mic_rounded,
      iconBg: Color(0xFF101C2C),
    ),
    TicketUpdateItem(
      author: 'Driver',
      role: 'Self (Satya Narayana)',
      timestamp: '10:05 AM',
      message:
          'Understood. Currently finishing the morning delivery loop. I will be at Bay 4 by 1:45 PM. I also noticed a slight pulling to the left.',
      icon: Icons.directions_bus_rounded,
      iconBg: Color(0xFFFF7A1A),
    ),
    TicketUpdateItem(
      author: 'Mechanic',
      role: 'Ramesh Kumar',
      timestamp: '11:30 AM',
      message:
          'Alignment issue confirmed. Preparing diagnostic tools for front-end suspension check. Will update once the vehicle arrives.',
      icon: Icons.build_rounded,
      iconBg: Color(0xFF334155),
    ),
  ];

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
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              ticketId,
              style: GoogleFonts.poppins(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
            Text(
              category.toUpperCase(),
              style: GoogleFonts.poppins(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF94A3B8),
                letterSpacing: 0.5,
              ),
            ),
          ],
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
        child: Column(
          children: [
            // Scrollable Content
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1. Original Description Card
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
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Original Description',
                                style: GoogleFonts.poppins(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                  color: textPrimary,
                                ),
                              ),
                              Text(
                                '05:30 AM',
                                style: GoogleFonts.nunito(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: textSecondary,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10.0),
                          Text(
                            description,
                            style: GoogleFonts.nunito(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: textPrimary,
                              height: 1.45,
                            ),
                          ),
                          const SizedBox(height: 16.0),

                          // Attachments Header
                          Text(
                            'ATTACHMENTS (3)',
                            style: GoogleFonts.poppins(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w600,
                              color: textSecondary,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: 10.0),

                          // Horizontal Attachment Thumbnails
                          Row(
                            children: [
                              _buildImageAttachment(
                                context,
                                icon: Icons.precision_manufacturing_outlined,
                                label: 'Engine_Check.jpg',
                                bgColor: const Color(0xFF1E293B),
                              ),
                              const SizedBox(width: 10.0),
                              _buildImageAttachment(
                                context,
                                icon: Icons.analytics_outlined,
                                label: 'Diag_Graph.png',
                                bgColor: const Color(0xFF0F172A),
                              ),
                              const SizedBox(width: 10.0),
                              _buildDocAttachment(
                                context,
                                label: 'Engine_Rpt.pdf',
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24.0),

                    // 2. Updates & Conversation Section Header
                    Text(
                      'Updates & Conversation',
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: textPrimary,
                      ),
                    ),
                    const SizedBox(height: 16.0),

                    // Timeline List
                    ...List.generate(_updates.length, (index) {
                      final item = _updates[index];
                      final isLast = index == _updates.length - 1;
                      return _buildTimelineItem(context, item, isLast: isLast);
                    }),

                    const SizedBox(height: 20.0),
                  ],
                ),
              ),
            ),

            // 3. Fixed Bottom Reply Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(10),
                    blurRadius: 10,
                    offset: const Offset(0, -3),
                  ),
                ],
              ),
              child: SafeArea(
                top: false,
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(
                        Icons.add_circle_outline_rounded,
                        color: textSecondary,
                        size: 26,
                      ),
                      onPressed: () {},
                    ),
                    const SizedBox(width: 4.0),
                    Expanded(
                      child: Container(
                        height: 44,
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(22.0),
                          border: Border.all(color: borderGray, width: 1.0),
                        ),
                        alignment: Alignment.centerLeft,
                        child: TextField(
                          readOnly: true,
                          decoration: InputDecoration(
                            hintText: 'Add a reply...',
                            hintStyle: GoogleFonts.poppins(
                              fontSize: 13,
                              color: textSecondary,
                            ),
                            border: InputBorder.none,
                            isDense: true,
                            contentPadding: EdgeInsets.zero,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10.0),
                    Container(
                      width: 44,
                      height: 44,
                      decoration: const BoxDecoration(
                        color: primaryOrange,
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        icon: const Icon(
                          Icons.send_rounded,
                          color: Colors.white,
                          size: 20,
                        ),
                        onPressed: () {},
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImageAttachment(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color bgColor,
  }) {
    return Container(
      width: 72,
      height: 60,
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(10.0),
      ),
      child: Center(
        child: Icon(
          icon,
          color: Colors.white70,
          size: 26,
        ),
      ),
    );
  }

  Widget _buildDocAttachment(BuildContext context, {required String label}) {
    return Container(
      width: 72,
      height: 60,
      decoration: BoxDecoration(
        color: const Color(0xFFE2E8F0),
        borderRadius: BorderRadius.circular(10.0),
      ),
      padding: const EdgeInsets.all(6.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.picture_as_pdf_outlined,
            color: Color(0xFF64748B),
            size: 22,
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: GoogleFonts.poppins(
              fontSize: 8.5,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF334155),
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineItem(
    BuildContext context,
    TicketUpdateItem item, {
    required bool isLast,
  }) {
    const borderGray = Color(0xFFE2E8F0);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon Avatar + Vertical Line Column
          Column(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: item.iconBg,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  item.icon,
                  color: Colors.white,
                  size: 18,
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: const Color(0xFFCBD5E1),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 12.0),

          // Message Card
          Expanded(
            child: Container(
              margin: const EdgeInsets.only(bottom: 16.0),
              padding: const EdgeInsets.all(14.0),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14.0),
                border: Border.all(color: borderGray, width: 1.0),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(6),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${item.author} (${item.role})',
                        style: GoogleFonts.poppins(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: textPrimary,
                        ),
                      ),
                      Text(
                        item.timestamp,
                        style: GoogleFonts.nunito(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w600,
                          color: textSecondary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6.0),
                  Text(
                    item.message,
                    style: GoogleFonts.nunito(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w500,
                      color: textPrimary,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
