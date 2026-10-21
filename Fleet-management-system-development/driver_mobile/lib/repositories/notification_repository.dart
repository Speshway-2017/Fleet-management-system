import '../services/api_service.dart';
import '../models/notification_model.dart';

class NotificationRepository {
  Future<List<NotificationModel>> fetchNotifications() async {
    final response = await ApiService.get('/driver/notifications');
    if (response['success'] == true && response['data'] != null) {
      final List list = response['data'];
      return list.map((json) => NotificationModel.fromJson(json)).toList();
    } else {
      throw Exception(response['message'] ?? 'Failed to load notifications');
    }
  }

  Future<void> markAsRead(String id) async {
    final response = await ApiService.patch('/driver/notifications/$id/read', {});
    if (response['success'] != true) {
      throw Exception(response['message'] ?? 'Failed to mark notification as read');
    }
  }

  Future<void> markAllAsRead() async {
    final response = await ApiService.patch('/driver/notifications/read-all', {});
    if (response['success'] != true) {
      throw Exception(response['message'] ?? 'Failed to mark all notifications as read');
    }
  }
}
