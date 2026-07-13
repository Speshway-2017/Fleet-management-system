import express        from 'express';

// Main app
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import managerRoutes from './routes/manager.routes.js';
import driverRoutes from './routes/driver.routes.js';
import vehicleRoutes from './routes/vehicle.routes.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'fleet-management-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;


