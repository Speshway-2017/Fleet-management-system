import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'secure_storage_helper.dart';

class ApiService {
  static Function()? onUnauthorized;
  static Map<String, dynamic> mockResponses = {};

  static bool isTest = false;

  static bool get _isTest {
    if (isTest) return true;
    try {
      if (WidgetsBinding.instance.runtimeType.toString().contains('Test')) {
        return true;
      }
    } catch (_) {}
    return false;
  }

  static void initialize() {
    // Initialization setup if required
  }

  // Canonical Deployed Production URL & Host
  static const String productionHost = 'https://fleet.speshway.site';
  static const String productionApiUrl = 'https://fleet.speshway.site/api';

  // Local development settings
  static const String defaultLocalIp = '10.0.2.2';
  static const String defaultLocalPort = '5000';

  // Compile-time environment override if provided via flutter build --dart-define=API_BASE_URL=...
  static const String _envApiBaseUrl = String.fromEnvironment('API_BASE_URL');

  // Request timeout duration for mobile network resilience
  static const Duration defaultTimeout = Duration(seconds: 15);

  static String? _cachedBaseUrl;

  /// Checks if a given URL points to a local machine, loopback, or LAN IP
  static bool isLocalAddress(String url) {
    final lower = url.toLowerCase();
    return lower.contains('localhost') ||
        lower.contains('127.0.0.1') ||
        lower.contains('10.0.2.2') ||
        lower.contains('192.168.') ||
        lower.contains('10.166.') ||
        RegExp(r'10\.\d+\.\d+\.\d+').hasMatch(lower) ||
        RegExp(r'172\.(1[6-9]|2\d|3[01])\.\d+\.\d+').hasMatch(lower) ||
        lower.contains(':5000');
  }

  /// Formats any raw input string into a standard API base URL
  static String formatServerUrl(String raw) {
    var formattedUrl = raw.trim();
    if (formattedUrl.isEmpty) {
      return defaultUrl;
    }
    if (!formattedUrl.startsWith('http://') &&
        !formattedUrl.startsWith('https://')) {
      final isLocal = isLocalAddress(formattedUrl);
      formattedUrl = isLocal ? 'http://$formattedUrl' : 'https://$formattedUrl';
    }
    // If local address without port specified, append :5000
    try {
      final uri = Uri.parse(formattedUrl);
      if (uri.hasAuthority && !uri.hasPort && isLocalAddress(uri.host)) {
        formattedUrl = '${uri.scheme}://${uri.host}:5000${uri.path}';
      }
    } catch (_) {}

    if (!formattedUrl.endsWith('/api')) {
      if (formattedUrl.endsWith('/')) {
        formattedUrl = '${formattedUrl}api';
      } else {
        formattedUrl = '$formattedUrl/api';
      }
    }
    return formattedUrl;
  }

  /// Returns the default API base URL:
  /// - If --dart-define=API_BASE_URL is passed, uses that.
  /// - In Release Mode, ALWAYS returns the deployed production URL: https://fleet.speshway.site/api.
  /// - In Debug Mode, returns local emulator/localhost backend.
  static String get defaultUrl {
    if (_envApiBaseUrl.isNotEmpty) {
      return formatServerUrl(_envApiBaseUrl);
    }
    if (kReleaseMode) {
      return productionApiUrl;
    }
    // Debug mode defaults
    return kIsWeb ? 'http://localhost:5000/api' : 'http://$defaultLocalIp:5000/api';
  }

  /// Extracts the base host (scheme + authority) from any URL
  static String getHostFromUrl(String rawUrl) {
    try {
      final uri = Uri.parse(rawUrl.trim());
      if (uri.hasScheme && uri.hasAuthority) {
        return '${uri.scheme}://${uri.authority}';
      }
    } catch (_) {}
    return kReleaseMode ? productionHost : 'http://localhost:5000';
  }

