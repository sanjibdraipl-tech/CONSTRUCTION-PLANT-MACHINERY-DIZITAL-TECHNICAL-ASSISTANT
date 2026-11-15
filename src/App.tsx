import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { KpiFormulaModal } from './components/KpiFormulaModal';
import { VoiceAgentModal } from './components/VoiceAgentModal';
import { FloatingVoiceTrigger } from './components/FloatingVoiceTrigger';

import { DashboardView } from './views/DashboardView';
import { EquipmentMasterView } from './views/EquipmentMasterView';
import { EquipmentStatusView } from './views/EquipmentStatusView';
import { TechnicalDiagnosticView } from './views/TechnicalDiagnosticView';
import { PreventiveMaintenanceView } from './views/PreventiveMaintenanceView';
import { BreakdownManagementView } from './views/BreakdownManagementView';
import { RcaView } from './views/RcaView';
import { SparePartsView } from './views/SparePartsView';
import { FuelManagementView } from './views/FuelManagementView';
import { CostingView } from './views/CostingView';
import { ProductivityView } from './views/ProductivityView';
import { KpiDashboardView } from './views/KpiDashboardView';
import { DailyPlantReportView } from './views/DailyPlantReportView';
import { MonthlyReportView } from './views/MonthlyReportView';
import { DocumentsView } from './views/DocumentsView';
import { AiChatView } from './views/AiChatView';
import { JobCardInspectionView } from './views/JobCardInspectionView';
import { TyreBatteryView } from './views/TyreBatteryView';
import { SettingsView } from './views/SettingsView';
import { BridgePmControlView } from './views/BridgePmControlView';

import {
  Equipment,
  BreakdownRecord,
  PmRecord,
  SparePart,
  FuelEntry,
  RcaRecord,
  JobCard,
  DailyInspection,
  DocumentItem,
  KpiMetric,
  UserRole,
  EquipmentStatus,
  BreakdownStage,
} from './types';

