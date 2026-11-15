import React from 'react';
import {
  BarChart3,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Cpu,
  Layers,
} from 'lucide-react';
import { KpiMetric } from '../types';

interface KpiDashboardViewProps {
  kpis: KpiMetric[];
  onOpenKpiFormula: (kpi: KpiMetric) => void;
}

export const KpiDashboardView: React.FC<KpiDashboardViewProps> = ({ kpis, onOpenKpiFormula }) => {
  const categories = [
    'Availability & Utilization',
    'Maintenance & Reliability',
    'Fuel & Energy',
    'Cost & ROI',
    'Productivity',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-black uppercase text-amber-400 border border-amber-500/30">
            Module 09 • KPI Calculation Engine
          </span>
          <span className="text-xs text-slate-400">Click Any Metric to Inspect Formula</span>
        </div>
        <h1 className="text-2xl font-black text-white mt-1">P&M KPI Engine & Math Models</h1>
        <p className="text-xs text-slate-400">
          Mechanical vs Operational Availability, MTBF, MTTR, PM Compliance %, Fuel/Hr, Maintenance/Hr, and Equipment ROI
        </p>
      </div>

      {/* Banner Reminder */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 flex items-center justify-between text-xs text-amber-200">
        <div className="flex items-center space-x-2">
          <HelpCircle className="h-4 w-4 text-amber-400 shrink-0" />
          <span>
            <strong>Engineering Requirement (Section 9):</strong> Formula must be displayed when the user clicks any KPI card.
          </span>
        </div>
        <span className="text-[10px] text-amber-400 font-mono font-bold">10 Live Engine Formulas</span>
      </div>

      {/* KPI Cards Grouped by Category */}
      <div className="space-y-8">
        {categories.map((cat) => {
          const catKpis = kpis.filter((k) => k.category === cat);
          if (catKpis.length === 0) return null;

          return (
            <div key={cat} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>{cat}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catKpis.map((kpi) => (
                  <div
                    key={kpi.id}
                    onClick={() => onOpenKpiFormula(kpi)}
                    className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg hover:border-amber-500/60 hover:shadow-amber-500/5 cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-slate-300 group-hover:text-amber-400 transition-colors">
                          {kpi.name}
                        </span>
                        <div className="flex items-center space-x-1.5 text-slate-500 group-hover:text-amber-400">
                          <span className="text-[10px] font-mono">Formula</span>
                          <ExternalLink className="h-3 w-3" />
                        </div>
                      </div>

                      <div className="mt-3 flex items-baseline space-x-2">
                        <span className="text-3xl font-black font-mono text-white tracking-tight">
                          {kpi.value}
                        </span>
                        <span className="text-xs font-bold text-amber-400">{kpi.unit}</span>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-slate-800/80 pt-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[11px]">Benchmark Target:</span>
                        <span className="font-mono text-slate-300 font-semibold">
                          {kpi.target} {kpi.unit}
                        </span>
                      </div>

                      <div className="mt-2 rounded bg-slate-950 p-2 border border-slate-800 font-mono text-[10px] text-amber-300/90 truncate">
                        {kpi.formula}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
