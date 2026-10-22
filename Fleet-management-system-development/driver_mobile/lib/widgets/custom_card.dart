import 'package:flutter/material.dart';
import '../constants/app_radius.dart';

class CustomCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final Color? color;
  final double? borderRadius;
  final BorderSide? borderSide;
  final VoidCallback? onTap;

  const CustomCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.color,
    this.borderRadius,
    this.borderSide,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final cardTheme = Theme.of(context).cardTheme;
    final RoundedRectangleBorder cardShape = (cardTheme.shape as RoundedRectangleBorder?) ?? 
        RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          side: const BorderSide(color: Colors.transparent, width: 0),
        );

    final double defaultRadius = AppRadius.lg;
    double resolvedRadius = borderRadius ?? defaultRadius;
    if (borderRadius == null && cardTheme.shape is RoundedRectangleBorder) {
      final border = (cardTheme.shape as RoundedRectangleBorder).borderRadius;
      if (border is BorderRadius) {
        resolvedRadius = border.topLeft.x;
      }
    }

    final shape = RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(resolvedRadius),
      side: borderSide ?? cardShape.side,
    );

    Widget content = Padding(
      padding: padding ?? const EdgeInsets.all(16.0),
      child: child,
    );

    if (onTap != null) {
      content = InkWell(
        borderRadius: BorderRadius.circular(resolvedRadius),
        onTap: onTap,
        child: content,
      );
    }

    return Card(
      color: color ?? cardTheme.color,
      elevation: cardTheme.elevation ?? 0.0,
      clipBehavior: onTap != null ? Clip.antiAlias : Clip.none,
      margin: margin ?? cardTheme.margin ?? EdgeInsets.zero,
      shape: shape,
      child: content,
    );
  }
}
