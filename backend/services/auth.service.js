import crypto from 'crypto';
import User from '../models/User.js';
import Driver from '../models/Driver.js';
import { createUser, findUserByEmail, findUserById } from '../repositories/auth.repository.js';
import { comparePassword, hashPassword } from '../utils/hashPassword.js';
import { generateToken } from '../utils/jwt.js';
import { sendPasswordResetOtpEmail, sendPasswordResetSuccessEmail, maskIdentifier } from '../utils/email.js';
import { sendSms } from '../utils/sms.js';
import {
  DEMO_DRIVER_CREDENTIALS,
  isDemoDriverAccount,
  isDemoDriverIdentifier,
  isDemoOtpAllowed,
  isValidDemoOtp,
} from '../utils/demoAuth.js';

/**
 * Finds user or driver account across both collections by email or phone
 */
export const findAccountByIdentifier = async (identifier) => {
  if (!identifier) return null;
  const cleanId = String(identifier).trim();
  const lowerId = cleanId.toLowerCase();
  const digitsOnly = cleanId.replace(/\D/g, '');
  const emailRegex = new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

  // Prefer the dedicated demo driver record when querying with the demo email or mobile
  if (isDemoDriverIdentifier(cleanId)) {
    const demoUser = await User.findOne({ email: DEMO_DRIVER_CREDENTIALS.email }).select('+password +resetPasswordOtp');
    if (demoUser) {
      return {
        account: demoUser,
        modelType: 'User',
        name: demoUser.name,
        email: demoUser.email,
        phone: demoUser.phone,
        role: demoUser.role
      };
    }
    const demoDriver = await Driver.findOne({ email: DEMO_DRIVER_CREDENTIALS.email }).select('+password +resetPasswordOtp');
    if (demoDriver) {
      return {
        account: demoDriver,
        modelType: 'Driver',
        name: demoDriver.fullName,
        email: demoDriver.email,
        phone: demoDriver.phoneNumber || demoDriver.mobile,
        role: 'DRIVER'
      };
    }
  }

  // 1. Check User model (Super Admin / Fleet Manager)
  const userConditions = [
    { email: lowerId },
    { email: emailRegex }
  ];
  if (digitsOnly.length >= 7) {
    userConditions.push({ phone: cleanId });
    userConditions.push({ phone: digitsOnly });
    userConditions.push({ phone: new RegExp(`${digitsOnly.slice(-10)}$`) });
  }

  const user = await User.findOne({ $or: userConditions }).select('+password +resetPasswordOtp');
  if (user) {
    return {
      account: user,
      modelType: 'User',
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    };
  }

  // 2. Check Driver model
  const driverConditions = [
    { email: lowerId },
    { email: emailRegex },
    { employeeId: cleanId }
  ];
  if (digitsOnly.length >= 7) {
    driverConditions.push({ phoneNumber: cleanId });
    driverConditions.push({ mobile: cleanId });
    driverConditions.push({ phoneNumber: digitsOnly });
    driverConditions.push({ mobile: digitsOnly });
    driverConditions.push({ phoneNumber: new RegExp(`${digitsOnly.slice(-10)}$`) });
    driverConditions.push({ mobile: new RegExp(`${digitsOnly.slice(-10)}$`) });
  }

  const driver = await Driver.findOne({ $or: driverConditions }).select('+password +resetPasswordOtp');
  if (driver) {
    return {
      account: driver,
      modelType: 'Driver',
      name: driver.fullName,
      email: driver.email,
      phone: driver.phoneNumber || driver.mobile,
      role: 'DRIVER'
    };
  }

  return null;
};

