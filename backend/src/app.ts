import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import * as Sentry from '@sentry/node';

import { errorHandler } from './middlewares/error.middleware';
import { corsOptions } from './middlewares/cors.middleware';
import routes from './routes';

const app: Application = express();

// Sentry - must be first
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// ✅ Security & parsing middleware BEFORE routes
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// ✅ Routes registered ONCE, AFTER middleware
app.use('/api/v1', routes);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Sentry error handler - before other error handlers
app.use(Sentry.Handlers.errorHandler());

// Global error handler - must be last
app.use(errorHandler);

export default app;