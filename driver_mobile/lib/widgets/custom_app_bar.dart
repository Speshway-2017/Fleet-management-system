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
    // Logo action widget with solid white background (the "left logo" style)
    final logoWidget = Container(
      width: 32,
      height: 32,
      margin: const EdgeInsets.only(right: 16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8.0),
      ),
      padding: const EdgeInsets.all(4.0),
      alignment: Alignment.center,
      child: Image.asset(
        'assets/logo.png',
        fit: BoxFit.contain,
        errorBuilder: (context, error, stackTrace) {
          return const Icon(
            Icons.local_shipping,
            color: Color(0xFF0D1B2A),
            size: 18,
          );
        },
      ),
    );

    // If actions are provided, use them directly; otherwise, show the default logo
    final List<Widget> combinedActions = actions != null ? actions! : [logoWidget];

    return AppBar(
      title: title ?? (titleText != null ? Text(titleText!) : null),
      actions: combinedActions,
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
