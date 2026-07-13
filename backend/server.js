import dotenv from 'dotenv';
dotenv.config(); // must be first — loads .env before any other import reads process.env

import { validateEnv }  from './config/env.validate.js';
import app              from './app.js';
import { connectDB }    from './config/db.config.js';
import cloudinary       from './config/cloudinary.config.js';

// 1. Validate all required env vars — exits with clear message if any are missing
validateEnv();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // 2. Connect to MongoDB Atlas
  await connectDB();

  // 3. Verify Cloudinary config loaded correctly
  const { cloud_name } = cloudinary.config();
  if (cloud_name) {
    console.log(`☁️   Cloudinary connected → cloud: ${cloud_name}`);
  } else {
    console.warn('⚠️   Cloudinary config missing — file uploads will fail.');
  }

  // 4. Start Express
  const server = app.listen(PORT, () => {
    console.log(`🚀  Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`🌐  CORS allowed for: ${process.env.CLIENT_URL}`);
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
