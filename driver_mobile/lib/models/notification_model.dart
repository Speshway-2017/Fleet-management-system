import 'package:flutter/material.dart';

class NotificationModel {
  final String id;
  final String title;
  final String description;
  final String type;
  final bool isRead;
  final String priority;
  final String createdAt;

  NotificationModel({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.isRead,
    required this.priority,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? json['message'] ?? '',
      type: json['type'] ?? 'info',
      isRead: json['isRead'] ?? false,
      priority: json['priority'] ?? 'low',
      createdAt: json['createdAt'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'title': title,
      'description': description,
      'type': type,
      'isRead': isRead,
      'priority': priority,
      'createdAt': createdAt,
    };
  }

  String get category {
    if (createdAt.isEmpty) return 'YESTERDAY';
    try {
      final date = DateTime.parse(createdAt).toLocal();
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      final compareDate = DateTime(date.year, date.month, date.day);

      if (compareDate == today) {
        return 'TODAY';
      }
      return 'YESTERDAY';
    } catch (_) {
      return 'YESTERDAY';
    }
  }

  String get timestamp {
    if (createdAt.isEmpty) return '';
    try {
      final date = DateTime.parse(createdAt).toLocal();
      final difference = DateTime.now().difference(date);

      if (difference.inMinutes < 1) {
        return 'just now';
      } else if (difference.inMinutes < 60) {
        return '${difference.inMinutes}m ago';
      } else if (difference.inHours < 24) {
        return '${difference.inHours}h ago';
      } else if (difference.inDays == 1) {
        return 'Yesterday';
      } else {
        return '${date.day}/${date.month}/${date.year}';
      }
    } catch (_) {
      return '';
    }
  }

  IconData get icon {
    final t = type.toLowerCase();
    if (t.contains('route') || t.contains('trip')) {
      return Icons.local_shipping_outlined;
    } else if (t.contains('maintenance') || t.contains('warning')) {
      return Icons.construction_outlined;
    } else if (t.contains('achievement') || t.contains('success') || t.contains('star')) {
      return Icons.star_outline_rounded;
    } else if (t.contains('security') || t.contains('auth')) {
      return Icons.shield_outlined;
    }
    return Icons.notifications_none_outlined;
  }
}
