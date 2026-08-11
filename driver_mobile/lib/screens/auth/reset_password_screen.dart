import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../providers/auth_provider.dart';
import 'login_screen.dart';
import '../../main.dart';

class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({super.key});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  bool _isPasswordVisible = false;
  bool _isConfirmPasswordVisible = false;

  // Real-time requirements tracking
  bool _hasMinLength = false;
  bool _hasNumber = false;
  bool _hasSpecialChar = false;

  @override
  void initState() {
    super.initState();
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
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Reset Password'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: Container(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Form Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 32.0),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(16.0),
                      border: Border.all(color: AppColors.divider, width: 1.0),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.textPrimary.withAlpha(8),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Logo Container
                          Center(
                            child: Image.asset(
                              'assets/images/logo.png',
                              height: 100,
                              width: 100,
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) {
                                return Container(
                                  height: 100,
                                  width: 100,
                                  decoration: BoxDecoration(
                                    color: AppColors.primary.withAlpha(20),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.local_shipping,
                                    size: 48,
                                    color: AppColors.primary,
                                  ),
                                );
                              },
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Title
                          Text(
                            'Create New Password',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.poppins(
                              fontSize: 26,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 12),

                          // Subtitle Description
                          Text(
                            'Your new password must be different from your previous password.',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.nunito(
                              fontSize: 14.5,
                              fontWeight: FontWeight.w500,
                              color: AppColors.textSecondary,
                              height: 1.4,
                            ),
                          ),
                          const SizedBox(height: 28),

                          // New Password Label (Left-aligned relative to card content)
                          Align(
                            alignment: Alignment.centerLeft,
                            child: Text(
                              'NEW PASSWORD',
                              style: GoogleFonts.poppins(
                                fontSize: 13.5,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimary,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),

                          // New Password Input Field
                          TextFormField(
                            controller: _passwordController,
                            obscureText: !_isPasswordVisible,
                            style: GoogleFonts.nunito(
                              fontSize: 15,
                              color: AppColors.textPrimary,
                              fontWeight: FontWeight.w500,
                            ),
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return 'Please enter your password';
                              }
                              return null;
                            },
                            onChanged: (value) {
                              // Trigger button validation refresh
                              setState(() {});
                            },
                            decoration: InputDecoration(
                              hintText: '1234456',
                              fillColor: Colors.white,
                              filled: true,
                              prefixIcon: const Icon(
                                Icons.lock_outline,
                                color: AppColors.textSecondary,
                                size: 22,
                              ),
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _isPasswordVisible
                                      ? Icons.visibility_outlined
                                      : Icons.visibility_off_outlined,
                                  color: AppColors.textSecondary,
                                  size: 22,
                                ),
                                onPressed: () {
                                  setState(() {
                                    _isPasswordVisible = !_isPasswordVisible;
                                  });
                                },
                              ),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12.0),
                                borderSide: const BorderSide(color: AppColors.divider, width: 1.0),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12.0),
                                borderSide: const BorderSide(color: AppColors.divider, width: 1.0),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12.0),
                                borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                              ),
                            ),
                          ),
                          const SizedBox(height: 20),

                          // Confirm Password Label
                          Align(
                            alignment: Alignment.centerLeft,
                            child: Text(
                              'CONFIRM PASSWORD',
                              style: GoogleFonts.poppins(
                                fontSize: 13.5,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimary,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),

                          // Confirm Password Input Field
                          TextFormField(
                            controller: _confirmPasswordController,
                            obscureText: !_isConfirmPasswordVisible,
                            style: GoogleFonts.nunito(
                              fontSize: 15,
                              color: AppColors.textPrimary,
                              fontWeight: FontWeight.w500,
                            ),
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return 'Please confirm your password';
                              }
                              if (value != _passwordController.text) {
                                return 'Passwords do not match';
                              }
                              return null;
                            },
                            onChanged: (value) {
                              setState(() {});
                            },
                            decoration: InputDecoration(
                              hintText: '1234456',
                              fillColor: Colors.white,
                              filled: true,
                              prefixIcon: const Icon(
                                Icons.lock_outline,
                                color: AppColors.textSecondary,
                                size: 22,
                              ),
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _isConfirmPasswordVisible
                                      ? Icons.visibility_outlined
                                      : Icons.visibility_off_outlined,
                                  color: AppColors.textSecondary,
                                  size: 22,
                                ),
                                onPressed: () {
                                  setState(() {
                                    _isConfirmPasswordVisible = !_isConfirmPasswordVisible;
                                  });
                                },
                              ),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12.0),
                                borderSide: const BorderSide(color: AppColors.divider, width: 1.0),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12.0),
                                borderSide: const BorderSide(color: AppColors.divider, width: 1.0),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12.0),
                                borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                              ),
                            ),
                          ),
                          const SizedBox(height: 20),

                          // Password Requirements Container
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(16.0),
                            decoration: BoxDecoration(
                              color: AppColors.info.withAlpha(20),
                              borderRadius: BorderRadius.circular(12.0),
                              border: Border.all(color: AppColors.info.withAlpha(30), width: 1.0),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Password Requirements',
                                  style: GoogleFonts.poppins(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 12),
                                _buildRequirementRow('Minimum 8 characters', _hasMinLength),
                                const SizedBox(height: 8),
                                _buildRequirementRow('One number', _hasNumber),
                                const SizedBox(height: 8),
                                _buildRequirementRow('One special character', _hasSpecialChar),
                              ],
                            ),
                          ),
                          const SizedBox(height: 28),

                          // Reset Password Button
                          ElevatedButton(
                            onPressed: _isLoading ? null : () async {
                              if (!_hasMinLength || !_hasNumber || !_hasSpecialChar) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Please ensure your new password meets all the password requirements.'),
                                    backgroundColor: AppColors.error,
                                  ),
                                );
                                return;
                              }
                              if (_passwordController.text != _confirmPasswordController.text) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Passwords do not match. Please verify.'),
                                    backgroundColor: AppColors.error,
                                  ),
                                );
                                return;
                              }
                              if (_formKey.currentState!.validate()) {
                                setState(() => _isLoading = true);
                                final auth = Provider.of<AuthProvider>(context, listen: false);
                                final messenger = ScaffoldMessenger.of(context);
                                final navigator = Navigator.of(context);
                                
                                final ok = await auth.resetPassword(_passwordController.text.trim());
                                if (!mounted) return;
                                
                                if (ok) {
                                  messenger.showSnackBar(
                                    const SnackBar(
                                      content: Text('Password reset successfully! Please login with your new password.'),
                                      backgroundColor: AppColors.success,
                                    ),
                                  );
                                  navigator.pushAndRemoveUntil(
                                    MaterialPageRoute(
                                      builder: (context) => const AuthSessionWrapper(),
                                    ),
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
                                if (mounted) setState(() => _isLoading = false);
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              minimumSize: const Size(double.infinity, 54),
                              disabledBackgroundColor: AppColors.primary.withAlpha(50),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12.0)),
                              elevation: 0,
                            ),
                            child: _isLoading
                                ? const SizedBox(
                                    width: 24,
                                    height: 24,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2,
                                    ),
                                  )
                                : Text(
                                    'Reset Password',
                                    style: GoogleFonts.poppins(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                          ),
                          const SizedBox(height: 24),

                          // Back to Login Footer
                          Center(
                            child: InkWell(
                              onTap: () {
                                // Navigate back to Login Screen and clear stack history
                                 Navigator.pushAndRemoveUntil(
                                   context,
                                   MaterialPageRoute(
                                     builder: (context) => const AuthSessionWrapper(),
                                   ),
                                   (route) => false,
                                 );
                              },
                              borderRadius: BorderRadius.circular(8.0),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                                child: Text(
                                  'Back to Login',
                                  style: GoogleFonts.poppins(
                                    fontSize: 14.5,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.secondary,
                                  ),
                                ),
                              ),
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
    );
  }

  Widget _buildRequirementRow(String text, bool isMet) {
    return Row(
      children: [
        Icon(
          isMet ? Icons.check_circle : Icons.radio_button_unchecked,
          color: isMet ? AppColors.success : AppColors.textSecondary,
          size: 18,
        ),
        const SizedBox(width: 8),
        Text(
          text,
          style: GoogleFonts.nunito(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isMet ? AppColors.textPrimary : AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}
