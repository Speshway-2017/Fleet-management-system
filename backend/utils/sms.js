/**
 * SMS Notification Utility
 * Supports Twilio, Fast2SMS, or clean formatted developer fallback
 */

export const sendSms = async ({ phone, message, otp }) => {
  if (!phone) {
    return { success: false, error: "Recipient phone number is required" };
  }

  const cleanPhone = String(phone).trim();
  const textMessage = message || (otp ? `Your Fleet Management verification OTP is: ${otp}. It is valid for 10 minutes. Do not share this OTP with anyone.` : "");

  // 1. Twilio Integration (if configured in environment)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const twilioModule = await import('twilio');
      const twilio = twilioModule.default || twilioModule;
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

      const response = await client.messages.create({
        body: textMessage,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone.replace(/^0+/, '')}` // default standard formatting
      });

      console.log(`✅ [Twilio SMS] Message sent to ${cleanPhone} (SID: ${response.sid})`);
      return { success: true, provider: 'twilio', sid: response.sid };
    } catch (twilioErr) {
      console.error(`❌ [Twilio SMS] Error sending SMS to ${cleanPhone}:`, twilioErr.message);
    }
  }

  // 2. Fast2SMS Integration (if configured in environment)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const axiosModule = await import('axios');
      const axios = axiosModule.default || axiosModule;
      
      const numbers = cleanPhone.replace(/\D/g, '').slice(-10);
      const res = await axios.post(
        'https://www.fast2sms.com/dev/bulkV2',
        {
          route: 'otp',
          variables_values: otp || '',
          numbers: numbers
        },
        {
          headers: {
            authorization: process.env.FAST2SMS_API_KEY
          }
        }
      );
      console.log(`✅ [Fast2SMS] OTP sent to ${numbers}`);
      return { success: true, provider: 'fast2sms', data: res.data };
    } catch (fast2smsErr) {
      console.error(`❌ [Fast2SMS] Error sending OTP to ${cleanPhone}:`, fast2smsErr.message);
    }
  }

  // 3. Fallback Logging (for Development / Staging environments without live SMS balance)
  console.log("\n======================================================================");
  console.log("📱 [SMS Gateway] Dispatching SMS OTP / Notification:");
  console.log("----------------------------------------------------------------------");
  console.log(`📱 RECIPIENT : ${cleanPhone}`);
  if (otp) {
    console.log(`🔢 OTP CODE  : ${otp}`);
  }
  console.log(`💬 MESSAGE   :\n${textMessage}`);
  console.log("======================================================================\n");

  return { success: true, simulated: true };
};

export default sendSms;
