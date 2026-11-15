import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertOctagon,
  PauseCircle,
  Truck,
  Fuel,
  MapPin,
  Calendar,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Equipment, EquipmentStatus } from '../types';

interface EquipmentStatusViewProps {
  equipment: Equipment[];
  onUpdateStatus: (eqId: string, status: EquipmentStatus) => void;
  onSelectForDiagnostic: (eqId: string) => void;
}

export const EquipmentStatusView: React.FC<EquipmentStatusViewProps> = ({
  equipment,
  onUpdateStatus,
  onSelectForDiagnostic,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const runningCount = equipment.filter((e) => e.currentStatus === 'Running').length;
  const availableCount = equipment.filter((e) => e.currentStatus === 'Available').length;
  const idleCount = equipment.filter((e) => e.currentStatus === 'Idle').length;
  const maintCount = equipment.filter((e) => e.currentStatus === 'Under Maintenance').length;
  const breakdownCount = equipment.filter((e) => e.currentStatus === 'Breakdown').length;

  const filtered = filterStatus === 'ALL' ? equipment : equipment.filter((e) => e.currentStatus === filterStatus);

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-black uppercase text-amber-400 border border-amber-500/30">
            Control Tower Telemetry
          </span>
          <span className="text-xs text-slate-400">Live Operating Status</span>
        </div>
        <h1 className="text-2xl font-black text-white mt-1">Equipment Operational Status</h1>
        <p className="text-xs text-slate-400">
          Real-time tracking of 20 fleet units across active project sites, telemetry health, and immediate status change controls
        </p>
      </div>

      {/* Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setFilterStatus('Running')}
          className={`rounded-xl border p-3.5 text-left transition-all ${
            filterStatus === 'Running'
              ? 'border-emerald-500 bg-emerald-950/40'
              : 'border-slate-800 bg-slate-900 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold">Running</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-white">{runningCount}</div>
          <div className="text-[10px] text-emerald-400/80">Active in Shift</div>
        </button>

        <button
          onClick={() => setFilterStatus('Available')}
          className={`rounded-xl border p-3.5 text-left transition-all ${
            filterStatus === 'Available'
              ? 'border-cyan-500 bg-cyan-950/40'
              : 'border-slate-800 bg-slate-900 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-xs font-semibold">Available</span>
            <Truck className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-white">{availableCount}</div>
          <div className="text-[10px] text-cyan-400/80">Ready on Standby</div>
        </button>

        <button
          onClick={() => setFilterStatus('Idle')}
          className={`rounded-xl border p-3.5 text-left transition-all ${
            filterStatus === 'Idle'
              ? 'border-blue-500 bg-blue-950/40'
              : 'border-slate-800 bg-slate-900 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-semibold">Idle</span>
            <PauseCircle className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-white">{idleCount}</div>
          <div className="text-[10px] text-blue-400/80">No Front / Weather Delay</div>
        </button>

        <button
          onClick={() => setFilterStatus('Under Maintenance')}
          className={`rounded-xl border p-3.5 text-left transition-all ${
            filterStatus === 'Under Maintenance'
              ? 'border-amber-500 bg-amber-950/40'
              : 'border-slate-800 bg-slate-900 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold">Under Maint.</span>
            <Clock className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-white">{maintCount}</div>
          <div className="text-[10px] text-amber-400/80">Scheduled PM Service</div>
        </button>

        <button
          onClick={() => setFilterStatus('Breakdown')}
          className={`rounded-xl border p-3.5 text-left transition-all ${
            filterStatus === 'Breakdown'
              ? 'border-red-500 bg-red-950/40'
              : 'border-slate-800 bg-slate-900 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-red-400">
            <span className="text-xs font-semibold">Breakdown</span>
            <AlertOctagon className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-white">{breakdownCount}</div>
          <div className="text-[10px] text-red-400/80">Urgent Repair Required</div>
        </button>
      </div>

      {filterStatus !== 'ALL' && (
        <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
          <span>Filtering by status: <strong className="text-white">{filterStatus}</strong></span>
          <button onClick={() => setFilterStatus('ALL')} className="text-amber-400 font-bold hover:underline">
            Clear Filter (Show All 20)
          </button>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((eq) => (
          <div
            key={eq.equipmentId}
            className={`rounded-2xl border p-4 shadow-lg transition-all ${
              eq.currentStatus === 'Breakdown'
                ? 'border-red-900/80 bg-red-950/15'
                : eq.currentStatus === 'Under Maintenance'
                ? 'border-amber-900/80 bg-amber-950/15'
                : 'border-slate-800 bg-slate-900/90'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-black text-amber-400">
                    {eq.equipmentId}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">{eq.type}</span>
                  {eq.gpsStatus === 'Online' ? (
                    <span className="flex items-center text-[10px] text-emerald-400 font-mono">
                      <Wifi className="h-3 w-3 mr-0.5" /> GPS
                    </span>
                  ) : (
                    <span className="flex items-center text-[10px] text-slate-500 font-mono">
                      <WifiOff className="h-3 w-3 mr-0.5" /> GPS
                    </span>
                  )}
                </div>
                <h3 className="text-xs font-bold text-white mt-0.5">
                  {eq.make} {eq.model}
                </h3>
              </div>

              {/* Status Switcher Select */}
              <select
                value={eq.currentStatus}
                onChange={(e) => onUpdateStatus(eq.equipmentId, e.target.value as EquipmentStatus)}
                className={`rounded-lg px-2 py-1 text-[11px] font-bold border focus:outline-none cursor-pointer ${
                  eq.currentStatus === 'Running'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : eq.currentStatus === 'Available'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                    : eq.currentStatus === 'Under Maintenance'
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : eq.currentStatus === 'Breakdown'
                    ? 'bg-red-950 text-red-300 border-red-800'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <option value="Running">Running</option>
                <option value="Available">Available</option>
                <option value="Idle">Idle</option>
                <option value="Under Maintenance">Under Maint.</option>
                <option value="Breakdown">Breakdown</option>
              </select>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 my-3 text-xs">
              <div className="rounded-lg bg-slate-950 p-2 border border-slate-800/80">
                <span className="text-slate-500 block text-[10px]">Current HMR</span>
                <span className="font-mono font-bold text-white">{eq.hmr} hrs</span>
              </div>
              <div className="rounded-lg bg-slate-950 p-2 border border-slate-800/80">
                <span className="text-slate-500 block text-[10px]">Avg Fuel</span>
                <span className="font-mono font-bold text-amber-400">{eq.averageFuelConsumption} L/h</span>
              </div>
              <div className="rounded-lg bg-slate-950 p-2 border border-slate-800/80">
                <span className="text-slate-500 block text-[10px]">Next PM</span>
                <span className="font-mono font-bold text-slate-300">{eq.pmHours} hrs</span>
              </div>
            </div>

            {/* Location & Operator */}
            <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-800/60 pt-2.5">
              <div className="flex items-center space-x-1.5 truncate">
                <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{eq.site}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Operator: <strong className="text-slate-300">{eq.operator}</strong></span>
                <span className="text-slate-500">Dept: <strong className="text-slate-300">{eq.department}</strong></span>
              </div>
            </div>

            {/* Remarks / Action */}
            <div className="mt-3 flex items-center justify-between border-t border-slate-800/60 pt-2.5">
              <span className="text-[10px] text-slate-400 italic truncate max-w-[200px]">
                {eq.remarks || 'Normal operation'}
              </span>
              <button
                onClick={() => onSelectForDiagnostic(eq.equipmentId)}
                className="rounded bg-amber-500/20 px-2 py-1 text-[10px] font-bold text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors"
              >
                Diagnose
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
