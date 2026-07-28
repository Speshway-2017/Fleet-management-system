import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:latlong2/latlong.dart';
import '../constants/app_colors.dart';
import '../constants/app_radius.dart';

/// Reusable Real Interactive Map Widget for Live Tracking with Reroute feature.
class LiveTrackingMapWidget extends StatefulWidget {
  final LatLng driverLocation;
  final LatLng pickupLocation;
  final LatLng destinationLocation;
  final String pickupAddress;
  final String destinationAddress;
  final double height;
  final VoidCallback? onReroutePressed;

  const LiveTrackingMapWidget({
    super.key,
    this.driverLocation = const LatLng(18.5204, 73.8567), // Pune Default
    this.pickupLocation = const LatLng(18.9696, 72.8193), // Mumbai Port
    this.destinationLocation = const LatLng(18.5204, 73.8567), // Pune Hub
    this.pickupAddress = 'Port of Long Beach / Mumbai Terminal',
    this.destinationAddress = 'Distribution Hub A-12',
    this.height = 260.0,
    this.onReroutePressed,
  });

  @override
  State<LiveTrackingMapWidget> createState() => _LiveTrackingMapWidgetState();
}

class _LiveTrackingMapWidgetState extends State<LiveTrackingMapWidget> with SingleTickerProviderStateMixin {
  late final MapController _mapController;
  late LatLng _currentDriverLocation;
  late double _currentZoom;
  bool _isRerouting = false;

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
    _currentDriverLocation = widget.driverLocation;
    _currentZoom = 12.5;
  }

  void _recenterLocation() {
    _mapController.move(_currentDriverLocation, 13.5);
  }

  void _triggerReroute() async {
    setState(() {
      _isRerouting = true;
    });

    // Simulate route recalculation & center map
    await Future.delayed(const Duration(milliseconds: 600));

    if (mounted) {
      _mapController.move(_currentDriverLocation, 14.0);
      setState(() {
        _isRerouting = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.alt_route_rounded, color: Colors.white, size: 20),
              const SizedBox(width: 10),
              const Expanded(
                child: Text(
                  'Route recalculated! Current driver position centered on map.',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                ),
              ),
            ],
          ),
          backgroundColor: AppColors.primary,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 3),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    }

    if (widget.onReroutePressed != null) {
      widget.onReroutePressed!();
    }
  }

  @override
  Widget build(BuildContext context) {
    // Generate route polyline points
    final routePoints = [
      widget.pickupLocation,
      LatLng(
        (widget.pickupLocation.latitude + _currentDriverLocation.latitude) / 2 + 0.05,
        (widget.pickupLocation.longitude + _currentDriverLocation.longitude) / 2 - 0.04,
      ),
      _currentDriverLocation,
      LatLng(
        (_currentDriverLocation.latitude + widget.destinationLocation.latitude) / 2 - 0.02,
        (_currentDriverLocation.longitude + widget.destinationLocation.longitude) / 2 + 0.03,
      ),
      widget.destinationLocation,
    ];

    return Container(
      height: widget.height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: Colors.grey.withAlpha(50), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(15),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          // Real OpenStreetMap Layer
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _currentDriverLocation,
              initialZoom: _currentZoom,
              minZoom: 4.0,
              maxZoom: 18.0,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.fleetmanagement.driver_mobile',
              ),
              // Route Polyline Layer
              PolylineLayer(
                polylines: [
                  Polyline(
                    points: routePoints,
                    strokeWidth: 4.5,
                    color: const Color(0xFF2563EB), // Deep Blue route
                  ),
                ],
              ),
              // Markers Layer
              MarkerLayer(
                markers: [
                  // Pickup Marker
                  Marker(
                    point: widget.pickupLocation,
                    width: 36,
                    height: 36,
                    child: Container(
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 4)],
                      ),
                      child: const Center(
                        child: Icon(Icons.inventory_2_rounded, color: Colors.blue, size: 20),
                      ),
                    ),
                  ),
                  // Destination Marker
                  Marker(
                    point: widget.destinationLocation,
                    width: 36,
                    height: 36,
                    child: Container(
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 4)],
                      ),
                      child: const Center(
                        child: Icon(Icons.location_on_rounded, color: Colors.redAccent, size: 22),
                      ),
                    ),
                  ),
                  // Current Driver Vehicle Live Marker
                  Marker(
                    point: _currentDriverLocation,
                    width: 48,
                    height: 48,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColors.secondary.withAlpha(40),
                          ),
                        ),
                        Container(
                          width: 34,
                          height: 34,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColors.secondary,
                            border: Border.all(color: Colors.white, width: 2),
                            boxShadow: const [
                              BoxShadow(color: Colors.black38, blurRadius: 6, offset: Offset(0, 2))
                            ],
                          ),
                          child: const Icon(
                            Icons.local_shipping_rounded,
                            color: Colors.white,
                            size: 18,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),

          // Top Info Status Overlay Badge
          Positioned(
            top: 10,
            left: 10,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: const Color(0xFF101C2C).withAlpha(220),
                borderRadius: BorderRadius.circular(20),
                boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 4)],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Color(0xFF22C55E),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'GPS Live: 56 km/h',
                    style: GoogleFonts.poppins(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Top-Right Action Controls (Reroute & Recenter)
          Positioned(
            top: 10,
            right: 10,
            child: Column(
              children: [
                // Reroute Button
                Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: _isRerouting ? null : _triggerReroute,
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.secondary,
                        borderRadius: BorderRadius.circular(8),
                        boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 4)],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          _isRerouting
                              ? const SizedBox(
                                  width: 14,
                                  height: 14,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Icon(Icons.alt_route_rounded, color: Colors.white, size: 16),
                          const SizedBox(width: 5),
                          Text(
                            'Reroute',
                            style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                // Recenter My Location Button
                FloatingActionButton.small(
                  heroTag: 'recenter_location_btn_${widget.height}',
                  onPressed: _recenterLocation,
                  backgroundColor: Colors.white,
                  foregroundColor: const Color(0xFF101C2C),
                  elevation: 3,
                  child: const Icon(Icons.my_location_rounded, size: 18),
                ),
              ],
            ),
          ),

          // Bottom Left Map Type/OSM Attribution indicator
          Positioned(
            bottom: 6,
            left: 10,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.white.withAlpha(200),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                '© OpenStreetMap contributors',
                style: GoogleFonts.poppins(fontSize: 9, color: Colors.black87),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
