import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../constants/app_colors.dart';
import '../../constants/app_spacing.dart';
import '../../constants/app_radius.dart';
import '../../widgets/custom_app_bar.dart';
import '../main_navigation_screen.dart';
import '../../utils/navigation_helper.dart';

class NotificationDetailsScreen extends StatefulWidget {
  final String title;
  final String message;
  final String time;
  final String type;
  final IconData icon;
  final VoidCallback? onOpened;
  final bool comingFromDashboard;

  const NotificationDetailsScreen({
    super.key,
    required this.title,
    required this.message,
    required this.time,
    required this.type,
    required this.icon,
    this.onOpened,
    this.comingFromDashboard = false,
  });

  @override
  State<NotificationDetailsScreen> createState() => _NotificationDetailsScreenState();
}

class _NotificationDetailsScreenState extends State<NotificationDetailsScreen> {
  @override
  void initState() {
    super.initState();
    // Mark as read when the page is opened
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.onOpened != null) {
        widget.onOpened!();
      }
    });
  }

  ({
    Color accent,
    Color accentDark,
    Color tint,
    Color border,
  }) _getTypeTheme(String type) {
    final t = type.toLowerCase();
    if (t.contains('security') ||
        t.contains('alert') ||
        t.contains('critical') ||
        t.contains('reject') ||
        t.contains('cancel')) {
      return (
        accent: const Color(0xFFDC2626),
        accentDark: const Color(0xFFB91C1C),
        tint: const Color(0xFFFEF2F2),
        border: const Color(0xFFFECACA),
      );
    }
    if (t.contains('maintenance') ||
        t.contains('warning') ||
        t.contains('schedule') ||
        t.contains('update')) {
      return (
        accent: const Color(0xFFEA580C),
        accentDark: const Color(0xFFC2410C),
        tint: const Color(0xFFFFF7ED),
        border: const Color(0xFFFED7AA),
      );
    }
    if (t.contains('achievement') ||
        t.contains('success') ||
        t.contains('complete') ||
        t.contains('approved') ||
        t.contains('status')) {
      return (
        accent: const Color(0xFF059669),
        accentDark: const Color(0xFF047857),
        tint: const Color(0xFFECFDF5),
        border: const Color(0xFFA7F3D0),
      );
    }
    if (t.contains('route') ||
        t.contains('trip') ||
        t.contains('assign') ||
        t.contains('info')) {
      return (
        accent: const Color(0xFF2563EB),
        accentDark: const Color(0xFF1D4ED8),
        tint: const Color(0xFFEFF6FF),
        border: const Color(0xFFBFDBFE),
      );
    }
    if (t.contains('fuel') || t.contains('expense')) {
      return (
        accent: const Color(0xFFD97706),
        accentDark: const Color(0xFFB45309),
        tint: const Color(0xFFFFFBEB),
        border: const Color(0xFFFDE68A),
      );
    }
    return (
      accent: const Color(0xFF7C3AED),
      accentDark: const Color(0xFF6D28D9),
      tint: const Color(0xFFF5F3FF),
      border: const Color(0xFFDDD6FE),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = _getTypeTheme(widget.type);

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        if (widget.comingFromDashboard) {
          MainNavigationScreen.selectedTabNotifier.value = 3;
        }
        SafeNavigation.pop(context, fallbackTab: 2);
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF4F6FA),
        appBar: CustomAppBar(
          backgroundColor: AppColors.primary,
          centerTitle: false,
          titleSpacing: 0.0,
          fallbackTab: 2,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () {
              if (widget.comingFromDashboard) {
                MainNavigationScreen.selectedTabNotifier.value = 3;
              }
              SafeNavigation.pop(context, fallbackTab: 2);
            },
          ),
          title: Text(
            'Notification Details',
            style: GoogleFonts.poppins(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          actions: const [],
        ),
        body: SafeArea(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Color-Coded Hero Header Card
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Colors.white, theme.tint],
                    ),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: theme.border, width: 1.2),
                    boxShadow: [
                      BoxShadow(
                        color: theme.accent.withValues(alpha: 0.10),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Container(
                            width: 52,
                            height: 52,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [theme.accent, theme.accentDark],
                              ),
                              borderRadius: BorderRadius.circular(15),
                              boxShadow: [
                                BoxShadow(
                                  color: theme.accent.withValues(alpha: 0.30),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Icon(
                              widget.icon,
                              color: Colors.white,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 6,
                                  crossAxisAlignment: WrapCrossAlignment.center,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 9,
                                        vertical: 4,
                                      ),
                                      decoration: BoxDecoration(
                                        color: Colors.white
                                            .withValues(alpha: 0.9),
                                        borderRadius:
                                            BorderRadius.circular(AppRadius.xs),
                                        border: Border.all(
                                          color: theme.border,
                                          width: 1,
                                        ),
                                      ),
                                      child: Text(
                                        widget.type.toUpperCase(),
                                        style: GoogleFonts.poppins(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w700,
                                          color: theme.accent,
                                          letterSpacing: 0.3,
                                        ),
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 9,
                                        vertical: 4,
                                      ),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFECFDF5),
                                        borderRadius:
                                            BorderRadius.circular(AppRadius.xs),
                                        border: Border.all(
                                          color: const Color(0xFFA7F3D0),
                                          width: 1,
                                        ),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          const Icon(
                                            Icons.done_all_rounded,
                                            size: 11,
                                            color: Color(0xFF059669),
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            'READ',
                                            style: GoogleFonts.poppins(
                                              fontSize: 10,
                                              fontWeight: FontWeight.w700,
                                              color: const Color(0xFF059669),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    const Icon(
                                      Icons.schedule_rounded,
                                      size: 13.5,
                                      color: Color(0xFF64748B),
                                    ),
                                    const SizedBox(width: 5),
                                    Expanded(
                                      child: Text(
                                        widget.time,
                                        style: GoogleFonts.nunito(
                                          fontSize: 12.5,
                                          color: const Color(0xFF475569),
                                          fontWeight: FontWeight.w700,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        widget.title,
                        style: GoogleFonts.poppins(
                          fontSize: 19,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF0F172A),
                          height: 1.3,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                // Message Content Card
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: const Color(0xFFE6ECF4),
                      width: 1,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.04),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 26,
                            height: 26,
                            decoration: BoxDecoration(
                              color: theme.tint,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: theme.border),
                            ),
                            child: Icon(
                              Icons.notes_rounded,
                              size: 14,
                              color: theme.accent,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'MESSAGE DETAILS',
                              style: GoogleFonts.poppins(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF475569),
                                letterSpacing: 0.7,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      const Divider(color: Color(0xFFE6ECF4), height: 1),
                      const SizedBox(height: 14),
                      Text(
                        widget.message,
                        style: GoogleFonts.nunito(
                          fontSize: 15,
                          height: 1.65,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF334155),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                // Subtle Status Strip
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 11,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: const Color(0xFFA7F3D0),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.verified_outlined,
                        size: 16,
                        color: Color(0xFF059669),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Marked as read automatically when opened.',
                          style: GoogleFonts.nunito(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF065F46),
                          ),
                        ),
                      ),
                    ],
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
