import { createUser, findUserByEmail, findUserById, updateUser } from '../repositories/auth.repository.js';
import { comparePassword, hashPassword } from '../utils/hashPassword.js';
import { generateToken } from '../utils/jwt.js';
import { generateOTP } from '../utils/generateOTP.js';
import sendEmail from '../utils/email.js';
import crypto from 'crypto'; // We can use crypto to hash OTP before storing, or just store plain as it's short lived. Let's hash it for security.

export const loginUser = async ({ email, password, role }) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('No account found with this email');

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) throw new Error('Incorrect password');

  if (role && user.role !== role) {
    throw new Error('Role mismatch');
  }

  const token = generateToken({ id: user._id, role: user.role });
  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
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

export const changeUserPassword = async (email, oldPassword, newPassword) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('User not found');

  const isPasswordValid = await comparePassword(oldPassword, user.password);
  if (!isPasswordValid) throw new Error('Old password is incorrect');

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

export const processForgotPassword = async (email) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('No user found with this email'); // In a real app we might want to return success anyway to prevent email enumeration, but throwing is fine here for simplicity

  const otp = generateOTP(6);
  // Hash the OTP
  const hashedOtp = await hashPassword(otp);

  // Set OTP expiry to 10 minutes
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  user.resetPasswordOtp = hashedOtp;
  user.resetPasswordExpires = expiry;
  await user.save();

  // Print the OTP to the console instead of sending an email as requested
  console.log(`\n================================`);
  console.log(`🔑 PASSWORD RESET OTP GENERATED`);
  console.log(`📧 User: ${user.email}`);
  console.log(`🔢 OTP: ${otp}`);
  console.log(`================================\n`);
};

export const verifyUserOtp = async (email, otp) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('Invalid or expired OTP');

  if (!user.resetPasswordOtp || !user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
    throw new Error('Invalid or expired OTP');
  }

  const isOtpValid = await comparePassword(otp, user.resetPasswordOtp);
  if (!isOtpValid) throw new Error('Invalid or expired OTP');

  return true;
};

export const resetUserPassword = async (email, otp, newPassword) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('Invalid or expired OTP');

  if (!user.resetPasswordOtp || !user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
    throw new Error('Invalid or expired OTP');
  }

  const isOtpValid = await comparePassword(otp, user.resetPasswordOtp);
  if (!isOtpValid) throw new Error('Invalid or expired OTP');

  const hashedPassword = await hashPassword(newPassword);

  user.password = hashedPassword;
  user.resetPasswordOtp = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
};
