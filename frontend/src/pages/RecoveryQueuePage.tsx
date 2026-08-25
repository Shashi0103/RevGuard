import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import {
  fetchRecoveryQueue,
  analyzeSingleTransaction,
  approveRecoveryAction,
  rejectRecoveryAction,
  Transaction
} from '../lib/api';

export const RecoveryQueuePage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await fetchRecoveryQueue();
      setTransactions(data);
    } catch (err) {
      console.error('Failed to load recovery queue:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  const handleRunSingle = async (id: string) => {
    try {
      setActionInProgress(id);
      const res = await analyzeSingleTransaction(id);
      setToastMessage(`Executed ${res.recommendedAction.toUpperCase()} for ${id}: ${res.guardrailReason}`);
      await loadData(false);
      setTimeout(() => setToastMessage(null), 8000);
    } catch (err) {
      console.error('Error executing single recovery:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionInProgress(id);
      const res = await approveRecoveryAction(id);
      setToastMessage(`✅ Approved! ${res.message}`);
      await loadData(false);
      setTimeout(() => setToastMessage(null), 8000);
    } catch (err) {
      console.error('Error approving action:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionInProgress(id);
      const res = await rejectRecoveryAction(id);
      setToastMessage(`❌ Action Rejected for ${id}`);
      await loadData(false);
      setTimeout(() => setToastMessage(null), 8000);
    } catch (err) {
      console.error('Error rejecting action:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    // Category filtering
    if (filterCategory === 'payment_failure' && !['gateway_timeout', 'upi_failure', 'card_declined', 'bank_declined'].includes(t.failureReason)) return false;
    if (filterCategory === 'checkout_abandonment' && t.failureReason !== 'checkout_abandoned') return false;
    if (filterCategory === 'subscription_failure' && t.failureReason !== 'subscription_failed') return false;
    if (filterCategory === 'mandate_failure' && t.failureReason !== 'mandate_failed') return false;
    if (filterCategory === 'overdue' && t.failureReason !== 'invoice_overdue') return false;
    if (filterCategory === 'pending_review' && t.status !== 'PENDING_REVIEW') return false;
    if (filterCategory === 'recovered' && t.status !== 'RECOVERED') return false;

    // Search filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = t.id.toLowerCase().includes(q);
      const matchCust = t.customer?.name?.toLowerCase().includes(q) || t.customer?.email?.toLowerCase().includes(q);
      const matchReason = t.failureReason.toLowerCase().includes(q);
      return matchId || matchCust || matchReason;
    }

    return true;
  });

  const categories = [
    { key: 'all', label: 'All Transactions' },
    { key: 'payment_failure', label: 'Payment Failure' },
    { key: 'checkout_abandonment', label: 'Checkout Abandoned' },
    { key: 'subscription_failure', label: 'Subscription Failure' },
    { key: 'mandate_failure', label: 'Mandate Failure' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'pending_review', label: 'Pending Review' },
    { key: 'recovered', label: 'Recovered' }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Revenue Recovery Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Prioritized recoverable payments with AI risk scores & execution controls.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 rounded-lg bg-surface border border-border hover:border-slate-600 text-xs font-semibold text-slate-300 flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Table
        </button>
      </div>

      {/* Controls Bar: Search & Category Chips */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Transaction ID, Customer Name or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        {/* Filter Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilterCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filterCategory === cat.key
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-surface border border-border text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recovery Queue Table */}
      <div className="fintech-card overflow-hidden p-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-xs">Loading queue items...</span>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No transactions found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-border uppercase tracking-wider text-[11px] text-slate-400">
                <tr>
                  <th className="p-3.5">Transaction ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Failure Type</th>
                  <th className="p-3.5">Risk</th>
                  <th className="p-3.5">Recovery Prob</th>
                  <th className="p-3.5">Recommended Action</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Execute / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.map((t) => {
                  const decision = t.agentDecisions && t.agentDecisions[0];
                  const prob = decision?.recoveryProbability ? `${(decision.recoveryProbability * 100).toFixed(0)}%` : '85%';
                  const risk = decision?.riskLevel || (t.amount > 10000 ? 'high' : 'low');
                  const recAction = decision?.recommendedAction || 'retry_payment';
                  const isPendingReview = t.status === 'PENDING_REVIEW';
                  const isRecovered = t.status === 'RECOVERED';
                  const isBusy = actionInProgress === t.id;

                  return (
                    <tr key={t.id} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="p-3.5 font-mono text-amber-400 font-semibold">
                        <Link to={`/transactions/${t.id}`} className="hover:underline">
                          {t.id}
                        </Link>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-200">{t.customer?.name || 'Customer'}</div>
                        <div className="text-[11px] text-slate-400">{t.customer?.email}</div>
                      </td>
                      <td className="p-3.5 font-extrabold text-slate-100">₹{t.amount.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 font-medium text-slate-300">
                        <span className="capitalize">{t.failureReason.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`fintech-badge ${
                            risk === 'low'
                              ? 'badge-success'
                              : risk === 'medium'
                              ? 'badge-warning'
                              : 'badge-danger'
                          }`}
                        >
                          {risk.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-200">{prob}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-200 uppercase">
                          {recAction.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`fintech-badge ${
                            isRecovered
                              ? 'badge-success'
                              : isPendingReview
                              ? 'badge-warning'
                              : t.status === 'FAILED'
                              ? 'badge-blue'
                              : 'badge-danger'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {isPendingReview ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApprove(t.id)}
                              disabled={isBusy}
                              className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(t.id)}
                              disabled={isBusy}
                              className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-[11px] transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        ) : isRecovered ? (
                          <span className="text-emerald-400 font-semibold text-[11px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Recovered
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRunSingle(t.id)}
                            disabled={isBusy}
                            className="px-3 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[11px] inline-flex items-center gap-1 transition-all disabled:opacity-50"
                          >
                            {isBusy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                            Run Agent
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
