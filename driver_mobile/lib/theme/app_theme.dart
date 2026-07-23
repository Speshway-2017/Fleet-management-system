import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_radius.dart';
import 'app_text_theme.dart';
import 'app_button_theme.dart';
import 'app_input_theme.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: AppColors.primary,
      primaryColorLight: AppColors.primaryVariant,
      scaffoldBackgroundColor: AppColors.background,
      
      colorScheme: const ColorScheme(
        brightness: Brightness.light,
        primary: AppColors.primary,
        onPrimary: AppColors.background,
        primaryContainer: AppColors.primaryVariant,
        onPrimaryContainer: AppColors.background,
        secondary: AppColors.secondary,
        onSecondary: AppColors.background,
        tertiary: AppColors.accent,
        onTertiary: AppColors.background,
        surface: AppColors.surface,
        onSurface: AppColors.primaryText,
        error: AppColors.error,
        onError: AppColors.background,
        outline: AppColors.divider,
      ),

      textTheme: AppTextTheme.lightTextTheme,
      elevatedButtonTheme: AppButtonTheme.elevatedButtonTheme,
      outlinedButtonTheme: AppButtonTheme.outlinedButtonTheme,
      textButtonTheme: AppButtonTheme.textButtonTheme,
      inputDecorationTheme: AppInputTheme.inputDecorationTheme,

      // Configure Card Theme
      cardTheme: CardThemeData(
        color: AppColors.surface,
        elevation: 0.0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          side: const BorderSide(
            color: AppColors.divider,
            width: 1.0,
          ),
        ),
      ),

      // Configure AppBar Theme
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.background,
        elevation: 0.0,
        scrolledUnderElevation: 0.0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          fontSize: 18.0,
          fontWeight: FontWeight.w600,
          color: AppColors.background,
        ),
        iconTheme: IconThemeData(color: AppColors.background),
        actionsIconTheme: IconThemeData(color: AppColors.background),
      ),

      // Configure SnackBar Theme
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.primaryVariant,
        contentTextStyle: const TextStyle(
          color: AppColors.background,
          fontSize: 14.0,
          fontWeight: FontWeight.w400,
        ),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.sm),
        ),
      ),

      // Configure Divider Theme
      dividerTheme: const DividerThemeData(
        color: AppColors.divider,
        thickness: 1.0,
        space: 1.0,
      ),
    );
  }
}
