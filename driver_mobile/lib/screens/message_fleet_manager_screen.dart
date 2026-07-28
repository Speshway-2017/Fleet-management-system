import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
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
/// Features interactive enterprise fleet chat with Fleet Manager (Rajesh Sharma),
/// WhatsApp-styled media attachment bottom modal, dynamic text/media messaging,
/// and live file selection integration.
class MessageFleetManagerScreen extends StatefulWidget {
  const MessageFleetManagerScreen({super.key});

  @override
  State<MessageFleetManagerScreen> createState() => _MessageFleetManagerScreenState();
}

class _MessageFleetManagerScreenState extends State<MessageFleetManagerScreen> {
  final List<ChatMessageItem> _chatMessages = [
    const ChatMessageItem(
      sender: 'Rajesh Sharma',
      message: "Good morning. Please complete today's delivery before 5:00 PM.",
      timestamp: 'Today • 10:42 AM',
      isOutgoing: false,
    ),
    const ChatMessageItem(
      sender: 'Satya Narayana',
      message: "I'm currently on the way to Pune.",
      timestamp: 'Today • 10:44 AM',
      isOutgoing: true,
    ),
    const ChatMessageItem(
      sender: 'Rajesh Sharma',
      message: 'Please upload the toll receipt after crossing Khalapur Toll Plaza.',
      timestamp: 'Today • 10:45 AM',
      isOutgoing: false,
    ),
    const ChatMessageItem(
      sender: 'Satya Narayana',
      message: "Sure, I'll upload it immediately.",
      timestamp: 'Today • 10:46 AM',
      isOutgoing: true,
    ),
    const ChatMessageItem(
      sender: 'Satya Narayana',
      message: '',
      timestamp: 'Today • 10:47 AM',
      isOutgoing: true,
      attachmentName: 'Fuel_Receipt.jpg',
      attachmentSize: '1.2 MB',
      attachmentIcon: Icons.image_outlined,
      attachmentIconBg: Color(0xFFFFEDD5),
    ),
    const ChatMessageItem(
      sender: 'Satya Narayana',
      message: '',
      timestamp: 'Today • 10:48 AM',
      isOutgoing: true,
      attachmentName: 'Route_Sheet.pdf',
      attachmentSize: '450 KB',
      attachmentIcon: Icons.picture_as_pdf_outlined,
      attachmentIconBg: Color(0xFFDBEAFE),
    ),
    const ChatMessageItem(
      sender: 'Satya Narayana',
      message: '',
      timestamp: 'Today • 10:49 AM',
      isOutgoing: true,
      attachmentName: 'Delivery_Challan.pdf',
      attachmentSize: '680 KB',
      attachmentIcon: Icons.description_outlined,
      attachmentIconBg: Color(0xFFFEE2E2),
    ),
    const ChatMessageItem(
      sender: 'Rajesh Sharma',
      message: 'Vehicle inspection is scheduled after trip completion.',
      timestamp: 'Today • 10:50 AM',
      isOutgoing: false,
    ),
  ];

  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    final now = TimeOfDay.now();
    final hour = now.hourOfPeriod == 0 ? 12 : now.hourOfPeriod;
    final minute = now.minute.toString().padLeft(2, '0');
    final period = now.period == DayPeriod.am ? 'AM' : 'PM';
    final timestamp = 'Today • $hour:$minute $period';

