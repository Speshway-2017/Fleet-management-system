import assert from 'assert';
import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { io as ioClient } from '../../frontend/node_modules/socket.io-client/build/esm/index.js';

dotenv.config({ path: new URL('../.env', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1') });

import app from '../app.js';
import { connectDB } from '../config/db.config.js';

const PORT = 5098;
const CDP_PORT = 9226;

const run = async () => {
  await connectDB();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: (origin, cb) => cb(null, true),
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('csp:ping', (payload) => {
      socket.emit('csp:pong', { ok: true, echo: payload });
    });
  });

  app.locals.io = io;

  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${PORT}`;
  console.log(`✅ Test Express + Socket.IO server listening at ${baseUrl}`);

  try {
    // 1. Verify HTML & API CSP enforcement headers
    const htmlRes = await fetch(`${baseUrl}/`);
    assert.strictEqual(htmlRes.status, 200, 'Frontend SPA HTML should return 200');
    const htmlCsp = htmlRes.headers.get('content-security-policy');
    assert(htmlCsp, 'Content-Security-Policy header must be present on frontend HTML');
    assert(!htmlRes.headers.get('content-security-policy-report-only'), 'Enforce mode should not send Report-Only header');
    assert.strictEqual(htmlRes.headers.get('x-frame-options'), 'DENY');
    assert.strictEqual(htmlRes.headers.get('x-content-type-options'), 'nosniff');
    assert.strictEqual(htmlRes.headers.get('cross-origin-resource-policy'), 'cross-origin');

    for (const directive of [
      'default-src',
      'script-src',
      'style-src',
      'img-src',
      'font-src',
      'connect-src',
      'frame-ancestors',
      'object-src',
    ]) {
      assert(htmlCsp.includes(directive), `Missing directive ${directive}`);
    }
    const scriptDirective = htmlCsp.split(';').find((p) => p.trim().startsWith('script-src')) || '';
    assert(!scriptDirective.includes('unsafe-inline'), 'script-src must not include unsafe-inline');
    assert(!scriptDirective.includes('unsafe-eval'), 'script-src must not include unsafe-eval');
    assert(htmlCsp.includes("object-src 'none'"), "object-src must be 'none'");
    assert(htmlCsp.includes("frame-ancestors 'none'"), "frame-ancestors on HTML must be 'none'");
    console.log('✅ 1. Enforced CSP & security headers verified on frontend HTML');

    // 2. Verify /uploads frame-ancestors allows trusted frontend frames & CORS/CORP
    const uploadRes = await fetch(`${baseUrl}/api/uploads/sample-rc.png`, { redirect: 'manual' });
    const uploadCsp = uploadRes.headers.get('content-security-policy') || '';
    assert(uploadCsp.includes('http://localhost:5173'), '/api/uploads frame-ancestors should allow trusted frontend origins');
    assert.strictEqual(uploadRes.headers.get('x-frame-options'), null, 'X-Frame-Options should be omitted on /api/uploads');
    console.log('✅ 2. Upload iframe CSP policy verified');

    // 3. Verify API login, dashboards, and Flutter mobile routes under Helmet CSP
    const loginRes = await fetch(`${baseUrl}/api/driver/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'verification@gmail.com', password: 'verify@123' }),
    });
    const loginBody = await loginRes.json();
    assert.strictEqual(loginRes.status, 200, `Driver login failed: ${JSON.stringify(loginBody)}`);
    assert(loginBody.data?.token, 'Driver login token missing');
    const token = loginBody.data.token;

    const dashRes = await fetch(`${baseUrl}/api/driver/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(dashRes.status, 200, 'Driver dashboard API should succeed');
    const profileRes = await fetch(`${baseUrl}/api/driver/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(profileRes.status, 200, 'Driver profile API should succeed');
    console.log('✅ 3. Auth, driver mobile APIs, and dashboard endpoints verified');

    // 4. Verify CSP report receiver endpoint
    const reportRes = await fetch(`${baseUrl}/api/security/csp-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/csp-report' },
      body: JSON.stringify({
        'csp-report': {
          'document-uri': `${baseUrl}/`,
          'violated-directive': 'img-src',
          'blocked-uri': 'https://untrusted.example/pixel.png',
        },
      }),
    });
    assert.strictEqual(reportRes.status, 204, 'CSP report endpoint should return 204');
    console.log('✅ 4. CSP report collector endpoint verified');

    // 5. Verify Socket.IO connection & real-time messaging under Helmet CSP
    const pongPayload = await new Promise((resolve, reject) => {
      const client = ioClient(baseUrl, { transports: ['polling', 'websocket'] });
      const timer = setTimeout(() => {
        client.close();
        reject(new Error('Socket.IO timeout'));
      }, 5000);
      client.on('connect', () => {
        client.emit('csp:ping', { check: 'csp-ok' });
      });
      client.on('csp:pong', (data) => {
        clearTimeout(timer);
        client.close();
        resolve(data);
      });
      client.on('connect_error', (err) => {
        clearTimeout(timer);
        client.close();
        reject(err);
      });
    });
    assert.strictEqual(pongPayload?.ok, true);
    console.log('✅ 5. Socket.IO polling/websocket verified');

    // 6. Verify built React app in headless Chrome under ENFORCED CSP (0 violations on app origin)
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    if (fs.existsSync(chromePath)) {
      const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'csp-enforce-'));
      const chrome = spawn(chromePath, [
        '--headless=new',
        `--remote-debugging-port=${CDP_PORT}`,
        `--user-data-dir=${userDataDir}`,
        '--no-first-run',
        '--no-default-browser-check',
        'about:blank',
      ], { stdio: 'ignore' });

      await new Promise((r) => setTimeout(r, 1500));
      const targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json`)).json();
      const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
      const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
      await new Promise((r) => ws.addEventListener('open', r));

      let msgId = 0;
      const cdp = (method, params = {}) =>
        new Promise((resolve) => {
          const id = ++msgId;
          const onMsg = (ev) => {
            const d = JSON.parse(ev.data);
            if (d.id === id) {
              ws.removeEventListener('message', onMsg);
              resolve(d);
            }
          };
          ws.addEventListener('message', onMsg);
          ws.send(JSON.stringify({ id, method, params }));
        });

      await cdp('Page.enable');
      await cdp('Runtime.enable');
      await cdp('Page.addScriptToEvaluateOnNewDocument', {
        source: `window.__cspViolations = []; window.__pageErrors = []; document.addEventListener('securitypolicyviolation', (e) => { window.__cspViolations.push({ directive: e.effectiveDirective, blockedURI: e.blockedURI, sourceFile: e.sourceFile }); }); window.addEventListener('error', (e) => window.__pageErrors.push(e.message));`,
      });

      for (const route of ['/', '/login', '/contact', '/privacy-policy']) {
        await cdp('Page.navigate', { url: `${baseUrl}${route}` });
        await new Promise((r) => setTimeout(r, 2500));
        const res = await cdp('Runtime.evaluate', {
          expression: 'JSON.stringify({ violations: window.__cspViolations, errors: window.__pageErrors, rootHtmlLen: (document.getElementById("root")?.innerHTML || "").length })',
          returnByValue: true,
        });
        const parsed = JSON.parse(res.result.result.value);
        assert(parsed.rootHtmlLen > 50, `React root failed to render on ${route}`);
        const appViolations = parsed.violations.filter(
          (v) => !String(v.sourceFile || '').includes('translate.googleapis.com')
        );
        assert.strictEqual(
          appViolations.length,
          0,
          `Unexpected app CSP violations on ${route}: ${JSON.stringify(appViolations)}`
        );
      }

      ws.close();
      chrome.kill();
      await new Promise((r) => setTimeout(r, 500));
      try {
        fs.rmSync(userDataDir, { recursive: true, force: true });
      } catch {}
      console.log('✅ 6. Headless Chrome enforced-CSP verification passed (0 app script/eval/style violations, React rendered all routes)');
    }

    console.log('\n🎉 ALL CSP SECURITY & INTEGRATION TESTS PASSED!');
  } finally {
    await new Promise((resolve) => io.close(() => server.close(resolve)));
    await mongoose.disconnect();
  }
};

run().catch((err) => {
  console.error('❌ CSP verification failed:', err);
  process.exit(1);
});

