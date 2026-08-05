import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Driver from '../models/Driver.js';
import { sendPushNotification } from '../config/firebaseAdmin.js';

/**
 * Create a notification and emit it via Socket.IO
 * @param {Object} params - Notification parameters
 * @param {Object} params.io - Socket.IO instance from app.locals
 * @param {mongoose.Types.ObjectId} [params.recipient] - Recipient user ID
 * @param {mongoose.Types.ObjectId} [params.sender] - Sender user ID
 * @param {String} [params.recipientRole] - Recipient role (e.g., 'FLEET_MANAGER')
 * @param {String} [params.senderRole] - Sender role (e.g., 'SUPER_ADMIN')
 * @param {mongoose.Types.ObjectId} [params.organization] - Organization ID
 * @param {String} params.type - Notification type (e.g., 'driver_created')
 * @param {String} params.title - Notification title
 * @param {String} params.message - Notification message
 * @param {String} [params.priority='normal'] - Priority (low/normal/high)
 * @param {Object} [params.metadata={}] - Additional metadata
 */
export const createAndEmitNotification = async (params) => {
  try {
    const {
      io,
      recipient,
      sender,
      recipientRole,
      senderRole,
      organization,
      type,
      title,
      message,
      priority = 'normal',
      metadata = {},
      referenceId,
      referenceType
    } = params;

    // Create notification document
    const notification = new Notification({
      recipient,
      createdBy: sender,
      recipientRole,
      senderRole,
      organization,
      type,
      title,
      message,
      priority,
      metadata,
      referenceId,
      referenceType
    });

    const savedNotification = await notification.save();

    // Emit to super admin room if recipientRole is SUPER_ADMIN
    if (recipientRole === 'SUPER_ADMIN' && io) {
      io.to('role:SUPER_ADMIN').emit('notification:new', savedNotification.toObject());
    }

    // Emit to specific recipient room if recipient exists
    if (recipient && io) {
      if (recipientRole === 'DRIVER') {
        io.to(`driver:${recipient}`).emit('notification:new', savedNotification.toObject());
      } else {
        io.to(`manager:${recipient}`).emit('notification:new', savedNotification.toObject());
      }
    }

    // Emit to organization room if organization exists
    if (organization && io) {
      io.to(`organization:${organization}`).emit('notification:new', savedNotification.toObject());
    }

    // If recipientRole is 'FLEET_MANAGER' and no specific recipient but organization exists,
    // send to all managers in the organization
    if (recipientRole === 'FLEET_MANAGER' && organization && !recipient && io) {
      const managers = await User.find({ organization, role: 'FLEET_MANAGER' });
      for (const manager of managers) {
        io.to(`manager:${manager._id}`).emit('notification:new', savedNotification.toObject());
      }
    }

    // FCM push notification integration
    try {
      const sendPushToUser = async (userId, role) => {
        let targetToken = null;
        if (role === 'DRIVER') {
          const driverDoc = await Driver.findById(userId);
          targetToken = driverDoc?.fcmToken;
        } else {
          const userDoc = await User.findById(userId);
          targetToken = userDoc?.fcmToken;
        }

        if (targetToken) {
          const pushData = {};
          if (metadata) {
            Object.keys(metadata).forEach(key => {
              pushData[key] = String(metadata[key]);
            });
          }
          if (type) pushData.type = String(type);
          if (referenceId) pushData.referenceId = String(referenceId);
          if (referenceType) pushData.referenceType = String(referenceType);

          const result = await sendPushNotification(targetToken, title, message, pushData);

          console.log(`[FCM Notification Log]
Recipient: ${userId} (${role})
Token: ${targetToken}
Title: "${title}"
Body: "${message}"
Status: ${result.success ? 'Success' : 'Failure'}
Timestamp: ${new Date().toISOString()}
Firebase Response: ${JSON.stringify(result)}
==================================================`);
        } else {
          console.log(`[FCM Notification Info] No FCM Token found for ${userId} (${role}). Push notification skipped.`);
        }
      };

      if (recipient) {
        await sendPushToUser(recipient, recipientRole);
      } else if (recipientRole === 'FLEET_MANAGER' && organization) {
        const managers = await User.find({ organization, role: 'FLEET_MANAGER' });
        for (const manager of managers) {
          await sendPushToUser(manager._id, 'FLEET_MANAGER');
        }
      }
    } catch (pushError) {
      console.error('[FCM Notification Error] Failed to send push notification:', pushError.message);
    }

    return savedNotification;
  } catch (error) {
    console.error('❌ Failed to create/emit notification:', error);
    throw error;
  }
};

export default createAndEmitNotification;