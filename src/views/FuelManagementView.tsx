import React, { useState } from 'react';
import {
  Fuel,
  AlertTriangle,
  Plus,
  TrendingUp,
  Search,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  X,
} from 'lucide-react';
import { FuelEntry, Equipment } from '../types';

interface FuelManagementViewProps {
  fuelEntries: FuelEntry[];
  equipmentList: Equipment[];
  onAddFuelEntry: (entry: FuelEntry) => void;
}

export const FuelManagementView: React.FC<FuelManagementViewProps> = ({
  fuelEntries,
  equipmentList,
  onAddFuelEntry,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const totalFuelIssued = fuelEntries.reduce((acc, c) => acc + c.fuelIssuedLiters, 0);
  const totalActualConsumed = fuelEntries.reduce((acc, c) => acc + c.fuelConsumptionLiters, 0);
  const totalExpected = fuelEntries.reduce((acc, c) => acc + c.expectedConsumptionLiters, 0);

  const exceptions = fuelEntries.filter(
    (f) => f.alertType && f.alertType !== 'Normal'
  );

  const filtered = fuelEntries.filter(
    (f) =>
      f.equipmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.equipmentModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.site.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-[11px] font-black uppercase text-yellow-400 border border-yellow-500/30">
              Module 11 • Energy & Diesel Control
            </span>
            <span className="text-xs text-slate-400">Strict Variance & Bowser Audit</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Fuel Management & Variance Audit
          </h1>
          <p className="text-xs text-slate-400">
            Daily bowser dispensing reconciliation, opening/closing dips, expected consumption baselines, and variance anomaly alerts
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 rounded-lg bg-yellow-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-yellow-400 transition-colors shadow-md shadow-yellow-500/20"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>New Daily Fuel Log</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-xs text-slate-400 font-semibold block">Total Fuel Dispensed</span>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-white">
              {totalFuelIssued.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-amber-400 font-semibold">Liters</span>
          </div>
          <span className="text-[10px] text-slate-500">Across site bowsers</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-xs text-slate-400 font-semibold block">Total Fuel Consumed</span>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-white">
              {totalActualConsumed.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400">Liters</span>
          </div>
          <span className="text-[10px] text-slate-500">Tank dip difference</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-xs text-slate-400 font-semibold block">Expected Baseline</span>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-white">
              {totalExpected.toFixed(0)}
            </span>
            <span className="text-xs text-slate-400">Liters</span>
          </div>
          <span className="text-[10px] text-slate-500">Based on HMR & Rated L/hr</span>
        </div>

        <div className="rounded-xl border border-yellow-900/60 bg-yellow-950/20 p-4">
          <span className="text-xs text-yellow-400 font-semibold block">Variance Exceptions</span>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-yellow-400">{exceptions.length}</span>
            <span className="text-xs text-yellow-300 font-bold">Units Flagged</span>
          </div>
          <span className="text-[10px] text-yellow-400/80">Require site investigation</span>
        </div>
      </div>

      {/* STRICT AUDIT POLICY BANNER (Section 11) */}
      <div className="rounded-xl border border-yellow-900/60 bg-yellow-950/25 p-4 flex items-start space-x-3 text-xs">
        <ShieldAlert className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-yellow-300 uppercase tracking-wider text-[11px]">
            Strict Corporate Fuel Variance Audit Standard
          </h4>
          <p className="mt-1 text-yellow-200/90 leading-relaxed">
            Per company guidelines: Do not accuse anyone of theft without verifiable evidence. Always use the standard wording:{' '}
            <strong className="text-white underline decoration-yellow-400">
              &ldquo;Abnormal fuel variance detected – investigation required.&rdquo;
            </strong>{' '}
            Factors such as nozzle flow-meter drift, heavy idling in queues, injector wear, and fuel temperature expansion must be ruled out through engineering testing.
          </p>
        </div>
      </div>

      {/* Table & Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search fuel log by Equipment ID or Site..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-yellow-500 focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Showing {filtered.length} of {fuelEntries.length} Records
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="p-3">Equip ID</th>
                <th className="p-3">Model</th>
                <th className="p-3">Date</th>
                <th className="p-3">Opening Dip</th>
                <th className="p-3">Issued (L)</th>
                <th className="p-3">Closing Dip</th>
                <th className="p-3">Run (Hrs)</th>
                <th className="p-3">Actual (L)</th>
                <th className="p-3">Expected (L)</th>
                <th className="p-3">Variance (%)</th>
                <th className="p-3 text-right">Audit Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200 font-mono">
              {filtered.map((fe) => {
                const isAbnormal = fe.variancePercentage > 5.0 || fe.variancePercentage < -10.0;

                return (
                  <tr key={fe.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-amber-400">{fe.equipmentId}</td>
                    <td className="p-3 font-sans text-white font-medium">{fe.equipmentModel}</td>
                    <td className="p-3 text-slate-400">{fe.date}</td>
                    <td className="p-3">{fe.openingFuelLiters} L</td>
                    <td className="p-3 font-bold text-cyan-400">{fe.fuelIssuedLiters} L</td>
                    <td className="p-3">{fe.closingFuelLiters} L</td>
                    <td className="p-3 text-white">{fe.operatingHours} hrs</td>
                    <td className="p-3 font-bold text-white">{fe.fuelConsumptionLiters} L</td>
                    <td className="p-3 text-slate-400">{fe.expectedConsumptionLiters} L</td>
                    <td className="p-3 font-bold">
                      <span
                        className={
                          fe.variancePercentage > 10
                            ? 'text-red-400'
                            : fe.variancePercentage > 5
                            ? 'text-yellow-400'
                            : 'text-emerald-400'
                        }
                      >
                        {fe.variancePercentage > 0 ? `+${fe.variancePercentage}%` : `${fe.variancePercentage}%`}
                      </span>
                    </td>
                    <td className="p-3 text-right font-sans">
                      {isAbnormal ? (
                        <div className="inline-block text-right">
                          <span className="rounded bg-yellow-950 text-yellow-300 border border-yellow-800 px-2 py-0.5 text-[10px] font-bold">
                            Investigation Required
                          </span>
                          <div className="text-[9px] text-yellow-400/80 mt-0.5">
                            {fe.alertType}
                          </div>
                        </div>
                      ) : (
                        <span className="rounded bg-emerald-950 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                          Normal (±5%)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Fuel Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Log Daily Fuel Consumption & Dip
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                const eq = equipmentList.find((x) => x.equipmentId === form.eqId.value);
                const opening = Number(form.opening.value) || 100;
                const issued = Number(form.issued.value) || 200;
                const closing = Number(form.closing.value) || 120;
                const hours = Number(form.hours.value) || 8;
                const actual = opening + issued - closing;
                const expected = (eq?.averageFuelConsumption || 16) * hours;
                const variance = actual - expected;
                const variancePct = Number(((variance / (expected || 1)) * 100).toFixed(1));

                const newEntry: FuelEntry = {
                  id: `FL-2026-MAN-${Date.now()}`,
                  date: new Date().toISOString().slice(0, 10),
                  equipmentId: form.eqId.value,
                  equipmentModel: eq?.model || 'Machinery',
                  site: 'Package-4 Km 142+200',
                  openingFuelLiters: opening,
                  fuelReceivedLiters: issued,
                  fuelIssuedLiters: issued,
                  closingFuelLiters: closing,
                  operatingHours: hours,
                  fuelConsumptionLiters: actual,
                  expectedConsumptionLiters: expected,
                  varianceLiters: variance,
                  variancePercentage: variancePct,
                  alertType: variancePct > 5 ? 'Abnormal Consumption' : 'Normal',
                  alertMessage:
                    variancePct > 5
                      ? 'Abnormal fuel variance detected – investigation required.'
                      : 'Consumption within normal engineering tolerance.',
                  investigationStatus: variancePct > 5 ? 'Pending' : 'Verified Normal',
                };

                onAddFuelEntry(newEntry);
                setShowAddModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-slate-400 block mb-1">Equipment *</label>
                <select name="eqId" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white">
                  {equipmentList.map((eq) => (
                    <option key={eq.equipmentId} value={eq.equipmentId}>
                      {eq.equipmentId} – {eq.model} (Avg: {eq.averageFuelConsumption} L/hr)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Opening Dip (Liters) *</label>
                  <input name="opening" type="number" defaultValue="150" required className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Fuel Issued (Liters) *</label>
                  <input name="issued" type="number" defaultValue="200" required className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Closing Dip (Liters) *</label>
                  <input name="closing" type="number" defaultValue="180" required className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Operating Hours (HMR diff) *</label>
                  <input name="hours" type="number" step="0.1" defaultValue="8.5" required className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="rounded bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="rounded bg-yellow-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-yellow-400">
                  Save Fuel Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
