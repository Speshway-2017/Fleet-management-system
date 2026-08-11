import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../services/secure_storage_helper.dart';
import '../models/driver_model.dart';

class AuthRepository {

  Future<Map<String, dynamic>> login(String identifier, String password) async {
    final response = await ApiService.post('/driver/login', {
      'identifier': identifier.trim(),
      'password': password.trim(),
    });

    if (response['success'] == true && response['data'] != null) {
      final data = response['data'];
      final token = data['token'] ?? '';

      // Save in secure storage
      await SecureStorageHelper.write(key: 'jwt_token', value: token);

      // Save details in shared_preferences for quick fallback/read if needed
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('jwt_token', token);
      await prefs.setString('driver_id', data['driverId'] ?? '');
      await prefs.setString('manager_id', data['managerId'] ?? '');
      await prefs.setString('organization_id', data['organizationId'] ?? '');

      // Cache the driver profile JSON if returned
      if (data['driver'] != null) {
        try {
          final profile = DriverModel.fromJson(data['driver']);
          await prefs.setString('driver_profile', jsonEncode(profile.toJson()));
        } catch (_) {}
      }

      return data;
    } else {
      throw Exception(response['message'] ?? 'Login failed');
    }
  }

  Future<void> logout() async {
    try {
      await ApiService.post('/driver/logout', {});
    } catch (_) {}

    try {
      // Clear secure storage token
      await SecureStorageHelper.delete(key: 'jwt_token');
    } catch (_) {}

    try {
      // Clear shared_preferences session data
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('jwt_token');
      await prefs.remove('driver_id');
      await prefs.remove('manager_id');
      await prefs.remove('organization_id');
      await prefs.remove('driver_profile');
    } catch (_) {}
  }

  Future<void> forgotPassword(String email) async {
    final response = await ApiService.post('/auth/forgot-password', {
      'email': email.trim().toLowerCase(),
    });

    if (response['success'] != true) {
      throw Exception(response['message'] ?? 'Failed to send OTP');
    }
  }

  Future<void> verifyOtp(String email, String otp) async {
    final response = await ApiService.post('/auth/verify-otp', {
      'email': email.trim().toLowerCase(),
      'otp': otp.trim(),
    });

    if (response['success'] != true) {
      throw Exception(response['message'] ?? 'Invalid or expired OTP');
    }
  }

  Future<void> resetPassword(
    String email,
    String otp,
    String newPassword,
  ) async {
    final response = await ApiService.post('/auth/reset-password', {
      'email': email.trim().toLowerCase(),
      'otp': otp.trim(),
      'newPassword': newPassword.trim(),
    });

    if (response['success'] != true) {
      throw Exception(response['message'] ?? 'Failed to reset password');
    }
  }

  Future<DriverModel?> fetchProfile() async {
    try {
      final response = await ApiService.get('/driver/profile');
      if (response['success'] == true) {
        if (response['data'] != null) {
          final profile = DriverModel.fromJson(response['data']);

          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('driver_id', profile.id);
          if (profile.manager != null) {
            await prefs.setString('manager_id', profile.manager!.id);
          }
          await prefs.setString('organization_id', profile.organization);

          // Cache the profile JSON
          await prefs.setString('driver_profile', jsonEncode(profile.toJson()));

          return profile;
        }
      } else {
        throw Exception(response['message'] ?? 'Failed to fetch profile');
      }
    } catch (_) {
      rethrow;
    }
    return null;
  }

  Future<DriverModel?> updateProfile(Map<String, dynamic> data) async {
    try {
      final response = await ApiService.put('/driver/profile', data);
      if (response['success'] == true) {
        if (response['data'] != null) {
          final profile = DriverModel.fromJson(response['data']);

          // Cache the updated profile JSON
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('driver_profile', jsonEncode(profile.toJson()));

          return profile;
        }
      } else {
        throw Exception(response['message'] ?? 'Failed to update profile');
      }
    } catch (_) {
      rethrow;
    }
    return null;
  }

  Future<void> changePassword(String oldPassword, String newPassword) async {
    final response = await ApiService.patch('/auth/change-password', {
      'oldPassword': oldPassword,
      'newPassword': newPassword,
    });

    if (response['success'] != true) {
      throw Exception(response['message'] ?? 'Failed to change password');
    }
  }

  Future<bool> hasToken() async {
    final token = await SecureStorageHelper.read(key: 'jwt_token');
    return token != null && token.isNotEmpty;
  }

  Future<String?> getToken() async {
    return await SecureStorageHelper.read(key: 'jwt_token');
  }
}
