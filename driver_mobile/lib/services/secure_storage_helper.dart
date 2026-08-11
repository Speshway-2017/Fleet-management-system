import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SecureStorageHelper {
  static const _secureStorage = FlutterSecureStorage();

  static bool get _isTest {
    if (kIsWeb) return false;
    try {
      return Platform.environment.containsKey('FLUTTER_TEST');
    } catch (_) {
      return false;
    }
  }

  static Future<String?> read({required String key}) async {
    if (_isTest) {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString(key);
    }
    try {
      final val = await _secureStorage.read(key: key);
      if (val != null && val.isNotEmpty) {
        return val;
      }
    } catch (e) {
      debugPrint('[SecureStorageHelper] read error for key $key: $e');
    }

    // Fallback to SharedPreferences
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString(key);
    } catch (e) {
      debugPrint('[SecureStorageHelper] SharedPreferences read error for key $key: $e');
    }
    return null;
  }

  static Future<void> write({required String key, required String value}) async {
    if (_isTest) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(key, value);
      return;
    }
    try {
      await _secureStorage.write(key: key, value: value);
    } catch (e) {
      debugPrint('[SecureStorageHelper] write error for key $key: $e');
    }

    // Backup write to SharedPreferences
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(key, value);
    } catch (e) {
      debugPrint('[SecureStorageHelper] SharedPreferences write error for key $key: $e');
    }
  }

  static Future<void> delete({required String key}) async {
    if (_isTest) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(key);
      return;
    }
    try {
      await _secureStorage.delete(key: key);
    } catch (e) {
      debugPrint('[SecureStorageHelper] delete error for key $key: $e');
    }

    // Clean up SharedPreferences
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(key);
    } catch (e) {
      debugPrint('[SecureStorageHelper] SharedPreferences remove error for key $key: $e');
    }
  }
}
