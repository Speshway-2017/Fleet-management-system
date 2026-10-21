import { maskIdentifier } from './email.js';

/**
 * Production SMS Notification Utility
 * Supports Twilio, Fast2SMS, and MSG91 using Node.js native fetch.
 * Strictly verifies provider API acceptance and never logs plaintext OTPs.
 */
export const sendSms = async ({ phone, message, otp }) => {
  if (!phone) {
    return { success: false, error: "Recipient phone number is required" };
  }

  const cleanPhone = String(phone).trim();
  const digitsOnly = cleanPhone.replace(/\D/g, '');
  const maskedPhone = maskIdentifier(cleanPhone);
  const textMessage = message || (otp ? `Your Fleet Management verification OTP is: ${otp}. It is valid for 10 minutes. Do not share this OTP with anyone.` : "");

  let lastProviderError = null;

  // 1. Twilio Integration
  const twilioSid = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM || process.env.TWILIO_NUMBER;

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const formattedTo = cleanPhone.startsWith('+') ? cleanPhone : `+91${digitsOnly.slice(-10)}`;
      const authHeader = `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64')}`;
      
      const params = new URLSearchParams();
      params.append('To', formattedTo);
      params.append('From', twilioFrom);
      params.append('Body', textMessage);

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString(),
        signal: AbortSignal.timeout(15000)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.sid) {
        console.log(`✅ [Twilio SMS Delivered] Sent to ${maskedPhone} (SID: ${data.sid})`);
        return { success: true, provider: 'twilio', sid: data.sid };
      }
      throw new Error(data.message || `Twilio HTTP error ${res.status}`);
    } catch (twilioErr) {
      console.error(`❌ [Twilio SMS Error] Failed delivering to ${maskedPhone}:`, twilioErr.message);
      lastProviderError = `Twilio: ${twilioErr.message}`;
    }
  }

  // 2. Fast2SMS Integration
  const fast2smsKey = process.env.FAST2SMS_API_KEY || process.env.FAST2SMS_KEY;
  if (fast2smsKey) {
    try {
      const numbers = digitsOnly.slice(-10);
      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fast2smsKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp || '',
          numbers: numbers
        }),
        signal: AbortSignal.timeout(15000)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.return === true || data.status_code === 200)) {
        console.log(`✅ [Fast2SMS Delivered] OTP dispatched to ${maskedPhone}`);
        return { success: true, provider: 'fast2sms', data };
      }
      throw new Error(data.message?.[0] || data.message || `Fast2SMS HTTP ${res.status}`);
    } catch (fast2smsErr) {
      console.error(`❌ [Fast2SMS Error] Failed delivering to ${maskedPhone}:`, fast2smsErr.message);
      lastProviderError = `Fast2SMS: ${fast2smsErr.message}`;
    }
  }

  // 3. MSG91 Integration
  const msg91AuthKey = process.env.MSG91_AUTH_KEY;
  const msg91TemplateId = process.env.MSG91_TEMPLATE_ID;
  if (msg91AuthKey && msg91TemplateId) {
    try {
      const recipientNumber = cleanPhone.startsWith('+') ? digitsOnly : `91${digitsOnly.slice(-10)}`;
      const res = await fetch('https://control.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: {
          'authkey': msg91AuthKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template_id: msg91TemplateId,
          mobile: recipientNumber,
          otp: otp || ''
        }),
        signal: AbortSignal.timeout(15000)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.type === 'success' || res.status === 200)) {
        console.log(`✅ [MSG91 Delivered] OTP dispatched to ${maskedPhone}`);
        return { success: true, provider: 'msg91', data };
      }
      throw new Error(data.message || `MSG91 HTTP ${res.status}`);
    } catch (msg91Err) {
      console.error(`❌ [MSG91 Error] Failed delivering to ${maskedPhone}:`, msg91Err.message);
      lastProviderError = `MSG91: ${msg91Err.message}`;
    }
  }

  // 4. No provider configured or all configured providers failed
  const errorReason = lastProviderError || 'SMS gateway is not configured (set TWILIO_ACCOUNT_SID/FAST2SMS_API_KEY/MSG91_AUTH_KEY in environment).';
  console.warn(`⚠️  [SMS Service Notice] Cannot deliver SMS to ${maskedPhone}: ${errorReason}`);

  return {
    success: false,
    error: errorReason
  };
};

export default sendSms;

