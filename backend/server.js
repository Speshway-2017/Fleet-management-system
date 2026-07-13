import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') }); // must be first — loads .env before any other import reads process.env

// Server setup (port 5002, final)

import { validateEnv }  from './config/env.validate.js';
import app              from './app.js';
import { connectDB }    from './config/db.config.js';
import cloudinary       from './config/cloudinary.config.js';
import http from 'http';
import { Server } from 'socket.io';

// 1. Validate all required env vars — exits with clear message if any are missing
validateEnv();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // 2. Connect to MongoDB Atlas
  await connectDB();

  // 3. Verify Cloudinary config loaded correctly
  const { cloud_name } = cloudinary.config();
  if (cloud_name) {
    console.log(`☁️  Cloudinary connected → cloud: ${cloud_name}`);
  } else {
    console.warn('⚠️  Cloudinary config missing — file uploads will fail.');
  }

  // Helper function to print all routes
  const printRoutes = (app) => {
    console.log('\n📋 Registered Routes:');
    const routes = [];

    // Extract routes from main app
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        // Direct routes on app
        const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
        routes.push({ path: middleware.route.path, methods });
      } else if (middleware.name === 'router') {
        // Sub-routers (mounted with app.use)
        const mountPath = middleware.regexp.source
          .replace('^\\', '')
          .replace('\\/?(?=\\/|$)', '')
          .replace(/\\/g, '/');
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) {
            const fullPath = mountPath + handler.route.path;
            const methods = Object.keys(handler.route.methods).join(', ').toUpperCase();
            routes.push({ path: fullPath, methods });
          }
        });
      }
    });

    // Print sorted by path
    routes.sort((a, b) => a.path.localeCompare(b.path));
    routes.forEach((route) => {
      console.log(`  ${route.methods.padEnd(10)} ${route.path}`);
    });
    console.log('');
  };

  // 4. Create HTTP server
  const server = http.createServer(app);

  // 5. Set up Socket.IO
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    }
  });

  // Middleware to attach io to req
  app.use((req, res, next) => {
    req.io = io;
    next();
  });

  // Socket.IO connection handler
  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // Join admin-specific room
    socket.on('joinAdminRoom', (adminId) => {
      socket.join(`admin:${adminId}`);
      console.log(`📡 Admin ${adminId} joined room`);
    });

    // Join manager-specific room
    socket.on('joinManagerRoom', (managerId) => {
      socket.join(`manager:${managerId}`);
      console.log(`📡 Manager ${managerId} joined room`);
    });

    // Join organization-specific room
    socket.on('joinOrganizationRoom', (organizationId) => {
      socket.join(`organization:${organizationId}`);
      console.log(`📡 Organization ${organizationId} joined room`);
    });

    // Join role room (for SUPER_ADMIN or FLEET_MANAGER)
    socket.on('joinRoleRoom', (role) => {
      socket.join(`role:${role}`);
      console.log(`📡 Joined role room: ${role}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  // Attach io to app.locals so controllers can use it
  app.locals.io = io;

  // 6. Start server
  server.listen(PORT, () => {
    console.log(`🚀  Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`🌐  CORS allowed for: ${process.env.CLIENT_URL}`);
    // printRoutes(app);
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌  Port ${PORT} is already in use by another process. Terminate the conflicting process or change the port.`);
    } else {
      console.error('❌  Server error:', err);
    }
    process.exit(1);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
