import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/api_service.dart';

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
/// Interactive ticket lifecycle management screen featuring:
/// - Dark Navy AppBar (#101C2C) with ticket ID & category subtitle
/// - Issue Type Rules Banner (Can Continue Trip: Yes / After Repair / No)
/// - Interactive 5-Step Repair Stepper
/// - Offline Assigned Mechanic Card with direct call action
/// - Driver Progress Action CTA ("Confirm Mechanic Arrived", "Start Repair", "Mark Repair Completed")
/// - Continue Trip Banner upon Manager Resolution
/// - Original Description card with Cloudinary photo thumbnail preview & full-screen modal
/// - Timeline & Conversation history
class TicketDetailsScreen extends StatefulWidget {
  final String ticketId;
  final String category;
  final String description;
  final String raisedDate;
  final String vehicleNumber;
  final String? attachmentUrl;

  const TicketDetailsScreen({
    super.key,
    this.ticketId = 'TK-1024',
    this.category = 'VEHICLE MAINTENANCE',
    this.description = 'Vehicle issue reported by driver.',
    this.raisedDate = 'Just now',
    this.vehicleNumber = 'Assigned Vehicle',
    this.attachmentUrl,
  });

  @override
  State<TicketDetailsScreen> createState() => _TicketDetailsScreenState();
}

