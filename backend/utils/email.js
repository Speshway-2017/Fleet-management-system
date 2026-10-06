import nodemailer from "nodemailer";

/**
 * Creates and returns a Nodemailer transporter based on environment variables.
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;
  const service = process.env.SMTP_SERVICE;

  if (service) {
    return nodemailer.createTransport({
      service,
      auth: { user, pass }
    });
  }

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  return null;
};

/**
 * Sends a generic email using Nodemailer with fallback logging.
 */
export const sendEmail = async (options) => {
  const recipient = options.to || options.email;
  const fromAddress = process.env.FROM_EMAIL || process.env.SMTP_USER || 'no-reply@fleetmanagement.com';
  const fromName = process.env.FROM_NAME || 'Fleet Management System';
  const transporter = getTransporter();

  const mailOptions = {
    from: `"${fromName}" <${fromAddress}>`,
    to: recipient,
    subject: options.subject,
    text: options.text || options.message,
    html: options.html
  };

  try {
    if (!transporter) {
      console.log("\n======================================================================");
      console.log("⚠️  SMTP is not configured in .env. Logging email dispatch to console:");
      console.log("----------------------------------------------------------------------");
      console.log(`✉️  FROM   : "${fromName}" <${fromAddress}>`);
      console.log(`✉️  TO     : ${recipient}`);
      console.log(`✉️  SUBJECT: ${options.subject}`);
      if (options.text || options.message) {
        console.log(`✉️  BODY   :\n${options.text || options.message}`);
      }
      console.log("======================================================================\n");
      return { success: true, simulated: true };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Nodemailer] Email sent to ${recipient} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ [Nodemailer] Error sending email to ${recipient}:`, err.message);
    // Don't throw fatal crash if email fails, but log error
    return { success: false, error: err.message };
  }
};

/**
 * Sends welcome & login credentials email to a newly created Fleet Manager
 */
export const sendManagerWelcomeEmail = async ({ name, email, password, organizationName, phone }) => {
  const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`;
  const subject = "Welcome to Fleet Management - Your Manager Account Credentials";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #A14000 0%, #D95D0F 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Fleet Management System</h1>
              <p style="margin: 8px 0 0; color: #ffedd5; font-size: 14px; font-weight: 500;">Fleet Manager Account Created</p>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #334155; line-height: 1.6;">
                Hello <strong>${name}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; color: #475569; line-height: 1.6;">
                An administrator has created your Fleet Manager account${organizationName ? ` for <strong>${organizationName}</strong>` : ''}. You now have full access to manage vehicles, drivers, trips, fuel logs, and real-time operations.
              </p>

              <!-- Credentials Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fff7ed; border-radius: 12px; border: 1px solid #ffedd5; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 24px;">
                    <div style="font-size: 12px; font-weight: 700; color: #A14000; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">Your Login Credentials</div>
                    <table width="100%" border="0" cellspacing="0" cellpadding="4">
                      <tr>
                        <td width="30%" style="font-size: 14px; color: #64748b; font-weight: 500;">Role:</td>
                        <td style="font-size: 14px; color: #1e293b; font-weight: 600;">Fleet Manager</td>
                      </tr>
                      <tr>
                        <td width="30%" style="font-size: 14px; color: #64748b; font-weight: 500;">Email:</td>
                        <td style="font-size: 14px; color: #1e293b; font-weight: 600; font-family: monospace;">${email}</td>
                      </tr>
                      <tr>
                        <td width="30%" style="font-size: 14px; color: #64748b; font-weight: 500;">Password:</td>
                        <td style="font-size: 14px; color: #A14000; font-weight: 700; font-family: monospace; letter-spacing: 0.5px;">${password}</td>
                      </tr>
                      ${phone ? `
                      <tr>
                        <td width="30%" style="font-size: 14px; color: #64748b; font-weight: 500;">Phone:</td>
                        <td style="font-size: 14px; color: #1e293b; font-weight: 600;">${phone}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; background-color: #A14000; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(161, 64, 0, 0.25);">
                      Login to Fleet Manager Portal
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                🔒 <strong>Security Tip:</strong> Please log in and change your password in your Profile Settings after your first login. Do not share your credentials with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} Fleet Management System. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const message = `Hello ${name},

Your Fleet Manager account has been created successfully${organizationName ? ` for ${organizationName}` : ''}.

Login Credentials:
Email: ${email}
Password: ${password}
${phone ? `Phone: ${phone}\n` : ''}
Portal Login: ${loginUrl}

Please log in and update your password immediately.

Regards,
Fleet Management Team`;

  return sendEmail({
    to: email,
    subject,
    text: message,
    html
  });
};

/**
 * Sends welcome & login credentials email to a newly created Driver
 */
export const sendDriverWelcomeEmail = async ({ fullName, email, password, employeeId, phoneNumber }) => {
  const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`;
  const subject = "Welcome to Fleet Operations - Driver Account Credentials";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Fleet Driver Operations</h1>
              <p style="margin: 8px 0 0; color: #e0f2fe; font-size: 14px; font-weight: 500;">Driver Account Registered</p>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #334155; line-height: 1.6;">
                Hello <strong>${fullName}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; color: #475569; line-height: 1.6;">
                You have been registered as a driver in the Fleet Management platform. You can now access your assigned trips, navigation routes, vehicle maintenance checks, and digital PODs.
              </p>

              <!-- Credentials Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f9ff; border-radius: 12px; border: 1px solid #e0f2fe; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 24px;">
                    <div style="font-size: 12px; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">Driver Account Details</div>
                    <table width="100%" border="0" cellspacing="0" cellpadding="4">
                      ${employeeId ? `
                      <tr>
                        <td width="35%" style="font-size: 14px; color: #64748b; font-weight: 500;">Employee ID:</td>
                        <td style="font-size: 14px; color: #1e293b; font-weight: 700; font-family: monospace;">${employeeId}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td width="35%" style="font-size: 14px; color: #64748b; font-weight: 500;">Registered Email:</td>
                        <td style="font-size: 14px; color: #1e293b; font-weight: 600; font-family: monospace;">${email}</td>
                      </tr>
                      ${phoneNumber ? `
                      <tr>
                        <td width="35%" style="font-size: 14px; color: #64748b; font-weight: 500;">Mobile Number:</td>
                        <td style="font-size: 14px; color: #1e293b; font-weight: 600;">${phoneNumber}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td width="35%" style="font-size: 14px; color: #64748b; font-weight: 500;">Temporary Password:</td>
                        <td style="font-size: 14px; color: #0284c7; font-weight: 700; font-family: monospace; letter-spacing: 0.5px;">${password}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);">
                      Login to Driver Portal
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                🔑 <strong>Mandatory Step:</strong> For security purposes, you will be prompted to change your password upon your first login. Keep your credentials secure at all times.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} Fleet Management System. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const message = `Hello ${fullName},

Your Driver account in Fleet Management has been created successfully.

Account Details:
${employeeId ? `Employee ID: ${employeeId}\n` : ''}Email: ${email}
${phoneNumber ? `Phone: ${phoneNumber}\n` : ''}Temporary Password: ${password}
Portal Login: ${loginUrl}

Please log in and update your temporary password upon first login.

Regards,
Fleet Operations Team`;

  return sendEmail({
    to: email,
    subject,
    text: message,
    html
  });
};

/**
 * Sends a 6-digit secure password reset OTP email
 */
export const sendPasswordResetOtpEmail = async ({ email, name, otp, expiresInMinutes = 10 }) => {
  const subject = "Fleet Management - Password Reset Verification Code";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #A14000 0%, #D95D0F 100%); padding: 28px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">Password Reset Request</h1>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #334155;">
                Hello ${name ? `<strong>${name}</strong>` : 'User'},
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #475569; line-height: 1.6;">
                We received a request to reset your password. Use the 6-digit One-Time Password (OTP) below to complete your verification:
              </p>

              <!-- OTP Code Display -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: #fff7ed; border: 2px dashed #A14000; border-radius: 12px; padding: 16px 36px; text-align: center;">
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #A14000;">
                        ${otp}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px; font-size: 13px; color: #64748b; text-align: center;">
                ⏱️ This code will expire in <strong>${expiresInMinutes} minutes</strong>.
              </p>

              <!-- Warning Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; color: #991b1b; line-height: 1.5;">
                    ⚠️ <strong>Never share this OTP</strong> with anyone. Fleet Management staff will never ask for your verification code.
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                If you did not request a password reset, you can safely ignore this email. Your account remains secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} Fleet Management System. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const message = `Hello ${name || 'User'},

We received a request to reset your password.

Your 6-digit OTP verification code is: ${otp}

This code expires in ${expiresInMinutes} minutes.

If you did not request a password reset, please ignore this email.

Regards,
Fleet Management Security Team`;

  return sendEmail({
    to: email,
    subject,
    text: message,
    html
  });
};

/**
 * Sends a notification email after successful password reset
 */
export const sendPasswordResetSuccessEmail = async ({ email, name }) => {
  const subject = "Fleet Management - Password Changed Successfully";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background-color: #10b981; padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">Password Updated Successfully</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #334155;">
                Hello ${name ? `<strong>${name}</strong>` : 'User'},
              </p>
              <p style="margin: 0 0 20px; font-size: 14px; color: #475569; line-height: 1.6;">
                The password for your Fleet Management account (<strong>${email}</strong>) has been successfully reset.
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                If you did not perform this change, please contact your system administrator immediately to secure your account.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendEmail({
    to: email,
    subject,
    text: `Hello ${name || 'User'},\n\nYour password for ${email} has been changed successfully. If you did not make this change, please contact support immediately.`,
    html
  });
};

export default sendEmail;