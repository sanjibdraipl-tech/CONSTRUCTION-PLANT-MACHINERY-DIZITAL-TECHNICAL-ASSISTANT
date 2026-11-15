import React, { useState } from 'react';
import {
  Disc,
  BatteryCharging,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Plus,
  Shield,
  Gauge,
} from 'lucide-react';
import { TyreRecord, BatteryRecord } from '../types';

interface TyreBatteryViewProps {
  tyreRecords: TyreRecord[];
  batteryRecords: BatteryRecord[];
}

export const TyreBatteryView: React.FC<TyreBatteryViewProps> = ({ tyreRecords, batteryRecords }) => {
  const [activeTab, setActiveTab] = useState<'tyres' | 'batteries'>('tyres');

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[11px] font-black uppercase text-cyan-400 border border-cyan-500/30">
              Fleet Components Desk
            </span>
            <span className="text-xs text-slate-400">Tread Depth & Electrical Health</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Tyre & Battery Life-Cycle Management</h1>
          <p className="text-xs text-slate-400">
            Axle-wise tread depth measurement, retreading cycles, cost per KM, hydrometer specific gravity, and alternator charging voltages
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs">
          <button
            onClick={() => setActiveTab('tyres')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 font-bold transition-colors ${
              activeTab === 'tyres' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Disc className="h-4 w-4" />
            <span>Tyre Tracking ({tyreRecords.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('batteries')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 font-bold transition-colors ${
              activeTab === 'batteries' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BatteryCharging className="h-4 w-4" />
            <span>Battery Health ({batteryRecords.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'tyres' ? (
        /* TYRE TRACKING DESK */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tyreRecords.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg space-y-4"
              >
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="font-mono text-sm font-bold text-cyan-400">{t.tyreSerialNumber}</span>
                    <h3 className="text-xs font-semibold text-white mt-0.5">
                      {t.make} ({t.size})
                    </h3>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      t.status === 'Good'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="rounded bg-slate-950 p-2.5 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Current Tread</span>
                    <span className="text-lg font-bold text-white">{t.currentTreadDepthMm} mm</span>
                    <span className="text-[10px] text-slate-500 block">Initial: {t.initialTreadDepthMm} mm</span>
                  </div>
                  <div className="rounded bg-slate-950 p-2.5 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Retread Cycle</span>
                    <span className="text-lg font-bold text-amber-400">RC-{t.retreadingCycle}</span>
                    <span className="text-[10px] text-slate-500 block">Max 2 cycles</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs border-t border-slate-800 pt-2 font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fitted Machine:</span>
                    <span className="font-bold text-amber-400">{t.equipmentId} ({t.position})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Run KM:</span>
                    <span>{t.totalKmRun.toLocaleString('en-IN')} KM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cost / KM:</span>
                    <span className="font-bold text-emerald-400">₹{t.costPerKm} / km</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* BATTERY TRACKING DESK */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {batteryRecords.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg space-y-4"
              >
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="font-mono text-sm font-bold text-amber-400">{b.batterySerialNumber}</span>
                    <h3 className="text-xs font-semibold text-white mt-0.5">
                      {b.make} ({b.voltageRating})
                    </h3>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      b.healthStatus === 'Healthy'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {b.healthStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="rounded bg-slate-950 p-2.5 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Open Circuit Voltage</span>
                    <span className="text-lg font-bold text-emerald-400">{b.testedVoltage} V</span>
                    <span className="text-[10px] text-slate-500 block">Min: 12.4V (24.8V)</span>
                  </div>
                  <div className="rounded bg-slate-950 p-2.5 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Specific Gravity</span>
                    <span className="text-lg font-bold text-white">{b.specificGravity}</span>
                    <span className="text-[10px] text-slate-500 block">Target: 1.260</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs border-t border-slate-800 pt-2 font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fitted Machine:</span>
                    <span className="font-bold text-amber-400">{b.equipmentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Warranty Expiry:</span>
                    <span>{b.warrantyExpiry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Inspection:</span>
                    <span>{b.lastInspectionDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
