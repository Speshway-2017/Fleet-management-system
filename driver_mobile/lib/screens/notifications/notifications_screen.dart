import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../repositories/notification_repository.dart';
import '../../services/api_service.dart';
import '../../services/localization_service.dart';
import '../../services/socket_service.dart';
import '../../theme/app_colors.dart';
import '../../utils/date_formatter.dart';
import '../../utils/navigation_helper.dart';
import '../../widgets/custom_app_bar.dart';
import '../main_navigation_screen.dart';
import '../trip_details_screen.dart';
import 'notification_details_screen.dart';

class NotificationItem {
  final String id;
  final String title;
  final String description;
  final String timestamp;
  final String category; // 'TODAY' or 'YESTERDAY'
  bool isRead;
  final IconData icon;
  final String? tripId;
  final String? type;

  NotificationItem({
    required this.id,
    required this.title,
    required this.description,
    required this.timestamp,
    required this.category,
    required this.isRead,
    required this.icon,
    this.tripId,
    this.type,
  });
}

class NotificationsScreen extends StatefulWidget {
  static List<NotificationItem> notifications = [];
  static final ValueNotifier<int> unreadCountNotifier = ValueNotifier<int>(0);

  const NotificationsScreen({super.key});

  static Future<void> fetchNotificationsFromServer() async {
    try {
      final res = await ApiService.getDriverNotifications();
      if (res != null && res['data'] is List) {
        final List list = res['data'];
        final fetched = list.map((item) {
          final typeStr = item['type']?.toString() ?? '';
          final tId = item['metadata']?['tripId']?.toString() ?? item['referenceId']?.toString() ?? '';
          IconData iconData = Icons.notifications_none_outlined;
          if (typeStr == 'trip_assigned') {
            iconData = Icons.assignment_ind_outlined;
          } else if (typeStr == 'trip_updated') {
            iconData = Icons.edit_calendar_outlined;
          } else if (typeStr == 'trip_status_changed') {
            iconData = Icons.sync_outlined;
          }

          return NotificationItem(
            id: item['_id'] ?? item['id'] ?? DateTime.now().millisecondsSinceEpoch.toString(),
            title: item['title'] ?? 'Fleet Notification',
            description: item['message'] ?? item['description'] ?? '',
            timestamp: formatNotificationTime(item['createdAt']),
            category: getNotificationCategory(item['createdAt']),
            isRead: item['isRead'] ?? false,
            icon: iconData,
            tripId: tId,
            type: typeStr,
          );
        }).toList();

        NotificationsScreen.notifications = fetched;
        NotificationsScreen.unreadCountNotifier.value = fetched.where((n) => !n.isRead).length;
      } else {
        NotificationsScreen.notifications = [];
        NotificationsScreen.unreadCountNotifier.value = 0;
      }
    } catch (_) {}
  }

  static void markAsReadStatic(String id) {
    if (id.isEmpty) return;
    final index = notifications.indexWhere((n) => n.id == id);
    if (index != -1) {
      if (notifications[index].isRead) return;
      notifications[index].isRead = true;
      unreadCountNotifier.value = notifications.where((n) => !n.isRead).length;
    }
    ApiService.patch('/driver/notifications/$id/read', {}).catchError((_) {});
  }

  static void deleteNotificationStatic(String id) {
    if (id.isEmpty) return;
    notifications.removeWhere((n) => n.id == id);
    unreadCountNotifier.value = notifications.where((n) => !n.isRead).length;
    ApiService.delete('/driver/notifications/$id').catchError((_) {});
  }

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<NotificationItem> get _notifications => NotificationsScreen.notifications;

  int _selectedFilterIndex = 0; // 0: Total, 1: Read, 2: Unread

  @override
  void initState() {
    super.initState();
    MainNavigationScreen.selectedTabNotifier.addListener(_onTabChanged);
    _fetchServerNotifications();
    SocketService.onEvent('notification:new', (_) {
      if (mounted) _fetchServerNotifications();
    });
  }

  Future<void> _fetchServerNotifications() async {
    await NotificationsScreen.fetchNotificationsFromServer();
    if (mounted) {
      setState(() {});
    }
  }

