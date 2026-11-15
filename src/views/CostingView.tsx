import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Scale,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Calculator,
} from 'lucide-react';
import { Equipment } from '../types';

interface CostingViewProps {
  equipmentList: Equipment[];
}

export const CostingView: React.FC<CostingViewProps> = ({ equipmentList }) => {
  // Owned vs Hired Interactive Calculator State (Section 13)
  const [selectedMachineType, setSelectedMachineType] = useState('20-Ton Hydraulic Excavator');
  const [purchasePrice, setPurchasePrice] = useState(6500000); // 65 Lakhs INR
  const [lifeYears, setLifeYears] = useState(5);
  const [salvageValue, setSalvageValue] = useState(1200000); // 12 Lakhs
  const [interestRatePct, setInterestRatePct] = useState(9.5); // 9.5% p.a.
  const [monthlyInsurance, setMonthlyInsurance] = useState(14000);
  const [monthlyOperator, setMonthlyOperator] = useState(42000); // Operator + Helper
  const [maintSparesPerHour, setMaintSparesPerHour] = useState(380); // ₹/hr
  const [monthlyExpectedHours, setMonthlyExpectedHours] = useState(200);

  // Hired option inputs
  const [monthlyRentalRate, setMonthlyRentalRate] = useState(240000); // 2.4 Lakhs/month
  const [hiredMinHours, setHiredMinHours] = useState(240); // 240 hrs contract
  const [dieselPricePerLiter, setDieselPricePerLiter] = useState(92);
  const [fuelBurnPerHour, setFuelBurnPerHour] = useState(16.5); // L/hr

  // CALCULATIONS (Section 13)
  // Monthly Depreciation (Straight Line)
  const monthlyDepreciation = (purchasePrice - salvageValue) / (lifeYears * 12);
  // Monthly Finance / Capital cost (approximate on avg balance)
  const monthlyFinanceCost = (purchasePrice * (interestRatePct / 100)) / 12;
  // Total Fixed Monthly Cost (Owned)
  const totalFixedOwned = monthlyDepreciation + monthlyFinanceCost + monthlyInsurance + monthlyOperator;
  // Fixed Cost per Hour @ selected hours
  const fixedCostPerHour = monthlyExpectedHours > 0 ? totalFixedOwned / monthlyExpectedHours : 0;
  // Fuel Cost per Hour (borne by company in both owned & dry lease)
  const fuelCostPerHour = fuelBurnPerHour * dieselPricePerLiter;
  // Total Owned Cost Per Operating Hour
  const totalOwnedCostPerHour = fixedCostPerHour + maintSparesPerHour + fuelCostPerHour;

  // Hired Cost per Hour (Dry lease: maintenance & depreciation borne by vendor)
  const effectiveHiredRatePerHour =
    monthlyExpectedHours > hiredMinHours
      ? monthlyRentalRate / monthlyExpectedHours
      : monthlyRentalRate / hiredMinHours;
  const totalHiredCostPerHour = effectiveHiredRatePerHour + fuelCostPerHour;

  // Break-even Hours Calculation
  // Monthly Fixed Owned = totalFixedOwned
  // Hourly differential savings = (Hired Rate/hr - Owned Maint/hr)
  const hourlyRateDiff = effectiveHiredRatePerHour - maintSparesPerHour;
  const breakEvenHours = hourlyRateDiff > 0 ? Math.round(totalFixedOwned / hourlyRateDiff) : 0;

  const isOwnedBetter = monthlyExpectedHours >= breakEvenHours;
  const monthlyOwnedTotalCost = totalFixedOwned + (maintSparesPerHour + fuelCostPerHour) * monthlyExpectedHours;
  const monthlyHiredTotalCost = Math.max(monthlyRentalRate, effectiveHiredRatePerHour * monthlyExpectedHours) + fuelCostPerHour * monthlyExpectedHours;
  const estimatedMonthlySaving = Math.abs(monthlyHiredTotalCost - monthlyOwnedTotalCost);

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-black uppercase text-amber-400 border border-amber-500/30">
            Module 13 • Equipment Financials
          </span>
          <span className="text-xs text-slate-400">Total Cost of Ownership (TCO)</span>
        </div>
        <h1 className="text-2xl font-black text-white mt-1">
          Cost Management & Owned vs. Hired Optimization
        </h1>
        <p className="text-xs text-slate-400">
          Full absorption hourly equipment costing, life-cycle depreciation, interest, and break-even leasing decision models
        </p>
      </div>

      {/* OWNED VS HIRED DECISION ENGINE (Section 13) */}
      <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <Scale className="h-6 w-6 text-amber-400" />
            <div>
              <h2 className="text-base font-extrabold text-white">
                Owned vs. Hired Comparison Engine
              </h2>
              <p className="text-xs text-slate-400">
                Mathematical evaluation based on project utilization, capital depreciation, and vendor hire terms
              </p>
            </div>
          </div>

          {/* Recommendation Banner */}
          <div
            className={`rounded-xl px-4 py-2 border flex items-center space-x-2 ${
              isOwnedBetter
                ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                : 'bg-purple-950/60 border-purple-700 text-purple-300'
            }`}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <div className="text-xs">
              <span className="font-black uppercase tracking-wider block">
                Recommended: {isOwnedBetter ? 'OWNED ASSET' : 'HIRED (RENTAL)'}
              </span>
              <span className="text-[10px] opacity-90">
                {isOwnedBetter
                  ? `Utilization (${monthlyExpectedHours} hrs) exceeds break-even threshold (${breakEvenHours} hrs)`
                  : `Intermittent usage below break-even (${breakEvenHours} hrs); hiring mitigates idle depreciation.`}
              </span>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* OWNED OPTION (6 Cols) */}
          <div className="lg:col-span-6 rounded-xl bg-slate-950 p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Option A: Company Owned Asset
              </span>
              <span className="font-mono text-xs text-slate-400">CapEx Model</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Asset Purchase Price (₹)</label>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Asset Life (Years)</label>
                <input
                  type="number"
                  value={lifeYears}
                  onChange={(e) => setLifeYears(Number(e.target.value))}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Salvage Value (₹)</label>
                <input
                  type="number"
                  value={salvageValue}
                  onChange={(e) => setSalvageValue(Number(e.target.value))}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Finance Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={interestRatePct}
                  onChange={(e) => setInterestRatePct(Number(e.target.value))}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Maintenance & Spares (₹/hr)</label>
                <input
                  type="number"
                  value={maintSparesPerHour}
                  onChange={(e) => setMaintSparesPerHour(Number(e.target.value))}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Operator & Helper (₹/mo)</label>
                <input
                  type="number"
                  value={monthlyOperator}
                  onChange={(e) => setMonthlyOperator(Number(e.target.value))}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="rounded-lg bg-slate-900/80 p-3 border border-slate-800 text-xs space-y-1 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Monthly Depreciation:</span>
                <span className="text-white font-semibold">₹{Math.round(monthlyDepreciation).toLocaleString('en-IN')}/mo</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Monthly Capital Interest:</span>
                <span className="text-white font-semibold">₹{Math.round(monthlyFinanceCost).toLocaleString('en-IN')}/mo</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Fixed Expense / Month:</span>
                <span className="text-amber-400 font-bold">₹{Math.round(totalFixedOwned).toLocaleString('en-IN')}/mo</span>
              </div>
            </div>

            <div className="flex items-baseline justify-between border-t border-slate-800 pt-3">
              <span className="text-xs text-slate-300 font-bold">Total Owned Cost / Hour:</span>
              <span className="text-xl font-black font-mono text-amber-400">
                ₹{Math.round(totalOwnedCostPerHour)}/hr
              </span>
            </div>
          </div>

          {/* HIRED OPTION (6 Cols) */}
          <div className="lg:col-span-6 rounded-xl bg-slate-950 p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Option B: Market Hired Machine (Dry Lease)
              </span>
              <span className="font-mono text-xs text-slate-400">OpEx Model</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Monthly Rental Rate (₹)</label>
                <input
                  type="number"
                  value={monthlyRentalRate}
                  onChange={(e) => setMonthlyRentalRate(Number(e.target.value))}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Contract Minimum Hours</label>
                <input
                  type="number"
                  value={hiredMinHours}
                  onChange={(e) => setHiredMinHours(Number(e.target.value))}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Expected Monthly Hours</label>
                <input
                  type="number"
                  value={monthlyExpectedHours}
                  onChange={(e) => setMonthlyExpectedHours(Number(e.target.value))}
                  className="w-full rounded bg-slate-900 border border-amber-500/80 px-2.5 py-1.5 text-amber-300 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Fuel Burn Rate (L/hr)</label>
                <input
                  type="number"
                  step="0.1"
                  value={fuelBurnPerHour}
                  onChange={(e) => setFuelBurnPerHour(Number(e.target.value))}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="rounded-lg bg-slate-900/80 p-3 border border-slate-800 text-xs space-y-1 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Effective Hire Rate / Hr:</span>
                <span className="text-white font-semibold">₹{Math.round(effectiveHiredRatePerHour)}/hr</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Fuel Cost / Hr (@ ₹{dieselPricePerLiter}/L):</span>
                <span className="text-white font-semibold">₹{Math.round(fuelCostPerHour)}/hr</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Maintenance Risk:</span>
                <span className="text-emerald-400 font-bold">Borne by Vendor</span>
              </div>
            </div>

            <div className="flex items-baseline justify-between border-t border-slate-800 pt-3">
              <span className="text-xs text-slate-300 font-bold">Total Hired Cost / Hour:</span>
              <span className="text-xl font-black font-mono text-purple-400">
                ₹{Math.round(totalHiredCostPerHour)}/hr
              </span>
            </div>
          </div>
        </div>

        {/* COMPARISON METRICS SUMMARY */}
        <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Break-even Hours</span>
            <span className="text-xl font-black text-amber-400">{breakEvenHours} hrs/mo</span>
            <span className="text-[10px] text-slate-400 font-sans block mt-0.5">Threshold to justify buying</span>
          </div>

          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Projected Usage</span>
            <span className="text-xl font-black text-white">{monthlyExpectedHours} hrs/mo</span>
            <span className="text-[10px] text-slate-400 font-sans block mt-0.5">Current site commitment</span>
          </div>

          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Monthly Owned Cost</span>
            <span className="text-xl font-black text-slate-200">
              ₹{Math.round(monthlyOwnedTotalCost).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 font-sans block mt-0.5">Full absorption</span>
          </div>

          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Estimated Monthly Saving</span>
            <span className="text-xl font-black text-emerald-400">
              ₹{Math.round(estimatedMonthlySaving).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
              By choosing {isOwnedBetter ? 'Owned' : 'Hired'}
            </span>
          </div>
        </div>
      </div>

      {/* FULL FLEET HOURLY COST BREAKDOWN TABLE (Section 13) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Fleet Cost / Operating Hour Breakdown
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Benchmark Diesel: ₹92/L</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                <th className="p-3">Equip ID</th>
                <th className="p-3">Equipment</th>
                <th className="p-3">Ownership</th>
                <th className="p-3">Fuel Cost/Hr</th>
                <th className="p-3">Maint & Spares/Hr</th>
                <th className="p-3">Operator/Hr</th>
                <th className="p-3">Depreciation/Hr</th>
                <th className="p-3">Total Cost/Hour</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
              {equipmentList.slice(0, 10).map((eq) => {
                const fuelPerHr = Math.round(eq.averageFuelConsumption * 92);
                const maintPerHr = eq.category === 'Earthmoving' ? 380 : eq.category === 'Road & Paving' ? 450 : 280;
                const opPerHr = 140;
                const depPerHr = eq.ownershipType === 'Departmental' ? 420 : 0;
                const totalCost = fuelPerHr + maintPerHr + opPerHr + depPerHr;

                return (
                  <tr key={eq.equipmentId} className="hover:bg-slate-950/40">
                    <td className="p-3 font-bold text-amber-400">{eq.equipmentId}</td>
                    <td className="p-3 font-sans font-semibold text-white">
                      {eq.make} {eq.model}
                    </td>
                    <td className="p-3 font-sans">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          eq.ownershipType === 'Departmental'
                            ? 'bg-blue-950 text-blue-300'
                            : 'bg-purple-950 text-purple-300'
                        }`}
                      >
                        {eq.ownershipType}
                      </span>
                    </td>
                    <td className="p-3 text-slate-200">₹{fuelPerHr}/hr</td>
                    <td className="p-3 text-slate-300">₹{maintPerHr}/hr</td>
                    <td className="p-3 text-slate-400">₹{opPerHr}/hr</td>
                    <td className="p-3 text-slate-400">₹{depPerHr}/hr</td>
                    <td className="p-3 font-bold text-amber-400 text-sm">₹{totalCost}/hr</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