class _TicketDetailsScreenState extends State<TicketDetailsScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _ticketData;
  String _currentStatus = 'Open';
  String _canContinueTrip = 'After Repair';
  Map<String, dynamic>? _assignedMechanic;
  List<dynamic> _repairTimeline = [];
  bool _isUpdating = false;

  @override
  void initState() {
    super.initState();
    _fetchTicketDetails();
  }

  Future<void> _fetchTicketDetails() async {
    try {
      final res = await ApiService.getDriverTicketById(widget.ticketId);
      final data = (res is Map && res['data'] != null) ? res['data'] : (res is Map ? res : null);

      if (data != null && mounted) {
        setState(() {
          _ticketData = Map<String, dynamic>.from(data);
          _currentStatus = data['status'] ?? 'Open';
          _canContinueTrip = data['canContinueTrip'] ?? 'After Repair';
          if (data['assignedMechanic'] != null && data['assignedMechanic'] is Map) {
            _assignedMechanic = Map<String, dynamic>.from(data['assignedMechanic']);
          }
          if (data['repairTimeline'] != null && data['repairTimeline'] is List) {
            _repairTimeline = List.from(data['repairTimeline']);
          }
        });
      }
    } catch (e) {
      debugPrint('Failed to load ticket details: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _updateStatus(String newStatus, String notes) async {
    setState(() {
      _isUpdating = true;
    });

    try {
      await ApiService.updateDriverTicketStatus(widget.ticketId, newStatus, notes: notes);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Status updated to "$newStatus"!'),
            backgroundColor: Colors.green.shade700,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
      await _fetchTicketDetails();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update status: ${e.toString().replaceAll('Exception:', '').trim()}'),
            backgroundColor: Colors.red.shade700,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isUpdating = false;
        });
      }
    }
  }

  Future<void> _makePhoneCall(String phoneNumber) async {
    if (phoneNumber.isEmpty) return;
    final Uri launchUri = Uri(scheme: 'tel', path: phoneNumber);
    try {
      if (await canLaunchUrl(launchUri)) {
        await launchUrl(launchUri);
      }
    } catch (e) {
      debugPrint('Could not launch phone call: $e');
    }
  }

  int _getStepIndex(String status) {
    switch (status) {
      case 'Open':
        return 0;
      case 'Mechanic Assigned':
        return 1;
      case 'Mechanic Arrived':
        return 2;
      case 'Repair In Progress':
        return 3;
      case 'Repair Completed':
        return 4;
      case 'Resolved':
      case 'Closed':
        return 5;
      default:
        return 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    const primaryDark = Color(0xFF101C2C);
    const bgLight = Color(0xFFF7F8FA);
    const borderGray = Color(0xFFE2E8F0);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const primaryOrange = Color(0xFFFF7A1A);

    final displayCategory = _ticketData?['issueType'] ?? widget.category;
    final displayDescription = _ticketData?['description'] ?? widget.description;
    final displayVehicle = _ticketData?['vehiclePlate'] ?? widget.vehicleNumber;
    final displayDate = widget.raisedDate;
    final displayAttachment = (_ticketData?['attachments'] is List && (_ticketData!['attachments'] as List).isNotEmpty)
        ? _ticketData!['attachments'][0]['url']
        : widget.attachmentUrl;

    final currentStep = _getStepIndex(_currentStatus);

    return Scaffold(
      backgroundColor: bgLight,
      appBar: AppBar(
        backgroundColor: primaryDark,
        elevation: 0,
        centerTitle: false,
        titleSpacing: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(true),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              widget.ticketId,
              style: GoogleFonts.poppins(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
            Text(
              displayCategory.toUpperCase(),
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
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: _currentStatus == 'Resolved' || _currentStatus == 'Closed'
                    ? const Color(0xFFDCFCE7)
                    : const Color(0xFFFEF3C7),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                _currentStatus.toUpperCase(),
                style: GoogleFonts.poppins(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: _currentStatus == 'Resolved' || _currentStatus == 'Closed'
                      ? const Color(0xFF15803D)
                      : const Color(0xFFD97706),
                ),
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: primaryOrange))
            : SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1. Can Continue Trip Rule Banner
                    _buildContinueTripBanner(_canContinueTrip),

                    const SizedBox(height: 14.0),

                    // 2. Repair Progress Stepper Card
                    _buildRepairStepper(currentStep),

                    const SizedBox(height: 16.0),

                    // 3. Assigned Mechanic Card (if mechanic assigned)
                    if (_assignedMechanic != null && (_assignedMechanic!['name'] ?? '').isNotEmpty)
                      _buildMechanicCard(_assignedMechanic!),

                    // 4. Driver Action Trigger CTA Buttons
                    if (_currentStatus == 'Mechanic Assigned') ...[
                      const SizedBox(height: 14.0),
                      _buildActionButton(
                        label: 'Confirm Mechanic Arrived 📍',
                        color: const Color(0xFF2563EB),
                        onPressed: () => _updateStatus('Mechanic Arrived', 'Mechanic arrived at location'),
                      ),
                    ] else if (_currentStatus == 'Mechanic Arrived') ...[
                      const SizedBox(height: 14.0),
                      _buildActionButton(
                        label: 'Start Repair 🔧',
                        color: primaryOrange,
                        onPressed: () => _updateStatus('Repair In Progress', 'Repair started by mechanic'),
                      ),
                    ] else if (_currentStatus == 'Repair In Progress') ...[
                      const SizedBox(height: 14.0),
                      _buildActionButton(
                        label: 'Mark Repair Completed ✅',
                        color: const Color(0xFF16A34A),
                        onPressed: () => _updateStatus('Repair Completed', 'Repair finished successfully'),
                      ),
                    ] else if (_currentStatus == 'Resolved') ...[
                      const SizedBox(height: 14.0),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16.0),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF0FDF4),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFBBF7D0)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.check_circle_rounded, color: Color(0xFF16A34A), size: 28),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Ticket Resolved - Continue Trip 🚚',
                                    style: GoogleFonts.poppins(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w700,
                                      color: const Color(0xFF14532D),
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'Vehicle status is active. Manager has approved resolution.',
                                    style: GoogleFonts.nunito(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: const Color(0xFF15803D),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    const SizedBox(height: 16.0),

                    // 5. Original Description Card
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
                                'Issue Details',
                                style: GoogleFonts.poppins(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                  color: textPrimary,
                                ),
                              ),
                              Text(
                                displayDate,
                                style: GoogleFonts.nunito(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: textSecondary,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6.0),
                          Row(
                            children: [
                              const Icon(Icons.directions_bus_rounded, size: 14, color: textSecondary),
                              const SizedBox(width: 4),
                              Text(
                                displayVehicle,
                                style: GoogleFonts.poppins(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: textSecondary,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10.0),
                          Text(
                            displayDescription,
                            style: GoogleFonts.nunito(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: textPrimary,
                              height: 1.45,
                            ),
                          ),
                          const SizedBox(height: 16.0),

                          // Attachments Section
                          if (displayAttachment != null && displayAttachment.isNotEmpty) ...[
                            Text(
                              'ATTACHED PHOTO',
                              style: GoogleFonts.poppins(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w600,
                                color: textSecondary,
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 8.0),
                            GestureDetector(
                              onTap: () {
                                showDialog(
                                  context: context,
                                  builder: (ctx) => Dialog(
                                    backgroundColor: Colors.transparent,
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(12),
                                      child: Image.network(
                                        displayAttachment,
                                        fit: BoxFit.contain,
                                        errorBuilder: (context, error, stackTrace) =>
                                            const Icon(Icons.broken_image, size: 80, color: Colors.white),
                                      ),
                                    ),
                                  ),
                                );
                              },
                              child: Container(
                                width: 110,
                                height: 85,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(10.0),
                                  border: Border.all(color: borderGray),
                                ),
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(9.0),
                                  child: Image.network(
                                    displayAttachment,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) {
                                      return Container(
                                        color: const Color(0xFF1E293B),
                                        child: const Center(
                                          child: Icon(Icons.image_rounded, color: Colors.white70, size: 28),
                                        ),
                                      );
                                    },
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),

                    const SizedBox(height: 20.0),

                    // 6. Repair History Timeline
                    Text(
                      'Repair Activity Timeline',
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: textPrimary,
                      ),
                    ),
                    const SizedBox(height: 12.0),

                    if (_repairTimeline.isNotEmpty)
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _repairTimeline.length,
                        separatorBuilder: (context, index) => const SizedBox(height: 10),
                        itemBuilder: (context, index) {
                          final item = _repairTimeline[index];
                          final statusStr = item['status'] ?? 'Updated';
                          final updatedBy = item['updatedBy'] ?? 'System';
                          final notesStr = item['notes'] ?? '';
                          final timeStr = item['updatedAt'] != null
                              ? item['updatedAt'].toString().substring(0, 10)
                              : '';

                          return Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: borderGray),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: primaryOrange.withAlpha(20),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.build_rounded, size: 16, color: primaryOrange),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            statusStr,
                                            style: GoogleFonts.poppins(
                                              fontSize: 13,
                                              fontWeight: FontWeight.w700,
                                              color: textPrimary,
                                            ),
                                          ),
                                          Text(
                                            timeStr,
                                            style: GoogleFonts.nunito(
                                              fontSize: 11,
                                              color: textSecondary,
                                            ),
                                          ),
                                        ],
                                      ),
                                      Text(
                                        '$updatedBy • $notesStr',
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
                          );
                        },
                      )
                    else
                      Text(
                        'No progress updates logged yet.',
                        style: GoogleFonts.nunito(fontSize: 13, color: textSecondary),
                      ),

                    const SizedBox(height: 30.0),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildContinueTripBanner(String rule) {
    Color bg = const Color(0xFFEFF6FF);
    Color border = const Color(0xFFBFDBFE);
    Color textColor = const Color(0xFF1D4ED8);
    IconData icon = Icons.info_rounded;
    String title = 'Trip Flow: Allowed';
    String desc = 'You can continue your trip safely while support handles this ticket.';

    if (rule == 'No') {
      bg = const Color(0xFFFEF2F2);
      border = const Color(0xFFFECACA);
      textColor = const Color(0xFFDC2626);
      icon = Icons.warning_rounded;
      title = 'Trip Flow: Park & Wait (Breakdown)';
      desc = 'Vehicle requires immediate repair. Do not drive until resolved.';
    } else if (rule == 'After Repair') {
      bg = const Color(0xFFFFFBEB);
      border = const Color(0xFFFDE68A);
      textColor = const Color(0xFFD97706);
      icon = Icons.handyman_rounded;
      title = 'Trip Flow: Wait For Repair';
      desc = 'Please park safely and wait for mechanic arrival to complete repair.';
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14.0),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: border),
      ),
      child: Row(
        children: [
          Icon(icon, color: textColor, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: textColor,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  desc,
                  style: GoogleFonts.nunito(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: textColor.withAlpha(220),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRepairStepper(int currentStep) {
    final steps = ['Open', 'Assigned', 'Arrived', 'In Repair', 'Completed'];

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16.0),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Repair Stage Progress',
            style: GoogleFonts.poppins(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: List.generate(steps.length, (index) {
              final isPassed = index <= currentStep;
              final isCurrent = index == currentStep;
              final isLast = index == steps.length - 1;

              return Expanded(
                child: Row(
                  children: [
                    Column(
                      children: [
                        Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: isPassed
                                ? (isCurrent ? const Color(0xFFFF7A1A) : const Color(0xFF101C2C))
                                : const Color(0xFFE2E8F0),
                          ),
                          child: Center(
                            child: isPassed && !isCurrent
                                ? const Icon(Icons.check_rounded, color: Colors.white, size: 14)
                                : Text(
                                    '${index + 1}',
                                    style: GoogleFonts.poppins(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w700,
                                      color: isPassed ? Colors.white : const Color(0xFF6B7280),
                                    ),
                                  ),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          steps[index],
                          style: GoogleFonts.poppins(
                            fontSize: 9.5,
                            fontWeight: isCurrent ? FontWeight.w700 : FontWeight.w500,
                            color: isPassed ? const Color(0xFF1F2937) : const Color(0xFF94A3B8),
                          ),
                        ),
                      ],
                    ),
                    if (!isLast)
                      Expanded(
                        child: Container(
                          height: 2,
                          margin: const EdgeInsets.only(bottom: 14),
                          color: index < currentStep ? const Color(0xFF101C2C) : const Color(0xFFE2E8F0),
                        ),
                      ),
                  ],
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildMechanicCard(Map<String, dynamic> mechanic) {
    final name = mechanic['name'] ?? 'Assigned Mechanic';
    final phone = mechanic['phone'] ?? '';
    final location = mechanic['location'] ?? 'Nearest Service Spot';

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 16.0),
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(16.0),
        border: Border.all(color: const Color(0xFFCBD5E1)),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFF101C2C),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.build_circle_rounded, color: Colors.white, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: GoogleFonts.poppins(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF1F2937),
                  ),
                ),
                Text(
                  'Location: $location',
                  style: GoogleFonts.nunito(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF6B7280),
                  ),
                ),
                if (phone.isNotEmpty)
                  Text(
                    'Phone: $phone',
                    style: GoogleFonts.nunito(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF2563EB),
                    ),
                  ),
              ],
            ),
          ),
          if (phone.isNotEmpty)
            IconButton(
              onPressed: () => _makePhoneCall(phone),
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(
                  color: Color(0xFF16A34A),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.phone_rounded, color: Colors.white, size: 18),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required String label,
    required Color color,
    required VoidCallback onPressed,
  }) {
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: ElevatedButton(
        onPressed: _isUpdating ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14.0),
          ),
          textStyle: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
        child: _isUpdating
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
              )
            : Text(label),
      ),
    );
  }
}
