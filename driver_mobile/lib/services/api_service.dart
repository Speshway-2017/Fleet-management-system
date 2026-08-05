import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static Function()? onUnauthorized;
  static Map<String, dynamic> mockResponses = {};

  static void initialize() {
    // Initialization setup if required
  }

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
    if (!formattedUrl.startsWith('http://') &&
        !formattedUrl.startsWith('https://')) {
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
      if (!formattedUrl.startsWith('http://') &&
          !formattedUrl.startsWith('https://')) {
        formattedUrl = 'http://$formattedUrl';
      }
      final healthUri = Uri.parse(
        '${formattedUrl.replaceAll('/api', '')}/health',
      );
      final response = await http
          .get(healthUri)
          .timeout(const Duration(seconds: 4));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  static const _secureStorage = FlutterSecureStorage();

  static Future<Map<String, String>> _getHeaders() async {
    String? token = await _secureStorage.read(key: 'jwt_token');
    if (token == null || token.isEmpty) {
      final prefs = await SharedPreferences.getInstance();
      token = prefs.getString('jwt_token') ?? '';
    }
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  static Future<dynamic> get(String endpoint) async {
    if (mockResponses.containsKey(endpoint)) {
      return mockResponses[endpoint];
    }
    final baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    try {
      final response = await http
          .get(Uri.parse('$baseUrl$endpoint'), headers: headers)
          .timeout(const Duration(seconds: 10));
      return _processResponse(response);
    } catch (e) {
      // If primary IP fails and we haven't set custom URL, try 127.0.0.1 / localhost as fallback
      if (_cachedBaseUrl == 'http://$defaultLocalIp:5000/api') {
        try {
          final fallbackUrl = 'http://127.0.0.1:5000/api';
          final response = await http
              .get(Uri.parse('$fallbackUrl$endpoint'), headers: headers)
              .timeout(const Duration(seconds: 5));
          _cachedBaseUrl = fallbackUrl;
          return _processResponse(response);
        } catch (_) {}
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
    final baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl$endpoint'),
            headers: headers,
            body: jsonEncode(body),
          )
          .timeout(const Duration(seconds: 10));
      return _processResponse(response);
    } catch (e) {
      // Fallback try for physical devices connected via ADB USB reverse
      if (_cachedBaseUrl == 'http://$defaultLocalIp:5000/api') {
        try {
          final fallbackUrl = 'http://127.0.0.1:5000/api';
          final response = await http
              .post(
                Uri.parse('$fallbackUrl$endpoint'),
                headers: headers,
                body: jsonEncode(body),
              )
              .timeout(const Duration(seconds: 5));
          _cachedBaseUrl = fallbackUrl;
          return _processResponse(response);
        } catch (_) {}
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
    final baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    final response = await http
        .patch(
          Uri.parse('$baseUrl$endpoint'),
          headers: headers,
          body: jsonEncode(body),
        )
        .timeout(const Duration(seconds: 10));
    return _processResponse(response);
  }

  static Future<dynamic> put(String endpoint, Map<String, dynamic> body) async {
    if (mockResponses.containsKey(endpoint)) {
      return mockResponses[endpoint];
    }
    final baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    final response = await http
        .put(
          Uri.parse('$baseUrl$endpoint'),
          headers: headers,
          body: jsonEncode(body),
        )
        .timeout(const Duration(seconds: 10));
    return _processResponse(response);
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

  static Future<dynamic> getDriverFuelRecords() async {
    return await get('/driver/fuel');
  }

  static Future<dynamic> createFuelEntry({
    required String fuelStation,
    required double amount,
    required double liters,
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
      request.fields['amount'] = amount.toString();
      request.fields['liters'] = liters.toString();
      if (tripId != null) request.fields['tripId'] = tripId;
      if (odometer != null) request.fields['odometer'] = odometer.toString();
      if (fuelType != null) request.fields['fuelType'] = fuelType;
      if (dateTime != null) request.fields['dateTime'] = dateTime;
      if (notes != null) request.fields['notes'] = notes;

      if (imageFile is String &&
          (imageFile.startsWith('http') || imageFile.startsWith('data:'))) {
        request.fields['receiptImage'] = imageFile;
      } else if (imageFile is List<int>) {
        request.files.add(
          http.MultipartFile.fromBytes(
            'file',
            imageFile,
            filename: imageName ?? 'receipt.jpg',
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
      final Map<String, dynamic> body = {
        'fuelStation': fuelStation,
        'amount': amount,
        'liters': liters,
      };
      if (tripId != null) body['tripId'] = tripId;
      if (odometer != null) body['odometer'] = odometer;
      if (fuelType != null) body['fuelType'] = fuelType;
      if (dateTime != null) body['dateTime'] = dateTime;
      if (notes != null) body['notes'] = notes;
      return await post('/driver/fuel', body);
    }
  }

  static Future<dynamic> getDriverDashboard() async {
    return await get('/driver/dashboard');
  }

  static Future<dynamic> getDriverNotifications() async {
    return await get('/driver/notifications');
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
      if (customerSignatureUrl != null) request.fields['customerSignatureUrl'] = customerSignatureUrl;

      if (fileBytes is List<int>) {
        request.files.add(
          http.MultipartFile.fromBytes(
            'file',
            fileBytes,
            filename: fileName ?? 'pod_document.pdf',
          ),
        );
      } else {
        request.files.add(
          await http.MultipartFile.fromPath('file', fileBytes.toString()),
        );
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
    if (customerSignatureUrl != null) body['customerSignatureUrl'] = customerSignatureUrl;
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
      if (grossWeight != null) request.fields['grossWeight'] = grossWeight.toString();
      if (tareWeight != null) request.fields['tareWeight'] = tareWeight.toString();
      if (netWeight != null) request.fields['netWeight'] = netWeight.toString();
      if (location != null) request.fields['location'] = location;

      if (uploadFile is List<int>) {
        request.files.add(
          http.MultipartFile.fromBytes(
            'file',
            uploadFile,
            filename: uploadFileName ?? 'weighbridge_slip.pdf',
          ),
        );
      } else {
        request.files.add(
          await http.MultipartFile.fromPath('file', uploadFile.toString()),
        );
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
            http.MultipartFile.fromBytes(
              'files',
              fileData,
              filename: fileName,
            ),
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
      request.fields['amount'] = amount.toString();
      request.fields['liters'] = liters.toString();
      request.fields['odometer'] = odometer.toString();
      request.fields['tripId'] = tripId;
      request.fields['dateTime'] = dateTime;

      if (imageFile is List<int>) {
        request.files.add(
          http.MultipartFile.fromBytes(
            'file',
            imageFile,
            filename: imageName ?? 'fuel_receipt.jpg',
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
      return await post('/driver/fuel', {
        'fuelStation': fuelStation,
        'amount': amount,
        'liters': liters,
        'odometer': odometer,
        'tripId': tripId,
        'dateTime': dateTime,
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
