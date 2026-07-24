import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import 'loading_indicator.dart';

enum CustomButtonType { elevated, outlined, text }

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final CustomButtonType type;
  final bool isLoading;
  final Widget? icon;
  final double? width;
  final double? height;

  const CustomButton({
    super.key,
    required this.text,
    this.onPressed,
    this.type = CustomButtonType.elevated,
    this.isLoading = false,
    this.icon,
    this.width,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    final bool isElevated = type == CustomButtonType.elevated;
    final Widget label = isLoading
        ? LoadingIndicator(
            size: 20.0,
            isLight: isElevated,
            color: isElevated ? AppColors.background : AppColors.primary,
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[icon!, const SizedBox(width: 8.0)],
              Text(text),
            ],
          );

    final VoidCallback? activeOnPressed = isLoading ? null : onPressed;

    Widget button;
    switch (type) {
      case CustomButtonType.elevated:
        button = ElevatedButton(
          onPressed: activeOnPressed,
          style: height != null
              ? ElevatedButton.styleFrom(
                  minimumSize: Size(width ?? double.infinity, height!),
                )
              : null,
          child: label,
        );
        break;
      case CustomButtonType.outlined:
        button = OutlinedButton(
          onPressed: activeOnPressed,
          style: height != null
              ? OutlinedButton.styleFrom(
                  minimumSize: Size(width ?? double.infinity, height!),
                )
              : null,
          child: label,
        );
        break;
      case CustomButtonType.text:
        button = TextButton(
          onPressed: activeOnPressed,
          style: height != null
              ? TextButton.styleFrom(
                  minimumSize: Size(width ?? double.infinity, height!),
                )
              : null,
          child: label,
        );
        break;
    }

    if (width != null) {
      return SizedBox(width: width, child: button);
    }
    return button;
  }
}
