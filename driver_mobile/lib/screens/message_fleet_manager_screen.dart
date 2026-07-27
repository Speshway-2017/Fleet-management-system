import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'calling_fleet_manager_screen.dart';

/// Data representation of a Chat Message item.
class ChatMessageItem {
  final String sender;
  final String message;
  final String timestamp;
  final bool isOutgoing;
  final String? attachmentName;
  final String? attachmentSize;
  final IconData? attachmentIcon;
  final Color? attachmentIconBg;

  const ChatMessageItem({
    required this.sender,
    required this.message,
    required this.timestamp,
    required this.isOutgoing,
    this.attachmentName,
    this.attachmentSize,
    this.attachmentIcon,
    this.attachmentIconBg,
  });
}

/// Driver Module - Message Fleet Manager Screen
/// 
/// Replicates an enterprise fleet messaging interface between the driver and
/// Fleet Manager (Rajesh Sharma). Features incoming/outgoing chat bubbles,
/// timestamp indicators, document attachments, compact header profile bar,
/// and fixed bottom input bar.
class MessageFleetManagerScreen extends StatelessWidget {
  const MessageFleetManagerScreen({super.key});

  static const List<ChatMessageItem> _chatMessages = [
    ChatMessageItem(
      sender: 'Rajesh Sharma',
      message: "Good morning. Please complete today's delivery before 5:00 PM.",
      timestamp: 'Today • 10:42 AM',
      isOutgoing: false,
    ),
    ChatMessageItem(
      sender: 'Satya Narayana',
      message: "I'm currently on the way to Pune.",
      timestamp: 'Today • 10:44 AM',
      isOutgoing: true,
    ),
    ChatMessageItem(
      sender: 'Rajesh Sharma',
      message: 'Please upload the toll receipt after crossing Khalapur Toll Plaza.',
      timestamp: 'Today • 10:45 AM',
      isOutgoing: false,
    ),
    ChatMessageItem(
      sender: 'Satya Narayana',
      message: "Sure, I'll upload it immediately.",
      timestamp: 'Today • 10:46 AM',
      isOutgoing: true,
    ),
    ChatMessageItem(
      sender: 'Satya Narayana',
      message: '',
      timestamp: 'Today • 10:47 AM',
      isOutgoing: true,
      attachmentName: 'Fuel_Receipt.jpg',
      attachmentSize: '1.2 MB',
      attachmentIcon: Icons.image_outlined,
      attachmentIconBg: Color(0xFFFFEDD5),
    ),
    ChatMessageItem(
      sender: 'Satya Narayana',
      message: '',
      timestamp: 'Today • 10:48 AM',
      isOutgoing: true,
      attachmentName: 'Route_Sheet.pdf',
      attachmentSize: '450 KB',
      attachmentIcon: Icons.picture_as_pdf_outlined,
      attachmentIconBg: Color(0xFFDBEAFE),
    ),
    ChatMessageItem(
      sender: 'Satya Narayana',
      message: '',
      timestamp: 'Today • 10:49 AM',
      isOutgoing: true,
      attachmentName: 'Delivery_Challan.pdf',
      attachmentSize: '680 KB',
      attachmentIcon: Icons.description_outlined,
      attachmentIconBg: Color(0xFFFEE2E2),
    ),
    ChatMessageItem(
      sender: 'Rajesh Sharma',
      message: 'Vehicle inspection is scheduled after trip completion.',
      timestamp: 'Today • 10:50 AM',
      isOutgoing: false,
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
    const successGreen = Color(0xFF22C55E);

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
        title: Text(
          'Message Fleet Manager',
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
        child: Column(
          children: [
            // 1. Compact Manager Profile Header Bar
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
              decoration: BoxDecoration(
                color: Colors.white,
                border: const Border(
                  bottom: BorderSide(color: borderGray, width: 1.0),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(6),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Stack(
                    alignment: Alignment.bottomRight,
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: primaryDark.withAlpha(20),
                          border: Border.all(color: borderGray, width: 1.5),
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.person_rounded,
                            size: 26,
                            color: primaryDark,
                          ),
                        ),
                      ),
                      Positioned(
                        right: 1,
                        bottom: 1,
                        child: Container(
                          width: 11,
                          height: 11,
                          decoration: BoxDecoration(
                            color: successGreen,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 1.5),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 12.0),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Rajesh Sharma',
                          style: GoogleFonts.poppins(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: textPrimary,
                          ),
                        ),
                        const SizedBox(height: 1.0),
                        Row(
                          children: [
                            Text(
                              'Fleet Manager',
                              style: GoogleFonts.nunito(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: textSecondary,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              width: 4,
                              height: 4,
                              decoration: const BoxDecoration(
                                color: textSecondary,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Online',
                              style: GoogleFonts.poppins(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w600,
                                color: successGreen,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const CallingFleetManagerScreen(),
                        ),
                      );
                    },
                    icon: const Icon(
                      Icons.phone_outlined,
                      color: primaryDark,
                      size: 22,
                    ),
                  ),
                ],
              ),
            ),

            // 2. Chat Scrollable Area
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                child: Column(
                  children: [
                    // Date Divider Chip
                    Center(
                      child: Container(
                        margin: const EdgeInsets.symmetric(vertical: 12.0),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE2E8F0),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          'Today',
                          style: GoogleFonts.poppins(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                            color: textSecondary,
                          ),
                        ),
                      ),
                    ),

                    // List of Chat Bubbles & Attachments
                    ..._chatMessages.map((msg) => _buildChatBubble(context, msg)),
                  ],
                ),
              ),
            ),

