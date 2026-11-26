import assert from 'assert';
import fs from 'fs';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { io as ioClient } from '../../frontend/node_modules/socket.io-client/build/esm/index.js';

dotenv.config({ path: new URL('../.env', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1') });

import app from '../app.js';
import { connectDB } from '../config/db.config.js';
import { generateToken } from '../utils/jwt.js';
import User from '../models/User.js';
import SecurityEvent from '../models/SecurityEvent.js';
import LoginLockout from '../models/LoginLockout.js';

const PORT = 5097;

const run = async () => {
  await connectDB();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || origin === 'http://localhost:5173') return callback(null, true);
        return callback(new Error('Socket.IO origin not allowed'));
      },
      credentials: true,
    },
  });
  io.on('connection', (s) => {
    s.on('sec:ping', (d) => s.emit('sec:pong', d));
  });
  app.locals.io = io;

  await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
  const baseUrl = `http://127.0.0.1:${PORT}`;
  const testRunStartedAt = new Date();
  console.log(`✅ Authorized defensive test server running at ${baseUrl}`);

  const bruteEmail = `brute${Date.now() % 100000}@test.com`;

  try {
    // 1. Helmet & CSP headers
    const htmlRes = await fetch(`${baseUrl}/`);
    assert.strictEqual(htmlRes.status, 200);
    assert(htmlRes.headers.get('content-security-policy')?.includes("object-src 'none'"));
    assert.strictEqual(htmlRes.headers.get('x-frame-options'), 'DENY');
    assert.strictEqual(htmlRes.headers.get('x-content-type-options'), 'nosniff');
    console.log('✅ 1. Helmet & enforced CSP headers verified');

    // 2. CORS untrusted origin rejected
    const corsRes = await fetch(`${baseUrl}/api/public/settings`, {
      headers: { Origin: 'https://malicious-attacker.example' },
    });
    assert.strictEqual(corsRes.status, 403, 'Untrusted CORS origin must be blocked');
    console.log('✅ 2. Unauthorized CORS origin rejected (403)');

    // 3. NoSQL Injection rejected
    const nosqlRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: { $ne: null }, password: 'anything' }),
    });
    assert.strictEqual(nosqlRes.status, 400, 'NoSQL operator injection must be blocked');

    const nosqlQueryRes = await fetch(`${baseUrl}/api/public/blogs?search[$gt]=`);
    assert.strictEqual(nosqlQueryRes.status, 400, 'NoSQL query operator injection must be blocked');
    console.log('✅ 3. NoSQL injection payloads blocked (400)');

    // 4. XSS, Command Injection, and Path Traversal rejected
    const xssRes = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '<script>alert(1)</script>',
        email: 'probe@example.com',
        message: 'hello',
      }),
    });
    assert.strictEqual(xssRes.status, 400, 'XSS script payload must be blocked');

    const cmdRes = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Probe; cat /etc/passwd',
        email: 'probe@example.com',
        message: 'hello',
      }),
    });
    assert.strictEqual(cmdRes.status, 400, 'Command injection payload must be blocked');

    const traversalRes = await fetch(`${baseUrl}/api/public/blogs?path=../../etc/passwd`);
    assert.strictEqual(traversalRes.status, 400, 'Path traversal query must be blocked');
    console.log('✅ 4. XSS, command injection, and path traversal payloads blocked (400)');

    // 5. CSRF cross-origin state-changing request rejected
    const csrfRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://evil-csrf.example',
        'Sec-Fetch-Site': 'cross-site',
      },
      body: JSON.stringify({}),
    });
    assert.strictEqual(csrfRes.status, 403, 'Untrusted cross-site POST must be blocked');
    console.log('✅ 5. CSRF untrusted cross-origin state-changing request blocked (403)');

    // 6. Malicious upload rejected (fake PNG / disguised script & SVG), valid PNG passes filter
    const loginRes = await fetch(`${baseUrl}/api/driver/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'verification@gmail.com', password: 'verify@123' }),
    });
    const loginJson = await loginRes.json();
    assert.strictEqual(loginRes.status, 200, 'Legitimate Flutter/demo driver login must still succeed');
    const driverToken = loginJson.data.token;

    const fakePngForm = new FormData();
    fakePngForm.append(
      'file',
      new Blob([Buffer.from('<html><script>alert(1)</script></html>')], { type: 'image/png' }),
      'evil.png'
    );
    const badUploadRes = await fetch(`${baseUrl}/api/driver/tickets`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${driverToken}` },
      body: fakePngForm,
    });
    // Driver tickets uses array('files', 5) or single('file') — also test memoryUpload directly on a driver doc route
    assert(badUploadRes.status >= 400 && badUploadRes.status < 500, 'Fake PNG content should be rejected cleanly');

    const badExtForm = new FormData();
    badExtForm.append('document', new Blob([Buffer.from('<svg onload=alert(1)>')], { type: 'image/svg+xml' }), 'xss.svg');
    const driverManagerRouteRes = await fetch(`${baseUrl}/api/drivers/upload-document`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${driverToken}` },
      body: badExtForm,
    });
    assert.strictEqual(driverManagerRouteRes.status, 403, 'Driver token must be blocked from manager document route (RBAC)');

    const superAdmin = await User.findOne({ role: 'SUPER_ADMIN' }).lean();
    assert(superAdmin, 'A SUPER_ADMIN user should exist in DB to test Admin Security Dashboard');
    const adminToken = generateToken({ id: superAdmin._id, role: 'SUPER_ADMIN' });

    const badExtAdminForm = new FormData();
    badExtAdminForm.append('document', new Blob([Buffer.from('<svg onload=alert(1)>')], { type: 'image/svg+xml' }), 'xss.svg');
    const badExtRes = await fetch(`${baseUrl}/api/drivers/upload-document`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: badExtAdminForm,
    });
    assert.strictEqual(badExtRes.status, 400, 'SVG/XSS upload must be rejected cleanly with 400');

    const spoofedPngForm = new FormData();
    spoofedPngForm.append('document', new Blob([Buffer.from('MZ\x90\x00not-a-png')], { type: 'image/png' }), 'malware.exe.png');
    const spoofedRes = await fetch(`${baseUrl}/api/drivers/upload-document`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: spoofedPngForm,
    });
    assert.strictEqual(spoofedRes.status, 400, 'Double extension / bad magic bytes must be rejected with 400');
    console.log('✅ 6. Malicious file uploads (SVG XSS, double extension, magic-byte mismatch) blocked (400)');

    // 7. RBAC enforcement & Admin Security Dashboard API
    const unauthSec = await fetch(`${baseUrl}/api/admin/security/events`);
    assert.strictEqual(unauthSec.status, 401);

    const driverSec = await fetch(`${baseUrl}/api/admin/security/events`, {
      headers: { Authorization: `Bearer ${driverToken}` },
    });
    assert.strictEqual(driverSec.status, 403, 'Driver token must not access Super Admin Security Dashboard');

    const adminSecRes = await fetch(`${baseUrl}/api/admin/security/events?limit=20`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(adminSecRes.status, 200);
    const adminSecBody = await adminSecRes.json();
    assert(Array.isArray(adminSecBody.data?.events) && adminSecBody.data.events.length > 0, 'Security dashboard must return real recorded events');
    assert.strictEqual(adminSecBody.data?.summary?.cspMode, 'enforce');

    // Verify no leaked secrets in recorded security events
    const serializedEvents = JSON.stringify(adminSecBody.data.events);
    assert(!serializedEvents.includes('verify@123'), 'Raw password must never appear in SecurityEvent logs');
    assert(!serializedEvents.includes(driverToken), 'Raw JWT must never appear in SecurityEvent logs');
    console.log('✅ 7. JWT/RBAC, Admin Security Dashboard API, and secret redaction verified');

    // 8. Brute-force lockout on synthetic non-demo identifier
    for (let i = 0; i < 5; i += 1) {
      await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: bruteEmail, password: `WrongPass!${i}` }),
      });
    }
    const lockedRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: bruteEmail, password: 'WrongPass!5' }),
    });
    assert.strictEqual(lockedRes.status, 429, '6th failed login must trigger temporary lockout (429)');
    assert(lockedRes.headers.get('retry-after'), 'Lockout response must include Retry-After header');
    console.log('✅ 8. Brute-force temporary login lockout (429 + Retry-After) verified');

    // 9. Socket.IO + Driver mobile dashboard + Audit log search
    const dashRes = await fetch(`${baseUrl}/api/driver/dashboard`, {
      headers: { Authorization: `Bearer ${driverToken}` },
    });
    assert.strictEqual(dashRes.status, 200);

    const auditRes = await fetch(`${baseUrl}/api/admin/audit-logs?search=Security`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(auditRes.status, 200);

    const pong = await new Promise((resolve, reject) => {
      const sock = ioClient(baseUrl, { transports: ['polling', 'websocket'] });
      const t = setTimeout(() => { sock.close(); reject(new Error('Socket timeout')); }, 5000);
      sock.on('connect', () => sock.emit('sec:ping', { ok: true }));
      sock.on('sec:pong', (d) => { clearTimeout(t); sock.close(); resolve(d); });
      sock.on('connect_error', (e) => { clearTimeout(t); sock.close(); reject(e); });
    });
    assert.strictEqual(pong?.ok, true);
    console.log('✅ 9. Driver mobile APIs, Audit Logs search, and Socket.IO verified');

    // Clean up temporary brute-force lockout record created by test #8
    await LoginLockout.deleteMany({ key: new RegExp(bruteEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') });
    // Keep real attack test telemetry or count how many events were recorded in this run
    const recentCount = await SecurityEvent.countDocuments({ createdAt: { $gte: testRunStartedAt } });
    console.log(`\n🎉 ALL DEFENSIVE SECURITY & MONITORING TESTS PASSED! (${recentCount} real security events recorded)`);
  } finally {
    await new Promise((resolve) => io.close(() => server.close(resolve)));
    await mongoose.disconnect();
  }
};

run().catch((err) => {
  console.error('❌ Security defense suite failed:', err);
  process.exit(1);
});
