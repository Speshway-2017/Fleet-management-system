import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class AuthService {
  static Future<Map<String, dynamic>> login(String identifier, String password) async {
    final response = await ApiService.post('/driver/login', {
      'identifier': identifier.trim(),
      'password': password.trim(),
    });

    if (response['success'] == true && response['data'] != null) {
      final data = response['data'];
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('jwt_token', data['token'] ?? '');
      await prefs.setString('driver_id', data['driverId'] ?? '');
      await prefs.setString('manager_id', data['managerId'] ?? '');
      await prefs.setString('organization_id', data['organizationId'] ?? '');
      return data;
    } else {
      throw Exception(response['message'] ?? 'Login failed');
    }
  }

  static Future<void> logout() async {
    try {
      await ApiService.post('/driver/logout', {});
    } catch (_) {}
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    return token != null && token.isNotEmpty;
  }

  static Future<Map<String, String>> getSavedSession() async {
    final prefs = await SharedPreferences.getInstance();
    return {
      'token': prefs.getString('jwt_token') ?? '',
      'driverId': prefs.getString('driver_id') ?? '',
      'managerId': prefs.getString('manager_id') ?? '',
      'organizationId': prefs.getString('organization_id') ?? '',
    };
  }

  static Future<Map<String, dynamic>?> fetchProfile() async {
    try {
      final response = await ApiService.get('/driver/profile');
      if (response['success'] == true) {
        return response['data'];
      }
    } catch (e) {
      debugPrint('Profile fetch error: $e');
    }
    return null;
  }
}
