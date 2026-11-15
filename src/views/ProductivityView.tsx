import React, { useState } from 'react';
import {
  TrendingUp,
  Calculator,
  Flame,
  Fuel,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const ProductivityView: React.FC = () => {
  // Equipment type selection (Section 10)
  const [selectedPlantType, setSelectedPlantType] = useState('Hot Mix Plant (HMP)');

  // Inputs
  const [workingHours, setWorkingHours] = useState(8.0);
  const [ratedOutputPerHour, setRatedOutputPerHour] = useState(160); // 160 TPH
  const [totalOutput, setTotalOutput] = useState(1108); // 1,108 Tons produced
  const [fuelConsumedLiters, setFuelConsumedLiters] = useState(1580); // Liters
  const [dieselPrice, setDieselPrice] = useState(92); // ₹/L
  const [operatorCostDaily, setOperatorCostDaily] = useState(2400); // ₹
  const [maintenanceCostDaily, setMaintenanceCostDaily] = useState(4800); // ₹
  const [hireCostDaily, setHireCostDaily] = useState(0); // ₹
  const [idleHours, setIdleHours] = useState(1.5); // Tipper turnaround wait
  const [breakdownHours, setBreakdownHours] = useState(0.5); // Burner trip

  // Unit of output label based on selected machine
  const getUnit = () => {
    if (selectedPlantType.includes('RMC') || selectedPlantType.includes('Batching') || selectedPlantType.includes('Pump')) return 'm³';
    if (selectedPlantType.includes('Piling')) return 'Meters drilled';
    if (selectedPlantType.includes('Excavator')) return 'm³ earthwork';
    return 'Tons';
  };

  // CALCULATIONS (Section 10)
  const actualOutputPerHour = workingHours > 0 ? Number((totalOutput / workingHours).toFixed(1)) : 0;
  const fuelPerUnit = totalOutput > 0 ? Number((fuelConsumedLiters / totalOutput).toFixed(2)) : 0;
  const totalOperatingExpense =
    fuelConsumedLiters * dieselPrice + operatorCostDaily + maintenanceCostDaily + hireCostDaily;
  const costPerUnit = totalOutput > 0 ? Number((totalOperatingExpense / totalOutput).toFixed(1)) : 0;
  const costPerHour = workingHours > 0 ? Number((totalOperatingExpense / workingHours).toFixed(1)) : 0;
  const productivityPercentage =
    ratedOutputPerHour > 0 ? Number(((actualOutputPerHour / ratedOutputPerHour) * 100).toFixed(1)) : 0;
  const totalAvailableTime = workingHours + idleHours + breakdownHours;
  const utilizationPercentage =
    totalAvailableTime > 0 ? Number(((workingHours / totalAvailableTime) * 100).toFixed(1)) : 0;

  // Preset switcher
  const handlePlantTypeChange = (type: string) => {
    setSelectedPlantType(type);
    if (type.includes('Hot Mix')) {
      setRatedOutputPerHour(160);
      setTotalOutput(1108);
      setFuelConsumedLiters(1580);
    } else if (type.includes('RMC') || type.includes('Batching')) {
      setRatedOutputPerHour(45);
      setTotalOutput(340);
      setFuelConsumedLiters(420);
    } else if (type.includes('WMM')) {
      setRatedOutputPerHour(200);
      setTotalOutput(1450);
      setFuelConsumedLiters(980);
    } else if (type.includes('Crusher')) {
      setRatedOutputPerHour(250);
      setTotalOutput(1800);
      setFuelConsumedLiters(1120);
    } else if (type.includes('Piling')) {
      setRatedOutputPerHour(4.5); // m/hr in hard rock
      setTotalOutput(32); // 32 meters
      setFuelConsumedLiters(420);
    } else if (type.includes('Excavator')) {
      setRatedOutputPerHour(140); // 140 m³/hr bulk digging
      setTotalOutput(980);
      setFuelConsumedLiters(160);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] font-black uppercase text-emerald-400 border border-emerald-500/30">
            Module 10 • Operations & Production
          </span>
          <span className="text-xs text-slate-400">Unit Cost & Fuel Burn Benchmarking</span>
        </div>
        <h1 className="text-2xl font-black text-white mt-1">
          Plant & Machinery Productivity Engine
        </h1>
        <p className="text-xs text-slate-400">
          Compute hourly output, specific fuel consumption per unit output (L/Ton or L/m³), unit production cost, and utilization
        </p>
      </div>

      {/* Preset Category Switcher */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          'Hot Mix Plant (HMP)',
          'RMC / Batching Plant (CP45)',
          'WMM Plant (200 TPH)',
          'Crusher Plant (NW106)',
          'Piling Rig (BG28)',
          'Excavator (EX210)',
        ].map((item) => (
          <button
            key={item}
            onClick={() => handlePlantTypeChange(item)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              selectedPlantType === item
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* INPUTS (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Calculator className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Production & Shift Inputs
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Working Running Hours</label>
                <input
                  type="number"
                  step="0.1"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(Number(e.target.value))}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Rated Output/Hr</label>
                <input
                  type="number"
                  value={ratedOutputPerHour}
                  onChange={(e) => setRatedOutputPerHour(Number(e.target.value))}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Total Output Produced ({getUnit()})
              </label>
              <input
                type="number"
                value={totalOutput}
                onChange={(e) => setTotalOutput(Number(e.target.value))}
                className="w-full rounded bg-slate-950 border border-emerald-500/80 px-3 py-2 text-emerald-400 font-mono text-sm font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Fuel Consumed (L)</label>
                <input
                  type="number"
                  value={fuelConsumedLiters}
                  onChange={(e) => setFuelConsumedLiters(Number(e.target.value))}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Diesel Price (₹/L)</label>
                <input
                  type="number"
                  value={dieselPrice}
                  onChange={(e) => setDieselPrice(Number(e.target.value))}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Idle Wait Hours</label>
                <input
                  type="number"
                  step="0.1"
                  value={idleHours}
                  onChange={(e) => setIdleHours(Number(e.target.value))}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Breakdown Hours</label>
                <input
                  type="number"
                  step="0.1"
                  value={breakdownHours}
                  onChange={(e) => setBreakdownHours(Number(e.target.value))}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Daily Operator Cost (₹)</label>
                <input
                  type="number"
                  value={operatorCostDaily}
                  onChange={(e) => setOperatorCostDaily(Number(e.target.value))}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Daily Maintenance (₹)</label>
                <input
                  type="number"
                  value={maintenanceCostDaily}
                  onChange={(e) => setMaintenanceCostDaily(Number(e.target.value))}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* OUTPUT DASHBOARD (7 Cols - Section 10 Requirements) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Calculated Productivity & Efficiency Metrics
                </h3>
                <span className="text-xs text-slate-400">{selectedPlantType} Performance</span>
              </div>
              <span className="rounded bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 text-xs font-mono font-bold">
                {productivityPercentage}% Productivity
              </span>
            </div>

            {/* 6 Key Calculations Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Output / Hour */}
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Output / Hour</span>
                <div className="mt-1 flex items-baseline space-x-1">
                  <span className="text-2xl font-black font-mono text-emerald-400">{actualOutputPerHour}</span>
                  <span className="text-xs font-semibold text-slate-400">{getUnit()}/hr</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Rated: {ratedOutputPerHour}</span>
              </div>

              {/* Fuel / Litre per Unit */}
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Fuel / Unit</span>
                <div className="mt-1 flex items-baseline space-x-1">
                  <span className="text-2xl font-black font-mono text-amber-400">{fuelPerUnit}</span>
                  <span className="text-xs font-semibold text-slate-400">L/{getUnit()}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Specific fuel index</span>
              </div>

              {/* Cost / Unit */}
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Cost / Unit</span>
                <div className="mt-1 flex items-baseline space-x-1">
                  <span className="text-2xl font-black font-mono text-cyan-400">₹{costPerUnit}</span>
                  <span className="text-xs font-semibold text-slate-400">/{getUnit()}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Direct operating</span>
              </div>

              {/* Cost / Hour */}
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Cost / Hour</span>
                <div className="mt-1 flex items-baseline space-x-1">
                  <span className="text-2xl font-black font-mono text-white">₹{costPerHour}</span>
                  <span className="text-xs font-semibold text-slate-400">/hr</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Running burn rate</span>
              </div>

              {/* Productivity % */}
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Productivity %</span>
                <div className="mt-1 flex items-baseline space-x-1">
                  <span className="text-2xl font-black font-mono text-emerald-400">{productivityPercentage}%</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Actual vs. Rated</span>
              </div>

              {/* Utilization % */}
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Utilization %</span>
                <div className="mt-1 flex items-baseline space-x-1">
                  <span className="text-2xl font-black font-mono text-amber-400">{utilizationPercentage}%</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Run vs (Run+Idle+BD)</span>
              </div>
            </div>

            {/* Time Loss Breakdown */}
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Shift Time Allocation Analysis ({totalAvailableTime.toFixed(1)} Total Hours)
              </span>
              <div className="h-4 w-full rounded-full bg-slate-800 flex overflow-hidden">
                <div
                  style={{ width: `${(workingHours / totalAvailableTime) * 100}%` }}
                  className="bg-emerald-500 h-full"
                  title={`Running: ${workingHours} hrs`}
                />
                <div
                  style={{ width: `${(idleHours / totalAvailableTime) * 100}%` }}
                  className="bg-amber-500 h-full"
                  title={`Idle: ${idleHours} hrs`}
                />
                <div
                  style={{ width: `${(breakdownHours / totalAvailableTime) * 100}%` }}
                  className="bg-red-500 h-full"
                  title={`Breakdown: ${breakdownHours} hrs`}
                />
              </div>

              <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5" />
                  Running: {workingHours} hrs ({((workingHours / totalAvailableTime) * 100).toFixed(0)}%)
                </span>
                <span className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mr-1.5" />
                  Idle: {idleHours} hrs ({((idleHours / totalAvailableTime) * 100).toFixed(0)}%)
                </span>
                <span className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-red-500 mr-1.5" />
                  Breakdown: {breakdownHours} hrs ({((breakdownHours / totalAvailableTime) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
