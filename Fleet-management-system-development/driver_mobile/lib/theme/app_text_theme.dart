import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class AppTextTheme {
  AppTextTheme._();

  static TextTheme get lightTextTheme {
    return const TextTheme(
      // Display Styles - for large, prominent text on landing screens, etc.
      displayLarge: TextStyle(
        fontSize: 57.0,
        fontWeight: FontWeight.w400,
        color: AppColors.primaryText,
        letterSpacing: -0.25,
      ),
      displayMedium: TextStyle(
        fontSize: 45.0,
        fontWeight: FontWeight.w400,
        color: AppColors.primaryText,
        letterSpacing: 0.0,
      ),
      displaySmall: TextStyle(
        fontSize: 36.0,
        fontWeight: FontWeight.w400,
        color: AppColors.primaryText,
        letterSpacing: 0.0,
      ),

      // Headline Styles - for screen titles, headings
      headlineLarge: TextStyle(
        fontSize: 32.0,
        fontWeight: FontWeight.w600,
        color: AppColors.primaryText,
        letterSpacing: 0.0,
      ),
      headlineMedium: TextStyle(
        fontSize: 28.0,
        fontWeight: FontWeight.w600,
        color: AppColors.primaryText,
        letterSpacing: 0.0,
      ),
      headlineSmall: TextStyle(
        fontSize: 24.0,
        fontWeight: FontWeight.w600,
        color: AppColors.primaryText,
        letterSpacing: 0.0,
      ),

      // Title Styles - for headers in cards, lists, sub-sections
      titleLarge: TextStyle(
        fontSize: 22.0,
        fontWeight: FontWeight.w500,
        color: AppColors.primaryText,
        letterSpacing: 0.0,
      ),
      titleMedium: TextStyle(
        fontSize: 16.0,
        fontWeight: FontWeight.w500,
        color: AppColors.primaryText,
        letterSpacing: 0.15,
      ),
      titleSmall: TextStyle(
        fontSize: 14.0,
        fontWeight: FontWeight.w500,
        color: AppColors.primaryText,
        letterSpacing: 0.1,
      ),

      // Body Styles - for main content, readability
      bodyLarge: TextStyle(
        fontSize: 16.0,
        fontWeight: FontWeight.w400,
        color: AppColors.primaryText,
        letterSpacing: 0.5,
      ),
      bodyMedium: TextStyle(
        fontSize: 14.0,
        fontWeight: FontWeight.w400,
        color: AppColors.primaryText,
        letterSpacing: 0.25,
      ),
      bodySmall: TextStyle(
        fontSize: 12.0,
        fontWeight: FontWeight.w400,
        color: AppColors.secondaryText,
        letterSpacing: 0.4,
      ),

      // Label Styles - for buttons, captions, form headers
      labelLarge: TextStyle(
        fontSize: 14.0,
        fontWeight: FontWeight.w500,
        color: AppColors.primaryText,
        letterSpacing: 0.1,
      ),
      labelMedium: TextStyle(
        fontSize: 12.0,
        fontWeight: FontWeight.w500,
        color: AppColors.secondaryText,
        letterSpacing: 0.5,
      ),
      labelSmall: TextStyle(
        fontSize: 11.0,
        fontWeight: FontWeight.w500,
        color: AppColors.disabledText,
        letterSpacing: 0.5,
      ),
    );
  }
}
