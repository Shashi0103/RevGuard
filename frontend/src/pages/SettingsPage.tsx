import React, { useState } from 'react';
import { Settings, ShieldCheck, RefreshCw, Key, CheckCircle2, AlertTriangle, Database } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [demoMode, setDemoMode] = useState(true);
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">System Settings & Demo Mode</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure financial guardrail rules, payment provider secrets, and environment parameters.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Settings updated successfully!
        </div>
      )}

      {/* Demo Mode Configuration */}
      <div className="fintech-card space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-100">Demo Environment Mode</h2>
            <p className="text-xs text-slate-400">Simulate payment gateways, AI recovery steps, and Database updates without live money movement.</p>
          </div>
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              demoMode ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-400'
            }`}
          >
            DEMO MODE: {demoMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Financial Guardrails Configuration */}
      <div className="fintech-card space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" /> Deterministic Guardrail Parameters
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-surface border border-border">
            <span className="text-slate-400 block font-semibold">Max Payment Retries</span>
            <span className="text-lg font-bold text-amber-400">1 Attempt</span>
            <span className="text-[10px] text-slate-400 block mt-1">Capped automatically</span>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-border">
            <span className="text-slate-400 block font-semibold">High-Value Threshold</span>
            <span className="text-lg font-bold text-slate-100">₹10,000</span>
            <span className="text-[10px] text-amber-400 block mt-1">Requires human approval</span>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-border">
            <span className="text-slate-400 block font-semibold">Min Confidence Floor</span>
            <span className="text-lg font-bold text-slate-100">80%</span>
            <span className="text-[10px] text-slate-400 block mt-1">Escalates below 0.80</span>
          </div>
        </div>
      </div>

      {/* Razorpay Test Mode Credentials */}
      <form onSubmit={handleSave} className="fintech-card space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Key className="w-5 h-5 text-amber-400" /> Razorpay Test Mode Credentials
        </h2>
        <p className="text-xs text-slate-400">
          Optional test keys for live Razorpay Test Mode integration. Leave blank to run seamlessly on DemoPaymentProvider.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">RAZORPAY_KEY_ID</label>
            <input
              type="text"
              placeholder="rzp_test_..."
              value={razorpayKeyId}
              onChange={(e) => setRazorpayKeyId(e.target.value)}
              className="w-full bg-slate-950 border border-border rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">RAZORPAY_KEY_SECRET</label>
            <input
              type="password"
              placeholder="••••••••••••••••"
              value={razorpayKeySecret}
              onChange={(e) => setRazorpayKeySecret(e.target.value)}
              className="w-full bg-slate-950 border border-border rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all"
        >
          Save System Configuration
        </button>
      </form>
    </div>
  );
};
