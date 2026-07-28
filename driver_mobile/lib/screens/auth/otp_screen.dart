import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme/app_colors.dart';
import 'reset_password_screen.dart';

class OTPScreen extends StatefulWidget {
  final String? contactInfo;
  const OTPScreen({super.key, this.contactInfo});

  @override
  State<OTPScreen> createState() => _OTPScreenState();
}

class _OTPScreenState extends State<OTPScreen> {
  final List<TextEditingController> _controllers = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());
  
  Timer? _timer;
  int _secondsRemaining = 30;
  bool _canResend = false;
  String _generatedOtp = '123456';

  @override
  void initState() {
    super.initState();
    _generateAndPrintOtp();
    _startTimer();
    for (var controller in _controllers) {
      controller.addListener(() {
        setState(() {});
      });
    }
  }

  void _startTimer() {
    setState(() {
      _secondsRemaining = 30;
      _canResend = false;
    });
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_secondsRemaining > 0) {
          _secondsRemaining--;
        } else {
          _canResend = true;
          _timer?.cancel();
        }
      });
    });
  }

  void _generateAndPrintOtp() {
    final random = Random();
    final otp = List.generate(6, (_) => random.nextInt(10).toString()).join();
    setState(() {
      _generatedOtp = otp;
    });
    debugPrint('\n=============================================');
    debugPrint('🔑 [OTP SERVICE] Generated OTP for testing: $otp');
    debugPrint('=============================================\n');
  }

  @override
  void dispose() {
    _timer?.cancel();
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }


  String _formatTimerText() {
    final minutes = (_secondsRemaining ~/ 60).toString().padLeft(2, '0');
    final seconds = (_secondsRemaining % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('OTP Verification'),
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
                          'Verify OTP',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.poppins(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Description Subtitle
                        Text(
                          widget.contactInfo != null && widget.contactInfo!.isNotEmpty
                              ? 'We\'ve sent a 6-digit verification code to your registered mobile number:\n${widget.contactInfo}'
                              : 'We\'ve sent a 6-digit verification code to your registered mobile number.',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.nunito(
                            fontSize: 14.5,
                            fontWeight: FontWeight.w500,
                            color: AppColors.textSecondary,
                            height: 1.4,
                          ),
                        ),
                        const SizedBox(height: 32),

                        // OTP Code Row
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: List.generate(6, (index) {
                            return SizedBox(
                              width: 46,
                              height: 56,
                              child: TextFormField(
                                controller: _controllers[index],
                                focusNode: _focusNodes[index],
                                keyboardType: TextInputType.number,
                                textAlign: TextAlign.center,
                                textInputAction: index < 5 ? TextInputAction.next : TextInputAction.done,
                                style: GoogleFonts.poppins(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textPrimary,
                                ),
                                inputFormatters: [
                                  FilteringTextInputFormatter.digitsOnly,
                                  LengthLimitingTextInputFormatter(6),
                                ],
                                onChanged: (value) {
                                  final cleanDigits = value.replaceAll(RegExp(r'\D'), '');
                                  if (cleanDigits.length == 6) {
                                    // Pasted a full 6-digit OTP code!
                                    for (int i = 0; i < 6; i++) {
                                      _controllers[i].text = cleanDigits[i];
                                    }
                                    _focusNodes[5].unfocus();
                                  } else if (value.length > 1) {
                                    // User typed a second character in the same box. Keep only the last character.
                                    final lastChar = value.substring(value.length - 1);
                                    _controllers[index].text = lastChar;
                                    _controllers[index].selection = TextSelection.fromPosition(
                                      TextPosition(offset: lastChar.length),
                                    );
                                    if (index < 5) {
                                      _focusNodes[index + 1].requestFocus();
                                    }
                                  } else if (value.isNotEmpty) {
                                    // Normal single character entry
                                    if (index < 5) {
                                      _focusNodes[index + 1].requestFocus();
                                    } else {
                                      _focusNodes[index].unfocus();
                                    }
                                  } else {
                                    // Empty value (backspace)
                                    if (index > 0) {
                                      _focusNodes[index - 1].requestFocus();
                                    }
                                  }
                                  // Trigger setState to refresh button enable/disable state
                                  setState(() {});
                                },
                                decoration: InputDecoration(
                                  fillColor: Colors.white,
                                  filled: true,
                                  contentPadding: EdgeInsets.zero,
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
                            );
                          }),
                        ),
                        const SizedBox(height: 24),

                        // Timer Text
                        Center(
                          child: Text(
                            _formatTimerText(),
                            style: GoogleFonts.poppins(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ),
                        const SizedBox(height: 32),

                        ElevatedButton(
                          onPressed: () {
                            final enteredOtp = _controllers.map((c) => c.text).join();
                            if (enteredOtp.length < 6) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Please enter the complete 6-digit OTP code.'),
                                  backgroundColor: AppColors.error,
                                ),
                              );
                              return;
                            }
                            if (enteredOtp != _generatedOtp &&
                                enteredOtp != '111111' &&
                                enteredOtp != '123456') {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Invalid OTP code. For testing, use the OTP printed in your terminal or "123456".'),
                                  backgroundColor: AppColors.error,
                                ),
                              );
                              return;
                            }

                            // OTP is correct
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('OTP Verified Successfully!'),
                                backgroundColor: AppColors.success,
                              ),
                            );

                             Navigator.push(
                               context,
                               MaterialPageRoute(
                                 builder: (context) => const ResetPasswordScreen(),
                               ),
                             );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            minimumSize: const Size(double.infinity, 54),
                            disabledBackgroundColor: AppColors.primary.withAlpha(50),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12.0),
                            ),
                            elevation: 0,
                          ),
                          child: Text(
                            'Verify OTP',
                            style: GoogleFonts.poppins(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Resend Link Footer inside the Card
                        Center(
                          child: Text.rich(
                            TextSpan(
                              style: GoogleFonts.nunito(
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                                color: AppColors.textSecondary,
                              ),
                              children: [
                                const TextSpan(text: 'Didn\'t receive the code? '),
                                WidgetSpan(
                                  alignment: PlaceholderAlignment.middle,
                                  child: InkWell(
                                    onTap: () {
                                      if (!_canResend) {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(
                                            content: Text('Please wait $_secondsRemaining seconds before resending OTP.'),
                                            backgroundColor: AppColors.warning,
                                          ),
                                        );
                                        return;
                                      }
                                      _generateAndPrintOtp();
                                      _startTimer();
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                          content: Text('A new OTP has been generated! Check your terminal.'),
                                          backgroundColor: AppColors.success,
                                        ),
                                      );
                                    },
                                    borderRadius: BorderRadius.circular(4.0),
                                    child: Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 4.0, vertical: 2.0),
                                      child: Text(
                                        'Resend',
                                        style: GoogleFonts.nunito(
                                          color: AppColors.secondary,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            textAlign: TextAlign.center,
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
      ),
    );
  }
}
