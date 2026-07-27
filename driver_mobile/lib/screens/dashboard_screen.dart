import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_radius.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_card.dart';
import '../widgets/winding_route_icon.dart';
import 'trip_details_screen.dart';
import 'trips_screen.dart';
import 'active_trips_screen.dart';
import 'upcoming_trips_screen.dart';
import 'upcoming_trip_details_screen.dart';
import 'completed_trips_screen.dart';
import 'vehicle_overview_screen.dart';
import 'vehicle_maintenance_screen.dart';
import 'main_navigation_screen.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final double screenWidth = MediaQuery.of(context).size.width;
    final bool isSmallScreen = screenWidth < 375;
    final double cardPadding = isSmallScreen ? 12.0 : 16.0;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        centerTitle: false,
        title: Text(
          'Home',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            color: AppColors.background,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          Container(
            width: 38,
            height: 38,
            margin: const EdgeInsets.only(right: 16.0),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
            padding: const EdgeInsets.all(4.0),
            alignment: Alignment.center,
            child: Image.asset('assets/logo.png', fit: BoxFit.contain),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Greeting Section
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Good Morning, Satya',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primaryText,
                    ),
                  ),
                  AppSpacing.verticalXs,
                  Text(
                    'Thursday, July 24, 2026',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.secondaryText,
                    ),
                  ),
                ],
              ),
              AppSpacing.verticalLg,

              // Assigned Trip Card
              CustomCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'ASSIGNED TRIP',
                          style: Theme.of(context).textTheme.labelMedium
                              ?.copyWith(
                                color: AppColors.secondaryText,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        Theme(
                          data: Theme.of(context).copyWith(
                            elevatedButtonTheme: ElevatedButtonThemeData(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primaryVariant,
                                foregroundColor: AppColors.background,
                                minimumSize: const Size(100, 32),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(
                                    AppRadius.sm,
                                  ),
                                ),
                                textStyle: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                          child: CustomButton(
                            text: 'View Details',
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => const TripDetailsScreen(
                                    tripId: '#TRP-9921',
                                  ),
                                ),
                              );
                            },
                            type: CustomButtonType.elevated,
                            width: 100,
                            height: 32,
                          ),
                        ),
                      ],
                    ),
                    AppSpacing.verticalSm,
                    Text(
                      '#TRP-9921',
                      style: Theme.of(context).textTheme.headlineSmall
                          ?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: AppColors.primaryText,
                          ),
                    ),
                    AppSpacing.verticalSm,
                    Row(
                      children: [
                        const Icon(
                          Icons.local_shipping,
                          color: AppColors.secondary,
                          size: 20,
                        ),
                        AppSpacing.horizontalSm,
                        Text(
                          'Heavy Duty - AX 452',
                          style: Theme.of(context).textTheme.bodyMedium
                              ?.copyWith(
                                color: AppColors.primaryText,
                                fontWeight: FontWeight.w500,
                              ),
                        ),
                        AppSpacing.horizontalSm,
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.success.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(AppRadius.xs),
                          ),
                          child: Text(
                            'ACTIVE',
                            style: Theme.of(context).textTheme.labelSmall
                                ?.copyWith(
                                  color: AppColors.success,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 10,
                                ),
                          ),
                        ),
                      ],
                    ),
                    AppSpacing.verticalLg,

                    // Journey Timeline Path
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Column(
                          children: [
                            Container(
                              width: 18,
                              height: 18,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: AppColors.info,
                                  width: 2,
                                ),
                                color: AppColors.background,
                              ),
                              child: Center(
                                child: Container(
                                  width: 8,
                                  height: 8,
                                  decoration: const BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: AppColors.info,
                                  ),
                                ),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                vertical: 2.0,
                              ),
                              child: Column(
                                children: List.generate(
                                  4,
                                  (index) => Container(
                                    width: 2,
                                    height: 4,
                                    margin: const EdgeInsets.symmetric(
                                      vertical: 2.0,
                                    ),
                                    color: AppColors.divider,
                                  ),
                                ),
                              ),
                            ),
                            const Icon(
                              Icons.location_on,
                              color: AppColors.error,
                              size: 18,
                            ),
                          ],
                        ),
                        AppSpacing.horizontalMd,
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'PICKUP',
                                    style: Theme.of(context)
                                        .textTheme
                                        .labelSmall
                                        ?.copyWith(
                                          color: AppColors.secondaryText,
                                          fontWeight: FontWeight.bold,
                                        ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'Port of Long Beach, CA',
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.copyWith(
                                          color: AppColors.primaryText,
                                          fontWeight: FontWeight.bold,
                                        ),
                                  ),
                                ],
                              ),
                              AppSpacing.verticalLg,
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'DESTINATION',
                                    style: Theme.of(context)
                                        .textTheme
                                        .labelSmall
                                        ?.copyWith(
                                          color: AppColors.secondaryText,
                                          fontWeight: FontWeight.bold,
                                        ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'Distribution Center A-12, AZ',
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.copyWith(
                                          color: AppColors.primaryText,
                                          fontWeight: FontWeight.bold,
                                        ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              AppSpacing.verticalMd,

              // Middle Grid: Stats Card & Active Trip Card
              IntrinsicHeight(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Stats Card
                    Expanded(
                      child: CustomCard(
                        color: const Color(0xFF0D1C2E),
                        borderRadius: 18.0,
                        borderSide: BorderSide.none,
                        padding: EdgeInsets.all(cardPadding),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const WindingRouteIcon(size: 28),
                            SizedBox(height: isSmallScreen ? 12.0 : 16.0),
                            _buildStatRow(
                              context,
                              'ACTIVE',
                              '01',
                              isBold: false,
                              isSmallScreen: isSmallScreen,
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) =>
                                        const ActiveTripsScreen(),
                                  ),
                                );
                              },
                            ),
                            _buildStatRow(
                              context,
                              'UPCOMING',
                              '04',
                              isBold: false,
                              isSmallScreen: isSmallScreen,
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) =>
                                        const UpcomingTripsScreen(),
                                  ),
                                );
                              },
                            ),
                            _buildStatRow(
                              context,
                              'COMPLETED',
                              '128',
                              isBold: true,
                              isSmallScreen: isSmallScreen,
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) =>
                                        const CompletedTripsScreen(),
                                  ),
                                );
                              },
                            ),
                            const Spacer(),
                            const SizedBox(height: 12.0),
                            Theme(
                              data: Theme.of(context).copyWith(
                                elevatedButtonTheme: ElevatedButtonThemeData(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.secondary,
                                    foregroundColor: AppColors.background,
                                    minimumSize: Size.fromHeight(isSmallScreen ? 38 : 44),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12.0),
                                    ),
                                    elevation: 0,
                                    textStyle: TextStyle(
                                      fontSize: isSmallScreen ? 13 : 15,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                              child: CustomButton(
                                text: 'View Trips',
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => const TripsScreen(),
                                    ),
                                  );
                                },
                                type: CustomButtonType.elevated,
                                height: isSmallScreen ? 38 : 44,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    AppSpacing.horizontalMd,

                    // Active Trip Progress Card
                    Expanded(
                      child: GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const ActiveTripsScreen(),
                            ),
                          );
                        },
                        behavior: HitTestBehavior.opaque,
                        child: CustomCard(
                          color: const Color(0xFFF7F9FC),
                          borderRadius: 18.0,
                          borderSide: const BorderSide(
                            color: Color(0xFFE4E8EF),
                            width: 1.5,
                          ),
                          padding: EdgeInsets.all(cardPadding),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      'Active Trip',
                                      overflow: TextOverflow.ellipsis,
                                      maxLines: 1,
                                      style: TextStyle(
                                        color: AppColors.secondaryText,
                                        fontWeight: FontWeight.w500,
                                        fontSize: isSmallScreen ? 13.0 : 15.0,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Icon(
                                    Icons.gps_fixed,
                                    color: AppColors.secondary,
                                    size: isSmallScreen ? 18.0 : 22.0,
                                  ),
                                ],
                              ),
                              SizedBox(height: isSmallScreen ? 12.0 : 16.0),
                              Text(
                                '#TRP-9921',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primaryText,
                                  fontSize: isSmallScreen ? 18.0 : 22.0,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'ETA: 14:30 PM',
                                style: TextStyle(
                                  color: AppColors.secondaryText,
                                  fontSize: isSmallScreen ? 11.0 : 13.0,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const Spacer(),
                              const SizedBox(height: 12.0),
                              Row(
                                children: [
                                  Expanded(
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(
                                        AppRadius.round,
                                      ),
                                      child: LinearProgressIndicator(
                                        value: 0.65,
                                        minHeight: isSmallScreen ? 6.0 : 8.0,
                                        backgroundColor: const Color(0xFFEBF0F6),
                                        valueColor:
                                            const AlwaysStoppedAnimation<Color>(
                                              AppColors.secondary,
                                            ),
                                      ),
                                    ),
                                  ),
                                  SizedBox(width: isSmallScreen ? 8.0 : 12.0),
                                  Text(
                                    '65%',
                                    style: TextStyle(
                                      color: AppColors.primaryText,
                                      fontWeight: FontWeight.bold,
                                      fontSize: isSmallScreen ? 13.0 : 15.0,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              AppSpacing.verticalLg,

              // Quick Actions Section
              Text(
                'Quick Actions',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryText,
                ),
              ),
              AppSpacing.verticalMd,
              Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: _buildActionItem(
                          context,
                          Icons.local_shipping_outlined,
                          'Vehicle',
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) =>
                                    const VehicleOverviewScreen(),
                              ),
                            );
                          },
                        ),
                      ),
                      AppSpacing.horizontalMd,
                      Expanded(
                        child: _buildActionItem(
                          context,
                          Icons.local_gas_station_outlined,
                          'Fuel',
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Fuel logs coming soon'),
                              ),
                            );
                          },
                        ),
                      ),
                      AppSpacing.horizontalMd,
                      Expanded(
                        child: _buildActionItem(
                          context,
                          Icons.warning_amber_rounded,
                          'Issue',
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Issue reporting coming soon'),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                  AppSpacing.verticalMd,
                  Row(
                    children: [
                      Expanded(
                        child: _buildActionItem(
                          context,
                          Icons.calendar_month_outlined,
                          'Schedule',
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) =>
                                    const UpcomingTripsScreen(),
                              ),
                            );
                          },
                        ),
                      ),
                      AppSpacing.horizontalMd,
                      Expanded(
                        child: _buildActionItem(
                          context,
                          Icons.settings_outlined,
                          'Settings',
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Settings coming soon'),
                              ),
                            );
                          },
                        ),
                      ),
                      AppSpacing.horizontalMd,
                      Expanded(
                        child: _buildActionItem(
                          context,
                          Icons.local_shipping,
                          'Trips',
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const TripsScreen(),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              AppSpacing.verticalLg,

              // Today's Schedule Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "Today's Schedule",
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primaryText,
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const UpcomingTripsScreen(),
                        ),
                      );
                    },
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.secondary,
                      padding: EdgeInsets.zero,
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: const Text('View'),
                  ),
                ],
              ),
              AppSpacing.verticalMd,
              CustomCard(
                child: Column(
                  children: [
                    _buildScheduleItem(
                      context,
                      time: '08:00 AM',
                      title: 'Warehouse Pickup',
                      location: 'Industrial Area, Hub 7',
                      isActive: true,
                      isLast: false,
                    ),
                    _buildScheduleItem(
                      context,
                      time: '09:30 AM',
                      title: 'Cargo Loading',
                      location: 'Dock C, Section 22',
                      isActive: false,
                      isLast: false,
                    ),
                    _buildScheduleItem(
                      context,
                      time: '11:00 AM',
                      title: 'Main Delivery',
                      location: 'Logistics Center North',
                      isActive: false,
                      isLast: true,
                    ),
                  ],
                ),
              ),
              AppSpacing.verticalLg,

              // Recent Notifications Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Recent Notifications',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primaryText,
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      MainNavigationScreen.selectedTabNotifier.value = 3;
                    },
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.secondary,
                      padding: EdgeInsets.zero,
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: const Text('View All'),
                  ),
                ],
              ),
              AppSpacing.verticalMd,
              _buildNotificationCard(
                context,
                icon: Icons.assignment_turned_in_outlined,
                iconBgColor: AppColors.secondary.withValues(alpha: 0.1),
                iconColor: AppColors.secondary,
                title: 'New Trip Assigned',
                subtext: 'Scheduled for Oct 24, 06:00 AM',
                time: '2m ago',
                isUnread: true,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) =>
                          const UpcomingTripDetailsScreen(tripId: '#TRP-8840'),
                    ),
                  );
                },
              ),
              _buildNotificationCard(
                context,
                icon: Icons.build_outlined,
                iconBgColor: AppColors.divider.withValues(alpha: 0.5),
                iconColor: AppColors.secondaryText,
                title: 'Maintenance Reminder',
                subtext: 'Next engine check due in 3 days',
                time: '1h ago',
                isUnread: false,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) =>
                          const VehicleMaintenanceScreen(),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatRow(
    BuildContext context,
    String label,
    String value, {
    required bool isBold,
    required bool isSmallScreen,
    VoidCallback? onTap,
  }) {
    final double labelFontSize = isSmallScreen ? 10.0 : 12.0;
    final double valueFontSize = isSmallScreen ? 12.0 : 14.0;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.xs),
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: isSmallScreen ? 4.0 : 6.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  color: isBold ? Colors.white : Colors.white.withValues(alpha: 0.6),
                  fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
                  fontSize: labelFontSize,
                  letterSpacing: 0.5,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              value,
              style: TextStyle(
                color: isBold ? Colors.white : Colors.white.withValues(alpha: 0.6),
                fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
                fontSize: valueFontSize,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionItem(
    BuildContext context,
    IconData icon,
    String label, {
    VoidCallback? onTap,
  }) {
    return Ink(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.divider),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16.0),
          child: Column(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.secondary.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: AppColors.secondary, size: 24),
              ),
              AppSpacing.verticalSm,
              Text(
                label,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppColors.primaryText,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildScheduleItem(
    BuildContext context, {
    required String time,
    required String title,
    required String location,
    required bool isActive,
    required bool isLast,
  }) {
    return Stack(
      children: [
        if (!isLast)
          Positioned(
            left: 88,
            top: 10,
            bottom: 0,
            child: Container(
              width: 2,
              color: AppColors.divider,
            ),
          ),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Time label
            SizedBox(
              width: 75,
              child: Padding(
                padding: const EdgeInsets.only(top: 2.0),
                child: Text(
                  time,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.secondaryText,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ),
            AppSpacing.horizontalSm,
            // Connector line and indicator node
            Column(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isActive ? AppColors.secondary : AppColors.background,
                    border: Border.all(
                      color: isActive ? AppColors.secondary : AppColors.divider,
                      width: 2,
                    ),
                  ),
                ),
              ],
            ),
            AppSpacing.horizontalMd,
            // Content
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        color: AppColors.primaryText,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      location,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.secondaryText,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildNotificationCard(
    BuildContext context, {
    required IconData icon,
    required Color iconBgColor,
    required Color iconColor,
    required String title,
    required String subtext,
    required String time,
    bool isUnread = false,
    VoidCallback? onTap,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Ink(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: AppColors.divider),
        ),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppRadius.md),
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Icon Container
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: iconBgColor,
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                  child: Icon(icon, color: iconColor, size: 20),
                ),
                AppSpacing.horizontalMd,
                // Text Details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Row(
                              children: [
                                Text(
                                  title,
                                  style: Theme.of(context).textTheme.titleSmall
                                      ?.copyWith(
                                        color: AppColors.primaryText,
                                        fontWeight: FontWeight.bold,
                                      ),
                                ),
                                if (isUnread) ...[
                                  AppSpacing.horizontalSm,
                                  Container(
                                    width: 8,
                                    height: 8,
                                    decoration: const BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: AppColors.secondary,
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                          Text(
                            time,
                            style: Theme.of(context).textTheme.bodySmall
                                ?.copyWith(
                                  color: AppColors.secondaryText,
                                  fontSize: 10,
                                ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        subtext,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.secondaryText,
                          fontSize: 12,
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
  }
}