  @override
  void dispose() {
    MainNavigationScreen.selectedTabNotifier.removeListener(_onTabChanged);
    super.dispose();
  }

  void _onTabChanged() {
    if (mounted && MainNavigationScreen.selectedTabNotifier.value == 3) {
      setState(() {});
    }
  }

  void _markAllAsRead() async {
    setState(() {
      for (var item in _notifications) {
        item.isRead = true;
      }
      NotificationsScreen.unreadCountNotifier.value = 0;
    });
    try {
      await NotificationRepository().markAllAsRead();
    } catch (_) {
      ApiService.patch('/driver/notifications/read-all', {}).catchError((_) {});
    }
    if (mounted && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('All notifications marked as read.'),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  void _toggleReadStatus(NotificationItem item) async {
    if (!item.isRead) {
      setState(() {
        item.isRead = true;
        NotificationsScreen.markAsReadStatic(item.id);
      });
      try {
        await NotificationRepository().markAsRead(item.id);
      } catch (e) {
        debugPrint('Failed to mark notification as read: $e');
      }
    }
  }

  void _deleteNotification(NotificationItem item) {
    setState(() {
      NotificationsScreen.notifications.removeWhere((n) => n.id == item.id);
      NotificationsScreen.unreadCountNotifier.value =
          NotificationsScreen.notifications.where((n) => !n.isRead).length;
    });

    ApiService.delete('/driver/notifications/${item.id}').catchError((_) {});

    if (mounted && context.mounted) {
      final messenger = ScaffoldMessenger.of(context);
      messenger.clearSnackBars();
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            'Notification deleted',
            style: GoogleFonts.poppins(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: Colors.white,
            ),
          ),
          backgroundColor: const Color(0xFF1E293B),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          duration: const Duration(milliseconds: 1500),
        ),
      );
      Future.delayed(const Duration(milliseconds: 1600), () {
        if (mounted) {
          messenger.hideCurrentSnackBar();
        }
      });
    }
  }

  ({
    Color accent,
    Color accentDark,
    Color tint,
    Color border,
    String badgeLabel,
  }) _getNotificationTheme(NotificationItem item) {
    final typeLower = (item.type ?? '').toLowerCase();
    final titleLower = item.title.toLowerCase();
    final combined = '$typeLower $titleLower';

    if (typeLower == 'trip_assigned' ||
        combined.contains('assign') ||
        combined.contains('dispatch')) {
      return (
        accent: const Color(0xFF2563EB),
        accentDark: const Color(0xFF1D4ED8),
        tint: const Color(0xFFEFF6FF),
        border: const Color(0xFFBFDBFE),
        badgeLabel: 'TRIP ASSIGNED',
      );
    }
    if (combined.contains('alert') ||
        combined.contains('reject') ||
        combined.contains('cancel') ||
        combined.contains('critical') ||
        combined.contains('security') ||
        combined.contains('overdue')) {
      return (
        accent: const Color(0xFFDC2626),
        accentDark: const Color(0xFFB91C1C),
        tint: const Color(0xFFFEF2F2),
        border: const Color(0xFFFECACA),
        badgeLabel: 'ALERT',
      );
    }
    if (typeLower == 'trip_updated' ||
        combined.contains('update') ||
        combined.contains('schedule') ||
        combined.contains('maintenance') ||
        combined.contains('service')) {
      return (
        accent: const Color(0xFFEA580C),
        accentDark: const Color(0xFFC2410C),
        tint: const Color(0xFFFFF7ED),
        border: const Color(0xFFFED7AA),
        badgeLabel: 'SCHEDULE',
      );
    }
    if (typeLower == 'trip_status_changed' ||
        combined.contains('complete') ||
        combined.contains('approved') ||
        combined.contains('success') ||
        combined.contains('status')) {
      return (
        accent: const Color(0xFF059669),
        accentDark: const Color(0xFF047857),
        tint: const Color(0xFFECFDF5),
        border: const Color(0xFFA7F3D0),
        badgeLabel: 'STATUS',
      );
    }
    if (combined.contains('fuel') || combined.contains('expense')) {
      return (
        accent: const Color(0xFFD97706),
        accentDark: const Color(0xFFB45309),
        tint: const Color(0xFFFFFBEB),
        border: const Color(0xFFFDE68A),
        badgeLabel: 'FUEL',
      );
    }
    return (
      accent: const Color(0xFF7C3AED),
      accentDark: const Color(0xFF6D28D9),
      tint: const Color(0xFFF5F3FF),
      border: const Color(0xFFDDD6FE),
      badgeLabel: 'FLEET NOTICE',
    );
  }

  Widget _buildFilterBar({
    required int totalCount,
    required int unreadCount,
    required int readCount,
  }) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      decoration: const BoxDecoration(
        color: Color(0xFFF4F6FA),
        border: Border(
          bottom: BorderSide(color: Color(0xFFE6ECF4), width: 1),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: _buildFilterKpiCard(
              label: 'All',
              count: totalCount,
              filterIndex: 0,
              icon: Icons.inbox_rounded,
              accent: const Color(0xFF2563EB),
              accentDark: const Color(0xFF1D4ED8),
              tint: const Color(0xFFEFF6FF),
              border: const Color(0xFFBFDBFE),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildFilterKpiCard(
              label: 'Unread',
              count: unreadCount,
              filterIndex: 2,
              icon: Icons.mark_email_unread_rounded,
              accent: const Color(0xFFEA580C),
              accentDark: const Color(0xFFC2410C),
              tint: const Color(0xFFFFF7ED),
              border: const Color(0xFFFED7AA),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildFilterKpiCard(
              label: 'Read',
              count: readCount,
              filterIndex: 1,
              icon: Icons.mark_email_read_rounded,
              accent: const Color(0xFF059669),
              accentDark: const Color(0xFF047857),
              tint: const Color(0xFFECFDF5),
              border: const Color(0xFFA7F3D0),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterKpiCard({
    required String label,
    required int count,
    required int filterIndex,
    required IconData icon,
    required Color accent,
    required Color accentDark,
    required Color tint,
    required Color border,
  }) {
    final isSelected = _selectedFilterIndex == filterIndex;

    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedFilterIndex = filterIndex;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: isSelected ? [accent, accentDark] : [Colors.white, tint],
          ),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? accentDark : border,
            width: isSelected ? 1.2 : 1.0,
          ),
          boxShadow: [
            BoxShadow(
              color: isSelected
                  ? accent.withValues(alpha: 0.28)
                  : accent.withValues(alpha: 0.06),
              blurRadius: isSelected ? 10 : 6,
              offset: Offset(0, isSelected ? 4 : 2),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 14,
              color: isSelected ? Colors.white : accent,
            ),
            const SizedBox(width: 5),
            Flexible(
              child: Text(
                label,
                style: GoogleFonts.poppins(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w600,
                  color: isSelected ? Colors.white : const Color(0xFF1E293B),
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 5),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
              decoration: BoxDecoration(
                color: isSelected
                    ? Colors.white.withValues(alpha: 0.22)
                    : accent.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                '$count',
                style: GoogleFonts.poppins(
                  fontSize: 10.5,
                  fontWeight: FontWeight.w700,
                  color: isSelected ? Colors.white : accent,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader({
    required String title,
    required int count,
    required Color accent,
    required Color tint,
    required Color border,
    required IconData icon,
    bool showMarkAllAction = false,
  }) {
    return Row(
      children: [
        Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            color: tint,
            borderRadius: BorderRadius.circular(7),
            border: Border.all(color: border, width: 1),
          ),
          child: Icon(icon, size: 13, color: accent),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Row(
            children: [
              Flexible(
                child: Text(
                  title,
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF334155),
                    letterSpacing: 0.8,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 7),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 1.5),
                decoration: BoxDecoration(
                  color: tint,
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: border, width: 0.8),
                ),
                child: Text(
                  '$count',
                  style: GoogleFonts.poppins(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w700,
                    color: accent,
                  ),
                ),
              ),
            ],
          ),
        ),
        if (showMarkAllAction) ...[
          const SizedBox(width: 8),
          GestureDetector(
            onTap: _markAllAsRead,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF7ED),
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: const Color(0xFFFED7AA), width: 1),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.done_all_rounded,
                    size: 13,
                    color: Color(0xFFEA580C),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Mark all as read'.tr,
                    style: GoogleFonts.poppins(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFFEA580C),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildEmptyState() {
    final String emptyTitle = _selectedFilterIndex == 0
        ? 'No Notifications Yet'
        : _selectedFilterIndex == 1
            ? 'No Read Notifications'
            : 'No Unread Notifications';

    final String emptySubtitle = _selectedFilterIndex == 0
        ? 'New trip assignments, schedule changes, and fleet alerts will appear here.'
        : _selectedFilterIndex == 1
            ? 'Notifications you open or mark as read will be archived here.'
            : 'You have reviewed all your latest fleet notifications.';

    final Color accent = _selectedFilterIndex == 0
        ? const Color(0xFF2563EB)
        : _selectedFilterIndex == 1
            ? const Color(0xFF059669)
            : const Color(0xFFEA580C);
    final Color tint = _selectedFilterIndex == 0
        ? const Color(0xFFEFF6FF)
        : _selectedFilterIndex == 1
            ? const Color(0xFFECFDF5)
            : const Color(0xFFFFF7ED);
    final Color border = _selectedFilterIndex == 0
        ? const Color(0xFFBFDBFE)
        : _selectedFilterIndex == 1
            ? const Color(0xFFA7F3D0)
            : const Color(0xFFFED7AA);

    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 36),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Colors.white, tint.withValues(alpha: 0.6)],
          ),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: border, width: 1.1),
          boxShadow: [
            BoxShadow(
              color: accent.withValues(alpha: 0.06),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 68,
              height: 68,
              decoration: BoxDecoration(
                color: tint,
                shape: BoxShape.circle,
                border: Border.all(color: border, width: 1.5),
              ),
              child: Icon(
                _selectedFilterIndex == 2
                    ? Icons.notifications_active_outlined
                    : Icons.notifications_off_outlined,
                size: 32,
                color: accent,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              emptyTitle,
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              emptySubtitle,
              textAlign: TextAlign.center,
              style: GoogleFonts.nunito(
                fontSize: 13.5,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF64748B),
                height: 1.45,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final totalCount = _notifications.length;
    final unreadCount = _notifications.where((n) => !n.isRead).length;
    final readCount = totalCount - unreadCount;

    // Filter notifications based on tab
    final filteredNotifications = _notifications.where((n) {
      if (_selectedFilterIndex == 0) return true;
      if (_selectedFilterIndex == 1) return n.isRead;
      return !n.isRead;
    }).toList();

    // Group filtered notifications by category
    final todayNotifications =
        filteredNotifications.where((n) => n.category == 'TODAY').toList();
    final yesterdayNotifications =
        filteredNotifications.where((n) => n.category != 'TODAY').toList();

    return ValueListenableBuilder<String>(
      valueListenable: LocalizationService.currentLanguageNotifier,
      builder: (context, currentLanguage, _) {
        return PopScope(
          canPop: false,
          onPopInvokedWithResult: (didPop, result) {
            if (!didPop) SafeNavigation.pop(context, fallbackTab: 2);
          },
          child: Scaffold(
            backgroundColor: const Color(0xFFF4F6FA),
            appBar: CustomAppBar(
              centerTitle: false,
              backgroundColor: AppColors.primary,
              fallbackTab: 2,
              actions: const [],
              title: Text(
                'Notifications'.tr,
                style: GoogleFonts.poppins(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
            body: SafeArea(
              child: Column(
                children: [
                  _buildFilterBar(
                    totalCount: totalCount,
                    unreadCount: unreadCount,
                    readCount: readCount,
                  ),
                  Expanded(
                    child: RefreshIndicator(
                      onRefresh: () async {
                        ApiService.clearApiCache('/driver/notifications');
                        await Future.any([
                          _fetchServerNotifications(),
                          Future.delayed(const Duration(milliseconds: 500)),
                        ]);
                      },
                      color: AppColors.secondary,
                      child: filteredNotifications.isEmpty
                          ? _buildEmptyState()
                          : ListView(
                              physics: const AlwaysScrollableScrollPhysics(),
                              padding: const EdgeInsets.fromLTRB(
                                16.0,
                                14.0,
                                16.0,
                                24.0,
                              ),
                              children: [
                                // TODAY SECTION
                                if (todayNotifications.isNotEmpty) ...[
                                  _buildSectionHeader(
                                    title: 'TODAY'.tr,
                                    count: todayNotifications.length,
                                    accent: const Color(0xFF2563EB),
                                    tint: const Color(0xFFEFF6FF),
                                    border: const Color(0xFFBFDBFE),
                                    icon: Icons.today_rounded,
                                    showMarkAllAction:
                                        _selectedFilterIndex != 1 &&
                                            todayNotifications
                                                .any((n) => !n.isRead),
                                  ),
                                  const SizedBox(height: 12),
                                  ...todayNotifications.map(
                                    (item) => Padding(
                                      padding:
                                          const EdgeInsets.only(bottom: 12.0),
                                      child: _buildDismissibleNotificationCard(
                                        item,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                ],

                                // YESTERDAY SECTION
                                if (yesterdayNotifications.isNotEmpty) ...[
                                  _buildSectionHeader(
                                    title: 'YESTERDAY'.tr,
                                    count: yesterdayNotifications.length,
                                    accent: const Color(0xFF7C3AED),
                                    tint: const Color(0xFFF5F3FF),
                                    border: const Color(0xFFDDD6FE),
                                    icon: Icons.history_rounded,
                                    showMarkAllAction:
                                        _selectedFilterIndex != 1 &&
                                            todayNotifications.isEmpty &&
                                            yesterdayNotifications
                                                .any((n) => !n.isRead),
                                  ),
                                  const SizedBox(height: 12),
                                  ...yesterdayNotifications.map(
                                    (item) => Padding(
                                      padding:
                                          const EdgeInsets.only(bottom: 12.0),
                                      child: _buildDismissibleNotificationCard(
                                        item,
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildDismissibleNotificationCard(NotificationItem item) {
    return Dismissible(
      key: ValueKey('notification_${item.id}'),
      direction: DismissDirection.endToStart,
      background: const SizedBox.shrink(),
      secondaryBackground: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.symmetric(horizontal: 20.0),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
            colors: [Color(0xFFEF4444), Color(0xFFDC2626)],
          ),
          borderRadius: BorderRadius.circular(16.0),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(
                Icons.delete_outline_rounded,
                color: Colors.white,
                size: 20,
              ),
            ),
            const SizedBox(width: 8),
            Text(
              'Delete',
              style: GoogleFonts.poppins(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
      onDismissed: (direction) {
        _deleteNotification(item);
      },
      child: _buildNotificationCard(item),
    );
  }

  Widget _buildNotificationCard(NotificationItem item) {
    final theme = _getNotificationTheme(item);
    final bool isUnread = !item.isRead;
    final bool hasTrip = item.tripId != null && item.tripId!.isNotEmpty;

    return GestureDetector(
      onTap: () {
        _toggleReadStatus(item);
        if (hasTrip) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => TripDetailsScreen(tripId: item.tripId!),
            ),
          ).then((_) {
            if (mounted) setState(() {});
          });
        } else {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => NotificationDetailsScreen(
                title: item.title,
                message: item.description,
                time: item.timestamp,
                type: item.title,
                icon: item.icon,
                onOpened: () => _toggleReadStatus(item),
              ),
            ),
          ).then((_) {
            if (mounted) setState(() {});
          });
        }
      },
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: isUnread
                ? [Colors.white, theme.tint]
                : [Colors.white, const Color(0xFFFAFBFD)],
          ),
          borderRadius: BorderRadius.circular(16.0),
          border: Border.all(
            color: isUnread ? theme.border : const Color(0xFFE6ECF4),
            width: isUnread ? 1.2 : 1.0,
          ),
          boxShadow: [
            BoxShadow(
              color: isUnread
                  ? theme.accent.withValues(alpha: 0.10)
                  : const Color(0xFF0F172A).withValues(alpha: 0.04),
              blurRadius: isUnread ? 14 : 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16.0),
          child: IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Subtle Left Accent Bar
                Container(
                  width: 4,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: isUnread
                          ? [theme.accent, theme.accentDark]
                          : [
                              theme.border,
                              theme.border.withValues(alpha: 0.6),
                            ],
                    ),
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(13, 13, 14, 13),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Color-Coded Icon Squircle
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            gradient: isUnread
                                ? LinearGradient(
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                    colors: [theme.accent, theme.accentDark],
                                  )
                                : null,
                            color: isUnread ? null : theme.tint,
                            borderRadius: BorderRadius.circular(13),
                            border: isUnread
                                ? null
                                : Border.all(color: theme.border, width: 1),
                            boxShadow: isUnread
                                ? [
                                    BoxShadow(
                                      color:
                                          theme.accent.withValues(alpha: 0.28),
                                      blurRadius: 8,
                                      offset: const Offset(0, 3),
                                    ),
                                  ]
                                : null,
                          ),
                          child: Icon(
                            item.icon,
                            color: isUnread ? Colors.white : theme.accent,
                            size: 21,
                          ),
                        ),
                        const SizedBox(width: 12),
                        // Card Body
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Top Row: Title + Unread Dot / NEW Badge
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  Expanded(
                                    child: Text(
                                      item.title,
                                      style: GoogleFonts.poppins(
                                        fontSize: 14,
                                        fontWeight: isUnread
                                            ? FontWeight.w700
                                            : FontWeight.w600,
                                        color: isUnread
                                            ? const Color(0xFF0F172A)
                                            : const Color(0xFF1E293B),
                                        height: 1.25,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  if (isUnread) ...[
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 6,
                                        vertical: 2,
                                      ),
                                      decoration: BoxDecoration(
                                        color: theme.accent,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        'NEW',
                                        style: GoogleFonts.poppins(
                                          fontSize: 9,
                                          fontWeight: FontWeight.w700,
                                          color: Colors.white,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 5),
                              // Description
                              Text(
                                item.description,
                                style: GoogleFonts.nunito(
                                  fontSize: 13,
                                  fontWeight: isUnread
                                      ? FontWeight.w600
                                      : FontWeight.w500,
                                  color: isUnread
                                      ? const Color(0xFF334155)
                                      : const Color(0xFF64748B),
                                  height: 1.38,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 10),
                              // Bottom Meta Row: Type Pill + Time + Chevron
                              Row(
                                children: [
                                  Flexible(
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 8,
                                        vertical: 3,
                                      ),
                                      decoration: BoxDecoration(
                                        color: isUnread
                                            ? Colors.white
                                                .withValues(alpha: 0.85)
                                            : theme.tint,
                                        borderRadius: BorderRadius.circular(7),
                                        border: Border.all(
                                          color: theme.border,
                                          width: 0.9,
                                        ),
                                      ),
                                      child: Text(
                                        theme.badgeLabel,
                                        style: GoogleFonts.poppins(
                                          fontSize: 9.5,
                                          fontWeight: FontWeight.w700,
                                          color: theme.accent,
                                          letterSpacing: 0.3,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Icon(
                                    Icons.schedule_rounded,
                                    size: 12.5,
                                    color: const Color(0xFF94A3B8),
                                  ),
                                  const SizedBox(width: 3),
                                  Flexible(
                                    child: Text(
                                      item.timestamp,
                                      style: GoogleFonts.nunito(
                                        fontSize: 11.5,
                                        fontWeight: FontWeight.w700,
                                        color: const Color(0xFF64748B),
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Icon(
                                    Icons.chevron_right_rounded,
                                    size: 17,
                                    color: isUnread
                                        ? theme.accent
                                        : const Color(0xFF94A3B8),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
