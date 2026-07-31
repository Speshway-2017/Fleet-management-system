import 'package:flutter/foundation.dart';
import '../models/notification_model.dart';
import '../repositories/notification_repository.dart';

class NotificationProvider with ChangeNotifier {
  final _repository = NotificationRepository();

  List<NotificationModel> _notifications = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<NotificationModel> get notifications => _notifications;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  int get unreadCount => _notifications.where((n) => !n.isRead).length;

  Future<void> fetchNotifications() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _notifications = await _repository.fetchNotifications();
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> markAsRead(String id) async {
    // Optimistic update
    final index = _notifications.indexWhere((n) => n.id == id);
    if (index == -1 || _notifications[index].isRead) return;

    final original = _notifications[index];
    _notifications[index] = NotificationModel(
      id: original.id,
      title: original.title,
      description: original.description,
      type: original.type,
      isRead: true,
      priority: original.priority,
      createdAt: original.createdAt,
    );
    notifyListeners();

    try {
      await _repository.markAsRead(id);
    } catch (_) {
      // Revert on failure
      _notifications[index] = original;
      notifyListeners();
    }
  }

  Future<void> markAllAsRead() async {
    final originalList = List<NotificationModel>.from(_notifications);
    
    // Optimistic update
    _notifications = _notifications.map((n) {
      return NotificationModel(
        id: n.id,
        title: n.title,
        description: n.description,
        type: n.type,
        isRead: true,
        priority: n.priority,
        createdAt: n.createdAt,
      );
    }).toList();
    notifyListeners();

    try {
      await _repository.markAllAsRead();
    } catch (_) {
      // Revert on failure
      _notifications = originalList;
      notifyListeners();
    }
  }
}
