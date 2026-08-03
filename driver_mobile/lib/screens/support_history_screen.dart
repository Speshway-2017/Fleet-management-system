import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import 'raise_ticket_screen.dart';
import 'ticket_details_screen.dart';
import 'calling_fleet_manager_screen.dart';
import 'message_fleet_manager_screen.dart';

/// Representation of a Support Ticket data item.
class SupportTicketItem {
  final String ticketId;
  final String issueCategory;
  final String vehicleNumber;
  final String tripId;
  final String priority;
  final String status;
  final String raisedDate;
  final String description;
  final String? attachmentUrl;
  final Color statusBg;
  final Color statusText;

  const SupportTicketItem({
    required this.ticketId,
    required this.issueCategory,
    required this.vehicleNumber,
    required this.tripId,
    required this.priority,
    required this.status,
    required this.raisedDate,
    this.description = '',
    this.attachmentUrl,
    required this.statusBg,
    required this.statusText,
  });
}

/// Driver Module - Support History Screen
/// 
/// Replicates the Fleet Management design system with Dark Navy header (#101C2C),
/// Orange primary CTA (#FF7A1A), search bar, filter chips (All, Open, In Progress,
/// Resolved, Rejected), realistic Indian fleet issue ticket cards, and a Raise Ticket FAB.
class SupportHistoryScreen extends StatefulWidget {
  const SupportHistoryScreen({super.key});

  @override
  State<SupportHistoryScreen> createState() => _SupportHistoryScreenState();
}

class _SupportHistoryScreenState extends State<SupportHistoryScreen> {
  int _selectedFilterIndex = 0;
  final List<String> _filters = ['All', 'Open', 'In Progress', 'Resolved', 'Rejected'];

  bool _isLoading = false;
  List<SupportTicketItem> _tickets = [];

  @override
  void initState() {
    super.initState();
    _loadTickets();
  }

  @override
  void dispose() {
    super.dispose();
  }

  Future<void> _loadTickets() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final res = await ApiService.getDriverTickets();
      final List data = (res is Map && res['data'] != null)
          ? res['data']
          : (res is List ? res : []);

      final List<SupportTicketItem> fetched = data.map((t) {
        final status = t['status'] ?? 'Open';
        Color bg = const Color(0xFFFFEDD5);
        Color textClr = const Color(0xFFC2410C);

        if (status == 'Mechanic Assigned' || status == 'Mechanic Arrived') {
          bg = const Color(0xFFE0F2FE);
          textClr = const Color(0xFF0369A1);
        } else if (status == 'Repair In Progress' || status == 'In Progress') {
          bg = const Color(0xFFFEF3C7);
          textClr = const Color(0xFFD97706);
        } else if (status == 'Repair Completed') {
          bg = const Color(0xFFDCFCE7);
          textClr = const Color(0xFF16A34A);
        } else if (status == 'Resolved') {
          bg = const Color(0xFFDCFCE7);
          textClr = const Color(0xFF15803D);
        } else if (status == 'Closed') {
          bg = const Color(0xFFF1F5F9);
          textClr = const Color(0xFF475569);
        } else if (status == 'Rejected') {
          bg = const Color(0xFFFEE2E2);
          textClr = const Color(0xFFDC2626);
        }

        final attachments = t['attachments'] as List?;
        String? attachUrl;
        if (attachments != null && attachments.isNotEmpty) {
          attachUrl = attachments.first['url'];
        }

        final tripObj = t['trip'];
        final vehicleObj = t['vehicle'];
        final tripIdStr = tripObj != null && tripObj is Map
            ? (tripObj['tripNumber'] ?? 'TRP-9901')
            : 'TRP-9901';
        final vehPlateStr = t['vehiclePlate'] ??
            (vehicleObj != null && vehicleObj is Map
                ? (vehicleObj['registrationNumber'] ?? vehicleObj['plateNumber'] ?? 'Assigned Vehicle')
                : 'Assigned Vehicle');

        final rawDate = t['reportedAt'] ?? t['createdAt'];
        String formattedDate = 'Recently';
        if (rawDate != null) {
          try {
            final d = DateTime.parse(rawDate.toString());
            formattedDate = '${d.day}/${d.month}/${d.year}';
          } catch (_) {}
        }

        return SupportTicketItem(
          ticketId: t['ticketId'] ?? 'TKT-1000',
          issueCategory: t['issueType'] ?? 'Vehicle Maintenance',
          vehicleNumber: vehPlateStr,
          tripId: tripIdStr,
          priority: t['severity'] ?? 'Medium',
          status: status,
          raisedDate: formattedDate,
          description: t['description'] ?? '',
          attachmentUrl: attachUrl,
          statusBg: bg,
          statusText: textClr,
        );
      }).toList();

