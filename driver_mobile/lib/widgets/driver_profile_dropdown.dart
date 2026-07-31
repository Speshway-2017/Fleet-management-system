import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../screens/auth/login_screen.dart';
import '../screens/main_navigation_screen.dart';

class DriverProfileDropdown extends StatefulWidget {
  final bool isDarkBackground;

  const DriverProfileDropdown({
    super.key,
    this.isDarkBackground = false,
  });

  @override
  State<DriverProfileDropdown> createState() => _DriverProfileDropdownState();
}

class _DriverProfileDropdownState extends State<DriverProfileDropdown> with SingleTickerProviderStateMixin {
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;
  bool _isOpen = false;
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );

    _scaleAnimation = Tween<double>(begin: 0.92, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOutCubic),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _hideDropdown(immediate: true);
    _animationController.dispose();
    super.dispose();
  }

  void _toggleDropdown() {
    if (_isOpen) {
      _hideDropdown();
    } else {
      _showDropdown();
    }
  }

  void _showDropdown() {
    if (_overlayEntry != null) return;

    _overlayEntry = _createOverlayEntry();
    Overlay.of(context).insert(_overlayEntry!);
    setState(() {
      _isOpen = true;
    });
    _animationController.forward();
  }

  void _hideDropdown({bool immediate = false}) {
    if (!_isOpen || _overlayEntry == null) return;

    if (immediate) {
      _overlayEntry?.remove();
      _overlayEntry = null;
      _isOpen = false;
    } else {
      _animationController.reverse().then((_) {
        _overlayEntry?.remove();
        _overlayEntry = null;
        if (mounted) {
          setState(() {
            _isOpen = false;
          });
        }
      });
    }
  }

  OverlayEntry _createOverlayEntry() {
    final mediaQuery = MediaQuery.of(context);
    final isMobile = mediaQuery.size.width < 640;

    return OverlayEntry(
      builder: (context) => Stack(
        children: [
          // Transparent Barrier to catch outside taps
          Positioned.fill(
            child: GestureDetector(
              behavior: HitTestBehavior.translucent,
              onTap: () => _hideDropdown(),
              child: Container(color: Colors.transparent),
            ),
          ),

          // Positioned Dropdown Overlay Menu
          Positioned(
            width: 220,
            child: CompositedTransformFollower(
              link: _layerLink,
              showWhenUnlinked: false,
              targetAnchor: Alignment.bottomRight,
              followerAnchor: Alignment.topRight,
              offset: const Offset(0, 10),
              child: AnimatedBuilder(
                animation: _animationController,
                builder: (context, child) {
                  return FadeTransition(
                    opacity: _fadeAnimation,
                    child: ScaleTransition(
                      scale: _scaleAnimation,
                      alignment: Alignment.topRight,
                      child: child,
                    ),
                  );
                },
                child: Material(
                  color: Colors.transparent,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16.0),
                      border: Border.all(color: const Color(0xFFE5E7EB), width: 1.0),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x1F000000),
                          blurRadius: 20.0,
                          offset: Offset(0, 8),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    child: Consumer<AuthProvider>(
                      builder: (context, authProvider, child) {
                        final driver = authProvider.driver;
                        final driverName = (driver?.fullName != null && driver!.fullName.trim().isNotEmpty)
                            ? driver.fullName
                            : 'Driver';
                        final isOnline = driver?.isOnline ?? (driver?.driverStatus != 'OFFLINE');

                        return Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            if (isMobile) ...[
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      driverName,
                                      style: GoogleFonts.poppins(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: const Color(0xFF1B2430),
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      'Driver',
                                      style: GoogleFonts.nunito(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w500,
                                        color: const Color(0xFF6B7280),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const Divider(color: Color(0xFFF3F4F6), height: 1),
                              const SizedBox(height: 4),
                            ],

                            // 1. My Profile
                            _buildMenuItem(
                              icon: Icons.person_outline_rounded,
                              label: 'My Profile',
                              textColor: const Color(0xFF374151),
                              iconColor: const Color(0xFF6B7280),
                              onTap: () {
                                _hideDropdown();
                                MainNavigationScreen.selectedTabNotifier.value = 4;
                              },
                            ),

                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 4.0),
                              child: Divider(color: Color(0xFFF3F4F6), height: 1),
                            ),

                            // 2. Availability Status Toggle
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 6.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Availability Status',
                                    style: GoogleFonts.nunito(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: const Color(0xFF6B7280),
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: [
                                          Container(
                                            width: 8,
                                            height: 8,
                                            decoration: BoxDecoration(
                                              color: isOnline ? const Color(0xFF22C55E) : const Color(0xFF9CA3AF),
                                              shape: BoxShape.circle,
                                            ),
                                          ),
                                          const SizedBox(width: 6),
                                          Text(
                                            isOnline ? 'Online' : 'Offline',
                                            style: GoogleFonts.poppins(
                                              fontSize: 13,
                                              fontWeight: FontWeight.w600,
                                              color: isOnline ? const Color(0xFF15803D) : const Color(0xFF4B5563),
                                            ),
                                          ),
                                        ],
                                      ),
                                      Transform.scale(
                                        scale: 0.85,
                                        child: Switch(
                                          value: isOnline,
                                          activeThumbColor: const Color(0xFF22C55E),
                                          activeTrackColor: const Color(0xFFDCFCE7),
                                          inactiveThumbColor: const Color(0xFF9CA3AF),
                                          inactiveTrackColor: const Color(0xFFE5E7EB),
                                          onChanged: (newValue) async {
                                            await _handleStatusToggle(context, authProvider, newValue);
                                          },
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),

                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 4.0),
                              child: Divider(color: Color(0xFFF3F4F6), height: 1),
                            ),

                            // 3. Logout
                            _buildMenuItem(
                              icon: Icons.logout_rounded,
                              label: 'Logout',
                              textColor: const Color(0xFFDC2626),
                              iconColor: const Color(0xFFDC2626),
                              hoverColor: const Color(0xFFFEF2F2),
                              onTap: () {
                                _hideDropdown();
                                _handleLogout(context);
                              },
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _handleStatusToggle(BuildContext context, AuthProvider authProvider, bool isOnline) async {
    final newStatus = isOnline ? 'AVAILABLE' : 'OFFLINE';
    final success = await authProvider.updateProfile({
      'isOnline': isOnline,
      'driverStatus': newStatus,
    });

    if (context.mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              isOnline ? 'Status updated to Online 🟢' : 'Status updated to Offline ⚪',
              style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w500),
            ),
            backgroundColor: isOnline ? const Color(0xFF15803D) : const Color(0xFF374151),
            duration: const Duration(seconds: 2),
            behavior: SnackBarBehavior.floating,
          ),
        );
      } else {
        final err = authProvider.errorMessage ?? 'Failed to update availability status';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              err,
              style: GoogleFonts.poppins(fontSize: 12),
            ),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String label,
    required Color textColor,
    required Color iconColor,
    Color? hoverColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      hoverColor: hoverColor ?? const Color(0xFFF9FAFB),
      splashColor: hoverColor ?? const Color(0xFFF3F4F6),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10.0),
        child: Row(
          children: [
            Icon(icon, size: 18, color: iconColor),
            const SizedBox(width: 10),
            Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: textColor,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleLogout(BuildContext context) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    await authProvider.logout();
    if (context.mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
        (route) => false,
      );
    }
  }

  Widget _buildAvatarImage(String? photoUrl) {
    if (photoUrl != null && photoUrl.isNotEmpty) {
      if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
        return Image.network(
          photoUrl,
          width: 48,
          height: 48,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) => _buildFallbackIcon(),
        );
      } else if (photoUrl.startsWith('data:image') || photoUrl.length > 100) {
        try {
          final cleanBase64 = photoUrl.contains(',') ? photoUrl.split(',')[1] : photoUrl;
          final bytes = base64Decode(cleanBase64.trim());
          return Image.memory(
            bytes,
            width: 48,
            height: 48,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) => _buildFallbackIcon(),
          );
        } catch (_) {
          return _buildFallbackIcon();
        }
      } else {
        return Image.asset(
          photoUrl,
          width: 48,
          height: 48,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) => _buildFallbackIcon(),
        );
      }
    }
    return _buildFallbackIcon();
  }

  Widget _buildFallbackIcon() {
    return const Icon(
      Icons.person_rounded,
      color: Color(0xFFB45A0A),
      size: 24,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        final driver = authProvider.driver;
        final driverName = (driver?.fullName != null && driver!.fullName.trim().isNotEmpty)
            ? driver.fullName
            : 'Driver';
        final photoUrl = driver?.profileImage;
        final isOnline = driver?.isOnline ?? (driver?.driverStatus != 'OFFLINE');

        final textColor = widget.isDarkBackground ? Colors.white : const Color(0xFF1B2430);
        final roleColor = widget.isDarkBackground ? const Color(0xFF98A2B3) : const Color(0xFF6B7280);
        final arrowColor = widget.isDarkBackground ? Colors.white70 : const Color(0xFF6B7280);

        return CompositedTransformTarget(
          link: _layerLink,
          child: InkWell(
            onTap: _toggleDropdown,
            borderRadius: BorderRadius.circular(16.0),
            hoverColor: widget.isDarkBackground ? Colors.white10 : const Color(0x0A000000),
            splashColor: widget.isDarkBackground ? Colors.white12 : const Color(0x0F000000),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 6.0, vertical: 4.0),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16.0),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Circular Profile Image / Avatar (48x48) with Dynamic Online Status Dot
                  Stack(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: const Color(0x1AB45A0A),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: const Color(0x33B45A0A),
                            width: 1.0,
                          ),
                        ),
                        child: ClipOval(
                          child: _buildAvatarImage(photoUrl),
                        ),
                      ),
                      Positioned(
                        bottom: 1,
                        right: 1,
                        child: Container(
                          width: 12,
                          height: 12,
                          decoration: BoxDecoration(
                            color: isOnline ? const Color(0xFF22C55E) : const Color(0xFF9CA3AF),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: widget.isDarkBackground ? const Color(0xFF091522) : Colors.white,
                              width: 2.0,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),

                  // Name, Role and Dropdown Arrow
                  const SizedBox(width: 10),
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        driverName,
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: textColor,
                          height: 1.1,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 3),
                      Text(
                        'Driver',
                        style: GoogleFonts.nunito(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: roleColor,
                          height: 1.1,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 6),
                  AnimatedRotation(
                    turns: _isOpen ? 0.5 : 0.0,
                    duration: const Duration(milliseconds: 200),
                    child: Icon(
                      Icons.keyboard_arrow_down_rounded,
                      size: 18,
                      color: arrowColor,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
