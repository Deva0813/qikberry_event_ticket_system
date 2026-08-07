import rateLimit from 'express-rate-limit';
import { rateLimitMax, rateLimitWindowMs } from '../config/env.ts';

export const rateLimiter = rateLimit({
    windowMs: rateLimitWindowMs,
    max: rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later' },
});