import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Default fallback host: 10.86.34.1 (PC Wi-Fi IP) or 127.0.0.1 (via adb reverse) or 10.0.2.2 (Emulator)
  static const String defaultLocalIp = '10.86.34.1';
  static String? _cachedBaseUrl;

  static Future<String> getBaseUrl() async {
    if (_cachedBaseUrl != null && _cachedBaseUrl!.isNotEmpty) {
      return _cachedBaseUrl!;
    }

    final prefs = await SharedPreferences.getInstance();
    final savedUrl = prefs.getString('server_url');

    if (savedUrl != null && savedUrl.isNotEmpty) {
      _cachedBaseUrl = savedUrl;
      return savedUrl;
    }

    // Default auto fallback
    if (kIsWeb) {
      _cachedBaseUrl = 'http://localhost:5000/api';
    } else {
      _cachedBaseUrl = 'http://$defaultLocalIp:5000/api';
    }

    return _cachedBaseUrl!;
  }

  static Future<void> setBaseUrl(String url) async {
    var formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'http://$formattedUrl';
    }
    if (!formattedUrl.endsWith('/api')) {
      if (formattedUrl.endsWith('/')) {
        formattedUrl = '${formattedUrl}api';
      } else {
        formattedUrl = '$formattedUrl/api';
      }
    }

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('server_url', formattedUrl);
    _cachedBaseUrl = formattedUrl;
  }

  static Future<bool> testConnection(String targetUrl) async {
    try {
      var formattedUrl = targetUrl.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'http://$formattedUrl';
      }
      final healthUri = Uri.parse('${formattedUrl.replaceAll('/api', '')}/health');
      final response = await http.get(healthUri).timeout(const Duration(seconds: 4));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  static Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token') ?? '';
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  static Future<dynamic> get(String endpoint) async {
    final baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    try {
      final response = await http.get(Uri.parse('$baseUrl$endpoint'), headers: headers).timeout(const Duration(seconds: 10));
      return _processResponse(response);
    } catch (e) {
      // If primary IP fails and we haven't set custom URL, try 127.0.0.1 / localhost as fallback
      if (_cachedBaseUrl == 'http://$defaultLocalIp:5000/api') {
        try {
          final fallbackUrl = 'http://127.0.0.1:5000/api';
          final response = await http.get(Uri.parse('$fallbackUrl$endpoint'), headers: headers).timeout(const Duration(seconds: 5));
          _cachedBaseUrl = fallbackUrl;
          return _processResponse(response);
        } catch (_) {}
      }
      rethrow;
    }
  }

  static Future<dynamic> post(String endpoint, Map<String, dynamic> body) async {
    final baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    try {
      final response = await http.post(
        Uri.parse('$baseUrl$endpoint'),
        headers: headers,
        body: jsonEncode(body),
      ).timeout(const Duration(seconds: 10));
      return _processResponse(response);
    } catch (e) {
      // Fallback try for physical devices connected via ADB USB reverse
      if (_cachedBaseUrl == 'http://$defaultLocalIp:5000/api') {
        try {
          final fallbackUrl = 'http://127.0.0.1:5000/api';
          final response = await http.post(
            Uri.parse('$fallbackUrl$endpoint'),
            headers: headers,
            body: jsonEncode(body),
          ).timeout(const Duration(seconds: 5));
          _cachedBaseUrl = fallbackUrl;
          return _processResponse(response);
        } catch (_) {}
      }
      rethrow;
    }
  }

  static Future<dynamic> patch(String endpoint, Map<String, dynamic> body) async {
    final baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    final response = await http.patch(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: jsonEncode(body),
    ).timeout(const Duration(seconds: 10));
    return _processResponse(response);
  }

  static dynamic _processResponse(http.Response response) {
    final body = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    } else {
      throw Exception(body['message'] ?? 'API Request Failed (${response.statusCode})');
    }
  }
}
