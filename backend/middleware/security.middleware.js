import express from 'express';
import helmet from 'helmet';
import {
  buildCspDirectives,
  getTrustedOrigins,
  serializeCspDirectives,
} from '../config/csp.config.js';
import { recordSecurityEvent } from '../services/securityMonitor.service.js';

export const isCspReportOnly = (env = process.env) => {
  return String(env.CSP_MODE || 'enforce').trim().toLowerCase() === 'report-only';
};

/**
 * Helmet security middleware configured with Fleet Management CSP policy.
 * Cross-Origin-Resource-Policy is set to 'cross-origin' so uploaded assets
 * served by the backend can render in the decoupled frontend client cleanly.
 */
export const createSecurityMiddleware = (env = process.env) => {
  const reportOnly = isCspReportOnly(env);
  const allowStyleUnsafeInline = String(env.CSP_ALLOW_STYLE_INLINE || 'true').toLowerCase() === 'true';
  const directives = buildCspDirectives({
    env,
    allowStyleUnsafeInline,
    reportUri: '/api/security/csp-report',
  });

  return helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives,
      reportOnly,
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginEmbedderPolicy: false,
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  });
};

/**
 * Upload preview routes (`/uploads` and `/api/uploads`) may be embedded in
 * `<iframe src="...">` by trusted Fleet frontend origins for PDF previews.
 */
export const uploadsFrameSecurityMiddleware = (req, res, next) => {
  const { frontendHttpOrigins } = getTrustedOrigins(process.env);
  const allowStyleUnsafeInline = String(process.env.CSP_ALLOW_STYLE_INLINE || 'true').toLowerCase() === 'true';
  const directives = buildCspDirectives({
    env: process.env,
    allowStyleUnsafeInline,
    reportUri: '/api/security/csp-report',
    frameAncestorsOverride: ["'self'", ...frontendHttpOrigins],
  });

  const headerName = isCspReportOnly(process.env)
    ? 'Content-Security-Policy-Report-Only'
    : 'Content-Security-Policy';

  res.removeHeader('X-Frame-Options');
  res.setHeader(headerName, serializeCspDirectives(directives));
  next();
};

export const cspReportBodyParser = express.json({
  type: ['application/json', 'application/csp-report', 'application/reports+json'],
  limit: '64kb',
});

export const cspReportHandler = async (req, res) => {
  const body = req.body;
  const reports = Array.isArray(body) ? body : [body];

  for (const entry of reports) {
    if (!entry || typeof entry !== 'object') continue;
    const report = entry['csp-report'] || entry.body || entry;
    const summary = {
      documentUri: report['document-uri'] || report.documentURL,
      violatedDirective: report['violated-directive'] || report.effectiveDirective,
      blockedUri: report['blocked-uri'] || report.blockedURL,
      sourceFile: report['source-file'] || report.sourceFile,
      lineNumber: report['line-number'] || report.lineNumber,
    };
    console.warn('[CSP VIOLATION REPORT]', JSON.stringify(summary));

    await recordSecurityEvent({
      category: 'CSP_VIOLATION',
      severity: 'Medium',
      status: isCspReportOnly(process.env) ? 'Monitored' : 'Blocked',
      req,
      path: summary.documentUri || '/api/security/csp-report',
      reason: `CSP violation on ${summary.violatedDirective || 'unknown directive'} (${summary.blockedUri || 'unknown'})`,
      details: summary,
    });
  }

  return res.status(204).end();
};

