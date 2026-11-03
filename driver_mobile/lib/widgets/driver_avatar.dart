import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';

/// Personalized driver avatar widget.
/// Renders the driver's real uploaded profile picture if available,
/// or dynamically renders an elegant avatar badge with the driver's personalized initials.
/// Never displays static placeholder photos of strangers.
class DriverAvatar extends StatelessWidget {
  final String? photoUrl;
  final String? name;
  final double size;
  final double? fontSize;
  final Color? backgroundColor;
  final Color? textColor;
  final Color? borderColor;
  final double borderWidth;
  final BoxShape shape;
  final BorderRadius? borderRadius;

  const DriverAvatar({
    super.key,
    this.photoUrl,
    this.name,
    this.size = 40.0,
    this.fontSize,
    this.backgroundColor,
    this.textColor,
    this.borderColor,
    this.borderWidth = 1.5,
    this.shape = BoxShape.circle,
    this.borderRadius,
  });

  /// Extracts up to 2 uppercase initials from the driver's full name.
  /// Example:
  /// - "Sai Kiran" -> "SK"
  /// - "Dhanush Patel" -> "DP"
  /// - "Driver 1" -> "D1"
  /// - "Bunny" -> "BU"
  /// - null or "" -> ""
  static String getInitials(String? fullName) {
    if (fullName == null || fullName.trim().isEmpty) return '';
    final parts = fullName.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty) return '';
    if (parts.length == 1) {
      final word = parts[0];
      return word.length >= 2 ? word.substring(0, 2).toUpperCase() : word.toUpperCase();
    }
    final first = parts.first.isNotEmpty ? parts.first[0].toUpperCase() : '';
    final last = parts.last.isNotEmpty ? parts.last[0].toUpperCase() : '';
    return '$first$last';
  }

  @override
  Widget build(BuildContext context) {
    final initials = getInitials(name);
    final effectiveBg = backgroundColor ?? const Color(0xFFFEF3E2);
    final effectiveText = textColor ?? AppColors.secondary;
    final effectiveBorder = borderColor ?? const Color(0x33B45A0A);
    final resolvedFontSize = fontSize ?? (size * 0.38);

    final cleanUrl = photoUrl?.trim() ?? '';

    Widget content;

    if (cleanUrl.isNotEmpty) {
      if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
        content = Image.network(
          cleanUrl,
          width: size,
          height: size,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) =>
              _buildInitialsOrIcon(initials, effectiveText, resolvedFontSize),
        );
      } else if (cleanUrl.startsWith('data:image') || cleanUrl.length > 100) {
        try {
          final cleanBase64 = cleanUrl.contains(',') ? cleanUrl.split(',')[1] : cleanUrl;
          final bytes = base64Decode(cleanBase64.trim());
          content = Image.memory(
            bytes,
            width: size,
            height: size,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) =>
                _buildInitialsOrIcon(initials, effectiveText, resolvedFontSize),
          );
        } catch (_) {
          content = _buildInitialsOrIcon(initials, effectiveText, resolvedFontSize);
        }
      } else {
        content = _buildInitialsOrIcon(initials, effectiveText, resolvedFontSize);
      }
    } else {
      content = _buildInitialsOrIcon(initials, effectiveText, resolvedFontSize);
    }

    final isCircle = shape == BoxShape.circle;
    final resolvedRadius = isCircle ? BorderRadius.circular(size / 2) : (borderRadius ?? BorderRadius.circular(14.0));

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: effectiveBg,
        shape: shape,
        borderRadius: isCircle ? null : resolvedRadius,
        border: borderWidth > 0 && effectiveBorder != Colors.transparent
            ? Border.all(color: effectiveBorder, width: borderWidth)
            : null,
      ),
      child: ClipRRect(
        borderRadius: resolvedRadius,
        child: content,
      ),
    );
  }

  Widget _buildInitialsOrIcon(String initials, Color color, double fontSize) {
    if (initials.isNotEmpty) {
      return Center(
        child: Text(
          initials,
          style: GoogleFonts.poppins(
            fontSize: fontSize,
            fontWeight: FontWeight.bold,
            color: color,
            height: 1.0,
          ),
          maxLines: 1,
          overflow: TextOverflow.clip,
        ),
      );
    }
    return Center(
      child: Icon(
        Icons.person_rounded,
        size: size * 0.52,
        color: color,
      ),
    );
  }
}