    setState(() {
      _chatMessages.add(
        ChatMessageItem(
          sender: 'Satya Narayana',
          message: text,
          timestamp: timestamp,
          isOutgoing: true,
        ),
      );
      _messageController.clear();
    });

    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  // Open WhatsApp-styled Attachment Options Modal
  void _showAttachmentModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(24.0),
            topRight: Radius.circular(24.0),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2.0),
              ),
            ),
            const SizedBox(height: 16.0),
            Text(
              'Share Content',
              style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: const Color(0xFF1F2937),
              ),
            ),
            const SizedBox(height: 20.0),
            GridView.count(
              shrinkWrap: true,
              crossAxisCount: 3,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              children: [
                _buildAttachmentOption(
                  icon: Icons.insert_drive_file_rounded,
                  color: const Color(0xFF7C3AED),
                  label: 'Document',
                  onTap: () => _pickAndAttachFile('document'),
                ),
                _buildAttachmentOption(
                  icon: Icons.camera_alt_rounded,
                  color: const Color(0xFFEC4899),
                  label: 'Camera',
                  onTap: () => _pickAndAttachFile('camera'),
                ),
                _buildAttachmentOption(
                  icon: Icons.photo_library_rounded,
                  color: const Color(0xFF06B6D4),
                  label: 'Gallery',
                  onTap: () => _pickAndAttachFile('gallery'),
                ),
                _buildAttachmentOption(
                  icon: Icons.headset_rounded,
                  color: const Color(0xFFF97316),
                  label: 'Audio',
                  onTap: () => _pickAndAttachFile('audio'),
                ),
                _buildAttachmentOption(
                  icon: Icons.location_on_rounded,
                  color: const Color(0xFF10B981),
                  label: 'Location',
                  onTap: () => _attachLocation(),
                ),
                _buildAttachmentOption(
                  icon: Icons.receipt_long_rounded,
                  color: const Color(0xFF3B82F6),
                  label: 'Slips / POD',
                  onTap: () => _pickAndAttachFile('slip'),
                ),
              ],
            ),
            const SizedBox(height: 12.0),
          ],
        ),
      ),
    );
  }

  Widget _buildAttachmentOption({
    required IconData icon,
    required Color color,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: () {
        Navigator.pop(context);
        onTap();
      },
      borderRadius: BorderRadius.circular(16.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: color.withAlpha(80),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Icon(icon, color: Colors.white, size: 26),
          ),
          const SizedBox(height: 8.0),
          Text(
            label,
            style: GoogleFonts.poppins(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF374151),
            ),
          ),
        ],
      ),
    );
  }

  // Handle media pick & attach into chat
  Future<void> _pickAndAttachFile(String type) async {
    String name = 'Attached_File.pdf';
    String size = '1.1 MB';
    IconData icon = Icons.insert_drive_file_outlined;
    Color iconBg = const Color(0xFFDBEAFE);

    try {
      final result = await FilePicker.platform.pickFiles(
        type: type == 'gallery' || type == 'camera'
            ? FileType.image
            : type == 'audio'
                ? FileType.audio
                : FileType.any,
      );

      if (result != null && result.files.isNotEmpty) {
        final file = result.files.first;
        name = file.name;
        size = '${(file.size / 1024).toStringAsFixed(1)} KB';
        if (name.toLowerCase().endsWith('.jpg') || name.toLowerCase().endsWith('.png')) {
          icon = Icons.image_outlined;
          iconBg = const Color(0xFFFFEDD5);
        } else if (name.toLowerCase().endsWith('.pdf')) {
          icon = Icons.picture_as_pdf_outlined;
          iconBg = const Color(0xFFFEE2E2);
        }
      } else {
        // Fallback mock attachment names depending on type selected
        if (type == 'camera' || type == 'gallery') {
          name = 'Vehicle_Photo_${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}.jpg';
          size = '2.4 MB';
          icon = Icons.image_outlined;
          iconBg = const Color(0xFFFFEDD5);
        } else if (type == 'slip') {
          name = 'Weighbridge_Slip_Customer.pdf';
          size = '840 KB';
          icon = Icons.receipt_long_outlined;
          iconBg = const Color(0xFFE0E7FF);
        } else if (type == 'audio') {
          name = 'Voice_Note_001.mp3';
          size = '320 KB';
          icon = Icons.audiotrack_outlined;
          iconBg = const Color(0xFFFEF3C7);
        }
      }
    } catch (_) {
      name = 'Uploaded_Document.pdf';
      size = '1.0 MB';
    }

    final now = TimeOfDay.now();
    final hour = now.hourOfPeriod == 0 ? 12 : now.hourOfPeriod;
    final minute = now.minute.toString().padLeft(2, '0');
    final period = now.period == DayPeriod.am ? 'AM' : 'PM';
    final timestamp = 'Today • $hour:$minute $period';

    setState(() {
      _chatMessages.add(
        ChatMessageItem(
          sender: 'Satya Narayana',
          message: '',
          timestamp: timestamp,
          isOutgoing: true,
          attachmentName: name,
          attachmentSize: size,
          attachmentIcon: icon,
          attachmentIconBg: iconBg,
        ),
      );
    });

    _scrollToBottom();
  }

  void _attachLocation() {
    final now = TimeOfDay.now();
    final hour = now.hourOfPeriod == 0 ? 12 : now.hourOfPeriod;
    final minute = now.minute.toString().padLeft(2, '0');
    final period = now.period == DayPeriod.am ? 'AM' : 'PM';
    final timestamp = 'Today • $hour:$minute $period';

    setState(() {
      _chatMessages.add(
        ChatMessageItem(
          sender: 'Satya Narayana',
          message: '📍 Shared Live Location: Khalapur Toll Plaza, NH-48 (18.8234, 73.2389)',
          timestamp: timestamp,
          isOutgoing: true,
        ),
      );
    });

    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    const primaryDark = Color(0xFF101C2C);
    const bgLight = Color(0xFFF7F8FA);
    const borderGray = Color(0xFFE2E8F0);
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
                            border: Border.all(color: Colors.white, width: 2.0),
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
                            color: const Color(0xFF1F2937),
                          ),
                        ),
                        Text(
                          'Fleet Manager • Active Now',
                          style: GoogleFonts.nunito(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.phone_outlined, color: primaryOrange, size: 22),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const CallingFleetManagerScreen(),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),

            // 2. Chat Area Container
            Expanded(
              child: SingleChildScrollView(
                controller: _scrollController,
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
                child: Column(
                  children: [
                    // System Date Chip
                    Center(
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 16.0),
                        padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 4.0),
                        decoration: BoxDecoration(
                          color: Colors.grey.withAlpha(25),
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                        child: Text(
                          'Today',
                          style: GoogleFonts.poppins(
                            fontSize: 11,
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

            // 3. Message Input Area (Fixed Bottom Bar with WhatsApp Attachment Trigger)
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
                    // Attachment Icon Button opening WhatsApp-style File Modal
                    IconButton(
                      icon: const Icon(
                        Icons.attach_file_rounded,
                        color: textSecondary,
                        size: 24,
                      ),
                      onPressed: () => _showAttachmentModal(context),
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
                          controller: _messageController,
                          onSubmitted: (_) => _sendMessage(),
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
                        onPressed: _sendMessage,
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