  /// Current active server host for images, document links, or uploads
  static String get activeHost {
    if (_cachedBaseUrl != null && _cachedBaseUrl!.isNotEmpty) {
      return getHostFromUrl(_cachedBaseUrl!);
    }
    return kReleaseMode
        ? productionHost
        : (kIsWeb ? 'http://localhost:5000' : 'http://$defaultLocalIp:5000');
  }

  /// Resolves the API base URL to use.
  /// - In release builds, ignores stale local development LAN IPs from SharedPreferences
  ///   so the release APK seamlessly connects to the deployed backend.
  /// - In debug builds, allows developers to use local backend endpoints.
  static Future<String> getBaseUrl() async {
    if (_cachedBaseUrl != null && _cachedBaseUrl!.isNotEmpty) {
      return _cachedBaseUrl!;
    }

    if (_isTest) {
      _cachedBaseUrl = defaultUrl;
      return _cachedBaseUrl!;
    }

    final prefs = await SharedPreferences.getInstance();
    final savedUrl = prefs.getString('server_url')?.trim();

    // Release Mode handling:
    if (kReleaseMode) {
      if (savedUrl != null && savedUrl.isNotEmpty) {
        // If saved URL is a local development IP leftover from testing, purge it!
        if (isLocalAddress(savedUrl)) {
          debugPrint('[ApiService] Purging stale local development URL from release build: $savedUrl');
          await prefs.remove('server_url');
        } else {
          _cachedBaseUrl = formatServerUrl(savedUrl);
          return _cachedBaseUrl!;
        }
      }
      _cachedBaseUrl = productionApiUrl;
      return _cachedBaseUrl!;
    }

    // Debug / Development Mode handling:
    if (savedUrl != null && savedUrl.isNotEmpty) {
      _cachedBaseUrl = formatServerUrl(savedUrl);
      return _cachedBaseUrl!;
    }

    // Auto-discover the first reachable backend URL among candidates
    final discovered = await autoDiscoverWorkingBaseUrl();
    if (discovered != null && discovered.isNotEmpty) {
      _cachedBaseUrl = discovered;
      return _cachedBaseUrl!;
    }

    final fallbackUrl = defaultUrl;
    _cachedBaseUrl = fallbackUrl;
    return _cachedBaseUrl!;
  }

  static Future<void> setBaseUrl(String url) async {
    var formattedUrl = formatServerUrl(url);

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('server_url', formattedUrl);
    _cachedBaseUrl = formattedUrl;
  }

  /// Fast connectivity probe to test if a candidate backend URL is reachable.
  /// Probes the public endpoint /public/settings (which returns 200 OK without requiring authentication)
  /// and falls back to /health.
  static Future<bool> testConnection(
    String targetUrl, {
    Duration timeout = const Duration(seconds: 4),
  }) async {
    try {
      final formattedUrl = formatServerUrl(targetUrl);

      // Probe 1: Public settings endpoint (guaranteed to be on Express backend)
      try {
        final settingsUri = Uri.parse('$formattedUrl/public/settings');
        final response = await http.get(settingsUri).timeout(timeout);
        if (response.statusCode == 200) {
          return true;
        }
      } catch (_) {}

      // Probe 2: Server health endpoint
      try {
        final baseHost = getHostFromUrl(formattedUrl);
        final healthUri = Uri.parse('$baseHost/health');
        final response = await http.get(healthUri).timeout(timeout);
        if (response.statusCode == 200) {
          return true;
        }
      } catch (_) {}

      return false;
    } catch (_) {
      return false;
    }
  }

