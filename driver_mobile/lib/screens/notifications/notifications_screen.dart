import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../theme/app_colors.dart';
import '../../widgets/custom_app_bar.dart';
import 'notification_details_screen.dart';
import '../main_navigation_screen.dart';
import '../../providers/notification_provider.dart';
import '../../models/notification_model.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  int _selectedFilterIndex = 0; // 0: Total, 1: Read, 2: Unread

  @override
  void initState() {
    super.initState();
    MainNavigationScreen.selectedTabNotifier.addListener(_onTabChanged);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        Provider.of<NotificationProvider>(context, listen: false).fetchNotifications();
      }
    });
  }

  @override
  void dispose() {
    MainNavigationScreen.selectedTabNotifier.removeListener(_onTabChanged);
    super.dispose();
  }

  void _onTabChanged() {
    if (mounted && MainNavigationScreen.selectedTabNotifier.value == 3) {
      Provider.of<NotificationProvider>(context, listen: false).fetchNotifications();
    }
  }

  void _markAllAsRead() {
    Provider.of<NotificationProvider>(context, listen: false).markAllAsRead().catchError((e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: AppColors.error,
          ),
        );
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

  void _toggleReadStatus(NotificationModel item) {
    Provider.of<NotificationProvider>(context, listen: false).markAsRead(item.id);
  }

  Widget _buildFilterBar() {
    const primaryDark = Color(0xFF101C2C);
    const borderGray = Color(0xFFE2E8F0);
    const textPrimary = Color(0xFF1F2937);

    final List<String> filterLabels = ['All', 'Read', 'Unread'];

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 16.0),
      decoration: const BoxDecoration(
        color: Colors.white,
      ),
      child: SizedBox(
        height: 36,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          itemCount: filterLabels.length,
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
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
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
                  filterLabels[index],
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
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<NotificationProvider>(context);
    final allNotifications = provider.notifications;
    final isLoading = provider.isLoading;
    final errorMessage = provider.errorMessage;

    // Filter notifications based on tab
    final filteredNotifications = allNotifications.where((n) {
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
              child: isLoading
                  ? const Center(
                      child: CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                      ),
                    )
                  : errorMessage != null
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.error_outline, size: 64, color: AppColors.error),
                              const SizedBox(height: 16),
                              Text(
                                errorMessage,
                                style: GoogleFonts.poppins(
                                  fontSize: 16,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                              const SizedBox(height: 16),
                              ElevatedButton(
                                onPressed: () {
                                  provider.fetchNotifications();
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primary,
                                ),
                                child: const Text('Retry', style: TextStyle(color: Colors.white)),
                              ),
                            ],
                          ),
                        )
                      : RefreshIndicator(
                          onRefresh: provider.fetchNotifications,
                          color: AppColors.primary,
                          child: filteredNotifications.isEmpty
                              ? ListView(
                                  physics: const AlwaysScrollableScrollPhysics(),
                                  children: [
                                    SizedBox(height: MediaQuery.of(context).size.height * 0.25),
                                    Center(
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          const Icon(
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
                                    ),
                                  ],
                                )
                              : ListView(
                                  physics: const AlwaysScrollableScrollPhysics(),
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
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationCard(NotificationModel item) {
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
              type: item.type,
              icon: item.icon,
              onOpened: () => _toggleReadStatus(item),
            ),
          ),
        );
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
