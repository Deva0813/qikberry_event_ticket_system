import cors from 'cors';
import express, { type Express, type Request, type Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { app_config } from './constants/app.config.ts';
import { rateLimiter } from './middleware/rateLimiter.middleware.ts';

const app: Express = express();

const corsOrigin = app_config.CORS_ORIGIN?.split(",") || []

console.log(corsOrigin);


app.use(morgan("dev"))
app.use(cors({
  origin: corsOrigin.length > 0 ? corsOrigin : false,
  credentials: true
}))
app.use(helmet())
app.use(rateLimiter)

app.get('/', (req: Request, res: Response) => {
  res.send('Hello QikBerry! ');
});

export default app;