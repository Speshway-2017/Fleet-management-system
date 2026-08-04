import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class SocketService {
  static io.Socket? _socket;
  static bool _isConnected = false;
  static final Map<String, List<Function(dynamic)>> _listeners = {};

  static bool get _isTest {
    if (kIsWeb) return false;
    try {
      return Platform.environment.containsKey('FLUTTER_TEST');
    } catch (_) {
      return false;
    }
  }

  static bool get isConnected => _isConnected;

  static Future<void> connect([String? driverId]) async {
    if (driverId != null && driverId.isNotEmpty) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('driver_id', driverId);
    }
    await initSocket();
  }

  static Future<void> initSocket({Function(dynamic data)? onTripStatusUpdated, Function(dynamic data)? onTripAssigned}) async {
    if (_isTest) return;
    if (_socket != null && _socket!.connected) return;

    try {
      final baseUrl = await ApiService.getBaseUrl();
      // Remove /api suffix to get base server URL for socket
      final serverUrl = baseUrl.replaceAll('/api', '');

      final prefs = await SharedPreferences.getInstance();
      final driverId = prefs.getString('driver_id') ?? '';
      final token = prefs.getString('jwt_token') ?? '';

      _socket = io.io(
        serverUrl,
        io.OptionBuilder()
            .setTransports(['websocket', 'polling'])
            .disableAutoConnect()
            .setAuth({'token': token})
            .build(),
      );

      _socket!.connect();

      _socket!.onConnect((_) {
        debugPrint('🔌 Socket connected to server at $serverUrl');
        _isConnected = true;
        if (driverId.isNotEmpty) {
          _socket!.emit('joinRoleRoom', 'DRIVER');
          _socket!.emit('joinDriverRoom', driverId);
        }
      });

      _socket!.onDisconnect((_) {
        debugPrint('🔌 Socket disconnected');
        _isConnected = false;
      });

      // Register all queued event listeners on the newly created socket
      _listeners.forEach((event, callbacks) {
        for (final callback in callbacks) {
          _socket!.on(event, (data) => callback(data));
        }
      });

      if (onTripStatusUpdated != null) {
        _socket!.on('trip:status-updated', (data) {
          onTripStatusUpdated(data);
        });
      }

      if (onTripAssigned != null) {
        _socket!.on('trip:assigned', (data) {
          onTripAssigned(data);
        });
      }
    } catch (e) {
      debugPrint('Socket initialization error: $e');
    }
  }

  static void onEvent(String event, Function(dynamic data) callback) {
    final list = _listeners.putIfAbsent(event, () => []);
    if (!list.contains(callback)) {
      list.add(callback);
    }
    if (_socket != null) {
      _socket!.on(event, (data) => callback(data));
    }
  }

  static void emitEvent(String event, dynamic data) {
    if (_socket != null && _socket!.connected) {
      _socket!.emit(event, data);
    }
  }

  static void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _isConnected = false;
    _listeners.clear();
  }
}
