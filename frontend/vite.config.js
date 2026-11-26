import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { buildCspDirectives, serializeCspDirectives } from '../backend/config/csp.config.js'

const isReportOnly = String(process.env.CSP_MODE || 'enforce').toLowerCase() === 'report-only';
const allowStyleUnsafeInline = String(process.env.CSP_ALLOW_STYLE_INLINE || 'true').toLowerCase() === 'true';
const apiOrigin = process.env.VITE_API_BASE_URL
  ? new URL(process.env.VITE_API_BASE_URL).origin
  : 'http://localhost:5000';

// Dev server injects @vitejs/plugin-react HMR preamble inline script; allow only its exact SHA-256 hash in dev.
const devDirectives = buildCspDirectives({
  env: { ...process.env, NODE_ENV: 'development', API_URL: apiOrigin },
  allowStyleUnsafeInline,
  reportUri: process.env.VITE_CSP_REPORT_URI || null,
});
devDirectives.scriptSrc = [
  ...devDirectives.scriptSrc,
  "'sha256-Z2/iFzh9VMlVkEOar1f/oSHWwQk3ve1qk/C2WdsC4Xk='",
];

const previewDirectives = buildCspDirectives({
  env: { ...process.env, NODE_ENV: 'development', API_URL: apiOrigin },
  allowStyleUnsafeInline,
  reportUri: process.env.VITE_CSP_REPORT_URI || null,
});

const buildSecurityHeaders = (directives) => ({
  [isReportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy']:
    serializeCspDirectives(directives),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    headers: buildSecurityHeaders(devDirectives),
  },
  preview: {
    headers: buildSecurityHeaders(previewDirectives),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
