export interface Transaction {
  id: string;
  merchantId: string;
  customerId: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  failureReason: string;
  retryCount: number;
  checkoutStatus: string;
  subscriptionStatus: string;
  createdAt: string;
  agentDecisions?: AgentDecision[];
  recoveryActions?: RecoveryAction[];
  auditLogs?: AuditLog[];
}

export interface AgentDecision {
  id: string;
  transactionId: string;
  diagnosis: string;
  confidence: number;
  recoveryProbability: number;
  recommendedAction: string;
  riskLevel: string;
  reason: string;
  guardrailStatus: string;
  createdAt: string;
}

export interface RecoveryAction {
  id: string;
  transactionId: string;
  actionType: string;
  status: string;
  amountRecovered: number;
  executedBy: string;
  executedAt?: string;
  result: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  transactionId?: string;
  event: string;
  decision: string;
  reason: string;
  actor: string;
  result: string;
  metadata: string;
  createdAt: string;
}

export interface DashboardData {
  kpis: {
    revenueAtRisk: number;
    recoverableRevenue: number;
    revenueRecovered: number;
    recoveryRate: number;
    transactionsAnalyzed: number;
    successfulRecoveries: number;
    pendingReview: number;
    agentActions: number;
  };
  recentDecisions: AgentDecision[];
  failureDistribution: { type: string; count: number }[];
  recoveryTimeline: { day: string; atRisk: number; recovered: number }[];
}

export interface PipelineExecutionResult {
  transactionId: string;
  customerName: string;
  amount: number;
  steps: {
    step: string;
    status: 'SUCCESS' | 'BLOCKED' | 'WARNING' | 'FAILED' | 'IN_PROGRESS';
    message: string;
    timestamp: string;
  }[];
  diagnosis: string;
  confidence: number;
  recoveryProbability: number;
  recommendedAction: string;
  riskLevel: string;
  guardrailStatus: 'PASSED' | 'BLOCKED' | 'ESCALATED';
  guardrailReason: string;
  actionExecuted: boolean;
  recoveryResult?: string;
  amountRecovered: number;
  status: string;
}

const BASE_URL = '/api';

export async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch(`${BASE_URL}/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
  return res.json();
}

export async function fetchTransactions(params?: { status?: string; failureReason?: string; search?: string }): Promise<Transaction[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.failureReason) query.set('failureReason', params.failureReason);
  if (params?.search) query.set('search', params.search);

  const res = await fetch(`${BASE_URL}/transactions?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export async function fetchTransactionById(id: string): Promise<Transaction> {
  const res = await fetch(`${BASE_URL}/transactions/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch transaction ${id}`);
  return res.json();
}

export async function fetchRecoveryQueue(): Promise<Transaction[]> {
  const res = await fetch(`${BASE_URL}/recovery`);
  if (!res.ok) throw new Error('Failed to fetch recovery queue');
  return res.json();
}

export async function runAgentBatch(limit = 5): Promise<{ success: boolean; processedCount: number; results: PipelineExecutionResult[] }> {
  const res = await fetch(`${BASE_URL}/agent/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit })
  });
  if (!res.ok) throw new Error('Failed to run agent batch');
  return res.json();
}

export async function analyzeSingleTransaction(id: string): Promise<PipelineExecutionResult> {
  const res = await fetch(`${BASE_URL}/agent/analyze/${id}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(`Failed to analyze transaction ${id}`);
  return res.json();
}

export async function approveRecoveryAction(id: string, operator = 'Merchant Operator'): Promise<{ success: boolean; message: string; amountRecovered: number }> {
  const res = await fetch(`${BASE_URL}/recovery/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operator })
  });
  if (!res.ok) throw new Error('Failed to approve recovery action');
  return res.json();
}

export async function rejectRecoveryAction(id: string, operator = 'Merchant Operator'): Promise<{ success: boolean; message: string; amountRecovered: number }> {
  const res = await fetch(`${BASE_URL}/recovery/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operator })
  });
  if (!res.ok) throw new Error('Failed to reject recovery action');
  return res.json();
}

export async function fetchAnalytics(): Promise<any> {
  const res = await fetch(`${BASE_URL}/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function fetchAuditLogs(params?: { event?: string; search?: string }): Promise<AuditLog[]> {
  const query = new URLSearchParams();
  if (params?.event) query.set('event', params.event);
  if (params?.search) query.set('search', params.search);

  const res = await fetch(`${BASE_URL}/audit?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}
