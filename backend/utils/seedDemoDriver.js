import mongoose from 'mongoose';
import User from '../models/User.js';
import Driver from '../models/Driver.js';
import { hashPassword, comparePassword } from './hashPassword.js';
import { DEMO_DRIVER_CREDENTIALS, isDemoOtpAllowed } from './demoAuth.js';

const DEMO_PASSWORD = process.env.DEMO_DRIVER_PASSWORD || 'verify@123';

/**
 * Idempotently seeds the demo DRIVER account in both User and Driver models.
 * - Hashes password with bcrypt.
 * - Prevents duplicate user/driver creation.
 * - Skipped automatically in production unless ALLOW_DEMO_SEED=true.
 */
export const seedDemoDriver = async ({ force = false } = {}) => {
  const isProd = String(process.env.NODE_ENV || 'development').trim().toLowerCase() === 'production';
  if (isProd && !force && process.env.ALLOW_DEMO_SEED !== 'true') {
    return { skipped: true, reason: 'production_environment' };
  }
  if (!force && !isDemoOtpAllowed()) {
    return { skipped: true, reason: 'demo_mode_disabled' };
  }

  try {
    const email = DEMO_DRIVER_CREDENTIALS.email;
    const mobile = DEMO_DRIVER_CREDENTIALS.mobile;

    const [existingUser, existingDriver, sampleManager] = await Promise.all([
      User.findOne({ email }),
      Driver.findOne({ email }).select('+password'),
      User.findOne({ role: 'FLEET_MANAGER', isActive: { $ne: false } })
        .select('_id organization')
        .lean(),
    ]);

    const sharedId = existingDriver?._id || existingUser?._id || new mongoose.Types.ObjectId();
    const hashedPassword = await hashPassword(DEMO_PASSWORD);
    const managerId = existingDriver?.assignedManager || sampleManager?._id || null;
    const orgId = existingUser?.organization || sampleManager?.organization || null;

    let userAction = 'unchanged';
    let userDoc = existingUser;

    if (!userDoc) {
      userDoc = await User.create({
        _id: sharedId,
        name: DEMO_DRIVER_CREDENTIALS.fullName,
        email,
        password: hashedPassword,
        role: DEMO_DRIVER_CREDENTIALS.role,
        phone: mobile,
        organization: orgId,
        driverProfile: sharedId,
        isActive: true,
        status: 'Active',
      });
      userAction = 'created';
    } else {
      let dirty = false;
      if (userDoc.role !== DEMO_DRIVER_CREDENTIALS.role) {
        userDoc.role = DEMO_DRIVER_CREDENTIALS.role;
        dirty = true;
      }
      if (userDoc.phone !== mobile) {
        userDoc.phone = mobile;
        dirty = true;
      }
      if (!userDoc.isActive) {
        userDoc.isActive = true;
        dirty = true;
      }
      if (userDoc.status !== 'Active') {
        userDoc.status = 'Active';
        dirty = true;
      }
      if (!userDoc.driverProfile) {
        userDoc.driverProfile = sharedId;
        dirty = true;
      }
      const pwdOk = userDoc.password ? await comparePassword(DEMO_PASSWORD, userDoc.password) : false;
      if (!pwdOk) {
        userDoc.password = hashedPassword;
        dirty = true;
      }
      if (dirty) {
        await userDoc.save();
        userAction = 'updated';
      }
    }

    let driverAction = 'unchanged';
    let driverDoc = existingDriver;

    if (!driverDoc) {
      const twoYearsLater = new Date();
      twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2);

      // Guard against unique index collisions on employeeId / licenseNumber
      let empId = DEMO_DRIVER_CREDENTIALS.employeeId;
      if (await Driver.exists({ employeeId: empId })) {
        empId = `EMP-VER-${Date.now().toString().slice(-6)}`;
      }
      let licNum = DEMO_DRIVER_CREDENTIALS.licenseNumber;
      if (await Driver.exists({ licenseNumber: licNum })) {
        licNum = `DL-VER-${Date.now().toString().slice(-6)}`;
      }

      driverDoc = await Driver.create({
        _id: sharedId,
        firstName: DEMO_DRIVER_CREDENTIALS.firstName,
        lastName: DEMO_DRIVER_CREDENTIALS.lastName,
        fullName: DEMO_DRIVER_CREDENTIALS.fullName,
        email,
        phoneNumber: mobile,
        mobile,
        password: hashedPassword,
        mustChangePassword: false,
        accountStatus: 'Active',
        status: 'Active',
        licenseNumber: licNum,
        licenseType: 'HMV',
        licenseExpiry: twoYearsLater,
        employeeId: empId,
        driverStatus: 'AVAILABLE',
        isOnline: false,
        isDuty: false,
        assignedManager: managerId,
        branch: 'Headquarters',
        currentLocation: 'Bengaluru',
        driverLocation: 'Bengaluru',
      });
      driverAction = 'created';
    } else {
      let dirty = false;
      if (driverDoc.phoneNumber !== mobile) {
        driverDoc.phoneNumber = mobile;
        dirty = true;
      }
      if (driverDoc.mobile !== mobile) {
        driverDoc.mobile = mobile;
        dirty = true;
      }
      if (driverDoc.accountStatus !== 'Active') {
        driverDoc.accountStatus = 'Active';
        dirty = true;
      }
      if (driverDoc.status !== 'Active') {
        driverDoc.status = 'Active';
        dirty = true;
      }
      if (driverDoc.mustChangePassword) {
        driverDoc.mustChangePassword = false;
        dirty = true;
      }
      const pwdOk = driverDoc.password ? await comparePassword(DEMO_PASSWORD, driverDoc.password) : false;
      if (!pwdOk) {
        driverDoc.password = hashedPassword;
        dirty = true;
      }
      if (dirty) {
        await driverDoc.save();
        driverAction = 'updated';
      }
    }

    console.log(
      `🌱 Demo DRIVER ready (${email} / ${mobile}) — User: ${userAction}, Driver: ${driverAction}`
    );

    return {
      skipped: false,
      userAction,
      driverAction,
      userId: userDoc._id.toString(),
      driverId: driverDoc._id.toString(),
      email,
      mobile,
      role: DEMO_DRIVER_CREDENTIALS.role,
    };
  } catch (error) {
    console.error('❌ Failed to seed demo driver:', error.message);
    throw error;
  }
};
