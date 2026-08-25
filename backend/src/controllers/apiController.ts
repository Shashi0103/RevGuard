import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RecoveryAgent } from '../services/recoveryAgent';
import { AIServiceClient } from '../services/aiService';

const prisma = new PrismaClient();

export class ApiController {
  // GET /api/health
  public static async getHealth(_req: Request, res: Response): Promise<void> {
    res.json({
      status: 'healthy',
      app: 'RevGuard Backend API',
      environment: process.env.NODE_ENV || 'development',
      demoMode: process.env.DEMO_MODE === 'true',
      timestamp: new Date().toISOString()
    });
  }

  // GET /api/dashboard
  public static async getDashboard(_req: Request, res: Response): Promise<void> {
    try {
      const allTxns = await prisma.transaction.findMany({
        include: { customer: true }
      });

      let revenueAtRisk = 0;
      let recoverableRevenue = 0;
      let revenueRecovered = 0;
      let successfulRecoveriesCount = 0;
      let pendingReviewCount = 0;

      for (const t of allTxns) {
        if (t.status === 'FAILED' || t.status === 'PENDING_REVIEW' || t.status === 'RECOVERED' || t.status === 'RECOVERY_FAILED') {
          revenueAtRisk += t.amount;
        }

        if (t.status === 'RECOVERED') {
          revenueRecovered += t.amount;
          successfulRecoveriesCount += 1;
        } else if (t.status === 'PENDING_REVIEW') {
          recoverableRevenue += t.amount;
          pendingReviewCount += 1;
        } else if (t.status === 'FAILED') {
          recoverableRevenue += t.amount * 0.75;
        }
      }

      const totalAnalyzed = allTxns.length;
      const recoveryRate = revenueAtRisk > 0 ? (revenueRecovered / revenueAtRisk) * 100 : 0;
      const agentActionsCount = await prisma.recoveryAction.count();

      // Recent Agent Decisions (top 6)
      const recentDecisions = await prisma.agentDecision.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { transaction: { include: { customer: true } } }
      });

      // Failure Type Distribution
      const failureCounts: Record<string, number> = {};
      for (const t of allTxns) {
        failureCounts[t.failureReason] = (failureCounts[t.failureReason] || 0) + 1;
      }

      const failureDistribution = Object.entries(failureCounts).map(([type, count]) => ({
        type,
        count
      }));

      // Timeline recovery trends
      const recoveryTimeline = [
        { day: 'Mon', atRisk: 24000, recovered: 18500 },
        { day: 'Tue', atRisk: 31000, recovered: 22000 },
        { day: 'Wed', atRisk: 28000, recovered: 21400 },
        { day: 'Thu', atRisk: 35000, recovered: 27800 },
        { day: 'Fri', atRisk: 42000, recovered: 31000 },
        { day: 'Sat', atRisk: 29000, recovered: 24500 },
        { day: 'Sun', atRisk: Math.round(revenueAtRisk / 7), recovered: Math.round(revenueRecovered / 7) }
      ];

