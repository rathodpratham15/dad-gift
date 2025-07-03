import { Router } from 'express';
import { healthCheck, readinessCheck, livenessCheck } from '../controllers/healthController.js';

const router = Router();

// Health check endpoint
router.get('/health', healthCheck);

// Kubernetes-style readiness probe
router.get('/health/ready', readinessCheck);

// Kubernetes-style liveness probe  
router.get('/health/live', livenessCheck);

export default router; 