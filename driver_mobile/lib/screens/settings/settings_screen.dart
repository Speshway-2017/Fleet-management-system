import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../constants/app_colors.dart';
import '../../widgets/custom_app_bar.dart';
import '../auth/login_screen.dart';
import '../profile/profile_screen.dart';
import '../profile/help_support_screen.dart';
import 'change_password_screen.dart';
import 'two_factor_auth_screen.dart';
import 'notification_settings_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _isDarkMode = false;
  String _selectedLanguage = 'English (US)';

  void _showLanguageSelector() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.0)),
      ),
      builder: (BuildContext context) {
        final languages = ['English (US)', 'Spanish', 'French', 'German', 'Hindi'];
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 16.0),
                child: Text(
                  'Select Language',
                  style: GoogleFonts.poppins(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              const Divider(color: AppColors.divider, height: 1),
              ...languages.map((lang) => ListTile(
                    title: Text(
                      lang,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.nunito(
                        fontSize: 16,
                        fontWeight: _selectedLanguage == lang ? FontWeight.bold : FontWeight.normal,
                        color: _selectedLanguage == lang ? AppColors.secondary : AppColors.textPrimary,
                      ),
                    ),
                    onTap: () {
                      setState(() {
                        _selectedLanguage = lang;
                      });
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Language changed to $lang.'),
                          backgroundColor: AppColors.success,
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                  )),
            ],
          ),
        );
      },
    );
  }

  void _showLogoutDialog() {
    final outerContext = context;
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16.0),
          ),
          title: Text(
            'Confirm Logout',
            style: GoogleFonts.poppins(
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          content: Text(
            'Are you sure you want to log out from the application?',
            style: GoogleFonts.nunito(
              color: AppColors.textSecondary,
              fontSize: 15,
            ),
          ),
          actionsPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: Text(
                'Cancel',
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w600,
                  color: AppColors.textSecondary,
                ),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(dialogContext); // Close dialog
                ScaffoldMessenger.of(outerContext).showSnackBar(
                  const SnackBar(
                    content: Text('Logged out successfully.'),
                    backgroundColor: AppColors.success,
                    behavior: SnackBarBehavior.floating,
                  ),
                );
                // Redirect to Login Screen and clear navigation stack history
                Navigator.pushAndRemoveUntil(
                  outerContext,
                  MaterialPageRoute(
                    builder: (context) => const LoginScreen(),
                  ),
                  (route) => false,
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8.0),
                ),
                elevation: 0,
              ),
              child: Text(
                'Logout',
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final double screenWidth = MediaQuery.of(context).size.width;
    final bool isSmallScreen = screenWidth < 375;
    final double paddingValue = isSmallScreen ? 16.0 : 20.0;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        centerTitle: false,
        titleSpacing: 0.0,
        backgroundColor: AppColors.primary,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Settings',
          style: GoogleFonts.poppins(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        actions: [
          Container(
            width: 32,
            height: 32,
            margin: const EdgeInsets.only(right: 16.0),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8.0),
            ),
            padding: const EdgeInsets.all(4.0),
            child: Image.asset(
              'assets/logo.png',
              fit: BoxFit.contain,
              errorBuilder: (context, error, stackTrace) {
                return const Icon(
                  Icons.local_shipping,
                  color: AppColors.primary,
                  size: 18,
                );
              },
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: EdgeInsets.symmetric(horizontal: paddingValue, vertical: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Profile Header Card
              Row(
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16.0),
                      border: Border.all(color: AppColors.secondary, width: 2.0),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(14.0),
                      child: ValueListenableBuilder<String>(
                        valueListenable: ProfileState.profilePhotoUrlNotifier,
                        builder: (context, photoUrl, child) {
                          if (photoUrl.isEmpty) {
                            return const Icon(
                              Icons.person,
                              size: 40,
                              color: AppColors.textDisabled,
                            );
                          }
                          return Image.network(
                            photoUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return const Icon(
                                Icons.person,
                                size: 40,
                                color: AppColors.textDisabled,
                              );
                            },
                          );
                        },
                      ),
                    ),
                  ),
                  const SizedBox(width: 18),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Alex Johnson',
                          style: GoogleFonts.poppins(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Driver',
                          style: GoogleFonts.nunito(
                            fontSize: 15,
                            fontWeight: FontWeight.w500,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // ACCOUNT & SECURITY
              _buildSection(
                'Account & Security',
                _buildItemList([
                  _buildRowItem(
                    icon: Icons.lock_outline,
                    title: 'Change Password',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const ChangePasswordScreen(),
                        ),
                      );
                    },
                  ),
                  _buildRowItem(
                    icon: Icons.verified_user_outlined,
                    title: 'Two-Factor Authentication',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const TwoFactorAuthScreen(),
                        ),
                      );
                    },
                  ),
                ]),
              ),

              // APP PREFERENCES
              _buildSection(
                'App Preferences',
                _buildItemList([
                  _buildRowItem(
                    icon: Icons.language,
                    title: 'Language',
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          _selectedLanguage,
                          style: GoogleFonts.nunito(
                            color: AppColors.textSecondary,
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(
                          Icons.keyboard_arrow_down,
                          color: AppColors.textSecondary,
                          size: 20,
                        ),
                      ],
                    ),
                    onTap: _showLanguageSelector,
                  ),
                  _buildRowItem(
                    icon: Icons.dark_mode_outlined,
                    title: 'Dark Mode',
                    trailing: Switch.adaptive(
                      value: _isDarkMode,
                      activeTrackColor: AppColors.secondary,
                      onChanged: (bool value) {
                        setState(() {
                          _isDarkMode = value;
                        });
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Dark Mode ${value ? "enabled" : "disabled"}.'),
                            backgroundColor: AppColors.primary,
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      },
                    ),
                  ),
                ]),
              ),

              // NOTIFICATIONS
              _buildSection(
                'Notifications',
                _buildItemList([
                  _buildRowItem(
                    icon: Icons.notifications_none_outlined,
                    title: 'Notification Settings',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const NotificationSettingsScreen(),
                        ),
                      );
                    },
                  ),
                ]),
              ),

              // LEGAL & SUPPORT
              _buildSection(
                'Legal & Support',
                _buildItemList([
                  _buildAccordionRowItem(
                    icon: Icons.privacy_tip_outlined,
                    title: 'Privacy Policy',
                    description: 'We value your privacy. Fleet Driver Mobile collects location data to provide real-time route updates, track trip progress, and calculate driver safety scores. Your data is encrypted and never shared with third parties without your consent.',
                  ),
                  _buildAccordionRowItem(
                    icon: Icons.gavel,
                    title: 'Terms of Service',
                    description: 'By using Fleet Driver Mobile, you agree to comply with safe driving standards, maintain an active commercial driver\'s license, and report vehicle issues promptly. Fleetflow reserves the right to suspend accounts violating safety regulations.',
                  ),
                  _buildRowItem(
                    icon: Icons.help_outline,
                    title: 'Help Center',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const HelpSupportScreen(),
                        ),
                      );
                    },
                  ),
                  _buildAccordionRowItem(
                    icon: Icons.info_outline,
                    title: 'About App',
                    description: 'Fleet Driver Mobile is a premium companion application for fleet operations management, built with modern design principles and robust telemetry tools. Designed to optimize routes, track vehicle status, and enhance driver safety.',
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'v2.4.12',
                          style: GoogleFonts.nunito(
                            color: AppColors.textSecondary,
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(
                          Icons.keyboard_arrow_down,
                          color: AppColors.textSecondary,
                          size: 20,
                        ),
                      ],
                    ),
                  ),
                ]),
              ),
              const SizedBox(height: 28),

              // Standalone Logout Button
              OutlinedButton.icon(
                onPressed: _showLogoutDialog,
                icon: const Icon(Icons.logout, color: AppColors.error, size: 20),
                label: Text(
                  'Logout',
                  style: GoogleFonts.poppins(
                    color: AppColors.error,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                style: OutlinedButton.styleFrom(
                  backgroundColor: const Color(0xFFF9FAFB),
                  side: const BorderSide(color: AppColors.error, width: 1.2),
                  padding: const EdgeInsets.symmetric(vertical: 14.0),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10.0),
                  ),
                  elevation: 0,
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSection(String title, List<Widget> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 24.0, bottom: 12.0),
          child: Text(
            title.toUpperCase(),
            style: GoogleFonts.poppins(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: AppColors.secondary, // Fleet Orange
              letterSpacing: 0.8,
            ),
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14.0),
            border: Border.all(color: AppColors.divider, width: 1.0),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(14.0),
            child: Column(
              children: items,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRowItem({
    required IconData icon,
    required String title,
    Widget? trailing,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
        child: Row(
          children: [
            Icon(icon, color: AppColors.textPrimary, size: 22),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: GoogleFonts.poppins(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
            trailing ??
                const Icon(
                  Icons.keyboard_arrow_right,
                  color: AppColors.textDisabled,
                  size: 20,
                ),
          ],
        ),
      ),
    );
  }

  Widget _buildAccordionRowItem({
    required IconData icon,
    required String title,
    required String description,
    Widget? trailing,
  }) {
    return Theme(
      data: Theme.of(context).copyWith(
        dividerColor: Colors.transparent,
      ),
      child: ExpansionTile(
        shape: const Border(),
        collapsedShape: const Border(),
        tilePadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
        childrenPadding: const EdgeInsets.only(left: 54.0, right: 16.0, bottom: 16.0),
        leading: Icon(icon, color: AppColors.textPrimary, size: 22),
        title: Text(
          title,
          style: GoogleFonts.poppins(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        trailing: trailing ??
            const Icon(
              Icons.keyboard_arrow_down,
              color: AppColors.textDisabled,
              size: 20,
            ),
        children: [
          Text(
            description,
            style: GoogleFonts.nunito(
              fontSize: 14,
              color: AppColors.textSecondary,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildItemList(List<Widget> items) {
    List<Widget> result = [];
    for (int i = 0; i < items.length; i++) {
      result.add(items[i]);
      if (i < items.length - 1) {
        result.add(const Divider(color: AppColors.divider, height: 1, thickness: 1));
      }
    }
    return result;
  }
}
