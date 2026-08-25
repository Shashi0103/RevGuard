import { Router } from 'express';
import { ApiController } from '../controllers/apiController';

const router = Router();

// Health
router.get('/health', ApiController.getHealth);

// Dashboard KPI & Data
router.get('/dashboard', ApiController.getDashboard);

// Transactions
router.get('/transactions', ApiController.getTransactions);
router.get('/transactions/:id', ApiController.getTransactionById);

// Recovery Queue
router.get('/recovery', ApiController.getRecoveryQueue);

// Agent Execution & Analysis
router.post('/agent/run', ApiController.runAgentBatch);
router.post('/agent/analyze/:id', ApiController.analyzeTransaction);

// Human Approval & Recovery Actions
router.post('/recovery/:id/approve', ApiController.approveRecovery);
router.post('/recovery/:id/reject', ApiController.rejectRecovery);

// Analytics & Audit
router.get('/analytics', ApiController.getAnalytics);
router.get('/audit', ApiController.getAuditLogs);

export default router;
