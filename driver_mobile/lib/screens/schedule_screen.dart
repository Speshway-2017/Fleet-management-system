import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_radius.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_card.dart';
import 'upcoming_schedule_screen.dart';
import 'trip_details_screen.dart';
import 'todays_schedule_screen.dart';

class ScheduleScreen extends StatelessWidget {
  const ScheduleScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        centerTitle: false,
        title: Text(
          'Schedule Maintenance',
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
              Text(
                'Manage your active shifts and route assignments.',
                style: GoogleFonts.nunito(
                  color: AppColors.secondaryText,
                  fontSize: 14,
                ),
              ),
              AppSpacing.verticalMd,

              // Calendar Card
              CustomCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'October 2023',
                          style: GoogleFonts.poppins(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primaryText,
                          ),
                        ),
                        TextButton.icon(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const TodaysScheduleScreen(),
                              ),
                            );
                          },
                          icon: Icon(
                            Icons.calendar_today_outlined,
                            size: 14,
                            color: AppColors.secondary,
                          ),
                          label: Text(
                            'Go to Today',
                            style: GoogleFonts.poppins(
                              fontSize: 12,
                              color: AppColors.secondary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          style: TextButton.styleFrom(
                            padding: EdgeInsets.zero,
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                        ),
                      ],
                    ),
                    AppSpacing.verticalMd,
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildCalendarDay(context, 'SUN', '22', false, () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const TodaysScheduleScreen(),
                            ),
                          );
                        }),
                        _buildCalendarDay(context, 'MON', '23', false, () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const TodaysScheduleScreen(),
                            ),
                          );
                        }),
                        _buildCalendarDay(context, 'TUE', '24', true, () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const TodaysScheduleScreen(),
                            ),
                          );
                        }),
                        _buildCalendarDay(context, 'WED', '25', false, () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const UpcomingScheduleScreen(),
                            ),
                          );
                        }),
                        _buildCalendarDay(context, 'THU', '26', false, () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const UpcomingScheduleScreen(),
                            ),
                          );
                        }),
                      ],
                    ),
                  ],
                ),
              ),
              AppSpacing.verticalLg,

              // Assigned Trips Section
              Text(
                'Assigned Trips',
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryText,
                ),
              ),
              AppSpacing.verticalMd,

              // Trip 1 (Completed)
              _buildTripCard(
                context,
                status: 'COMPLETED',
                statusColor: AppColors.success,
                tripId: '#TX-9021',
                title: 'Regional Logistics – Dallas Hub',
                departure: '06:00 AM',
                arrival: '02:30 PM',
                miles: '420 mi',
                isCompleted: true,
              ),
              AppSpacing.verticalMd,

              // Trip 2 (Scheduled)
              _buildTripCard(
                context,
                status: 'SCHEDULED',
                statusColor: AppColors.secondaryText,
                tripId: '#TX-9104',
                title: 'Interstate Express – Houston Port',
                departure: '03:45 PM',
                arrival: '09:15 PM',
                miles: '285 mi',
                isCompleted: false,
              ),
              AppSpacing.verticalLg,

              // Day Summary Card
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF0D1C2E),
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                ),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'DAY SUMMARY',
                      style: GoogleFonts.poppins(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.white60,
                        letterSpacing: 1.0,
                      ),
                    ),
                    AppSpacing.verticalMd,
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '8.5',
                                style: GoogleFonts.poppins(
                                  fontSize: 28,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              Text(
                                'Driving Hours',
                                style: GoogleFonts.nunito(
                                  fontSize: 12,
                                  color: Colors.white60,
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
                                '705',
                                style: GoogleFonts.poppins(
                                  fontSize: 28,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              Text(
                                'Total Miles',
                                style: GoogleFonts.nunito(
                                  fontSize: 12,
                                  color: Colors.white60,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    AppSpacing.verticalMd,
                    const Divider(color: Colors.white24, height: 1),
                    AppSpacing.verticalMd,
                    _buildSummaryRow('Fuel Efficiency', '6.2 MPG'),
                    AppSpacing.verticalSm,
                    _buildSummaryRow('Safety Score', '98/100'),
                  ],
                ),
              ),
              AppSpacing.verticalMd,

              // Current Weather Card
              CustomCard(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.primaryText.withValues(alpha: 0.08),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              'LIVAMAQ UX-145',
                              style: GoogleFonts.poppins(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primaryText,
                              ),
                            ),
                          ),
                          AppSpacing.verticalXs,
                          Text(
                            'CURRENT WEATHER',
                            style: GoogleFonts.poppins(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: AppColors.secondaryText,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '74°F Clear Sky',
                            style: GoogleFonts.poppins(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryText,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Icon(
                      Icons.wb_sunny_rounded,
                      color: AppColors.secondary,
                      size: 32,
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

  Widget _buildCalendarDay(BuildContext context, String dayName, String dayNum, bool isSelected, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.md),
      child: isSelected
          ? Container(
              width: 48,
              padding: const EdgeInsets.symmetric(vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.secondary,
                borderRadius: BorderRadius.circular(AppRadius.md),
                border: Border.all(color: AppColors.secondary, width: 1.5),
              ),
              child: Column(
                children: [
                  Text(
                    dayName,
                    style: GoogleFonts.poppins(
                      fontSize: 10,
                      color: Colors.white70,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    dayNum,
                    style: GoogleFonts.poppins(
                      fontSize: 16,
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            )
          : SizedBox(
              width: 48,
              child: Column(
                children: [
                  Text(
                    dayName,
                    style: GoogleFonts.poppins(
                      fontSize: 10,
                      color: AppColors.secondaryText,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    dayNum,
                    style: GoogleFonts.poppins(
                      fontSize: 16,
                      color: AppColors.primaryText,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildTripCard(
    BuildContext context, {
    required String status,
    required Color statusColor,
    required String tripId,
    required String title,
    required String departure,
    required String arrival,
    required String miles,
    required bool isCompleted,
  }) {
    return CustomCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  status,
                  style: GoogleFonts.poppins(
                    color: statusColor,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'Trip ID: $tripId',
                style: GoogleFonts.nunito(
                  color: AppColors.secondaryText,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          AppSpacing.verticalSm,
          Text(
            title,
            style: GoogleFonts.poppins(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryText,
            ),
          ),
          AppSpacing.verticalSm,
          Row(
            children: [
              Expanded(
                child: Row(
                  children: [
                    Icon(Icons.access_time, size: 14, color: AppColors.secondary),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'DEPARTURE',
                            style: GoogleFonts.poppins(
                              fontSize: 8,
                              color: AppColors.secondaryText,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            departure,
                            style: GoogleFonts.poppins(
                              fontSize: 11,
                              color: AppColors.primaryText,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Row(
                  children: [
                    Icon(Icons.flag_outlined, size: 14, color: AppColors.secondary),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'ARRIVAL TIME',
                            style: GoogleFonts.poppins(
                              fontSize: 8,
                              color: AppColors.secondaryText,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            arrival,
                            style: GoogleFonts.poppins(
                              fontSize: 11,
                              color: AppColors.primaryText,
                              fontWeight: FontWeight.bold,
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
          AppSpacing.verticalSm,
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                miles,
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryText,
                ),
              ),
              isCompleted
                  ? ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => TripDetailsScreen(tripId: tripId),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0F2035),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppRadius.sm),
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      ),
                      child: Text(
                        'View Details',
                        style: GoogleFonts.poppins(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    )
                  : OutlinedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => TripDetailsScreen(tripId: tripId),
                          ),
                        );
                      },
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF0F2035)),
                        foregroundColor: const Color(0xFF0F2035),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppRadius.sm),
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      ),
                      child: Text(
                        'View Details',
                        style: GoogleFonts.poppins(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.nunito(
            fontSize: 14,
            color: Colors.white70,
          ),
        ),
        Text(
          value,
          style: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: AppColors.secondary,
          ),
        ),
      ],
    );
  }
}
