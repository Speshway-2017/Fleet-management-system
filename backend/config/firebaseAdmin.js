import admin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import fs from 'fs';
import path from 'path';

let firebaseApp = null;

const initFirebase = () => {
  if (firebaseApp) return firebaseApp;

  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './service-account.json';
    const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);

    if (!fs.existsSync(resolvedPath)) {
      console.warn(`[Firebase SDK] Warning: Service account file not found at ${resolvedPath}. Push notifications will be simulated.`);
      return null;
    }

    const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));

    // Check if app already initialized
    if (admin.getApps().length === 0) {
      firebaseApp = admin.initializeApp({
        credential: admin.cert(serviceAccount)
      });
      console.log('✓ Firebase Admin SDK initialized successfully');
    } else {
      firebaseApp = admin.getApp();
    }
    return firebaseApp;
  } catch (error) {
    console.error('[Firebase SDK] Error initializing Firebase Admin SDK:', error);
    return null;
  }
};

// Initialize on module load
initFirebase();

/**
 * Send push notification to a single device token
 * @param {string} token - Device registration token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Key-value metadata payload (values must be strings)
 */
export const sendPushNotification = async (token, title, body, data = {}) => {
  try {
    const app = initFirebase();
    if (!app) {
      console.log(`[Firebase Simulated] Single Send: To=${token}, Title="${title}", Body="${body}", Data=`, data);
      return { success: true, simulated: true };
    }

    if (!token) {
      throw new Error('Device token is required');
    }

    const messaging = getMessaging(app);

    const message = {
      notification: {
        title,
        body
      },
      data: Object.keys(data).reduce((acc, key) => {
        acc[key] = String(data[key]);
        return acc;
      }, {}),
      token
    };

    const response = await messaging.send(message);
    console.log(`✓ Push notification sent successfully. MessageId: ${response}`);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('[Firebase SDK] Error sending push notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send push notification to multiple device tokens (multicast)
 * @param {string[]} tokens - Array of device registration tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Key-value metadata payload (values must be strings)
 */
export const sendMulticastNotification = async (tokens, title, body, data = {}) => {
  try {
    const app = initFirebase();
    if (!app) {
      console.log(`[Firebase Simulated] Multicast Send: To=[${tokens.join(', ')}], Title="${title}", Body="${body}", Data=`, data);
      return { success: true, simulated: true };
    }

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      throw new Error('Tokens array must be a non-empty array');
    }

    const messaging = getMessaging(app);

    const message = {
      notification: {
        title,
        body
      },
      data: Object.keys(data).reduce((acc, key) => {
        acc[key] = String(data[key]);
        return acc;
      }, {}),
      tokens
    };

    const response = await messaging.sendEachForMulticast(message);
    console.log(`✓ Multicast sent. Success count: ${response.successCount}, Failure count: ${response.failureCount}`);
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    };
  } catch (error) {
    console.error('[Firebase SDK] Error sending multicast notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send push notification to a topic
 * @param {string} topic - Target FCM topic
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Key-value metadata payload (values must be strings)
 */
export const sendTopicNotification = async (topic, title, body, data = {}) => {
  try {
    const app = initFirebase();
    if (!app) {
      console.log(`[Firebase Simulated] Topic Send: Topic="${topic}", Title="${title}", Body="${body}", Data=`, data);
      return { success: true, simulated: true };
    }

    if (!topic) {
      throw new Error('Topic is required');
    }

    const messaging = getMessaging(app);

    const message = {
      notification: {
        title,
        body
      },
      data: Object.keys(data).reduce((acc, key) => {
        acc[key] = String(data[key]);
        return acc;
      }, {}),
      topic
    };

    const response = await messaging.send(message);
    console.log(`✓ Topic notification sent successfully to topic "${topic}". MessageId: ${response}`);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('[Firebase SDK] Error sending topic notification:', error);
    return { success: false, error: error.message };
  }
};
