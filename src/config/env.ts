import "dotenv/config";

const required = ['MYSQL_DATABASE_URL', 'MONGODB_DATABASE_URL', 'JWT_SECRET'];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
}

export const port = process.env.PORT || 4000
export const nodeEnv = process.env.NODE_ENV || 'development'
export const corsOrigin = (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean)
export const jwtSecret = process.env.JWT_SECRET || "qikberry"
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d'
export const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000
export const rateLimitMax = Number(process.env.RATE_LIMIT_MAX) || 100

export const MONGODB_DATABASE_URL = process.env.MONGODB_DATABASE_URL || ""
export const MYSQL_DATABASE_URL = process.env.MYSQL_DATABASE_URL || ''

