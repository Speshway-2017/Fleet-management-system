import express from 'express';
import { sendPushNotification, sendMulticastNotification, sendTopicNotification } from '../config/firebaseAdmin.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = express.Router();

/**
 * Endpoint to test FCM push notifications
 * POST /api/notifications/test-push
 * Body: { token, tokens, topic, title, body, data }
 */
router.post('/test-push', async (req, res, next) => {
  try {
    const { token, tokens, topic, title, body, data } = req.body;

    if (!title || !body) {
      return sendError(res, 400, 'Title and body are required');
    }

    const payloadData = data || {};

    if (token) {
      const result = await sendPushNotification(token, title, body, payloadData);
      if (result.success) {
        return sendSuccess(res, 200, result, 'Push notification sent successfully');
      } else {
        return sendError(res, 500, `FCM Send Error: ${result.error}`);
      }
    } else if (tokens && Array.isArray(tokens) && tokens.length > 0) {
      const result = await sendMulticastNotification(tokens, title, body, payloadData);
      if (result.success) {
        return sendSuccess(res, 200, result, 'Multicast push notifications sent');
      } else {
        return sendError(res, 500, `FCM Multicast Error: ${result.error}`);
      }
    } else if (topic) {
      const result = await sendTopicNotification(topic, title, body, payloadData);
      if (result.success) {
        return sendSuccess(res, 200, result, `Topic notification sent to topic "${topic}"`);
      } else {
        return sendError(res, 500, `FCM Topic Error: ${result.error}`);
      }
    } else {
      return sendError(res, 400, 'Target token, tokens array, or topic is required');
    }
  } catch (error) {
    next(error);
  }
});

export default router;
