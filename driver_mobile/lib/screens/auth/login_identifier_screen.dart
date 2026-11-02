import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme/app_colors.dart';
import '../../services/api_service.dart';
import 'login_screen.dart';

/// Clean Pre-Login Screen for Fleet Driver Mobile App.
/// Vertically centered content with enlarged logo, tagline, Login heading,
/// single input field with outside error display, and Next button.
class LoginIdentifierScreen extends StatefulWidget {
  final String? initialIdentifier;

  const LoginIdentifierScreen({super.key, this.initialIdentifier});

  @override
  State<LoginIdentifierScreen> createState() => _LoginIdentifierScreenState();
}

class _LoginIdentifierScreenState extends State<LoginIdentifierScreen>
    with SingleTickerProviderStateMixin {
  late final TextEditingController _identifierController;
  final _formKey = GlobalKey<FormState>();

  String? _errorMessage;

  late AnimationController _animController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _identifierController = TextEditingController(text: widget.initialIdentifier ?? '');

    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 550),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeOutCubic,
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.04),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animController,
      curve: Curves.easeOutCubic,
    ));

    _animController.forward();
  }

  @override
  void dispose() {
    _identifierController.dispose();
    _animController.dispose();
    super.dispose();
  }

  void _showServerConfigDialog() async {
    final currentUrl = await ApiService.getBaseUrl();
    final urlController = TextEditingController(text: currentUrl);
    bool isTesting = false;
    String? testResultMsg;
    bool? testResultSuccess;

    if (!mounted) return;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: Row(
                children: [
                  const Icon(Icons.dns_rounded, color: Color(0xFFF97316)),
                  const SizedBox(width: 8),
                  Text(
                    'Server Configuration',
                    style: GoogleFonts.plusJakartaSans(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'API Base URL',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF64748B),
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: urlController,
                      style: GoogleFonts.plusJakartaSans(fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'https://fleet.speshway.site/api',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      ),
                    ),
                    const SizedBox(height: 10),
                    if (testResultMsg != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: (testResultSuccess == true ? Colors.green : Colors.red)
                              .withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          testResultMsg!,
                          style: TextStyle(
                            color: testResultSuccess == true ? Colors.green.shade800 : Colors.red.shade800,
                            fontSize: 11.5,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: isTesting
                      ? null
                      : () async {
                          setDialogState(() {
                            isTesting = true;
                            testResultMsg = 'Testing connection...';
                            testResultSuccess = null;
                          });
                          final ok = await ApiService.testConnection(urlController.text.trim());
                          setDialogState(() {
                            isTesting = false;
                            testResultSuccess = ok;
                            testResultMsg = ok ? '✅ Server reachable!' : '❌ Connection failed';
                          });
                        },
                  child: isTesting
                      ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('Test Connection'),
                ),
                ElevatedButton(
                  onPressed: () async {
                    final messenger = ScaffoldMessenger.of(context);
                    final navigator = Navigator.of(context);
                    await ApiService.setBaseUrl(urlController.text.trim());
                    navigator.pop();
                    messenger.showSnackBar(
                      const SnackBar(content: Text('Server URL updated!'), backgroundColor: AppColors.success),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFF97316),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Save', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  String? _validateIdentifier(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Please enter email or phone number';
    }
    final trimmed = value.trim();

    // Check if it's an email address
    if (trimmed.contains('@')) {
      final emailRegex = RegExp(r'^[\w\.\-]+@[\w\.\-]+\.[a-zA-Z]{2,}$');
      if (!emailRegex.hasMatch(trimmed)) {
        return 'Please enter a valid email address';
      }
      return null;
    }

    // Check if it's a mobile phone number
    final digitsOnly = trimmed.replaceAll(RegExp(r'[\s\-\(\)\+]'), '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15 || !RegExp(r'^[0-9]+$').hasMatch(digitsOnly)) {
      return 'Please enter a valid email or phone number';
    }

    return null;
  }

  void _handleNext() {
    final error = _validateIdentifier(_identifierController.text);
    setState(() {
      _errorMessage = error;
    });

    if (error != null) return;

    final identifier = _identifierController.text.trim();
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => LoginScreen(
          initialIdentifier: identifier,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF071228),
      body: Stack(
        children: [
          // Seamless Unified Background Gradient (same as login page)
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Color(0xFFE4EDF7),
                    Color(0xFFF0F5FB),
                    Color(0xFF0F1E38),
                    Color(0xFF060F22),
                  ],
                  stops: [0.0, 0.30, 0.65, 1.0],
                ),
              ),
            ),
          ),

          // Soft Ambient Warm Glow (Merged seamlessly into the background)
          Positioned(
            top: 20,
            right: -60,
            width: 320,
            height: 320,
            child: Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFFF97316).withValues(alpha: 0.18),
                    const Color(0xFFFFA26B).withValues(alpha: 0.06),
                    Colors.transparent,
                  ],
                  stops: const [0.0, 0.45, 1.0],
                ),
              ),
            ),
          ),

          // Main Foreground Content Centered in Middle
          SafeArea(
            child: LayoutBuilder(
              builder: (context, constraints) {
                return SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
                  child: ConstrainedBox(
                    constraints: BoxConstraints(
                      minHeight: constraints.maxHeight - 32.0,
                    ),
                    child: FadeTransition(
                      opacity: _fadeAnimation,
                      child: SlideTransition(
                        position: _slideAnimation,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Back button if navigation history exists
                            if (Navigator.canPop(context))
                              Align(
                                alignment: Alignment.centerLeft,
                                child: Padding(
                                  padding: const EdgeInsets.only(bottom: 8.0),
                                  child: IconButton(
                                    icon: const Icon(
                                      Icons.arrow_back_ios_new_rounded,
                                      color: Colors.white,
                                      size: 20,
                                    ),
                                    onPressed: () => Navigator.pop(context),
                                    tooltip: 'Back',
                                  ),
                                ),
                              ),

                            // Space to push logo a little down
                            const SizedBox(height: 20),

                            // 1. Existing Fleet Management Logo (Increased size to 120)
                            Center(
                              child: InkWell(
                                onLongPress: _showServerConfigDialog,
                                borderRadius: BorderRadius.circular(20),
                                child: Image.asset(
                                  'assets/images/auth_logo.png',
                                  height: 120,
                                  fit: BoxFit.contain,
                                  errorBuilder: (ctx, err, st) => Image.asset(
                                    'assets/images/logo.png',
                                    height: 120,
                                    fit: BoxFit.contain,
                                    errorBuilder: (ctx2, err2, st2) => Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(12),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFFFEDD5),
                                            borderRadius: BorderRadius.circular(14),
                                          ),
                                          child: const Icon(
                                            Icons.local_shipping_rounded,
                                            color: Color(0xFFF97316),
                                            size: 40,
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        Text(
                                          'FLEET MANAGEMENT',
                                          style: GoogleFonts.plusJakartaSans(
                                            fontSize: 22,
                                            fontWeight: FontWeight.w900,
                                            color: Colors.white,
                                            letterSpacing: 1.0,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ),

                            const SizedBox(height: 14),

                            // 2. Tagline: "Drive Smarter, Manage Easier" (Clean white typography)
                            Center(
                              child: Text(
                                'Drive Smarter, Manage Easier',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white,
                                  letterSpacing: 0.3,
                                ),
                              ),
                            ),

                            const SizedBox(height: 40),

                            // 3. Login Heading (White bold text)
                            Text(
                              'Login',
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 30,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                                letterSpacing: -0.5,
                              ),
                            ),

                            const SizedBox(height: 16),

                            // 4. One Input Field with Error Message Displayed Outside
                            Form(
                              key: _formKey,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(
                                        color: _errorMessage != null
                                            ? const Color(0xFFEF4444)
                                            : const Color(0xFFCBD5E1),
                                        width: _errorMessage != null ? 1.5 : 1.2,
                                      ),
                                      boxShadow: [
                                        BoxShadow(
                                          color: _errorMessage != null
                                              ? const Color(0xFFEF4444).withValues(alpha: 0.12)
                                              : Colors.black.withValues(alpha: 0.08),
                                          blurRadius: 12,
                                          offset: const Offset(0, 4),
                                        ),
                                      ],
                                    ),
                                    child: Row(
                                      children: [
                                        Container(
                                          width: 44,
                                          height: 44,
                                          margin: const EdgeInsets.all(4),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFFFEDD5).withValues(alpha: 0.6),
                                            borderRadius: BorderRadius.circular(10),
                                          ),
                                          child: const Icon(
                                            Icons.alternate_email_rounded,
                                            color: Color(0xFFEA580C),
                                            size: 20,
                                          ),
                                        ),
                                        Expanded(
                                          child: TextFormField(
                                            controller: _identifierController,
                                            keyboardType: TextInputType.emailAddress,
                                            textInputAction: TextInputAction.done,
                                            onFieldSubmitted: (_) => _handleNext(),
                                            onChanged: (_) {
                                              if (_errorMessage != null) {
                                                setState(() => _errorMessage = null);
                                              }
                                            },
                                            style: GoogleFonts.plusJakartaSans(
                                              fontSize: 14.5,
                                              color: const Color(0xFF0F172A),
                                              fontWeight: FontWeight.w600,
                                            ),
                                            decoration: InputDecoration(
                                              hintText: 'Email or phone number',
                                              hintStyle: GoogleFonts.plusJakartaSans(
                                                color: const Color(0xFF94A3B8),
                                                fontSize: 13.5,
                                                fontWeight: FontWeight.w400,
                                              ),
                                              border: InputBorder.none,
                                              errorStyle: const TextStyle(
                                                height: 0,
                                                fontSize: 0,
                                                color: Colors.transparent,
                                              ),
                                              contentPadding: const EdgeInsets.symmetric(
                                                horizontal: 10,
                                                vertical: 14,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),

                                  // Error Message Placed Outside The Field
                                  if (_errorMessage != null) ...[
                                    const SizedBox(height: 8),
                                    Padding(
                                      padding: const EdgeInsets.only(left: 4.0),
                                      child: Row(
                                        children: [
                                          const Icon(
                                            Icons.error_outline_rounded,
                                            color: Color(0xFFF87171),
                                            size: 15,
                                          ),
                                          const SizedBox(width: 6),
                                          Expanded(
                                            child: Text(
                                              _errorMessage!,
                                              style: GoogleFonts.plusJakartaSans(
                                                fontSize: 12.5,
                                                fontWeight: FontWeight.w600,
                                                color: const Color(0xFFF87171),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],

                                  const SizedBox(height: 28),

                                  // 5. Next Button (Vibrant Fleet Orange with crisp white arrow circular badge)
                                  InkWell(
                                    onTap: _handleNext,
                                    borderRadius: BorderRadius.circular(30),
                                    child: Container(
                                      height: 52,
                                      decoration: BoxDecoration(
                                        gradient: const LinearGradient(
                                          colors: [
                                            Color(0xFFF97316),
                                            Color(0xFFEA580C),
                                          ],
                                          begin: Alignment.centerLeft,
                                          end: Alignment.centerRight,
                                        ),
                                        borderRadius: BorderRadius.circular(30),
                                        boxShadow: [
                                          BoxShadow(
                                            color: const Color(0xFFF97316).withValues(alpha: 0.38),
                                            blurRadius: 18,
                                            offset: const Offset(0, 6),
                                          ),
                                        ],
                                      ),
                                      child: Row(
                                        children: [
                                          Expanded(
                                            child: Center(
                                              child: Text(
                                                'Next',
                                                style: GoogleFonts.plusJakartaSans(
                                                  color: Colors.white,
                                                  fontSize: 16.5,
                                                  fontWeight: FontWeight.w800,
                                                  letterSpacing: 0.3,
                                                ),
                                              ),
                                            ),
                                          ),
                                          Container(
                                            width: 44,
                                            height: 44,
                                            margin: const EdgeInsets.only(right: 4),
                                            decoration: BoxDecoration(
                                              color: Colors.white,
                                              borderRadius: BorderRadius.circular(22),
                                              boxShadow: [
                                                BoxShadow(
                                                  color: Colors.black.withValues(alpha: 0.12),
                                                  blurRadius: 6,
                                                  offset: const Offset(0, 2),
                                                ),
                                              ],
                                            ),
                                            child: const Icon(
                                              Icons.arrow_forward_rounded,
                                              color: Color(0xFFEA580C),
                                              size: 20,
                                            ),
                                          ),
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
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
