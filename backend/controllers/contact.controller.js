import ContactRequest from '../models/ContactRequest.js';
import { sendSuccess, sendError } from '../utils/response.js';
import sendEmail from '../utils/email.js';
import sanitizeHtml from 'sanitize-html';
import xss from 'xss';
import { createAndEmitNotification } from '../utils/notification.js';

const sanitize = (text) => {
  if (!text) return '';
  const cleanHtml = sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {}
  });
  return xss(cleanHtml).trim();
};

export const createContactRequest = async (req, res, next) => {
  try {
    const { fullName, email, company, phone, subject, message, captchaToken } = req.body;
    console.log("Captcha Token:", captchaToken);

    // 1. Check if CAPTCHA token is provided
    if (!captchaToken) {
      return sendError(res, 400, 'Captcha verification failed.');
    }

    // Sanitize user inputs to prevent XSS
    const cleanFullName = sanitize(fullName);
    const cleanEmail = sanitize(email);
    const cleanCompany = sanitize(company);
    const cleanPhone = sanitize(phone);
    const cleanSubject = sanitize(subject);
    const cleanMessage = sanitize(message);

    // 2. Prevent multiple submissions (duplicate checks in 30s window)
    const duplicateRequest = await ContactRequest.findOne({
      email: cleanEmail.toLowerCase(),
      message: cleanMessage,
      createdAt: { $gte: new Date(Date.now() - 30000) }
    });
    if (duplicateRequest) {
      return sendError(res, 429, 'Duplicate request detected. Please wait 30 seconds before submitting again.');
    }

    // 3. Verify token with Google reCAPTCHA verification endpoint
    let verificationResult;
    if (process.env.NODE_ENV === 'development' && (captchaToken === 'bypass' || process.env.SKIP_CAPTCHA === 'true')) {
      verificationResult = { success: true };
      console.log("reCAPTCHA validation bypassed for local development testing.");
    } else {
      try {
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        console.log("Secret Key Loaded:", secretKey ? (secretKey.substring(0, 10) + "...") : "NOT_SET");
        const params = new URLSearchParams({
          secret: secretKey || '',
          response: captchaToken,
        });

        const googleResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });

        verificationResult = await googleResponse.json();
        console.log("Google Verification Response:", verificationResult);

        // Fallback for local development testing if secret key or domain is mismatched
        if (!verificationResult.success && process.env.NODE_ENV === 'development') {
          console.warn("reCAPTCHA verification failed in development mode:", verificationResult['error-codes']);
          if (verificationResult['error-codes']?.includes('invalid-input-secret')) {
            console.warn("Invalid reCAPTCHA secret key in development environment. Allowing dev fallback.");
            verificationResult = { success: true };
          }
        }
      } catch (error) {
        console.error('reCAPTCHA validation API error:', error);
        if (process.env.NODE_ENV === 'development') {
          console.warn("reCAPTCHA service unreachable in development. Allowing dev fallback.");
          verificationResult = { success: true };
        } else {
          return sendError(res, 500, 'Captcha verification service unavailable due to network failure.');
        }
      }
    }

    // 4. Validate Google response success
    if (!verificationResult || !verificationResult.success) {
      const errorCodes = verificationResult?.['error-codes'] ? ` (Error: ${verificationResult['error-codes'].join(', ')})` : '';
      console.error(`Captcha verification failed${errorCodes}`);
      return sendError(res, 400, 'Captcha verification failed. Please try again.');
    }

    // Generate custom Ticket ID: CNT-YYYYMMDD-XXX
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const todayStr = `${year}${month}${day}`;

    // Get today's count for suffix
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const countToday = await ContactRequest.countDocuments({
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    });
    const sequence = String(countToday + 1).padStart(3, '0');
    const ticketId = `CNT-${todayStr}-${sequence}`;

    // 5. If successful, continue save logic
    const contact = new ContactRequest({
      fullName: cleanFullName,
      email: cleanEmail,
      company: cleanCompany,
      phone: cleanPhone,
      subject: cleanSubject,
      message: cleanMessage,
      ticketId,
      status: 'New',
    });
    await contact.save();
    console.log("Saved Contact:", contact);

    // Create and emit notification for SUPER_ADMIN
    try {
      await createAndEmitNotification({
        io: req.io || (req.app && req.app.locals && req.app.locals.io),
        recipientRole: 'SUPER_ADMIN',
        type: 'CONTACT_REQUEST',
        title: 'New Contact Request',
        message: `A new contact request has been submitted by ${cleanFullName}.\nSubject: ${cleanSubject}`,
        referenceId: contact._id.toString(),
        referenceType: 'CONTACT',
        priority: 'high',
        metadata: {
          name: cleanFullName,
          subject: cleanSubject
        }
      });
    } catch (notifErr) {
      console.error("Failed to create admin notification for contact request:", notifErr);
    }

    // 6. Send Nodemailer email notifications asynchronously
    // Send Admin Notification Email
    const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL || 'admin@fleetmanagement.com';
    sendEmail({
      email: adminEmail,
      subject: `[New Contact Request] ${ticketId} - ${cleanSubject}`,
      message: `New contact request received.\n\nName: ${cleanFullName}\nEmail: ${cleanEmail}\nCompany: ${cleanCompany || 'N/A'}\nPhone: ${cleanPhone || 'N/A'}\nSubject: ${cleanSubject}\nMessage:\n${cleanMessage}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #0B1B3D; color: white; padding: 20px; font-weight: bold; font-size: 18px;">
            New Contact Request Received (${ticketId})
          </div>
          <div style="padding: 20px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; border-b: 1px solid #f1f5f9; font-weight: bold; width: 120px;">Name:</td>
                <td style="padding: 8px 0; border-b: 1px solid #f1f5f9;">${cleanFullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-b: 1px solid #f1f5f9; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0; border-b: 1px solid #f1f5f9;"><a href="mailto:${cleanEmail}">${cleanEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-b: 1px solid #f1f5f9; font-weight: bold;">Company:</td>
                <td style="padding: 8px 0; border-b: 1px solid #f1f5f9;">${cleanCompany || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-b: 1px solid #f1f5f9; font-weight: bold;">Phone:</td>
                <td style="padding: 8px 0; border-b: 1px solid #f1f5f9;">${cleanPhone || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-b: 1px solid #f1f5f9; font-weight: bold;">Subject:</td>
                <td style="padding: 8px 0; border-b: 1px solid #f1f5f9; color: #A14000; font-weight: bold;">${cleanSubject}</td>
              </tr>
            </table>
            <div style="background-color: #f8fafc; border-left: 4px solid #A14000; padding: 15px; border-radius: 4px; font-style: italic;">
              <strong>Message:</strong><br/>
              ${cleanMessage.replace(/\n/g, '<br/>')}
            </div>
          </div>
          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
            Fleet Management System &copy; 2026
          </div>
        </div>
      `
    }).catch(err => console.error("Admin Email Error:", err));

    // Send Auto Reply Email to User
    sendEmail({
      email: cleanEmail,
      subject: `We received your request - Ticket: ${ticketId}`,
      message: `Hello ${cleanFullName},\n\nThank you for contacting Fleet Management.\n\nOur team has received your request.\n\nTicket ID:\n${ticketId}\n\nExpected Response:\nWithin 24 Hours\n\nRegards,\n\nFleet Management Team`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #A14000; color: white; padding: 20px; font-weight: bold; font-size: 18px;">
            Thank you for contacting us!
          </div>
          <div style="padding: 20px;">
            <p>Hello <strong>${cleanFullName}</strong>,</p>
            <p>Thank you for contacting Fleet Management.</p>
            <p>Our team has received your request.</p>
            <div style="background-color: #f8fafc; border: 1px dashed #A14000; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
              <span style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold;">Ticket ID</span><br/>
              <span style="font-size: 20px; color: #0B1B3D; font-weight: 800; letter-spacing: 1px;">${ticketId}</span>
            </div>
            <p><strong>Expected Response:</strong><br/>Within 24 Hours</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="margin-bottom: 0;">Regards,</p>
            <p style="margin-top: 0; font-weight: bold; color: #0B1B3D;">Fleet Management Team</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
            Fleet Management System &copy; 2026
          </div>
        </div>
      `
    }).catch(err => console.error("User Auto-Reply Email Error:", err));

    return sendSuccess(res, 201, contact, 'Message sent successfully!');
  } catch (error) {
    next(error);
  }
};
