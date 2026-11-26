import Notification from '../models/Notification.js';

export const getUserNotifications = async (userId) => {
  return Notification.find({ recipient: userId }).sort({ createdAt: -1 });
};

export const createNotification = async (notificationData) => {
  const notification = new Notification(notificationData);
  return notification.save();
};

export const markAsRead = async (id, userId) => {
  return Notification.findOneAndUpdate(
    { _id: id, recipient: userId },
    { isRead: true },
    { new: true }
  );
};

export const markAllAsRead = async (userId) => {
  return Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
};

export const deleteNotification = async (id, userId) => {
  return Notification.findOneAndDelete({ _id: id, recipient: userId });
};