  /// Probes candidate URLs and returns the first reachable URL while persisting it in SharedPreferences.
  /// Prioritizes production URL in release mode, and local URLs in debug mode.
  static Future<String?> autoDiscoverWorkingBaseUrl() async {
    if (_isTest) {
      return defaultUrl;
    }
    final prefs = await SharedPreferences.getInstance();
    final savedUrl = prefs.getString('server_url')?.trim();

    final List<String> candidates;
    if (kReleaseMode) {
      candidates = [
        productionApiUrl,
        if (savedUrl != null && savedUrl.isNotEmpty && !isLocalAddress(savedUrl)) savedUrl,
      ];
    } else {
      candidates = [
        if (savedUrl != null && savedUrl.isNotEmpty) savedUrl,
        if (!kIsWeb) 'http://10.0.2.2:5000/api',         // Android Emulator
        if (!kIsWeb) 'http://127.0.0.1:5000/api',        // ADB reverse
        'http://localhost:5000/api',                    // Web / Desktop
        productionApiUrl,                                // Production fallback
      ];
    }

    final uniqueCandidates = candidates.toSet().toList();

    for (final url in uniqueCandidates) {
      final isOk = await testConnection(url);
      if (isOk) {
        await setBaseUrl(url);
        debugPrint('[ApiService] Auto-discovered working server URL: $url');
        return url;
      }
    }
    return null;
  }

  static const _secureStorage = FlutterSecureStorage();

  static Future<String?> getToken() async {
    String? token = await _secureStorage.read(key: 'jwt_token');
    if (token == null || token.isEmpty) {
      final prefs = await SharedPreferences.getInstance();
      token = prefs.getString('jwt_token');
    }
    return token;
  }

  static Future<Map<String, String>> _getHeaders() async {
    String? token = await getToken();
    token ??= '';
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
    if (kDebugMode) {
      final loggedHeaders = Map<String, String>.from(headers);
      if (loggedHeaders.containsKey('Authorization')) {
        loggedHeaders['Authorization'] = 'Bearer [MASKED]';
      }
      debugPrint('[ApiService] Final API request headers: $loggedHeaders');
    }
    return headers;
  }

  static Future<dynamic> get(String endpoint) async {
    if (mockResponses.containsKey(endpoint)) {
      return mockResponses[endpoint];
    }
    if (_isTest) {
      return {'success': false, 'message': 'Mock not found for $endpoint'};
    }
    var baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    var finalApiUrl = '$baseUrl$endpoint';
    debugPrint('[ApiService GET] Final API URL: $finalApiUrl');
    try {
      final response = await http
          .get(Uri.parse(finalApiUrl), headers: headers)
          .timeout(defaultTimeout);
      return _processResponse(response);
    } catch (e) {
      final isNetworkError = e is TimeoutException ||
          e.toString().contains('SocketException') ||
          e.toString().contains('Connection refused') ||
          e.toString().contains('Failed host lookup');

      if (isNetworkError) {
        debugPrint('[ApiService GET Error] Connection failed: $e. Probing fallbacks...');
        final discoveredUrl = await autoDiscoverWorkingBaseUrl();
        if (discoveredUrl != null && discoveredUrl != baseUrl) {
          final retryUrl = '$discoveredUrl$endpoint';
          debugPrint('[ApiService GET] Retrying with auto-discovered URL: $retryUrl');
          final response = await http
              .get(Uri.parse(retryUrl), headers: headers)
              .timeout(defaultTimeout);
          return _processResponse(response);
        }
      }

      if (e is TimeoutException) {
        throw Exception(
          'Server connection timed out ($baseUrl). Please check ⚙ Server Settings.',
        );
      }
      if (e.toString().contains('SocketException') ||
          e.toString().contains('Connection refused') ||
          e.toString().contains('Failed host lookup')) {
        throw Exception(
          'Cannot connect to server at $baseUrl. Please check ⚙ Server Settings.',
        );
      }
      rethrow;
    }
  }

