import React, { useState } from 'react';
import {
  Cpu,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  UserCheck,
  Lock
} from 'lucide-react';
import { runAgentBatch, analyzeSingleTransaction, approveRecoveryAction, rejectRecoveryAction, PipelineExecutionResult } from '../lib/api';

export const AgentConsolePage: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeResult, setActiveResult] = useState<PipelineExecutionResult | null>(null);
  const [historyResults, setHistoryResults] = useState<PipelineExecutionResult[]>([]);
  const [targetTxnId, setTargetTxnId] = useState<string>('TXN-4821');

  const handleRunPipeline = async () => {
    setIsRunning(true);
    try {
      // Simulate live step delays for hackathon demo presentation
      const result = await analyzeSingleTransaction(targetTxnId.trim());
      setActiveResult(result);
      setHistoryResults((prev) => [result, ...prev]);
    } catch (err) {
      console.error('Error in agent execution:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunBatch = async () => {
    setIsRunning(true);
    try {
      const batchRes = await runAgentBatch(3);
      if (batchRes.results && batchRes.results.length > 0) {
        setActiveResult(batchRes.results[0]);
        setHistoryResults((prev) => [...batchRes.results, ...prev]);
      }
    } catch (err) {
      console.error('Error running batch:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await approveRecoveryAction(id);
      if (activeResult && activeResult.transactionId === id) {
        setActiveResult({
          ...activeResult,
          status: 'RECOVERED',
          actionExecuted: true,
          amountRecovered: activeResult.amount,
          recoveryResult: res.message
        });
      }
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await rejectRecoveryAction(id);
      if (activeResult && activeResult.transactionId === id) {
        setActiveResult({
          ...activeResult,
          status: 'EXPIRED',
          actionExecuted: false,
          amountRecovered: 0,
          recoveryResult: res.message
        });
      }
    } catch (err) {
      console.error('Rejection failed:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>AI RECOVERY AGENT PIPELINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Agent Execution Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time step-by-step decision telemetry, risk diagnosis & bounded action execution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface border border-border rounded-xl p-1 px-3">
            <span className="text-xs text-slate-400">Txn:</span>
            <input
              type="text"
              value={targetTxnId}
              onChange={(e) => setTargetTxnId(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-amber-400 w-24 focus:outline-none"
            />
          </div>

          <button
            onClick={handleRunPipeline}
            disabled={isRunning}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            Analyze & Recover
          </button>

          <button
            onClick={handleRunBatch}
            disabled={isRunning}
            className="px-4 py-2.5 rounded-xl bg-surface border border-border hover:border-slate-600 text-xs font-bold text-slate-200 flex items-center gap-2"
          >
            Run Batch Pipeline
          </button>
        </div>
      </div>

      {/* Main Console Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Execution Telemetry (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="fintech-card relative overflow-hidden min-h-[420px]">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
                <Cpu className="w-4 h-4 text-amber-400" />
                <span>AI RECOVERY AGENT TELEMETRY</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {activeResult ? `Processing ${activeResult.transactionId}` : 'Ready for execution'}
              </span>
            </div>

            {isRunning ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <RefreshCw className="w-10 h-10 text-amber-400 animate-spin" />
                <p className="text-xs font-mono text-slate-300">Executing Detect → Diagnose → Guardrail → Act Pipeline...</p>
              </div>
            ) : activeResult ? (
              <div className="space-y-3 font-mono text-xs">
                {activeResult.steps.map((s, idx) => {
                  const isSuccess = s.status === 'SUCCESS';
                  const isBlocked = s.status === 'BLOCKED';
                  const isWarning = s.status === 'WARNING';

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border flex items-start justify-between gap-3 transition-all ${
                        isSuccess
                          ? 'bg-slate-950/80 border-slate-800/80 text-slate-200'
                          : isBlocked
                          ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                          : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {isSuccess ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : isBlocked ? (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                            [{s.step}]
                          </span>
                          <span className="font-sans font-medium text-xs leading-relaxed">{s.message}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{s.timestamp}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-slate-400">
                <Cpu className="w-12 h-12 text-slate-700 mb-3 stroke-[1.5]" />
                <h3 className="text-sm font-bold text-slate-300 mb-1">No Active Telemetry</h3>
                <p className="text-xs max-w-sm mb-4">
                  Click "Analyze & Recover" or enter a transaction ID (e.g. TXN-4821 or TXN-49291) to watch the agent evaluate in real time.
                </p>
                <button
                  onClick={handleRunPipeline}
                  className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20"
                >
                  Run Demo Test (TXN-4821)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Decision Outcome Card & Guardrail Review (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {activeResult ? (
            <div className="fintech-card border-amber-500/30 bg-slate-950/80 space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">RECOMMENDED ACTION</span>
                <span className="font-mono text-xs font-bold text-amber-400">{activeResult.transactionId}</span>
              </div>

              <div className="text-center p-4 rounded-xl bg-surface border border-border">
                <div className="text-xs uppercase font-semibold text-slate-400 mb-1">Action Selected</div>
                <div className="text-xl font-extrabold text-amber-400 uppercase tracking-tight">
                  {activeResult.recommendedAction.replace(/_/g, ' ')}
                </div>
                <div className="text-xs font-semibold text-slate-300 mt-2">
                  Expected Recovery: <span className="text-emerald-400 font-extrabold">₹{activeResult.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 rounded-lg bg-surface border border-border">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Confidence</div>
                  <div className="text-base font-extrabold text-slate-100 mt-0.5">{(activeResult.confidence * 100).toFixed(0)}%</div>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Risk Level</div>
                  <div className="text-base font-extrabold text-amber-400 capitalize mt-0.5">{activeResult.riskLevel}</div>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Guardrails</div>
                  <div className={`text-base font-extrabold mt-0.5 ${activeResult.guardrailStatus === 'PASSED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {activeResult.guardrailStatus}
                  </div>
                </div>
              </div>

              {/* Human-in-the-loop review panel if guardrail requires approval */}
              {activeResult.guardrailStatus !== 'PASSED' && activeResult.status === 'PENDING_REVIEW' && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <span>HUMAN REVIEW REQUIRED</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{activeResult.guardrailReason}</p>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => handleApprove(activeResult.transactionId)}
                      className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                    >
                      Approve Recovery
                    </button>
                    <button
                      onClick={() => handleReject(activeResult.transactionId)}
                      className="flex-1 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Execution outcome status */}
              {activeResult.actionExecuted && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium space-y-1">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>PAYMENT SUCCESSFUL ✓</span>
                  </div>
                  <div>₹{activeResult.amountRecovered.toLocaleString('en-IN')} RECOVERED & VERIFIED</div>
                </div>
              )}
            </div>
          ) : (
            <div className="fintech-card p-6 text-center text-slate-400 text-xs">
              <ShieldCheck className="w-10 h-10 text-slate-700 mx-auto mb-2" />
              <span>Select or trigger a transaction to inspect agent reasoning & guardrail rules.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
