import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_radius.dart';
import '../widgets/custom_app_bar.dart';
import 'trip_details_screen.dart';
import 'active_trips_screen.dart';
import 'upcoming_trips_screen.dart';
import 'completed_trips_screen.dart';

class TripsScreen extends StatelessWidget {
  const TripsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        centerTitle: false,
        title: Text(
          'Trips',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            color: AppColors.background,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8.0),
              ),
              padding: const EdgeInsets.all(4.0),
              child: Image.asset(
                'assets/images/logo.png',
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
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16.0, 16.0, 16.0, 8.0),
                child: TextField(
                  decoration: InputDecoration(
                    hintText: 'Search for trips...',
                    hintStyle: const TextStyle(color: AppColors.secondaryText, fontSize: 14),
                    prefixIcon: const Icon(Icons.search, color: AppColors.secondaryText, size: 20),
                    filled: true,
                    fillColor: AppColors.surface,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.secondary, width: 1),
                    ),
                  ),
                ),
              ),
              AppSpacing.verticalSm,

              // Stats Row (screen fit)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: Row(
                  children: [
                    Expanded(
                      child: _buildStatCard(
                        context,
                        label: 'Total Trips',
                        value: '124',
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildStatCard(
                        context,
                        label: 'Active',
                        value: '02',
                        valueColor: AppColors.secondary,
                        showDot: true,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildStatCard(
                        context,
                        label: 'Upcoming',
                        value: '05',
                      ),
                    ),
                  ],
                ),
              ),

              AppSpacing.verticalSm,

              // Trip Categories
              _buildCategoryCard(
                context,
                title: 'Active Trips',
                icon: Icons.sync,
                iconColor: AppColors.secondary,
                iconBgColor: AppColors.secondary.withValues(alpha: 0.15),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const ActiveTripsScreen(),
                    ),
                  );
                },
              ),
              _buildCategoryCard(
                context,
                title: 'Upcoming Trips',
                icon: Icons.access_time_outlined,
                iconColor: AppColors.primaryVariant,
                iconBgColor: AppColors.primaryVariant.withValues(alpha: 0.08),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const UpcomingTripsScreen(),
                    ),
                  );
                },
              ),
              _buildCategoryCard(
                context,
                title: 'Completed Trips',
                icon: Icons.check_circle_outline,
                iconColor: AppColors.primaryVariant,
                iconBgColor: AppColors.primaryVariant.withValues(alpha: 0.08),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const CompletedTripsScreen(),
                    ),
                  );
                },
              ),

              AppSpacing.verticalSm,

              // Recent Trip Title
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: Text(
                  'Recent Trip',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryText,
                  ),
                ),
              ),

              const SizedBox(height: 6),

              // Recent Trip Card
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 12.0),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    border: Border.all(color: AppColors.divider),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Header Row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'TRIP ID',
                                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                  color: AppColors.secondaryText,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.5,
                                  fontSize: 10,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '#TRP-8842',
                                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                  color: AppColors.primaryText,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.secondary.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(AppRadius.round),
                            ),
                            child: Text(
                              'In Transit',
                              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                color: AppColors.secondary,
                                fontWeight: FontWeight.bold,
                                fontSize: 10,
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 12),

                      // Timeline/Route Section
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Column(
                            children: [
                              // Pickup Circle Indicator
                              Container(
                                width: 14,
                                height: 14,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: AppColors.secondary,
                                    width: 2.0,
                                  ),
                                  color: AppColors.background,
                                ),
                              ),
                              // Dashed vertical connector line
                              Padding(
                                padding: const EdgeInsets.symmetric(vertical: 2.0),
                                child: Column(
                                  children: List.generate(
                                    3,
                                    (index) => Container(
                                      width: 1.5,
                                      height: 4,
                                      margin: const EdgeInsets.symmetric(vertical: 2.0),
                                      color: AppColors.divider,
                                    ),
                                  ),
                                ),
                              ),
                              // Destination Pin Indicator
                              const Icon(
                                Icons.location_on,
                                color: AppColors.primaryVariant,
                                size: 16,
                              ),
                            ],
                          ),
                          AppSpacing.horizontalSm,
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                // Pickup Detail
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Pickup',
                                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                        color: AppColors.secondaryText,
                                        fontWeight: FontWeight.w500,
                                        fontSize: 10,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      'Downtown Hub, Gate 4',
                                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                        color: AppColors.primaryText,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                // Destination Detail
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Destination',
                                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                        color: AppColors.secondaryText,
                                        fontWeight: FontWeight.w500,
                                        fontSize: 10,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      'North Port Logistics Center',
                                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
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

                      const SizedBox(height: 12),

                      // View Details button
                      ElevatedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const TripDetailsScreen(
                                tripId: '#TRP-8842',
                              ),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.secondary,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 10.0),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppRadius.sm),
                          ),
                        ),
                        child: const Text(
                          'View Details',
                          style: TextStyle(
                            fontSize: 14.0,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              AppSpacing.verticalLg,
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context, {
    required String label,
    required String value,
    Color? valueColor,
    bool showDot = false,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10.0, vertical: 12.0),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (showDot) ...[
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: AppColors.secondary,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 4),
              ],
              Expanded(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.secondaryText,
                    fontWeight: FontWeight.w500,
                    fontSize: 11,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: valueColor ?? AppColors.primaryText,
              fontWeight: FontWeight.bold,
              fontSize: 22,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryCard(
    BuildContext context, {
    required String title,
    required IconData icon,
    required Color iconColor,
    required Color iconBgColor,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 4.0),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.divider),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppRadius.md),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 10.0),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: iconBgColor,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, color: iconColor, size: 18),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    title,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: AppColors.primaryText,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const Icon(
                  Icons.arrow_forward_ios,
                  color: AppColors.secondaryText,
                  size: 12,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