  static Future<dynamic> post(
    String endpoint,
    Map<String, dynamic> body,
  ) async {
    if (mockResponses.containsKey(endpoint)) {
      return mockResponses[endpoint];
    }
    if (_isTest) {
      return {'success': false, 'message': 'Mock not found for $endpoint'};
    }
    var baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    var finalApiUrl = '$baseUrl$endpoint';
    debugPrint('[ApiService POST] Final API URL: $finalApiUrl');
    try {
      final response = await http
          .post(
            Uri.parse(finalApiUrl),
            headers: headers,
            body: jsonEncode(body),
          )
          .timeout(defaultTimeout);
      return _processResponse(response);
    } catch (e) {
      final isNetworkError = e is TimeoutException ||
          e.toString().contains('SocketException') ||
          e.toString().contains('Connection refused') ||
          e.toString().contains('Failed host lookup');

      if (isNetworkError) {
        debugPrint('[ApiService POST Error] Connection failed: $e. Probing fallbacks...');
        final discoveredUrl = await autoDiscoverWorkingBaseUrl();
        if (discoveredUrl != null && discoveredUrl != baseUrl) {
          final retryUrl = '$discoveredUrl$endpoint';
          debugPrint('[ApiService POST] Retrying with auto-discovered URL: $retryUrl');
          final response = await http
              .post(
                Uri.parse(retryUrl),
                headers: headers,
                body: jsonEncode(body),
              )
              .timeout(defaultTimeout);
          return _processResponse(response);
        }
      }

      if (e is TimeoutException) {
        throw Exception(
          'Server connection timed out ($baseUrl). Please check ⚙ Server Settings.',
        );
      }
      if (e.toString().contains('SocketException') ||
          e.toString().contains('Connection refused') ||
          e.toString().contains('Failed host lookup')) {
        throw Exception(
          'Cannot connect to server at $baseUrl. Please check ⚙ Server Settings.',
        );
      }
      rethrow;
    }
  }

  static Future<dynamic> patch(
    String endpoint,
    Map<String, dynamic> body,
  ) async {
    if (mockResponses.containsKey(endpoint)) {
      return mockResponses[endpoint];
    }
    if (_isTest) {
      return {'success': false, 'message': 'Mock not found for $endpoint'};
    }
    var baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    try {
      final response = await http
          .patch(
            Uri.parse('$baseUrl$endpoint'),
            headers: headers,
            body: jsonEncode(body),
          )
          .timeout(defaultTimeout);
      return _processResponse(response);
    } catch (e) {
      final isNetworkError = e is TimeoutException ||
          e.toString().contains('SocketException') ||
          e.toString().contains('Connection refused') ||
          e.toString().contains('Failed host lookup');

      if (isNetworkError) {
        debugPrint('[ApiService PATCH Error] Connection failed: $e. Probing fallbacks...');
        final discoveredUrl = await autoDiscoverWorkingBaseUrl();
        if (discoveredUrl != null && discoveredUrl != baseUrl) {
          final retryUrl = '$discoveredUrl$endpoint';
          debugPrint('[ApiService PATCH] Retrying with auto-discovered URL: $retryUrl');
          final response = await http
              .patch(
                Uri.parse(retryUrl),
                headers: headers,
                body: jsonEncode(body),
              )
              .timeout(defaultTimeout);
          return _processResponse(response);
        }
      }

      if (e is TimeoutException) {
        throw Exception(
          'Server connection timed out ($baseUrl). Please check ⚙ Server Settings.',
        );
      }
      if (e.toString().contains('SocketException') ||
          e.toString().contains('Connection refused') ||
          e.toString().contains('Failed host lookup')) {
        throw Exception(
          'Cannot connect to server at $baseUrl. Please check ⚙ Server Settings.',
        );
      }
      rethrow;
    }
  }

