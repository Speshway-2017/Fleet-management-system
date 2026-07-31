import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'api_service.dart';

class SocketService {
  static IO.Socket? _socket;
  static final List<Function(Map<String, dynamic>)> _notificationListeners = [];

  static bool get isConnected => _socket != null && _socket!.connected;

  static Future<void> connect(String driverId) async {
    if (_socket != null) {
      disconnect();
    }

    try {
      final apiUrl = await ApiService.getBaseUrl();
      final socketUrl = apiUrl.replaceAll('/api', '');

      debugPrint('Connecting to Socket.IO at $socketUrl for driver $driverId');

      _socket = IO.io(socketUrl, IO.OptionBuilder()
        .setTransports(['websocket', 'polling'])
        .enableForceNew()
        .build());

      _socket!.onConnect((_) {
        debugPrint('Socket.IO Connected successfully');
        _socket!.emit('joinDriverRoom', driverId);
      });

      _socket!.onDisconnect((_) {
        debugPrint('Socket.IO Disconnected');
      });

      _socket!.onConnectError((data) {
        debugPrint('Socket.IO Connect Error: $data');
      });

      _socket!.onError((data) {
        debugPrint('Socket.IO Error: $data');
      });

      // Listen for notifications
      _socket!.on('notification:new', (data) {
        debugPrint('Received new notification via socket: $data');
        final Map<String, dynamic> notification = Map<String, dynamic>.from(data);
        for (final listener in _notificationListeners) {
          try {
            listener(notification);
          } catch (e) {
            debugPrint('Error executing notification listener: $e');
          }
        }
      });

      _socket!.connect();
    } catch (e) {
      debugPrint('Error setting up socket: $e');
    }
  }

  static void disconnect() {
    if (_socket != null) {
      _socket!.disconnect();
      _socket!.dispose();
      _socket = null;
      debugPrint('Socket.IO Disposed');
    }
  }

  static void addNotificationListener(Function(Map<String, dynamic>) listener) {
    if (!_notificationListeners.contains(listener)) {
      _notificationListeners.add(listener);
    }
  }

  static void removeNotificationListener(Function(Map<String, dynamic>) listener) {
    _notificationListeners.remove(listener);
  }
}
