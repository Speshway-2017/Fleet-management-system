import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../widgets/custom_app_bar.dart';
import '../../providers/auth_provider.dart';

class NotificationSettingsScreen extends StatefulWidget {
  const NotificationSettingsScreen({super.key});

  @override
  State<NotificationSettingsScreen> createState() => _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState extends State<NotificationSettingsScreen> {
  // Preference switches
  bool _routeChanges = true;
  bool _trafficWarnings = true;
  bool _healthAlertes = true;
  bool _fuelWarnings = true;
  bool _emergencyAlerts = true;
  bool _tripUpdates = true;
  bool _sound = true;
  bool _vibration = true;
  bool _pushNotifications = true;
  bool _emailNotifications = false;
  bool _smsNotifications = true;

  @override
  void initState() {
    super.initState();
    final driver = Provider.of<AuthProvider>(context, listen: false).driver;
    if (driver != null) {
      _routeChanges = driver.routeChanges;
      _trafficWarnings = driver.trafficWarnings;
      _healthAlertes = driver.healthAlertes;
      _fuelWarnings = driver.fuelWarnings;
      _emergencyAlerts = driver.emergencyAlerts;
      _tripUpdates = driver.tripUpdates;
      _sound = driver.sound;
      _vibration = driver.vibration;
      _pushNotifications = driver.pushNotifications;
      _emailNotifications = driver.emailNotifications;
      _smsNotifications = driver.smsNotifications;
    } else {
      _routeChanges = NotificationSettingsState.routeChanges;
      _trafficWarnings = NotificationSettingsState.trafficWarnings;
      _healthAlertes = NotificationSettingsState.healthAlertes;
      _fuelWarnings = NotificationSettingsState.fuelWarnings;
      _emergencyAlerts = NotificationSettingsState.emergencyAlerts;
      _tripUpdates = NotificationSettingsState.tripUpdates;
      _sound = NotificationSettingsState.sound;
      _vibration = NotificationSettingsState.vibration;
      _pushNotifications = NotificationSettingsState.pushNotifications;
      _emailNotifications = NotificationSettingsState.emailNotifications;
      _smsNotifications = NotificationSettingsState.smsNotifications;
    }
  }

  Future<void> _saveChanges() async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return const Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.secondary),
          ),
        );
      },
    );

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final success = await auth.updateProfile({
      'notificationPreferences': {
        'routeChanges': _routeChanges,
        'trafficWarnings': _trafficWarnings,
        'healthAlertes': _healthAlertes,
        'fuelWarnings': _fuelWarnings,
        'emergencyAlerts': _emergencyAlerts,
        'tripUpdates': _tripUpdates,
        'sound': _sound,
        'vibration': _vibration,
        'pushNotifications': _pushNotifications,
        'emailNotifications': _emailNotifications,
        'smsNotifications': _smsNotifications,
      }
    });

    if (mounted) {
      Navigator.pop(context); // Pop loader
    }

    if (success) {
      NotificationSettingsState.routeChanges = _routeChanges;
      NotificationSettingsState.trafficWarnings = _trafficWarnings;
      NotificationSettingsState.healthAlertes = _healthAlertes;
      NotificationSettingsState.fuelWarnings = _fuelWarnings;
      NotificationSettingsState.emergencyAlerts = _emergencyAlerts;
      NotificationSettingsState.tripUpdates = _tripUpdates;
      NotificationSettingsState.sound = _sound;
      NotificationSettingsState.vibration = _vibration;
      NotificationSettingsState.pushNotifications = _pushNotifications;
      NotificationSettingsState.emailNotifications = _emailNotifications;
      NotificationSettingsState.smsNotifications = _smsNotifications;

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Notification preferences saved successfully!'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
          ),
        );
        Navigator.pop(context); // Return to settings screen
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(auth.errorMessage ?? 'Failed to save changes'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> _resetToDefault() async {
    setState(() {
      _routeChanges = true;
      _trafficWarnings = true;
      _healthAlertes = true;
      _fuelWarnings = true;
      _emergencyAlerts = true;
      _tripUpdates = true;
      _sound = true;
      _vibration = true;
      _pushNotifications = true;
      _emailNotifications = false;
      _smsNotifications = true;
    });

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return const Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.secondary),
          ),
        );
      },
    );

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final success = await auth.updateProfile({
      'notificationPreferences': {
        'routeChanges': true,
        'trafficWarnings': true,
        'healthAlertes': true,
        'fuelWarnings': true,
        'emergencyAlerts': true,
        'tripUpdates': true,
        'sound': true,
        'vibration': true,
        'pushNotifications': true,
        'emailNotifications': false,
        'smsNotifications': true,
      }
    });

    if (mounted) {
      Navigator.pop(context); // Pop loader
    }

    if (success) {
      NotificationSettingsState.routeChanges = true;
      NotificationSettingsState.trafficWarnings = true;
      NotificationSettingsState.healthAlertes = true;
      NotificationSettingsState.fuelWarnings = true;
      NotificationSettingsState.emergencyAlerts = true;
      NotificationSettingsState.tripUpdates = true;
      NotificationSettingsState.sound = true;
      NotificationSettingsState.vibration = true;
      NotificationSettingsState.pushNotifications = true;
      NotificationSettingsState.emailNotifications = false;
      NotificationSettingsState.smsNotifications = true;

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Notification preferences reset to default.'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(auth.errorMessage ?? 'Failed to reset preferences'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
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
          'Notifications',
          style: GoogleFonts.poppins(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_outlined, color: Colors.white),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('No new system alerts.'),
                  backgroundColor: AppColors.primary,
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
          ),
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
              // PREFERENCES Header Banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 24.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12.0),
                  border: Border.all(color: AppColors.divider, width: 1.0),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.tune_rounded,
                      size: 28,
                      color: AppColors.secondary,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'PREFERENCES',
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                        letterSpacing: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // Route Alerts Section
              _buildSectionTitle('Route Alerts'),
              const SizedBox(height: 12),
              _buildSwitchCard(
                title: 'Route Changes',
                subtitle: 'Immediate notifications about updates',
                icon: Icons.alt_route_rounded,
                iconColor: AppColors.secondary,
                bgColor: AppColors.secondary.withValues(alpha: 0.1),
                value: _routeChanges,
                onChanged: (val) => setState(() => _routeChanges = val),
              ),
              const SizedBox(height: 12),
              _buildSwitchCard(
                title: 'Traffic Warnings',
                subtitle: 'Real-time alerts for heavy congestion',
                icon: Icons.traffic_rounded,
                iconColor: Colors.blue,
                bgColor: Colors.blue.withValues(alpha: 0.1),
                value: _trafficWarnings,
                onChanged: (val) => setState(() => _trafficWarnings = val),
              ),
              const SizedBox(height: 24),

              // Vehicle Maintenance Section
              _buildSectionTitle('Vehicle Maintenance'),
              const SizedBox(height: 12),
              _buildSwitchCard(
                title: 'Health Alerts',
                subtitle: 'Updates on engine and system health',
                icon: Icons.handyman_rounded,
                iconColor: AppColors.error,
                bgColor: AppColors.error.withValues(alpha: 0.1),
                value: _healthAlertes,
                onChanged: (val) => setState(() => _healthAlertes = val),
              ),
              const SizedBox(height: 12),
              _buildSwitchCard(
                title: 'Fuel Level Warnings',
                subtitle: 'Notify when tank is below 15%',
                icon: Icons.local_gas_station_rounded,
                iconColor: Colors.blue,
                bgColor: Colors.blue.withValues(alpha: 0.1),
                value: _fuelWarnings,
                onChanged: (val) => setState(() => _fuelWarnings = val),
              ),
              const SizedBox(height: 24),

              // Safety & Performance Section
              _buildSectionTitle('Safety & Performance'),
              const SizedBox(height: 12),
              _buildSwitchCard(
                title: 'Emergency Alerts',
                subtitle: 'Critical updates during emergency events',
                icon: Icons.error_outline_rounded,
                iconColor: AppColors.error,
                bgColor: AppColors.error.withValues(alpha: 0.1),
                value: _emergencyAlerts,
                onChanged: (val) => setState(() => _emergencyAlerts = val),
              ),
              const SizedBox(height: 12),
              _buildSwitchCard(
                title: 'Trip Updates',
                subtitle: 'Updates on trip assignments and schedules',
                icon: Icons.assignment_turned_in_outlined,
                iconColor: AppColors.success,
                bgColor: AppColors.success.withValues(alpha: 0.1),
                value: _tripUpdates,
                onChanged: (val) => setState(() => _tripUpdates = val),
              ),
              const SizedBox(height: 24),

              // System Preferences Section
              _buildSectionTitle('System Preferences'),
              const SizedBox(height: 12),
              _buildSwitchCard(
                title: 'Sound',
                subtitle: 'Play sound for incoming notifications',
                icon: Icons.volume_up_rounded,
                iconColor: Colors.teal,
                bgColor: Colors.teal.withValues(alpha: 0.1),
                value: _sound,
                onChanged: (val) => setState(() => _sound = val),
              ),
              const SizedBox(height: 12),
              _buildSwitchCard(
                title: 'Vibration',
                subtitle: 'Vibrate device for incoming alerts',
                icon: Icons.vibration_rounded,
                iconColor: AppColors.secondary,
                bgColor: AppColors.secondary.withValues(alpha: 0.1),
                value: _vibration,
                onChanged: (val) => setState(() => _vibration = val),
              ),
              const SizedBox(height: 24),

              // Notification Channels Section
              _buildSectionTitle('Notification Channels'),
              const SizedBox(height: 12),
              _buildSwitchCard(
                title: 'Push Notifications',
                subtitle: 'Receive notifications on your device',
                icon: Icons.notifications_active_outlined,
                iconColor: Colors.indigo,
                bgColor: Colors.indigo.withValues(alpha: 0.1),
                value: _pushNotifications,
                onChanged: (val) => setState(() => _pushNotifications = val),
              ),
              const SizedBox(height: 12),
              _buildSwitchCard(
                title: 'Email Notifications',
                subtitle: 'Receive notification emails at your address',
                icon: Icons.email_outlined,
                iconColor: Colors.blue,
                bgColor: Colors.blue.withValues(alpha: 0.1),
                value: _emailNotifications,
                onChanged: (val) => setState(() => _emailNotifications = val),
              ),
              const SizedBox(height: 12),
              _buildSwitchCard(
                title: 'SMS Notifications',
                subtitle: 'Receive notification text messages on your phone',
                icon: Icons.sms_outlined,
                iconColor: AppColors.success,
                bgColor: AppColors.success.withValues(alpha: 0.1),
                value: _smsNotifications,
                onChanged: (val) => setState(() => _smsNotifications = val),
              ),
              const SizedBox(height: 36),

              // Action Buttons
              ElevatedButton(
                onPressed: _saveChanges,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.secondary,
                  minimumSize: const Size(double.infinity, 54),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.0),
                  ),
                  elevation: 0,
                ),
                child: Text(
                  'Save Changes',
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(height: 12),

              OutlinedButton(
                onPressed: _resetToDefault,
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 54),
                  side: const BorderSide(color: AppColors.divider, width: 1.5),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.0),
                  ),
                  backgroundColor: Colors.white,
                ),
                child: Text(
                  'Reset to Default',
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: GoogleFonts.poppins(
        fontSize: 16.5,
        fontWeight: FontWeight.bold,
        color: AppColors.textPrimary,
      ),
    );
  }

  Widget _buildSwitchCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color iconColor,
    required Color bgColor,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: AppColors.divider, width: 0.8),
      ),
      child: Row(
        children: [
          // Icon Box
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(10.0),
            ),
            child: Icon(
              icon,
              color: iconColor,
              size: 22,
            ),
          ),
          const SizedBox(width: 14),

          // Title & Subtitle
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.poppins(
                    fontSize: 14.5,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  subtitle,
                  style: GoogleFonts.nunito(
                    fontSize: 12.5,
                    color: AppColors.textSecondary,
                    height: 1.25,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),

          // Switch
          Switch.adaptive(
            value: value,
            activeTrackColor: AppColors.secondary,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }
}

class NotificationSettingsState {
  static bool routeChanges = true;
  static bool trafficWarnings = true;
  static bool healthAlertes = true;
  static bool fuelWarnings = true;
  static bool emergencyAlerts = true;
  static bool tripUpdates = true;
  static bool sound = true;
  static bool vibration = true;
  static bool pushNotifications = true;
  static bool emailNotifications = false;
  static bool smsNotifications = true;
}
