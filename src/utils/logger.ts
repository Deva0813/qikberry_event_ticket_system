import { mongoClient } from "../config/prismaClient.ts";

async function log(level: string, message: string, meta = undefined) {
  console[level === 'error' ? 'error' : 'log'](`[${level.toUpperCase()}] ${message}`);
  try {
    await mongoClient.systemLog.create({ data: { level, message, meta } });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Failed to write system log to MongoDB:', err.message);
    } else {
      console.error('Failed to write system log to MongoDB:', err);
    }
  }
}

export const info = (message: string, meta: any) => log('info', message, meta)
export const warn = (message: string, meta: any) => log('warn', message, meta)
export const error = (message: string, meta: any) => log('error', message, meta)

