import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Wrench,
  Gauge,
  Layers,
  Thermometer,
  Zap,
  Printer,
  RefreshCw,
  FileCheck,
  Volume2,
  Square,
  Mic,
  MicOff,
  Headphones,
  Speaker,
} from 'lucide-react';
import { Equipment } from '../types';
import { voiceAgent, VoiceState } from '../utils/voiceAgent';

interface TechnicalDiagnosticViewProps {
  equipmentList: Equipment[];
  initialQuery?: string;
  initialEquipmentId?: string;
}

export const TechnicalDiagnosticView: React.FC<TechnicalDiagnosticViewProps> = ({
  equipmentList,
  initialQuery = '',
  initialEquipmentId,
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>(voiceAgent.getState());

  useEffect(() => {
    const unsub = voiceAgent.subscribe((state) => {
      setVoiceState(state);
    });
    return () => unsub();
  }, []);
  // Input fields (Section 5)
  const [selectedEqId, setSelectedEqId] = useState(initialEquipmentId || 'EX-01');
  const [make, setMake] = useState('Tata Hitachi');
  const [model, setModel] = useState('EX210LC Super+');
  const [hmr, setHmr] = useState(4850);
  const [complaint, setComplaint] = useState(
    initialQuery || 'Main hydraulic relief valve sluggish – low arm crowd force and bucket stall under load.'
  );
  const [symptoms, setSymptoms] = useState(
    'Hydraulic cycle time slowed by 40%. Arm crowding stalls at 190 bar instead of 345 bar. Engine bogs down to 1650 RPM.'
  );
  const [errorCode, setErrorCode] = useState('ERR-HYD-REL-04');
  const [operatingCondition, setOperatingCondition] = useState('High dust rocky excavation on hill cut');
  const [loadCondition, setLoadCondition] = useState('Heavy digging / Rock breaker cycle');
  const [ambientTemp, setAmbientTemp] = useState('36°C');
  const [oilPressure, setOilPressure] = useState('3.8 bar @ high idle');
  const [coolantTemp, setCoolantTemp] = useState('88°C');
  const [hydraulicPressure, setHydraulicPressure] = useState('190 bar (rated 345 bar)');
  const [fuelConsumption, setFuelConsumption] = useState('19.2 L/hr (elevated vs 16.5 L/hr benchmark)');
  const [recentRepair, setRecentRepair] = useState('Boom cylinder repacked 180 hours ago');
  const [recentPM, setRecentPM] = useState('250H PM service completed on 2026-10-12');
  const [operatorObservation, setOperatorObservation] = useState(
    'Whining noise heard from main control valve chest when crowding arm against rock.'
  );

  // Diagnostic State
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [engineSource, setEngineSource] = useState<string | null>(null);

  // When initialQuery changes, update complaint
  useEffect(() => {
    if (initialQuery) {
      setComplaint(initialQuery);
      if (initialEquipmentId) {
        setSelectedEqId(initialEquipmentId);
      }
    }
  }, [initialQuery, initialEquipmentId]);

  // Sync make & model when equipment selection changes with deep Indian infrastructure defaults
  const handleEquipmentChange = (id: string) => {
    setSelectedEqId(id);
    const eq = equipmentList.find((e) => e.equipmentId === id);
    if (eq) {
      setMake(eq.make);
      setModel(eq.model);
      setHmr(eq.hmr);
      if (id === 'TBM-01') {
        setComplaint('Cutterhead torque overload exceeding 1200 kNm; foam injection line backpressure spike.');
        setSymptoms('Cutterhead rotation speed stalling under mixed face quartzite; foam expansion ratio fluctuating below FER 8; chamber pressure 2.4 bar.');
        setErrorCode('TBM-TORQUE-OVR-92');
        setHydraulicPressure('350 bar (cutterhead drive)');
        setOilPressure('4.5 bar (lube oil circuit)');
        setCoolantTemp('72°C');
        setOperatingCondition('Delhi Metro underground tunnel package; mixed rock-soil face with high silica');
        setLoadCondition('Full thrust advance 45 mm/min');
        setRecentRepair('Cutterhead disc cutters #12 & #14 replaced 85 hours ago');
        setRecentPM('Daily 24H cutterhead inspection and tail seal grease audit done');
        setOperatorObservation('High metallic scraping acoustic resonance from gauge cutters; foam injection port #3 blocked');
      } else if (id === 'SLG-01') {
        setComplaint('Twin 75-ton hoist winch differential brake slip during precast U-girder erection over live roadway.');
        setSymptoms('Hoist drum #2 lags hoist drum #1 by 140mm during dual tandem lift; hydraulic pressure drop on holding brake release circuit.');
        setErrorCode('SLG-HOIST-SYNC-03');
        setHydraulicPressure('280 bar (rated 320 bar)');
        setOilPressure('3.8 bar');
        setCoolantTemp('65°C');
        setOperatingCondition('Elevated metro viaduct pier #142 to #143; wind speed 9.5 m/s');
        setLoadCondition('Lifting 165T precast prestressed concrete U-girder');
        setRecentRepair('Hydraulic proportional hoist control valve serviced 120 hours ago');
        setRecentPM('Weekly structural bolt torque and load cell calibration completed');
        setOperatorObservation('Audible brake shudder on auxiliary winch drum when stopping descent at 12m height');
      } else if (id === 'PL-01') {
        setComplaint('Hydraulic side boom winch slip under 24-ton 36-inch mainline pipe section lowering.');
        setSymptoms('Boom hoist cylinder creeping downward 35mm/min; winch brake band slipping under dynamic swing; counterweight cylinder sluggish.');
        setErrorCode('ERR-PIPE-WINCH-07');
        setHydraulicPressure('210 bar (rated 250 bar)');
        setOilPressure('4.1 bar');
        setCoolantTemp('86°C');
        setOperatingCondition('Cross-country pipeline trenching corridor; 18 degree side slope rocky terrain');
        setLoadCondition('Lowering-in 18m length coated API 5L X70 steel pipe');
        setRecentRepair('Winch wet brake friction discs renewed 300 hours ago');
        setRecentPM('250H PM service done 40 hours ago');
        setOperatorObservation('Creeping sensation on hoist lever; hydraulic oil odor near main winch motor casing');
      } else if (id === 'HDD-01') {
        setComplaint('Pullback thrust pressure spiking to 1800 psi accompanied by total mud return circulation loss.');
        setSymptoms('Thrust drive motor laboring; bentonite mud flow dropping from 1200 LPM to 240 LPM; drill string rotational torque exceeding 36,000 Nm.');
        setErrorCode('HDD-PULLBACK-PRES-88');
        setHydraulicPressure('1800 psi thrust (high alarm)');
        setOilPressure('3.9 bar');
        setCoolantTemp('91°C');
        setOperatingCondition('Major river crossing HDD pilot reaming; cobble and silt interface at 22m depth');
        setLoadCondition('Pulling 42-inch barrel reamer with 36-inch product carrier bundle');
        setRecentRepair('Mud pump fluid end ceramic liners replaced 95 hours ago');
        setRecentPM('500H PM service performed');
        setOperatorObservation('Mud returns ceased in exit pit; drill rig carriage shaking during pullback cycle');
      } else if (id === 'CR-250') {
        setComplaint('Load Moment Indicator (LMI) anti-two-block sensor tripping erratically on barge pontoon.');
        setSymptoms('Crane computer cuts boom hoist motion despite load being within 68% SWL radius; pontoon wave action causing LMI boom angle fluctuation.');
        setErrorCode('LMI-TRIP-B71');
        setHydraulicPressure('310 bar');
        setOilPressure('4.2 bar');
        setCoolantTemp('84°C');
        setOperatingCondition('River bridge pier foundation well sinking; crane anchored on floating modular barge pontoon');
        setLoadCondition('Handling 45T vibro-hammer and 2.5m casing pipe over water');
        setRecentRepair('LMI boom angle transducer re-cabled 60 hours ago');
        setRecentPM('Monthly statutory third-party crane safety inspection completed');
        setOperatorObservation('LMI display flickers error code when barge list angle crosses 1.2 degrees');
      } else if (id === 'PV-01') {
        setComplaint('Sensor paver electric screed heating failure on left tamper bar causing surface tear and bitumen dragging.');
        setSymptoms('Left screed temperature reading 112°C while right screed reaches 165°C; Niveltronic 3D ski grade sensor hunting vertically.');
        setErrorCode('SCREED-HEAT-FLT-02');
        setHydraulicPressure('210 bar');
        setOilPressure('3.7 bar');
        setCoolantTemp('89°C');
        setOperatingCondition('NHAI 8-lane expressway 40mm Stone Matrix Asphalt (SMA) wearing course laydown');
        setLoadCondition('Continuous paving 9.5m width at 2.8 m/min');
        setRecentRepair('Tamper bar drive eccentric bearings greased 35 hours ago');
        setRecentPM('250H PM service done');
        setOperatorObservation('Bituminous mat behind left screed plate shows rough texture and aggregate pulling');
      } else if (id === 'ML-01') {
        setComplaint('Milling drum cutter stalling in high-depth asphalt cut; excessive carbide tool pick consumption.');
        setSymptoms('Drum drive clutch slips at 80mm milling depth; water spray dust suppression pressure dropped below 1.5 bar; conveyor belt chattering.');
        setErrorCode('MILL-DRUM-STALL-19');
        setHydraulicPressure('240 bar');
        setOilPressure('4.0 bar');
        setCoolantTemp('94°C');
        setOperatingCondition('Highway pavement rehabilitation; profile correction of deformed bituminous layers');
        setLoadCondition('Full width milling 1000mm at 75mm depth');
        setRecentRepair('Conveyor primary belt tensioned 110 hours ago');
        setRecentPM('Daily carbide pick inspection done');
        setOperatorObservation('Sparks emitted from drum chamber; heavy engine droop when engaging milling drum');
      } else if (id === 'EX-01') {
        setComplaint('Hydraulic system pressure dropping to 190 bar under boom crowd stall.');
        setSymptoms('Slow cycle times; cylinder drifting under heavy rock load; engine bogs down to 1650 RPM.');
        setErrorCode('ERR-HYD-REL-04');
        setHydraulicPressure('190 bar (rated 345 bar)');
        setOilPressure('3.8 bar @ high idle');
        setCoolantTemp('88°C');
        setOperatingCondition('High dust rocky excavation on hill cut');
        setLoadCondition('Heavy digging / Rock breaker cycle');
        setRecentRepair('Boom cylinder repacked 180 hours ago');
        setRecentPM('250H PM service completed on 2026-10-12');
        setOperatorObservation('Whining noise heard from main control valve chest when crowding arm against rock.');
      } else if (id === 'HMP-01') {
        setComplaint('Burner flame failure safety lock tripping repeatedly after 3 minutes of ignition.');
        setSymptoms('Burner flame goes out, temperature drops below 140°C in dryer drum; baghouse differential pressure 145 mm WC.');
        setErrorCode('F-FLAME-TRIP');
        setHydraulicPressure('N/A');
        setOilPressure('4.2 bar (fuel feed)');
        setCoolantTemp('82°C');
        setOperatingCondition('High moisture aggregate drying cycle (4.8% moisture)');
        setLoadCondition('Continuous 160 TPH Hot Mix production');
        setRecentRepair('Burner nozzle cleaned 48 hours ago');
        setRecentPM('Monthly baghouse pulse jet valve inspection');
        setOperatorObservation('Photocell flame sensor lens coated with soot residue');
      } else if (id === 'DZ-01') {
        setComplaint('Left final drive overheating and grinding sound in reverse.');
        setSymptoms('Sprocket hub temperature > 95°C; metallic residue in drain plug magnet.');
        setErrorCode('WARN-FD-TEMP');
        setHydraulicPressure('320 bar');
        setOilPressure('4.0 bar');
        setCoolantTemp('90°C');
        setOperatingCondition('Rock fill spreading and bench push');
        setLoadCondition('Heavy blade load against hard basalt rock');
        setRecentRepair('Track tension adjusted 70 hours ago');
        setRecentPM('500H PM service completed');
        setOperatorObservation('Distinct clunking sound on left final drive planet carrier when turning under load');
      } else {
        setComplaint(`Operational irregularity reported on ${eq.model}`);
        setSymptoms('Abnormal parameter fluctuations under load.');
        setErrorCode('None');
      }
    }
  };

  // Run AI Technical Diagnosis
  const runDiagnostic = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setDiagnosticResult(null);

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment: `${selectedEqId} (${make} ${model})`,
          make,
          model,
          hmr,
          complaint,
          symptoms,
          errorCode,
          operatingCondition,
          loadCondition,
          ambientTemp,
          oilPressure,
          coolantTemp,
          hydraulicPressure,
          fuelConsumption,
          recentRepair,
          recentPM,
          operatorObservation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Diagnostic server error');
      }

      setDiagnosticResult(data.diagnosis);
      setEngineSource(data.source || 'gemini-3.8-flash');
    } catch (err: any) {
      console.error('Diagnosis failed:', err);
      setErrorMsg(
        err?.message ||
          'Insufficient technical evidence. Please provide equipment model, HMR, symptoms, error code, recent repair history and operating conditions.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-black uppercase text-amber-400 border border-amber-500/30">
              Module 05 • AI Diagnostic Assistant
            </span>
            <span className="text-xs text-slate-400">Strict P&M Engineering Standards</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Technical Diagnostic Assistant
          </h1>
          <p className="text-xs text-slate-400">
            Automated troubleshooting, cause ranking, pressure & voltage measurement ports, and safety LOTO protocols
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {diagnosticResult && (
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Diagnostic Sheet</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left = Technical Inputs, Right = AI Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* INPUTS PANEL (5 Columns) */}
        <div className="lg:col-span-5 space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Wrench className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Field Evidence & Symptoms Input
              </h2>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">15 Diagnostic Fields</span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Equipment Select */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Target Machinery / Asset
              </label>
              <select
                value={selectedEqId}
                onChange={(e) => handleEquipmentChange(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-medium focus:border-amber-500 focus:outline-none"
              >
                {equipmentList.map((eq) => (
                  <option key={eq.equipmentId} value={eq.equipmentId}>
                    {eq.equipmentId} – {eq.make} {eq.model} ({eq.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Make / Model / HMR row */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">Make</label>
                <input
                  type="text"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">Model</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">HMR / KM</label>
                <input
                  type="number"
                  value={hmr}
                  onChange={(e) => setHmr(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            {/* Operator Complaint with Voice Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold block">
                  Primary Operator Complaint <span className="text-amber-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (voiceState.isListening) {
                      voiceAgent.stopListening();
                    } else {
                      voiceAgent.startListening((text) => setComplaint(text));
                    }
                  }}
                  className={`flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
                    voiceState.isListening
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30'
                  }`}
                  title="Speak complaint with microphone"
                >
                  {voiceState.isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                  <span>{voiceState.isListening ? 'Listening...' : 'Speak Complaint'}</span>
                </button>
              </div>
              <textarea
                rows={2}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="What did the operator observe or report? (Type or click Speak Complaint)"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Detailed Symptoms & Error Code */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">Error Code / DTC</label>
                <input
                  type="text"
                  value={errorCode}
                  onChange={(e) => setErrorCode(e.target.value)}
                  placeholder="e.g. ERR-HYD-REL-04"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-amber-300 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">Load Condition</label>
                <input
                  type="text"
                  value={loadCondition}
                  onChange={(e) => setLoadCondition(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white"
                />
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Observed Physical Symptoms
              </label>
              <textarea
                rows={2}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Pressure loss, smoke, vibration, sound, sluggishness..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Telemetry & Field Measurements */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                Recorded Field Parameters
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Hydraulic Pressure</span>
                  <input
                    type="text"
                    value={hydraulicPressure}
                    onChange={(e) => setHydraulicPressure(e.target.value)}
                    className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <span className="text-slate-500 block">Engine Oil Pressure</span>
                  <input
                    type="text"
                    value={oilPressure}
                    onChange={(e) => setOilPressure(e.target.value)}
                    className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <span className="text-slate-500 block">Coolant Temperature</span>
                  <input
                    type="text"
                    value={coolantTemp}
                    onChange={(e) => setCoolantTemp(e.target.value)}
                    className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <span className="text-slate-500 block">Ambient Temp</span>
                  <input
                    type="text"
                    value={ambientTemp}
                    onChange={(e) => setAmbientTemp(e.target.value)}
                    className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Maintenance History Context */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <label className="text-slate-400 block mb-1">Recent Repair History</label>
                <input
                  type="text"
                  value={recentRepair}
                  onChange={(e) => setRecentRepair(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-slate-300"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Recent PM Done</label>
                <input
                  type="text"
                  value={recentPM}
                  onChange={(e) => setRecentPM(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-slate-300"
                />
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={runDiagnostic}
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin stroke-[2.5]" />
                  <span>ANALYZING WITH PLANT & MACHINERY AI ENGINE...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 stroke-[2.5]" />
                  <span>GENERATE TECHNICAL DIAGNOSIS</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* OUTPUT PANEL (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          {errorMsg && (
            <div className="rounded-xl border border-red-800 bg-red-950/60 p-4 text-red-200 text-xs flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-300">Diagnostic Halt</h4>
                <p className="mt-1">{errorMsg}</p>
              </div>
            </div>
          )}

          {!diagnosticResult && !isLoading && !errorMsg && (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500">
              <Wrench className="h-12 w-12 mx-auto text-slate-600 mb-3" />
              <h3 className="text-sm font-bold text-slate-300">
                Awaiting Machinery Evidence
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Fill the field parameters on the left and click &ldquo;Generate Technical Diagnosis&rdquo; to produce the full 10-point engineering assessment.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-300 space-y-4">
              <div className="relative mx-auto h-12 w-12">
                <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Plant & Machinery AI Reasoning in Progress
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Cross-referencing hydraulic schematics, Cummins/Komatsu OEM shop manuals, and Indian site operating conditions...
                </p>
              </div>
            </div>
          )}

          {diagnosticResult && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Header Badge */}
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
                <div className="flex items-center space-x-2">
                  <span className="rounded bg-amber-500 text-slate-950 px-2 py-0.5 text-[10px] font-black uppercase">
                    Formal Diagnosis
                  </span>
                  <span className="text-xs font-semibold text-slate-300">
                    Engine: <strong className="text-amber-400 font-mono">{engineSource}</strong>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Audio Output Mode Toggle (Normal Speaker vs Headphone) */}
                  <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px]">
                    <button
                      onClick={() => voiceAgent.setAudioOutputMode('speaker')}
                      className={`flex items-center space-x-1 px-2 py-1 rounded font-semibold transition-all cursor-pointer ${
                        voiceState.audioOutputMode === 'speaker'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Normal Speaking Mode (No Headphone Required) - Loudspeaker Gents Voice for noisy field sites"
                    >
                      <Speaker className="h-3 w-3" />
                      <span>Normal Speaking Mode</span>
                    </button>
                    <button
                      onClick={() => voiceAgent.setAudioOutputMode('headphone')}
                      className={`flex items-center space-x-1 px-2 py-1 rounded font-semibold transition-all cursor-pointer ${
                        voiceState.audioOutputMode === 'headphone'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Headphone Mode - Studio Crisp Gents Voice for earphones and headsets"
                    >
                      <Headphones className="h-3 w-3" />
                      <span>Headphone</span>
                    </button>
                  </div>

                  {/* Listen to Spoken Diagnosis CTA */}
                  {voiceState.isPlaying ? (
                    <button
                      onClick={() => voiceAgent.stop()}
                      className="flex items-center space-x-1.5 rounded-lg bg-red-950 border border-red-800 px-3 py-1 text-xs font-bold text-red-300 hover:bg-red-900 transition-colors"
                    >
                      <Square className="h-3 w-3 fill-current" />
                      <span>Stop Voice</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const spokenText = `Technical diagnostic briefing for ${make} ${model}. Problem identified: ${diagnosticResult.problemSummary}. Most probable cause: ${diagnosticResult.probableCauses?.[0]?.cause || 'Under investigation'}. Immediate field action: ${diagnosticResult.immediateAction}. Corrective action: ${diagnosticResult.correctiveAction}. Safety reminder: Always apply Lockout Tagout before opening access panels.`;
                        voiceAgent.speak(spokenText);
                      }}
                      className="flex items-center space-x-1.5 rounded-lg bg-amber-500 text-slate-950 px-3 py-1 text-xs font-bold shadow-md shadow-amber-500/20 hover:bg-amber-400 transition-all cursor-pointer"
                    >
                      <Volume2 className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>Listen to Voice ({voiceState.audioOutputMode === 'speaker' ? 'Normal Speaker' : 'Headphones'} Gents)</span>
                    </button>
                  )}

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                      diagnosticResult.confidenceLevel === 'High'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : diagnosticResult.confidenceLevel === 'Medium'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-red-950 text-red-300 border-red-800'
                    }`}
                  >
                    {diagnosticResult.confidenceLevel} Confidence
                  </span>
                </div>
              </div>

              {/* A. Problem Summary */}
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center">
                  <span className="mr-1.5 font-mono text-sm">A.</span> Problem Summary
                </h3>
                <p className="mt-1.5 text-xs font-medium text-slate-200 leading-relaxed">
                  {diagnosticResult.problemSummary}
                </p>
              </div>

              {/* B. Probable Causes (Ranked) */}
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="mr-1.5 font-mono text-sm">B.</span> Probable Causes (Ranked by Likelihood)
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Distinguishing Confirmed vs Likely vs Possible
                  </span>
                </h3>

                <div className="space-y-2.5">
                  {diagnosticResult.probableCauses?.map((pc: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold font-mono">
                            #{pc.rank || idx + 1}
                          </span>
                          <span className="text-xs font-bold text-white">{pc.cause}</span>
                        </div>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            pc.likelihood === 'Confirmed information'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : pc.likelihood === 'Likely cause'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : pc.likelihood === 'Possible cause'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : 'bg-purple-950 text-purple-300 border border-purple-800'
                          }`}
                        >
                          {pc.likelihood}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">
                        {pc.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* C. Step-by-Step Diagnostic Procedure */}
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center">
                  <span className="mr-1.5 font-mono text-sm">C.</span> Step-by-Step Diagnostic Procedure
                </h3>
                <div className="space-y-1.5 mt-2">
                  {diagnosticResult.diagnosticProcedure?.map((step: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-2.5 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80"
                    >
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-slate-800 text-[10px] font-mono text-amber-400 font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* D. Required Measurements & Test Ports */}
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center">
                  <span className="mr-1.5 font-mono text-sm">D.</span> Required Measurements & Nominal Values
                </h3>
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950">
                        <th className="p-2">Parameter</th>
                        <th className="p-2">Nominal OEM Specification</th>
                        <th className="p-2">Test Port / Measurement Point</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {diagnosticResult.requiredMeasurements?.map((m: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-950/40">
                          <td className="p-2 font-semibold text-slate-200">{m.parameter}</td>
                          <td className="p-2 text-amber-400">{m.nominalRange}</td>
                          <td className="p-2 text-slate-400">{m.testPort}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* E & F: Required Tools and Spares */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tools */}
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center">
                    <span className="mr-1.5 font-mono text-sm">E.</span> Required Diagnostic Tools
                  </h3>
                  <ul className="mt-2 space-y-1 text-xs text-slate-300">
                    {diagnosticResult.requiredTools?.map((tool: string, idx: number) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        <span>{tool}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Spares */}
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center">
                    <span className="mr-1.5 font-mono text-sm">F.</span> Required Spare Parts
                  </h3>
                  <div className="mt-2 space-y-1.5 text-xs">
                    {diagnosticResult.requiredSpareParts?.map((sp: any, idx: number) => (
                      <div key={idx} className="rounded bg-slate-950 p-2 border border-slate-800">
                        <div className="flex justify-between font-medium text-white">
                          <span>{sp.partName}</span>
                          <span className="font-mono text-cyan-400">{sp.partNumber}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Status: {sp.estimatedAvailability}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* G & H: Immediate Action & Corrective Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-amber-900/60 bg-amber-950/20 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center">
                    <span className="mr-1.5 font-mono text-sm">G.</span> Immediate Action
                  </h3>
                  <p className="mt-1.5 text-xs text-amber-100 leading-relaxed">
                    {diagnosticResult.immediateAction}
                  </p>
                </div>

                <div className="rounded-xl border border-blue-900/60 bg-blue-950/20 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center">
                    <span className="mr-1.5 font-mono text-sm">H.</span> Corrective Action
                  </h3>
                  <p className="mt-1.5 text-xs text-blue-100 leading-relaxed">
                    {diagnosticResult.correctiveAction}
                  </p>
                </div>
              </div>

              {/* I. Safety Precautions (Zero Bypass Rule - Section 25) */}
              <div className="rounded-xl border border-red-900/80 bg-red-950/30 p-4 space-y-2">
                <div className="flex items-center space-x-2 text-red-400">
                  <ShieldAlert className="h-4 w-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    I. Mandatory Safety Precautions & LOTO
                  </h3>
                </div>
                <div className="space-y-1 mt-1 text-xs text-red-200">
                  {diagnosticResult.safetyPrecautions?.map((safe: string, idx: number) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <span className="text-red-400 font-bold">•</span>
                      <span>{safe}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-red-900/40 text-[10px] text-red-300/80 italic">
                  Plant & Machinery Policy: Never bypass safety interlocks or perform unsafe electrical checks. Always apply Lockout/Tagout.
                </div>
              </div>

              {/* J. Final Recommendation */}
              <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center">
                  <span className="mr-1.5 font-mono text-sm">J.</span> Final Engineering Recommendation
                </h3>
                <p className="mt-1.5 text-xs font-semibold text-emerald-100 leading-relaxed">
                  {diagnosticResult.finalRecommendation}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
