import { Router, Request, Response } from 'express';

const router = Router();

// Basic health check
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Detailed health check with service dependencies
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        auth: await checkService('http://localhost:3001/health'),
        chat: await checkService('http://localhost:3002/health'),
        admin: await checkService('http://localhost:3003/health'),
        personalization: await checkService('http://localhost:3005/health'),
        data: await checkService('http://localhost:3006/health'),
        ai: await checkService('http://localhost:3007/health')
      },
      database: await checkDatabase(),
      redis: await checkRedis()
    };

    // Determine overall status
    const unhealthyServices = Object.values(healthCheck.services).filter(s => s.status !== 'healthy');
    if (unhealthyServices.length > 0) {
      healthCheck.status = 'degraded';
    }

    res.status(healthCheck.status === 'healthy' ? 200 : 503).json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: (error as Error).message
    });
  }
});

// Service health check helper
async function checkService(url: string): Promise<any> {
  try {
    const response = await fetch(url, {
      timeout: 5000,
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        status: 'healthy',
        responseTime: Date.now(),
        details: data
      };
    } else {
      return {
        status: 'unhealthy',
        responseTime: Date.now(),
        error: `HTTP ${response.status}`
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Database health check
async function checkDatabase(): Promise<any> {
  try {
    // In a real implementation, this would check the actual database connection
    // For now, we'll simulate a healthy database
    return {
      status: 'healthy',
      responseTime: Date.now(),
      details: {
        type: 'postgresql',
        version: '14.0'
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Redis health check
async function checkRedis(): Promise<any> {
  try {
    // In a real implementation, this would check the actual Redis connection
    // For now, we'll simulate a healthy Redis
    return {
      status: 'healthy',
      responseTime: Date.now(),
      details: {
        type: 'redis',
        version: '7.0'
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Readiness check
router.get('/ready', (req: Request, res: Response) => {
  // Check if the gateway is ready to accept traffic
  const isReady = true; // In real implementation, check dependencies
  
  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'not ready',
    timestamp: new Date().toISOString()
  });
});

// Liveness check
router.get('/live', (req: Request, res: Response) => {
  // Check if the gateway is running
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

export { router as healthCheckRoutes };