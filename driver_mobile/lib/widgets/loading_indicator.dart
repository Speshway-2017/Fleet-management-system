import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class LoadingIndicator extends StatelessWidget {
  final double size;
  final bool isLight;
  final Color? color;

  const LoadingIndicator({
    super.key,
    this.size = 24.0,
    this.isLight = false,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CircularProgressIndicator(
        strokeWidth: 2.5,
        valueColor: AlwaysStoppedAnimation<Color>(
          color ?? (isLight ? AppColors.background : AppColors.primary),
        ),
      ),
    );
  }
}
