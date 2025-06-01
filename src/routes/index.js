import { Router } from 'express';

const router = Router();

// Gateway-specific routes
router.get('/', (req, res) => {
  res.json({
    message: 'API Gateway',
    version: '1.0.0',
    services: {
      auth: '/api/auth',
      users: '/api/users',
    },
  });
});

export default router;
