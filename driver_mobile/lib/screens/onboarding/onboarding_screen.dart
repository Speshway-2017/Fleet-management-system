import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../constants/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../auth/login_screen.dart';
import '../main_navigation_screen.dart';

/// Premium Onboarding experience for the Fleet Driver Mobile application.
/// Introduces the commercial driver to the application through 4 interactive slides:
/// 1. Welcome to Fleet Management
/// 2. Manage Your Trips
/// 3. Track Your Journey
/// 4. Stay Updated
///
/// Supports 'isReplay' mode allowing users to re-view the onboarding tour
/// at any time from Settings without clearing stored state.
class OnboardingScreen extends StatefulWidget {
  final bool isReplay;

  const OnboardingScreen({super.key, this.isReplay = false});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  bool _isCompleting = false;
  Timer? _autoPlayTimer;

  bool get _isTestEnv {
    try {
      return Platform.environment.containsKey('FLUTTER_TEST');
    } catch (_) {
      return false;
    }
  }

  @override
  void initState() {
    super.initState();
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        statusBarBrightness: Brightness.light,
        systemNavigationBarColor: Colors.white,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
    );
    _startAutoPlayTimer();
  }

  void _startAutoPlayTimer() {
    if (_isTestEnv) return;
    _autoPlayTimer?.cancel();
    _autoPlayTimer = Timer.periodic(const Duration(seconds: 2), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }

      if (_currentPage < 3) {
        _pageController.nextPage(
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeInOutCubic,
        );
      } else {
        timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _autoPlayTimer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _completeOnboarding() async {
    if (_isCompleting) return;
    _autoPlayTimer?.cancel();
    setState(() => _isCompleting = true);

    try {
      // Save onboarding completion state to SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('has_seen_onboarding', true);

      if (!mounted) return;

      if (widget.isReplay) {
        // In replay mode from settings, simply dismiss
        Navigator.of(context).pop();
        return;
      }

      // Check current authentication status
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final targetScreen =
          (authProvider.isAuthenticated && authProvider.driver != null)
              ? const MainNavigationScreen()
              : const LoginScreen();

      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          transitionDuration: const Duration(milliseconds: 500),
          pageBuilder: (context, animation, secondaryAnimation) => targetScreen,
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(
              opacity: CurvedAnimation(
                parent: animation,
                curve: Curves.easeOutCubic,
              ),
              child: child,
            );
          },
        ),
      );
    } catch (e) {
      debugPrint('Error saving onboarding completion: $e');
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final isLastPage = _currentPage == 3;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar Header with Mini Brand & Skip CTA
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Brand Mini Emblem & Title
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: const Color(0xFFE2E8F0),
                            width: 1.2,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.05),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: Padding(
                            padding: const EdgeInsets.all(4.0),
                            child: Image.asset(
                              'assets/logo.png',
                              fit: BoxFit.contain,
                              errorBuilder: (ctx, err, st) => Image.asset(
                                'assets/images/logo.png',
                                fit: BoxFit.contain,
                                errorBuilder: (ctx2, err2, st2) => const Icon(
                                  Icons.local_shipping_rounded,
                                  color: AppColors.secondary,
                                  size: 20,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Fleet Management',
                            style: GoogleFonts.openSans(
                              fontSize: 13.5,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.3,
                              color: AppColors.primary,
                            ),
                          ),
                          Text(
                            'Driver Mobile',
                            style: GoogleFonts.poppins(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w500,
                              color: AppColors.secondaryText,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),

                  // Skip Button (Visible on slides 0, 1, 2)
                  if (!isLastPage)
                    TextButton(
                      onPressed: _completeOnboarding,
                      style: TextButton.styleFrom(
                        foregroundColor: AppColors.secondaryText,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                          side: const BorderSide(color: Color(0xFFE2E8F0)),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Skip',
                            style: GoogleFonts.poppins(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.secondaryText,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(
                            Icons.keyboard_double_arrow_right_rounded,
                            size: 16,
                            color: AppColors.secondaryText,
                          ),
                        ],
                      ),
                    )
                  else
                    // Replay close icon if applicable
                    if (widget.isReplay)
                      IconButton(
                        onPressed: () => Navigator.of(context).pop(),
                        icon: const Icon(Icons.close_rounded, color: AppColors.textPrimary),
                      )
                    else
                      const SizedBox(width: 48),
                ],
              ),
            ),

            // PageView Content Area
            Expanded(
              child: PageView(
                controller: _pageController,
                onPageChanged: (index) {
                  setState(() => _currentPage = index);
                  if (index == 3) {
                    _autoPlayTimer?.cancel();
                  }
                },
                children: [
                  _buildSlide(
                    tag: 'SMART LOGISTICS',
                    tagIcon: Icons.local_shipping_rounded,
                    title: 'Welcome to\nFleet Management',
                    description:
                        'Your premier commercial driving companion. Streamline daily dispatches, manage vehicle health, and operate with maximum efficiency on every route.',
                    illustrationWidget: _buildWelcomeIllustration(size),
                  ),
                  _buildSlide(
                    tag: 'DISPATCH SCHEDULES',
                    tagIcon: Icons.alt_route_rounded,
                    title: 'Manage Your\nAssigned Trips',
                    description:
                        'Stay on top of upcoming and active dispatches. View route manifests, cargo weighbridge details, toll fees, and scheduled pickup timetables in real-time.',
                    illustrationWidget: _buildTripsIllustration(size),
                  ),
                  _buildSlide(
                    tag: 'LIVE GPS TELEMETRY',
                    tagIcon: Icons.navigation_rounded,
                    title: 'Track Your Journey\nin Real-Time',
                    description:
                        'Access high-precision turn-by-turn navigation, continuous GPS tracking, and update trip milestones from Departure to Arrival and Proof of Delivery (POD).',
                    illustrationWidget: _buildTrackingIllustration(size),
                  ),
                  _buildSlide(
                    tag: 'INSTANT DISPATCH ALERTS',
                    tagIcon: Icons.notifications_active_rounded,
                    title: 'Stay Updated &\nConnected',
                    description:
                        'Receive instant push alerts for trip assignments, dispatch alterations, fuel expense reimbursements, and direct broadcasts from your fleet manager.',
                    illustrationWidget: _buildAlertsIllustration(size),
                  ),
                ],
              ),
            ),

            // Bottom Navigation & Controls Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 18.0),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(
                  top: BorderSide(color: Color(0xFFF1F5F9), width: 1.0),
                ),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Page Indicator Dots
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(4, (index) {
                      final isActive = index == _currentPage;
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                        margin: const EdgeInsets.symmetric(horizontal: 4.0),
                        height: 8.0,
                        width: isActive ? 28.0 : 8.0,
                        decoration: BoxDecoration(
                          gradient: isActive
                              ? const LinearGradient(
                                  colors: [
                                    AppColors.secondary,
                                    AppColors.accent,
                                  ],
                                )
                              : null,
                          color: isActive ? null : const Color(0xFFCBD5E1),
                          borderRadius: BorderRadius.circular(4.0),
                          boxShadow: isActive
                              ? [
                                  BoxShadow(
                                    color: AppColors.secondary.withValues(alpha: 0.35),
                                    blurRadius: 6,
                                    offset: const Offset(0, 2),
                                  ),
                                ]
                              : null,
                        ),
                      );
                    }),
                  ),

                  const SizedBox(height: 20),

                  // When on the final page, show prominent "Get Started" CTA Button
                  if (isLastPage) ...[
                    const SizedBox(height: 18),
                    // Last Page: Prominent "Get Started" CTA Button
                    InkWell(
                      onTap: _completeOnboarding,
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        width: double.infinity,
                        height: 54,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [
                              AppColors.secondary,
                              AppColors.accent,
                            ],
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.secondary.withValues(alpha: 0.40),
                              blurRadius: 16,
                              offset: const Offset(0, 5),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            if (_isCompleting)
                              const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                ),
                              )
                            else ...[
                              Text(
                                'Get Started',
                                style: GoogleFonts.poppins(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                  letterSpacing: 0.3,
                                ),
                              ),
                              const SizedBox(width: 10),
                              const Icon(
                                Icons.arrow_forward_rounded,
                                color: Colors.white,
                                size: 20,
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ] else ...[
                    const SizedBox(height: 10),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Reusable slide layout ensuring responsive sizing and zero pixel overflows
  Widget _buildSlide({
    required String tag,
    required IconData tagIcon,
    required String title,
    required String description,
    required Widget illustrationWidget,
  }) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Graphic Illustration Canvas Container
          illustrationWidget,

          const SizedBox(height: 24),

          // Category Badge Pill
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
            decoration: BoxDecoration(
              color: AppColors.secondary.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: AppColors.secondary.withValues(alpha: 0.25),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  tagIcon,
                  size: 13,
                  color: AppColors.secondary,
                ),
                const SizedBox(width: 6),
                Text(
                  tag,
                  style: GoogleFonts.poppins(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.8,
                    color: AppColors.secondary,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Slide Title
          Text(
            title,
            style: GoogleFonts.openSans(
              fontSize: 26,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
              height: 1.22,
            ),
          ),

          const SizedBox(height: 10),

          // Slide Body Description
          Text(
            description,
            style: GoogleFonts.poppins(
              fontSize: 14,
              fontWeight: FontWeight.w400,
              color: AppColors.textSecondary,
              height: 1.55,
            ),
          ),

          const SizedBox(height: 16),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // SLIDE 1 ILLUSTRATION: Welcome to Fleet Management (Vehicle + Floating Badges)
  // ---------------------------------------------------------------------------
  Widget _buildWelcomeIllustration(Size size) {
    return Container(
      width: double.infinity,
      height: 245,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF0F1E2E),
            Color(0xFF13293D),
            Color(0xFF0A1521),
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0D1B2A).withValues(alpha: 0.18),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Background subtle ambient glow circles
          Positioned(
            right: -20,
            top: -20,
            child: Container(
              width: 130,
              height: 130,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.secondary.withValues(alpha: 0.25),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            left: -20,
            bottom: -20,
            child: Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFF3B82F6).withValues(alpha: 0.18),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Center Vehicle Graphic Image
          Padding(
            padding: const EdgeInsets.only(bottom: 16.0),
            child: Image.asset(
              'assets/images/vehicle.png',
              height: 125,
              fit: BoxFit.contain,
              errorBuilder: (ctx, err, st) => Image.asset(
                'assets/images/white_van.png',
                height: 125,
                fit: BoxFit.contain,
                errorBuilder: (ctx2, err2, st2) => const Icon(
                  Icons.local_shipping_rounded,
                  color: Colors.white70,
                  size: 90,
                ),
              ),
            ),
          ),

          // Floating Chip 1: Real-Time Telemetry (Top Left)
          Positioned(
            top: 16,
            left: 16,
            child: _buildGlassChip(
              icon: Icons.bolt_rounded,
              iconColor: const Color(0xFFFBBF24),
              label: 'Real-Time Telemetry',
            ),
          ),

          // Floating Chip 2: Enterprise Verified (Bottom Right)
          Positioned(
            bottom: 16,
            right: 16,
            child: _buildGlassChip(
              icon: Icons.verified_user_rounded,
              iconColor: const Color(0xFF34D399),
              label: 'Enterprise Verified',
            ),
          ),

          // Floating Chip 3: Driver First (Top Right)
          Positioned(
            top: 16,
            right: 16,
            child: _buildGlassChip(
              icon: Icons.military_tech_rounded,
              iconColor: AppColors.secondary,
              label: 'Driver First',
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // SLIDE 2 ILLUSTRATION: Manage Your Trips (Itinerary Manifest Card)
  // ---------------------------------------------------------------------------
  Widget _buildTripsIllustration(Size size) {
    return Container(
      width: double.infinity,
      height: 245,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF0F1E2E),
            Color(0xFF13293D),
            Color(0xFF0A1521),
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0D1B2A).withValues(alpha: 0.18),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Header: Trip ID and Status Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.10),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(
                      Icons.receipt_long_rounded,
                      color: AppColors.secondary,
                      size: 16,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'TRP-452798',
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF3B82F6).withValues(alpha: 0.20),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF3B82F6)),
                ),
                child: Text(
                  'SCHEDULED',
                  style: GoogleFonts.poppins(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF93C5FD),
                  ),
                ),
              ),
            ],
          ),

          // Route Nodes Section
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
            ),
            child: Row(
              children: [
                // Origin Node
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.radio_button_checked,
                              color: Color(0xFF22C55E), size: 14),
                          const SizedBox(width: 4),
                          Text(
                            'ORIGIN',
                            style: GoogleFonts.poppins(
                              fontSize: 9,
                              fontWeight: FontWeight.w600,
                              color: Colors.white54,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        'Port Terminal Hub',
                        style: GoogleFonts.poppins(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),

                // Arrow Connector
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8.0),
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: AppColors.secondary.withValues(alpha: 0.20),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.arrow_forward_rounded,
                      color: AppColors.secondary,
                      size: 14,
                    ),
                  ),
                ),

                // Destination Node
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.location_on_rounded,
                              color: Color(0xFFEF4444), size: 14),
                          const SizedBox(width: 4),
                          Text(
                            'DESTINATION',
                            style: GoogleFonts.poppins(
                              fontSize: 9,
                              fontWeight: FontWeight.w600,
                              color: Colors.white54,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        'Central Logistics Yard',
                        style: GoogleFonts.poppins(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Bottom Metric Pills (Row with Expanded ensures 100% responsive fit with zero pixel overflow)
          Row(
            children: [
              Expanded(
                child: _buildTripMetricBadge(
                  icon: Icons.straighten_rounded,
                  label: '420 KM',
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: _buildTripMetricBadge(
                  icon: Icons.scale_rounded,
                  label: '15,000 kg',
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: _buildTripMetricBadge(
                  icon: Icons.schedule_rounded,
                  label: '08:30 AM',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // SLIDE 3 ILLUSTRATION: Track Your Journey (Navigation Radar Cockpit)
  // ---------------------------------------------------------------------------
  Widget _buildTrackingIllustration(Size size) {
    return Container(
      width: double.infinity,
      height: 245,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF0F1E2E),
            Color(0xFF13293D),
            Color(0xFF0A1521),
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0D1B2A).withValues(alpha: 0.18),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Background Map Texture Preview
          ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: Opacity(
              opacity: 0.22,
              child: Image.asset(
                'assets/images/map_preview.png',
                width: double.infinity,
                height: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (ctx, err, st) => Container(
                  color: Colors.transparent,
                ),
              ),
            ),
          ),

          // Concentric Radar Waves
          Center(
            child: Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: AppColors.secondary.withValues(alpha: 0.20),
                  width: 1.5,
                ),
              ),
              child: Center(
                child: Container(
                  width: 95,
                  height: 95,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppColors.secondary.withValues(alpha: 0.40),
                      width: 1.5,
                    ),
                  ),
                  child: Center(
                    child: Container(
                      width: 46,
                      height: 46,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.secondary,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.secondary.withValues(alpha: 0.50),
                            blurRadius: 16,
                            spreadRadius: 4,
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.navigation_rounded,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),

          // Top Turn Instruction Banner
          Positioned(
            top: 14,
            left: 14,
            right: 14,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF0D1B2A).withValues(alpha: 0.85),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(5),
                    decoration: BoxDecoration(
                      color: const Color(0xFF22C55E),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(
                      Icons.turn_right_rounded,
                      color: Colors.white,
                      size: 16,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'In 250m • Turn Right onto Ring Road',
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          'Route 16 Expressway • Fast Traffic',
                          style: GoogleFonts.poppins(
                            fontSize: 10,
                            color: Colors.white60,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Bottom Telemetry Live Bar
          Positioned(
            bottom: 14,
            left: 14,
            right: 14,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildLiveTelemetryBadge(
                  icon: Icons.speed_rounded,
                  label: 'Speed',
                  value: '64 km/h',
                ),
                _buildLiveTelemetryBadge(
                  icon: Icons.sensors_rounded,
                  label: 'GPS Sync',
                  value: 'Live Active',
                ),
                _buildLiveTelemetryBadge(
                  icon: Icons.timelapse_rounded,
                  label: 'ETA',
                  value: '1 hr 15 m',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // SLIDE 4 ILLUSTRATION: Stay Updated (Instant Notification Alert Hub)
  // ---------------------------------------------------------------------------
  Widget _buildAlertsIllustration(Size size) {
    return Container(
      width: double.infinity,
      height: 245,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF0F1E2E),
            Color(0xFF13293D),
            Color(0xFF0A1521),
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0D1B2A).withValues(alpha: 0.18),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildNotificationCard(
            icon: Icons.local_shipping_rounded,
            iconBg: AppColors.secondary,
            title: 'New Trip Assignment',
            body: 'TRP-90241 (Vizag ➔ Hyderabad) dispatched.',
            time: 'Just now',
          ),
          _buildNotificationCard(
            icon: Icons.local_gas_station_rounded,
            iconBg: const Color(0xFF22C55E),
            title: 'Fuel Advance Approved',
            body: '₹4,500 reimbursement credited for trip fuel.',
            time: '12m ago',
          ),
          _buildNotificationCard(
            icon: Icons.campaign_rounded,
            iconBg: const Color(0xFF3B82F6),
            title: 'Fleet Manager Broadcast',
            body: 'Terminal 3 unload bays are now active.',
            time: '45m ago',
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // HELPER SUB-WIDGETS
  // ---------------------------------------------------------------------------
  Widget _buildGlassChip({
    required IconData icon,
    required Color iconColor,
    required String label,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: const Color(0xFF0D1B2A).withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 8,
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: iconColor, size: 13),
          const SizedBox(width: 5),
          Text(
            label,
            style: GoogleFonts.poppins(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTripMetricBadge({
    required IconData icon,
    required String label,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 12, color: AppColors.secondary),
          const SizedBox(width: 4),
          Flexible(
            child: Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLiveTelemetryBadge({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
      decoration: BoxDecoration(
        color: const Color(0xFF0D1B2A).withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: AppColors.secondary),
          const SizedBox(width: 5),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                label,
                style: GoogleFonts.poppins(
                  fontSize: 8.5,
                  color: Colors.white54,
                ),
              ),
              Text(
                value,
                style: GoogleFonts.poppins(
                  fontSize: 10.5,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationCard({
    required IconData icon,
    required Color iconBg,
    required String title,
    required String body,
    required String time,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.07),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.10)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(7),
            decoration: BoxDecoration(
              color: iconBg.withValues(alpha: 0.20),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: iconBg, size: 16),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.poppins(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      time,
                      style: GoogleFonts.poppins(
                        fontSize: 9,
                        color: Colors.white54,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  body,
                  style: GoogleFonts.poppins(
                    fontSize: 10,
                    color: Colors.white70,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
