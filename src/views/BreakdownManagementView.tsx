import React, { useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Wrench,
  Boxes,
  DollarSign,
  User,
  MapPin,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';
import { BreakdownRecord, BreakdownStage, Equipment } from '../types';

interface BreakdownManagementViewProps {
  breakdowns: BreakdownRecord[];
  equipmentList: Equipment[];
  onAdvanceStage: (breakdownId: string, nextStage: BreakdownStage) => void;
  onAddBreakdown: (newBd: BreakdownRecord) => void;
  onOpenDiagnosticWithComplaint: (complaint: string, eqId: string) => void;
}

export const BreakdownManagementView: React.FC<BreakdownManagementViewProps> = ({
  breakdowns,
  equipmentList,
  onAdvanceStage,
  onAddBreakdown,
  onOpenDiagnosticWithComplaint,
}) => {
  const [selectedBreakdown, setSelectedBreakdown] = useState<BreakdownRecord | null>(breakdowns[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Workflow Stages in Order (Section 7)
  const STAGES: BreakdownStage[] = [
    'Reported',
    'Technical Diagnosis',
    'Technician Assignment',
    'Inspection',
    'Root Cause',
    'Spare Requirement',
    'Repair in Progress',
    'Testing',
    'Equipment Release',
    'Closed',
  ];

  // Calculate MTTR across resolved/closed breakdowns
  const closedBreakdowns = breakdowns.filter((b) => b.totalDowntimeHours > 0);
  const totalDowntime = closedBreakdowns.reduce((acc, curr) => acc + curr.totalDowntimeHours, 0);
  const mttr = closedBreakdowns.length > 0 ? (totalDowntime / closedBreakdowns.length).toFixed(1) : '0';

  const openCount = breakdowns.filter((b) => b.finalStatus === 'Open').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-red-500/20 px-2 py-0.5 text-[11px] font-black uppercase text-red-400 border border-red-500/30">
              Module 07 • Breakdown Control
            </span>
            <span className="text-xs text-slate-400">10-Stage Lifecycle Workflow</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Breakdown Management & MTTR</h1>
          <p className="text-xs text-slate-400">
            Downtime tracking, technician dispatch, root cause linkage, spare parts requisition, and testing clearance
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-500 transition-colors shadow-md shadow-red-600/20"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Report New Breakdown</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-red-900/60 bg-red-950/20 p-4">
          <span className="text-xs text-red-400 font-semibold block">Active Breakdowns</span>
          <span className="text-2xl font-black font-mono text-red-400 mt-1 block">{openCount}</span>
          <span className="text-[10px] text-red-400/80">Immediate workshop queue</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-xs text-slate-400 font-semibold block">Mean Time to Repair (MTTR)</span>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-white">{mttr}</span>
            <span className="text-xs font-semibold text-amber-400">Hours</span>
          </div>
          <span className="text-[10px] text-slate-500">Target benchmark &lt; 3.0 hrs</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-xs text-slate-400 font-semibold block">Total Downtime (Recorded)</span>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-white">{totalDowntime.toFixed(1)}</span>
            <span className="text-xs font-semibold text-slate-400">Hours</span>
          </div>
          <span className="text-[10px] text-slate-500">Across 10 logged incidents</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-xs text-slate-400 font-semibold block">Total Repair Spares Cost</span>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-white">
              ₹{breakdowns.reduce((acc, c) => acc + c.cost, 0).toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[10px] text-slate-500">Spares & hydraulic seals</span>
        </div>
      </div>

      {/* Main Grid: Left = List, Right = Detailed 10-Stage Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Breakdown List (5 Cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          {breakdowns.map((bd) => (
            <div
              key={bd.id}
              onClick={() => setSelectedBreakdown(bd)}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${
                selectedBreakdown?.id === bd.id
                  ? 'border-red-500 bg-slate-900 shadow-lg ring-1 ring-red-500/50'
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs text-red-400">{bd.id}</span>
                  <span className="text-xs font-bold text-white">{bd.equipmentId}</span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-semibold text-slate-300">
                    {bd.failureMode}
                  </span>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                    bd.finalStatus === 'Open'
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {bd.stage}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {bd.complaint}
              </p>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                <span>{bd.dateTime}</span>
                <span className="font-semibold text-amber-400">{bd.totalDowntimeHours} hrs downtime</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: 10-Stage Visualizer & Details (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedBreakdown ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-base font-bold text-red-400">
                      {selectedBreakdown.id}
                    </span>
                    <span className="text-xs text-white font-semibold">
                      {selectedBreakdown.equipmentId} – {selectedBreakdown.equipmentModel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
                    <MapPin className="h-3 w-3 text-slate-500" />
                    <span>{selectedBreakdown.site} ({selectedBreakdown.location})</span>
                  </p>
                </div>
                <button
                  onClick={() =>
                    onOpenDiagnosticWithComplaint(
                      selectedBreakdown.complaint,
                      selectedBreakdown.equipmentId
                    )
                  }
                  className="flex items-center space-x-1.5 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Diagnostic</span>
                </button>
              </div>

              {/* 10-STAGE WORKFLOW STEPPER (Section 7) */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  10-Stage Breakdown Lifecycle Progress
                </span>
                <div className="overflow-x-auto pb-2">
                  <div className="flex items-center space-x-1.5 min-w-[650px]">
                    {STAGES.map((stg, idx) => {
                      const currentStageIdx = STAGES.indexOf(selectedBreakdown.stage);
                      const isPassed = currentStageIdx >= idx;
                      const isCurrent = selectedBreakdown.stage === stg;

                      return (
                        <div key={stg} className="flex-1 flex flex-col items-center">
                          <button
                            onClick={() => onAdvanceStage(selectedBreakdown.id, stg)}
                            className={`flex h-7 w-full items-center justify-center rounded text-[10px] font-bold transition-all ${
                              isCurrent
                                ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                                : isPassed
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-slate-950 text-slate-500 border border-slate-800 hover:text-slate-300'
                            }`}
                            title={`Click to set stage to ${stg}`}
                          >
                            <span className="truncate px-1">{stg}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Breakdown Details Cards */}
              <div className="space-y-3 text-xs">
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Operator Complaint
                  </span>
                  <p className="text-white leading-relaxed">{selectedBreakdown.complaint}</p>
                </div>

                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Root Cause Diagnosis
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {selectedBreakdown.rootCause || 'Root cause investigation in progress.'}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    Action Taken & Repair
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {selectedBreakdown.actionTaken || 'Technician inspecting components at workshop.'}
                  </p>
                </div>

                {/* Spares Used Table */}
                {selectedBreakdown.sparesUsed.length > 0 && (
                  <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
                      <Boxes className="h-3.5 w-3.5 mr-1 text-amber-400" />
                      Spare Parts Consumed
                    </span>
                    <div className="space-y-1 font-mono text-xs">
                      {selectedBreakdown.sparesUsed.map((sp, idx) => (
                        <div key={idx} className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                          <span className="text-slate-200">{sp.partName} ({sp.partNumber})</span>
                          <span className="text-amber-400 font-bold">Qty: {sp.qty} • ₹{sp.cost.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meta Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div className="rounded bg-slate-950 p-2.5 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Technician</span>
                    <span className="text-white font-semibold truncate block">{selectedBreakdown.technician}</span>
                  </div>
                  <div className="rounded bg-slate-950 p-2.5 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Supervisor</span>
                    <span className="text-white font-semibold truncate block">{selectedBreakdown.supervisor}</span>
                  </div>
                  <div className="rounded bg-slate-950 p-2.5 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Downtime</span>
                    <span className="font-mono text-amber-400 font-bold">{selectedBreakdown.totalDowntimeHours} hrs</span>
                  </div>
                  <div className="rounded bg-slate-950 p-2.5 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Total Cost</span>
                    <span className="font-mono text-emerald-400 font-bold">₹{selectedBreakdown.cost.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Advance Action */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                <span className="text-xs text-slate-400">
                  Current Status: <strong className="text-white">{selectedBreakdown.finalStatus}</strong>
                </span>

                <div className="flex items-center space-x-2">
                  {selectedBreakdown.stage !== 'Closed' && (
                    <button
                      onClick={() => {
                        const currentIdx = STAGES.indexOf(selectedBreakdown.stage);
                        if (currentIdx < STAGES.length - 1) {
                          onAdvanceStage(selectedBreakdown.id, STAGES[currentIdx + 1]);
                        }
                      }}
                      className="flex items-center space-x-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20"
                    >
                      <span>Advance to Next Stage</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500 text-xs">
              Select a breakdown incident to inspect workflow and repair history.
            </div>
          )}
        </div>
      </div>

      {/* Report New Breakdown Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Log New Machine Breakdown
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                const newBd: BreakdownRecord = {
                  id: `BD-2026-0${breakdowns.length + 82}`,
                  dateTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
                  equipmentId: form.eqId.value,
                  equipmentModel: form.model.value || 'Excavator',
                  site: 'Package-4 Km 142+200',
                  location: form.loc.value || 'Main Site',
                  complaint: form.complaint.value,
                  failureMode: form.mode.value,
                  stage: 'Reported',
                  downtimeStart: new Date().toISOString().replace('T', ' ').slice(0, 16),
                  totalDowntimeHours: 0.5,
                  sparesUsed: [],
                  technician: form.tech.value || 'Er. Amit Verma',
                  supervisor: 'Sunil Sharma',
                  cost: 0,
                  finalStatus: 'Open',
                };
                onAddBreakdown(newBd);
                setShowAddModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Equipment ID *</label>
                  <select name="eqId" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white">
                    {equipmentList.map((eq) => (
                      <option key={eq.equipmentId} value={eq.equipmentId}>
                        {eq.equipmentId} – {eq.model}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Failure Mode *</label>
                  <select name="mode" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white">
                    <option value="Hydraulic">Hydraulic</option>
                    <option value="Engine">Engine</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Transmission">Transmission</option>
                    <option value="Structural">Structural</option>
                    <option value="Pneumatic">Pneumatic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Operator Complaint *</label>
                <textarea
                  name="complaint"
                  required
                  rows={2}
                  placeholder="Describe failure symptoms, noises, leaks, stall behavior..."
                  className="w-full rounded bg-slate-950 border border-slate-700 p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Specific Location</label>
                  <input name="loc" placeholder="e.g. Km 144+200 Cutting" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Assigned Technician</label>
                  <input name="tech" placeholder="Technician Name" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500"
                >
                  Create Breakdown Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
