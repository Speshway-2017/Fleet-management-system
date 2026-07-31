import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../theme/app_colors.dart';
import '../../widgets/custom_app_bar.dart';
import '../../providers/auth_provider.dart';
import '../auth/login_screen.dart';
import 'edit_profile_screen.dart';
import 'help_support_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<AuthProvider>(context, listen: false).refreshProfile();
    });
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
              onPressed: () async {
                Navigator.pop(dialogContext); // Close dialog
                final auth = Provider.of<AuthProvider>(outerContext, listen: false);
                await auth.logout();
                if (!outerContext.mounted) return;
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

  String _formatDate(String? dateStr, {bool short = false}) {
    if (dateStr == null || dateStr.isEmpty) return 'Not Specified';
    final parsed = DateTime.tryParse(dateStr);
    if (parsed == null) return dateStr;
    
    final months = short 
        ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
    if (parsed.month < 1 || parsed.month > 12) return dateStr;
    return short 
        ? '${months[parsed.month - 1]} ${parsed.day}, ${parsed.year}'
        : '${months[parsed.month - 1]} ${parsed.day}, ${parsed.year}';
  }

  int _calculateYears(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return 4; // default mock fallback
    final parsed = DateTime.tryParse(dateStr);
    if (parsed == null) return 4;
    final now = DateTime.now();
    int years = now.year - parsed.year;
    if (now.month < parsed.month || (now.month == parsed.month && now.day < parsed.day)) {
      years--;
    }
    return years < 0 ? 0 : years;
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'AVAILABLE':
        return AppColors.success;
      case 'ON_TRIP':
        return AppColors.info;
      case 'ASSIGNED':
        return AppColors.warning;
      case 'SUSPENDED':
        return AppColors.error;
      default:
        return AppColors.success;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, child) {
        if (auth.isLoading && auth.driver == null) {
          return const Scaffold(
            backgroundColor: Colors.white,
            body: Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
              ),
            ),
          );
        }

        if (auth.errorMessage != null && auth.driver == null) {
          return Scaffold(
            backgroundColor: Colors.white,
            body: Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.error_outline,
                      color: AppColors.error,
                      size: 48,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      auth.errorMessage!,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => auth.refreshProfile(),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8.0),
                        ),
                      ),
                      child: Text(
                        'Retry',
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
          return const Scaffold(
            backgroundColor: Colors.white,
            body: Center(
              child: Text('No profile data found.'),
            ),
          );
        }

        // Dynamically update profile image notifier
        if (driver.profileImage.isNotEmpty && driver.profileImage != ProfileState.profilePhotoUrlNotifier.value) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            ProfileState.profilePhotoUrlNotifier.value = driver.profileImage;
          });
        }

        final joiningYear = DateTime.tryParse(driver.joiningDate)?.year ?? 2020;
        final milesVal = (driver.tripsCompleted > 0) ? '${(driver.tripsCompleted * 142)}' : '12.4k';

        return Scaffold(
          backgroundColor: Colors.white,
          appBar: CustomAppBar(
            centerTitle: false,
            backgroundColor: AppColors.primary,
            actions: const [],
            title: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
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
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Profile',
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      'Driver',
                      style: GoogleFonts.nunito(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textDisabled,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          body: SafeArea(
            child: RefreshIndicator(
              onRefresh: () => auth.refreshProfile(),
              color: AppColors.primary,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // Profile Photo Card with Green Active Indicator
                    Center(
                      child: Stack(
                        children: [
                          Container(
                            width: 120,
                            height: 120,
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.textPrimary.withAlpha(20),
                                  blurRadius: 16,
                                  offset: const Offset(0, 8),
                                ),
                              ],
                            ),
                            child: ClipOval(
                              child: ValueListenableBuilder<String>(
                                valueListenable: ProfileState.profilePhotoUrlNotifier,
                                builder: (context, photoUrl, child) {
                                  if (photoUrl.isEmpty) {
                                    return const Icon(
                                      Icons.person,
                                      size: 64,
                                      color: AppColors.textDisabled,
                                    );
                                  }
                                  if (photoUrl.startsWith('data:image') && photoUrl.contains('base64,')) {
                                    try {
                                      final base64Content = photoUrl.split('base64,').last;
                                      final bytes = base64Decode(base64Content);
                                      return Image.memory(
                                        bytes,
                                        fit: BoxFit.cover,
                                      );
                                    } catch (_) {}
                                  }
                                  return Image.network(
                                    photoUrl,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) {
                                      return const Icon(
                                        Icons.person,
                                        size: 64,
                                        color: AppColors.textDisabled,
                                      );
                                    },
                                  );
                                },
                              ),
                            ),
                          ),
                          Positioned(
                            bottom: 4,
                            right: 4,
                            child: Container(
                              width: 22,
                              height: 22,
                              decoration: BoxDecoration(
                                color: _getStatusColor(driver.driverStatus),
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: Colors.white,
                                  width: 3.5,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Name & Badge Section
                    Text(
                      driver.fullName,
                      style: GoogleFonts.poppins(
                        fontSize: 26,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.verified,
                          color: AppColors.secondary,
                          size: 18,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          driver.driverStatus.replaceAll('_', ' '),
                          style: GoogleFonts.poppins(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w700,
                            color: AppColors.secondary,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Member since $joiningYear',
                      style: GoogleFonts.nunito(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 28),

                    // Stats Row (Miles, Safety, Years)
                    Row(
                      children: [
                        Expanded(
                          child: _buildStatCard(
                            context,
                            icon: Icons.trending_up_rounded,
                            value: milesVal,
                            label: 'MILES',
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildStatCard(
                            context,
                            icon: Icons.shield_outlined,
                            value: '${driver.performanceScore}%',
                            label: 'SAFETY',
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildStatCard(
                            context,
                            icon: Icons.calendar_month_outlined,
                            value: '${_calculateYears(driver.joiningDate)}',
                            label: 'YEARS',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 28),

                    // Expansion Accordion Sections
                    Theme(
                      data: Theme.of(context).copyWith(
                        dividerColor: Colors.transparent,
                      ),
                      child: Column(
                        children: [
                          // Accordion 1: Personal Information (Expanded by default)
                          _buildAccordionCard(
                            context,
                            title: 'Personal Information',
                            icon: Icons.person_outline_rounded,
                            initiallyExpanded: true,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        _buildInfoField('EMAIL', driver.email),
                                        const SizedBox(height: 16),
                                        _buildInfoField('EMPLOYEE ID', driver.employeeId),
                                        const SizedBox(height: 16),
                                        _buildInfoField('JOINING DATE', _formatDate(driver.joiningDate, short: false)),
                                      ],
                                    ),
                                  ),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        _buildInfoField('PHONE', driver.phoneNumber),
                                        const SizedBox(height: 16),
                                        _buildInfoField('ADDRESS', driver.address.isNotEmpty ? driver.address : 'Not Specified'),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),

                          // Accordion 2: Driver's License Details
                          _buildAccordionCard(
                            context,
                            title: "Driver's License Details",
                            icon: Icons.badge_outlined,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        _buildInfoField('LICENSE NUMBER', driver.licenseNumber),
                                        const SizedBox(height: 16),
                                        _buildInfoField('EXPIRY DATE', _formatDate(driver.licenseExpiry, short: true)),
                                      ],
                                    ),
                                  ),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        _buildInfoField('CLASS', driver.licenseType),
                                        const SizedBox(height: 16),
                                        _buildInfoField('ISSUE STATE', driver.branch.isNotEmpty ? driver.branch : 'Not Specified'),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),

                          // Settings & Actions Card
                          Card(
                            color: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14.0),
                              side: const BorderSide(color: AppColors.divider, width: 1.0),
                            ),
                            margin: EdgeInsets.zero,
                            clipBehavior: Clip.antiAlias,
                            child: Column(
                              children: [
                                _buildCardActionTile(
                                  context,
                                  icon: Icons.edit_outlined,
                                  title: 'Edit Profile',
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => const EditProfileScreen(),
                                      ),
                                    );
                                  },
                                ),
                                const Divider(color: AppColors.divider, height: 1),
                                _buildCardActionTile(
                                  context,
                                  icon: Icons.help_outline,
                                  title: 'Help & Support',
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => const HelpSupportScreen(),
                                      ),
                                    );
                                  },
                                ),
                                const SizedBox(height: 12),
                                Padding(
                                  padding: const EdgeInsets.only(left: 16.0, right: 16.0, bottom: 16.0),
                                  child: OutlinedButton.icon(
                                    onPressed: () => _showLogoutDialog(context),
                                    icon: const Icon(
                                      Icons.logout,
                                      color: AppColors.error,
                                      size: 20,
                                    ),
                                    label: Text(
                                      'Logout',
                                      style: GoogleFonts.poppins(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.error,
                                      ),
                                    ),
                                    style: OutlinedButton.styleFrom(
                                      backgroundColor: Colors.white,
                                      side: const BorderSide(color: AppColors.error, width: 1.5),
                                      minimumSize: const Size(double.infinity, 50),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12.0),
                                      ),
                                      elevation: 0,
                                    ),
                                  ),
                                ),
                              ],
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
    );
  }

  Widget _buildStatCard(
    BuildContext context, {
    required IconData icon,
    required String value,
    required String label,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16.0, horizontal: 8.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: AppColors.divider, width: 1.0),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            color: AppColors.secondary,
            size: 26,
          ),
          const SizedBox(height: 10),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 19,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: GoogleFonts.nunito(
              fontSize: 10,
              fontWeight: FontWeight.w800,
              color: AppColors.textSecondary,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAccordionCard(
    BuildContext context, {
    required String title,
    required IconData icon,
    required List<Widget> children,
    bool initiallyExpanded = false,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14.0),
        border: Border.all(color: AppColors.divider, width: 1.0),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(14.0),
        child: ExpansionTile(
          initiallyExpanded: initiallyExpanded,
          backgroundColor: Colors.white,
          collapsedBackgroundColor: AppColors.surface,
          leading: Icon(
            icon,
            color: AppColors.secondary,
            size: 24,
          ),
          title: Text(
            title,
            style: GoogleFonts.poppins(
              fontSize: 15.5,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          childrenPadding: const EdgeInsets.only(left: 16.0, right: 16.0, bottom: 20.0, top: 8.0),
          children: children,
        ),
      ),
    );
  }

  Widget _buildInfoField(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.nunito(
            fontSize: 9.5,
            fontWeight: FontWeight.w800,
            color: AppColors.textDisabled,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 3),
        Text(
          value,
          style: GoogleFonts.poppins(
            fontSize: 13.5,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildLeadingIcon(IconData icon) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: AppColors.secondary.withAlpha(20), // Peach/Light orange background
        borderRadius: BorderRadius.circular(10.0),
      ),
      child: Icon(
        icon,
        color: AppColors.secondary,
        size: 20,
      ),
    );
  }

  Widget _buildCardActionTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
      leading: _buildLeadingIcon(icon),
      title: Text(
        title,
        style: GoogleFonts.poppins(
          fontSize: 15,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
      ),
      trailing: const Icon(
        Icons.chevron_right_rounded,
        color: AppColors.textDisabled,
        size: 20,
      ),
      onTap: onTap,
    );
  }
}

class ProfileState {
  static final ValueNotifier<String> profilePhotoUrlNotifier = ValueNotifier<String>(
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=300&h=300',
  );
}
