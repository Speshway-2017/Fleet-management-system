import 'package:flutter/material.dart';
import '../utils/navigation_helper.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final Widget? title;
  final String? titleText;
  final List<Widget>? actions;
  final Widget? leading;
  final bool centerTitle;
  final PreferredSizeWidget? bottom;
  final Color? backgroundColor;
  final double? titleSpacing;
  final bool automaticallyImplyLeading;
  final int fallbackTab;
  final VoidCallback? onBack;

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
    this.automaticallyImplyLeading = true,
    this.fallbackTab = 2,
    this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    final List<Widget> combinedActions = actions ?? const [];

    Widget? effectiveLeading = leading;
    if (effectiveLeading == null && automaticallyImplyLeading) {
      effectiveLeading = IconButton(
        icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
        tooltip: 'Back',
        onPressed: onBack ?? () => SafeNavigation.pop(context, fallbackTab: fallbackTab),
      );
    }

    return AppBar(
      title: title ?? (titleText != null ? Text(titleText!) : null),
      actions: combinedActions,
      leading: effectiveLeading,
      automaticallyImplyLeading: false, // Handled safely via effectiveLeading
      centerTitle: centerTitle,
      bottom: bottom,
      backgroundColor: backgroundColor ?? Theme.of(context).appBarTheme.backgroundColor,
      titleSpacing: titleSpacing ?? (effectiveLeading != null ? 0.0 : null),
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(
        kToolbarHeight + (bottom?.preferredSize.height ?? 0.0),
      );
}
