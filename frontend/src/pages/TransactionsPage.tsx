import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, RefreshCw, Filter, ArrowRight, ExternalLink } from 'lucide-react';
import { fetchTransactions, Transaction } from '../lib/api';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchTransactions({ status: statusFilter, search });
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">Transactions</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Complete log of all merchant checkout attempts and subscriptions.</p>
        </div>
        <button onClick={loadData} className="px-4 py-2 rounded-lg bg-surface border border-border text-xs font-semibold text-slate-300 flex items-center gap-2 self-start">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Transaction ID or Customer Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadData()}
            className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface border border-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="FAILED">Failed</option>
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="RECOVERED">Recovered</option>
          <option value="RECOVERY_FAILED">Recovery Failed</option>
        </select>
      </div>

      <div className="fintech-card overflow-hidden p-0">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading transactions...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-border uppercase tracking-wider text-[11px] text-slate-400">
                <tr>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Failure Reason</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="p-3.5 font-mono text-amber-400 font-semibold">{t.id}</td>
                    <td className="p-3.5 font-medium text-slate-200">{t.customer?.name || 'Customer'}</td>
                    <td className="p-3.5 font-bold text-slate-100">₹{t.amount.toLocaleString('en-IN')}</td>
                    <td className="p-3.5">{t.paymentMethod}</td>
                    <td className="p-3.5 text-slate-300 capitalize">{t.failureReason.replace(/_/g, ' ')}</td>
                    <td className="p-3.5">
                      <span className={`fintech-badge ${t.status === 'RECOVERED' ? 'badge-success' : t.status === 'PENDING_REVIEW' ? 'badge-warning' : 'badge-danger'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <Link to={`/transactions/${t.id}`} className="text-amber-400 hover:underline flex items-center justify-end gap-1 font-semibold">
                        Inspect <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