export const loginUser = async ({ email, password, role }) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('No account found with this email');

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) throw new Error('Incorrect password');

  if (role && user.role !== role) {
    throw new Error('Role mismatch');
  }

  const userRole = user.role || 'DRIVER';
  if (userRole === 'FLEET_MANAGER') {
    if (user.subscriptionStatus === 'ACTIVE' && user.subscriptionExpiry && new Date() > new Date(user.subscriptionExpiry)) {
      user.subscriptionStatus = 'EXPIRED';
      await User.updateOne({ _id: user._id }, { $set: { subscriptionStatus: 'EXPIRED' } });
    }
  }
  const token = generateToken({ id: user._id, role: userRole });
  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: userRole,
      profileImage: user.profileImage || "",
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionExpiry: user.subscriptionExpiry,
      subscriptionRequestedPlan: user.subscriptionRequestedPlan
    }
  };
};

export const getUserProfile = async (userId) => {
  const user = await findUserById(userId);
  if (!user) throw new Error('User not found');
  return user;
};

export const changeUserPassword = async (userIdOrEmail, oldPassword, newPassword) => {
  let user;
  if (typeof userIdOrEmail === 'string' && userIdOrEmail.includes('@')) {
    user = await findUserByEmail(userIdOrEmail);
  } else if (userIdOrEmail) {
    const User = (await import('../models/User.js')).default;
    user = await User.findById(userIdOrEmail);
    if (!user) {
      user = await findUserByEmail(userIdOrEmail);
    }
  }
  if (!user) throw new Error('User not found');

  const isPasswordValid = await comparePassword(oldPassword, user.password);
  if (!isPasswordValid) throw new Error('Current password is incorrect');

  const hashedNewPassword = await hashPassword(newPassword);
  user.password = hashedNewPassword;
  await user.save();
};

export const createAdmin = async ({ name, email, password }) => {
  const existing = await findUserByEmail(email);
  if (existing) throw new Error('User already exists');

  const hashedPassword = await hashPassword(password);
  const user = await createUser({ name, email, password: hashedPassword, role: 'SUPER_ADMIN' });
  return { id: user._id, name: user.name, email: user.email, role: user.role };
};

/**
 * Handles Forgot Password OTP generation & transmission via Nodemailer and SMS
 */
export const processForgotPassword = async (identifier) => {
  const found = await findAccountByIdentifier(identifier);
  if (!found) {
    throw new Error('No account found with this email or phone number');
  }

  const { account, name, email, phone } = found;

  // Demo user fixed OTP ONLY in development/demo mode (never in production)
  const isDemoFlow =
    isDemoOtpAllowed() &&
    isDemoDriverIdentifier(identifier) &&
    isDemoDriverAccount(account);

  if (isDemoFlow) {
    // Never persist fixed demo OTP into DB so it cannot carry over into production
    account.resetPasswordOtp = undefined;
    account.resetPasswordExpires = undefined;
    account.resetPasswordAttempts = 0;
    account.resetPasswordLastSent = new Date();
    await account.save({ validateModifiedOnly: true });

    console.log(`[AUTH] Demo verification OTP ready for ${maskIdentifier(email || phone)}`);

    return {
      email,
      phone: phone || DEMO_DRIVER_CREDENTIALS.mobile,
      emailSent: true,
      smsSent: true,
      demoMode: true,
      message: 'Verification code has been sent successfully (demo mode).'
    };
  }

  // Enforce 30-second resend cooldown for standard users
  if (account.resetPasswordLastSent) {
    const elapsedMs = Date.now() - new Date(account.resetPasswordLastSent).getTime();
    if (elapsedMs < 30 * 1000) {
      const waitSeconds = Math.ceil((30 * 1000 - elapsedMs) / 1000);
      throw new Error(`Please wait ${waitSeconds} seconds before requesting a new OTP.`);
    }
  }

  // Generate 6-digit secure crypto OTP
  const otp = crypto.randomInt(100000, 1000000).toString();
  const hashedOtp = await hashPassword(otp);

  // Set OTP validity to 10 minutes
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  account.resetPasswordOtp = hashedOtp;
  account.resetPasswordExpires = expiry;
  account.resetPasswordAttempts = 0;
  account.resetPasswordLastSent = new Date();
  await account.save({ validateModifiedOnly: true });

  console.log(`[AUTH] Password reset OTP generated and dispatched for ${maskIdentifier(email || phone)}`);

  let emailSent = false;
  let smsSent = false;
  let emailError = null;
  let smsError = null;

  // 1. Send OTP via Nodemailer Email
  if (email) {
    try {
      await sendPasswordResetOtpEmail({
        email,
        name,
        otp,
        expiresInMinutes: 10
      });
      emailSent = true;
    } catch (mailErr) {
      emailError = mailErr.message;
      console.error(`❌ [AUTH] Failed to dispatch password reset email to ${maskIdentifier(email)}:`, mailErr.message);
    }
  }

  // 2. Send OTP via SMS if phone number exists or identifier was phone
  const targetPhone = phone || (identifier.match(/\d{7,}/) ? identifier : null);
  if (targetPhone) {
    try {
      const smsRes = await sendSms({
        phone: targetPhone,
        otp
      });
      if (smsRes?.success) {
        smsSent = true;
      } else if (smsRes?.error) {
        smsError = smsRes.error;
      }
    } catch (smsErr) {
      smsError = smsErr.message;
      console.error(`❌ [AUTH] Failed to dispatch password reset SMS to ${maskIdentifier(targetPhone)}:`, smsErr.message);
    }
  }

  // Strict verification: Do not claim success if no channel accepted the OTP
  if (!emailSent && !smsSent) {
    const errorDetails = [];
    if (email) errorDetails.push(`Email: ${emailError || 'Delivery failed'}`);
    if (targetPhone) errorDetails.push(`SMS: ${smsError || 'Delivery failed'}`);
    
    const combinedMessage = errorDetails.length > 0
      ? `Failed to deliver verification OTP. (${errorDetails.join(' | ')})`
      : 'Failed to deliver verification OTP. Please check your registered email/phone or contact support.';
    
    throw new Error(combinedMessage);
  }

  const deliveredVia = [emailSent ? 'registered email' : null, smsSent ? 'mobile SMS' : null].filter(Boolean).join(' and ');

  return {
    email,
    phone: targetPhone || '',
    emailSent,
    smsSent,
    message: `Verification code has been sent successfully to your ${deliveredVia}.`
  };
};

