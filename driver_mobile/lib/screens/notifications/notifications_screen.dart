import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme/app_colors.dart';
import '../../widgets/custom_app_bar.dart';
import 'notification_details_screen.dart';
import '../main_navigation_screen.dart';

class NotificationItem {
  final String id;
  final String title;
  final String description;
  final String timestamp;
  final String category; // 'TODAY' or 'YESTERDAY'
  bool isRead;
  final IconData icon;

  NotificationItem({
    required this.id,
    required this.title,
    required this.description,
    required this.timestamp,
    required this.category,
    required this.isRead,
    required this.icon,
  });
}

class NotificationsScreen extends StatefulWidget {
  static final List<NotificationItem> notifications = [
    NotificationItem(
      id: '1',
      title: 'Route Update',
      description: 'Your route to Chicago has been updated due to heavy traffic on I-90.',
      timestamp: '2m ago',
      category: 'TODAY',
      isRead: false,
      icon: Icons.local_shipping_outlined,
    ),
    NotificationItem(
      id: '2',
      title: 'Maintenance Alert',
      description: 'Vehicle #402 requires immediate tire pressure check based on telematics...',
      timestamp: '1h ago',
      category: 'TODAY',
      isRead: false,
      icon: Icons.construction_outlined,
    ),
    NotificationItem(
      id: '3',
      title: 'Achievement Unlocked',
      description: "You've reached a 500-mile streak with a perfect safety score! Check your profile for bonuses.",
      timestamp: '4h ago',
      category: 'TODAY',
      isRead: true,
      icon: Icons.star_outline_rounded,
    ),
    NotificationItem(
      id: '4',
      title: 'Weekly Report Available',
      description: 'Your fleet performance report for the last week is now ready for review.',
      timestamp: 'Yesterday',
      category: 'YESTERDAY',
      isRead: true,
      icon: Icons.assignment_outlined,
    ),
    NotificationItem(
      id: '5',
      title: 'Security Alert',
      description: 'A new login was detected for your account from a Chrome browser on Windows.',
      timestamp: 'Yesterday',
      category: 'YESTERDAY',
      isRead: true,
      icon: Icons.shield_outlined,
    ),
  ];

  const NotificationsScreen({super.key});

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

