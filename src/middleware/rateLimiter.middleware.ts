import rateLimit from 'express-rate-limit';
import { app_config } from '../constants/app.config.ts';


export const rateLimiter = rateLimit({
    windowMs: parseInt(app_config.RATE_LIMIT_WINDOW_MS as string) || 900000,
    max: parseInt(app_config.RATE_LIMIT_MAX as string) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later' },
});