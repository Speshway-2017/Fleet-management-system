import * as service from '../services/notification.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notifications = await service.getUserNotificationsService(userId);
    return sendSuccess(res, 200, notifications, 'Notifications fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const { title, message, type, priority, recipient } = req.body;
    
    if (!title || !message) {
      return sendError(res, 400, 'Title and message are required');
    }

    const targetRecipient = recipient || req.user._id;

    const notification = await service.createNotificationService({
      recipient: targetRecipient,
      title,
      message,
      type,
      priority
    });
    
    return sendSuccess(res, 201, notification, 'Notification created successfully');
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const notification = await service.markAsReadService(id, userId);
    return sendSuccess(res, 200, notification, 'Notification marked as read');
  } catch (error) {
    if (error.message.includes('not found')) {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await service.markAllAsReadService(userId);
    return sendSuccess(res, 200, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    await service.deleteNotificationService(id, userId);
    return sendSuccess(res, 200, null, 'Notification deleted successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};