/**
 * Validates the 6-digit OTP against the stored hash with attempt limits and expiry.
 * Supports demo OTP (123456) exclusively for the demo driver in non-production mode.
 */
export const verifyUserOtp = async (identifier, otp, { issueToken = false } = {}) => {
  if (!identifier || !otp) {
    throw new Error('Email/phone and OTP are required');
  }

  const cleanOtp = String(otp).trim();
  if (cleanOtp.length !== 6) {
    throw new Error('Please enter the complete 6-digit OTP');
  }

  const found = await findAccountByIdentifier(identifier);
  if (!found) {
    throw new Error('Invalid or expired OTP');
  }

  const { account } = found;

  // Fixed demo OTP strictly scoped to demo driver & non-production environment
  if (isValidDemoOtp(identifier, account, cleanOtp)) {
    if (account.resetPasswordAttempts) {
      account.resetPasswordAttempts = 0;
      await account.save({ validateModifiedOnly: true });
    }

    const token = generateToken({ id: account._id, role: found.role || 'DRIVER' });
    return {
      success: true,
      email: found.email,
      phone: found.phone,
      token,
      user: {
        id: account._id,
        name: found.name,
        email: found.email,
        phone: found.phone,
        role: found.role || 'DRIVER',
      },
    };
  }

  if (!account.resetPasswordOtp || !account.resetPasswordExpires) {
    throw new Error('No active OTP request found. Please request a new OTP.');
  }

  // Check Expiry (10 minutes)
  if (new Date(account.resetPasswordExpires).getTime() < Date.now()) {
    account.resetPasswordOtp = undefined;
    account.resetPasswordExpires = undefined;
    account.resetPasswordAttempts = 0;
    await account.save({ validateModifiedOnly: true });
    throw new Error('OTP has expired. Please request a new OTP.');
  }

  // Check Attempt Limits (Max 5 attempts)
  if ((account.resetPasswordAttempts || 0) >= 5) {
    account.resetPasswordOtp = undefined;
    account.resetPasswordExpires = undefined;
    account.resetPasswordAttempts = 0;
    await account.save({ validateModifiedOnly: true });
    throw new Error('Maximum verification attempts exceeded. Please request a new OTP.');
  }

  // Verify OTP Hash
  const isOtpValid = await comparePassword(cleanOtp, account.resetPasswordOtp);
  if (!isOtpValid) {
    account.resetPasswordAttempts = (account.resetPasswordAttempts || 0) + 1;
    await account.save({ validateModifiedOnly: true });
    const remaining = 5 - account.resetPasswordAttempts;
    if (remaining <= 0) {
      account.resetPasswordOtp = undefined;
      account.resetPasswordExpires = undefined;
      account.resetPasswordAttempts = 0;
      await account.save({ validateModifiedOnly: true });
      throw new Error('Maximum verification attempts exceeded. Please request a new OTP.');
    }
    throw new Error(`Invalid OTP code. You have ${remaining} attempt(s) remaining.`);
  }

  const response = {
    success: true,
    email: found.email,
    phone: found.phone
  };

  if (issueToken) {
    response.token = generateToken({ id: account._id, role: found.role || 'DRIVER' });
    response.user = {
      id: account._id,
      name: found.name,
      email: found.email,
      phone: found.phone,
      role: found.role || 'DRIVER',
    };
  }

  return response;
};

