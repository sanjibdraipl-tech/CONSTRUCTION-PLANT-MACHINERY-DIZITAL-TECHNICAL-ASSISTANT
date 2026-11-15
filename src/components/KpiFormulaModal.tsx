import React from 'react';
import { X, Calculator, HelpCircle, Layers, CheckCircle } from 'lucide-react';
import { KpiMetric } from '../types';

interface KpiFormulaModalProps {
  kpi: KpiMetric | null;
  onClose: () => void;
}

export const KpiFormulaModal: React.FC<KpiFormulaModalProps> = ({ kpi, onClose }) => {
  if (!kpi) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                KPI Formula Engine
              </span>
              <h2 className="text-lg font-bold text-white">{kpi.name}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Metric Value Card */}
        <div className="my-5 flex items-center justify-between rounded-xl bg-slate-950 p-4 border border-slate-800">
          <div>
            <span className="text-xs text-slate-400">Current Measured Value</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-2xl font-black font-mono text-white tracking-tight">
                {kpi.value}
              </span>
              <span className="text-xs font-semibold text-amber-400">{kpi.unit}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Target Benchmark</span>
            <div className="text-sm font-semibold text-emerald-400 mt-0.5">
              {kpi.target} {kpi.unit}
            </div>
          </div>
          <div className="flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-xs font-bold bg-slate-900 border border-slate-700">
            <CheckCircle
              className={`h-3.5 w-3.5 ${
                kpi.status === 'Good'
                  ? 'text-emerald-400'
                  : kpi.status === 'Warning'
                  ? 'text-amber-400'
                  : 'text-red-400'
              }`}
            />
            <span className="text-slate-200">{kpi.status}</span>
          </div>
        </div>

        {/* Formal Formula */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Layers className="h-3.5 w-3.5 text-amber-400" />
              <span>Standard Engineering Formula</span>
            </label>
            <div className="mt-1.5 rounded-xl bg-slate-950/80 p-3.5 border border-amber-500/20 font-mono text-xs font-semibold text-amber-300">
              {kpi.formula}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
              <span>Engineering Description</span>
            </label>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              {kpi.formulaDescription}
            </p>
          </div>

          {/* Current Variables */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Current Live Variables (Fleet MTD)
            </label>
            <div className="mt-2 divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950/40 text-xs">
              {Object.entries(kpi.variables).map(([key, val]) => (
                <div key={key} className="flex justify-between p-2.5">
                  <span className="text-slate-400">{key}</span>
                  <span className="font-mono font-semibold text-slate-100">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 transition-colors"
          >
            Close Formula
          </button>
        </div>
      </div>
    </div>
  );
};
