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
import '../onboarding/onboarding_screen.dart';

/// Premium animated splash screen for the Fleet Driver Mobile application.
/// Displays company branding, smooth logo animations, brand color styling,
/// and handles session verification + onboarding status routing.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late final AnimationController _mainAnimController;
  late final AnimationController _pulseAnimController;
  late final AnimationController _progressAnimController;

  late final Animation<double> _logoScale;
  late final Animation<double> _logoFade;
  late final Animation<Offset> _contentSlide;
  late final Animation<double> _contentFade;
  late final Animation<double> _pulseScale;
  bool _isNavigating = false;

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

    // Configure system navigation bar & status bar style
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
        systemNavigationBarColor: Color(0xFF070E17),
        systemNavigationBarIconBrightness: Brightness.light,
      ),
    );

    // 1. Main entrance animation controller
    _mainAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );

    _logoScale = CurvedAnimation(
      parent: _mainAnimController,
      curve: const Interval(0.0, 0.65, curve: Curves.easeOutBack),
    );

    _logoFade = CurvedAnimation(
      parent: _mainAnimController,
      curve: const Interval(0.0, 0.45, curve: Curves.easeIn),
    );

    _contentSlide = Tween<Offset>(
      begin: const Offset(0, 0.35),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _mainAnimController,
        curve: const Interval(0.35, 0.90, curve: Curves.easeOutCubic),
      ),
    );

    _contentFade = CurvedAnimation(
      parent: _mainAnimController,
      curve: const Interval(0.35, 0.85, curve: Curves.easeIn),
    );

    // 2. Ambient breathing pulse for the outer brand halo
    _pulseAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    );
    if (!_isTestEnv) {
      _pulseAnimController.repeat(reverse: true);
    }

    _pulseScale = Tween<double>(begin: 0.96, end: 1.08).animate(
      CurvedAnimation(parent: _pulseAnimController, curve: Curves.easeInOutSine),
    );

    // 3. Progress bar fill animation controller
    _progressAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2600),
    );

    _mainAnimController.forward();
    _progressAnimController.forward();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _startAppInitialization();
      }
    });
  }

  Future<void> _startAppInitialization() async {
    final startTime = DateTime.now();

    // Trigger AuthProvider session check in the background
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final sessionFuture = authProvider.initializeSession();

    // Initialize session and preferences in parallel
    final prefsFuture = SharedPreferences.getInstance();
    await Future.wait([sessionFuture, prefsFuture]);

    // Guarantee minimum splash animation display time for smooth visual flow
    final elapsed = DateTime.now().difference(startTime);
    final minSplashDuration = _isTestEnv
        ? Duration.zero
        : const Duration(milliseconds: 900);
    if (elapsed < minSplashDuration) {
      await Future.delayed(minSplashDuration - elapsed);
    }

    if (!mounted || _isNavigating) return;
    _isNavigating = true;

    _pulseAnimController.stop();
    _mainAnimController.stop();
    _progressAnimController.stop();

    // Route to main dashboard if already authenticated, otherwise show onboarding before login
    Widget targetScreen;
    if (authProvider.isAuthenticated && authProvider.driver != null) {
      targetScreen = const MainNavigationScreen();
    } else {
      // Unauthenticated: Always navigate to Onboarding screens before login
      targetScreen = const OnboardingScreen();
    }

    Navigator.of(context).pushAndRemoveUntil(
      PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 650),
        pageBuilder: (context, animation, secondaryAnimation) => targetScreen,
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          final fade = CurvedAnimation(
            parent: animation,
            curve: Curves.easeOutCubic,
          );
          final slide = Tween<Offset>(
            begin: const Offset(0.0, 0.04),
            end: Offset.zero,
          ).animate(fade);

          return FadeTransition(
            opacity: fade,
            child: SlideTransition(position: slide, child: child),
          );
        },
      ),
      (route) => false,
    );
  }

  @override
  void dispose() {
    _mainAnimController.dispose();
    _pulseAnimController.dispose();
    _progressAnimController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: const Color(0xFF070E17),
      body: Stack(
        children: [
          // Background Gradient Canvas
          Container(
            width: double.infinity,
            height: double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFF060C14),
                  Color(0xFF0D1B2A),
                  Color(0xFF13293D),
                ],
                stops: [0.0, 0.45, 1.0],
              ),
            ),
          ),

          // Ambient Radial Glow: Top Right (Sunset Orange)
          Positioned(
            top: -size.width * 0.25,
            right: -size.width * 0.25,
            child: Container(
              width: size.width * 0.85,
              height: size.width * 0.85,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.secondary.withValues(alpha: 0.18),
                    AppColors.secondary.withValues(alpha: 0.0),
                  ],
                ),
              ),
            ),
          ),

          // Ambient Radial Glow: Bottom Left (Cobalt Blue)
          Positioned(
            bottom: -size.width * 0.35,
            left: -size.width * 0.35,
            child: Container(
              width: size.width * 0.9,
              height: size.width * 0.9,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFF1E3A8A).withValues(alpha: 0.22),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Central Animated Content
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                physics: const NeverScrollableScrollPhysics(),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(height: 24),

                      // Animated Brand Logo with Glowing Halo
                      ScaleTransition(
                        scale: _logoScale,
                        child: FadeTransition(
                          opacity: _logoFade,
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              // Breathing Ambient Glow Ring
                              AnimatedBuilder(
                                animation: _pulseAnimController,
                                builder: (context, child) {
                                  return Transform.scale(
                                    scale: _pulseScale.value,
                                    child: Container(
                                      width: 150,
                                      height: 150,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        gradient: RadialGradient(
                                          colors: [
                                            AppColors.secondary.withValues(
                                                alpha: 0.28),
                                            AppColors.accent.withValues(
                                                alpha: 0.08),
                                            Colors.transparent,
                                          ],
                                          stops: const [0.2, 0.65, 1.0],
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),

                              // Outer Decorative Glass Ring
                              Container(
                                width: 122,
                                height: 122,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: Colors.white.withValues(alpha: 0.14),
                                    width: 1.5,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: AppColors.secondary.withValues(
                                          alpha: 0.22),
                                      blurRadius: 36,
                                      spreadRadius: 2,
                                    ),
                                  ],
                                ),
                              ),

                              // Core Emblem
                              Container(
                                width: 110,
                                height: 110,
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: Colors.white,
                                    width: 2.5,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.white.withValues(alpha: 0.20),
                                      blurRadius: 20,
                                      spreadRadius: 2,
                                    ),
                                    BoxShadow(
                                      color: AppColors.secondary.withValues(
                                          alpha: 0.35),
                                      blurRadius: 36,
                                      spreadRadius: 3,
                                    ),
                                  ],
                                ),
                                child: ClipOval(
                                  child: Padding(
                                    padding: const EdgeInsets.all(16.0),
                                    child: Image.asset(
                                      'assets/logo.png',
                                      fit: BoxFit.contain,
                                      errorBuilder: (ctx, err, st) =>
                                          Image.asset(
                                        'assets/images/logo.png',
                                        fit: BoxFit.contain,
                                        errorBuilder: (ctx2, err2, st2) =>
                                            const Icon(
                                          Icons.local_shipping_rounded,
                                          color: AppColors.secondary,
                                          size: 52,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 28),

                      // Animated Typography & Tagline
                      SlideTransition(
                        position: _contentSlide,
                        child: FadeTransition(
                          opacity: _contentFade,
                          child: Column(
                            children: [
                              // App Name
                              Text(
                                'FLEET MANAGEMENT',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.openSans(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 1.8,
                                  color: Colors.white,
                                  shadows: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.35),
                                      blurRadius: 10,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                              ),

                              const SizedBox(height: 8),

                              // Driver Companion Badge Chip
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [
                                      AppColors.secondary,
                                      AppColors.accent,
                                    ],
                                  ),
                                  borderRadius: BorderRadius.circular(20),
                                  boxShadow: [
                                    BoxShadow(
                                      color: AppColors.secondary.withValues(
                                          alpha: 0.30),
                                      blurRadius: 10,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(
                                      Icons.directions_bus_rounded,
                                      size: 13,
                                      color: Colors.white,
                                    ),
                                    const SizedBox(width: 5),
                                    Text(
                                      'DRIVER MOBILE APP',
                                      style: GoogleFonts.poppins(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700,
                                        letterSpacing: 1.0,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // Bottom Loading Transition Progress Bar
          Positioned(
            left: 0,
            right: 0,
            bottom: 36,
            child: SafeArea(
              top: false,
              child: Center(
                child: SizedBox(
                  width: 200,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      height: 4,
                      color: Colors.white.withValues(alpha: 0.12),
                      child: AnimatedBuilder(
                        animation: _progressAnimController,
                        builder: (context, child) {
                          return FractionallySizedBox(
                            alignment: Alignment.centerLeft,
                            widthFactor: _progressAnimController.value,
                            child: Container(
                              decoration: const BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    AppColors.secondary,
                                    AppColors.accent,
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
