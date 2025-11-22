import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables if not already loaded
dotenv.config();

const requiredVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const missingVars = requiredVars.filter((key) => !process.env[key]);

if (missingVars.length) {
  const message = `Missing Cloudinary environment variables: ${missingVars.join(', ')}`;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(message);
  } else {
    console.warn(`⚠️  ${message}. Issue uploads will fail until these are set.`);
  }
}

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;


