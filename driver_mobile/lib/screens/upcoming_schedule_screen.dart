import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_radius.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';
import 'assignment_details_screen.dart';

class UpcomingScheduleScreen extends StatelessWidget {
  const UpcomingScheduleScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        centerTitle: false,
        title: Text(
          'Upcoming Schedule',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Subtitle Tagline
              Text(
                'Your assigned routes for the next 7 days.',
                style: GoogleFonts.nunito(
                  fontSize: 14,
                  color: AppColors.secondaryText,
                ),
              ),
              AppSpacing.verticalMd,

              // Date Range Selector Banner
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(color: AppColors.divider),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.calendar_today_outlined,
                      size: 16,
                      color: AppColors.secondary,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Oct 24 - Oct 30, 2023',
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryText,
                      ),
                    ),
                  ],
                ),
              ),
              AppSpacing.verticalLg,

              // Wednesday Section
              Text(
                'Wednesday, Oct 25',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryText,
                ),
              ),
              AppSpacing.verticalSm,

              // Wednesday Route Card
              CustomCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Route #FL-771',
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppColors.secondaryText,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.divider,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'Morning Shift',
                            style: GoogleFonts.poppins(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryText,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Indianapolis, IN',
                      style: GoogleFonts.poppins(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryText,
                      ),
                    ),
                    AppSpacing.verticalSm,
                    const Divider(color: AppColors.divider, height: 1),
                    AppSpacing.verticalSm,
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Distance',
                                style: GoogleFonts.nunito(
                                  fontSize: 11,
                                  color: AppColors.secondaryText,
                                ),
                              ),
                              Text(
                                '184 mi',
                                style: GoogleFonts.poppins(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primaryText,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Stops',
                                style: GoogleFonts.nunito(
                                  fontSize: 11,
                                  color: AppColors.secondaryText,
                                ),
                              ),
                              Text(
                                '3',
                                style: GoogleFonts.poppins(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primaryText,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    AppSpacing.verticalSm,
                    InkWell(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const AssignmentDetailsScreen(tripId: '#FL-771'),
                          ),
                        );
                      },
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4.0),
                        child: Row(
                          children: [
                            Text(
                              'Assignment Details >',
                              style: GoogleFonts.poppins(
                                fontSize: 13,
                                color: AppColors.secondary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              AppSpacing.verticalSm,

              // Afternoon Placeholder Card
              Container(
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(color: AppColors.divider),
                ),
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.nights_stay_outlined,
                      color: AppColors.secondaryText,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'No Afternoon routes assigned',
                      style: GoogleFonts.nunito(
                        fontSize: 13,
                        color: AppColors.secondaryText,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              AppSpacing.verticalMd,

              // Thursday Section
              Text(
                'Thursday, Oct 26',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryText,
                ),
              ),
              AppSpacing.verticalSm,

              // Thursday Route Card
              CustomCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'St. Louis, MO',
                      style: GoogleFonts.poppins(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryText,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Regional Distribution Route',
                      style: GoogleFonts.nunito(
                        fontSize: 13,
                        color: AppColors.secondaryText,
                      ),
                    ),
                    AppSpacing.verticalSm,
                    const Divider(color: AppColors.divider, height: 1),
                    AppSpacing.verticalSm,
                    Row(
                      children: [
                        Icon(Icons.alt_route_outlined, size: 16, color: AppColors.secondary),
                        const SizedBox(width: 4),
                        Text(
                          '297 mi',
                          style: GoogleFonts.poppins(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primaryText,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Icon(Icons.pin_drop_outlined, size: 16, color: AppColors.secondary),
                        const SizedBox(width: 4),
                        Text(
                          '6 Stops',
                          style: GoogleFonts.poppins(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primaryText,
                          ),
                        ),
                      ],
                    ),
                    AppSpacing.verticalSm,
                    InkWell(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const AssignmentDetailsScreen(tripId: '#SL-297'),
                          ),
                        );
                      },
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4.0),
                        child: Row(
                          children: [
                            Text(
                              'Assignment Details >',
                              style: GoogleFonts.poppins(
                                fontSize: 13,
                                color: AppColors.secondary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              AppSpacing.verticalLg,

              // Weekly Statistics Section (Navy Background)
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF0D1C2E),
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                ),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Total Distance (Week)',
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        color: Colors.white70,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Text(
                          '2,410 mi',
                          style: GoogleFonts.poppins(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '↗ +12% vs last week',
                          style: GoogleFonts.nunito(
                            fontSize: 12,
                            color: AppColors.success,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              AppSpacing.verticalMd,

              // Fuel Efficiency Card
              CustomCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Fuel Efficiency',
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.secondaryText,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '7.2 mpg',
                      style: GoogleFonts.poppins(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryText,
                      ),
                    ),
                    AppSpacing.verticalSm,
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: 0.72,
                        minHeight: 6,
                        backgroundColor: AppColors.divider,
                        valueColor: AlwaysStoppedAnimation<Color>(AppColors.secondary),
                      ),
                    ),
                  ],
                ),
              ),
              AppSpacing.verticalSm,

              // Deliveries Due Card
              CustomCard(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Deliveries Due',
                            style: GoogleFonts.poppins(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: AppColors.secondaryText,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '34',
                            style: GoogleFonts.poppins(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryText,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Visual indicators corresponding to bottom pills
                    Row(
                      children: [
                        Container(
                          width: 24,
                          height: 36,
                          decoration: BoxDecoration(
                            color: AppColors.secondary.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          width: 24,
                          height: 36,
                          decoration: BoxDecoration(
                            color: AppColors.secondary,
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