  static Future<dynamic> put(String endpoint, Map<String, dynamic> body) async {
    if (mockResponses.containsKey(endpoint)) {
      return mockResponses[endpoint];
    }
    if (_isTest) {
      return {'success': false, 'message': 'Mock not found for $endpoint'};
    }
    var baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    try {
      final response = await http
          .put(
            Uri.parse('$baseUrl$endpoint'),
            headers: headers,
            body: jsonEncode(body),
          )
          .timeout(defaultTimeout);
      return _processResponse(response);
    } catch (e) {
      final isNetworkError = e is TimeoutException ||
          e.toString().contains('SocketException') ||
          e.toString().contains('Connection refused') ||
          e.toString().contains('Failed host lookup');

      if (isNetworkError) {
        debugPrint('[ApiService PUT Error] Connection failed: $e. Probing fallbacks...');
        final discoveredUrl = await autoDiscoverWorkingBaseUrl();
        if (discoveredUrl != null && discoveredUrl != baseUrl) {
          final retryUrl = '$discoveredUrl$endpoint';
          debugPrint('[ApiService PUT] Retrying with auto-discovered URL: $retryUrl');
          final response = await http
              .put(
                Uri.parse(retryUrl),
                headers: headers,
                body: jsonEncode(body),
              )
              .timeout(defaultTimeout);
          return _processResponse(response);
        }
      }

      if (e is TimeoutException) {
        throw Exception(
          'Server connection timed out ($baseUrl). Please check ⚙ Server Settings.',
        );
      }
      if (e.toString().contains('SocketException') ||
          e.toString().contains('Connection refused') ||
          e.toString().contains('Failed host lookup')) {
        throw Exception(
          'Cannot connect to server at $baseUrl. Please check ⚙ Server Settings.',
        );
      }
      rethrow;
    }
  }

  static Future<dynamic> delete(String endpoint) async {
    if (mockResponses.containsKey(endpoint)) {
      return mockResponses[endpoint];
    }
    if (_isTest) {
      return {'success': false, 'message': 'Mock not found for $endpoint'};
    }
    var baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    try {
      final response = await http
          .delete(
            Uri.parse('$baseUrl$endpoint'),
            headers: headers,
          )
          .timeout(defaultTimeout);
      return _processResponse(response);
    } catch (e) {
      final isNetworkError = e is TimeoutException ||
          e.toString().contains('SocketException') ||
          e.toString().contains('Connection refused') ||
          e.toString().contains('Failed host lookup');

      if (isNetworkError) {
        debugPrint('[ApiService DELETE Error] Connection failed: $e. Probing fallbacks...');
        final discoveredUrl = await autoDiscoverWorkingBaseUrl();
        if (discoveredUrl != null && discoveredUrl != baseUrl) {
          final retryUrl = '$discoveredUrl$endpoint';
          debugPrint('[ApiService DELETE] Retrying with auto-discovered URL: $retryUrl');
          final response = await http
              .delete(
                Uri.parse(retryUrl),
                headers: headers,
              )
              .timeout(defaultTimeout);
          return _processResponse(response);
        }
      }

      if (e is TimeoutException) {
        throw Exception(
          'Server connection timed out ($baseUrl). Please check ⚙ Server Settings.',
        );
      }
      if (e.toString().contains('SocketException') ||
          e.toString().contains('Connection refused') ||
          e.toString().contains('Failed host lookup')) {
        throw Exception(
          'Cannot connect to server at $baseUrl. Please check ⚙ Server Settings.',
        );
      }
      rethrow;
    }
  }

  static Future<dynamic> deleteDriverAccount() async {
    try {
      return await delete('/driver/account');
    } catch (_) {
      return await post('/driver/delete-account', {});
    }
  }

  // Trip Flow API Helpers
  static Future<dynamic> respondToTripAssignment(
    String tripId,
    String action,
  ) async {
    return await post('/driver/trips/$tripId/respond', {'action': action});
  }

  static Future<dynamic> acceptTrip(String tripId) async {
    return await post('/driver/trips/$tripId/accept', {});
  }

  static Future<dynamic> rejectTrip(String tripId, {String? reason}) async {
    return await post('/driver/trips/$tripId/reject', {'reason': reason ?? ''});
  }

  static Future<dynamic> updateTripStatus(String tripId, String status) async {
    return await patch('/driver/trips/$tripId/status', {'status': status});
  }

  static Future<dynamic> endTrip(String tripId) async {
    return await patch('/driver/trips/$tripId/end-trip', {});
  }

  static Future<dynamic> toggleCustomerLocation(
    String tripId, {
    bool reached = true,
  }) async {
    return await patch('/driver/trips/$tripId/customer-location', {
      'reached': reached,
    });
  }

