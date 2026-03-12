/**
 * Production-ready environment configuration with validation
 */

interface AppConfig {
  // Environment
  nodeEnv: 'development' | 'production' | 'test';
  isDevelopment: boolean;
  isProduction: boolean;
  
  // Server
  port: number;
  hostname: string;
  appUrl: string;
  
  // Database
  databaseUrl: string;
  databaseDirectUrl?: string;
  
  // Redis
  redisUrl: string;
  
  // Rate Limiting
  rateLimitMaxRequests: number;
  rateLimitWindowMs: number;
  
  // Media Upload
  maxFileSize: number;
  maxFilesPerPost: number;
  allowedImageTypes: string[];
  allowedVideoTypes: string[];
  
  // Security
  cookieSecret: string;
  corsOrigin: string[];
}

function parseEnv<T>(key: string, defaultValue: T, parser?: (val: string) => T): T {
  const value = process.env[key];
  
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return defaultValue;
  }
  
  if (parser) {
    try {
      return parser(value);
    } catch {
      throw new Error(`Invalid value for ${key}: ${value}`);
    }
  }
  
  return value as T;
}

function validateConfig(): AppConfig {
  const nodeEnv = parseEnv('NODE_ENV', 'development') as AppConfig['nodeEnv'];
  const isProduction = nodeEnv === 'production';
  
  // In production, certain variables are required
  const config: AppConfig = {
    // Environment
    nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction,
    
    // Server
    port: parseEnv('PORT', 3000, parseInt),
    hostname: parseEnv('HOSTNAME', '0.0.0.0'),
    appUrl: parseEnv<string>('NEXT_PUBLIC_APP_URL', isProduction ? (undefined as unknown as string) : 'http://localhost:3000'),
    
    // Database - Required in production
    databaseUrl: parseEnv<string>('DATABASE_URL', isProduction ? (undefined as unknown as string) : 'file:./prisma/dev.db'),
    databaseDirectUrl: process.env.DATABASE_DIRECT_URL,
    
    // Redis - Required in production
    redisUrl: parseEnv<string>('REDIS_URL', isProduction ? (undefined as unknown as string) : 'redis://localhost:6379'),
    
    // Rate Limiting
    rateLimitMaxRequests: parseEnv('RATE_LIMIT_MAX_REQUESTS', 100, parseInt),
    rateLimitWindowMs: parseEnv('RATE_LIMIT_WINDOW_MS', 60000, parseInt),
    
    // Media Upload
    maxFileSize: parseEnv('MAX_FILE_SIZE', 10485760, parseInt), // 10MB
    maxFilesPerPost: parseEnv('MAX_FILES_PER_POST', 4, parseInt),
    allowedImageTypes: parseEnv(
      'ALLOWED_IMAGE_TYPES',
      'image/jpeg,image/png,image/webp,image/gif'
    ).split(','),
    allowedVideoTypes: parseEnv(
      'ALLOWED_VIDEO_TYPES',
      'video/mp4,video/webm,video/quicktime'
    ).split(','),
    
    // Security
    cookieSecret: parseEnv<string>('COOKIE_SECRET', isProduction ? (undefined as unknown as string) : 'dev-secret-change-in-production'),
    corsOrigin: parseEnv<string>(
      'CORS_ORIGIN',
      isProduction ? (undefined as unknown as string) : 'http://localhost:3000'
    ).split(',').map((origin: string) => origin.trim()),
  };
  
  return config;
}

// Validate and export config
let config: AppConfig;

try {
  config = validateConfig();
  
  // Log configuration in development
  if (config.isDevelopment) {
    console.log('✓ Configuration validated successfully');
  } else {
    console.log('✓ Production configuration loaded');
  }
} catch (error) {
  console.error('❌ Configuration validation failed:');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

export default config;
