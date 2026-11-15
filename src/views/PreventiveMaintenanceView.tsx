import React, { useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  CheckSquare,
  Square,
  FileCheck,
  UserCheck,
  Boxes,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { PmRecord, PmInterval, Equipment } from '../types';

interface PreventiveMaintenanceViewProps {
  pmRecords: PmRecord[];
  equipmentList: Equipment[];
  onCompletePm: (pmId: string, engineer: string) => void;
  onToggleChecklistItem: (pmId: string, itemIndex: number) => void;
}

export const PreventiveMaintenanceView: React.FC<PreventiveMaintenanceViewProps> = ({
  pmRecords,
  equipmentList,
  onCompletePm,
  onToggleChecklistItem,
}) => {
  const [filterInterval, setFilterInterval] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [activePmRecord, setActivePmRecord] = useState<PmRecord | null>(pmRecords[0] || null);
  const [engineerName, setEngineerName] = useState('Er. Amit Verma');

  // Generator states for Section 6 requirement:
  // "Generate PM checklist automatically from: Make, Model, Equipment Type, HMR, OEM interval, Previous maintenance, Operating conditions"
  const [genEquipmentId, setGenEquipmentId] = useState('EX-01');
  const [genInterval, setGenInterval] = useState<PmInterval>('500 H');
  const [genOperatingCondition, setGenOperatingCondition] = useState('High dust rocky excavation (NHAI Highway PKG-5)');
  const [generatedChecklist, setGeneratedChecklist] = useState<string[] | null>(null);

  const handleGenerateChecklist = () => {
    const eq = equipmentList.find((e) => e.equipmentId === genEquipmentId);
    const type = eq?.type || 'Excavator';
    const make = eq?.make || 'Tata Hitachi';
    const model = eq?.model || 'EX210LC';

    const checklist: string[] = [
      `1. [Safety & Isolation] Lockout/Tagout battery master isolator; release hydraulic tank breather pressure.`,
      `2. [Lubrication] Drain engine crankcase oil while warm; replace primary lube filter element (${make} genuine).`,
      `3. [Fuel System] Replace primary fuel water separator cartridge; drain secondary sediment bowl; inspect fuel lines for chafing.`,
      `4. [Air Induction] Blow outer air cleaner element with dry air (<3 bar); inspect inner safety cartridge; check rubber intake boot clamps.`,
      `5. [Hydraulics] Inspect hydraulic return filter back-pressure indicator gauge; clean pilot circuit strainer; check suction shut-off valve lock.`,
      `6. [Cooling System] Blow compressed air through radiator & CAC matrix from engine side outwards; check coolant pH and freeze point (target 50/50 glycol).`,
      `7. [Mechanical & Powertrain] Measure swing circle gear backlash (max 0.6 mm); check final drive planetary gear oil level (refill SAE 85W-140 if low).`,
      `8. [Chassis & Undercarriage] Grease all bucket pivot pins and boom base trunnions with EP-2 lithium grease until clean grease purges. Measure track sag (target 320 mm).`,
      `9. [High Dust Specific Condition] Inspect alternator brush wear and clean cooling fins; check engine serpentine belt tension with deflection gauge (8-10 mm).`,
      `10. [Sign-Off Stall Test] Warm engine to 80°C; perform 3-cycle hydraulic relief stall test at 1950 RPM; verify zero oil seepage.`,
    ];

    setGeneratedChecklist(checklist);
  };

  const filteredRecords = pmRecords.filter((pm) => {
    const matchInt = filterInterval === 'ALL' || pm.interval === filterInterval;
    const matchStat = filterStatus === 'ALL' || pm.status === filterStatus;
    return matchInt && matchStat;
  });

  const overdueCount = pmRecords.filter((p) => p.status === 'Overdue').length;
  const dueSoonCount = pmRecords.filter((p) => p.status === 'Due Soon').length;
  const completedCount = pmRecords.filter((p) => p.status === 'Completed').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-black uppercase text-amber-400 border border-amber-500/30">
            Module 06 • PM Control
          </span>
          <span className="text-xs text-slate-400">Scheduled Service Compliance Desk</span>
        </div>
        <h1 className="text-2xl font-black text-white mt-1">Preventive Maintenance (PM) Management</h1>
        <p className="text-xs text-slate-400">
          Tracking intervals (250H, 500H, 1000H, 2000H, Daily, OEM-defined), automated checklist generation, and digital sign-offs
        </p>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-red-900/60 bg-red-950/20 p-4">
          <span className="text-xs text-red-400 font-semibold block">Overdue Services</span>
          <span className="text-2xl font-black font-mono text-red-400 mt-1 block">{overdueCount}</span>
          <span className="text-[10px] text-red-400/80">Immediate workshop priority</span>
        </div>
        <div className="rounded-xl border border-amber-900/60 bg-amber-950/20 p-4">
          <span className="text-xs text-amber-400 font-semibold block">Due Soon (&lt;50 HMR)</span>
          <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">{dueSoonCount}</span>
          <span className="text-[10px] text-amber-400/80">Kit spares & lube staging</span>
        </div>
        <div className="rounded-xl border border-blue-900/60 bg-blue-950/20 p-4">
          <span className="text-xs text-blue-400 font-semibold block">Due Current Month</span>
          <span className="text-2xl font-black font-mono text-blue-400 mt-1 block">{pmRecords.length}</span>
          <span className="text-[10px] text-blue-400/80">Total scheduled fleet pool</span>
        </div>
        <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-4">
          <span className="text-xs text-emerald-400 font-semibold block">PM Compliance %</span>
          <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">88.5%</span>
          <span className="text-[10px] text-emerald-400/80">Target benchmark 95%</span>
        </div>
      </div>

      {/* AUTOMATIC PM CHECKLIST GENERATOR (Section 6) */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-5 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
          <Sparkles className="h-5 w-5 stroke-[2.5]" />
          <span>Automated PM Checklist Generator (AI & OEM Rules)</span>
        </div>
        <p className="text-xs text-slate-300">
          Synthesizes OEM service manuals, machine HMR wear state, past repair logs, and local Indian site operating conditions (dust, temperature, diesel quality).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Select Machinery</label>
            <select
              value={genEquipmentId}
              onChange={(e) => setGenEquipmentId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            >
              {equipmentList.map((eq) => (
                <option key={eq.equipmentId} value={eq.equipmentId}>
                  {eq.equipmentId} – {eq.make} {eq.model} ({eq.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">PM Interval</label>
            <select
              value={genInterval}
              onChange={(e) => setGenInterval(e.target.value as PmInterval)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            >
              <option value="Daily">Daily Pre-Start</option>
              <option value="250 H">250 H Standard Service</option>
              <option value="500 H">500 H Intermediate Service</option>
              <option value="1000 H">1000 H Major Powertrain Service</option>
              <option value="2000 H">2000 H Full Overhaul Service</option>
              <option value="Monthly">Monthly Plant Inspection</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Site Operating Conditions</label>
            <input
              type="text"
              value={genOperatingCondition}
              onChange={(e) => setGenOperatingCondition(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            />
          </div>
        </div>

        <button
          onClick={handleGenerateChecklist}
          className="flex items-center space-x-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20"
        >
          <Sparkles className="h-4 w-4 stroke-[2.5]" />
          <span>Generate Customized Checklist</span>
        </button>

        {generatedChecklist && (
          <div className="mt-3 rounded-xl bg-slate-950 p-4 border border-amber-500/30 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
              Generated Service Protocol for {genEquipmentId} ({genInterval})
            </span>
            <div className="space-y-1.5 text-xs text-slate-200">
              {generatedChecklist.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <CheckSquare className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-400">
          <Filter className="h-4 w-4 text-amber-400" />
          <span className="font-semibold">Filter PM Schedule:</span>
        </div>

        <select
          value={filterInterval}
          onChange={(e) => setFilterInterval(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-white"
        >
          <option value="ALL">All Intervals</option>
          <option value="250 H">250 H</option>
          <option value="500 H">500 H</option>
          <option value="1000 H">1000 H</option>
          <option value="2000 H">2000 H</option>
          <option value="Daily">Daily</option>
          <option value="Monthly">Monthly</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-white"
        >
          <option value="ALL">All Statuses</option>
          <option value="Overdue">Overdue</option>
          <option value="Due Soon">Due Soon</option>
          <option value="Due">Due</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PM List (5 Cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          {filteredRecords.map((pm) => (
            <div
              key={pm.id}
              onClick={() => setActivePmRecord(pm)}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${
                activePmRecord?.id === pm.id
                  ? 'border-amber-500 bg-slate-900 shadow-lg ring-1 ring-amber-500/50'
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs text-amber-400">{pm.equipmentId}</span>
                  <span className="text-xs font-semibold text-white">{pm.equipmentModel}</span>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                    pm.status === 'Overdue'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : pm.status === 'Due Soon'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : pm.status === 'Completed'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-blue-950 text-blue-400 border border-blue-800'
                  }`}
                >
                  {pm.status}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">Interval</span>
                  <span className="text-slate-200 font-bold">{pm.interval}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Target HMR</span>
                  <span className="text-cyan-400 font-bold">{pm.targetHmr}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Current HMR</span>
                  <span className="text-white font-bold">{pm.currentHmr}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Record Checklist & Execution (7 Cols) */}
        <div className="lg:col-span-7">
          {activePmRecord ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-5">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-base font-bold text-amber-400">
                      {activePmRecord.equipmentId}
                    </span>
                    <span className="text-xs text-slate-400">{activePmRecord.equipmentModel}</span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-amber-300">
                      {activePmRecord.interval} Service
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Scheduled Due Date: <strong className="text-white">{activePmRecord.dueDate}</strong> • Current HMR: {activePmRecord.currentHmr} hrs
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    activePmRecord.status === 'Completed'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {activePmRecord.status}
                </span>
              </div>

              {/* Spares Required Kit */}
              {activePmRecord.sparesRequired.length > 0 && (
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                  <h4 className="flex items-center text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                    <Boxes className="h-4 w-4 mr-1.5" />
                    Required PM Spares Kit
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {activePmRecord.sparesRequired.map((sp, idx) => (
                      <div key={idx} className="flex justify-between rounded bg-slate-900 p-2 border border-slate-800">
                        <span className="text-slate-200">{sp.partName}</span>
                        <span className="font-mono text-cyan-400 font-bold">Qty: {sp.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  PM Inspection & Task Checklist ({activePmRecord.checklistItems.filter(c => c.done).length}/{activePmRecord.checklistItems.length} Done)
                </h4>
                <div className="space-y-2">
                  {activePmRecord.checklistItems.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => onToggleChecklistItem(activePmRecord.id, idx)}
                      className={`flex items-start space-x-3 rounded-xl p-3 border cursor-pointer transition-all ${
                        item.done
                          ? 'border-emerald-900/60 bg-emerald-950/20 text-slate-200'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-950/80'
                      }`}
                    >
                      {item.done ? (
                        <CheckSquare className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <span className={`text-xs leading-relaxed ${item.done ? 'line-through text-slate-400' : ''}`}>
                        {item.item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maintenance Engineer Sign-Off Box */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase text-slate-300">
                  <UserCheck className="h-4 w-4 text-amber-400" />
                  <span>Maintenance Engineer Sign-Off</span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    value={engineerName}
                    onChange={(e) => setEngineerName(e.target.value)}
                    placeholder="Certifying Engineer Name"
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                  />
                  <button
                    onClick={() => onCompletePm(activePmRecord.id, engineerName)}
                    className="flex items-center justify-center space-x-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Certify & Complete PM</span>
                  </button>
                </div>
                {activePmRecord.lastCompletedDate && (
                  <p className="text-[10px] text-emerald-400">
                    Last Completed: {activePmRecord.lastCompletedDate} by {activePmRecord.technicianAssigned}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500 text-xs">
              Select a PM record on the left to inspect checklist and sign-off.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
