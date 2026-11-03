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
import '../auth/login_identifier_screen.dart';
import '../main_navigation_screen.dart';

/// Premium Onboarding experience for the Fleet Driver Mobile application.
/// Introduces the commercial driver to the application through 3 interactive slides:
/// 1. Welcome to Fleet Management
/// 2. Manage Your Trips
/// 3. Track Your Journey
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
      if (WidgetsBinding.instance.runtimeType.toString().contains('Test')) {
        return true;
      }
    } catch (_) {}
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

      if (_currentPage < 2) {
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
              : const LoginIdentifierScreen();

      Navigator.of(context).pushAndRemoveUntil(
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
        (route) => false,
      );
    } catch (e) {
      debugPrint('Error saving onboarding completion: $e');
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const LoginIdentifierScreen()),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final isLastPage = _currentPage == 2;

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

                  // Skip Button (Visible on slides 0, 1)
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

            // PageView Content Area (3 Focused Core Screens)
            Expanded(
              child: PageView(
                controller: _pageController,
                onPageChanged: (index) {
                  setState(() => _currentPage = index);
                  if (index == 2) {
                    _autoPlayTimer?.cancel();
                  }
                },
                children: [
                  _buildSlide(
                    tag: 'SMART LOGISTICS',
                    tagIcon: Icons.local_shipping_rounded,
                    highlightTag: '✨ AI Commercial Logistics',
                    title: 'Welcome to\nFleet Management',
                    description:
                        'Your premier commercial driving companion. Streamline daily dispatches, manage vehicle health, and operate with maximum efficiency on every route.',
                    highlightPills: const [
                      'Live Telemetry',
                      'Enterprise Safety',
                      'Smart Routing',
                    ],
                    illustrationWidget: _buildWelcomeIllustration(size),
                  ),
                  _buildSlide(
                    tag: 'DISPATCH SCHEDULES',
                    tagIcon: Icons.alt_route_rounded,
                    highlightTag: '📦 Live Manifests',
                    title: 'Manage Your\nAssigned Trips',
                    description:
                        'Stay on top of upcoming and active dispatches. View route manifests, cargo weighbridge details, toll fees, and scheduled pickup timetables in real-time.',
                    highlightPills: const [
                      'Route Manifests',
                      'Weighbridge Slips',
                      'FASTag Tolls',
                    ],
                    illustrationWidget: _buildTripsIllustration(size),
                  ),
                  _buildSlide(
                    tag: 'LIVE GPS TELEMETRY',
                    tagIcon: Icons.navigation_rounded,
                    highlightTag: '🛰️ Sub-Meter GPS',
                    title: 'Track Your Journey\nin Real-Time',
                    description:
                        'Access high-precision turn-by-turn navigation, continuous GPS tracking, and update trip milestones from Departure to Arrival and Proof of Delivery (POD).',
                    highlightPills: const [
                      'Turn-by-Turn GPS',
                      'Live Speed HUD',
                      'Dynamic ETA',
                    ],
                    illustrationWidget: _buildTrackingIllustration(size),
                  ),
                ],
              ),
            ),

            // Bottom Navigation & Controls Bar with Next & Get Started CTAs (No back button)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(
                  top: BorderSide(color: Color(0xFFF1F5F9), width: 1.0),
                ),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Page Indicator Dots (3 dots)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(3, (index) {
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
                                    Color(0xFFF97316),
                                    Color(0xFFEA580C),
                                  ],
                                )
                              : null,
                          color: isActive ? null : const Color(0xFFCBD5E1),
                          borderRadius: BorderRadius.circular(4.0),
                          boxShadow: isActive
                              ? [
                                  BoxShadow(
                                    color: const Color(0xFFF97316).withValues(alpha: 0.35),
                                    blurRadius: 6,
                                    offset: const Offset(0, 2),
                                  ),
                                ]
                              : null,
                        ),
                      );
                    }),
                  ),

                  const SizedBox(height: 16),

                  // Full-width Primary Action Button: "Next" on slides 0, 1, and "Get Started" on slide 2
                  InkWell(
                    onTap: () {
                      if (isLastPage) {
                        _completeOnboarding();
                      } else {
                        _autoPlayTimer?.cancel();
                        _pageController.nextPage(
                          duration: const Duration(milliseconds: 400),
                          curve: Curves.easeInOutCubic,
                        );
                      }
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      width: double.infinity,
                      height: 54,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [
                            Color(0xFFF97316),
                            Color(0xFFEA580C),
                          ],
                          begin: Alignment.centerLeft,
                          end: Alignment.centerRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFF97316).withValues(alpha: 0.38),
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
                              isLastPage ? 'Get Started' : 'Next',
                              style: GoogleFonts.poppins(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                                letterSpacing: 0.3,
                              ),
                            ),
                            const SizedBox(width: 8),
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
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Reusable slide layout ensuring responsive sizing and highlighted typography
  Widget _buildSlide({
    required String tag,
    required IconData tagIcon,
    required String title,
    required String description,
    required Widget illustrationWidget,
    required String highlightTag,
    required List<String> highlightPills,
  }) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Graphic Illustration Canvas Container (Highlighted with visual images)
          illustrationWidget,

          const SizedBox(height: 18),

          // Category Badge Pill + Highlight Banner
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFF97316).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: const Color(0xFFF97316).withValues(alpha: 0.35),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      tagIcon,
                      size: 13,
                      color: const Color(0xFFEA580C),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      tag,
                      style: GoogleFonts.poppins(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.8,
                        color: const Color(0xFFEA580C),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Flexible(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Text(
                    highlightTag,
                    style: GoogleFonts.poppins(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF475569),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Slide Title
          Text(
            title,
            style: GoogleFonts.openSans(
              fontSize: 26,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF0F172A),
              height: 1.22,
            ),
          ),

          const SizedBox(height: 8),

          // Slide Body Description
          Text(
            description,
            style: GoogleFonts.poppins(
              fontSize: 13.5,
              fontWeight: FontWeight.w400,
              color: const Color(0xFF64748B),
              height: 1.5,
            ),
          ),

          const SizedBox(height: 12),

          // Highlighted Feature Pills
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: highlightPills.map((pill) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF7ED),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFFED7AA)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.check_circle_rounded,
                      color: Color(0xFFEA580C),
                      size: 12,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      pill,
                      style: GoogleFonts.poppins(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF9A3412),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: 16),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // SLIDE 1 ILLUSTRATION: Welcome to Fleet Management (Highlighted Vehicle + Floating Badges)
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
            Color(0xFF071228),
            Color(0xFF0F1E38),
            Color(0xFF060F22),
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0D1B2A).withValues(alpha: 0.22),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Background ambient orange and cyan glow circles
          Positioned(
            right: -20,
            top: -20,
            child: Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFFF97316).withValues(alpha: 0.35),
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
                    const Color(0xFF38BDF8).withValues(alpha: 0.25),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Illuminated spotlight platform beneath vehicle
          Positioned(
            bottom: 24,
            child: Container(
              width: 210,
              height: 38,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(100),
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFFF97316).withValues(alpha: 0.40),
                    const Color(0xFF38BDF8).withValues(alpha: 0.18),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Center Highlighted Vehicle Graphic Image
          Padding(
            padding: const EdgeInsets.only(bottom: 12.0),
            child: Image.asset(
              'assets/images/vehicle.png',
              height: 130,
              fit: BoxFit.contain,
              errorBuilder: (ctx, err, st) => Image.asset(
                'assets/images/white_van.png',
                height: 130,
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
              iconColor: const Color(0xFFF97316),
              label: 'Driver First',
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // SLIDE 2 ILLUSTRATION: Manage Your Trips (Highlighted Route & Vehicle Image)
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
            Color(0xFF071228),
            Color(0xFF0F1E38),
            Color(0xFF060F22),
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0D1B2A).withValues(alpha: 0.22),
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
                      color: const Color(0xFFF97316).withValues(alpha: 0.18),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(
                      Icons.receipt_long_rounded,
                      color: Color(0xFFF97316),
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
                  color: const Color(0xFF38BDF8).withValues(alpha: 0.20),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF38BDF8)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: Color(0xFF38BDF8),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      'SCHEDULED',
                      style: GoogleFonts.poppins(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFFBAE6FD),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          // Route Nodes Section with Highlighted Vehicle Image in Center
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white.withValues(alpha: 0.10)),
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
                          fontSize: 11.5,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),

                // Highlighted Vehicle Graphic Image in Center
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6.0),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF97316).withValues(alpha: 0.18),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: const Color(0xFFF97316).withValues(alpha: 0.40),
                          ),
                        ),
                        child: Image.asset(
                          'assets/images/white_van.png',
                          height: 32,
                          fit: BoxFit.contain,
                          errorBuilder: (ctx, err, st) => Image.asset(
                            'assets/images/vehicle.png',
                            height: 32,
                            fit: BoxFit.contain,
                            errorBuilder: (ctx2, err2, st2) => const Icon(
                              Icons.local_shipping_rounded,
                              color: Color(0xFFF97316),
                              size: 26,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 2),
                      const Icon(
                        Icons.trending_flat_rounded,
                        color: Color(0xFFF97316),
                        size: 16,
                      ),
                    ],
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
                          fontSize: 11.5,
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

          // Bottom Metric Pills
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
  // SLIDE 3 ILLUSTRATION: Track Your Journey (Highlighted Map & Vehicle Radar)
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
            Color(0xFF071228),
            Color(0xFF0F1E38),
            Color(0xFF060F22),
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0D1B2A).withValues(alpha: 0.22),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Background Highlighted Map Texture Preview
          ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: Opacity(
              opacity: 0.40,
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

          // Concentric Radar Waves with Highlighted Navigation Vehicle Icon
          Center(
            child: Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: const Color(0xFFF97316).withValues(alpha: 0.25),
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
                      color: const Color(0xFFF97316).withValues(alpha: 0.50),
                      width: 1.5,
                    ),
                  ),
                  child: Center(
                    child: Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFFF97316),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFF97316).withValues(alpha: 0.55),
                            blurRadius: 18,
                            spreadRadius: 4,
                          ),
                        ],
                      ),
                      child: Center(
                        child: Image.asset(
                          'assets/images/vehicle.png',
                          width: 32,
                          height: 32,
                          fit: BoxFit.contain,
                          errorBuilder: (ctx, err, st) => const Icon(
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
            ),
          ),

          // Top Turn Instruction Banner (Highlighted Emerald)
          Positioned(
            top: 14,
            left: 14,
            right: 14,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF071228).withValues(alpha: 0.90),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withValues(alpha: 0.20)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.25),
                    blurRadius: 8,
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF22C55E),
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF22C55E).withValues(alpha: 0.40),
                          blurRadius: 8,
                        ),
                      ],
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

          // Bottom Telemetry Live Bar (Highlighted)
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
          Icon(icon, size: 12, color: const Color(0xFFF97316)),
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
          Icon(icon, size: 13, color: const Color(0xFFF97316)),
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
}