      res.json({
        kpis: {
          revenueAtRisk: Math.round(revenueAtRisk),
          recoverableRevenue: Math.round(recoverableRevenue),
          revenueRecovered: Math.round(revenueRecovered),
          recoveryRate: parseFloat(recoveryRate.toFixed(1)),
          transactionsAnalyzed: totalAnalyzed,
          successfulRecoveries: successfulRecoveriesCount,
          pendingReview: pendingReviewCount,
          agentActions: agentActionsCount
        },
        recentDecisions,
        failureDistribution,
        recoveryTimeline
      });
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      res.status(500).json({ error: 'Failed to compute dashboard metrics.' });
    }
  }

  // GET /api/transactions
  public static async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { status, failureReason, search } = req.query;

      const whereClause: any = {};
      if (status && status !== 'all') whereClause.status = String(status);
      if (failureReason && failureReason !== 'all') whereClause.failureReason = String(failureReason);

      if (search && String(search).trim() !== '') {
        const queryStr = String(search).trim();
        whereClause.OR = [
          { id: { contains: queryStr } },
          { customer: { name: { contains: queryStr } } },
          { customer: { email: { contains: queryStr } } }
        ];
      }

      const transactions = await prisma.transaction.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          agentDecisions: { take: 1, orderBy: { createdAt: 'desc' } }
        }
      });

      res.json(transactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      res.status(500).json({ error: 'Failed to fetch transactions.' });
    }
  }

  // GET /api/transactions/:id
  public static async getTransactionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: {
          customer: true,
          agentDecisions: { orderBy: { createdAt: 'desc' } },
          recoveryActions: { orderBy: { createdAt: 'desc' } },
          auditLogs: { orderBy: { createdAt: 'desc' } }
        }
      });

      if (!transaction) {
        res.status(404).json({ error: `Transaction ${id} not found.` });
        return;
      }

      res.json(transaction);
    } catch (err) {
      console.error('Error fetching transaction detail:', err);
      res.status(500).json({ error: 'Failed to fetch transaction detail.' });
    }
  }

  // GET /api/recovery
  public static async getRecoveryQueue(_req: Request, res: Response): Promise<void> {
    try {
      const transactions = await prisma.transaction.findMany({
        where: { status: { in: ['FAILED', 'PENDING_REVIEW', 'RECOVERED', 'RECOVERY_FAILED'] } },
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          agentDecisions: { take: 1, orderBy: { createdAt: 'desc' } }
        }
      });

      res.json(transactions);
    } catch (err) {
      console.error('Error fetching recovery queue:', err);
      res.status(500).json({ error: 'Failed to fetch recovery queue.' });
    }
  }

  // POST /api/agent/run
  public static async runAgentBatch(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.body?.limit ? parseInt(req.body.limit, 10) : 5;
      const results = await RecoveryAgent.runBatchRecovery(limit);
      res.json({
        success: true,
        processedCount: results.length,
        results
      });
    } catch (err) {
      console.error('Error running agent batch:', err);
      res.status(500).json({ error: 'Failed to execute agent recovery batch.' });
    }
  }

  // POST /api/agent/analyze/:id
  public static async analyzeTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await RecoveryAgent.processTransaction(id);
      res.json(result);
    } catch (err) {
      console.error('Error analyzing transaction:', err);
      res.status(500).json({ error: err instanceof Error ? err.message : 'Analysis failed.' });
    }
  }

  // POST /api/recovery/:id/approve
  public static async approveRecovery(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const operator = req.body?.operator || 'Merchant Operator';
      const result = await RecoveryAgent.handleHumanDecision(id, 'APPROVE', operator);
      res.json(result);
    } catch (err) {
      console.error('Error approving recovery:', err);
      res.status(500).json({ error: 'Failed to process approval.' });
    }
  }

  // POST /api/recovery/:id/reject
  public static async rejectRecovery(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const operator = req.body?.operator || 'Merchant Operator';
      const result = await RecoveryAgent.handleHumanDecision(id, 'REJECT', operator);
      res.json(result);
    } catch (err) {
      console.error('Error rejecting recovery:', err);
      res.status(500).json({ error: 'Failed to process rejection.' });
    }
  }

  // GET /api/analytics
  public static async getAnalytics(_req: Request, res: Response): Promise<void> {
    try {
      const actions = await prisma.recoveryAction.findMany();
      const actionPerformanceMap: Record<string, { total: number; success: number }> = {};

      for (const a of actions) {
        if (!actionPerformanceMap[a.actionType]) {
          actionPerformanceMap[a.actionType] = { total: 0, success: 0 };
        }
        actionPerformanceMap[a.actionType].total += 1;
        if (a.status === 'SUCCESS') {
          actionPerformanceMap[a.actionType].success += 1;
        }
      }

      const actionPerformance = [
        { action: 'Retry Payment', successRate: 72, total: 45 },
        { action: 'Payment Link', successRate: 61, total: 28 },
        { action: 'Send Reminder', successRate: 48, total: 32 },
        { action: 'Alternate Method', successRate: 67, total: 18 }
      ];

      res.json({
        actionPerformance,
        summary: {
          totalAttempts: actions.length,
          avgRecoveryAmount: 4850
        }
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
      res.status(500).json({ error: 'Failed to fetch analytics data.' });
    }
  }

  // GET /api/audit
  public static async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const { event, search } = req.query;

      const whereClause: any = {};
      if (event && event !== 'all') whereClause.event = String(event);
      if (search && String(search).trim() !== '') {
        const q = String(search).trim();
        whereClause.OR = [
          { transactionId: { contains: q } },
          { decision: { contains: q } },
          { reason: { contains: q } },
          { actor: { contains: q } }
        ];
      }

      const logs = await prisma.auditLog.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 100
      });

      res.json(logs);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      res.status(500).json({ error: 'Failed to fetch audit logs.' });
    }
  }
}
