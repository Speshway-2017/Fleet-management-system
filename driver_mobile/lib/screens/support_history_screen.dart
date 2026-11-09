import '../services/localization_service.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import '../utils/navigation_helper.dart';
import 'raise_ticket_screen.dart';
import 'ticket_details_screen.dart';
import 'contact_fleet_manager_screen.dart';
import 'main_navigation_screen.dart';

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
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  // Static cache for instantaneous 0ms screen loading (Stale-While-Revalidate pattern)
  static List<SupportTicketItem>? _cachedTickets;
  static bool? _cachedIsVehicleAssigned;

  bool _isLoading = false;
  bool _isVehicleAssigned = false;
  List<SupportTicketItem> _tickets = [];

  @override
  void initState() {
    super.initState();
    if (_cachedTickets != null) {
      _tickets = _cachedTickets!;
      _isVehicleAssigned = _cachedIsVehicleAssigned ?? false;
      _isLoading = false;
    } else {
      _isLoading = true;
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted && _isLoading) setState(() => _isLoading = false);
      });
    }
    _loadTickets();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadTickets() async {
    // Only show full loader if there is no cached data to display
    if (_tickets.isEmpty && _cachedTickets == null) {
      setState(() {
        _isLoading = true;
      });
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted && _isLoading) setState(() => _isLoading = false);
      });
    }

    try {
      // Fetch vehicle assignment and driver tickets concurrently via Future.wait
      final results = await Future.wait([
        ApiService.getAssignedVehicle().catchError((_) => null),
        ApiService.getDriverTickets().catchError((_) => null),
      ]);

      final vehRes = results[0];
      final res = results[1];

      bool assigned = false;
      if (vehRes != null && vehRes['success'] == true) {
        final vData = vehRes['data'];
        if (vData != null && vData['assigned'] == true && vData['vehicle'] != null) {
          assigned = true;
        }
      }

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

      _cachedTickets = fetched;
      _cachedIsVehicleAssigned = assigned;

      if (mounted) {
        setState(() {
          _isVehicleAssigned = assigned;
          _tickets = fetched;
        });
      }
    } catch (e) {
      debugPrint('Failed to load driver tickets from API: $e');
      if (mounted && _tickets.isEmpty) {
        setState(() {
          _isVehicleAssigned = false;
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

  Future<void> _openRaiseTicket(BuildContext context) async {
    if (!_isVehicleAssigned) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('No vehicle is currently assigned. Vehicle issue reporting will unlock once a vehicle is assigned.'),
          backgroundColor: Color(0xFF0F172A),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }
    final res = await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const RaiseTicketScreen()),
    );
    if (res == true) {
      _loadTickets();
    }
  }

  List<SupportTicketItem> get _filteredTickets {
    var list = _tickets;
    if (_selectedFilterIndex != 0) {
      final filterName = _filters[_selectedFilterIndex];
      list = list.where((t) => t.status == filterName).toList();
    }
    if (_searchQuery.trim().isNotEmpty) {
      final q = _searchQuery.trim().toLowerCase();
      list = list.where((t) {
        return t.ticketId.toLowerCase().contains(q) ||
            t.issueCategory.toLowerCase().contains(q) ||
            t.vehicleNumber.toLowerCase().contains(q) ||
            t.priority.toLowerCase().contains(q) ||
            t.description.toLowerCase().contains(q) ||
            t.tripId.toLowerCase().contains(q);
      }).toList();
    }
    return list;
  }

  @override
  Widget build(BuildContext context) {
    const primaryDark = Color(0xFF101C2C);
    const bgLight = Color(0xFFF7F8FA);
    const borderGray = Color(0xFFE2E8F0);
    const textPrimary = Color(0xFF1F2937);
    const textSecondary = Color(0xFF6B7280);
    const primaryOrange = Color(0xFFFF7A1A);

    return ValueListenableBuilder<String>(
      valueListenable: LocalizationService.currentLanguageNotifier,
      builder: (context, currentLanguage, _) {
        return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop) SafeNavigation.pop(context, fallbackTab: 2);
      },
      child: Scaffold(
        backgroundColor: bgLight,
        appBar: AppBar(
          backgroundColor: primaryDark,
          elevation: 0,
          centerTitle: false,
          titleSpacing: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
            onPressed: () => SafeNavigation.pop(context, fallbackTab: 2),
          ),
        title: Text(
          'Support & Tickets'.tr,
          style: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        actions: const [],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          color: const Color(0xFFF97316),
          backgroundColor: Colors.white,
          onRefresh: () async {
            _cachedTickets = null;
            _cachedIsVehicleAssigned = null;
            ApiService.clearApiCache('/driver/tickets');
            ApiService.clearApiCache('/driver/vehicle');
            await Future.any([
              _loadTickets(),
              Future.delayed(const Duration(milliseconds: 500)),
            ]);
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
            padding: const EdgeInsets.all(16.0),
            child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (!_isVehicleAssigned) ...[
                Container(
                  width: double.infinity,
                  margin: const EdgeInsets.only(bottom: 16.0),
                  padding: const EdgeInsets.all(14.0),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFF6FF), // Light blue box
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFBFDBFE)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(
                        Icons.info_outline_rounded,
                        color: Color(0xFF2563EB),
                        size: 20,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'No vehicle is currently assigned. You can view your previous records, but new maintenance tickets will be available once a vehicle is assigned.',
                          style: GoogleFonts.nunito(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF1E40AF),
                            height: 1.4,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              // Subtitle Banner Description
              Text(
                'Track and manage your vehicle issues and support requests.'.tr,
                style: GoogleFonts.nunito(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: textSecondary,
                ),
              ),
              const SizedBox(height: 16.0),

              // 1. Search Bar & Filter Bar
              Row(
                children: [
                  Expanded(
                    child: Container(
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
                              controller: _searchController,
                              onChanged: (val) {
                                setState(() {
                                  _searchQuery = val;
                                });
                              },
                              decoration: InputDecoration(
                                hintText: 'Search Ticket ID or Issue...'.tr,
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
                          if (_searchQuery.isNotEmpty)
                            GestureDetector(
                              onTap: () {
                                setState(() {
                                  _searchController.clear();
                                  _searchQuery = '';
                                });
                              },
                              child: const Icon(
                                Icons.close_rounded,
                                size: 18,
                                color: textSecondary,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 10.0),
                  // Filter Bar beside right to search bar
                  _buildFilterBar(context, primaryDark, primaryOrange, borderGray, textPrimary, textSecondary),
                ],
              ),

              const SizedBox(height: 12.0),

              // Call & Message Quick Action Buttons Row
              Row(
                children: [
                  Expanded(
                    child: _buildBodyActionButton(
                      context,
                      icon: Icons.phone_in_talk_rounded,
                      label: 'Call Manager'.tr,
                      color: const Color(0xFF10B981),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const ContactFleetManagerScreen()),
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 12.0),
                  Expanded(
                    child: _buildBodyActionButton(
                      context,
                      icon: Icons.chat_bubble_rounded,
                      label: 'Message Manager'.tr,
                      color: primaryOrange,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const ContactFleetManagerScreen()),
                        );
                      },
                    ),
                  ),
                ],
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
                                  'No Tickets Found'.tr,
                                  style: GoogleFonts.poppins(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'You haven\'t raised any support requests yet.'.tr,
                                  style: GoogleFonts.nunito(
                                    fontSize: 13,
                                    color: textSecondary,
                                  ),
                                ),
                                const SizedBox(height: 18),
                                SizedBox(
                                  width: double.infinity,
                                  height: 46,
                                  child: ElevatedButton.icon(
                                    onPressed: () => _openRaiseTicket(context),
                                    icon: Icon(
                                      _isVehicleAssigned ? Icons.add_circle_outline_rounded : Icons.lock_rounded,
                                      color: _isVehicleAssigned ? Colors.white : const Color(0xFFB45309),
                                      size: 18,
                                    ),
                                    label: Text(
                                      _isVehicleAssigned ? 'Report Vehicle Issue'.tr : 'Report Vehicle Issue (Locked)'.tr,
                                      style: GoogleFonts.poppins(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w700,
                                        color: _isVehicleAssigned ? Colors.white : const Color(0xFF0F172A),
                                      ),
                                    ),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: _isVehicleAssigned ? primaryOrange : const Color(0xFFFEF3C7),
                                      side: _isVehicleAssigned ? null : const BorderSide(color: Color(0xFFFCD34D), width: 1.5),
                                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                      elevation: _isVehicleAssigned ? 2 : 0,
                                    ),
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

              const SizedBox(height: 24.0),
            ],
          ),
        ),
      ),
    ),
    ),
    );
      },
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
                  ticket.status.tr,
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
                  ticket.issueCategory.tr,
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
                  ticket.priority.tr,
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
                      'VEHICLE'.tr,
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
                      'TRIP ID'.tr,
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
                      'RAISED DATE'.tr,
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
        padding: const EdgeInsets.symmetric(horizontal: 10.0),
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
            const SizedBox(width: 6.0),
            Flexible(
              child: Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.poppins(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterBar(
    BuildContext context,
    Color primaryDark,
    Color primaryOrange,
    Color borderGray,
    Color textPrimary,
    Color textSecondary,
  ) {
    final isFiltered = _selectedFilterIndex != 0;
    final currentFilter = _filters[_selectedFilterIndex];

    return PopupMenuButton<int>(
      initialValue: _selectedFilterIndex,
      tooltip: 'Filter Tickets',
      offset: const Offset(0, 52),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14.0),
        side: const BorderSide(color: Color(0xFFE2E8F0), width: 1.0),
      ),
      color: Colors.white,
      elevation: 6,
      onSelected: (int index) {
        setState(() {
          _selectedFilterIndex = index;
        });
      },
      itemBuilder: (BuildContext context) => <PopupMenuEntry<int>>[
        PopupMenuItem<int>(
          enabled: false,
          height: 32,
          child: Text(
            'FILTER BY STATUS'.tr,
            style: GoogleFonts.poppins(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: textSecondary,
              letterSpacing: 0.8,
            ),
          ),
        ),
        const PopupMenuDivider(height: 1),
        ...List.generate(_filters.length, (index) {
          final isSelected = _selectedFilterIndex == index;
          return PopupMenuItem<int>(
            value: index,
            height: 42,
            child: Row(
              children: [
                Icon(
                  isSelected
                      ? Icons.check_circle_rounded
                      : Icons.radio_button_unchecked_rounded,
                  color: isSelected ? primaryOrange : const Color(0xFF94A3B8),
                  size: 18,
                ),
                const SizedBox(width: 10),
                Text(
                  _filters[index].tr,
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected ? primaryDark : textPrimary,
                  ),
                ),
              ],
            ),
          );
        }),
      ],
      child: Container(
        height: 48,
        padding: const EdgeInsets.symmetric(horizontal: 12.0),
        decoration: BoxDecoration(
          color: isFiltered ? primaryDark : Colors.white,
          borderRadius: BorderRadius.circular(12.0),
          border: Border.all(
            color: isFiltered ? primaryDark : borderGray,
            width: 1.0,
          ),
          boxShadow: [
            BoxShadow(
              color: isFiltered ? primaryDark.withAlpha(30) : Colors.black.withAlpha(6),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.tune_rounded,
              size: 18,
              color: isFiltered ? Colors.white : primaryOrange,
            ),
            const SizedBox(width: 6),
            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 80),
              child: Text(
                currentFilter.tr,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.poppins(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: isFiltered ? Colors.white : textPrimary,
                ),
              ),
            ),
            const SizedBox(width: 2),
            Icon(
              Icons.keyboard_arrow_down_rounded,
              size: 18,
              color: isFiltered ? Colors.white70 : textSecondary,
            ),
          ],
        ),
      ),
    );
  }
}
