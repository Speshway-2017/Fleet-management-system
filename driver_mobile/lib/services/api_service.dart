import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';

class ApiService {
  // Default fallback host: 10.86.34.1 (PC Wi-Fi IP) or 127.0.0.1 (via adb reverse) or 10.0.2.2 (Emulator)
  static const String defaultLocalIp = '10.86.34.1';
  static String? _cachedBaseUrl;
  static final Dio _dio = Dio();
  static const _secureStorage = FlutterSecureStorage();
  static Function()? onUnauthorized;

  static void initialize() {
    _dio.interceptors.clear();
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _secureStorage.read(key: 'jwt_token');
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          options.headers['Content-Type'] = 'application/json';
          options.headers['Accept'] = 'application/json';
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          debugPrint('Dio Error: ${e.message}');
          if (e.response?.statusCode == 401) {
            final path = e.requestOptions.path.toLowerCase();
            if (!path.contains('login')) {
              if (onUnauthorized != null) {
                onUnauthorized!();
              }
            }
          }
          return handler.next(e);
        },
      ),
    );
  }

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
      final healthUri = '${formattedUrl.replaceAll('/api', '')}/health';
      final testDio = Dio();
      final response = await testDio.get(healthUri).timeout(const Duration(seconds: 4));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  static Future<dynamic> get(String endpoint) async {
    final baseUrl = await getBaseUrl();
    _dio.options.baseUrl = baseUrl;
    try {
      final response = await _dio.get(endpoint).timeout(const Duration(seconds: 10));
      return response.data;
    } on DioException catch (e) {
      // If primary IP fails and we haven't set custom URL, try 127.0.0.1 / localhost as fallback
      if (_cachedBaseUrl == 'http://$defaultLocalIp:5000/api') {
        try {
          const fallbackUrl = 'http://127.0.0.1:5000/api';
          _dio.options.baseUrl = fallbackUrl;
          final response = await _dio.get(endpoint).timeout(const Duration(seconds: 5));
          _cachedBaseUrl = fallbackUrl;
          return response.data;
        } catch (_) {}
      }
      throw _handleDioError(e);
    } catch (e) {
      rethrow;
    }
  }

  static Future<dynamic> post(String endpoint, Map<String, dynamic> body) async {
    final baseUrl = await getBaseUrl();
    _dio.options.baseUrl = baseUrl;
    try {
      final response = await _dio.post(endpoint, data: body).timeout(const Duration(seconds: 10));
      return response.data;
    } on DioException catch (e) {
      // Fallback try for physical devices connected via ADB USB reverse
      if (_cachedBaseUrl == 'http://$defaultLocalIp:5000/api') {
        try {
          const fallbackUrl = 'http://127.0.0.1:5000/api';
          _dio.options.baseUrl = fallbackUrl;
          final response = await _dio.post(endpoint, data: body).timeout(const Duration(seconds: 5));
          _cachedBaseUrl = fallbackUrl;
          return response.data;
        } catch (_) {}
      }
      throw _handleDioError(e);
    } catch (e) {
      rethrow;
    }
  }

  static Future<dynamic> put(String endpoint, Map<String, dynamic> body) async {
    final baseUrl = await getBaseUrl();
    _dio.options.baseUrl = baseUrl;
    try {
      final response = await _dio.put(endpoint, data: body).timeout(const Duration(seconds: 10));
      return response.data;
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      rethrow;
    }
  }

  static Future<dynamic> patch(String endpoint, Map<String, dynamic> body) async {
    final baseUrl = await getBaseUrl();
    _dio.options.baseUrl = baseUrl;
    try {
      final response = await _dio.patch(endpoint, data: body).timeout(const Duration(seconds: 10));
      return response.data;
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      rethrow;
    }
  }

  static Exception _handleDioError(DioException error) {
    if (error.response != null) {
      final data = error.response?.data;
      if (data is Map && data.containsKey('message')) {
        return Exception(data['message']);
      }
      return Exception('Server Error (${error.response?.statusCode})');
    }
    if (error.type == DioExceptionType.connectionTimeout || error.type == DioExceptionType.receiveTimeout) {
      return Exception('Connection timeout. Please check your network and server status.');
    }
    return Exception(error.message ?? 'A network error occurred.');
  }
}
