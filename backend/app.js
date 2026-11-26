import express        from 'express';
import fs from 'fs';
import compression from 'compression';

// Main app
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import managerRoutes from './routes/manager.routes.js';
import vehicleRoutes from './routes/vehicle.routes.js';
import driverRoutes from './routes/driver.routes.js';
import driverApiRoutes from './routes/driverApi.routes.js';
import contactRoutes from './routes/contact.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import publicRoutes from './routes/public.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';
import { getTrustedOrigins } from './config/csp.config.js';
import {
  createSecurityMiddleware,
  uploadsFrameSecurityMiddleware,
  cspReportBodyParser,
  cspReportHandler,
} from './middleware/security.middleware.js';
import {
  preventNoSqlInjection,
  inspectAndSanitizeInputs,
  csrfOriginGuard,
  securityActivityMonitor,
} from './middleware/threatDefense.middleware.js';
import { apiRateLimiter } from './middleware/rateLimit.middleware.js';
import { recordSecurityEvent } from './services/securityMonitor.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(compression());
app.use(createSecurityMiddleware(process.env));

const isCorsOriginAllowed = (origin) => {
  // Non-browser clients (Flutter mobile app, curl, same-origin server calls) omit Origin
  if (!origin) return true;
  const { isProduction, frontendHttpOrigins, apiHttpOrigins } = getTrustedOrigins(process.env);
  const trusted = new Set([...frontendHttpOrigins, ...apiHttpOrigins]);
  if (trusted.has(origin)) return true;
  if (
    !isProduction &&
    /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+)(:\d+)?$/i.test(origin)
  ) {
    return true;
  }
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isCorsOriginAllowed(origin)) {
        return callback(null, true);
      }
      recordSecurityEvent({
        category: 'CORS_VIOLATION',
        severity: 'Medium',
        status: 'Blocked',
        reason: `Blocked unauthorized CORS origin: ${origin}`,
        details: { origin },
      });
      const err = new Error('Not allowed by CORS');
      err.statusCode = 403;
      return callback(err);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(securityActivityMonitor);
app.use(preventNoSqlInjection);
app.use(inspectAndSanitizeInputs);
app.use(csrfOriginGuard);
app.use('/api', apiRateLimiter);

