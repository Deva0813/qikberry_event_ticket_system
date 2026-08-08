import cors from 'cors';
import express, { type Express, type Request, type Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOrigin, nodeEnv } from './config/env.ts';
import { rateLimiter } from './middleware/rateLimiter.middleware.ts';
import sanitizeData from "./middleware/sanitize.middleware.ts"
import ApiError from './utils/error.ts';
import errorHandler from "./middleware/errorHandler.middleware.ts"
import router from './routes/index.ts';

const app: Express = express();

app.use(helmet())
app.use(cors({
  origin: corsOrigin.length > 0 ? corsOrigin : false,
  credentials: true
}))

app.use(express.json({
  limit:"10kb"
}))
app.use(express.urlencoded({extended:true,limit:"10kb"}))


if (nodeEnv !== 'test') app.use(morgan(nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(rateLimiter)
app.use(sanitizeData)

app.use("/api/v1",router)

app.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));


app.get('/', async(req: Request, res: Response) => {
  res.send('Hello QikBerry! ');
});

app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});


app.use(errorHandler);

export default app;
