/**
 * Validates that all required environment variables are set.
 * Call this once at the very start of server.js before anything else.
 */

const REQUIRED_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'CLIENT_URL',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
];

export function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌  Missing required environment variables:');
    missing.forEach((key) => console.error(`    - ${key}`));
    console.error('\n   Please check your .env file and add the missing values.');
    process.exit(1);
  }

  console.log('✅  Environment variables validated successfully.');
}
