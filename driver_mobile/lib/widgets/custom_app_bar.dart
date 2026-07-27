import 'package:flutter/material.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final Widget? title;
  final String? titleText;
  final List<Widget>? actions;
  final Widget? leading;
  final bool centerTitle;
  final PreferredSizeWidget? bottom;
  final Color? backgroundColor;
  final double? titleSpacing;

  const CustomAppBar({
    super.key,
    this.title,
    this.titleText,
    this.actions,
    this.leading,
    this.centerTitle = true,
    this.bottom,
    this.backgroundColor,
    this.titleSpacing,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: title ?? (titleText != null ? Text(titleText!) : null),
      actions: actions,
      leading: leading,
      centerTitle: centerTitle,
      bottom: bottom,
      backgroundColor: backgroundColor ?? Theme.of(context).appBarTheme.backgroundColor,
      titleSpacing: titleSpacing,
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(
        kToolbarHeight + (bottom?.preferredSize.height ?? 0.0),
      );
}