            // 3. Message Input Area (Fixed Bottom Bar)
            Container(
              padding: const EdgeInsets.all(12.0),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(12),
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
                        Icons.attach_file_rounded,
                        color: textSecondary,
                        size: 24,
                      ),
                      onPressed: () {},
                    ),
                    const SizedBox(width: 4.0),
                    Expanded(
                      child: Container(
                        height: 44,
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(22.0),
                        ),
                        alignment: Alignment.centerLeft,
                        child: TextField(
                          readOnly: true,
                          decoration: InputDecoration(
                            hintText: 'Type your message...',
                            hintStyle: GoogleFonts.poppins(
                              fontSize: 13.5,
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

  Widget _buildChatBubble(BuildContext context, ChatMessageItem msg) {
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const primaryOrange = Color(0xFFFF7A1A);
    const borderGray = Color(0xFFE2E8F0);

    final isAttachment = msg.attachmentName != null;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Column(
        crossAxisAlignment:
            msg.isOutgoing ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment:
                msg.isOutgoing ? MainAxisAlignment.end : MainAxisAlignment.start,
            children: [
              Flexible(
                child: isAttachment
                    ? _buildAttachmentCard(context, msg)
                    : Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16.0,
                          vertical: 12.0,
                        ),
                        decoration: BoxDecoration(
                          color: msg.isOutgoing ? primaryOrange : Colors.white,
                          borderRadius: BorderRadius.only(
                            topLeft: const Radius.circular(16.0),
                            topRight: const Radius.circular(16.0),
                            bottomLeft: Radius.circular(msg.isOutgoing ? 16.0 : 4.0),
                            bottomRight: Radius.circular(msg.isOutgoing ? 4.0 : 16.0),
                          ),
                          border: msg.isOutgoing
                              ? null
                              : Border.all(color: borderGray, width: 1.0),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withAlpha(6),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Text(
                          msg.message,
                          style: GoogleFonts.poppins(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w500,
                            color: msg.isOutgoing ? Colors.white : textPrimary,
                            height: 1.4,
                          ),
                        ),
                      ),
              ),
            ],
          ),
          const SizedBox(height: 4.0),
          Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment:
                msg.isOutgoing ? MainAxisAlignment.end : MainAxisAlignment.start,
            children: [
              Text(
                msg.timestamp,
                style: GoogleFonts.nunito(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: textSecondary,
                ),
              ),
              if (msg.isOutgoing) ...[
                const SizedBox(width: 4),
                const Icon(
                  Icons.done_all_rounded,
                  size: 15,
                  color: primaryOrange,
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAttachmentCard(BuildContext context, ChatMessageItem msg) {
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const borderGray = Color(0xFFE2E8F0);

    return Container(
      width: 250,
      padding: const EdgeInsets.all(12.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14.0),
        border: Border.all(color: borderGray, width: 1.0),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(8),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: msg.attachmentIconBg ?? const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(10.0),
            ),
            child: Icon(
              msg.attachmentIcon ?? Icons.insert_drive_file_outlined,
              color: textPrimary,
              size: 22,
            ),
          ),
          const SizedBox(width: 12.0),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  msg.attachmentName ?? '',
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: textPrimary,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2.0),
                Text(
                  msg.attachmentSize ?? '',
                  style: GoogleFonts.nunito(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w600,
                    color: textSecondary,
                  ),
                ),
              ],
            ),
          ),
          const Icon(
            Icons.file_download_outlined,
            color: textSecondary,
            size: 20,
          ),
        ],
      ),
    );
  }
}
