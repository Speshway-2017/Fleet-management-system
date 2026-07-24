import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_radius.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_card.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
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
                            onPressed: () {},
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
                        color: AppColors.primaryVariant,
                        borderSide: BorderSide.none,
                        padding: const EdgeInsets.all(AppSpacing.md),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(
                              Icons.alt_route,
                              color: AppColors.secondary,
                              size: 28,
                            ),
                            AppSpacing.verticalSm,
                            _buildStatRow(context, 'ACTIVE', '01'),
                            const Divider(color: AppColors.primary, height: 12),
                            _buildStatRow(context, 'UPCOMING', '04'),
                            const Divider(color: AppColors.primary, height: 12),
                            _buildStatRow(context, 'COMPLETED', '128'),
                            const Spacer(),
                            AppSpacing.verticalMd,
                            Theme(
                              data: Theme.of(context).copyWith(
                                elevatedButtonTheme: ElevatedButtonThemeData(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.secondary,
                                    foregroundColor: AppColors.background,
                                    minimumSize: const Size.fromHeight(36),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(
                                        AppRadius.sm,
                                      ),
                                    ),
                                    textStyle: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                              child: CustomButton(
                                text: 'View Trips',
                                onPressed: () {},
                                type: CustomButtonType.elevated,
                                height: 36,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    AppSpacing.horizontalMd,

                    // Active Trip Progress Card
                    Expanded(
                      child: CustomCard(
                        padding: const EdgeInsets.all(AppSpacing.md),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Active Trip',
                                  style: Theme.of(context).textTheme.bodyMedium
                                      ?.copyWith(
                                        color: AppColors.secondaryText,
                                        fontWeight: FontWeight.w500,
                                      ),
                                ),
                                const Icon(
                                  Icons.gps_fixed,
                                  color: AppColors.secondary,
                                  size: 18,
                                ),
                              ],
                            ),
                            AppSpacing.verticalMd,
                            Text(
                              '#TRP-9921',
                              style: Theme.of(context).textTheme.titleLarge
                                  ?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.primaryText,
                                  ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'ETA: 14:30 PM',
                              style: Theme.of(context).textTheme.bodySmall
                                  ?.copyWith(color: AppColors.secondaryText),
                            ),
                            const Spacer(),
                            AppSpacing.verticalLg,
                            Row(
                              children: [
                                Expanded(
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(
                                      AppRadius.round,
                                    ),
                                    child: const LinearProgressIndicator(
                                      value: 0.65,
                                      minHeight: 6,
                                      backgroundColor: AppColors.divider,
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                        AppColors.secondary,
                                      ),
                                    ),
                                  ),
                                ),
                                AppSpacing.horizontalSm,
                                Text(
                                  '65%',
                                  style: Theme.of(context).textTheme.bodySmall
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
                        ),
                      ),
                      AppSpacing.horizontalMd,
                      Expanded(
                        child: _buildActionItem(
                          context,
                          Icons.local_gas_station_outlined,
                          'Fuel',
                        ),
                      ),
                      AppSpacing.horizontalMd,
                      Expanded(
                        child: _buildActionItem(
                          context,
                          Icons.warning_amber_rounded,
                          'Issue',
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
                        ),
                      ),
                      AppSpacing.horizontalMd,
                      Expanded(
                        child: _buildActionItem(
                          context,
                          Icons.settings_outlined,
                          'Settings',
                        ),
                      ),
                      AppSpacing.horizontalMd,
                      Expanded(
                        child: _buildActionItem(
                          context,
                          Icons.local_shipping,
                          'Trips',
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
                    onPressed: () {},
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
                    onPressed: () {},
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
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatRow(BuildContext context, String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
            color: AppColors.disabledText,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          value,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: AppColors.background,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildActionItem(BuildContext context, IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16.0),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.divider),
      ),
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
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
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
              if (!isLast)
                Expanded(child: Container(width: 2, color: AppColors.divider)),
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
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.divider),
      ),
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
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
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
    );
  }
}