import {
  INITIAL_EQUIPMENT,
  INITIAL_BREAKDOWNS,
  INITIAL_PM_RECORDS,
  INITIAL_SPARE_PARTS,
  INITIAL_FUEL_ENTRIES,
  INITIAL_RCA_RECORDS,
  INITIAL_JOB_CARDS,
  INITIAL_DAILY_INSPECTIONS,
  INITIAL_TYRE_RECORDS,
  INITIAL_BATTERY_RECORDS,
  INITIAL_DOCUMENTS,
  INITIAL_KPIS,
  PROJECTS,
  SITES,
} from './data/mockData';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Global Filters & Context
  const [selectedProject, setSelectedProject] = useState<string>('ALL');
  const [selectedSite, setSelectedSite] = useState<string>('ALL');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('ALL');
  const [currentRole, setCurrentRole] = useState<UserRole>('Head P&M');

  // Master Data State
  const [equipment, setEquipment] = useState<Equipment[]>(INITIAL_EQUIPMENT);
  const [breakdowns, setBreakdowns] = useState<BreakdownRecord[]>(INITIAL_BREAKDOWNS);
  const [pmRecords, setPmRecords] = useState<PmRecord[]>(INITIAL_PM_RECORDS);
  const [spares, setSpares] = useState<SparePart[]>(INITIAL_SPARE_PARTS);
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>(INITIAL_FUEL_ENTRIES);
  const [rcas, setRcas] = useState<RcaRecord[]>(INITIAL_RCA_RECORDS);
  const [jobCards, setJobCards] = useState<JobCard[]>(INITIAL_JOB_CARDS);
  const [inspections, setInspections] = useState<DailyInspection[]>(INITIAL_DAILY_INSPECTIONS);
  const [tyreRecords, setTyreRecords] = useState(INITIAL_TYRE_RECORDS);
  const [batteryRecords, setBatteryRecords] = useState(INITIAL_BATTERY_RECORDS);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [kpis, setKpis] = useState<KpiMetric[]>(INITIAL_KPIS);

  // Modals & Transient States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVoiceAgentOpen, setIsVoiceAgentOpen] = useState(false);
  const [activeFormulaKpi, setActiveFormulaKpi] = useState<KpiMetric | null>(null);
  const [diagnosticInitialQuery, setDiagnosticInitialQuery] = useState('');
  const [diagnosticInitialEqId, setDiagnosticInitialEqId] = useState('');

  // Keyboard shortcut for Global Search ('/' or 'Cmd+K')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.metaKey && e.key === 'k')) && !isSearchOpen) {
        const activeElem = document.activeElement;
        const isInput = activeElem?.tagName === 'INPUT' || activeElem?.tagName === 'TEXTAREA';
        if (!isInput) {
          e.preventDefault();
          setIsSearchOpen(true);
        }
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Handlers
  const handleOpenDiagnosticWithQuery = (query: string, eqId?: string) => {
    setDiagnosticInitialQuery(query);
    if (eqId) setDiagnosticInitialEqId(eqId);
    setCurrentView('diagnostic');
  };

  const handleUpdateEquipmentStatus = (eqId: string, status: EquipmentStatus) => {
    setEquipment((prev) =>
      prev.map((e) => (e.equipmentId === eqId ? { ...e, currentStatus: status } : e))
    );
  };

  const handleAddEquipment = (newAsset: Equipment) => {
    setEquipment((prev) => [newAsset, ...prev]);
  };

  const handleAdvanceBreakdownStage = (bdId: string, nextStage: BreakdownStage) => {
    setBreakdowns((prev) =>
      prev.map((bd) =>
        bd.id === bdId
          ? {
              ...bd,
              stage: nextStage,
              finalStatus: nextStage === 'Closed' ? 'Closed' : 'Open',
            }
          : bd
      )
    );
  };

  const handleAddBreakdown = (newBd: BreakdownRecord) => {
    setBreakdowns((prev) => [newBd, ...prev]);
    // also update equipment status to Breakdown
    handleUpdateEquipmentStatus(newBd.equipmentId, 'Breakdown');
  };

  const handleCompletePm = (pmId: string, engineer: string) => {
    setPmRecords((prev) =>
      prev.map((p) =>
        p.id === pmId
          ? {
              ...p,
              status: 'Completed',
              lastCompletedDate: new Date().toISOString().slice(0, 10),
              technicianAssigned: engineer,
              checklistItems: p.checklistItems.map((c) => ({ ...c, done: true })),
            }
          : p
      )
    );
  };

  const handleTogglePmChecklistItem = (pmId: string, idx: number) => {
    setPmRecords((prev) =>
      prev.map((p) =>
        p.id === pmId
          ? {
              ...p,
              checklistItems: p.checklistItems.map((item, i) =>
                i === idx ? { ...item, done: !item.done } : item
              ),
            }
          : p
      )
    );
  };

  const handleAddFuelEntry = (entry: FuelEntry) => {
    setFuelEntries((prev) => [entry, ...prev]);
  };

  const handleAddRca = (newRca: RcaRecord) => {
    setRcas((prev) => [newRca, ...prev]);
  };

  const handleUploadDocument = (newDoc: DocumentItem) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleResetDemoData = () => {
    setEquipment(INITIAL_EQUIPMENT);
    setBreakdowns(INITIAL_BREAKDOWNS);
    setPmRecords(INITIAL_PM_RECORDS);
    setSpares(INITIAL_SPARE_PARTS);
    setFuelEntries(INITIAL_FUEL_ENTRIES);
    setRcas(INITIAL_RCA_RECORDS);
    setDocuments(INITIAL_DOCUMENTS);
    alert('Demo dataset refreshed to initial standard Indian infrastructure records.');
  };

  const handleSelectSearchResult = (type: string, id: string) => {
    if (type === 'equipment') {
      setSelectedEquipmentId(id);
      setCurrentView('equipment-master');
    } else if (type === 'breakdown') {
      setCurrentView('breakdown');
    } else if (type === 'spares') {
      setCurrentView('spares');
    } else if (type === 'rca') {
      setCurrentView('rca');
    } else if (type === 'documents') {
      setCurrentView('documents');
    }
  };

  // Critical alerts count
  const criticalCount =
    breakdowns.filter((b) => b.finalStatus === 'Open').length +
    pmRecords.filter((p) => p.status === 'Overdue').length +
    fuelEntries.filter((f) => f.alertType && f.alertType !== 'Normal').length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 antialiased">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={(v) => {
          if (v === 'ai-voice') {
            setIsVoiceAgentOpen(true);
          } else {
            setCurrentView(v);
          }
        }}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        breakdownCount={breakdowns.filter((b) => b.finalStatus === 'Open').length}
        overduePmCount={pmRecords.filter((p) => p.status === 'Overdue').length}
      />

      {/* Main Column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TopBar */}
        <TopBar
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedSite={selectedSite}
          setSelectedSite={setSelectedSite}
          selectedEquipmentId={selectedEquipmentId}
          setSelectedEquipmentId={setSelectedEquipmentId}
          equipmentList={equipment.map((e) => ({
            id: e.equipmentId,
            model: e.model,
            make: e.make,
          }))}
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAiDiagnostic={() => {
            setDiagnosticInitialQuery('General hydraulic and powertrain diagnostics');
            setCurrentView('diagnostic');
          }}
          onOpenVoiceAgent={() => setIsVoiceAgentOpen(true)}
          criticalAlertCount={criticalCount}
          onNavigate={(v) => setCurrentView(v)}
        />

        {/* Dynamic View Content Area */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          {currentView === 'dashboard' && (
            <DashboardView
              equipment={equipment}
              breakdowns={breakdowns}
              pmRecords={pmRecords}
              fuelEntries={fuelEntries}
              kpis={kpis}
              onOpenDiagnosticWithQuery={handleOpenDiagnosticWithQuery}
              onOpenKpiFormula={(k) => setActiveFormulaKpi(k)}
              onNavigate={(v) => setCurrentView(v)}
            />
          )}

          {currentView === 'equipment-master' && (
            <EquipmentMasterView
              equipment={equipment}
              onAddEquipment={handleAddEquipment}
              onSelectForDiagnostic={(eqId) =>
                handleOpenDiagnosticWithQuery('Diagnostic inspection requested', eqId)
              }
            />
          )}

          {currentView === 'equipment-status' && (
            <EquipmentStatusView
              equipment={equipment}
              onUpdateStatus={handleUpdateEquipmentStatus}
              onSelectForDiagnostic={(eqId) =>
                handleOpenDiagnosticWithQuery('Status check diagnostic', eqId)
              }
            />
          )}

          {currentView === 'diagnostic' && (
            <TechnicalDiagnosticView
              equipmentList={equipment}
              initialQuery={diagnosticInitialQuery}
              initialEquipmentId={diagnosticInitialEqId}
            />
          )}

          {currentView === 'ai-assistant' && (
            <AiChatView
              equipmentList={equipment}
              selectedEquipmentId={selectedEquipmentId}
              onOpenVoiceAgent={() => setIsVoiceAgentOpen(true)}
            />
          )}

          {currentView === 'pm' && (
            <PreventiveMaintenanceView
              pmRecords={pmRecords}
              equipmentList={equipment}
              onCompletePm={handleCompletePm}
              onToggleChecklistItem={handleTogglePmChecklistItem}
            />
          )}

          {currentView === 'breakdown' && (
            <BreakdownManagementView
              breakdowns={breakdowns}
              equipmentList={equipment}
              onAdvanceStage={handleAdvanceBreakdownStage}
              onAddBreakdown={handleAddBreakdown}
              onOpenDiagnosticWithComplaint={handleOpenDiagnosticWithQuery}
            />
          )}

          {currentView === 'rca' && (
            <RcaView rcas={rcas} onAddRca={handleAddRca} />
          )}

          {currentView === 'job-card' && (
            <JobCardInspectionView
              jobCards={jobCards}
              inspections={inspections}
              equipmentList={equipment}
            />
          )}

          {currentView === 'inspection' && (
            <JobCardInspectionView
              jobCards={jobCards}
              inspections={inspections}
              equipmentList={equipment}
            />
          )}

          {currentView === 'spares' && (
            <SparePartsView spares={spares} />
          )}

          {currentView === 'fuel' && (
            <FuelManagementView
              fuelEntries={fuelEntries}
              equipmentList={equipment}
              onAddFuelEntry={handleAddFuelEntry}
            />
          )}

          {currentView === 'tyre' && (
            <TyreBatteryView tyreRecords={tyreRecords} batteryRecords={batteryRecords} />
          )}

          {currentView === 'battery' && (
            <TyreBatteryView tyreRecords={tyreRecords} batteryRecords={batteryRecords} />
          )}

          {currentView === 'bridge-pm-control' && (
            <BridgePmControlView
              equipmentList={equipment}
              onOpenDiagnosticWithQuery={handleOpenDiagnosticWithQuery}
              onNavigate={(v) => setCurrentView(v)}
            />
          )}

          {currentView === 'costing' && (
            <CostingView equipmentList={equipment} />
          )}

          {currentView === 'productivity' && (
            <ProductivityView />
          )}

          {(currentView === 'kpi' || currentView === 'availability' || currentView === 'utilization') && (
            <KpiDashboardView
              kpis={kpis}
              onOpenKpiFormula={(k) => setActiveFormulaKpi(k)}
            />
          )}

          {currentView === 'dpr' && (
            <DailyPlantReportView equipmentList={equipment} />
          )}

          {(currentView === 'monthly-report' || currentView === 'management-reports') && (
            <MonthlyReportView equipmentList={equipment} />
          )}

          {currentView === 'documents' && (
            <DocumentsView documents={documents} onUploadDocument={handleUploadDocument} />
          )}

          {currentView === 'settings' && (
            <SettingsView
              currentRole={currentRole}
              setCurrentRole={setCurrentRole}
              onResetDemoData={handleResetDemoData}
            />
          )}
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        equipment={equipment}
        breakdowns={breakdowns}
        spares={spares}
        rcas={rcas}
        documents={documents}
        onSelectResult={handleSelectSearchResult}
      />

      {/* KPI Formula Drawer / Modal */}
      <KpiFormulaModal
        kpi={activeFormulaKpi}
        onClose={() => setActiveFormulaKpi(null)}
      />

      {/* AI Voice Agent Modal */}
      <VoiceAgentModal
        isOpen={isVoiceAgentOpen}
        onClose={() => setIsVoiceAgentOpen(false)}
        equipmentList={equipment}
        selectedEquipmentId={selectedEquipmentId}
        onNavigate={(v) => setCurrentView(v)}
      />

      {/* Floating Persistent Voice Trigger */}
      <FloatingVoiceTrigger onOpenVoiceAgent={() => setIsVoiceAgentOpen(true)} />
    </div>
  );
}
