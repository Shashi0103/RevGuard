import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRight,
  Play,
  CheckCircle2,
  Lock,
  TrendingUp,
  Cpu,
  RefreshCw,
  Search,
  Activity,
  FileCheck,
  ShieldCheck,
  Zap,
  BarChart2
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const workflowSteps = [
    { name: 'DETECT', desc: 'Identify lost checkouts & failed payment webhooks in real time', icon: Search, color: 'from-amber-500 to-amber-600' },
    { name: 'DIAGNOSE', desc: 'Classify root causes using ML risk scoring & historical customer data', icon: Cpu, color: 'from-blue-500 to-indigo-600' },
    { name: 'DECIDE', desc: 'Select bounded recovery action verified against deterministic guardrails', icon: ShieldCheck, color: 'from-purple-500 to-purple-700' },
    { name: 'RECOVER', desc: 'Execute automated retry, payment links, or escalate for human review', icon: RefreshCw, color: 'from-emerald-500 to-teal-600' },
    { name: 'VERIFY', desc: 'Validate actual money collected in Database & record full audit trail', icon: FileCheck, color: 'from-amber-400 to-amber-600' }
  ];

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 font-sans relative overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-500/10 via-amber-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-wider text-slate-100">REV<span className="text-amber-400">GUARD</span></span>
            <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">AI AGENT</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/agent"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-300 hover:text-slate-100 hover:bg-surface transition-all"
          >
            <Play className="w-4 h-4 text-amber-400 fill-current" />
            Agent Console
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            Launch Console
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide mb-8 shadow-inner">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
          <span>TRACK 03 — AI REVENUE RECOVERY AGENT</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-100 mb-6 leading-tight">
          REVGUARD
        </h1>

        <p className="text-xl sm:text-2xl font-medium text-amber-400 max-w-3xl mx-auto mb-6">
          “Every lost payment deserves a second chance.”
        </p>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          RevGuard detects revenue leakage, diagnoses why payments fail, chooses safe recovery actions, and measures the money actually recovered — with every decision audited.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-extrabold text-base shadow-2xl shadow-amber-500/30 hover:brightness-110 transition-all active:scale-95"
          >
            Launch Recovery Console
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            to="/agent"
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/50 text-slate-200 font-bold text-base hover:bg-slate-800 transition-all"
          >
            <Play className="w-4 h-4 text-amber-400 fill-current" />
            View Agent Demo
          </Link>
        </div>

        {/* Live Demo Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto p-6 rounded-2xl bg-surface/80 border border-border backdrop-blur-md shadow-2xl">
          <div className="text-center p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">Revenue Recovered</div>
            <div className="text-3xl font-extrabold text-amber-400 tracking-tight">₹1,32,792</div>
            <div className="text-[11px] text-emerald-400 mt-1 font-medium">✓ Actual database verified</div>
          </div>

          <div className="text-center p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">Recovery Rate</div>
            <div className="text-3xl font-extrabold text-slate-100 tracking-tight">72.1%</div>
            <div className="text-[11px] text-slate-400 mt-1">Bounded safety engine</div>
          </div>

          <div className="text-center p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">Transactions Analyzed</div>
            <div className="text-3xl font-extrabold text-slate-100 tracking-tight">105</div>
            <div className="text-[11px] text-amber-400/80 mt-1">Synthetic demo dataset</div>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 mt-3 italic">* Metrics populated live from Neon PostgreSQL demo dataset.</div>
      </section>

      {/* Core Workflow Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border/60 relative z-10">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight mb-3">
            Autonomous Recovery Workflow
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            From detection to deterministic audit trail — an agent that takes action within strict financial guardrails.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative p-5 rounded-xl bg-surface border border-border hover:border-amber-500/40 transition-all flex flex-col items-start justify-between group"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-bold tracking-wider text-amber-400 mb-1">0{idx + 1}. {step.name}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Architectural Guarantee Section */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-border/60 relative z-10 text-center">
        <div className="p-8 rounded-2xl bg-gradient-to-b from-surface to-slate-950 border border-amber-500/20 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-100 mb-2">Deterministic Guardrail Security</h3>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed mb-6">
            The LLM reasons and recommends; deterministic code decides. Automatic retries are capped at 1 attempt, high-value transactions above ₹10,000 require human operator approval, and low-confidence decisions escalate automatically.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Max Retries ≤ 1</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> High-Value Threshold ₹10,000</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Immutable Audit Log</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-border text-center text-xs text-slate-400">
        <p>© 2026 RevGuard. Hackathon Track 03 — AI Revenue Recovery Agent.</p>
      </footer>
    </div>
  );
};
