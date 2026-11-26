/**
 * Central Content Security Policy (CSP) directive builder shared across
 * Express (Helmet), Vite dev/preview headers, and static deployment templates.
 */

const normalizeOrigin = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  try {
    return new URL(trimmed).origin;
  } catch {
    return '';
  }
};

const toWebSocketOrigin = (httpOrigin) => {
  if (!httpOrigin) return '';
  if (httpOrigin.startsWith('https://')) {
    return httpOrigin.replace(/^https:\/\//, 'wss://');
  }
  if (httpOrigin.startsWith('http://')) {
    return httpOrigin.replace(/^http:\/\//, 'ws://');
  }
  return '';
};

const dedupe = (items) => [...new Set(items.filter(Boolean))];

export const getTrustedOrigins = (env = process.env) => {
  const isProduction = String(env.NODE_ENV || 'development').trim().toLowerCase() === 'production';

  const configuredFrontendOrigins = dedupe([
    normalizeOrigin(env.CLIENT_URL),
    normalizeOrigin(env.FRONTEND_URL),
    'https://fleet.speshway.site',
    ...(env.CSP_EXTRA_FRONTEND_ORIGINS
      ? String(env.CSP_EXTRA_FRONTEND_ORIGINS).split(',').map(normalizeOrigin)
      : []),
  ]);

  const configuredApiOrigins = dedupe([
    normalizeOrigin(env.API_URL),
    normalizeOrigin(env.BACKEND_URL),
    'https://fleet.speshway.site',
    ...(env.CSP_EXTRA_API_ORIGINS
      ? String(env.CSP_EXTRA_API_ORIGINS).split(',').map(normalizeOrigin)
      : []),
  ]);

  const devLocalApiOrigins = isProduction
    ? []
    : [
        'http://localhost:5000',
        'http://127.0.0.1:5000',
      ];

  const devLocalFrontendOrigins = isProduction
    ? []
    : [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
      ];

  const apiHttpOrigins = dedupe([...configuredApiOrigins, ...devLocalApiOrigins]);
  const apiWsOrigins = dedupe(apiHttpOrigins.map(toWebSocketOrigin));
  const frontendHttpOrigins = dedupe([...configuredFrontendOrigins, ...devLocalFrontendOrigins]);
  const frontendWsOrigins = dedupe(frontendHttpOrigins.map(toWebSocketOrigin));

  return {
    isProduction,
    apiHttpOrigins,
    apiWsOrigins,
    frontendHttpOrigins,
    frontendWsOrigins,
  };
};

export const buildCspDirectives = ({
  env = process.env,
  allowStyleUnsafeInline = false,
  reportUri = '/api/security/csp-report',
  frameAncestorsOverride = null,
} = {}) => {
  const {
    isProduction,
    apiHttpOrigins,
    apiWsOrigins,
    frontendWsOrigins,
  } = getTrustedOrigins(env);

  const scriptSrc = dedupe([
    "'self'",
    'https://translate.google.com',
    'https://translate.googleapis.com',
    'https://translate-pa.googleapis.com',
    'https://www.google.com',
    'https://www.gstatic.com',
    // Exact SHA-256 of Google Translate's internal about:srcdoc bootstrap script
    "'sha256-R6kjt5FwTd5vAw94Q08NLDZsSaGTzg4NsdIfKtECSp0='",
  ]);

  const styleSrc = dedupe([
    "'self'",
    ...(allowStyleUnsafeInline ? ["'unsafe-inline'"] : []),
    'https://fonts.googleapis.com',
    'https://www.gstatic.com',
    'https://translate.googleapis.com',
  ]);

  const imgSrc = dedupe([
    "'self'",
    'data:',
    'blob:',
    ...apiHttpOrigins,
    'https://res.cloudinary.com',
    'https://*.tile.openstreetmap.org',
    'https://*.basemaps.cartocdn.com',
    'https://server.arcgisonline.com',
    'https://api.mapbox.com',
    'https://cdnjs.cloudflare.com',
    'https://images.unsplash.com',
    'https://imagedelivery.net',
    'https://www.gstatic.com',
    'https://www.google.com',
    'https://translate.google.com',
    'https://translate.googleapis.com',
    'https://fonts.gstatic.com',
  ]);

  const fontSrc = dedupe([
    "'self'",
    'data:',
    'https://fonts.gstatic.com',
  ]);

  const connectSrc = dedupe([
    "'self'",
    ...apiHttpOrigins,
    ...apiWsOrigins,
    ...frontendWsOrigins,
    'https://api.cloudinary.com',
    'https://res.cloudinary.com',
    'https://fcm.googleapis.com',
    'https://firebaseinstallations.googleapis.com',
    'https://firebase.googleapis.com',
    'https://api.iconify.design',
    'https://api.unisvg.com',
    'https://api.simplesvg.com',
    'https://api.mapbox.com',
    'https://events.mapbox.com',
    'https://router.project-osrm.org',
    'https://nominatim.openstreetmap.org',
    'https://photon.komoot.io',
    'https://translate.googleapis.com',
    'https://translate-pa.googleapis.com',
    'https://translate.google.com',
    'https://www.google.com',
  ]);

  const frameSrc = dedupe([
    "'self'",
    'data:',
    'blob:',
    ...apiHttpOrigins,
    'https://res.cloudinary.com',
    'https://www.google.com',
    'https://recaptcha.google.com',
    'https://www.gstatic.com',
    'https://translate.google.com',
  ]);

  const workerSrc = ["'self'", 'blob:'];
  const frameAncestors = frameAncestorsOverride || ["'none'"];

  const directives = {
    defaultSrc: ["'self'"],
    scriptSrc,
    styleSrc,
    imgSrc,
    fontSrc,
    connectSrc,
    frameSrc,
    workerSrc,
    frameAncestors,
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    ...(reportUri ? { reportUri: [reportUri] } : {}),
    upgradeInsecureRequests: isProduction && env.CSP_UPGRADE_INSECURE === 'true' ? [] : null,
  };

  return directives;
};

const toKebabCase = (str) => str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

export const serializeCspDirectives = (directives) => {
  const parts = [];
  for (const [key, value] of Object.entries(directives)) {
    if (value === null || value === undefined) continue;
    const directiveName = toKebabCase(key);
    if (Array.isArray(value)) {
      parts.push(value.length === 0 ? directiveName : `${directiveName} ${value.join(' ')}`);
    }
  }
  return parts.join('; ');
};