      if (mounted) {
        setState(() {
          _tickets = fetched;
        });
      }
    } catch (e) {
      debugPrint('Failed to load driver tickets from API: $e');
      if (mounted) {
        setState(() {
          _tickets = [];
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  List<SupportTicketItem> get _filteredTickets {
    final list = _tickets;
    if (_selectedFilterIndex == 0) return list;
    final filterName = _filters[_selectedFilterIndex];
    return list.where((t) => t.status == filterName).toList();
  }

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
        titleSpacing: 16.0,
        automaticallyImplyLeading: false,
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8.0),
              ),
              padding: const EdgeInsets.all(4.0),
              child: Image.asset(
                'assets/logo.png',
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) {
                  return Image.asset(
                    'assets/images/logo.png',
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) {
                      return const Icon(
                        Icons.local_shipping_rounded,
                        color: primaryDark,
                        size: 20,
                      );
                    },
                  );
                },
              ),
            ),
            const SizedBox(width: 12),
            Text(
              'Support History',
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Subtitle Banner Description
              Text(
                'Track and manage your vehicle issues and support requests.',
                style: GoogleFonts.nunito(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: textSecondary,
                ),
              ),
              const SizedBox(height: 16.0),

              // 1. Search Bar
              Container(
                height: 48,
                padding: const EdgeInsets.symmetric(horizontal: 14.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12.0),
                  border: Border.all(color: borderGray, width: 1.0),
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
                    const Icon(
                      Icons.search_rounded,
                      color: textSecondary,
                      size: 22,
                    ),
                    const SizedBox(width: 10.0),
                    Expanded(
                      child: TextField(
                        readOnly: true,
                        decoration: InputDecoration(
                          hintText: 'Search Ticket ID or Issue...',
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
                  ],
                ),
              ),

              const SizedBox(height: 12.0),

              // Call & Message Quick Action Buttons Row
              Row(
                children: [
                  Expanded(
                    child: _buildBodyActionButton(
                      context,
                      icon: Icons.phone_in_talk_rounded,
                      label: 'Call Manager',
                      color: const Color(0xFF10B981),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const CallingFleetManagerScreen()),
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 12.0),
                  Expanded(
                    child: _buildBodyActionButton(
                      context,
                      icon: Icons.chat_bubble_rounded,
                      label: 'Message Manager',
                      color: primaryOrange,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const MessageFleetManagerScreen()),
                        );
                      },
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16.0),

              // Filter Chips Row
              SizedBox(
                height: 36,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  itemCount: _filters.length,
                  separatorBuilder: (context, index) => const SizedBox(width: 8.0),
                  itemBuilder: (context, index) {
                    final isSelected = _selectedFilterIndex == index;
                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          _selectedFilterIndex = index;
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? primaryDark : Colors.white,
                          borderRadius: BorderRadius.circular(20.0),
                          border: Border.all(
                            color: isSelected ? primaryDark : borderGray,
                            width: 1.0,
                          ),
                          boxShadow: isSelected
                              ? [
                                  BoxShadow(
                                    color: primaryDark.withAlpha(40),
                                    blurRadius: 6,
                                    offset: const Offset(0, 2),
                                  ),
                                ]
                              : null,
                        ),
                        child: Text(
                          _filters[index],
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                            color: isSelected ? Colors.white : textPrimary,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 20.0),

              // 3. Ticket List
              _isLoading
                  ? const Center(
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 32.0),
                        child: CircularProgressIndicator(color: primaryOrange),
                      ),
                    )
                  : _filteredTickets.isEmpty
                      ? Center(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 40.0),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.support_agent_outlined,
                                  size: 64,
                                  color: textSecondary.withValues(alpha: 0.4),
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'No Tickets Found',
                                  style: GoogleFonts.poppins(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'You haven\'t raised any support requests yet.',
                                  style: GoogleFonts.nunito(
                                    fontSize: 13,
                                    color: textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                      : ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _filteredTickets.length,
                          separatorBuilder: (context, index) => const SizedBox(height: 14.0),
                          itemBuilder: (context, index) {
                            final ticket = _filteredTickets[index];
                            return _buildTicketCard(context, ticket);
                          },
                        ),

              const SizedBox(height: 80.0), // Padding for FAB space
            ],
          ),
        ),
      ),

      // 4. Circular (+) Floating Action Button
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final res = await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const RaiseTicketScreen(),
            ),
          );
          if (res == true) {
            _loadTickets();
          }
        },
        backgroundColor: primaryOrange,
        elevation: 4,
        shape: const CircleBorder(),
        child: const Icon(Icons.add_rounded, color: Colors.white, size: 28),
      ),
    );
  }

  Widget _buildTicketCard(BuildContext context, SupportTicketItem ticket) {
    const borderGray = Color(0xFFE2E8F0);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const primaryOrange = Color(0xFFFF7A1A);

    // Priority pill colors
    Color priorityBg = const Color(0xFFFEF3C7);
    Color priorityText = const Color(0xFFD97706);
    if (ticket.priority == 'High') {
      priorityBg = const Color(0xFFFEE2E2);
      priorityText = const Color(0xFFDC2626);
    } else if (ticket.priority == 'Low') {
      priorityBg = const Color(0xFFE0F2FE);
      priorityText = const Color(0xFF0284C7);
    }

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => TicketDetailsScreen(
              ticketId: ticket.ticketId,
              category: ticket.issueCategory,
              description: ticket.description.isNotEmpty
                  ? ticket.description
                  : 'Vehicle issue reported by driver.',
              vehicleNumber: ticket.vehicleNumber,
              raisedDate: ticket.raisedDate,
              attachmentUrl: ticket.attachmentUrl,
            ),
          ),
        );
      },
      child: Container(
      padding: const EdgeInsets.all(16.0),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row: Ticket ID & Status Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  '#${ticket.ticketId}',
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.poppins(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w700,
                    color: primaryOrange,
                  ),
                ),
              ),
              const SizedBox(width: 8.0),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: ticket.statusBg,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  ticket.status,
                  style: GoogleFonts.poppins(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w700,
                    color: ticket.statusText,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 8.0),

          // Issue Title & Priority Tag
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  ticket.issueCategory,
                  style: GoogleFonts.poppins(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: textPrimary,
                  ),
                ),
              ),
              const SizedBox(width: 8.0),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: priorityBg,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  ticket.priority,
                  style: GoogleFonts.poppins(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w700,
                    color: priorityText,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12.0),
          const Divider(color: borderGray, height: 1.0),
          const SizedBox(height: 12.0),

          // Details Grid (Vehicle, Trip, Date) & Chevron Arrow
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'VEHICLE',
                      style: GoogleFonts.poppins(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w600,
                        color: textSecondary,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 2.0),
                    Text(
                      ticket.vehicleNumber,
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'TRIP ID',
                      style: GoogleFonts.poppins(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w600,
                        color: textSecondary,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 2.0),
                    Text(
                      ticket.tripId,
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'RAISED DATE',
                      style: GoogleFonts.poppins(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w600,
                        color: textSecondary,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 2.0),
                    Text(
                      ticket.raisedDate,
                      style: GoogleFonts.nunito(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                        color: textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.chevron_right_rounded,
                color: textSecondary,
                size: 20,
              ),
            ],
          ),
        ],
      ),
    ),
    );
  }

  Widget _buildBodyActionButton(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 44,
        decoration: BoxDecoration(
          color: color.withAlpha(20),
          borderRadius: BorderRadius.circular(12.0),
          border: Border.all(color: color.withAlpha(80), width: 1.2),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: color,
              size: 18,
            ),
            const SizedBox(width: 8.0),
            Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
