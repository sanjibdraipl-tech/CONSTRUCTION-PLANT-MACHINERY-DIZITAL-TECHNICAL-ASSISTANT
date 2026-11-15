import React, { useState } from 'react';
import {
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Calendar,
  User,
  ArrowRight,
  Layers,
  ChevronDown,
  X,
} from 'lucide-react';
import { RcaRecord } from '../types';

interface RcaViewProps {
  rcas: RcaRecord[];
  onAddRca: (newRca: RcaRecord) => void;
}

export const RcaView: React.FC<RcaViewProps> = ({ rcas, onAddRca }) => {
  const [selectedRca, setSelectedRca] = useState<RcaRecord | null>(rcas[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[11px] font-black uppercase text-purple-400 border border-purple-500/30">
              Module 08 • Reliability Engineering
            </span>
            <span className="text-xs text-slate-400">5-Why & Ishikawa Fishbone 6M</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Root Cause Analysis (RCA) Desk
          </h1>
          <p className="text-xs text-slate-400">
            Systematic investigation of chronic machine failures, contributing factors, corrective and preventive action (CAPA) tracking
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-500 transition-colors shadow-md shadow-purple-600/20"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>New RCA Dossier</span>
        </button>
      </div>

      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* RCA List (4 Cols) */}
        <div className="lg:col-span-4 space-y-2.5">
          {rcas.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelectedRca(r)}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${
                selectedRca?.id === r.id
                  ? 'border-purple-500 bg-slate-900 shadow-lg ring-1 ring-purple-500/50'
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs text-purple-400">{r.id}</span>
                  <span className="text-xs font-bold text-white">{r.equipmentId}</span>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                    r.closureStatus === 'Closed'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : r.closureStatus === 'Under Verification'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-red-950 text-red-300 border border-red-800'
                  }`}
                >
                  {r.closureStatus}
                </span>
              </div>

              <div className="mt-1 flex items-center space-x-2">
                <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[9px] font-medium text-slate-300">
                  {r.method}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{r.date}</span>
              </div>

              <p className="mt-2 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {r.problem}
              </p>
            </div>
          ))}
        </div>

        {/* RCA Investigation Dossier (8 Cols) */}
        <div className="lg:col-span-8">
          {selectedRca ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-base font-bold text-purple-400">
                      {selectedRca.id}
                    </span>
                    <span className="text-xs text-slate-400">
                      Linked Equipment: <strong className="text-white">{selectedRca.equipmentId}</strong>
                    </span>
                    {selectedRca.breakdownId && (
                      <span className="font-mono text-xs text-red-400">
                        [{selectedRca.breakdownId}]
                      </span>
                    )}
                  </div>
                  <h2 className="text-sm font-bold text-white mt-1">{selectedRca.problem}</h2>
                </div>
                <span className="rounded-full bg-purple-950 text-purple-300 border border-purple-800 px-3 py-1 text-xs font-bold">
                  {selectedRca.method}
                </span>
              </div>

              {/* Immediate vs Root Cause Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Immediate Physical Cause
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {selectedRca.immediateCause}
                  </p>
                </div>

                <div className="rounded-xl bg-purple-950/20 p-4 border border-purple-900/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                    Determined Root Cause
                  </span>
                  <p className="text-xs text-purple-100 leading-relaxed font-semibold">
                    {selectedRca.rootCause}
                  </p>
                </div>
              </div>

              {/* 5-WHY CHAIN VISUALIZATION */}
              {selectedRca.method === '5 Why' && selectedRca.fiveWhys && (
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center">
                    <GitBranch className="h-4 w-4 mr-1.5" />
                    5-Why Sequential Root Cause Chain
                  </span>
                  <div className="space-y-2">
                    {selectedRca.fiveWhys.map((why, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg p-3 text-xs border ${
                          idx === selectedRca.fiveWhys!.length - 1
                            ? 'bg-purple-950/30 border-purple-800 text-purple-200 font-semibold'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        {why}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FISHBONE 6M DIAGRAM VISUALIZATION */}
              {selectedRca.method.includes('Fishbone') && selectedRca.fishbone && (
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center">
                    <Layers className="h-4 w-4 mr-1.5" />
                    Ishikawa Fishbone Diagram (6M Analysis)
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                      <span className="text-[10px] font-bold text-amber-400 block mb-1">1. MAN (Human)</span>
                      <ul className="text-slate-300 space-y-1 text-[11px]">
                        {selectedRca.fishbone.human.map((h, i) => (
                          <li key={i}>• {h}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                      <span className="text-[10px] font-bold text-cyan-400 block mb-1">2. MACHINE</span>
                      <ul className="text-slate-300 space-y-1 text-[11px]">
                        {selectedRca.fishbone.machine.map((m, i) => (
                          <li key={i}>• {m}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                      <span className="text-[10px] font-bold text-purple-400 block mb-1">3. MATERIAL</span>
                      <ul className="text-slate-300 space-y-1 text-[11px]">
                        {selectedRca.fishbone.material.map((mat, i) => (
                          <li key={i}>• {mat}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                      <span className="text-[10px] font-bold text-emerald-400 block mb-1">4. METHOD</span>
                      <ul className="text-slate-300 space-y-1 text-[11px]">
                        {selectedRca.fishbone.method.map((meth, i) => (
                          <li key={i}>• {meth}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                      <span className="text-[10px] font-bold text-blue-400 block mb-1">5. ENVIRONMENT</span>
                      <ul className="text-slate-300 space-y-1 text-[11px]">
                        {selectedRca.fishbone.environment.map((env, i) => (
                          <li key={i}>• {env}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                      <span className="text-[10px] font-bold text-red-400 block mb-1">6. MAINTENANCE</span>
                      <ul className="text-slate-300 space-y-1 text-[11px]">
                        {selectedRca.fishbone.maintenance.map((maint, i) => (
                          <li key={i}>• {maint}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* CAPA: Corrective Action & Preventive Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-950 p-4 border border-emerald-900/40 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Corrective Action (Immediate Fix)
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedRca.correctiveAction}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-4 border border-blue-900/40 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    Preventive Action (Systemic Prevention)
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedRca.preventiveAction}
                  </p>
                </div>
              </div>

              {/* Governance & Closure */}
              <div className="flex flex-wrap items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
                <div className="flex items-center space-x-4">
                  <span>
                    Owner: <strong className="text-white">{selectedRca.responsiblePerson}</strong>
                  </span>
                  <span>
                    Target Date: <strong className="text-amber-400 font-mono">{selectedRca.targetDate}</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px]">Status:</span>
                  <span className="rounded font-bold px-2 py-0.5 bg-slate-800 text-white font-mono">
                    {selectedRca.closureStatus}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500 text-xs">
              Select an RCA record on the left to inspect 5-Why or Fishbone diagrams.
            </div>
          )}
        </div>
      </div>

      {/* New RCA Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Initiate Root Cause Analysis Dossier
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                const newRca: RcaRecord = {
                  id: `RCA-2026-00${rcas.length + 1}`,
                  equipmentId: form.eqId.value,
                  date: new Date().toISOString().slice(0, 10),
                  problem: form.problem.value,
                  immediateCause: form.imm.value,
                  rootCause: form.root.value,
                  contributingCause: form.contrib.value || 'Site operating stress',
                  method: form.method.value,
                  correctiveAction: form.ca.value,
                  preventiveAction: form.pa.value,
                  responsiblePerson: form.resp.value || 'Er. Amit Verma',
                  targetDate: form.date.value || '2026-11-30',
                  closureStatus: 'Open',
                };
                onAddRca(newRca);
                setShowAddModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Equipment ID *</label>
                  <input name="eqId" defaultValue="EX-01" required className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Methodology *</label>
                  <select name="method" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white">
                    <option value="5 Why">5 Why Analysis</option>
                    <option value="Fishbone (6M)">Fishbone (Ishikawa 6M)</option>
                    <option value="Failure Mode">Failure Mode Analysis</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Problem Statement *</label>
                <textarea name="problem" required rows={2} placeholder="Define failure..." className="w-full rounded bg-slate-950 border border-slate-700 p-2 text-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Immediate Cause</label>
                  <input name="imm" required placeholder="Direct physical cause" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Root Cause</label>
                  <input name="root" required placeholder="Underlying systemic cause" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Corrective Action (CA)</label>
                  <input name="ca" required placeholder="Action to restore equipment" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Preventive Action (PA)</label>
                  <input name="pa" required placeholder="SOP / filter / training" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Responsible Person</label>
                  <input name="resp" defaultValue="Er. Amit Verma" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Target Closure Date</label>
                  <input name="date" type="date" defaultValue="2026-11-30" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="rounded bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="rounded bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500">
                  Register RCA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
