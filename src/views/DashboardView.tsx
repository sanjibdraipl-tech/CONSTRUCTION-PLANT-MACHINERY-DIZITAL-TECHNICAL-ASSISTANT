import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  Fuel,
  TrendingUp,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Mic,
  MicOff,
  Volume2,
} from 'lucide-react';
import { Equipment, BreakdownRecord, PmRecord, FuelEntry, KpiMetric } from '../types';
import { voiceAgent } from '../utils/voiceAgent';

interface DashboardViewProps {
  equipment: Equipment[];
  breakdowns: BreakdownRecord[];
  pmRecords: PmRecord[];
  fuelEntries: FuelEntry[];
  kpis: KpiMetric[];
  onOpenDiagnosticWithQuery: (query: string, equipmentId?: string) => void;
  onOpenKpiFormula: (kpi: KpiMetric) => void;
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  equipment,
  breakdowns,
  pmRecords,
  fuelEntries,
  kpis,
  onOpenDiagnosticWithQuery,
  onOpenKpiFormula,
  onNavigate,
}) => {
  const [quickProblemText, setQuickProblemText] = useState('');
  const [isMicActive, setIsMicActive] = useState(false);

  // Quick stats
  const totalCount = equipment.length;
  const availableCount = equipment.filter((e) => e.currentStatus === 'Available' || e.currentStatus === 'Running').length;
  const underMaintCount = equipment.filter((e) => e.currentStatus === 'Under Maintenance').length;
  const breakdownCount = equipment.filter((e) => e.currentStatus === 'Breakdown').length;

  const overduePmCount = pmRecords.filter((p) => p.status === 'Overdue').length;
  const fuelAlertEntries = fuelEntries.filter(
    (f) => f.alertType && f.alertType !== 'Normal'
  );

  const handleAnalyzeClick = () => {
    if (quickProblemText.trim()) {
      onOpenDiagnosticWithQuery(quickProblemText);
    } else {
      onOpenDiagnosticWithQuery('Excavator EX-01 low hydraulic pressure and sluggish bucket curl');
    }
  };

  const sampleQueries = [
    { title: '🚇 TBM Cutterhead torque overload >1200 kNm', eq: 'TBM-01' },
    { title: '🚇 SLG-50 Launching Girder twin hoist brake slip', eq: 'SLG-01' },
    { title: '🛣️ Vögele Paver screed heating temp imbalance', eq: 'PV-01' },
    { title: '🌉 Kobelco 250T Crane LMI barge sensor trip', eq: 'CR-250' },
    { title: '🛢️ CAT 572R Side Boom winch hydraulic slip', eq: 'PL-01' },
    { title: '🛢️ Vermeer HDD rig pullback pressure spike', eq: 'HDD-01' },
    { title: '🛣️ Apollo HMP 160 TPH burner flame trip', eq: 'HMP-01' },
    { title: 'Excavator EX210 low crowd pressure (190 bar)', eq: 'EX-01' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 32. REQUIRED FIRST SCREEN HEADER */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8 shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded-md bg-amber-500 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-slate-950">
                P&M CONTROL TOWER
              </span>
              <span className="text-xs font-semibold text-slate-400">
                • Indian Infrastructure Edition (NHAI • Metro • Railways • Ports)
              </span>
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              PLANT<span className="text-amber-400">MITRA</span>
            </h1>
            <p className="text-sm font-semibold text-amber-200/90 mt-0.5">
              AI Construction Plant & Machinery Digital Technical Assistant
            </p>
            <p className="text-xs font-medium text-slate-400 mt-1 flex items-center space-x-2">
              <span className="text-amber-400 font-bold">Subtitle:</span>
              <span>Diagnose • Maintain • Monitor • Optimize • Control</span>
            </p>
          </div>

          {/* Quick Status Pill */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Fleet Health</span>
              <span className="text-emerald-400 font-bold text-sm">85.2% Operational</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Sites</span>
              <span className="text-cyan-400 font-bold text-sm">5 Infrastructure Projects</span>
            </div>
          </div>
        </div>
      </div>

      {/* EXECUTIVE BRIDGE P&M COST & PERFORMANCE BANNER */}
      <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="rounded bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 uppercase tracking-wider">
              NEW • EXECUTIVE FRAMEWORK
            </span>
            <span className="text-xs font-bold text-white">
              Bridge P&M Cost & Performance Management System
            </span>
          </div>
          <p className="text-xs text-amber-200/90 italic">
            “Is the machine available, productive, fuel-efficient, economically justified, and costing within the approved budget?”
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 font-mono">
            <span>• BOQ-First Machine Budget</span>
            <span>• 4-Tier Utilization</span>
            <span>• Dual Fuel Norms (L/hr & L/unit)</span>
            <span>• 6 Golden P&M Formulas</span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('bridge-pm-control')}
          className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer shrink-0"
        >
          <span>Open Master Economic Model</span>
          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>

      {/* LARGE KPI CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Equipment */}
        <div
          onClick={() => onNavigate('equipment-master')}
          className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 hover:border-slate-700 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Equipment</span>
            <div className="h-2 w-2 rounded-full bg-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-white">{totalCount}</span>
            <span className="text-[11px] font-semibold text-slate-400">Assets</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex items-center">
            <span>Fleet database register</span>
            <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Available Equipment */}
        <div
          onClick={() => onNavigate('equipment-status')}
          className="rounded-xl border border-emerald-950/60 bg-emerald-950/20 p-4 hover:border-emerald-800/80 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-medium">Available Fleet</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-emerald-400">{availableCount}</span>
            <span className="text-[11px] font-semibold text-emerald-300">
              {((availableCount / totalCount) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="mt-2 text-[10px] text-emerald-500/80">Available & Running</div>
        </div>

        {/* Under Maintenance */}
        <div
          onClick={() => onNavigate('pm')}
          className="rounded-xl border border-amber-950/60 bg-amber-950/20 p-4 hover:border-amber-800/80 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-medium">Under Maintenance</span>
            <Clock className="h-4 w-4" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-amber-400">{underMaintCount}</span>
            <span className="text-[11px] font-semibold text-amber-300">In Workshop</span>
          </div>
          <div className="mt-2 text-[10px] text-amber-500/80">Scheduled PM Service</div>
        </div>

        {/* Breakdown Equipment */}
        <div
          onClick={() => onNavigate('breakdown')}
          className="rounded-xl border border-red-950/60 bg-red-950/20 p-4 hover:border-red-800/80 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-red-400">
            <span className="text-xs font-medium">Breakdown</span>
            <AlertOctagon className="h-4 w-4" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-red-400">{breakdownCount}</span>
            <span className="text-[11px] font-bold text-red-300">Critical</span>
          </div>
          <div className="mt-2 text-[10px] text-red-400 flex items-center">
            <span>Requires Tech Action</span>
            <ChevronRight className="h-3 w-3 ml-1" />
          </div>
        </div>

        {/* Availability % (Clickable for Formula) */}
        <div
          onClick={() => {
            const kpi = kpis.find((k) => k.id === 'kpi-avail');
            if (kpi) onOpenKpiFormula(kpi);
          }}
          className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 hover:border-amber-500/50 cursor-pointer transition-all group"
          title="Click to view exact formula"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Availability %</span>
            <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-amber-400">85.2%</span>
            <span className="text-[10px] text-slate-400">Target 90%</span>
          </div>
          <div className="mt-2 text-[10px] text-amber-400/80 font-mono">Formula: (Avail/Sched)×100</div>
        </div>

        {/* Utilization % (Clickable) */}
        <div
          onClick={() => {
            const kpi = kpis.find((k) => k.id === 'kpi-util');
            if (kpi) onOpenKpiFormula(kpi);
          }}
          className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 hover:border-amber-500/50 cursor-pointer transition-all group"
          title="Click to view exact formula"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Utilization %</span>
            <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-cyan-400">74.8%</span>
            <span className="text-[10px] text-slate-400">Target 80%</span>
          </div>
          <div className="mt-2 text-[10px] text-cyan-400/80 font-mono">Formula: (Running/Avail)×100</div>
        </div>

        {/* Productivity % */}
        <div
          onClick={() => onNavigate('productivity')}
          className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 hover:border-slate-700 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Productivity Index</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-emerald-400">91.4%</span>
            <span className="text-[10px] text-emerald-300">Plants & Fleet</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500">HMP: 138 TPH • RMC: 38 m³/h</div>
        </div>

        {/* Fuel Consumption */}
        <div
          onClick={() => onNavigate('fuel')}
          className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 hover:border-slate-700 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Fuel Consumed (Today)</span>
            <Fuel className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-white">4,820</span>
            <span className="text-[11px] font-semibold text-slate-400">Liters</span>
          </div>
          <div className="mt-2 text-[10px] text-yellow-400 font-medium">2 Exceptions detected</div>
        </div>

        {/* Maintenance Cost MTD */}
        <div
          onClick={() => onNavigate('costing')}
          className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 hover:border-slate-700 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Maintenance Cost (MTD)</span>
            <span className="text-xs text-amber-400 font-bold">₹</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-white">3.42</span>
            <span className="text-[11px] font-semibold text-slate-400">Lakhs</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500">Spares + Lubes + Labor</div>
        </div>

        {/* Cost / Operating Hour */}
        <div
          onClick={() => {
            const kpi = kpis.find((k) => k.id === 'kpi-fuel-cost');
            if (kpi) onOpenKpiFormula(kpi);
          }}
          className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 hover:border-amber-500/50 cursor-pointer transition-all group"
          title="Click to view exact formula"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Cost / Operating Hour</span>
            <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-amber-400">₹1,472</span>
            <span className="text-[11px] font-semibold text-slate-400">/ Hour</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 font-mono">Diesel: ₹92/L benchmark</div>
        </div>
      </div>

      {/* 32. AI TECHNICAL ASSISTANT QUICK INPUT BOX */}
      <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        <div className="flex items-center space-x-2.5 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20">
            <Sparkles className="h-4 w-4 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-wide">
              PLANT AND MACHINERY – AI Technical Assistant
            </h2>
            <p className="text-xs text-slate-400">
              Immediate engineering diagnosis across mechanical, hydraulic, powertrain, and electrical systems
            </p>
          </div>
        </div>

        {/* Input Box & Action Button */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3 mt-3">
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={quickProblemText}
              onChange={(e) => setQuickProblemText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeClick()}
              placeholder={
                isMicActive
                  ? 'Listening to microphone... Speak problem now...'
                  : 'Describe your equipment problem (or click mic to speak)...'
              }
              className={`w-full rounded-xl border bg-slate-950 px-4 py-3.5 pr-12 text-sm font-medium text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner ${
                isMicActive ? 'border-red-500 ring-2 ring-red-500/30' : 'border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
              }`}
            />
            <button
              type="button"
              onClick={() => {
                if (isMicActive) {
                  voiceAgent.stopListening();
                  setIsMicActive(false);
                } else {
                  setIsMicActive(true);
                  voiceAgent.startListening(
                    (text) => setQuickProblemText(text),
                    () => setIsMicActive(false),
                    () => setIsMicActive(false)
                  );
                }
              }}
              className={`absolute right-3 p-1.5 rounded-lg transition-colors cursor-pointer ${
                isMicActive ? 'bg-red-600 text-white animate-pulse' : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
              }`}
              title={isMicActive ? 'Stop voice recording' : 'Speak problem using microphone'}
            >
              {isMicActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          </div>
          <button
            onClick={handleAnalyzeClick}
            className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="h-4 w-4 stroke-[2.5]" />
            <span>ANALYZE WITH PLANT & MACHINERY AI</span>
          </button>
        </div>

        {/* Pre-canned Suggestions */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400">Quick Test Cases:</span>
          {sampleQueries.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuickProblemText(item.title);
                onOpenDiagnosticWithQuery(item.title, item.eq);
              }}
              className="rounded-lg bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 hover:bg-amber-500/15 hover:text-amber-400 border border-slate-700/60 transition-colors"
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* CRITICAL ALERTS BANNER (Section 32) */}
      <div className="rounded-xl border border-red-900/60 bg-red-950/30 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-300">
              Immediate Control Tower Attention Required (4 Alerts)
            </h4>
            <p className="text-xs text-red-200/80 mt-0.5">
              3 active breakdowns (EX-01, HMP-01, BP-03) • 3 overdue PM services • Abnormal fuel variance on 2 units.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 self-end md:self-center">
          <button
            onClick={() => onNavigate('breakdown')}
            className="rounded-lg bg-red-900/80 px-3 py-1.5 text-xs font-bold text-red-100 hover:bg-red-800 transition-colors"
          >
            Review Breakdowns
          </button>
          <button
            onClick={() => onNavigate('pm')}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            View PM Due
          </button>
        </div>
      </div>

      {/* TWO-COLUMN DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Breakdowns Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <AlertOctagon className="h-4 w-4 text-red-400" />
              <h3 className="text-sm font-bold text-white">Active Critical Breakdowns ({breakdowns.filter(b => b.finalStatus === 'Open').length})</h3>
            </div>
            <button
              onClick={() => onNavigate('breakdown')}
              className="text-xs font-semibold text-amber-400 hover:underline flex items-center"
            >
              <span>Breakdown Desk</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </button>
          </div>

          <div className="space-y-2.5">
            {breakdowns
              .filter((b) => b.finalStatus === 'Open')
              .map((bd) => (
                <div
                  key={bd.id}
                  onClick={() => onNavigate('breakdown')}
                  className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 hover:border-red-500/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-red-400">{bd.id}</span>
                      <span className="font-semibold text-xs text-white">{bd.equipmentId}</span>
                      <span className="text-[11px] text-slate-400">({bd.equipmentModel})</span>
                    </div>
                    <span className="rounded bg-red-950/80 border border-red-800 px-2 py-0.5 text-[10px] font-bold text-red-300">
                      {bd.stage}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-300 line-clamp-2">{bd.complaint}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80 pt-2">
                    <span>Tech: {bd.technician}</span>
                    <span className="font-mono text-amber-400 font-semibold">{bd.totalDowntimeHours} hrs downtime</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Preventive Maintenance Due / Overdue */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Maintenance Due & Overdue</h3>
            </div>
            <button
              onClick={() => onNavigate('pm')}
              className="text-xs font-semibold text-amber-400 hover:underline flex items-center"
            >
              <span>PM Schedule</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </button>
          </div>

          <div className="space-y-2.5">
            {pmRecords
              .filter((p) => p.status === 'Overdue' || p.status === 'Due' || p.status === 'Due Soon')
              .slice(0, 4)
              .map((pm) => (
                <div
                  key={pm.id}
                  onClick={() => onNavigate('pm')}
                  className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-amber-400">{pm.equipmentId}</span>
                      <span className="font-semibold text-xs text-white">{pm.equipmentModel}</span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
                        {pm.interval}
                      </span>
                    </div>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        pm.status === 'Overdue'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {pm.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>Due Date: {pm.dueDate}</span>
                    <span className="font-mono">
                      Current: {pm.currentHmr} HMR / Target: {pm.targetHmr} HMR
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* FUEL EXCEPTIONS & ABNORMAL VARIANCE (Section 11 & 32) */}
      <div className="rounded-2xl border border-yellow-900/60 bg-gradient-to-b from-yellow-950/20 to-slate-900 p-5 shadow-lg">
        <div className="flex items-center justify-between border-b border-yellow-900/40 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <Fuel className="h-4 w-4 text-yellow-400" />
            <h3 className="text-sm font-bold text-yellow-200">
              Fuel Variance & Anomaly Detection Desk
            </h3>
          </div>
          <button
            onClick={() => onNavigate('fuel')}
            className="text-xs font-semibold text-yellow-400 hover:underline flex items-center"
          >
            <span>Full Fuel Audit Desk</span>
            <ArrowRight className="h-3 w-3 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fuelAlertEntries.map((fe) => (
            <div
              key={fe.id}
              className="rounded-xl bg-slate-950 p-4 border border-yellow-900/50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs text-yellow-400">{fe.equipmentId}</span>
                  <span className="font-semibold text-xs text-white">{fe.equipmentModel}</span>
                </div>
                <span className="rounded bg-yellow-950 px-2 py-0.5 text-[10px] font-black text-yellow-300 border border-yellow-800">
                  +{fe.variancePercentage}% Variance
                </span>
              </div>

              {/* Exact wording rule enforcement */}
              <div className="rounded-lg bg-yellow-950/60 p-2.5 border border-yellow-800/80 text-xs font-semibold text-yellow-200">
                {fe.alertMessage || 'Abnormal fuel variance detected – investigation required.'}
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1">
                <div>
                  <span className="block text-slate-500 text-[10px]">Actual</span>
                  <span className="font-mono font-bold text-white">{fe.fuelConsumptionLiters} L</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-[10px]">Expected</span>
                  <span className="font-mono text-slate-300">{fe.expectedConsumptionLiters} L</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-[10px]">Operating</span>
                  <span className="font-mono text-slate-300">{fe.operatingHours} hrs</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SENIOR MANAGEMENT SUMMARY (Section 14 & 32) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Senior Management Executive Summary
              </h3>
              <p className="text-xs text-slate-400">P&M Head / AGM / GM Fleet Performance Brief</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('monthly-report')}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-slate-700 transition-colors"
          >
            Generate Monthly Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800/80 space-y-2">
            <h4 className="font-bold text-amber-400 uppercase text-[11px] tracking-wider">
              1. Fleet Availability & Production Impact
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Mechanical availability stands at <strong className="text-white">85.2%</strong> vs 90% benchmark.
              Primary bottleneck is hydraulic valve contamination on Class-A excavators operating with hydraulic rock breakers on NHAI PKG-5.
            </p>
          </div>

          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800/80 space-y-2">
            <h4 className="font-bold text-cyan-400 uppercase text-[11px] tracking-wider">
              2. Cost Control & Spares Position
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Average equipment operating cost is <strong className="text-white">₹1,472/hr</strong>. Critical spare inventory
              shows 2 vital stock-outs (Duo-Cone seal for CAT D6R and Bauer thermal bypass valve). Reorder approvals pending with Central Procurement.
            </p>
          </div>

          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800/80 space-y-2">
            <h4 className="font-bold text-emerald-400 uppercase text-[11px] tracking-wider">
              3. Owned vs. Hired Recommendation
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Hired excavator (EX-04) operated at 210 hrs/month, exceeding the 165 hr break-even threshold. Transitioning to owned equipment on Package-4 will yield an estimated saving of <strong className="text-emerald-400">₹48,000/month</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
