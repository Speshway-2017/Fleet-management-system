import 'dart:convert';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/notification_provider.dart';
import '../screens/main_navigation_screen.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('Handling background message: ${message.messageId}');
}

class FcmService {
  static bool _isInitialized = false;
  static final FlutterLocalNotificationsPlugin _flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  static const AndroidNotificationChannel _channel = AndroidNotificationChannel(
    'high_importance_channel',
    'High Importance Notifications',
    description: 'This channel is used for important notifications.',
    importance: Importance.max,
    playSound: true,
    enableVibration: true,
  );

  static Future<void> initialize(BuildContext context) async {
    if (_isInitialized) return;
    _isInitialized = true;

    try {
      final messaging = FirebaseMessaging.instance;

      // 1. Request Firebase notification permission (iOS primarily)
      final settings = await messaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );
      debugPrint('User granted permission: ${settings.authorizationStatus}');

      // 2. Initialize Flutter Local Notifications for Android
      const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
      const initSettings = InitializationSettings(android: androidInit);
      
      await _flutterLocalNotificationsPlugin.initialize(
        initSettings,
        onDidReceiveNotificationResponse: (NotificationResponse response) {
          if (response.payload != null && context.mounted) {
            try {
              final Map<String, dynamic> data = jsonDecode(response.payload!);
              final message = RemoteMessage(data: data);
              _handleNotificationTap(context, message);
            } catch (e) {
              debugPrint('Error handling local notification tap: $e');
            }
          }
        },
      );

      // Create Android high-importance channel
      final androidPlugin = _flutterLocalNotificationsPlugin
          .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
      
      if (androidPlugin != null) {
        await androidPlugin.createNotificationChannel(_channel);
        // Request runtime permission for Android 13+
        await androidPlugin.requestNotificationsPermission();
      }

      // 3. Setup Firebase background message handler
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

      // 4. Register FCM Token with backend
      if (context.mounted) {
        await registerToken(context);
      }

      // 5. Token Refresh Listener
      messaging.onTokenRefresh.listen((token) async {
        debugPrint('FCM Token Refreshed: $token');
        if (!context.mounted) return;
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        if (authProvider.isAuthenticated) {
          await authProvider.updateProfile({'fcmToken': token});
        }
      });

      // 6. Handle Foreground Messages (FCM)
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint('Got a message in the foreground!');
        if (!context.mounted) return;

        if (message.notification != null) {
          final notification = message.notification!;
          
          // Present native system notification when in foreground
          _flutterLocalNotificationsPlugin.show(
            notification.hashCode,
            notification.title,
            notification.body,
            NotificationDetails(
              android: AndroidNotificationDetails(
                _channel.id,
                _channel.name,
                channelDescription: _channel.description,
                importance: Importance.max,
                priority: Priority.high,
                icon: '@mipmap/ic_launcher',
                playSound: true,
                enableVibration: true,
              ),
            ),
            payload: jsonEncode(message.data),
          );

          // Auto-refresh notifications list
          Provider.of<NotificationProvider>(context, listen: false).fetchNotifications();
        }
      });

      // 7. Handle Notification Clicks (When app is running in background)
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        debugPrint('A new onMessageOpenedApp event was published!');
        if (!context.mounted) return;
        _handleNotificationTap(context, message);
      });

      // 8. Handle Notification Clicks (When app is completely terminated)
      messaging.getInitialMessage().then((RemoteMessage? message) {
        if (message != null && context.mounted) {
          debugPrint('App opened from terminated state by notification');
          _handleNotificationTap(context, message);
        }
      });

    } catch (e) {
      debugPrint('FCM initialization error: $e');
    }
  }

  static Future<void> registerToken(BuildContext context) async {
    try {
      final messaging = FirebaseMessaging.instance;
      final token = await messaging.getToken();
      debugPrint('FCM Token: $token');

      if (token != null && context.mounted) {
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        if (authProvider.isAuthenticated) {
          await authProvider.updateProfile({'fcmToken': token});
        }
      }
    } catch (e) {
      debugPrint('Error registering FCM token: $e');
    }
  }

  static void _handleNotificationTap(BuildContext context, RemoteMessage message) {
    // Navigate to Notifications tab index 3
    MainNavigationScreen.selectedTabNotifier.value = 3;
    // Pop any active sub-screens/details screens
    Navigator.of(context).popUntil((route) => route.isFirst);
    // Refresh the notifications feed
    Provider.of<NotificationProvider>(context, listen: false).fetchNotifications();
  }
}
