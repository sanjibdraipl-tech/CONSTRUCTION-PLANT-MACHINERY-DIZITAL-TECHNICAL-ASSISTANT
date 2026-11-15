import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Layers,
  MapPin,
  CheckCircle2,
  FileText,
  Clock,
  Fuel,
} from 'lucide-react';
import { Equipment } from '../types';

interface DailyPlantReportViewProps {
  equipmentList: Equipment[];
}

export const DailyPlantReportView: React.FC<DailyPlantReportViewProps> = ({ equipmentList }) => {
  const [reportDate, setReportDate] = useState('2026-11-04');
  const [selectedProject, setSelectedProject] = useState('NHAI Delhi-Amritsar-Katra PKG-5');
  const [selectedSite, setSelectedSite] = useState('Package-4 Km 142+200');

  // Realistic DPR items built from fleet
  const dprRows = [
    {
      eqId: 'EX-01',
      model: 'Tata Hitachi EX210LC Super+',
      openingHmr: 4842,
      closingHmr: 4850,
      runningHours: 8.0,
      idleHours: 2.0,
      breakdownHours: 2.0,
      fuel: 160,
      production: '1,120 m³ Earth Cutting',
      availPct: 83.3,
      utilPct: 80.0,
      maint: 'Hydraulic relief sluggish at 15:00',
      remarks: 'Shift ended early for diagnostic',
    },
    {
      eqId: 'EX-02',
      model: 'Komatsu PC210-10M0',
      openingHmr: 3228.8,
      closingHmr: 3240.0,
      runningHours: 11.2,
      idleHours: 0.8,
      breakdownHours: 0.0,
      fuel: 192,
      production: '28 Metro Segments Handled',
      availPct: 100.0,
      utilPct: 93.3,
      maint: 'Normal pre-start check',
      remarks: 'Double shift casting yard',
    },
    {
      eqId: 'DZ-01',
      model: 'CAT D6R2 XL Dozer',
      openingHmr: 8889.5,
      closingHmr: 8900.0,
      runningHours: 10.5,
      idleHours: 1.5,
      breakdownHours: 0.0,
      fuel: 265,
      production: '4,200 m² Embankment Spread',
      availPct: 100.0,
      utilPct: 87.5,
      maint: 'Track tension greasing done',
      remarks: 'Subgrade layer 4 passed',
    },
    {
      eqId: 'MG-01',
      model: 'CAT 140K Motor Grader',
      openingHmr: 3941.5,
      closingHmr: 3950.0,
      runningHours: 8.5,
      idleHours: 1.5,
      breakdownHours: 0.0,
      fuel: 136,
      production: '1.4 km Subgrade Final Leveling',
      availPct: 100.0,
      utilPct: 85.0,
      maint: 'Circle drive shims adjusted',
      remarks: 'Tolerances within ±6 mm',
    },
    {
      eqId: 'BP-02',
      model: 'Schwing Stetter CP45',
      openingHmr: 4910.0,
      closingHmr: 4920.0,
      runningHours: 10.0,
      idleHours: 1.5,
      breakdownHours: 0.5,
      fuel: 0, // Electric
      production: '382 m³ M45 Pier Concrete',
      availPct: 95.8,
      utilPct: 86.9,
      maint: 'Pan wash & discharge seal grease',
      remarks: 'Dispatched to 14 TMs',
    },
    {
      eqId: 'HMP-01',
      model: 'Apollo ANP 160 TPH',
      openingHmr: 7416.5,
      closingHmr: 7420.0,
      runningHours: 3.5,
      idleHours: 1.5,
      breakdownHours: 7.0,
      fuel: 1580,
      production: '480 Tons DBM Asphalt',
      availPct: 41.7,
      utilPct: 70.0,
      maint: 'Burner flame UV sensor trip',
      remarks: 'Under repair by electrician',
    },
    {
      eqId: 'PR-01',
      model: 'Bauer BG 28 H Piling Rig',
      openingHmr: 4309.0,
      closingHmr: 4320.0,
      runningHours: 11.0,
      idleHours: 1.0,
      breakdownHours: 0.0,
      fuel: 440,
      production: '18m Hard Rock Socketing (Pier 14)',
      availPct: 100.0,
      utilPct: 91.7,
      maint: 'Kelly drive keys greased',
      remarks: 'Bentonite slurry circulation OK',
    },
    {
      eqId: 'RL-01',
      model: 'Hamm 311D Soil Compactor',
      openingHmr: 3611.5,
      closingHmr: 3620.0,
      runningHours: 8.5,
      idleHours: 2.0,
      breakdownHours: 0.0,
      fuel: 95,
      production: '14 Passes on Km 144 Bed',
      availPct: 100.0,
      utilPct: 81.0,
      maint: 'Water spray nozzles cleaned',
      remarks: 'Core cutter test passed (98.2%)',
    },
  ];

  const totalRunning = dprRows.reduce((acc, c) => acc + c.runningHours, 0);
  const totalIdle = dprRows.reduce((acc, c) => acc + c.idleHours, 0);
  const totalBD = dprRows.reduce((acc, c) => acc + c.breakdownHours, 0);
  const totalFuel = dprRows.reduce((acc, c) => acc + c.fuel, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    alert('Exporting Daily Plant Report (DPR) to XLSX format with formulas and HMR differences.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Actions */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-black uppercase text-amber-400 border border-amber-500/30">
              Module 15 • Daily Plant Report
            </span>
            <span className="text-xs text-slate-400">Site DPR Generation Desk</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Daily Plant Report (DPR)</h1>
          <p className="text-xs text-slate-400">
            Official operational log of Opening/Closing HMR, productive hours, idle turnaround, breakdown delays, fuel & production
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20"
          >
            <Printer className="h-4 w-4 stroke-[2.5]" />
            <span>Print DPR</span>
          </button>
        </div>
      </div>

      {/* Date & Project Selectors (No-print) */}
      <div className="no-print flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-amber-400" />
          <span className="text-slate-400 font-semibold">Report Date:</span>
          <input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="rounded bg-slate-950 border border-slate-700 px-2 py-1 text-white font-mono"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Layers className="h-4 w-4 text-cyan-400" />
          <span className="text-slate-400 font-semibold">Project:</span>
          <span className="font-semibold text-white">{selectedProject}</span>
        </div>

        <div className="flex items-center space-x-2 ml-auto">
          <MapPin className="h-4 w-4 text-emerald-400" />
          <span className="text-slate-400 font-semibold">Package:</span>
          <span className="font-semibold text-white">{selectedSite}</span>
        </div>
      </div>

      {/* DPR PRINTABLE DOCUMENT CONTAINER */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6">
        {/* Formal Header */}
        <div className="border-b-2 border-slate-700 pb-4 flex justify-between items-start">
          <div>
            <div className="text-xl font-black tracking-wider text-white">
              PLANT<span className="text-amber-400">MITRA</span> P&M CONTROL TOWER
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-0.5">
              Daily Plant & Machinery Performance Report (DPR)
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Project: <strong className="text-slate-200">{selectedProject}</strong> | Site:{' '}
              <strong className="text-slate-200">{selectedSite}</strong>
            </div>
          </div>
          <div className="text-right text-xs">
            <span className="text-slate-500 text-[10px] block font-mono">DPR REF: DPR-2026-1104-001</span>
            <span className="text-slate-400 font-mono font-bold block">Date: {reportDate}</span>
            <span className="rounded bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 text-[10px] font-bold mt-1 inline-block">
              Shift Verified
            </span>
          </div>
        </div>

        {/* Shift Summary Cards */}
        <div className="grid grid-cols-4 gap-3 text-xs font-mono">
          <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Total Running Hours</span>
            <span className="text-xl font-black text-emerald-400">{totalRunning.toFixed(1)} hrs</span>
          </div>
          <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Total Idle Hours</span>
            <span className="text-xl font-black text-amber-400">{totalIdle.toFixed(1)} hrs</span>
          </div>
          <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Total Breakdown Downtime</span>
            <span className="text-xl font-black text-red-400">{totalBD.toFixed(1)} hrs</span>
          </div>
          <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Diesel Issued (Site)</span>
            <span className="text-xl font-black text-cyan-400">{totalFuel.toLocaleString('en-IN')} L</span>
          </div>
        </div>

        {/* Detailed DPR Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                <th className="p-2.5 border-r border-slate-800">Equip ID</th>
                <th className="p-2.5 border-r border-slate-800">Equipment Model</th>
                <th className="p-2.5 border-r border-slate-800">Opening HMR</th>
                <th className="p-2.5 border-r border-slate-800">Closing HMR</th>
                <th className="p-2.5 border-r border-slate-800">Run (Hrs)</th>
                <th className="p-2.5 border-r border-slate-800">Idle (Hrs)</th>
                <th className="p-2.5 border-r border-slate-800">BD (Hrs)</th>
                <th className="p-2.5 border-r border-slate-800">Fuel (L)</th>
                <th className="p-2.5 border-r border-slate-800">Production Output</th>
                <th className="p-2.5 border-r border-slate-800">Avail %</th>
                <th className="p-2.5 border-r border-slate-800">Util %</th>
                <th className="p-2.5">Maintenance & Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px] text-slate-200">
              {dprRows.map((row) => (
                <tr key={row.eqId} className="hover:bg-slate-950/40">
                  <td className="p-2.5 border-r border-slate-800 font-bold text-amber-400">{row.eqId}</td>
                  <td className="p-2.5 border-r border-slate-800 font-sans font-medium text-white">{row.model}</td>
                  <td className="p-2.5 border-r border-slate-800">{row.openingHmr}</td>
                  <td className="p-2.5 border-r border-slate-800 font-bold text-white">{row.closingHmr}</td>
                  <td className="p-2.5 border-r border-slate-800 font-bold text-emerald-400">{row.runningHours}</td>
                  <td className="p-2.5 border-r border-slate-800 text-amber-300">{row.idleHours}</td>
                  <td className="p-2.5 border-r border-slate-800 text-red-400 font-bold">{row.breakdownHours}</td>
                  <td className="p-2.5 border-r border-slate-800 text-cyan-400">{row.fuel}</td>
                  <td className="p-2.5 border-r border-slate-800 font-sans text-xs text-slate-300 font-medium">
                    {row.production}
                  </td>
                  <td className="p-2.5 border-r border-slate-800">{row.availPct}%</td>
                  <td className="p-2.5 border-r border-slate-800">{row.utilPct}%</td>
                  <td className="p-2.5 font-sans text-[11px] text-slate-400">
                    <span className="block text-slate-300">{row.maint}</span>
                    <span className="text-[10px] text-slate-500 italic">{row.remarks}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signatures & Certification Footer */}
        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-800 text-xs">
          <div className="space-y-4">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Shift P&M Supervisor</span>
            <div className="h-10 border-b border-dashed border-slate-700 flex items-end">
              <span className="text-slate-200 font-mono font-semibold">Sunil Sharma (JE P&M)</span>
            </div>
            <span className="text-[10px] text-slate-500">Sign & Date: 2026-11-04 18:30</span>
          </div>

          <div className="space-y-4">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Maintenance Engineer</span>
            <div className="h-10 border-b border-dashed border-slate-700 flex items-end">
              <span className="text-slate-200 font-mono font-semibold">Er. Amit Verma (B.Tech Mech)</span>
            </div>
            <span className="text-[10px] text-slate-500">Sign & Date: 2026-11-04 19:15</span>
          </div>

          <div className="space-y-4">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Project Manager / P&M Head</span>
            <div className="h-10 border-b border-dashed border-slate-700 flex items-end">
              <span className="text-slate-200 font-mono font-semibold">Er. S. K. Choudhury (GM Infra)</span>
            </div>
            <span className="text-[10px] text-slate-500">Certified for MIS Entry</span>
          </div>
        </div>
      </div>
    </div>
  );
};
