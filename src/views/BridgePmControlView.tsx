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
  Compass,
  Layers,
  Fuel,
  Clock,
  Gauge,
  Activity,
  FileSpreadsheet,
  Building2,
  ChevronRight,
  ShieldAlert,
  Volume2,
  Speaker,
  Zap,
  RotateCcw,
  Sparkles,
  BarChart3,
  CheckSquare,
} from 'lucide-react';
import { Equipment } from '../types';
import { voiceAgent } from '../utils/voiceAgent';

interface BridgePmControlViewProps {
  equipmentList: Equipment[];
  onOpenDiagnosticWithQuery?: (query: string, eqId?: string) => void;
  onNavigate?: (view: string) => void;
}

export const BridgePmControlView: React.FC<BridgePmControlViewProps> = ({
  equipmentList,
  onOpenDiagnosticWithQuery,
  onNavigate,
}) => {
  // Navigation tabs within Bridge P&M Control
  const [activeTab, setActiveTab] = useState<
    'economic-model' | 'boq-budget' | 'utilization-4tier' | 'bridge-fleet' | 'fuel-variance' | 'life-cycle' | 'scorecard'
  >('economic-model');

  // Master Economic Model Simulator state (Section 1 & 35)
  const [simMachine, setSimMachine] = useState<'piling' | 'crane' | 'launcher' | 'excavator'>('piling');
  const [simPlannedHours, setSimPlannedHours] = useState(2400);
  const [simAvailabilityPct, setSimAvailabilityPct] = useState(90);
  const [simUtilizationPct, setSimUtilizationPct] = useState(85);
  const [simProductivePct, setSimProductivePct] = useState(80);
  const [simOutputPerHour, setSimOutputPerHour] = useState(0.55); // m/hr for piling
  const [simFuelPerHour, setSimFuelPerHour] = useState(18); // L/hr
  const [simDieselPrice, setSimDieselPrice] = useState(95); // ₹/L
  const [simCapexPurchase, setSimCapexPurchase] = useState(55000000); // 5.5 Crore
  const [simSalvageValue, setSimSalvageValue] = useState(11000000); // 1.1 Crore
  const [simEconomicLifeYears, setSimEconomicLifeYears] = useState(8);
  const [simMaintPerHour, setSimMaintPerHour] = useState(650); // ₹/hr
  const [simOperatorMonthly, setSimOperatorMonthly] = useState(65000); // ₹/mo
  const [simInsuranceMonthly, setSimInsuranceMonthly] = useState(28000); // ₹/mo

  // BOQ / Work-Quantity-First Budget Planner State (Section 2 & 31)
  const [boqWorkType, setBoqWorkType] = useState<'piling' | 'superstructure' | 'concrete'>('piling');
  const [boqTotalQuantity, setBoqTotalQuantity] = useState(10500); // 10,500 m
  const [boqUnitLabel, setBoqUnitLabel] = useState('meters drilling');
  const [boqPlannedDailyRate, setBoqPlannedDailyRate] = useState(120); // 120 m/day
  const [boqWorkingDays, setBoqWorkingDays] = useState(90); // 90 days
  const [boqContingencyPct, setBoqContingencyPct] = useState(20); // 20% backup

  // Non-Productive 60-Hour Delay Breakdown State (Section 7)
  const [delayCategory, setDelayCategory] = useState<string>('crane-wait');

  // Fuel Control & Theft Investigation State (Section 14 & 15)
  const [fuelStandardNorm, setFuelStandardNorm] = useState(18); // L/hr
  const [fuelActualObserved, setFuelActualObserved] = useState(22); // L/hr
  const [fuelRunningHours, setFuelRunningHours] = useState(200); // hrs/month
  const [fuelGpsHours, setFuelGpsHours] = useState(195);
  const [fuelGpsFuelIssued, setFuelGpsFuelIssued] = useState(4400); // Litres

  // 1. Economic Chain Computations
  const simAvailableHours = Math.round(simPlannedHours * (simAvailabilityPct / 100));
  const simUtilizedHours = Math.round(simAvailableHours * (simUtilizationPct / 100));
  const simProductiveHours = Math.round(simUtilizedHours * (simProductivePct / 100));
  const simTotalOutput = Math.round(simProductiveHours * simOutputPerHour);
  const simTotalFuelLitres = Math.round(simProductiveHours * simFuelPerHour);
  const simTotalFuelCost = simTotalFuelLitres * simDieselPrice;

  // Annual Fixed Cost (Depreciation + Interest 9.5% + Insurance + Operator)
  const simAnnualDepreciation = (simCapexPurchase - simSalvageValue) / simEconomicLifeYears;
  const simAnnualFinance = (simCapexPurchase * 0.095) * 0.65; // average capital cost
  const simAnnualInsurance = simInsuranceMonthly * 12;
  const simAnnualOperator = simOperatorMonthly * 12;
  const simAnnualFixedCost = simAnnualDepreciation + simAnnualFinance + simAnnualInsurance + simAnnualOperator;
  const simAnnualVariableCost = simTotalFuelCost + (simMaintPerHour * simProductiveHours);
  const simTotalAnnualCost = simAnnualFixedCost + simAnnualVariableCost;
  const simCostPerProductiveUnit = simTotalOutput > 0 ? Math.round(simTotalAnnualCost / simTotalOutput) : 0;
  const simCostPerProductiveHour = simProductiveHours > 0 ? Math.round(simTotalAnnualCost / simProductiveHours) : 0;
  const simFuelEfficiency = simTotalOutput > 0 ? Number((simTotalFuelLitres / simTotalOutput).toFixed(2)) : 0;

  // Preset machine handlers
  const handlePresetSelect = (type: 'piling' | 'crane' | 'launcher' | 'excavator') => {
    setSimMachine(type);
    if (type === 'piling') {
      setSimPlannedHours(2400);
      setSimAvailabilityPct(90);
      setSimUtilizationPct(85);
      setSimProductivePct(80);
      setSimOutputPerHour(0.55); // m/hr
      setSimFuelPerHour(18); // L/hr
      setSimCapexPurchase(55000000); // 5.5 Cr (MAIT HR260)
      setSimSalvageValue(11000000);
      setSimMaintPerHour(650);
      setSimOperatorMonthly(65000);
    } else if (type === 'crane') {
      setSimPlannedHours(2400);
      setSimAvailabilityPct(92);
      setSimUtilizationPct(80);
      setSimProductivePct(70);
      setSimOutputPerHour(0.857); // lifts/hr (6.86 lifts/day)
      setSimFuelPerHour(26); // L/hr
      setSimCapexPurchase(128000000); // 12.8 Cr (Kobelco CKE2500 250T)
      setSimSalvageValue(28000000);
      setSimMaintPerHour(950);
      setSimOperatorMonthly(75000);
    } else if (type === 'launcher') {
      setSimPlannedHours(2000);
      setSimAvailabilityPct(88);
      setSimUtilizationPct(75);
      setSimProductivePct(70);
      setSimOutputPerHour(0.025); // spans/hr (~1 span every 40 hrs)
      setSimFuelPerHour(24.5);
      setSimCapexPurchase(50000000); // 5.0 Cr
      setSimSalvageValue(10000000);
      setSimMaintPerHour(800);
      setSimOperatorMonthly(90000);
    } else if (type === 'excavator') {
      setSimPlannedHours(2400);
      setSimAvailabilityPct(90);
      setSimUtilizationPct(80);
      setSimProductivePct(75);
      setSimOutputPerHour(100); // 100 m³/hr
      setSimFuelPerHour(16.5);
      setSimCapexPurchase(6500000); // 65 Lakhs
      setSimSalvageValue(1200000);
      setSimMaintPerHour(380);
      setSimOperatorMonthly(42000);
    }
  };

  // 2. BOQ Calculations (Section 2)
  const boqTargetDaily = boqWorkingDays > 0 ? boqTotalQuantity / boqWorkingDays : 0;
  const boqRawRigsNeeded = boqPlannedDailyRate > 0 ? boqTargetDaily / boqPlannedDailyRate : 0;
  const boqTotalRigsRecommended = Number((boqRawRigsNeeded * (1 + boqContingencyPct / 100)).toFixed(1));

  // 3. Fuel Variance Computations (Section 15)
  const fuelStandardMonthlyLitres = fuelStandardNorm * fuelRunningHours;
  const fuelActualMonthlyLitres = fuelActualObserved * fuelRunningHours;
  const fuelExcessLitres = Math.max(0, fuelActualMonthlyLitres - fuelStandardMonthlyLitres);
  const fuelExcessCostInr = fuelExcessLitres * simDieselPrice;
  const fuelVariancePct = fuelStandardMonthlyLitres > 0
    ? Number((((fuelActualMonthlyLitres - fuelStandardMonthlyLitres) / fuelStandardMonthlyLitres) * 100).toFixed(1))
    : 0;

  // Speak voice summary
  const handleVoiceBriefing = () => {
    const text = `Bridge P and M Cost and Performance Executive Briefing. Question 1: Is the machine available? Mechanical availability is ${simAvailabilityPct} percent against 90 percent target. Question 2: Is it productive? Productive hours are ${simProductiveHours} hours generating ${simTotalOutput.toLocaleString()} ${simMachine === 'piling' ? 'meters of rock piling' : 'units'}. Question 3: Is it fuel efficient? Specific fuel consumption is ${simFuelEfficiency} litres per unit. Question 4: Is it economically justified? Owned cost is approximately ₹${simCostPerProductiveHour.toLocaleString()} per productive hour. Question 5: Is it costing within approved budget? Unit cost is ₹${simCostPerProductiveUnit.toLocaleString()} per unit. All six golden formulas are active.`;
    voiceAgent.speak(text);
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* EXECUTIVE FIRST SCREEN HEADER */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-amber-500 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-slate-950 shadow-sm">
                AGM / HEAD P&M EXECUTIVE DESK
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Bridge P&M Cost & Performance Management System (IRC / NHAI / MoRTH)
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              The 5 Core Executive Questions & Master Economic Model
            </h1>
            <p className="text-sm font-semibold text-amber-300/90 italic">
              “Is the machine available, productive, fuel-efficient, economically justified, and costing within the approved budget?”
            </p>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Moving beyond simplistic &ldquo;machine running hours&rdquo; into the full economic conversion chain:
              <strong> CAPEX/Rental → Available Hours → Utilized Hours → Productive Hours → Output → Operating Costs → ₹/productive unit → Life-cycle cost</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={handleVoiceBriefing}
              className="flex items-center justify-center space-x-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all cursor-pointer"
              title="Listen to Executive Briefing in Normal Speaking Mode (Loudspeaker Gents Voice - No Headphone Required)"
            >
              <Speaker className="h-4 w-4 stroke-[2.5]" />
              <span>Executive Briefing (Normal Speaker)</span>
            </button>
            <button
              onClick={() => {
                if (onOpenDiagnosticWithQuery) {
                  onOpenDiagnosticWithQuery('MAIT HR260 rotary head stall at 38m riverbed depth', 'PR-01');
                }
              }}
              className="flex items-center justify-center space-x-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-all cursor-pointer"
            >
              <Compass className="h-4 w-4 text-amber-400" />
              <span>Bridge Diagnostics</span>
            </button>
          </div>
        </div>
      </div>

      {/* THE 5 CORE EXECUTIVE QUESTIONS SCORECARD BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Q1: Available? */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg space-y-1.5 hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">Q1. Available?</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-white">{simAvailabilityPct}%</span>
            <span className="text-[11px] text-emerald-400 font-semibold">vs 90% Target</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Mechanical Availability: <strong>{simAvailableHours} hrs</strong> ready to work out of {simPlannedHours} hrs.
          </p>
        </div>

        {/* Q2: Productive? */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg space-y-1.5 hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">Q2. Productive?</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-white">{simProductivePct}%</span>
            <span className="text-[11px] text-emerald-400 font-semibold">{simProductiveHours} hrs</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Output: <strong>{simTotalOutput.toLocaleString()}</strong> {simMachine === 'piling' ? 'm drilled' : 'units'} ({simOutputPerHour}/hr).
          </p>
        </div>

        {/* Q3: Fuel-Efficient? */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg space-y-1.5 hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">Q3. Fuel-Efficient?</span>
            <span className="h-2 w-2 rounded-full bg-amber-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-white">{simFuelEfficiency}</span>
            <span className="text-[11px] text-amber-400 font-semibold">{simMachine === 'piling' ? 'L/meter' : 'L/unit'}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Dual norm: <strong>{simFuelPerHour} L/hr</strong> burn rate ({simTotalFuelLitres.toLocaleString()} L total).
          </p>
        </div>

        {/* Q4: Economically Justified? */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg space-y-1.5 hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">Q4. Economically Justified?</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-white">₹{Math.round(simCostPerProductiveHour / 1000)}k</span>
            <span className="text-[11px] text-slate-400 font-semibold">/prod hr</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Owned &gt; 165 h/mo break-even threshold saves <strong>₹48k/mo</strong> vs rental.
          </p>
        </div>

        {/* Q5: Within Approved Budget? */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg space-y-1.5 hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">Q5. Within Budget?</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-emerald-400">₹{simCostPerProductiveUnit.toLocaleString()}</span>
            <span className="text-[11px] text-slate-400">/unit</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Approved BOQ norm ₹9,500/m; Current variance: <strong className="text-emerald-400">-2.3% (Savings)</strong>.
          </p>
        </div>
      </div>

      {/* TOP NAVIGATION TABS FOR DEEP BRIDGE P&M CHAPTERS */}
      <div className="flex items-center space-x-1.5 overflow-x-auto border-b border-slate-800 pb-2 text-xs no-scrollbar">
        {[
          { id: 'economic-model', label: '1. Master Economic Model', icon: TrendingUp },
          { id: 'boq-budget', label: '2. BOQ-First Machine Budget', icon: Calculator },
          { id: 'utilization-4tier', label: '3. 4-Tier Utilization & 60h Leakage', icon: Gauge },
          { id: 'bridge-fleet', label: '4. Deep Bridge Fleet (10 Systems)', icon: Building2 },
          { id: 'fuel-variance', label: '5. Production Fuel & Theft Audit', icon: Fuel },
          { id: 'life-cycle', label: '6. Life-Cycle & Repair vs Replace', icon: Scale },
          { id: 'scorecard', label: '7. Head P&M Control Scorecard', icon: CheckSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: THE MASTER P&M ECONOMIC MODEL (Section 1 & 35) */}
      {activeTab === 'economic-model' && (
        <div className="space-y-6">
          {/* Contrast Card: Weak Reporting vs Real P&M Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-red-900/60 bg-red-950/20 p-5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center space-x-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>What Junior Workshop Engineers Report (Superficial):</span>
              </span>
              <p className="text-sm font-bold text-red-200">
                “Machine running hours = 600 hours this month. Engine is healthy.”
              </p>
              <p className="text-xs text-red-300/80 leading-relaxed">
                Management learns nothing about actual output, fuel burned per unit, standby waiting, or whether the machine justified its ₹5.5 Crore capital cost.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-900/60 bg-emerald-950/20 p-5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>What Head / AGM P&M Reports to Project Director:</span>
              </span>
              <p className="text-xs font-bold text-emerald-200 font-mono">
                Available: 700h • Utilized: 620h • Productive: 570h • Output: 5,700m • Fuel: 7,400L • Maint: ₹8.2L • Total: ₹28.5L • Cost: ₹500/m
              </p>
              <p className="text-xs text-emerald-300/80 leading-relaxed">
                That is P&M Management. Every litre of diesel, technician hour, and idle minute is directly tied to ₹/productive unit of bridge construction.
              </p>
            </div>
          </div>

          {/* Machine Preset Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase text-slate-400">Select Bridge Equipment Archetype:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'piling', label: 'Bored Piling Rig (MAIT HR260 / Bauer BG28)' },
                  { id: 'crane', label: 'Heavy Crawler Crane (Kobelco 250T CKE2500)' },
                  { id: 'launcher', label: 'Launching Girder (SLG-50 Auto-Launcher)' },
                  { id: 'excavator', label: 'Hydraulic Excavator (CAT 320 / EX210)' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handlePresetSelect(m.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      simMachine === m.id
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-[11px] text-amber-400 font-mono">Interactive Live Calculation</span>
          </div>

          {/* THE MASTER ECONOMIC CONVERSION CHAIN (VISUAL FLOW) */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-6 shadow-xl">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>The Master P&M Economic Conversion Chain</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
              {/* Step 1: Planned / CAPEX */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">1. CAPEX / Base</span>
                <div className="text-lg font-black font-mono text-white">₹{(simCapexPurchase / 10000000).toFixed(1)} Cr</div>
                <span className="text-[10px] text-slate-400 font-mono">{simPlannedHours}h Planned</span>
              </div>

              {/* Step 2: Available */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">2. Available</span>
                <div className="text-lg font-black font-mono text-cyan-400">{simAvailableHours} h</div>
                <span className="text-[10px] text-emerald-400 font-mono">{simAvailabilityPct}% Availability</span>
              </div>

              {/* Step 3: Utilized */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">3. Utilized</span>
                <div className="text-lg font-black font-mono text-amber-400">{simUtilizedHours} h</div>
                <span className="text-[10px] text-slate-400 font-mono">{simUtilizationPct}% Utilized</span>
              </div>

              {/* Step 4: Productive */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">4. Productive</span>
                <div className="text-lg font-black font-mono text-emerald-400">{simProductiveHours} h</div>
                <span className="text-[10px] text-emerald-400 font-mono">{simProductivePct}% Prod. Ratio</span>
              </div>

              {/* Step 5: Output */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">5. Output</span>
                <div className="text-lg font-black font-mono text-white">{simTotalOutput.toLocaleString()}</div>
                <span className="text-[10px] text-amber-400 font-mono">{simMachine === 'piling' ? 'meters' : 'units'}</span>
              </div>

              {/* Step 6: Total Cost */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">6. Total Cost</span>
                <div className="text-lg font-black font-mono text-purple-400">₹{(simTotalAnnualCost / 100000).toFixed(1)} L</div>
                <span className="text-[10px] text-slate-400 font-mono">Fixed + Variable</span>
              </div>

              {/* Step 7: Final ₹ / Unit */}
              <div className="rounded-2xl border-2 border-amber-500 bg-amber-500/10 p-3 space-y-1">
                <span className="text-[10px] font-black text-amber-400 uppercase">7. ₹ / Productive Unit</span>
                <div className="text-xl font-black font-mono text-amber-300">₹{simCostPerProductiveUnit.toLocaleString()}</div>
                <span className="text-[10px] text-white font-bold">{simMachine === 'piling' ? '/meter' : '/unit'}</span>
              </div>
            </div>

            {/* Slider Controls for Simulator */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-400">Planned Mechanical Availability:</span>
                  <span className="text-amber-400 font-mono">{simAvailabilityPct}%</span>
                </div>
                <input
                  type="range"
                  min="65"
                  max="98"
                  value={simAvailabilityPct}
                  onChange={(e) => setSimAvailabilityPct(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-400">Site Utilization Ratio:</span>
                  <span className="text-amber-400 font-mono">{simUtilizationPct}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={simUtilizationPct}
                  onChange={(e) => setSimUtilizationPct(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-400">Productive Work Factor:</span>
                  <span className="text-amber-400 font-mono">{simProductivePct}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="90"
                  value={simProductivePct}
                  onChange={(e) => setSimProductivePct(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 22: The Excavator Lesson Example */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
              Why Productivity is Far More Important than Simply Saving Diesel (Section 22)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-white block">Case A: High Productivity (100 m³/hr)</span>
                <p className="text-slate-400 leading-relaxed font-mono">
                  Hourly Cost = ₹2,600/hr (Fixed ₹800 + Fuel ₹1,200 + Maint ₹350 + Operator ₹150 + Other ₹100).<br />
                  Unit Cost = ₹2,600 ÷ 100 m³/hr = <strong className="text-emerald-400 text-sm">₹26.00 / m³</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-white block">Case B: Poor Productivity (70 m³/hr due to tipper delay)</span>
                <p className="text-slate-400 leading-relaxed font-mono">
                  Hourly Cost remains identical: ₹2,600/hr.<br />
                  Unit Cost = ₹2,600 ÷ 70 m³/hr = <strong className="text-red-400 text-sm">₹37.14 / m³</strong> (+43% Cost Increase!).
                </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Key takeaway: Nothing changed in hourly machine cost, yet poor site coordination and tipper mismatch increased unit cost by 43%. This is why P&M management must optimize the entire production chain.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: BOQ / WORK-QUANTITY-FIRST MACHINERY BUDGET PLANNER (Section 2, 3, 4, 31) */}
      {activeTab === 'boq-budget' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 flex items-start space-x-3 text-xs text-amber-200">
            <Calculator className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-300 uppercase tracking-wide">
                The Golden Rule: Never Prepare a Machinery Budget First.
              </h4>
              <p className="mt-0.5 leading-relaxed">
                Always start with the Project BOQ and Construction Programme. Derive daily output required, working days, equipment requirements, and contingency before compiling Capex and Opex budgets.
              </p>
            </div>
          </div>

          {/* BOQ Input Grid */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Bridge Work-Quantity & Fleet Requirement Calculator
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">BOQ Activity</label>
                <select
                  value={boqWorkType}
                  onChange={(e) => {
                    const v = e.target.value as any;
                    setBoqWorkType(v);
                    if (v === 'piling') {
                      setBoqTotalQuantity(10500); // 300 piles x 35m
                      setBoqUnitLabel('meters drilling');
                      setBoqPlannedDailyRate(120);
                      setBoqWorkingDays(90);
                    } else if (v === 'superstructure') {
                      setBoqTotalQuantity(140); // 140 spans
                      setBoqUnitLabel('precast spans');
                      setBoqPlannedDailyRate(1.2);
                      setBoqWorkingDays(120);
                    } else if (v === 'concrete') {
                      setBoqTotalQuantity(24000); // 24,000 m3
                      setBoqUnitLabel('m³ concrete');
                      setBoqPlannedDailyRate(150);
                      setBoqWorkingDays(160);
                    }
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white font-medium focus:border-amber-500 focus:outline-none"
                >
                  <option value="piling">Bridge Foundation (300 Piles × 35m = 10,500m)</option>
                  <option value="superstructure">Bridge Superstructure (140 Spans Launching)</option>
                  <option value="concrete">Pier & Deck Concreting (24,000 m³ Batching)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Total BOQ Quantity ({boqUnitLabel})</label>
                <input
                  type="number"
                  value={boqTotalQuantity}
                  onChange={(e) => setBoqTotalQuantity(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Available Working Days (Programme)</label>
                <input
                  type="number"
                  value={boqWorkingDays}
                  onChange={(e) => setBoqWorkingDays(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Machine Planned Daily Rate ({boqUnitLabel}/day)</label>
                <input
                  type="number"
                  value={boqPlannedDailyRate}
                  onChange={(e) => setBoqPlannedDailyRate(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white font-mono"
                />
              </div>
            </div>

            {/* Computed Requirement */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                <span className="text-slate-500 block">Required Daily Production Rate:</span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">
                  {boqTargetDaily.toFixed(1)} {boqUnitLabel}/day
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Total Qty ÷ Available Working Days</span>
              </div>

              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                <span className="text-slate-500 block">Theoretical Productive Machines:</span>
                <span className="text-xl font-bold font-mono text-cyan-400 mt-1 block">
                  {boqRawRigsNeeded.toFixed(2)} Rigs / Machines
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Target Rate ÷ Machine Rate</span>
              </div>

              <div className="rounded-xl bg-slate-950 p-4 border-2 border-amber-500/50">
                <span className="text-amber-400 font-bold block">Recommended Deployment Fleet:</span>
                <span className="text-2xl font-black font-mono text-amber-300 mt-1 block">
                  {Math.ceil(boqTotalRigsRecommended)} Units ({boqTotalRigsRecommended.toFixed(1)})
                </span>
                <span className="text-[10px] text-slate-300 mt-1 block">Includes {boqContingencyPct}% breakdown & maintenance contingency</span>
              </div>
            </div>
          </div>

          {/* 6-Part Machine Budget Structure (Section 3 & 31) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              The 6-Part Master Machine Budget Structure
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Part A */}
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1.5">
                <span className="font-bold text-white block">A. Capital Cost (CAPEX)</span>
                <ul className="text-slate-400 space-y-1 list-disc pl-4 text-[11px]">
                  <li>Purchase price & GST</li>
                  <li>Inland freight & transportation</li>
                  <li>Transit insurance & road registration</li>
                  <li>Commissioning & initial spares</li>
                  <li>Attachments (Kelly bars, casings, booms)</li>
                </ul>
              </div>

              {/* Part B */}
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1.5">
                <span className="font-bold text-white block">B. Fixed Cost</span>
                <ul className="text-slate-400 space-y-1 list-disc pl-4 text-[11px]">
                  <li>Depreciation (Straight-line or WDV)</li>
                  <li>Interest / Finance cost (9.5% p.a.)</li>
                  <li>Annual insurance policy</li>
                  <li>Management & workshop overhead</li>
                  <li>Parking & central yard storage</li>
                </ul>
              </div>

              {/* Part C */}
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1.5">
                <span className="font-bold text-white block">C. Variable Operating Cost</span>
                <ul className="text-slate-400 space-y-1 list-disc pl-4 text-[11px]">
                  <li>High-speed diesel (L/hr & L/unit)</li>
                  <li>Engine & hydraulic lubricants</li>
                  <li>Filters (air, oil, fuel, return)</li>
                  <li>Ground engaging tools (GET / teeth)</li>
                  <li>Welding, cutting & consumables</li>
                </ul>
              </div>

              {/* Part D */}
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1.5">
                <span className="font-bold text-white block">D. Labour Crew</span>
                <ul className="text-slate-400 space-y-1 list-disc pl-4 text-[11px]">
                  <li>Certified heavy machine operator</li>
                  <li>Rigger & mechanical helper</li>
                  <li>Hydraulic mechanic allocation</li>
                  <li>Auto-electrician & instrumentation</li>
                  <li>Site P&M supervisor share</li>
                </ul>
              </div>

              {/* Part E */}
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1.5">
                <span className="font-bold text-white block">E. Major Overhauls</span>
                <ul className="text-slate-400 space-y-1 list-disc pl-4 text-[11px]">
                  <li>Diesel engine mid-life overhaul</li>
                  <li>Main hydraulic pump & valve bank</li>
                  <li>Rotary drive & Kelly swivel head</li>
                  <li>Undercarriage (track chains, sprockets)</li>
                  <li>Winch drums & slewing bearings</li>
                </ul>
              </div>

              {/* Part F */}
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1.5">
                <span className="font-bold text-white block">F. End-of-Life & Salvage</span>
                <ul className="text-slate-400 space-y-1 list-disc pl-4 text-[11px]">
                  <li>Assessed salvage / resale value (15–20%)</li>
                  <li>Demobilization & transport to base</li>
                  <li>Disposal / scrap recovery</li>
                  <li>Replacement provision reserve</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 4-TIER UTILIZATION & THE 60-HOUR DELAY LEAKAGE AUDIT (Section 6 & 7) */}
      {activeTab === 'utilization-4tier' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              The 4 Distinct Levels of Equipment Utilization
            </h3>
            <p className="text-xs text-slate-400">
              Many P&M reports are misleading because they cite a single &ldquo;utilization&rdquo; figure. True engineering management tracks all 4 distinct layers:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Level 1</span>
                <h4 className="font-bold text-white">Mechanical Availability</h4>
                <div className="text-xl font-mono text-cyan-400">90.0%</div>
                <p className="text-[11px] text-slate-400">Available Hours ÷ Planned Hours × 100 (Machine is technically ready).</p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Level 2</span>
                <h4 className="font-bold text-white">Utilization</h4>
                <div className="text-xl font-mono text-amber-400">88.9%</div>
                <p className="text-[11px] text-slate-400">Utilized Hours ÷ Available Hours × 100 (Machine actually deployed with engine running).</p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4 border-2 border-emerald-500/50 bg-emerald-950/20 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Level 3 (Most Critical)</span>
                <h4 className="font-bold text-emerald-200">Productive Utilization</h4>
                <div className="text-xl font-mono text-emerald-300">77.8%</div>
                <p className="text-[11px] text-emerald-300/80">Productive Hours ÷ Available Hours × 100 (Time actively producing measurable output).</p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Level 4</span>
                <h4 className="font-bold text-white">Productivity Achievement</h4>
                <div className="text-xl font-mono text-purple-400">82.5%</div>
                <p className="text-[11px] text-slate-400">Actual Output ÷ Planned Output × 100 (Effectiveness against schedule).</p>
              </div>
            </div>
          </div>

          {/* Where did the other 60 hours go? (Section 7) */}
          <div className="rounded-2xl border border-amber-500/40 bg-slate-900 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">
                  Where did the other 60 Hours Go? (The Improvement Money)
                </h3>
                <p className="text-xs text-slate-400">
                  Example: Available = 270 h, Productive = 210 h. 60 hours leaked away in non-productive standby:
                </p>
              </div>
              <span className="rounded bg-red-950 border border-red-800 px-2.5 py-1 text-xs font-bold text-red-300">
                60 Non-Productive Hours Leaked
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              {[
                { id: 'cage-prep', title: 'Rebar Cage Prep', hours: 14, icon: Layers },
                { id: 'crane-wait', title: 'Service Crane Waiting', hours: 12, icon: Activity },
                { id: 'concrete-wait', title: 'RMC Concrete Waiting', hours: 10, icon: Clock },
                { id: 'bentonite', title: 'Bentonite Slurry / Desander', hours: 7, icon: Fuel },
                { id: 'survey', title: 'Survey & Alignment Check', hours: 5, icon: Compass },
                { id: 'breakdown', title: 'Minor Mechanical Snags', hours: 4, icon: AlertTriangle },
                { id: 'shift-change', title: 'Shift Change & Briefing', hours: 3, icon: Clock },
                { id: 'relocation', title: 'Rig Tramming & Setup', hours: 2.5, icon: ArrowRight },
                { id: 'operator', title: 'Operator / Crew Delay', hours: 1.5, icon: CheckCircle2 },
                { id: 'workfront', title: 'Workfront Obstruction', hours: 1.0, icon: ShieldAlert },
              ].map((leak) => {
                const Icon = leak.icon;
                return (
                  <div
                    key={leak.id}
                    onClick={() => setDelayCategory(leak.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      delayCategory === leak.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="h-3.5 w-3.5 text-amber-400" />
                      <span className="font-mono font-bold text-amber-300">{leak.hours}h</span>
                    </div>
                    <span className="font-bold text-white block mt-1 text-[11px]">{leak.title}</span>
                    <span className="text-[10px] text-slate-500 block">
                      Cost: ₹{(leak.hours * 2600).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-amber-200/90 italic pt-2">
              “That is where your improvement money is. P&M cannot optimize machinery independently; we must coordinate with Construction, Planning, Batching Plant, Stores, and Survey.”
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: DEEP BRIDGE FLEET ENGINEERING SYSTEMS (10 Systems) */}
      {activeTab === 'bridge-fleet' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
              Bridge Plant & Machinery 10-System Engineering Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Technical specifications, operating cycles, cycle breakdowns, and safety protocols across all bridge machinery classes:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* System 1: Rotary Piling Rig */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-2">
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase">
                System 01 • Foundation Piling
              </span>
              <h4 className="text-sm font-bold text-white">Rotary Piling Rig (MAIT HR260 / Bauer BG28)</h4>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                <strong>340-Minute Pile Cycle:</strong> Positioning (20m) → Boring (180m) → Hole Cleaning (30m) → Casing (20m) → Reinforcement Cage (40m) → Tremie Concreting (50m) = 5.67 hrs/pile.
              </p>
              <div className="rounded bg-slate-900 p-2.5 font-mono text-[11px] text-slate-300 border border-slate-800">
                Theoretical: 30m ÷ 5.67h = 5.29 m/hr (52.9 m/10h shift). Actual: 35–40 m/day due to strata and service delays.
              </div>
            </div>

            {/* System 2: Crawler Crane Girder Erection */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-2">
              <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-400 uppercase">
                System 02 • Heavy Erection
              </span>
              <h4 className="text-sm font-bold text-white">Crawler Crane (Kobelco CKE2500 250T)</h4>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                <strong>70-Minute 80T Girder Lift Cycle:</strong> Rigging (20m) → Hooking (10m) → Lift (10m) → Slewing (10m) → Placement (10m) → De-rigging (10m) = 0.857 lift/hr (6.86 lifts/8h day).
              </p>
              <div className="rounded bg-slate-900 p-2.5 font-mono text-[11px] text-slate-300 border border-slate-800">
                If crane waits 2 hours for trailer transport: Actual production drops from 549 T/day to 480 T/day.
              </div>
            </div>

            {/* System 3: Tandem Lifting Engineering */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-2">
              <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-400 uppercase">
                System 03 • Critical Lift
              </span>
              <h4 className="text-sm font-bold text-white">Tandem Crane Lifting (Twin 150T / 250T Cranes)</h4>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                <strong>Never Assume 50:50 Load Sharing:</strong> Center of gravity shifts during slewing, hook differential travel, boom elasticity, and sling angle tilt.
              </p>
              <div className="rounded bg-slate-900 p-2.5 font-mono text-[11px] text-purple-300 border border-slate-800">
                Requires engineered lift plan, trial lift, single designated signalman with dedicated VHF radio, and 75% SWL derating per crane.
              </div>
            </div>

            {/* System 4: Auto-Launching Girder */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-2">
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                System 04 • Superstructure
              </span>
              <h4 className="text-sm font-bold text-white">Segment Launching Girder (SLG-50 / Bridgecon)</h4>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                <strong>7-Cycle Erection Sequence:</strong> 1. Positioning → 2. Segment Lifting → 3. Alignment → 4. Temporary Support → 5. Stressing → 6. Launcher Advancement → 7. Next Span.
              </p>
              <div className="rounded bg-slate-900 p-2.5 font-mono text-[11px] text-emerald-300 border border-slate-800">
                Primary KPI: Spans/day and ₹/span. Equipment capex allocation: ₹4 Cr ÷ 1,000 spans = ₹40,000/span + Opex = ₹1.2 Lakh/span total.
              </div>
            </div>

            {/* System 5: Prestressing & Multi-Strand Jacks */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-2">
              <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400 uppercase">
                System 05 • Post-Tensioning
              </span>
              <h4 className="text-sm font-bold text-white">Prestressing & Stressing System (Freyssinet 500T)</h4>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                <strong>Calculated Pressure vs Elongation:</strong> If actual elongation is 110mm vs 150mm required, do NOT simply pump higher pressure!
              </p>
              <div className="rounded bg-slate-900 p-2.5 font-mono text-[11px] text-rose-300 border border-slate-800">
                Check 10 root causes: Duct profile friction, free length, wedge seating, strand slip, gauge deadweight calibration, or strand obstruction.
              </div>
            </div>

            {/* System 6: River Barge Jacking Platform */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-2">
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase">
                System 06 • Marine Foundation
              </span>
              <h4 className="text-sm font-bold text-white">River Barge Jacking & Heavy Marine Platform</h4>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                <strong>Floating Platform Marine Stability:</strong> Displacement, draft, freeboard, tidal current, wave action, and pontoon ballasting.
              </p>
              <div className="rounded bg-slate-900 p-2.5 font-mono text-[11px] text-amber-300 border border-slate-800">
                Mandatory Safety Rule: Cranes must never operate with pontoon heel/list exceeding 1.5 degrees.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRODUCTION FUEL & THEFT AUDIT ENGINE (Section 12, 13, 14, 15, 16) */}
      {activeTab === 'fuel-variance' && (
        <div className="space-y-6">
          {/* Dual Fuel Norm Matrix */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">
              The Dual Fuel Norm: Never Use Only L/Hr (Section 12 & 13)
            </h3>
            <p className="text-xs text-slate-400">
              A machine consuming 10 L/hr producing 60 m³/hr (0.167 L/m³) is less fuel-efficient than a machine consuming 12 L/hr producing 100 m³/hr (0.12 L/m³). Fuel must always be linked to production:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                    <th className="p-2">Equipment Category</th>
                    <th className="p-2">Hourly Burn Norm</th>
                    <th className="p-2">Mandatory Production-Linked Metric</th>
                    <th className="p-2">Typical Indian Benchmark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-[11px]">
                  <tr>
                    <td className="p-2 font-bold text-white">Rotary Piling Rig (MAIT / Bauer)</td>
                    <td className="p-2 text-slate-400">18–22 L/hr</td>
                    <td className="p-2 text-amber-400 font-bold">L/meter drilled</td>
                    <td className="p-2 text-slate-300">0.25 – 0.35 L/m in rock</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-white">Heavy Crawler Crane (250T)</td>
                    <td className="p-2 text-slate-400">22–26 L/hr</td>
                    <td className="p-2 text-amber-400 font-bold">L/tonne lifted</td>
                    <td className="p-2 text-slate-300">0.35 – 0.45 L/T lifted</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-white">Segment Launching Girder</td>
                    <td className="p-2 text-slate-400">20–25 L/hr</td>
                    <td className="p-2 text-amber-400 font-bold">L/span erected</td>
                    <td className="p-2 text-slate-300">850 – 1,100 L / span</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-white">Hydraulic Excavator (20T)</td>
                    <td className="p-2 text-slate-400">14–17 L/hr</td>
                    <td className="p-2 text-amber-400 font-bold">L/m³ earthwork</td>
                    <td className="p-2 text-slate-300">0.12 – 0.16 L/m³</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-white">Hot Mix Plant (160 TPH)</td>
                    <td className="p-2 text-slate-400">Fuel Burner L/hr</td>
                    <td className="p-2 text-amber-400 font-bold">L/tonne mix</td>
                    <td className="p-2 text-slate-300">5.5 – 6.8 L/T DBM/BC</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Fuel Variance Calculator (Section 15) */}
          <div className="rounded-2xl border border-amber-500/40 bg-slate-900 p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Bridge Rig Fuel Variance & Financial Loss Calculator (Section 15)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Approved Standard Fuel Norm (L/hr)</label>
                <input
                  type="number"
                  value={fuelStandardNorm}
                  onChange={(e) => setFuelStandardNorm(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Actual Observed Fuel Consumption (L/hr)</label>
                <input
                  type="number"
                  value={fuelActualObserved}
                  onChange={(e) => setFuelActualObserved(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Monthly Operating Hours (h)</label>
                <input
                  type="number"
                  value={fuelRunningHours}
                  onChange={(e) => setFuelRunningHours(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white font-mono"
                />
              </div>
            </div>

            {/* Computed Loss Result */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-800 text-xs">
              <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800">
                <span className="text-slate-500 block">Fuel Consumption Variance:</span>
                <span className={`text-xl font-black font-mono mt-1 block ${fuelVariancePct > 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                  +{fuelVariancePct}% ({fuelExcessLitres} Litres Excess)
                </span>
              </div>

              <div className="rounded-xl bg-slate-950 p-3.5 border-2 border-red-500/40">
                <span className="text-red-400 font-bold block">Monthly Cash Loss (Single Rig):</span>
                <span className="text-2xl font-black font-mono text-red-300 mt-1 block">
                  ₹{fuelExcessCostInr.toLocaleString()} / Month
                </span>
                <span className="text-[10px] text-slate-400">At ₹{simDieselPrice}/L diesel price</span>
              </div>

              <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800">
                <span className="text-slate-500 block">10-Rig Fleet Extrapolated Loss:</span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">
                  ₹{(fuelExcessCostInr * 10 / 100000).toFixed(1)} Lakh / Month
                </span>
                <span className="text-[10px] text-red-400 font-semibold">Abnormal fuel variance detected – investigation required.</span>
              </div>
            </div>

            {/* 12-Point Technical Investigation Checklist */}
            <div className="pt-3 border-t border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Mandatory 12-Point Technical Investigation Checklist:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 font-medium">
                <span className="p-1.5 rounded bg-slate-950 border border-slate-800">1. Hydraulic relief bypass</span>
                <span className="p-1.5 rounded bg-slate-950 border border-slate-800">2. Turbo boost pressure drop</span>
                <span className="p-1.5 rounded bg-slate-950 border border-slate-800">3. Fuel injector spray pattern</span>
                <span className="p-1.5 rounded bg-slate-950 border border-slate-800">4. High engine idling hours</span>
                <span className="p-1.5 rounded bg-slate-950 border border-slate-800">5. Air filter restriction</span>
                <span className="p-1.5 rounded bg-slate-950 border border-slate-800">6. Rock socket hardness strata</span>
                <span className="p-1.5 rounded bg-slate-950 border border-slate-800">7. Fuel tank drain pilferage</span>
                <span className="p-1.5 rounded bg-slate-950 border border-slate-800">8. Operator lugging habits</span>
                <span className="p-1.5 rounded bg-slate-950 border border-slate-800">9. Return line fuel leakage</span>
                <span className="p-1.5 rounded bg-slate-950 border border-slate-800">10. Dispensing meter error</span>
                <span className="p-1.5 rounded bg-slate-950 border border-slate-800">11. HMR tampering check</span>
                <span className="p-1.5 rounded bg-slate-950 border border-slate-800">12. GPS vs Engine log gap</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: LIFE-CYCLE & REPAIR VS REPLACE INDEX (Section 17, 18, 19, 29, 30) */}
      {activeTab === 'life-cycle' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">
              Technical Life vs Economic Life (Section 17 & 18)
            </h3>
            <p className="text-xs text-slate-400">
              A machine can continue physically operating for 15 years (Technical Life), but become economically unviable after 8 years due to fuel degradation, recurring downtime, and spare obsolescence (Economic Life).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800">
                <span className="text-amber-400 font-bold block">Piling Rigs & Cranes</span>
                <span className="text-sm text-white font-bold block mt-1">10–20 Years / 15,000+ Hours</span>
                <span className="text-[10px] text-slate-500">Fatigue, NDT inspection & certification critical.</span>
              </div>
              <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800">
                <span className="text-amber-400 font-bold block">Excavators & Loaders</span>
                <span className="text-sm text-white font-bold block mt-1">8,000 – 15,000 Hours</span>
                <span className="text-[10px] text-slate-500">Engine, pump & undercarriage replacement threshold.</span>
              </div>
              <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800">
                <span className="text-amber-400 font-bold block">Launching Girders & Jacks</span>
                <span className="text-sm text-white font-bold block mt-1">Project / Design Life Dependent</span>
                <span className="text-[10px] text-slate-500">Structural load cycle recertification required.</span>
              </div>
            </div>
          </div>

          {/* Section 29 & 30: Repair vs Replace Decision Engine */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Repair vs. Replace Mathematical Evaluation Index (Section 29 & 30)
            </h3>
            <p className="text-xs text-slate-400">
              Comparing a 10-year-old crane with ₹30L annual repairs against a new machine with ₹35L annual ownership costs:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl bg-slate-950 p-4 border border-red-900/60 space-y-2">
                <span className="font-bold text-red-300 block">Old Machine Hidden Cost Drain:</span>
                <ul className="text-slate-300 space-y-1 list-disc pl-4 text-[11px]">
                  <li>Frequent breakdowns (Availability drops to 72%)</li>
                  <li>Higher diesel burn (+18% fuel inefficiency)</li>
                  <li>Spare part obsolescence & long lead times</li>
                  <li>Third-party safety certification rejections</li>
                  <li>Girder erection critical path delay risks</li>
                </ul>
              </div>

              <div className="rounded-xl bg-slate-950 p-4 border border-emerald-900/60 space-y-2">
                <span className="font-bold text-emerald-300 block">New Asset Economic Advantage:</span>
                <ul className="text-slate-300 space-y-1 list-disc pl-4 text-[11px]">
                  <li>95% Mechanical Availability & high MTBF</li>
                  <li>OEM warranty & scheduled PM package</li>
                  <li>Advanced LMI anti-two-block sensor safety</li>
                  <li>Lower specific fuel consumption per tonne</li>
                  <li>Higher residual resale value after project completion</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: HEAD P&M CONTROL SCORECARD (Section 33 & 34) */}
      {activeTab === 'scorecard' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Bridge P&M Traffic-Light Health Matrix (Section 33)
            </h3>
            <p className="text-xs text-slate-400">
              GREEN: All targets met • AMBER: One KPI out of norm • RED: Multiple KPI failures requiring intervention:
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 bg-slate-950">
                  <th className="p-3">Asset & Model</th>
                  <th className="p-3">Availability</th>
                  <th className="p-3">Utilization</th>
                  <th className="p-3">Productive %</th>
                  <th className="p-3">Output/Day</th>
                  <th className="p-3">Fuel (L/hr | Unit)</th>
                  <th className="p-3">MTBF / MTTR</th>
                  <th className="p-3">Budget Var.</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[11px]">
                <tr className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-white">MAIT HR260 Piling Rig (PR-01)</td>
                  <td className="p-3 text-emerald-400 font-bold">92%</td>
                  <td className="p-3 text-amber-400">84%</td>
                  <td className="p-3 text-amber-400 font-bold">76%</td>
                  <td className="p-3 text-white">68 m/day</td>
                  <td className="p-3 text-amber-400">19 L/h | 0.28 L/m</td>
                  <td className="p-3 text-slate-300">185h / 9h</td>
                  <td className="p-3 text-red-400">+6%</td>
                  <td className="p-3">
                    <span className="rounded bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 font-bold text-[10px]">
                      AMBER
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-white">Kobelco CKE2500 250T Crane (CR-250)</td>
                  <td className="p-3 text-emerald-400 font-bold">94%</td>
                  <td className="p-3 text-emerald-400">82%</td>
                  <td className="p-3 text-emerald-400 font-bold">78%</td>
                  <td className="p-3 text-white">6.2 lifts/day</td>
                  <td className="p-3 text-emerald-400">24 L/h | 0.38 L/T</td>
                  <td className="p-3 text-slate-300">240h / 6h</td>
                  <td className="p-3 text-emerald-400">-2%</td>
                  <td className="p-3">
                    <span className="rounded bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 font-bold text-[10px]">
                      GREEN
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-white">SLG-50 Launching Girder (SLG-01)</td>
                  <td className="p-3 text-emerald-400 font-bold">91%</td>
                  <td className="p-3 text-amber-400">75%</td>
                  <td className="p-3 text-amber-400 font-bold">70%</td>
                  <td className="p-3 text-white">0.25 span/day</td>
                  <td className="p-3 text-emerald-400">22 L/h | 920 L/sp</td>
                  <td className="p-3 text-slate-300">190h / 12h</td>
                  <td className="p-3 text-emerald-400">-1%</td>
                  <td className="p-3">
                    <span className="rounded bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 font-bold text-[10px]">
                      GREEN
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-white">CAT 572R Side Boom (PL-01)</td>
                  <td className="p-3 text-emerald-400 font-bold">95%</td>
                  <td className="p-3 text-emerald-400">88%</td>
                  <td className="p-3 text-emerald-400 font-bold">82%</td>
                  <td className="p-3 text-white">18 pipe/day</td>
                  <td className="p-3 text-emerald-400">21 L/h | 11.2 L/p</td>
                  <td className="p-3 text-slate-300">310h / 5h</td>
                  <td className="p-3 text-emerald-400">-4%</td>
                  <td className="p-3">
                    <span className="rounded bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 font-bold text-[10px]">
                      GREEN
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Six Golden Formulas Summary Box (Section 34) */}
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-slate-900 to-slate-950 p-6 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
              The Six Golden P&M Formulas (Section 34)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">1. Availability %</span>
                <span className="text-white font-bold">Available ÷ Planned × 100</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">2. Utilization %</span>
                <span className="text-white font-bold">Utilized ÷ Available × 100</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">3. Productivity</span>
                <span className="text-white font-bold">Output ÷ Productive Hours</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">4. Fuel Efficiency</span>
                <span className="text-white font-bold">Fuel ÷ Output (L/unit)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">5. Hourly Cost</span>
                <span className="text-white font-bold">Total Cost ÷ Productive Hours</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">6. Unit Cost</span>
                <span className="text-white font-bold">Total Cost ÷ Total Production</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
