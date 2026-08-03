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
    return await _secureStorage.read(key: key);
  }

  static Future<void> write({required String key, required String value}) async {
    if (_isTest) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(key, value);
      return;
    }
    await _secureStorage.write(key: key, value: value);
  }

  static Future<void> delete({required String key}) async {
    if (_isTest) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(key);
      return;
    }
    await _secureStorage.delete(key: key);
  }
}