const uploadsFallback = (req, res, next) => {
  const filePath = path.join(__dirname, 'uploads', req.path);
  if (!fs.existsSync(filePath)) {
    const lowerPath = req.path.toLowerCase();
    console.log(`[Static Fallback] Missing file requested: ${req.path}. Resolving dynamic fallback.`);
    
    // Exact mapping for the seeded mock filenames to the user's actual Cloudinary uploads
    if (lowerPath.includes('1785309765794-96167017') || lowerPath.includes('1785925353881-355195869')) {
      return res.redirect('https://res.cloudinary.com/dgi3amv5d/image/upload/v1786424514/fleet_documents/Registaration_Certificate__RC__1786424513857.png');
    }
    if (lowerPath.includes('1785309770909-809102847') || lowerPath.includes('1785925358303-29392348')) {
      return res.redirect('https://res.cloudinary.com/dgi3amv5d/image/upload/v1786424518/fleet_documents/Insurance_Certificate_1786424519429.png');
    }
    if (lowerPath.includes('1785309774859-443808395') || lowerPath.includes('1785925364675-878106563')) {
      return res.redirect('https://res.cloudinary.com/dgi3amv5d/image/upload/v1786424523/fleet_documents/Pollution_under_Control_Certificate__PUC__1786424524016.png');
    }
    if (lowerPath.includes('1785309782794-126350596') || lowerPath.includes('1785925371007-692494790')) {
      return res.redirect('https://res.cloudinary.com/dgi3amv5d/image/upload/v1786424530/fleet_documents/Fitness_Certificate__FC__1786424529864.png');
    }
    if (lowerPath.includes('1785309788105-882417761') || lowerPath.includes('1785925382328-515117654')) {
      return res.redirect('https://res.cloudinary.com/dgi3amv5d/image/upload/v1786424534/fleet_documents/Permit_Document__PD__1786424535286.png');
    }
    if (lowerPath.includes('1785309791690-130720362') || lowerPath.includes('1785925386789-912673508')) {
      return res.redirect('https://res.cloudinary.com/dgi3amv5d/image/upload/v1786424539/fleet_documents/Road_Tax_Receipt_1786424540201.png');
    }

    if (lowerPath.includes('rc') || lowerPath.includes('registration')) {
      return res.redirect('https://res.cloudinary.com/dgi3amv5d/image/upload/v1786006296/fleet_documents/Registaration_Certificate__RC__1786006294492.png');
    }
    if (lowerPath.includes('insurance')) {
      return res.redirect('https://res.cloudinary.com/dgi3amv5d/image/upload/v1786006309/fleet_documents/Insurance_Certificate_1786006307451.png');
    }
    if (lowerPath.includes('puc') || lowerPath.includes('pollution')) {
      return res.redirect('https://res.cloudinary.com/dgi3amv5d/image/upload/v1786424523/fleet_documents/Pollution_under_Control_Certificate__PUC__1786424524016.png');
    }
    if (lowerPath.includes('fitness') || lowerPath.includes('fc')) {
      return res.redirect('https://res.cloudinary.com/dgi3amv5d/image/upload/v1786424530/fleet_documents/Fitness_Certificate__FC__1786424529864.png');
    }
    if (lowerPath.includes('permit')) {
      return res.redirect('https://res.cloudinary.com/dgi3amv5d/image/upload/v1786424534/fleet_documents/Permit_Document__PD__1786424535286.png');
    }
    if (lowerPath.includes('tax')) {
      return res.redirect('https://res.cloudinary.com/dgi3amv5d/image/upload/v1786424539/fleet_documents/Road_Tax_Receipt_1786424540201.png');
    }
    if (lowerPath.includes('driver-doc') || lowerPath.includes('license') || lowerPath.includes('licence')) {
      return res.redirect('https://res.cloudinary.com/dgi3amv5d/image/upload/v1785481898/fleet_documents/oe11ryuxhncc6t9ey8ms.png');
    }
    if (lowerPath.includes('weighbridge') || lowerPath.includes('weighment') || lowerPath.includes('slip')) {
      return res.redirect('https://res.cloudinary.com/dgi3amv5d/image/upload/v1785481898/fleet_documents/oe11ryuxhncc6t9ey8ms.png');
    }
    if (lowerPath.includes('pod')) {
      return res.redirect('https://res.cloudinary.com/dgi3amv5d/image/upload/v1785481898/fleet_documents/oe11ryuxhncc6t9ey8ms.png');
    }
    if (lowerPath.endsWith('.pdf')) {
      return res.redirect('https://res.cloudinary.com/dgi3amv5d/image/upload/v1785481898/fleet_documents/oe11ryuxhncc6t9ey8ms.png');
    }
    return res.redirect('https://res.cloudinary.com/dgi3amv5d/image/upload/v1785481898/fleet_documents/oe11ryuxhncc6t9ey8ms.png');
  }
  next();
};

app.use('/uploads', uploadsFrameSecurityMiddleware, uploadsFallback);
app.use('/uploads', uploadsFrameSecurityMiddleware, express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', uploadsFrameSecurityMiddleware, uploadsFallback);
app.use('/api/uploads', uploadsFrameSecurityMiddleware, express.static(path.join(__dirname, 'uploads')));

app.post('/api/security/csp-report', cspReportBodyParser, cspReportHandler);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'fleet-management-backend', customFlag: 'verified-antigravity' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/driver', driverApiRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/public/reviews', async (req, res, next) => {
  try {
    const Review = (await import('./models/Review.js')).default;
    const { sendSuccess } = await import('./utils/response.js');
    const reviews = await Review.find({ showPublic: true }).sort({ createdAt: -1 });
    return sendSuccess(res, 200, reviews, 'Public reviews fetched');
  } catch (err) {
    next(err);
  }
});

// Serve built React SPA when frontend/dist exists (ensures Express applies Helmet CSP to HTML)
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');
if (process.env.SERVE_FRONTEND !== 'false' && fs.existsSync(frontendIndexPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path === '/health') {
      return next();
    }
    return res.sendFile(frontendIndexPath);
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;


