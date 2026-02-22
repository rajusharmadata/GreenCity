import express from "express";

import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import session from "express-session";
import passport from "./config/passport.js";
import {
  rateLimiter,
  authRateLimiter,
  securityHeaders,
  sanitizeInput,
  mongoSanitizeMiddleware,
  corsOptions,
  validateEnvironment
} from "./config/security.js";
import userRoute from "./routes/auth.js";
import issueRoute from "./routes/issue.js";
import organizationRoute from "./routes/organization.js";
import issueSolvedRoute from "./routes/issuesolved.js";
import rankingRoute from "./routes/userrank.js";
import organizationRankRoute from "./routes/organizationrank.js";
import TransportEntryRouter from "./routes/TransportEntry.js";
import TransportQuery from "./routes/TransportQuery.js";
import oauthRoute from "./routes/oauth.js";
import dbconnection from "./db/db.js";

// Load environment variables
dotenv.config({
  path: ".env"
});

// Validate environment variables (with defaults for development)
try {
  validateEnvironment();
} catch (error) {
  console.error('⚠️  Environment validation error:', error.message);
  // In development, continue with warnings
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Connect to Database and start server
dbconnection()
  .then(() => {
    console.log('✅ Database connected successfully');
    
    // Start the server
    const server = app.listen(PORT, HOST, () => {
      console.log(`\n🚀 Server is running!`);
      console.log(`   Local:   http://localhost:${PORT}`);
      console.log(`   Network: http://${HOST}:${PORT}`);
      console.log(`   Health:  http://localhost:${PORT}/health\n`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`📱 For mobile devices, use your computer's IP address`);
        console.log(`🌐 CORS is enabled for all origins in development mode\n`);
      }
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error(`   Try using a different port or stop the process using port ${PORT}`);
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('⚠️  SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n⚠️  SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
  })
  .catch(err => {
    console.error('❌ Failed to connect to database:', err.message);
    console.error('   Make sure MongoDB is running and MONGO_URI is correct');
    process.exit(1);
  });

export default app;
