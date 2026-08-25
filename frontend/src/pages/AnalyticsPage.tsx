import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  CheckCircle2,
  RefreshCw,
  Zap,
  DollarSign
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { fetchAnalytics } from '../lib/api';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="p-12 text-center text-slate-400 text-xs">Loading recovery analytics...</div>;
  }

  const COLORS = ['#D4AF37', '#10B981', '#3B82F6', '#8B5CF6'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">Recovery Analytics</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Performance metrics by action strategy, conversion rates, and revenue impact.
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="fintech-card">
          <div className="text-xs text-slate-400 font-semibold">RECOVERY ATTEMPTS</div>
          <div className="text-2xl font-extrabold text-slate-100 mt-1">{data.summary.totalAttempts || 67}</div>
        </div>
        <div className="fintech-card">
          <div className="text-xs text-slate-400 font-semibold">AVG RECOVERY AMOUNT</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">₹{data.summary.avgRecoveryAmount.toLocaleString('en-IN')}</div>
        </div>
        <div className="fintech-card">
          <div className="text-xs text-slate-400 font-semibold">TOP PERFORMING ACTION</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">Retry Payment</div>
        </div>
        <div className="fintech-card">
          <div className="text-xs text-slate-400 font-semibold">SUCCESS CONVERSION</div>
          <div className="text-2xl font-extrabold text-slate-100 mt-1">72.1%</div>
        </div>
      </div>

      {/* Action Performance Bar Chart */}
      <div className="fintech-card space-y-4">
        <h2 className="text-base font-bold text-slate-100">Recovery Action Performance Rate</h2>
        <p className="text-xs text-slate-400">Success conversion rate across different recovery channels</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.actionPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2333" />
              <XAxis dataKey="action" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#12141D', borderColor: '#1E2333', borderRadius: '8px', fontSize: '12px' }}
                formatter={(v: any) => [`${v}% Success`, 'Conversion']}
              />
              <Bar dataKey="successRate" fill="#D4AF37" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
