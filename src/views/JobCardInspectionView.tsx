import React, { useState } from 'react';
import {
  ClipboardList,
  CheckSquare,
  Square,
  UserCheck,
  Wrench,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { JobCard, DailyInspection, Equipment } from '../types';

interface JobCardInspectionViewProps {
  jobCards: JobCard[];
  inspections: DailyInspection[];
  equipmentList: Equipment[];
  onToggleInspectionChecklist?: (inspectionId: string, itemKey: string) => void;
}

export const JobCardInspectionView: React.FC<JobCardInspectionViewProps> = ({
  jobCards,
  inspections,
  equipmentList,
}) => {
  const [activeTab, setActiveTab] = useState<'jobcards' | 'inspections'>('jobcards');
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(jobCards[0] || null);

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-black uppercase text-amber-400 border border-amber-500/30">
              Workshop & Field Safety
            </span>
            <span className="text-xs text-slate-400">Digital Execution Logs</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Workshop Job Cards & Daily Inspection</h1>
          <p className="text-xs text-slate-400">
            Work order tracking, mechanic labor allocation, parts requisition, and daily pre-start safety certifications
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs">
          <button
            onClick={() => setActiveTab('jobcards')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 font-bold transition-colors ${
              activeTab === 'jobcards'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            <span>Job Cards ({jobCards.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('inspections')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 font-bold transition-colors ${
              activeTab === 'inspections'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckSquare className="h-4 w-4" />
            <span>Daily Inspection ({inspections.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'jobcards' ? (
        /* JOB CARDS TAB */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Job Cards List (4 Cols) */}
          <div className="lg:col-span-4 space-y-2.5">
            {jobCards.map((jc) => (
              <div
                key={jc.id}
                onClick={() => setSelectedJobCard(jc)}
                className={`rounded-xl border p-4 cursor-pointer transition-all ${
                  selectedJobCard?.id === jc.id
                    ? 'border-amber-500 bg-slate-900 ring-1 ring-amber-500/50'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-amber-400">{jc.id}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      jc.status === 'Completed'
                        ? 'bg-emerald-950 text-emerald-300'
                        : 'bg-amber-950 text-amber-300'
                    }`}
                  >
                    {jc.status}
                  </span>
                </div>
                <div className="mt-1 font-bold text-xs text-white">
                  {jc.equipmentId} – {jc.workType}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-2">
                  <span>{jc.date}</span>
                  <span>{jc.totalLaborHours} labor hrs</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Active Job Card Details (8 Cols) */}
          <div className="lg:col-span-8">
            {selectedJobCard ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-5">
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-base font-bold text-amber-400">
                        {selectedJobCard.id}
                      </span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-bold">
                        {selectedJobCard.workType}
                      </span>
                    </div>
                    <h2 className="text-sm font-bold text-white mt-1">
                      {selectedJobCard.equipmentId} ({selectedJobCard.equipmentModel}) • {selectedJobCard.site}
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Date: {selectedJobCard.date}</span>
                </div>

                {/* Assigned Mechanics */}
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-xs flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Assigned Mechanics:</span>
                  <span className="text-white font-mono">{selectedJobCard.assignedMechanics.join(' • ')}</span>
                </div>

                {/* Tasks List */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    Workshop Tasks & Execution Times
                  </span>
                  <div className="space-y-1.5">
                    {selectedJobCard.tasks.map((task, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg bg-slate-950 p-3 border border-slate-800/80 text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle2
                            className={`h-4 w-4 ${
                              task.status === 'Completed' ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          />
                          <span className="text-slate-200">{task.task}</span>
                        </div>
                        <span className="font-mono text-slate-400">{task.hoursSpent} hrs</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Parts Requisition */}
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                    Parts Requisitioned from Store
                  </span>
                  <div className="space-y-1 text-xs font-mono">
                    {selectedJobCard.partsRequested.map((part, idx) => (
                      <div key={idx} className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                        <span className="text-slate-300">{part.partName} ({part.partNumber})</span>
                        <span className="text-emerald-400 font-bold">Qty: {part.qty} (Issued)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sign-off */}
                <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs">
                  <span className="text-slate-400">
                    Total Workshop Labor:{' '}
                    <strong className="text-white font-mono">{selectedJobCard.totalLaborHours} Hours</strong>
                  </span>
                  <span className="text-emerald-400 font-semibold flex items-center">
                    <UserCheck className="h-4 w-4 mr-1" />
                    P&M Supervisor Certified
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        /* DAILY INSPECTIONS TAB */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {inspections.map((insp) => (
              <div
                key={insp.id}
                className={`rounded-2xl border p-5 shadow-lg space-y-4 ${
                  insp.fitForWork
                    ? 'border-slate-800 bg-slate-900'
                    : 'border-red-900/80 bg-red-950/20'
                }`}
              >
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="font-mono text-sm font-bold text-amber-400">{insp.equipmentId}</span>
                    <h3 className="text-xs font-semibold text-white mt-0.5">
                      Operator: {insp.operatorName}
                    </h3>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      insp.fitForWork
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-red-950 text-red-300 border border-red-800'
                    }`}
                  >
                    {insp.fitForWork ? 'Fit for Work' : 'ISOLATED'}
                  </span>
                </div>

                {/* 8-Point Safety Checklist */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Engine Oil Dipstick</span>
                    <span className={insp.checklist.engineOilLevel ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {insp.checklist.engineOilLevel ? 'OK' : 'LOW'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Coolant Expansion Tank</span>
                    <span className={insp.checklist.coolantLevel ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {insp.checklist.coolantLevel ? 'OK' : 'LOW'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Hydraulic Oil Sight Glass</span>
                    <span className={insp.checklist.hydraulicOilLevel ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {insp.checklist.hydraulicOilLevel ? 'OK' : 'FAIL'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Tyre Pressure / Track Sag</span>
                    <span className="text-emerald-400 font-bold">OK</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Hydraulic Leakage Walkaround</span>
                    <span className={insp.checklist.leakageInspection ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {insp.checklist.leakageInspection ? 'NO LEAKS' : 'LEAK FOUND'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Brakes & Steering Response</span>
                    <span className="text-emerald-400 font-bold">OK</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Horn & Reverse Buzzer Alert</span>
                    <span className="text-emerald-400 font-bold">AUDIBLE</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Fire Extinguisher Valid Pin</span>
                    <span className="text-emerald-400 font-bold">CHARGED</span>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800 text-[11px] text-slate-300">
                  <span className="text-slate-500 block text-[10px]">Observations:</span>
                  {insp.abnormalitiesObserved}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
