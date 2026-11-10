import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../services/localization_service.dart';
import '../../theme/app_colors.dart';
import '../../widgets/legal_modal.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../auth/login_screen.dart';
import '../main_navigation_screen.dart';
import 'edit_profile_screen.dart';
import 'help_support_screen.dart';
import '../settings/change_password_screen.dart';
import '../settings/two_factor_auth_screen.dart';
import '../settings/notification_settings_screen.dart';

/// Driver Module - Profile Screen
/// 
/// Updated design specifications:
/// - Dark navy top navigation bar (#101C2C) with white back arrow and title, matching other pages
/// - Warm light background (#F7F9FC)
/// - Icons styled in Navy Blue (#0F172A) with warm soft-orange squircle containers (#FFF7ED)
/// - Accents, pill badges, and highlights transitioned from blue to Fleet Orange (#F97316)
/// - Hidden items: "My assigned trips", "Assigned vehicle", and "Dark mode"
/// - Retains full compatibility with tests (Personal Information, Driver's License Details, Logout, Edit Profile)
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  static const Color primaryDark = Color(0xFF101C2C);
  static const Color navyIcon = Color(0xFF0F172A);
  static const Color orangePrimary = Color(0xFFF97316);
  static const Color orangeLightBg = Color(0xFFFFF7ED);
  static const Color orangeBorder = Color(0xFFFFEDD5);

  String _selectedLanguage = LocalizationService.currentLanguage;

  static String normalizeLanguage(String? lang) {
    return LocalizationService.normalizeLanguage(lang);
  }

  @override
  void initState() {
    super.initState();
    _selectedLanguage = LocalizationService.currentLanguage;
    _loadSavedLanguage();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      await auth.refreshProfile();
      if (mounted && auth.driver != null && auth.driver!.language.isNotEmpty) {
        setState(() {
          _selectedLanguage = normalizeLanguage(auth.driver!.language);
        });
      }
    });
  }

  Future<void> _loadSavedLanguage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getString('app_language');
      if (saved != null && saved.isNotEmpty && mounted) {
        setState(() {
          _selectedLanguage = normalizeLanguage(saved);
        });
      }
    } catch (_) {}
  }

  void _showLogoutDialog(BuildContext context) {
    final outerContext = context;
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16.0),
          ),
          title: Text(
            'Confirm Logout'.tr,
            style: GoogleFonts.poppins(
              fontWeight: FontWeight.bold,
              color: navyIcon,
            ),
          ),
          content: Text(
            'Are you sure you want to log out from the application?'.tr,
            style: GoogleFonts.nunito(
              color: const Color(0xFF64748B),
              fontSize: 15,
            ),
          ),
          actionsPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: Text(
                'Cancel'.tr,
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF64748B),
                ),
              ),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(dialogContext); // Close confirmation dialog

                final auth = Provider.of<AuthProvider>(outerContext, listen: false);
                await auth.logout();

                if (outerContext.mounted) {
                  Navigator.of(outerContext, rootNavigator: true).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (context) => const LoginScreen()),
                    (route) => false,
                  );

                  ScaffoldMessenger.of(outerContext).showSnackBar(
                    SnackBar(
                      content: Text('Logged out successfully.'.tr),
                      backgroundColor: const Color(0xFF10B981),
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFEF4444),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8.0),
                ),
                elevation: 0,
              ),
              child: Text(
                'Logout'.tr,
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

  Future<void> _handleDeleteAccount(BuildContext context) async {
    final outerContext = context;
    final auth = Provider.of<AuthProvider>(outerContext, listen: false);
    try {
      await ApiService.deleteDriverAccount();
    } catch (e) {
      debugPrint('Driver deletion API error: $e');
    }
    await auth.logout();

    if (outerContext.mounted) {
      Navigator.of(outerContext, rootNavigator: true).pushAndRemoveUntil(
        MaterialPageRoute(builder: (context) => const LoginScreen()),
        (route) => false,
      );

      ScaffoldMessenger.of(outerContext).showSnackBar(
        SnackBar(
          content: Text('Account permanently deleted and set to In-Active. You have been logged out.'.tr),
          backgroundColor: const Color(0xFFEF4444),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  void _showDeleteAccountDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16.0),
          ),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEE2E2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.delete_forever_rounded,
                  color: Color(0xFFEF4444),
                  size: 24,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Delete Account'.tr,
                  style: GoogleFonts.poppins(
                    fontWeight: FontWeight.bold,
                    color: navyIcon,
                    fontSize: 17,
                  ),
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Are you sure you want to request deletion of your driver account? This action will permanently deactivate your driver profile, vehicle assignments, and active GPS telemetry.'.tr,
                style: GoogleFonts.nunito(
                  color: const Color(0xFF64748B),
                  fontSize: 14,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 12),
              InkWell(
                onTap: () {
                  Navigator.pop(dialogContext);
                  LegalModal.showAccountDeletion(
                    context,
                    onConfirmDelete: () => _handleDeleteAccount(context),
                  );
                },
                borderRadius: BorderRadius.circular(6),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4.0),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.article_outlined,
                        size: 16,
                        color: orangePrimary,
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          'View Full Account Deletion Policy'.tr,
                          style: GoogleFonts.poppins(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: orangePrimary,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          actionsPadding: const EdgeInsets.fromLTRB(16.0, 0.0, 16.0, 16.0),
          actions: [
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(dialogContext),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF64748B),
                      side: const BorderSide(color: Color(0xFFE2E8F0), width: 1.2),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10.0),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12.0),
                    ),
                    child: Text(
                      'Cancel'.tr,
                      style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w600,
                        fontSize: 13.5,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () async {
                      Navigator.pop(dialogContext);
                      await _handleDeleteAccount(context);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFEF4444),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10.0),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12.0),
                    ),
                    child: Text(
                      'Confirm Deletion'.tr,
                      style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w600,
                        fontSize: 13.5,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );
  }

  void _showLanguageSelector(BuildContext context, [String? activeLanguage]) {
    final currentLanguage = activeLanguage ?? _selectedLanguage;
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24.0)),
      ),
      builder: (BuildContext sheetContext) {
        const languages = [
          'English (US)',
          'Spanish',
          'French',
          'German',
          'Hindi',
        ];
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: const Color(0xFFE2E8F0),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: orangeLightBg,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: orangeBorder, width: 1.0),
                      ),
                      child: const Icon(Icons.language_rounded, color: orangePrimary, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      'Select Language'.tr,
                      style: GoogleFonts.poppins(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: navyIcon,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                const Divider(color: Color(0xFFF1F5F9), height: 1),
                const SizedBox(height: 8),
                ...languages.map((lang) {
                  final isSelected = normalizeLanguage(currentLanguage) == normalizeLanguage(lang);
                  return InkWell(
                    onTap: () async {
                      final messenger = ScaffoldMessenger.of(context);
                      Navigator.pop(sheetContext);

                      final normalized = LocalizationService.normalizeLanguage(lang);
                      setState(() {
                        _selectedLanguage = normalized;
                      });

                      final auth = Provider.of<AuthProvider>(context, listen: false);
                      await auth.setLanguage(normalized);

                      if (mounted) {
                        messenger.clearSnackBars();
                        messenger.showSnackBar(
                          SnackBar(
                            content: Row(
                              children: [
                                const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    '${'Language changed to'.tr} $lang.',
                                    style: GoogleFonts.poppins(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            backgroundColor: const Color(0xFF10B981),
                            behavior: SnackBarBehavior.floating,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                            duration: const Duration(seconds: 2),
                          ),
                        );
                      }
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      margin: const EdgeInsets.symmetric(vertical: 4),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: isSelected ? orangeLightBg : Colors.transparent,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? orangeBorder : Colors.transparent,
                          width: 1.2,
                        ),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              lang,
                              style: GoogleFonts.poppins(
                                fontSize: 15,
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                color: isSelected ? orangePrimary : navyIcon,
                              ),
                            ),
                          ),
                          if (isSelected)
                            const Icon(
                              Icons.check_circle_rounded,
                              color: orangePrimary,
                              size: 20,
                            ),
                        ],
                      ),
                    ),
                  );
                }),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showLicenseDetailsModal(BuildContext context, dynamic driver) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24.0)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: orangeLightBg,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.badge_outlined, color: navyIcon, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Driver's License Details".tr,
                            style: GoogleFonts.poppins(
                              fontSize: 17,
                              fontWeight: FontWeight.bold,
                              color: navyIcon,
                            ),
                          ),
                          Text(
                            'Government Verified Transport Authorization'.tr,
                            style: GoogleFonts.nunito(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF64748B),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                const Divider(color: Color(0xFFF1F5F9), height: 1),
                const SizedBox(height: 16),
                _buildLicenseRow('LICENSE NUMBER'.tr, driver.licenseNumber ?? 'N/A'),
                const SizedBox(height: 12),
                _buildLicenseRow('LICENSE CATEGORY'.tr, driver.licenseType ?? 'Heavy Motor Vehicle (HMV)'),
                const SizedBox(height: 12),
                _buildLicenseRow('RTO / BRANCH'.tr, driver.branch ?? 'Regional Transport Office'),
                const SizedBox(height: 12),
                _buildLicenseRow('EXPERIENCE'.tr, '${driver.experience ?? 4} ${'Years Commercial Driving'.tr}'),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryDark,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    child: Text(
                      'Close Details'.tr,
                      style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildLicenseRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF94A3B8),
            letterSpacing: 0.5,
          ),
        ),
        Text(
          value,
          style: GoogleFonts.poppins(
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: navyIcon,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: LocalizationService.currentLanguageNotifier,
      builder: (context, currentLanguage, _) {
        return Consumer<AuthProvider>(
          builder: (context, auth, child) {
            if (auth.isLoading && auth.driver == null) {
              return const Scaffold(
                backgroundColor: Color(0xFFF7F9FC),
                body: Center(
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(orangePrimary),
                  ),
                ),
              );
            }

            if (auth.errorMessage != null && auth.driver == null) {
              return Scaffold(
                backgroundColor: const Color(0xFFF7F9FC),
                body: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.error_outline,
                          color: Color(0xFFEF4444),
                          size: 48,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          auth.errorMessage!,
                          textAlign: TextAlign.center,
                          style: GoogleFonts.poppins(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: navyIcon,
                          ),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () => auth.refreshProfile(),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: primaryDark,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8.0),
                            ),
                          ),
                          child: Text(
                            'Retry'.tr,
                            style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }

            final driver = auth.driver;
            if (driver == null) {
              return Scaffold(
                backgroundColor: const Color(0xFFF7F9FC),
                body: Center(
                  child: Text('No profile data found.'.tr),
                ),
              );
            }

            // Dynamically update profile image notifier
            if (driver.profileImage != ProfileState.profilePhotoUrlNotifier.value) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                ProfileState.profilePhotoUrlNotifier.value = driver.profileImage;
              });
            }

            final joiningYear = DateTime.tryParse(driver.joiningDate)?.year ?? 2020;
            final initialLetter = driver.fullName.isNotEmpty ? driver.fullName[0].toUpperCase() : 'D';
            final statusDisplay = driver.driverStatus.isNotEmpty
                ? driver.driverStatus.replaceAll('_', ' ').toUpperCase()
                : 'SENIOR DRIVER';
            final cityDisplay = driver.address.isNotEmpty
                ? driver.address.split(',')[0].trim()
                : 'Hyderabad';
            final emergencyContact = driver.manager != null && driver.manager!.name.isNotEmpty
                ? '${driver.manager!.name} · ${driver.phoneNumber}'
                : '${'Fleet Manager'.tr} · ${driver.phoneNumber}';

            return Scaffold(
              backgroundColor: const Color(0xFFF7F9FC),
              // Top Nav updated like other pages (Dark Navy #101C2C with white back button & title)
              appBar: AppBar(
                backgroundColor: primaryDark,
                elevation: 0,
                centerTitle: false,
                titleSpacing: 0,
                leading: IconButton(
                  icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
                  onPressed: () => MainNavigationScreen.selectedTabNotifier.value = 2,
                ),
                title: Text(
                  'Profile'.tr,
                  style: GoogleFonts.poppins(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
                actions: const [],
              ),
          body: SafeArea(
            child: RefreshIndicator(
              onRefresh: () async {
                ApiService.clearApiCache();
                await Future.any([
                  auth.refreshProfile(),
                  Future.delayed(const Duration(milliseconds: 500)),
                ]);
              },
              color: orangePrimary,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1. TOP PROFILE HERO CARD
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20.0),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24.0),
                        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.0),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.03),
                            blurRadius: 14,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Avatar, Name, Phone & Edit Button Row
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              // Avatar Squircle (Warm Pastel Orange Background with Orange Accent)
                              Container(
                                width: 56,
                                height: 56,
                                decoration: BoxDecoration(
                                  color: orangeLightBg,
                                  borderRadius: BorderRadius.circular(18),
                                  border: Border.all(color: orangeBorder, width: 1.2),
                                ),
                                clipBehavior: Clip.antiAlias,
                                child: ValueListenableBuilder<String>(
                                  valueListenable: ProfileState.profilePhotoUrlNotifier,
                                  builder: (context, photoUrl, _) {
                                    final activeUrl = photoUrl.isNotEmpty ? photoUrl : driver.profileImage;
                                    if (activeUrl.isNotEmpty) {
                                      return Image.network(
                                        activeUrl,
                                        fit: BoxFit.cover,
                                        errorBuilder: (context, error, stackTrace) => Center(
                                          child: Text(
                                            initialLetter,
                                            style: GoogleFonts.poppins(
                                              fontSize: 24,
                                              fontWeight: FontWeight.bold,
                                              color: orangePrimary,
                                            ),
                                          ),
                                        ),
                                      );
                                    }
                                    return Center(
                                      child: Text(
                                        initialLetter,
                                        style: GoogleFonts.poppins(
                                          fontSize: 24,
                                          fontWeight: FontWeight.bold,
                                          color: orangePrimary,
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              ),
                              const SizedBox(width: 14),
                              // Name & Phone
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Flexible(
                                          child: Text(
                                            driver.fullName,
                                            style: GoogleFonts.poppins(
                                              fontSize: 18,
                                              fontWeight: FontWeight.w700,
                                              color: navyIcon,
                                            ),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        // Green Online / Active Status Dot
                                        Container(
                                          width: 8,
                                          height: 8,
                                          decoration: const BoxDecoration(
                                            color: Color(0xFF10B981),
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      driver.phoneNumber,
                                      style: GoogleFonts.nunito(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: const Color(0xFF64748B),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              // Edit Profile Pill Button
                              OutlinedButton.icon(
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (context) => const EditProfileScreen()),
                                  );
                                },
                                icon: const Icon(Icons.edit_outlined, size: 14, color: navyIcon),
                                label: Text(
                                  'Edit Profile'.tr,
                                  style: GoogleFonts.poppins(
                                    fontSize: 12.5,
                                    fontWeight: FontWeight.w600,
                                    color: navyIcon,
                                  ),
                                ),
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: Color(0xFFCBD5E1), width: 1.2),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  backgroundColor: Colors.white,
                                  elevation: 0,
                                ),
                              ),
                            ],
                          ),

                          // Personal Information & Member since Row
                          Padding(
                            padding: const EdgeInsets.only(top: 14.0, bottom: 8.0),
                            child: Row(
                              children: [
                                Text(
                                  'Personal Information'.tr,
                                  style: GoogleFonts.poppins(
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w700,
                                    color: const Color(0xFF94A3B8),
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                const Spacer(),
                                Text(
                                  '${'Member since'.tr} $joiningYear',
                                  style: GoogleFonts.poppins(
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w600,
                                    color: const Color(0xFF94A3B8),
                                  ),
                                ),
                              ],
                            ),
                          ),

                          const Divider(color: Color(0xFFF1F5F9), height: 16),

                          // 2x2 Grid with Navy Blue Icons & Warm Orange Tint Containers
                          Row(
                            children: [
                              Expanded(
                                child: _buildInfoCell(
                                  icon: Icons.mail_outline_rounded,
                                  label: 'EMAIL'.tr,
                                  value: driver.email,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _buildInfoCell(
                                  icon: Icons.phone_outlined,
                                  label: 'PHONE'.tr,
                                  value: driver.phoneNumber,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),
                          Row(
                            children: [
                              Expanded(
                                child: _buildInfoCell(
                                  icon: Icons.location_on_outlined,
                                  label: 'CITY'.tr,
                                  value: cityDisplay,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _buildInfoCell(
                                  icon: Icons.person_outline_rounded,
                                  label: 'STATUS'.tr,
                                  value: statusDisplay,
                                ),
                              ),
                            ],
                          ),

                          const Divider(color: Color(0xFFF1F5F9), height: 24),

                          // Emergency Contact Row
                          _buildInfoCell(
                            icon: Icons.shield_outlined,
                            label: 'EMERGENCY CONTACT'.tr,
                            value: emergencyContact,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // 2. DRIVER CREDENTIALS CARD (Retains Driver's License Details, hides my assigned trips & assigned vehicle)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(18.0),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24.0),
                        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.0),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.03),
                            blurRadius: 14,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'DRIVER CREDENTIALS'.tr,
                            style: GoogleFonts.poppins(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF94A3B8),
                              letterSpacing: 0.8,
                            ),
                          ),
                          const SizedBox(height: 14),
                          _buildActionTile(
                            icon: Icons.badge_outlined,
                            title: "Driver's License Details".tr,
                            badge: driver.licenseType.isNotEmpty ? driver.licenseType : 'HMV',
                            onTap: () {
                              _showLicenseDetailsModal(context, driver);
                            },
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // 3. APP SETTINGS & SECURITY CARD (Hides Dark Mode switch)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(18.0),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24.0),
                        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.0),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.03),
                            blurRadius: 14,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'APP SETTINGS & SECURITY'.tr,
                            style: GoogleFonts.poppins(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF94A3B8),
                              letterSpacing: 0.8,
                            ),
                          ),
                          const SizedBox(height: 14),
                          _buildActionTile(
                            icon: Icons.lock_outline_rounded,
                            title: 'Account Security'.tr,
                            badge: 'Protected'.tr,
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => const ChangePasswordScreen()),
                              );
                            },
                          ),
                          const Divider(color: Color(0xFFF1F5F9), height: 1),
                          _buildActionTile(
                            icon: Icons.security_rounded,
                            title: 'Two-Factor Authentication'.tr,
                            badge: 'Active'.tr,
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => const TwoFactorAuthScreen()),
                              );
                            },
                          ),
                          const Divider(color: Color(0xFFF1F5F9), height: 1),
                          _buildActionTile(
                            icon: Icons.notifications_none_rounded,
                            title: 'Push Notifications'.tr,
                            badge: 'Enabled'.tr,
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => const NotificationSettingsScreen()),
                              );
                            },
                          ),
                          const Divider(color: Color(0xFFF1F5F9), height: 1),
                          Builder(
                            builder: (context) {
                              final activeLanguage = normalizeLanguage(
                                driver.language.isNotEmpty ? driver.language : _selectedLanguage,
                              );
                              return _buildActionTile(
                                icon: Icons.language_rounded,
                                title: 'App Language'.tr,
                                badge: activeLanguage,
                                onTap: () {
                                  _showLanguageSelector(context, activeLanguage);
                                },
                              );
                            },
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // 4. HELP & ACCOUNT ACTIONS CARD
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(18.0),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24.0),
                        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.0),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.03),
                            blurRadius: 14,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'HELP & ACCOUNT'.tr,
                            style: GoogleFonts.poppins(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF94A3B8),
                              letterSpacing: 0.8,
                            ),
                          ),
                          const SizedBox(height: 14),
                          _buildActionTile(
                            icon: Icons.headset_mic_outlined,
                            title: 'Help & Support'.tr,
                            badge: '24/7 Live'.tr,
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => const HelpSupportScreen()),
                              );
                            },
                          ),
                          const Divider(color: Color(0xFFF1F5F9), height: 1),
                          _buildActionTile(
                            icon: Icons.policy_outlined,
                            title: 'Privacy Policy & Terms'.tr,
                            onTap: () {
                              LegalModal.showPrivacy(context);
                            },
                          ),
                          const Divider(color: Color(0xFFF1F5F9), height: 1),
                          _buildActionTile(
                            icon: Icons.delete_outline_rounded,
                            title: 'Delete Account'.tr,
                            iconColor: const Color(0xFFEF4444),
                            iconBgColor: const Color(0xFFFEE2E2),
                            titleColor: const Color(0xFFEF4444),
                            onTap: () {
                              _showDeleteAccountDialog(context);
                            },
                          ),
                          const Divider(color: Color(0xFFF1F5F9), height: 1),
                          _buildActionTile(
                            icon: Icons.logout_rounded,
                            title: 'Logout'.tr,
                            iconColor: const Color(0xFFEF4444),
                            iconBgColor: const Color(0xFFFEE2E2),
                            titleColor: const Color(0xFFEF4444),
                            onTap: () {
                              _showLogoutDialog(context);
                            },
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
      },
    );
  }

  Widget _buildInfoCell({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: orangeLightBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: orangeBorder, width: 1.0),
          ),
          child: Icon(icon, color: navyIcon, size: 19),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: GoogleFonts.poppins(
                  fontSize: 10.5,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF94A3B8),
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: GoogleFonts.poppins(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: navyIcon,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildActionTile({
    required IconData icon,
    required String title,
    String? badge,
    Color? iconColor,
    Color? iconBgColor,
    Color? titleColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12.0),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: iconBgColor ?? orangeLightBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: iconBgColor != null ? Colors.transparent : orangeBorder,
                  width: 1.0,
                ),
              ),
              child: Icon(
                icon,
                color: iconColor ?? navyIcon,
                size: 20,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                title,
                style: GoogleFonts.poppins(
                  fontSize: 14.5,
                  fontWeight: FontWeight.w600,
                  color: titleColor ?? navyIcon,
                ),
              ),
            ),
            if (badge != null) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: orangeLightBg,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: orangeBorder, width: 1.0),
                ),
                child: Text(
                  badge,
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: orangePrimary,
                  ),
                ),
              ),
              const SizedBox(width: 8),
            ],
            const Icon(
              Icons.chevron_right_rounded,
              color: Color(0xFF94A3B8),
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}

class ProfileState {
  static final ValueNotifier<String> profilePhotoUrlNotifier = ValueNotifier<String>('');
}
