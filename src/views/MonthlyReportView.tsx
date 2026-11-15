import React from 'react';
import {
  FileText,
  Printer,
  Download,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  BarChart3,
  Scale,
  Calendar,
} from 'lucide-react';
import { Equipment } from '../types';

interface MonthlyReportViewProps {
  equipmentList: Equipment[];
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({ equipmentList }) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Title & Actions */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-black uppercase text-amber-400 border border-amber-500/30">
              Module 16 • Executive Review
            </span>
            <span className="text-xs text-slate-400">Board & AGM P&M Reporting</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Monthly P&M Performance Review</h1>
          <p className="text-xs text-slate-400">
            Comprehensive fleet analytics, availability, fuel variances, MTBF, MTTR, owned vs hired savings, and next month action plan
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20"
          >
            <Printer className="h-4 w-4 stroke-[2.5]" />
            <span>Print Executive Report</span>
          </button>
        </div>
      </div>

      {/* DOCUMENT CONTAINER */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-2xl space-y-6">
        {/* Formal Header */}
        <div className="border-b-2 border-slate-700 pb-4 flex justify-between items-start">
          <div>
            <div className="text-2xl font-black tracking-wider text-white">
              PLANT<span className="text-amber-400">MITRA</span>
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mt-0.5">
              Monthly Plant & Machinery Technical & Commercial Performance Review
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Review Period: <strong className="text-white">October 2026</strong> | Fleet Size:{' '}
              <strong className="text-white">20 Units</strong> across 5 Projects
            </div>
          </div>
          <div className="text-right text-xs">
            <span className="text-slate-500 block font-mono text-[10px]">DOC REF: PM-MIS-2026-10</span>
            <span className="text-slate-300 font-semibold block">Date: 2026-11-04</span>
            <span className="rounded bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 text-[10px] font-bold mt-1 inline-block">
              Head Office P&M Copy
            </span>
          </div>
        </div>

        {/* 1. EXECUTIVE MANAGEMENT SUMMARY (Section 16: simple business language) */}
        <div className="rounded-xl bg-slate-950 p-5 border border-slate-800 space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-amber-400 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            1. Executive Management Summary
          </h2>
          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <p>
              During the month of October 2026, the overall Plant & Machinery fleet operated at an average mechanical availability of{' '}
              <strong className="text-white font-bold">85.2%</strong> (target: 90.0%) and a productive fleet utilization of{' '}
              <strong className="text-white font-bold">74.8%</strong>.
              Total fleet operating expenditure stood at <strong className="text-white">₹1.48 Crore</strong> against an internal billing turnover of <strong className="text-emerald-400 font-bold">₹2.12 Crore</strong>, yielding a healthy fleet contribution margin of 30.2%.
            </p>
            <p>
              The primary loss of availability stemmed from hydraulic contamination on Class-A excavators operating hydraulic rock breakers on the NHAI Katra project, as well as an electrical burner flame trip on the 160 TPH Hot Mix Plant.
              Preventive maintenance compliance recorded <strong className="text-amber-400 font-bold">88.5%</strong> with 3 overdue services currently staged in site workshops.
            </p>
          </div>
        </div>

        {/* 2. FLEET METRICS & AVAILABILITY TABLE */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-200">
            2. Fleet Operational & Maintenance KPIs
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Mechanical Availability</span>
              <span className="text-xl font-black text-amber-400">85.2%</span>
              <span className="text-[10px] text-slate-500 font-sans block mt-0.5">Benchmark: 90%</span>
            </div>
            <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Capacity Utilization</span>
              <span className="text-xl font-black text-cyan-400">74.8%</span>
              <span className="text-[10px] text-slate-500 font-sans block mt-0.5">Benchmark: 80%</span>
            </div>
            <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">MTBF (Reliability)</span>
              <span className="text-xl font-black text-white">42.5 hrs</span>
              <span className="text-[10px] text-slate-500 font-sans block mt-0.5">Target: &gt; 60 hrs</span>
            </div>
            <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">MTTR (Repair Time)</span>
              <span className="text-xl font-black text-emerald-400">3.8 hrs</span>
              <span className="text-[10px] text-slate-500 font-sans block mt-0.5">Target: &lt; 3.0 hrs</span>
            </div>
          </div>
        </div>

        {/* 3. FUEL & CONSUMPTION AUDIT */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-200">
            3. Fuel Consumption & Variance Audit
          </h2>
          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-slate-400">Total Diesel Consumed (Fleet):</span>
              <span className="font-mono font-bold text-white">98,000 Liters (₹90,16,000 @ ₹92/L)</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-slate-400">Average Fuel Cost / Operating Hour:</span>
              <span className="font-mono font-bold text-amber-400">₹1,472 / hr</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Fuel Exceptions Policy Action:</span>
              <span className="text-yellow-400 font-semibold font-sans">
                Abnormal fuel variance detected – investigation required on EX-01 & HMP-01.
              </span>
            </div>
          </div>
        </div>

        {/* 4. OWNED VS HIRED STRATEGIC ANALYSIS */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center">
            <Scale className="h-4 w-4 mr-1.5 text-cyan-400" />
            4. Owned versus Hired Commercial Analysis
          </h2>
          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
            <p>
              • <strong className="text-white">Excavator Fleet:</strong> Analysis reveals that the hired Volvo EC210 (EX-04) ran 210 operating hours in October. At the current dry lease rate of ₹2,35,000/month, the effective cost is ₹1,119/hr. The break-even threshold is 165 hours.
            </p>
            <p>
              • <strong className="text-emerald-400 font-semibold">Recommendation:</strong> Transition EX-04 to a company-owned 20T excavator on the upcoming NHAI Package-6 tender. Estimated financial saving is <strong className="text-white font-mono">₹48,000/month</strong> per machine.
            </p>
          </div>
        </div>

        {/* 5. MAJOR ROOT CAUSE ANALYSIS & CORRECTIVE ACTIONS */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-200">
            5. Major RCAs Executed in October
          </h2>
          <div className="space-y-2 text-xs">
            <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800">
              <div className="flex justify-between font-bold">
                <span className="text-white">RCA-2026-001: EX-01 Hydraulic Relief Loss (190 bar)</span>
                <span className="text-purple-400 font-mono">5-Why Method</span>
              </div>
              <p className="text-slate-400 mt-1">
                <strong className="text-slate-300">Root Cause:</strong> Clogged return filter in bypass allowed fine quartz dust from breaker operation into control valve seat.
              </p>
              <p className="text-emerald-400 mt-0.5">
                <strong className="text-slate-300">Action:</strong> Installed dedicated 10-micron offline filter cart loop on all breaker excavators.
              </p>
            </div>
          </div>
        </div>

        {/* 6. NEXT MONTH ACTION PLAN (November 2026) */}
        <div className="rounded-xl bg-slate-950 p-5 border border-amber-500/30 space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-amber-400">
            6. Priority Next Month Action Plan (November 2026)
          </h2>
          <ul className="text-xs text-slate-200 space-y-2">
            <li className="flex items-start space-x-2">
              <span className="text-amber-400 font-bold">1.</span>
              <span>Complete pending 500H PM services on CAT 320D3 (EX-03) and 500kVA DG Set (DG-01) by 8th Nov.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-amber-400 font-bold">2.</span>
              <span>Expedite import purchase order for Bauer rotary head thermal bypass valve and CAT Duo-cone seals.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-amber-400 font-bold">3.</span>
              <span>Deploy containerized diesel flow-meter calibration checks on all 3 site fuel bowsers to eliminate dispensing measurement drift.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-amber-400 font-bold">4.</span>
              <span>Perform pre-monsoon winter servicing and anti-freeze coolant checks across high-altitude railway tunneling fleet (Rishikesh).</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