/**
 * Authenticates a user or driver using identifier (email or mobile) and OTP.
 */
export const loginUserWithOtp = async (identifier, otp) => {
  return verifyUserOtp(identifier, otp, { issueToken: true });
};

/**
 * Resets user or driver password after successful OTP verification
 */
export const resetUserPassword = async (identifier, otp, newPassword) => {
  if (!identifier || !otp || !newPassword) {
    throw new Error('Identifier, OTP, and new password are required');
  }

  const found = await findAccountByIdentifier(identifier);
  if (!found) {
    throw new Error('Invalid or expired OTP');
  }

  const { account, name, email, modelType } = found;
  const demoOtpMatch = isValidDemoOtp(identifier, account, otp);

  if (!demoOtpMatch) {
    if (!account.resetPasswordOtp || !account.resetPasswordExpires) {
      throw new Error('Invalid or expired OTP. Please request a new OTP.');
    }

    if (new Date(account.resetPasswordExpires).getTime() < Date.now()) {
      account.resetPasswordOtp = undefined;
      account.resetPasswordExpires = undefined;
      account.resetPasswordAttempts = 0;
      await account.save({ validateModifiedOnly: true });
      throw new Error('OTP has expired. Please request a new OTP.');
    }

    const isOtpValid = await comparePassword(String(otp).trim(), account.resetPasswordOtp);
    if (!isOtpValid) {
      throw new Error('Invalid or expired OTP');
    }
  }

  const hashedPassword = await hashPassword(newPassword);

  account.password = hashedPassword;
  account.resetPasswordOtp = undefined;
  account.resetPasswordExpires = undefined;
  account.resetPasswordAttempts = 0;

  if (modelType === 'Driver') {
    account.mustChangePassword = false;
  }

  await account.save({ validateModifiedOnly: true });

  if (email) {
    if (modelType === 'User' && String(account.role || '').toUpperCase() === 'DRIVER') {
      await Driver.updateOne(
        { email: email.toLowerCase().trim() },
        { $set: { password: hashedPassword, mustChangePassword: false } }
      ).catch(() => {});
    } else if (modelType === 'Driver') {
      await User.updateOne(
        { email: email.toLowerCase().trim(), role: 'DRIVER' },
        { $set: { password: hashedPassword } }
      ).catch(() => {});
    }
  }

  // Send confirmation email
  if (email) {
    try {
      await sendPasswordResetSuccessEmail({ email, name });
    } catch (mailErr) {
      console.error('[WARNING] Failed to send password reset confirmation email:', mailErr.message);
    }
  }

  return {
    success: true,
    message: 'Password reset successfully'
  };
};
