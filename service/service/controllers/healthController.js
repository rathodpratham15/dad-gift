import mongoose from 'mongoose';
import { performance } from 'perf_hooks';

export const healthCheck = async (req, res) => {
  const startTime = performance.now();
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {}
  };

  try {
    // Check MongoDB connection
    const mongoStart = performance.now();
    const mongoState = mongoose.connection.readyState;
    const mongoStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    health.services.mongodb = {
      status: mongoState === 1 ? 'healthy' : 'unhealthy',
      state: mongoStates[mongoState],
      responseTime: `${(performance.now() - mongoStart).toFixed(2)}ms`
    };

    // Check memory usage
    const memUsage = process.memoryUsage();
    health.services.memory = {
      status: 'healthy',
      usage: {
        rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)}MB`,
        heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        external: `${(memUsage.external / 1024 / 1024).toFixed(2)}MB`
      }
    };

    // Check CPU usage (basic approximation)
    const cpuUsage = process.cpuUsage();
    health.services.cpu = {
      status: 'healthy',
      usage: {
        user: cpuUsage.user,
        system: cpuUsage.system
      }
    };

    // Overall health determination
    const unhealthyServices = Object.values(health.services)
      .filter(service => service.status === 'unhealthy');
    
    if (unhealthyServices.length > 0) {
      health.status = 'unhealthy';
    }

    const totalTime = performance.now() - startTime;
    health.responseTime = `${totalTime.toFixed(2)}ms`;

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);

  } catch (error) {
    console.error('Health check failed:', error);
    
    health.status = 'unhealthy';
    health.error = error.message;
    health.responseTime = `${(performance.now() - startTime).toFixed(2)}ms`;
    
    res.status(503).json(health);
  }
};

export const readinessCheck = async (req, res) => {
  try {
    // Check if all required services are ready
    const checks = {
      mongodb: mongoose.connection.readyState === 1,
      environment: !!process.env.JWT_SECRET
    };

    const allReady = Object.values(checks).every(check => check);

    res.status(allReady ? 200 : 503).json({
      status: allReady ? 'ready' : 'not ready',
      checks,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

export const livenessCheck = (req, res) => {
  // Simple liveness check - if this endpoint responds, the app is alive
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}; 