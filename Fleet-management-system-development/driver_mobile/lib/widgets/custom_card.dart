import 'package:flutter/material.dart';
import '../constants/app_radius.dart';

class CustomCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final Color? color;
  final double? borderRadius;
  final BorderSide? borderSide;

  const CustomCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.color,
    this.borderRadius,
    this.borderSide,
  });

  @override
  Widget build(BuildContext context) {
    final cardTheme = Theme.of(context).cardTheme;
    final RoundedRectangleBorder cardShape = (cardTheme.shape as RoundedRectangleBorder?) ?? 
        RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          side: const BorderSide(color: Colors.transparent, width: 0),
        );

    return Card(
      color: color ?? cardTheme.color,
      elevation: cardTheme.elevation ?? 0.0,
      margin: margin ?? cardTheme.margin ?? EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(borderRadius ?? (cardShape.borderRadius as BorderRadius).resolve(Directionality.of(context)).topLeft.x),
        side: borderSide ?? cardShape.side,
      ),
      child: Padding(
        padding: padding ?? const EdgeInsets.all(16.0),
        child: child,
      ),
    );
  }
}
