import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { serverConfig } from './config/serverConfig.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import routes from './routes/index.js';

const app = express();

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'API Gateway' });
});

// Health check endpoints for other services
app.get('/health/auth', createProxyMiddleware({
  target: serverConfig.AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/health/auth': '/health',
  },
}));

app.get('/health/user', createProxyMiddleware({
  target: serverConfig.USER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/health/user': '/health',
  },
}));


// Proxy configuration for services
const services = [
  {
    route: serverConfig.AUTH_SERVICE_PATH,
    target: serverConfig.AUTH_SERVICE_URL,
  },
  {
    route: serverConfig.USER_SERVICE_PATH,
    target: serverConfig.USER_SERVICE_URL,
  },
];

// Setup proxies
services.forEach(({ route, target }) => {
  app.use(
    route,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      onError: (err, req, res) => {
        console.error(`Proxy error: ${err.message}`);
        res.status(503).json({ 
          error: 'Service Unavailable',
          message: 'The requested service is currently unavailable'
        });
      },
    })
  );
});

// API routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(serverConfig.PORT, () => {
  console.log(`🚀 API Gateway running on port ${serverConfig.PORT}`);
  console.log(`Environment: ${serverConfig.NODE_ENV}`);
});

// Handle uncaught errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
