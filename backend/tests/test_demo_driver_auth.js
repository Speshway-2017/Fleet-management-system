import assert from 'assert';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import app from '../app.js';
import { connectDB } from '../config/db.config.js';
import User from '../models/User.js';
import Driver from '../models/Driver.js';
import { seedDemoDriver } from '../utils/seedDemoDriver.js';

const DEMO_EMAIL = 'verification@gmail.com';
const DEMO_PASS = 'verify@123';
const DEMO_MOBILE = '9876543210';
const DEMO_OTP = '123456';

async function request(baseUrl, method, urlPath, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}${urlPath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function runTests() {
  await connectDB();

  // 1. Seed idempotency & duplicate prevention
  const firstSeed = await seedDemoDriver();
  assert.strictEqual(firstSeed.skipped, false);
  const secondSeed = await seedDemoDriver();
  assert.strictEqual(secondSeed.userAction, 'unchanged');
  assert.strictEqual(secondSeed.driverAction, 'unchanged');

  const userMatches = await User.find({ email: DEMO_EMAIL });
  const driverMatches = await Driver.find({ email: DEMO_EMAIL }).select('+password');

  assert.strictEqual(userMatches.length, 1, 'Expected exactly 1 User document for demo driver');
  assert.strictEqual(driverMatches.length, 1, 'Expected exactly 1 Driver document for demo driver');
  assert.strictEqual(userMatches[0].phone, DEMO_MOBILE);
  assert.strictEqual(driverMatches[0].phoneNumber, DEMO_MOBILE);
  assert.strictEqual(driverMatches[0].mobile, DEMO_MOBILE);
  assert.strictEqual(userMatches[0].role, 'DRIVER');
  assert.ok(userMatches[0].password.startsWith('$2'), 'User password must be bcrypt-hashed');
  assert.ok(driverMatches[0].password.startsWith('$2'), 'Driver password must be bcrypt-hashed');
  assert.strictEqual(await bcrypt.compare(DEMO_PASS, userMatches[0].password), true);
  assert.strictEqual(await bcrypt.compare(DEMO_PASS, driverMatches[0].password), true);
  console.log('✅ 1. Seed & bcrypt & duplicate prevention verified');

  // Start ephemeral HTTP server
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 2. Email/Password login via /api/auth/login
    const authLoginRes = await request(baseUrl, 'POST', '/api/auth/login', {
      email: DEMO_EMAIL,
      password: DEMO_PASS,
    });
    assert.strictEqual(authLoginRes.status, 200, `Expected 200, got ${authLoginRes.status}: ${JSON.stringify(authLoginRes.json)}`);
    assert.ok(authLoginRes.json.data?.token, 'Expected JWT token from /api/auth/login');
    assert.strictEqual(authLoginRes.json.data?.user?.role, 'DRIVER');
    const authToken = authLoginRes.json.data.token;
    console.log('✅ 2. POST /api/auth/login (email/password) verified');

    // 3. Email/Password and Mobile/Password login via /api/driver/login
    const driverEmailLogin = await request(baseUrl, 'POST', '/api/driver/login', {
      identifier: DEMO_EMAIL,
      password: DEMO_PASS,
    });
    assert.strictEqual(driverEmailLogin.status, 200);
    assert.ok(driverEmailLogin.json.data?.token);

    const driverPhoneLogin = await request(baseUrl, 'POST', '/api/driver/login', {
      identifier: DEMO_MOBILE,
      password: DEMO_PASS,
    });
    assert.strictEqual(driverPhoneLogin.status, 200);
    assert.ok(driverPhoneLogin.json.data?.token);
    console.log('✅ 3. POST /api/driver/login (email/password & mobile/password) verified');

    // 4. Mobile OTP login via /api/driver/login, /api/driver/verify-otp, /api/auth/login-otp
    const driverOtpLogin = await request(baseUrl, 'POST', '/api/driver/login', {
      mobile: DEMO_MOBILE,
      otp: DEMO_OTP,
    });
    assert.strictEqual(driverOtpLogin.status, 200, `Expected 200 on mobile OTP login: ${JSON.stringify(driverOtpLogin.json)}`);
    assert.ok(driverOtpLogin.json.data?.token);
    const otpDriverToken = driverOtpLogin.json.data.token;

    const verifyDriverOtpRes = await request(baseUrl, 'POST', '/api/driver/verify-otp', {
      mobile: DEMO_MOBILE,
      otp: DEMO_OTP,
    });
    assert.strictEqual(verifyDriverOtpRes.status, 200);
    assert.ok(verifyDriverOtpRes.json.data?.token);

    const authOtpLogin = await request(baseUrl, 'POST', '/api/auth/login-otp', {
      mobile: DEMO_MOBILE,
      otp: DEMO_OTP,
    });
    assert.strictEqual(authOtpLogin.status, 200);
    assert.ok(authOtpLogin.json.data?.token);
    console.log('✅ 4. Mobile OTP login (123456) verified across driver & auth endpoints');

    // 4b. Forgot-password Send Verification OTP flow (both email & mobile)
    const forgotEmailRes = await request(baseUrl, 'POST', '/api/auth/forgot-password', {
      email: DEMO_EMAIL,
    });
    assert.strictEqual(forgotEmailRes.status, 200, `Expected 200 on forgot-password email: ${JSON.stringify(forgotEmailRes.json)}`);
    assert.strictEqual(forgotEmailRes.json.data?.email, DEMO_EMAIL);

    const forgotMobileRes = await request(baseUrl, 'POST', '/api/auth/forgot-password', {
      mobile: DEMO_MOBILE,
    });
    assert.strictEqual(forgotMobileRes.status, 200, `Expected 200 on forgot-password mobile: ${JSON.stringify(forgotMobileRes.json)}`);

    const verifyForgotOtp = await request(baseUrl, 'POST', '/api/auth/verify-otp', {
      email: DEMO_EMAIL,
      otp: DEMO_OTP,
    });
    assert.strictEqual(verifyForgotOtp.status, 200);
    console.log('✅ 4b. Forgot-password Send Verification OTP flow verified (no role enum failure)');

    // 5. Reject wrong OTP for demo user
    const wrongOtpRes = await request(baseUrl, 'POST', '/api/driver/login', {
      mobile: DEMO_MOBILE,
      otp: '999999',
    });
    assert.strictEqual(wrongOtpRes.status, 401);
    console.log('✅ 5. Wrong OTP rejected cleanly');

    // 6. Reject fixed OTP 123456 for non-demo user
    const nonDemoUser = await User.findOne({ email: { $ne: DEMO_EMAIL } }).lean();
    if (nonDemoUser) {
      const nonDemoOtpRes = await request(baseUrl, 'POST', '/api/auth/login-otp', {
        email: nonDemoUser.email,
        otp: DEMO_OTP,
      });
      assert.strictEqual(nonDemoOtpRes.status, 401, 'Fixed OTP must never work for non-demo users');
    }
    console.log('✅ 6. Fixed OTP rejected for non-demo users');

    // 7. Reject fixed OTP 123456 in production mode
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const prodOtpRes = await request(baseUrl, 'POST', '/api/driver/login', {
        mobile: DEMO_MOBILE,
        otp: DEMO_OTP,
      });
      assert.strictEqual(prodOtpRes.status, 401, 'Fixed OTP must NEVER be enabled in production');

      const prodAuthOtpRes = await request(baseUrl, 'POST', '/api/auth/login-otp', {
        mobile: DEMO_MOBILE,
        otp: DEMO_OTP,
      });
      assert.strictEqual(prodAuthOtpRes.status, 401, 'Fixed OTP must NEVER be enabled in production');
    } finally {
      process.env.NODE_ENV = prevEnv;
    }
    console.log('✅ 7. Fixed OTP strictly disabled when NODE_ENV=production');

    // 8. Driver profile & dashboard load correctly with BOTH tokens
    for (const [label, tok] of [
      ['authToken', authToken],
      ['otpDriverToken', otpDriverToken],
    ]) {
      const authProfile = await request(baseUrl, 'GET', '/api/auth/profile', null, tok);
      assert.strictEqual(authProfile.status, 200, `${label} /api/auth/profile failed`);
      assert.strictEqual(authProfile.json.data?.role, 'DRIVER');

      const drvProfile = await request(baseUrl, 'GET', '/api/driver/profile', null, tok);
      assert.strictEqual(drvProfile.status, 200, `${label} /api/driver/profile failed`);
      assert.strictEqual(drvProfile.json.data?.email, DEMO_EMAIL);
      assert.strictEqual(drvProfile.json.data?.phone, DEMO_MOBILE);

      const drvDashboard = await request(baseUrl, 'GET', '/api/driver/dashboard', null, tok);
      assert.strictEqual(drvDashboard.status, 200, `${label} /api/driver/dashboard failed`);
      assert.ok(typeof drvDashboard.json.data?.activeTrips === 'number');
      assert.ok(typeof drvDashboard.json.data?.upcomingTrips === 'number');
      assert.ok(typeof drvDashboard.json.data?.completedTrips === 'number');
    }
    console.log('✅ 8. Driver profile & dashboard endpoints verified for both tokens');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runTests()
  .then(() => {
    console.log('\n🎉 ALL DEMO DRIVER AUTH TESTS PASSED!');
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('\n❌ DEMO DRIVER AUTH TEST FAILED:', err);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  });

