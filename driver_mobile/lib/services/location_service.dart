import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'api_service.dart';

class LocationTrackingService {
  static Timer? _timer;
  static bool isTracking = false;

  static Future<void> startTracking({String? tripId}) async {
    if (isTracking) return;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }

    if (permission == LocationPermission.deniedForever) return;

    isTracking = true;

    // Send location immediately, then repeat every 10 seconds
    _sendCurrentLocation(tripId);
    _timer = Timer.periodic(const Duration(seconds: 10), (_) {
      _sendCurrentLocation(tripId);
    });
  }

  static Future<void> _sendCurrentLocation(String? tripId) async {
    try {
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      await ApiService.post('/driver/location', {
        'latitude': position.latitude,
        'longitude': position.longitude,
        'speed': position.speed,
        'heading': position.heading,
        'tripId': tripId,
      });
    } catch (e) {
      debugPrint('Failed to send GPS location: $e');
    }
  }

  static void stopTracking() {
    _timer?.cancel();
    _timer = null;
    isTracking = false;
  }
}
