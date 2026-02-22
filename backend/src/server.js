import app from './app.js';
import dotenv from 'dotenv';
import dbconnection from './db/db.js';
import { validateEnvironment } from './config/security.js';
import { startHealthCheckCron } from './jobs/healthCheck.js';

dotenv.config({ path: '.env' });

try {
  validateEnvironment();
} catch (error) {
  console.error('⚠️  Environment validation error:', error.message);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

dbconnection()
  .then(() => {
    const server = app.listen(PORT, HOST, () => {
      console.log(`\n🚀 Server is running`);
      console.log(`   Local:   http://localhost:${PORT}`);
      console.log(`   Health:  http://localhost:${PORT}/health\n`);
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 For mobile, use your machine IP\n');
      }
      startHealthCheckCron(PORT);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error('❌ Server error:', err);
      }
      process.exit(1);
    });

    const shutdown = () => {
      console.log('\n⚠️  Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });
