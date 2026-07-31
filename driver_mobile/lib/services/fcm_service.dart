import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
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

  static Future<void> initialize(BuildContext context) async {
    if (_isInitialized) return;
    _isInitialized = true;

    try {
      final messaging = FirebaseMessaging.instance;

      // 1. Request notification permission
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

      // 2. Setup background message handler
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

      // 3. Register token with backend
      if (context.mounted) {
        await registerToken(context);
      }

      // 4. Token Refresh Listener
      messaging.onTokenRefresh.listen((token) async {
        debugPrint('FCM Token Refreshed: $token');
        if (!context.mounted) return;
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        if (authProvider.isAuthenticated) {
          await authProvider.updateProfile({'fcmToken': token});
        }
      });

      // 5. Handle Foreground Messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint('Got a message in the foreground!');
        if (!context.mounted) return;

        if (message.notification != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    message.notification!.title ?? 'New Notification',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Text(message.notification!.body ?? ''),
                ],
              ),
              action: SnackBarAction(
                label: 'View',
                onPressed: () {
                  _handleNotificationTap(context, message);
                },
              ),
              behavior: SnackBarBehavior.floating,
            ),
          );

          // Auto-refresh notifications list
          Provider.of<NotificationProvider>(context, listen: false).fetchNotifications();
        }
      });

      // 6. Handle Notification Clicks (When app is running in background)
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        debugPrint('A new onMessageOpenedApp event was published!');
        if (!context.mounted) return;
        _handleNotificationTap(context, message);
      });

      // 7. Handle Notification Clicks (When app is completely terminated)
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
