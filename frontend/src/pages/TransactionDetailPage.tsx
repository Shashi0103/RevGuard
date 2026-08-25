import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  CreditCard,
  FileText,
  Cpu
} from 'lucide-react';
import { fetchTransactionById, Transaction } from '../lib/api';

export const TransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTransactionById(id)
        .then(setTransaction)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-xs">Loading transaction breakdown...</div>;
  }

  if (!transaction) {
    return <div className="p-12 text-center text-slate-400 text-xs">Transaction not found.</div>;
  }

  const latestDecision = transaction.agentDecisions && transaction.agentDecisions[0];

  return (
    <div className="space-y-6">
      <Link to="/transactions" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Transactions
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-mono">
              {transaction.id}
            </h1>
            <span className={`fintech-badge ${transaction.status === 'RECOVERED' ? 'badge-success' : transaction.status === 'PENDING_REVIEW' ? 'badge-warning' : 'badge-danger'}`}>
              {transaction.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Created: {new Date(transaction.createdAt).toLocaleString()}</p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400 uppercase font-semibold">Amount</div>
          <div className="text-3xl font-extrabold text-amber-400">₹{transaction.amount.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Transaction & Customer Details (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="fintech-card space-y-4">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-border pb-3">
              <CreditCard className="w-4 h-4 text-amber-400" /> Transaction Overview
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Payment Method</span>
                <span className="font-semibold text-slate-200">{transaction.paymentMethod}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Failure Reason</span>
                <span className="font-semibold text-rose-400 capitalize">{transaction.failureReason.replace(/_/g, ' ')}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Retry Count</span>
                <span className="font-semibold text-slate-200">{transaction.retryCount}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Checkout Status</span>
                <span className="font-semibold text-slate-200">{transaction.checkoutStatus}</span>
              </div>
            </div>
          </div>

          <div className="fintech-card space-y-4">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-border pb-3">
              <User className="w-4 h-4 text-amber-400" /> Customer Information
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Name</span>
                <span className="font-semibold text-slate-200">{transaction.customer?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Email</span>
                <span className="font-semibold text-slate-200">{transaction.customer?.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Phone</span>
                <span className="font-semibold text-slate-200">{transaction.customer?.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Diagnosis & Reasoning (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="fintech-card bg-slate-950/80 border-amber-500/30 space-y-4">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-border pb-3">
              <Cpu className="w-4 h-4 text-amber-400" /> AI Diagnosis & Recommendation
            </h2>

            {latestDecision ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-surface border border-border">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Diagnosis</span>
                    <span className="font-bold text-slate-200">{latestDecision.diagnosis}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-surface border border-border">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Confidence</span>
                    <span className="font-bold text-emerald-400">{(latestDecision.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-surface border border-border">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Recovery Prob</span>
                    <span className="font-bold text-amber-400">{(latestDecision.recoveryProbability * 100).toFixed(0)}%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-surface border border-border">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Risk Level</span>
                    <span className="font-bold text-slate-200 uppercase">{latestDecision.riskLevel}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Decision Reasoning</div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{latestDecision.reason}</p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">No AI diagnosis generated yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