  void _markAllAsRead() {
    setState(() {
      for (var item in _notifications) {
        item.isRead = true;
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('All notifications marked as read.'),
        backgroundColor: AppColors.success,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _toggleReadStatus(NotificationItem item) {
    setState(() {
      item.isRead = true;
    });
  }

  Widget _buildFilterBar() {
    final int totalCount = _notifications.length;
    final int readCount = _notifications.where((n) => n.isRead).length;
    final int unreadCount = _notifications.where((n) => !n.isRead).length;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          bottom: BorderSide(color: AppColors.divider, width: 1.0),
        ),
      ),
      child: Row(
        children: [
          _buildFilterTab(0, 'Total', totalCount),
          const SizedBox(width: 8),
          _buildFilterTab(1, 'Read', readCount),
          const SizedBox(width: 8),
          _buildFilterTab(2, 'Unread', unreadCount),
        ],
      ),
    );
  }

  Widget _buildFilterTab(int index, String label, int count) {
    final bool isSelected = _selectedFilterIndex == index;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            _selectedFilterIndex = index;
          });
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 8.0),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.secondary : AppColors.surface,
            borderRadius: BorderRadius.circular(10.0),
            border: Border.all(
              color: isSelected ? AppColors.secondary : AppColors.divider,
              width: 1.0,
            ),
          ),
          alignment: Alignment.center,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                label,
                style: GoogleFonts.poppins(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? Colors.white : AppColors.textSecondary,
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: isSelected ? Colors.white.withAlpha(50) : AppColors.divider,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  count.toString(),
                  style: GoogleFonts.poppins(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: isSelected ? Colors.white : AppColors.textPrimary,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Filter notifications based on tab
    final filteredNotifications = _notifications.where((n) {
      if (_selectedFilterIndex == 0) return true;
      if (_selectedFilterIndex == 1) return n.isRead;
      return !n.isRead;
    }).toList();

    // Group filtered notifications by category
    final todayNotifications = filteredNotifications.where((n) => n.category == 'TODAY').toList();
    final yesterdayNotifications = filteredNotifications.where((n) => n.category == 'YESTERDAY').toList();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: CustomAppBar(
        centerTitle: false,
        backgroundColor: AppColors.primary,
        actions: const [],
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
                        Icons.local_shipping,
                        color: AppColors.primary,
                        size: 18,
                      );
                    },
                  );
                },
              ),
            ),
            const SizedBox(width: 12),
            Text(
              'Notifications',
              style: GoogleFonts.poppins(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            _buildFilterBar(),
            Expanded(
              child: filteredNotifications.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.notifications_off_outlined,
                            size: 64,
                            color: AppColors.textDisabled,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            _selectedFilterIndex == 0
                                ? 'No Notifications Yet'
                                : _selectedFilterIndex == 1
                                    ? 'No Read Notifications'
                                    : 'No Unread Notifications',
                            style: GoogleFonts.poppins(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    )
                  : ListView(
                      physics: const BouncingScrollPhysics(),
                      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
                      children: [
                        // TODAY SECTION
                        if (todayNotifications.isNotEmpty) ...[
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'TODAY',
                                style: GoogleFonts.nunito(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textSecondary,
                                  letterSpacing: 1.0,
                                ),
                              ),
                              if (_selectedFilterIndex != 1 && todayNotifications.any((n) => !n.isRead))
                                GestureDetector(
                                  onTap: _markAllAsRead,
                                  child: Text(
                                    'Mark all as read',
                                    style: GoogleFonts.poppins(
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.secondary,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          ...todayNotifications.map((item) => Padding(
                                padding: const EdgeInsets.only(bottom: 12.0),
                                child: _buildNotificationCard(item),
                              )),
                          const SizedBox(height: 16),
                        ],

                        // YESTERDAY SECTION
                        if (yesterdayNotifications.isNotEmpty) ...[
                          Text(
                            'YESTERDAY',
                            style: GoogleFonts.nunito(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textSecondary,
                              letterSpacing: 1.0,
                            ),
                          ),
                          const SizedBox(height: 12),
                          ...yesterdayNotifications.map((item) => Padding(
                                padding: const EdgeInsets.only(bottom: 12.0),
                                child: _buildNotificationCard(item),
                              )),
                        ],
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationCard(NotificationItem item) {
    return GestureDetector(
      onTap: () {
        _toggleReadStatus(item);
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
          if (mounted) {
            setState(() {});
          }
        });
      },
      child: Container(
        padding: const EdgeInsets.all(16.0),
        decoration: BoxDecoration(
          color: item.isRead ? AppColors.surface : Colors.white,
          borderRadius: BorderRadius.circular(14.0),
          border: Border.all(
            color: item.isRead ? Colors.transparent : AppColors.divider,
            width: 1.0,
          ),
          boxShadow: item.isRead
              ? null
              : [
                  BoxShadow(
                    color: Colors.black.withAlpha(8),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Circular Icon Badge
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: item.isRead ? AppColors.divider : AppColors.secondary.withAlpha(20),
                shape: BoxShape.circle,
              ),
              child: Icon(
                item.icon,
                color: item.isRead ? AppColors.textSecondary : AppColors.secondary,
                size: 24,
              ),
            ),
            const SizedBox(width: 14),
            // Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          item.title,
                          style: GoogleFonts.poppins(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        item.timestamp,
                        style: GoogleFonts.nunito(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      if (!item.isRead) ...[
                        const SizedBox(width: 8),
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: AppColors.secondary,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    item.description,
                    style: GoogleFonts.nunito(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textSecondary,
                      height: 1.3,
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
