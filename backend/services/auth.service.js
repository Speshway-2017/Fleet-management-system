import crypto from 'crypto';
import User from '../models/User.js';
import Driver from '../models/Driver.js';
import { createUser, findUserByEmail, findUserById } from '../repositories/auth.repository.js';
import { comparePassword, hashPassword } from '../utils/hashPassword.js';
import { generateToken } from '../utils/jwt.js';
import { sendPasswordResetOtpEmail, sendPasswordResetSuccessEmail } from '../utils/email.js';
import { sendSms } from '../utils/sms.js';

/**
 * Finds user or driver account across both collections by email or phone
 */
export const findAccountByIdentifier = async (identifier) => {
  if (!identifier) return null;
  const cleanId = String(identifier).trim();
  const lowerId = cleanId.toLowerCase();
  const digitsOnly = cleanId.replace(/\D/g, '');

  // 1. Check User model (Super Admin / Fleet Manager)
  const userConditions = [{ email: lowerId }];
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
  const driverConditions = [{ email: lowerId }];
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

  // Enforce 30-second resend cooldown
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
  await account.save();

  console.log(`\n==================================================`);
  console.log(`🔑 PASSWORD RESET OTP GENERATED`);
  console.log(`👤 Name:      ${name}`);
  console.log(`📧 Email:     ${email}`);
  console.log(`📱 Phone:     ${phone || 'N/A'}`);
  console.log(`🔢 OTP Code:  ${otp}`);
  console.log(`⏱️ Expiry:    10 minutes`);
  console.log(`==================================================\n`);

  // 1. Send OTP via Nodemailer Email
  if (email) {
    try {
      await sendPasswordResetOtpEmail({
        email,
        name,
        otp,
        expiresInMinutes: 10
      });
    } catch (mailErr) {
      console.error('[WARNING] Failed to dispatch password reset email:', mailErr.message);
    }
  }

  // 2. Send OTP via SMS if phone number exists or identifier was phone
  const targetPhone = phone || (identifier.match(/\d{7,}/) ? identifier : null);
  if (targetPhone) {
    try {
      await sendSms({
        phone: targetPhone,
        otp
      });
    } catch (smsErr) {
      console.error('[WARNING] Failed to dispatch password reset SMS:', smsErr.message);
    }
  }

  return {
    email,
    phone: targetPhone || '',
    message: 'OTP sent successfully to registered contact.'
  };
};

/**
 * Validates the 6-digit OTP against the stored hash with attempt limits and expiry
 */
export const verifyUserOtp = async (identifier, otp) => {
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

  if (!account.resetPasswordOtp || !account.resetPasswordExpires) {
    throw new Error('No active OTP request found. Please request a new OTP.');
  }

  // Check Expiry (10 minutes)
  if (new Date(account.resetPasswordExpires).getTime() < Date.now()) {
    account.resetPasswordOtp = undefined;
    account.resetPasswordExpires = undefined;
    account.resetPasswordAttempts = 0;
    await account.save();
    throw new Error('OTP has expired. Please request a new OTP.');
  }

  // Check Attempt Limits (Max 5 attempts)
  if ((account.resetPasswordAttempts || 0) >= 5) {
    account.resetPasswordOtp = undefined;
    account.resetPasswordExpires = undefined;
    account.resetPasswordAttempts = 0;
    await account.save();
    throw new Error('Maximum verification attempts exceeded. Please request a new OTP.');
  }

  // Verify OTP Hash
  const isOtpValid = await comparePassword(cleanOtp, account.resetPasswordOtp);
  if (!isOtpValid) {
    account.resetPasswordAttempts = (account.resetPasswordAttempts || 0) + 1;
    await account.save();
    const remaining = 5 - account.resetPasswordAttempts;
    if (remaining <= 0) {
      account.resetPasswordOtp = undefined;
      account.resetPasswordExpires = undefined;
      account.resetPasswordAttempts = 0;
      await account.save();
      throw new Error('Maximum verification attempts exceeded. Please request a new OTP.');
    }
    throw new Error(`Invalid OTP code. You have ${remaining} attempt(s) remaining.`);
  }

  return {
    success: true,
    email: found.email,
    phone: found.phone
  };
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

  if (!account.resetPasswordOtp || !account.resetPasswordExpires) {
    throw new Error('Invalid or expired OTP. Please request a new OTP.');
  }

  if (new Date(account.resetPasswordExpires).getTime() < Date.now()) {
    account.resetPasswordOtp = undefined;
    account.resetPasswordExpires = undefined;
    account.resetPasswordAttempts = 0;
    await account.save();
    throw new Error('OTP has expired. Please request a new OTP.');
  }

  const isOtpValid = await comparePassword(String(otp).trim(), account.resetPasswordOtp);
  if (!isOtpValid) {
    throw new Error('Invalid or expired OTP');
  }

  const hashedPassword = await hashPassword(newPassword);

  account.password = hashedPassword;
  account.resetPasswordOtp = undefined;
  account.resetPasswordExpires = undefined;
  account.resetPasswordAttempts = 0;

  if (modelType === 'Driver') {
    account.mustChangePassword = false;
  }

  await account.save();

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
