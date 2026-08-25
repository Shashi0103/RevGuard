import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Play,
  RefreshCw,
  ArrowUpRight,
  Clock,
  PieChart as PieIcon,
  BarChart2,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { fetchDashboard, runAgentBatch, DashboardData } from '../lib/api';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [runningAgent, setRunningAgent] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadMetrics = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetchDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics(true);
  }, []);

  const handleRunAgent = async () => {
    try {
      setRunningAgent(true);
      const result = await runAgentBatch(5);
      setToastMessage(`🎉 RevGuard Agent processed ${result.processedCount} transactions! Database & metrics updated live.`);
      await loadMetrics(false);
      setTimeout(() => setToastMessage(null), 8000);
    } catch (err) {
      console.error('Error running recovery agent:', err);
    } finally {
      setRunningAgent(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Fetching revenue recovery metrics from Neon PostgreSQL...</p>
      </div>
    );
  }

  const { kpis, recentDecisions, failureDistribution, recoveryTimeline } = data;

  const COLORS = ['#D4AF37', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899'];

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => navigate('/agent')} className="underline text-xs hover:text-emerald-200">
            View Agent Execution →
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            Merchant Revenue Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time failed payment recovery monitoring & decision engine metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadMetrics}
            className="px-3.5 py-2 rounded-lg bg-surface border border-border hover:border-slate-600 text-xs font-semibold text-slate-300 flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            Refresh
          </button>
          <button
            onClick={handleRunAgent}
            disabled={runningAgent}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {runningAgent ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            Run Recovery Agent
          </button>
        </div>
      </div>

      {/* Main 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Revenue at Risk */}
        <div className="fintech-card relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>REVENUE AT RISK</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            ₹{kpis.revenueAtRisk.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span>Failed checkouts & expired mandates</span>
          </div>
        </div>

        {/* Recoverable Revenue */}
        <div className="fintech-card relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>RECOVERABLE REVENUE</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">
            ₹{kpis.recoverableRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-2 flex items-center gap-1 font-medium">
            <span>High probability recovery opportunities</span>
          </div>
        </div>

        {/* Revenue Recovered */}
        <div className="fintech-card border-emerald-500/30 relative overflow-hidden bg-gradient-to-b from-surface to-emerald-950/20">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-2">
            <span>REVENUE RECOVERED</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
            ₹{kpis.revenueRecovered.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-300 mt-2 flex items-center gap-1 font-semibold">
            <span>✓ Verified money collected</span>
          </div>
        </div>

        {/* Recovery Rate */}
        <div className="fintech-card relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>RECOVERY RATE</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            {kpis.recoveryRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Bounded guardrail execution rate
          </div>
        </div>
      </div>

      {/* Secondary Metric Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface/60 border border-border text-center">
          <div className="text-xs text-slate-400 font-medium">Transactions Analyzed</div>
          <div className="text-xl font-bold text-slate-200 mt-1">{kpis.transactionsAnalyzed}</div>
        </div>
        <div className="p-4 rounded-xl bg-surface/60 border border-border text-center">
          <div className="text-xs text-slate-400 font-medium">Successful Recoveries</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{kpis.successfulRecoveries}</div>
        </div>
        <div className="p-4 rounded-xl bg-surface/60 border border-border text-center">
          <div className="text-xs text-slate-400 font-medium">Pending Human Review</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{kpis.pendingReview}</div>
        </div>
        <div className="p-4 rounded-xl bg-surface/60 border border-border text-center">
          <div className="text-xs text-slate-400 font-medium">Agent Actions</div>
          <div className="text-xl font-bold text-blue-400 mt-1">{kpis.agentActions}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Chart */}
        <div className="lg:col-span-2 fintech-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-100">Revenue Recovery Timeline</h2>
              <p className="text-xs text-slate-400">Revenue at risk vs. money recovered over time</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={recoveryTimeline}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2333" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#12141D', borderColor: '#1E2333', borderRadius: '8px', fontSize: '12px', color: '#F8FAFC' }}
                  itemStyle={{ color: '#F8FAFC' }}
                  labelStyle={{ color: '#F8FAFC' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                />
                <Area type="monotone" dataKey="atRisk" name="Revenue at Risk" stroke="#EF4444" fillOpacity={1} fill="url(#colorRisk)" />
                <Area type="monotone" dataKey="recovered" name="Recovered Revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRecovered)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Failure Type Breakdown Chart */}
        <div className="fintech-card">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-100">Failure Type Distribution</h2>
            <p className="text-xs text-slate-400">Categorization of payment leakages</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={failureDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="type"
                >
                  {failureDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#12141D', borderColor: '#1E2333', borderRadius: '8px', fontSize: '12px', color: '#F8FAFC' }}
                  itemStyle={{ color: '#F8FAFC' }}
                  labelStyle={{ color: '#F8FAFC' }}
                  formatter={(value: any, name: any) => [`${value} transactions`, String(name).replace(/_/g, ' ')]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Agent Decisions Table */}
      <div className="fintech-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-100">Recent Agent Decisions</h2>
            <p className="text-xs text-slate-400">Latest autonomous diagnosis and guardrail verdicts</p>
          </div>
          <Link to="/agent" className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold">
            View Agent Console →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 border-b border-border uppercase tracking-wider text-[11px] text-slate-400">
              <tr>
                <th className="p-3">Transaction</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Diagnosis</th>
                <th className="p-3">Recommended Action</th>
                <th className="p-3">Guardrail</th>
                <th className="p-3">Confidence</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentDecisions.map((item) => (
                <tr key={item.id} className="hover:bg-surface-hover/50 transition-colors">
                  <td className="p-3 font-mono text-amber-400 font-medium">
                    <Link to={`/transactions/${item.transactionId}`} className="hover:underline">
                      {item.transactionId}
                    </Link>
                  </td>
                  <td className="p-3 font-medium text-slate-200">{item.transaction?.customer?.name || 'Customer'}</td>
                  <td className="p-3 text-slate-300">{item.diagnosis}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-200 uppercase">
                      {item.recommendedAction.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`fintech-badge ${
                        item.guardrailStatus === 'PASSED'
                          ? 'badge-success'
                          : item.guardrailStatus === 'BLOCKED'
                          ? 'badge-danger'
                          : 'badge-warning'
                      }`}
                    >
                      {item.guardrailStatus}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-200">{(item.confidence * 100).toFixed(0)}%</td>
                  <td className="p-3 text-right font-semibold text-slate-100">
                    ₹{item.transaction?.amount ? item.transaction.amount.toLocaleString('en-IN') : '0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
