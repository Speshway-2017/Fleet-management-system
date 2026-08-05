import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static void Function()? onUnauthorized;
  static Map<String, dynamic> mockResponses = {};

  static const String defaultLocalIp = '10.86.34.1';
  static String? _cachedBaseUrl;

  static Future<void> initialize() async {
    await getBaseUrl();
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
      final response = await http.get(Uri.parse('$baseUrl$endpoint'), headers: headers).timeout(const Duration(seconds: 10));
      return _processResponse(response);
    } catch (e) {
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
    if (mockResponses.containsKey(endpoint)) {
      return mockResponses[endpoint];
    }
    final baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    try {
      final response = await http.post(Uri.parse('$baseUrl$endpoint'), headers: headers, body: jsonEncode(body)).timeout(const Duration(seconds: 10));
      return _processResponse(response);
    } catch (e) {
      if (_cachedBaseUrl == 'http://$defaultLocalIp:5000/api') {
        try {
          final fallbackUrl = 'http://127.0.0.1:5000/api';
          final response = await http.post(Uri.parse('$fallbackUrl$endpoint'), headers: headers, body: jsonEncode(body)).timeout(const Duration(seconds: 5));
          _cachedBaseUrl = fallbackUrl;
          return _processResponse(response);
        } catch (_) {}
      }
      rethrow;
    }
  }

  static Future<dynamic> patch(String endpoint, Map<String, dynamic> body) async {
    if (mockResponses.containsKey(endpoint)) {
      return mockResponses[endpoint];
    }
    final baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    final response = await http.patch(Uri.parse('$baseUrl$endpoint'), headers: headers, body: jsonEncode(body)).timeout(const Duration(seconds: 10));
    return _processResponse(response);
  }

  static Future<dynamic> put(String endpoint, Map<String, dynamic> body) async {
    if (mockResponses.containsKey(endpoint)) {
      return mockResponses[endpoint];
    }
    final baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    final response = await http.put(Uri.parse('$baseUrl$endpoint'), headers: headers, body: jsonEncode(body)).timeout(const Duration(seconds: 10));
    return _processResponse(response);
  }

  // --- Driver Domain API Endpoints ---

  static Future<dynamic> getCurrentTrip() async {
    return await get('/driver/trips/current');
  }

  static Future<dynamic> getTripDetails(String tripId) async {
    return await get('/driver/trips/$tripId');
  }

  static Future<dynamic> acceptTrip(String tripId) async {
    return await post('/driver/trips/$tripId/accept', {});
  }

  static Future<dynamic> rejectTrip(String tripId, {String? reason}) async {
    return await post('/driver/trips/$tripId/reject', {'reason': reason ?? 'Driver rejected trip'});
  }

  static Future<dynamic> respondToTripAssignment(String tripId, String action) async {
    if (action.toLowerCase() == 'accept') {
      return await acceptTrip(tripId);
    } else {
      return await rejectTrip(tripId);
    }
  }

  static Future<dynamic> updateTripStatus(String tripId, String status) async {
    return await patch('/driver/trips/$tripId/status', {'status': status});
  }

  static Future<dynamic> toggleCustomerLocation(String tripId, {bool reached = true}) async {
    return await patch('/driver/trips/$tripId/customer-location', {'reached': reached});
  }

  static Future<dynamic> endTrip(String tripId) async {
    try {
      return await patch('/driver/trips/$tripId/end-trip', {});
    } catch (_) {
      try {
        return await post('/driver/trips/$tripId/end-trip', {});
      } catch (_) {
        return await patch('/driver/trips/$tripId/customer-location', {'reached': true});
      }
    }
  }

  static Future<dynamic> getAssignedVehicle() async {
    return await get('/driver/vehicle');
  }

  static Future<dynamic> createFuelEntry({
    String? fuelStation,
    String? station,
    double? amount,
    double? cost,
    double? liters,
    double? quantity,
    String? tripId,
    double? odometer,
    String? fuelType,
    dynamic dateTime,
    String? notes,
    dynamic imageFile,
    dynamic imageName,
  }) async {
    final Map<String, dynamic> body = {
      'station': fuelStation ?? station ?? 'Gas Station',
      'cost': amount ?? cost ?? 0.0,
      'liters': liters ?? quantity ?? 0.0,
    };
    if (tripId != null) body['tripId'] = tripId;
    if (odometer != null) body['odometer'] = odometer;
    if (fuelType != null) body['fuelType'] = fuelType;
    if (notes != null) body['notes'] = notes;
    return await post('/driver/fuel', body);
  }

  static Future<dynamic> createTripFuelEntry({
    required String tripId,
    String? fuelStation,
    String? station,
    double? amount,
    double? cost,
    double? liters,
    double? quantity,
    String? fuelType,
    String? paymentMode,
    double? odometer,
    String? notes,
    dynamic receiptImage,
    dynamic imageFile,
    dynamic imageName,
    dynamic dateTime,
  }) async {
    return await createFuelEntry(
      tripId: tripId,
      fuelStation: fuelStation,
      station: station,
      amount: amount,
      cost: cost,
      liters: liters,
      quantity: quantity,
      fuelType: fuelType,
      notes: notes,
      imageFile: imageFile,
      imageName: imageName,
      dateTime: dateTime,
    );
  }

  static Future<dynamic> getDriverFuelRecords() async {
    return await get('/driver/fuel');
  }

  static Future<dynamic> getInvoiceByTripId(String tripId) async {
    return await get('/driver/invoices/trip/$tripId');
  }

  static Future<dynamic> getDriverInvoiceByTripId(String tripId) async {
    return await get('/driver/invoices/trip/$tripId');
  }

  static Future<dynamic> getDriverNotifications() async {
    return await get('/driver/notifications');
  }

  static Future<dynamic> markNotificationAsRead(String id) async {
    return await patch('/driver/notifications/$id/read', {});
  }

  static Future<dynamic> markAllNotificationsAsRead() async {
    return await patch('/driver/notifications/read-all', {});
  }

  static Future<dynamic> createDriverTicket({
    dynamic category,
    dynamic priority,
    dynamic subject,
    dynamic description,
    dynamic imageFile,
    dynamic imageName,
  }) async {
    return await post('/driver/tickets', {
      'category': category,
      'severity': priority,
      'subject': subject,
      'description': description,
    });
  }

  static Future<dynamic> getDriverTickets() async {
    return await get('/driver/tickets');
  }

  static Future<dynamic> getDriverTicketById(String id) async {
    return await get('/driver/tickets/$id');
  }

  static Future<dynamic> updateDriverTicketStatus(String id, String status, {String? notes}) async {
    final Map<String, dynamic> body = {'status': status};
    if (notes != null) body['notes'] = notes;
    return await patch('/driver/tickets/$id/status', body);
  }

  static Future<dynamic> getDriverTripTolls(String tripId) async {
    return await get('/driver/trips/$tripId/tolls');
  }

  static Future<dynamic> createTripTollEntry({
    required String tripId,
    String? tollPlazaName,
    double? amount,
    double? amountPaid,
    String? paymentMethod,
    dynamic dateTime,
    dynamic imageFiles,
    dynamic imageNames,
  }) async {
    final name = tollPlazaName ?? 'Toll Plaza';
    final amt = amount ?? amountPaid ?? 0.0;
    final Map<String, dynamic> body = {
      'tripId': tripId,
      'tollPlazaName': name,
      'amount': amt,
    };
    if (paymentMethod != null) body['paymentMethod'] = paymentMethod;
    return await post('/driver/tolls', body);
  }

  static Future<dynamic> uploadProofOfDelivery({
    required String tripId,
    String? customerName,
    String? receiverName,
    String? customerSignatureUrl,
    String? deliveryPhotoUrl,
    String? podDocumentUrl,
    dynamic imageFile,
    dynamic imageName,
    dynamic fileBytes,
    dynamic fileName,
  }) async {
    return await post('/driver/pod', {
      'tripId': tripId,
      'customerName': customerName ?? 'Customer',
      'receiverName': receiverName ?? 'Receiver',
      'customerSignatureUrl': customerSignatureUrl,
      'deliveryPhotoUrl': deliveryPhotoUrl,
      'podDocumentUrl': podDocumentUrl,
    });
  }

  static Future<dynamic> uploadTripPod({
    required String tripId,
    String? customerName,
    String? receiverName,
    String? customerSignatureUrl,
    String? deliveryPhotoUrl,
    String? podDocumentUrl,
    dynamic imageFile,
    dynamic imageName,
    dynamic fileBytes,
    dynamic fileName,
  }) async {
    return await uploadProofOfDelivery(
      tripId: tripId,
      customerName: customerName,
      receiverName: receiverName,
      customerSignatureUrl: customerSignatureUrl,
      deliveryPhotoUrl: deliveryPhotoUrl,
      podDocumentUrl: podDocumentUrl,
      imageFile: imageFile,
      imageName: imageName,
      fileBytes: fileBytes,
      fileName: fileName,
    );
  }

  static Future<dynamic> uploadWeighbridgeSlip({
    required String tripId,
    double? grossWeight,
    double? tareWeight,
    double? netWeight,
    String? location,
    String? documentUrl,
    dynamic imageFile,
    dynamic imageName,
    dynamic fileBytes,
    dynamic fileName,
  }) async {
    final Map<String, dynamic> body = {
      'tripId': tripId,
      'grossWeight': grossWeight ?? 0.0,
      'tareWeight': tareWeight ?? 0.0,
      'netWeight': netWeight ?? 0.0,
    };
    if (location != null) body['location'] = location;
    if (documentUrl != null) body['documentUrl'] = documentUrl;
    return await post('/driver/weighbridge', body);
  }

  static Future<dynamic> getDriverMaintenance() async {
    return await get('/driver/maintenance');
  }

  static dynamic _processResponse(http.Response response) {
    if (response.statusCode == 401) {
      onUnauthorized?.call();
    }
    final body = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    } else {
      if (response.statusCode == 401) {
        onUnauthorized?.call();
      }
      throw Exception(body['message'] ?? 'API Request Failed (${response.statusCode})');
    }
  }
}