  static Future<dynamic> getCurrentTrip() async {
    return await get('/driver/trips/current');
  }

  static Future<dynamic> getTripDetails(String tripId) async {
    return await get('/driver/trips/$tripId');
  }

  static Future<dynamic> getInvoiceByTripId(String tripId) async {
    return await get('/driver/invoices/trip/$tripId');
  }

  static Future<dynamic> getAssignedVehicle() async {
    return await get('/driver/vehicle');
  }

  static Future<dynamic> getDriverMaintenance() async {
    return await get('/driver/maintenance');
  }

  static Future<dynamic> getDriverNotifications() async {
    return await get('/driver/notifications');
  }

  static Future<dynamic> getDriverFuelRecords() async {
    return await get('/driver/fuel');
  }

  static Future<dynamic> createFuelEntry({
    required String fuelStation,
    required double amount,
    required double liters,
    String? location,
    String? tripId,
    double? odometer,
    String? fuelType,
    String? dateTime,
    String? notes,
    dynamic imageFile,
    String? imageName,
  }) async {
    final baseUrl = await getBaseUrl();
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token') ?? '';
    final uri = Uri.parse('$baseUrl/driver/fuel');

    if (imageFile != null) {
      final request = http.MultipartRequest('POST', uri);
      if (token.isNotEmpty) {
        request.headers['Authorization'] = 'Bearer $token';
      }
      request.fields['fuelStation'] = fuelStation;
      if (location != null && location.isNotEmpty) {
        request.fields['location'] = location;
      }
      request.fields['amount'] = amount.toString();
      request.fields['liters'] = liters.toString();
      if (tripId != null) request.fields['tripId'] = tripId;
      if (odometer != null) request.fields['odometer'] = odometer.toString();
      if (fuelType != null) request.fields['fuelType'] = fuelType;
      if (dateTime != null) request.fields['dateTime'] = dateTime;
      if (notes != null) request.fields['notes'] = notes;

      if (imageFile is String &&
          (imageFile.startsWith('http') || imageFile.startsWith('data:'))) {
        request.fields['billImage'] = imageFile;
      } else if (imageFile is List<int>) {
        request.files.add(
          http.MultipartFile.fromBytes(
            'billImage',
            imageFile,
            filename: imageName ?? 'fuel_receipt.jpg',
          ),
        );
      } else {
        request.files.add(
          await http.MultipartFile.fromPath('billImage', imageFile.toString()),
        );
      }

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);
      return _processResponse(response);
    } else {
      return await post('/driver/fuel', {
        'fuelStation': fuelStation,
        'location': location,
        'amount': amount,
        'liters': liters,
        'tripId': tripId,
        'odometer': odometer,
        'fuelType': fuelType,
        'dateTime': dateTime,
        'notes': notes,
      });
    }
  }

  static Future<dynamic> createTripFuelEntry({
    required String fuelStation,
    required double amount,
    required double liters,
    required double odometer,
    required String tripId,
    required String dateTime,
    dynamic imageFile,
    String? imageName,
  }) async {
    return await createFuelEntry(
      fuelStation: fuelStation,
      amount: amount,
      liters: liters,
      odometer: odometer,
      tripId: tripId,
      dateTime: dateTime,
      imageFile: imageFile,
      imageName: imageName,
    );
  }

  static Future<dynamic> uploadProofOfDelivery({
    required String tripId,
    String? customerName,
    String? receiverName,
    String? customerSignatureUrl,
    String? deliveryPhotoUrl,
    String? podDocumentUrl,
    dynamic fileBytes,
    String? fileName,
  }) async {
    final baseUrl = await getBaseUrl();
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token') ?? '';
    final uri = Uri.parse('$baseUrl/driver/pod');

    if (fileBytes != null) {
      final request = http.MultipartRequest('POST', uri);
      if (token.isNotEmpty) {
        request.headers['Authorization'] = 'Bearer $token';
      }
      request.fields['tripId'] = tripId;
      request.fields['documentType'] = 'proofOfDelivery';
      if (customerName != null) request.fields['customerName'] = customerName;
      if (receiverName != null) request.fields['receiverName'] = receiverName;
      if (customerSignatureUrl != null) {
        request.fields['customerSignatureUrl'] = customerSignatureUrl;
      }

      if (fileBytes is List<int>) {
        request.files.add(
          http.MultipartFile.fromBytes(
            'file',
            fileBytes,
            filename: fileName ?? 'pod_document.jpg',
          ),
        );
      } else if (!kIsWeb) {
        request.files.add(
          await http.MultipartFile.fromPath('file', fileBytes.toString()),
        );
      } else {
        throw Exception('File bytes must be provided for Web uploads.');
      }
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);
      return _processResponse(response);
    }

    final body = <String, dynamic>{
      'tripId': tripId,
      'documentType': 'proofOfDelivery',
    };
    if (customerName != null) body['customerName'] = customerName;
    if (receiverName != null) body['receiverName'] = receiverName;
    if (customerSignatureUrl != null) {
      body['customerSignatureUrl'] = customerSignatureUrl;
    }
    if (deliveryPhotoUrl != null) body['deliveryPhotoUrl'] = deliveryPhotoUrl;
    if (podDocumentUrl != null) body['podDocumentUrl'] = podDocumentUrl;
    return await post('/driver/pod', body);
  }

  static Future<dynamic> uploadTripPod({
    required String tripId,
    String? customerName,
    String? receiverName,
    dynamic imageFile,
    String? imageName,
  }) async {
    return await uploadProofOfDelivery(
      tripId: tripId,
      customerName: customerName,
      receiverName: receiverName,
      fileBytes: imageFile,
      fileName: imageName,
    );
  }

  static Future<dynamic> uploadWeighbridgeSlip({
    required String tripId,
    double? grossWeight,
    double? tareWeight,
    double? netWeight,
    String? location,
    String? documentUrl,
    dynamic fileBytes,
    String? fileName,
    dynamic imageFile,
    String? imageName,
  }) async {
    final baseUrl = await getBaseUrl();
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token') ?? '';
    final uri = Uri.parse('$baseUrl/driver/weighbridge');

    final uploadFile = imageFile ?? fileBytes;
    final uploadFileName = imageName ?? fileName;

    if (uploadFile != null) {
      final request = http.MultipartRequest('POST', uri);
      if (token.isNotEmpty) {
        request.headers['Authorization'] = 'Bearer $token';
      }
      request.fields['tripId'] = tripId;
      request.fields['documentType'] = 'weighbridgeSlip';
      if (grossWeight != null) {
        request.fields['grossWeight'] = grossWeight.toString();
      }
      if (tareWeight != null) {
        request.fields['tareWeight'] = tareWeight.toString();
      }
      if (netWeight != null) request.fields['netWeight'] = netWeight.toString();
      if (location != null) request.fields['location'] = location;

      if (uploadFile is List<int>) {
        request.files.add(
          http.MultipartFile.fromBytes(
            'file',
            uploadFile,
            filename: uploadFileName ?? 'weighbridge_slip.jpg',
          ),
        );
      } else if (!kIsWeb) {
        request.files.add(
          await http.MultipartFile.fromPath('file', uploadFile.toString()),
        );
      } else {
        throw Exception('File bytes must be provided for Web uploads.');
      }
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);
      return _processResponse(response);
    }

    final body = <String, dynamic>{
      'tripId': tripId,
      'documentType': 'weighbridgeSlip',
    };
    if (grossWeight != null) body['grossWeight'] = grossWeight;
    if (tareWeight != null) body['tareWeight'] = tareWeight;
    if (netWeight != null) body['netWeight'] = netWeight;
    if (location != null) body['location'] = location;
    if (documentUrl != null) body['documentUrl'] = documentUrl;
    return await post('/driver/weighbridge', body);
  }

  static Future<dynamic> getDriverTripTolls(String tripId) async {
    return await get('/driver/trips/$tripId/tolls');
  }

  static Future<dynamic> createTripTollEntry({
    required String tollPlazaName,
    required double amountPaid,
    required String tripId,
    required String dateTime,
    required List<dynamic> imageFiles,
    required List<String> imageNames,
  }) async {
    final baseUrl = await getBaseUrl();
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token') ?? '';
    final uri = Uri.parse('$baseUrl/driver/tolls');

    if (imageFiles.isNotEmpty) {
      final request = http.MultipartRequest('POST', uri);
      if (token.isNotEmpty) {
        request.headers['Authorization'] = 'Bearer $token';
      }
      request.fields['tollPlazaName'] = tollPlazaName;
      request.fields['amountPaid'] = amountPaid.toString();
      request.fields['amount'] = amountPaid.toString();
      request.fields['tripId'] = tripId;
      request.fields['dateTime'] = dateTime;

      for (int i = 0; i < imageFiles.length; i++) {
        final fileData = imageFiles[i];
        final fileName = imageNames[i];
        if (fileData is List<int>) {
          request.files.add(
            http.MultipartFile.fromBytes('files', fileData, filename: fileName),
          );
        } else {
          request.files.add(
            await http.MultipartFile.fromPath('files', fileData.toString()),
          );
        }
      }

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);
      return _processResponse(response);
    } else {
      return await post('/driver/tolls', {
        'tollPlazaName': tollPlazaName,
        'amountPaid': amountPaid,
        'amount': amountPaid,
        'tripId': tripId,
        'dateTime': dateTime,
      });
    }
  }

  static Future<dynamic> createSupportTicket({
    required String category,
    required String priority,
    required String subject,
    required String description,
    dynamic imageFile,
    String? imageName,
  }) async {
    final baseUrl = await getBaseUrl();
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token') ?? '';
    final uri = Uri.parse('$baseUrl/driver/tickets');

    if (imageFile != null) {
      final request = http.MultipartRequest('POST', uri);
      if (token.isNotEmpty) {
        request.headers['Authorization'] = 'Bearer $token';
      }
      request.fields['category'] = category;
      request.fields['issueType'] = category;
      request.fields['severity'] = priority;
      request.fields['subject'] = subject;
      request.fields['description'] = description;

      if (imageFile is String &&
          (imageFile.startsWith('http') || imageFile.startsWith('data:'))) {
        request.fields['imageUrl'] = imageFile;
      } else if (imageFile is List<int>) {
        request.files.add(
          http.MultipartFile.fromBytes(
            'file',
            imageFile,
            filename: imageName ?? 'ticket_photo.jpg',
          ),
        );
      } else {
        request.files.add(
          await http.MultipartFile.fromPath('file', imageFile.toString()),
        );
      }

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);
      return _processResponse(response);
    } else {
      return await post('/driver/tickets', {
        'category': category,
        'issueType': category,
        'severity': priority,
        'subject': subject,
        'description': description,
      });
    }
  }

  static Future<dynamic> createDriverTicket({
    required String category,
    required String priority,
    required String subject,
    required String description,
    dynamic imageFile,
    String? imageName,
  }) async {
    return await createSupportTicket(
      category: category,
      priority: priority,
      subject: subject,
      description: description,
      imageFile: imageFile,
      imageName: imageName,
    );
  }

  static Future<dynamic> getDriverTickets() async {
    return await get('/driver/tickets');
  }

  static Future<dynamic> getDriverTicketById(String id) async {
    return await get('/driver/tickets/$id');
  }

  static Future<dynamic> updateDriverTicketStatus(
    String id,
    String status, {
    String? notes,
  }) async {
    final Map<String, dynamic> body = {'status': status};
    if (notes != null) body['notes'] = notes;
    return await patch('/driver/tickets/$id/status', body);
  }

  static dynamic _processResponse(http.Response response) {
    if (response.statusCode == 401) {
      onUnauthorized?.call();
    }
    final body = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    } else {
      throw Exception(
        body['message'] ?? 'API Request Failed (${response.statusCode})',
      );
    }
  }
}
