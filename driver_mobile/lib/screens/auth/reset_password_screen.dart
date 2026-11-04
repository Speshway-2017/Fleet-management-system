import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../theme/app_colors.dart';
import '../../providers/auth_provider.dart';
import 'login_screen.dart';

class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({super.key});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> with SingleTickerProviderStateMixin {
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isPasswordVisible = false;
  bool _isConfirmPasswordVisible = false;
  bool _isLoading = false;

  // Real-time requirements tracking
  bool _hasMinLength = false;
  bool _hasNumber = false;
  bool _hasSpecialChar = false;

  late AnimationController _animController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeOutCubic,
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.06),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animController,
      curve: Curves.easeOutCubic,
    ));
    _animController.forward();

    _passwordController.addListener(() {
      _validatePasswordRequirements();
      setState(() {});
    });
    _confirmPasswordController.addListener(() {
      setState(() {});
    });
  }

  void _validatePasswordRequirements() {
    final text = _passwordController.text;
    setState(() {
      _hasMinLength = text.length >= 8;
      _hasNumber = RegExp(r'[0-9]').hasMatch(text);
      _hasSpecialChar = RegExp(r'[!@#\$%^&*(),.?":{}|<>_~-]').hasMatch(text);
    });
  }

  @override
  void dispose() {
    _animController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _handleBack() {
    if (Navigator.canPop(context)) {
      Navigator.pop(context);
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    }
  }

  void _handleResetPassword() async {
    if (!_formKey.currentState!.validate()) return;
    if (_passwordController.text != _confirmPasswordController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Passwords do not match. Please verify.'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);
    final newPassword = _passwordController.text.trim();
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);

    try {
      final ok = await auth.resetPassword(newPassword);
      if (!mounted) return;

      if (ok) {
        messenger.showSnackBar(
          const SnackBar(
            content: Text('Password reset successfully! Please login with your new password.'),
            backgroundColor: AppColors.success,
          ),
        );
        navigator.pushAndRemoveUntil(
          MaterialPageRoute(builder: (context) => const LoginScreen()),
          (route) => false,
        );
      } else {
        messenger.showSnackBar(
          SnackBar(
            content: Text(auth.errorMessage ?? 'Failed to reset password. Please try again.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      messenger.showSnackBar(
        SnackBar(
          content: Text('Reset error: ${e.toString().replaceAll('Exception: ', '')}'),
          backgroundColor: AppColors.error,
        ),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF071228),
      body: Stack(
        children: [
          // Background Gradient
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

          // Warm Ambient Radial Glow
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

          // Main Foreground Content Centered in Middle of Screen
          SafeArea(
            child: LayoutBuilder(
              builder: (context, constraints) {
                return SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(vertical: 24.0),
                  child: ConstrainedBox(
                    constraints: BoxConstraints(
                      minHeight: (constraints.maxHeight - 48.0) > 0 ? (constraints.maxHeight - 48.0) : 0,
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Top Branding Bar: Official Fleet Management Logo Centered (Height 115)
                        Padding(
                          padding: const EdgeInsets.only(left: 20.0, right: 20.0, bottom: 12.0),
                          child: Center(
                            child: FittedBox(
                              fit: BoxFit.scaleDown,
                              alignment: Alignment.center,
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Image.asset(
                                    'assets/images/auth_logo.png',
                                    height: 115,
                                    fit: BoxFit.contain,
                                    errorBuilder: (ctx, err, st) => Image.asset(
                                      'assets/images/logo.png',
                                      height: 115,
                                      fit: BoxFit.contain,
                                      errorBuilder: (ctx2, err2, st2) => Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.all(7),
                                            decoration: BoxDecoration(
                                              color: Colors.white.withValues(alpha: 0.15),
                                              borderRadius: BorderRadius.circular(10),
                                            ),
                                            child: const Icon(
                                              Icons.local_shipping_rounded,
                                              color: Color(0xFFF97316),
                                              size: 40,
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            'FLEET MANAGEMENT',
                                            style: GoogleFonts.plusJakartaSans(
                                              fontSize: 20,
                                              fontWeight: FontWeight.w900,
                                              color: const Color(0xFF0B1B3D),
                                              letterSpacing: 1.0,
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

                        const SizedBox(height: 14),

                        // Hero Titles: "Create New Password" (Centered dual-tone with white subtext)
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 24.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              FittedBox(
                                fit: BoxFit.scaleDown,
                                alignment: Alignment.center,
                                child: RichText(
                                  text: TextSpan(
                                    style: GoogleFonts.plusJakartaSans(
                                      fontSize: 32,
                                      fontWeight: FontWeight.w800,
                                      height: 1.15,
                                    ),
                                    children: const [
                                      TextSpan(
                                        text: 'Create ',
                                        style: TextStyle(color: Color(0xFF0B1B3D)),
                                      ),
                                      TextSpan(
                                        text: 'New Password',
                                        style: TextStyle(color: Color(0xFFF97316)),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Your new password must be at least 8 characters long',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 13,
                                  color: Colors.white,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Floating Glassmorphic Form Card (Matches Login Page)
                        SlideTransition(
                          position: _slideAnimation,
                          child: FadeTransition(
                            opacity: _fadeAnimation,
                            child: Container(
                              margin: const EdgeInsets.only(top: 24.0, left: 18.0, right: 18.0),
                              constraints: const BoxConstraints(maxWidth: 440),
                              padding: const EdgeInsets.symmetric(horizontal: 6.0),
                              child: Form(
                                key: _formKey,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // 1. New Password Input with visibility toggle eye icon
                                    _buildInputField(
                                      controller: _passwordController,
                                      hintText: 'Enter new password',
                                      icon: Icons.lock_outline_rounded,
                                      obscureText: !_isPasswordVisible,
                                      suffixIcon: IconButton(
                                        icon: Icon(
                                          _isPasswordVisible
                                              ? Icons.visibility_rounded
                                              : Icons.visibility_off_rounded,
                                          color: _isPasswordVisible
                                              ? const Color(0xFFF97316)
                                              : Colors.white.withValues(alpha: 0.65),
                                          size: 20,
                                        ),
                                        onPressed: () {
                                          setState(() {
                                            _isPasswordVisible = !_isPasswordVisible;
                                          });
                                        },
                                        splashRadius: 20,
                                        tooltip: _isPasswordVisible
                                            ? 'Hide password'
                                            : 'Show password',
                                      ),
                                      validator: (v) {
                                        if (v == null || v.trim().isEmpty) return 'Please enter a new password';
                                        if (v.length < 8) return 'Password must be at least 8 characters';
                                        return null;
                                      },
                                    ),

                                    const SizedBox(height: 16),

                                    // 2. Confirm Password Input with visibility toggle eye icon
                                    _buildInputField(
                                      controller: _confirmPasswordController,
                                      hintText: 'Confirm new password',
                                      icon: Icons.shield_outlined,
                                      obscureText: !_isConfirmPasswordVisible,
                                      suffixIcon: IconButton(
                                        icon: Icon(
                                          _isConfirmPasswordVisible
                                              ? Icons.visibility_rounded
                                              : Icons.visibility_off_rounded,
                                          color: _isConfirmPasswordVisible
                                              ? const Color(0xFFF97316)
                                              : Colors.white.withValues(alpha: 0.65),
                                          size: 20,
                                        ),
                                        onPressed: () {
                                          setState(() {
                                            _isConfirmPasswordVisible = !_isConfirmPasswordVisible;
                                          });
                                        },
                                        splashRadius: 20,
                                        tooltip: _isConfirmPasswordVisible
                                            ? 'Hide password'
                                            : 'Show password',
                                      ),
                                      validator: (v) {
                                        if (v == null || v.trim().isEmpty) return 'Please confirm your password';
                                        if (v != _passwordController.text) return 'Passwords do not match';
                                        return null;
                                      },
                                    ),

                                    const SizedBox(height: 16),

                                    // Live Password Rules Checklist in Modern Container
                                    Container(
                                      padding: const EdgeInsets.all(14),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(14),
                                        border: Border.all(color: const Color(0xFFE2E8F0)),
                                        boxShadow: [
                                          BoxShadow(
                                            color: Colors.black.withValues(alpha: 0.05),
                                            blurRadius: 10,
                                            offset: const Offset(0, 3),
                                          ),
                                        ],
                                      ),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            'PASSWORD REQUIREMENTS',
                                            style: GoogleFonts.plusJakartaSans(
                                              fontSize: 10.5,
                                              fontWeight: FontWeight.w800,
                                              color: const Color(0xFF64748B),
                                              letterSpacing: 0.5,
                                            ),
                                          ),
                                          const SizedBox(height: 8),
                                          _buildRequirementItem('At least 8 characters', _hasMinLength),
                                          const SizedBox(height: 5),
                                          _buildRequirementItem('At least 1 number (0-9)', _hasNumber),
                                          const SizedBox(height: 5),
                                          _buildRequirementItem('At least 1 special character (!@#\$%...)', _hasSpecialChar),
                                        ],
                                      ),
                                    ),

                                    const SizedBox(height: 24),

                                    // Reset Password Button (Vibrant Orange Pill matching Login Page)
                                    InkWell(
                                      onTap: _isLoading ? null : _handleResetPassword,
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
                                                child: _isLoading
                                                    ? const SizedBox(
                                                        width: 20,
                                                        height: 20,
                                                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                                      )
                                                    : FittedBox(
                                                        fit: BoxFit.scaleDown,
                                                        child: Text(
                                                          'Reset Password',
                                                          style: GoogleFonts.plusJakartaSans(
                                                            color: Colors.white,
                                                            fontSize: 16,
                                                            fontWeight: FontWeight.w700,
                                                          ),
                                                        ),
                                                      ),
                                              ),
                                            ),
                                            Container(
                                              width: 48,
                                              height: 48,
                                              margin: const EdgeInsets.only(right: 2),
                                              decoration: BoxDecoration(
                                                color: Colors.white,
                                                borderRadius: BorderRadius.circular(24),
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
                            ),
                          ),
                        ),

                        const SizedBox(height: 36),

                        // Footer: Back to Login
                        Center(
                          child: Wrap(
                            alignment: WrapAlignment.center,
                            crossAxisAlignment: WrapCrossAlignment.center,
                            children: [
                              Text(
                                'Remember your password? ',
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 13,
                                  color: Colors.white.withValues(alpha: 0.85),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              InkWell(
                                onTap: () {
                                  Navigator.pushAndRemoveUntil(
                                    context,
                                    MaterialPageRoute(builder: (context) => const LoginScreen()),
                                    (route) => false,
                                  );
                                },
                                child: Text(
                                  'Sign In',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 13,
                                    color: const Color(0xFFF97316),
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 16),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Top Left Floating Back Button (Rendered on top for instant tap response)
          Positioned(
            top: 12,
            left: 16,
            child: SafeArea(
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: _handleBack,
                  borderRadius: BorderRadius.circular(20),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.92),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF0B1B3D).withValues(alpha: 0.08),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.arrow_back_rounded, size: 15, color: Color(0xFF0B1B3D)),
                        const SizedBox(width: 4),
                        Text(
                          'Back',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF0B1B3D),
                          ),
                        ),
                      ],
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

  Widget _buildInputField({
    required TextEditingController controller,
    required String hintText,
    required IconData icon,
    bool obscureText = false,
    Widget? suffixIcon,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      style: GoogleFonts.plusJakartaSans(
        fontSize: 14,
        color: Colors.white,
        fontWeight: FontWeight.w600,
      ),
      validator: validator,
      decoration: InputDecoration(
        filled: false,
        hintText: hintText,
        hintStyle: GoogleFonts.plusJakartaSans(
          color: Colors.white.withValues(alpha: 0.45),
          fontSize: 13.5,
          fontWeight: FontWeight.w400,
        ),
        prefixIcon: Padding(
          padding: const EdgeInsets.only(left: 14.0, right: 10.0),
          child: Icon(icon, color: const Color(0xFFF97316), size: 20),
        ),
        prefixIconConstraints: const BoxConstraints(minWidth: 44, minHeight: 44),
        suffixIcon: suffixIcon,
        suffixIconConstraints: const BoxConstraints(minWidth: 44, minHeight: 44),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.22), width: 1.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.22), width: 1.0),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFFF97316), width: 1.8),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFFEF4444), width: 1.2),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFFEF4444), width: 1.8),
        ),
      ),
    );
  }

  Widget _buildRequirementItem(String text, bool isMet) {
    return Row(
      children: [
        Icon(
          isMet ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
          size: 14,
          color: isMet ? const Color(0xFF22C55E) : const Color(0xFF94A3B8),
        ),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            text,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 11.5,
              fontWeight: isMet ? FontWeight.w600 : FontWeight.w500,
              color: isMet ? const Color(0xFF15803D) : const Color(0xFF64748B),
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}
