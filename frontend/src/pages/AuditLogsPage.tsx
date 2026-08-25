import React, { useEffect, useState } from 'react';
import { Search, RefreshCw, FileText, ShieldCheck, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import { fetchAuditLogs, AuditLog } from '../lib/api';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchAuditLogs({ event: eventFilter, search });
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <Lock className="w-6 h-6 text-amber-400" /> Immutable Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete cryptographic event trail for every AI diagnosis, guardrail decision, and recovery attempt.
          </p>
        </div>

        <button onClick={loadData} className="px-4 py-2 rounded-lg bg-surface border border-border text-xs font-semibold text-slate-300 flex items-center gap-2 self-start">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Audit Trail
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Transaction ID, Event or Actor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadData()}
            className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      <div className="fintech-card overflow-hidden p-0">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading audit events...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-border uppercase tracking-wider text-[11px] text-slate-400">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Transaction ID</th>
                  <th className="p-3.5">Event</th>
                  <th className="p-3.5">Decision</th>
                  <th className="p-3.5">Actor</th>
                  <th className="p-3.5">Reason</th>
                  <th className="p-3.5 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="p-3.5 font-mono text-amber-400 font-semibold">{log.transactionId || 'SYSTEM'}</td>
                    <td className="p-3.5 font-semibold text-slate-200">{log.event}</td>
                    <td className="p-3.5 text-slate-300">{log.decision}</td>
                    <td className="p-3.5 font-mono text-slate-400">{log.actor}</td>
                    <td className="p-3.5 text-slate-400 max-w-xs truncate">{log.reason}</td>
                    <td className="p-3.5 text-right">
                      <span className={`fintech-badge ${log.result === 'SUCCESS' ? 'badge-success' : log.result === 'REQUIRES_APPROVAL' ? 'badge-warning' : 'badge-blue'}`}>
                        {log.result}
                      </span>
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
