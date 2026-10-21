import * as repo from '../repositories/notification.repository.js';

export const getUserNotificationsService = async (userId) => {
  return await repo.getUserNotifications(userId);
};

export const createNotificationService = async (data) => {
  return await repo.createNotification(data);
};

export const markAsReadService = async (id, userId) => {
  const updated = await repo.markAsRead(id, userId);
  if (!updated) {
    throw new Error('Notification not found or not authorized');
  }
  return updated;
};

export const markAllAsReadService = async (userId) => {
  return await repo.markAllAsRead(userId);
};

export const deleteNotificationService = async (id, userId) => {
  const deleted = await repo.deleteNotification(id, userId);
  if (!deleted) {
    throw new Error('Notification not found or not authorized');
  }
  return deleted;
};
