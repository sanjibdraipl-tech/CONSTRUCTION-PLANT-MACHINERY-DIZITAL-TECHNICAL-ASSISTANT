import React, { useState } from 'react';
import {
  Wrench,
  Search,
  Bell,
  Sparkles,
  Shield,
  Layers,
  MapPin,
  Truck,
  ChevronDown,
  Database,
  X,
  AlertTriangle,
  Headphones,
} from 'lucide-react';
import { UserRole } from '../types';
import { PROJECTS, SITES } from '../data/mockData';

interface TopBarProps {
  selectedProject: string;
  setSelectedProject: (p: string) => void;
  selectedSite: string;
  setSelectedSite: (s: string) => void;
  selectedEquipmentId: string;
  setSelectedEquipmentId: (id: string) => void;
  equipmentList: { id: string; model: string; make: string }[];
  currentRole: UserRole;
  setCurrentRole: (r: UserRole) => void;
  onOpenSearch: () => void;
  onOpenAiDiagnostic: () => void;
  onOpenVoiceAgent: () => void;
  criticalAlertCount: number;
  onNavigate: (view: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  selectedProject,
  setSelectedProject,
  selectedSite,
  setSelectedSite,
  selectedEquipmentId,
  setSelectedEquipmentId,
  equipmentList,
  currentRole,
  setCurrentRole,
  onOpenSearch,
  onOpenAiDiagnostic,
  onOpenVoiceAgent,
  criticalAlertCount,
  onNavigate,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles: UserRole[] = [
    'Admin',
    'Head P&M',
    'Project Manager',
    'P&M Manager',
    'Maintenance Engineer',
    'Store Officer',
    'Operator',
    'Viewer',
  ];

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 backdrop-blur-md">
      {/* Brand & Identity */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center space-x-2.5 text-left transition-opacity hover:opacity-90"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 shadow-lg shadow-amber-500/20">
            <Wrench className="h-5 w-5 text-slate-950 stroke-[2.5]" />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-950 text-[9px] font-black text-amber-400 border border-amber-500/60">
              P
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-base sm:text-lg font-black tracking-wider text-white">
                PLANT AND <span className="text-amber-400">MACHINERY</span>
              </span>
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20">
                P&M Control Desk
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-400">
              Indian Infrastructure Digital Technical Control Tower
            </p>
          </div>
        </button>

        {/* Demo Data Tag */}
        <div className="hidden xl:flex items-center space-x-1.5 rounded-full bg-blue-950/60 px-2.5 py-1 text-[11px] font-medium text-blue-300 border border-blue-800/50">
          <Database className="h-3 w-3 text-blue-400" />
          <span>DEMO DATA ACTIVE</span>
        </div>
      </div>

      {/* Global Selectors */}
      <div className="hidden lg:flex items-center space-x-2 text-xs">
        {/* Project Selector */}
        <div className="relative flex items-center rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-slate-200">
          <Layers className="mr-2 h-3.5 w-3.5 text-amber-400 shrink-0" />
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-transparent pr-4 font-medium text-slate-200 focus:outline-none cursor-pointer max-w-[200px] truncate"
            title="Select Infrastructure Project"
          >
            <option value="ALL" className="bg-slate-900 text-slate-200">
              All Projects (Fleet View)
            </option>
            {PROJECTS.map((proj) => (
              <option key={proj} value={proj} className="bg-slate-900 text-slate-200">
                {proj}
              </option>
            ))}
          </select>
        </div>

        {/* Site Selector */}
        <div className="relative flex items-center rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-slate-200">
          <MapPin className="mr-2 h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="bg-transparent pr-4 font-medium text-slate-200 focus:outline-none cursor-pointer max-w-[170px] truncate"
            title="Select Work Package / Site"
          >
            <option value="ALL" className="bg-slate-900 text-slate-200">
              All Sites / Packages
            </option>
            {SITES.map((site) => (
              <option key={site} value={site} className="bg-slate-900 text-slate-200">
                {site}
              </option>
            ))}
          </select>
        </div>

        {/* Equipment Selector */}
        <div className="relative flex items-center rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-slate-200">
          <Truck className="mr-2 h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <select
            value={selectedEquipmentId}
            onChange={(e) => setSelectedEquipmentId(e.target.value)}
            className="bg-transparent pr-4 font-medium text-slate-200 focus:outline-none cursor-pointer max-w-[170px] truncate"
            title="Quick Select Machine"
          >
            <option value="ALL" className="bg-slate-900 text-slate-200">
              All Equipment (20 Units)
            </option>
            {equipmentList.map((eq) => (
              <option key={eq.id} value={eq.id} className="bg-slate-900 text-slate-200">
                {eq.id} – {eq.model}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons & Utilities */}
      <div className="flex items-center space-x-2.5">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center space-x-2 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-colors"
          title="Search across Equipment, Breakdowns, Parts, RCAs (Press /)"
        >
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden md:inline">Global Search...</span>
          <kbd className="hidden sm:inline-block rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-700">
            /
          </kbd>
        </button>

        {/* AI Quick Diagnostic CTA */}
        <button
          onClick={onOpenAiDiagnostic}
          className="flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">AI Diagnostic</span>
        </button>

        {/* AI Audio + Text Assistant CTA */}
        <button
          onClick={onOpenVoiceAgent}
          className="flex items-center space-x-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 shadow-sm hover:bg-amber-500/20 hover:text-amber-200 transition-all cursor-pointer"
          title="AI Audio + Text Desk - Type Questions & Hear Answers Aloud"
        >
          <Headphones className="h-3.5 w-3.5 text-amber-400 stroke-[2.5]" />
          <span className="hidden md:inline">Audio + Text AI</span>
        </button>

        {/* Notifications Icon & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title="System Alerts & Warnings"
          >
            <Bell className="h-4 w-4" />
            {criticalAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white shadow-sm">
                {criticalAlertCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Live P&M Alerts ({criticalAlertCount})
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div
                  onClick={() => {
                    onNavigate('breakdown');
                    setShowNotifications(false);
                  }}
                  className="rounded-lg bg-red-950/40 border border-red-900/60 p-2 text-red-200 cursor-pointer hover:bg-red-950/70"
                >
                  <p className="font-semibold text-red-300">3 Critical Breakdowns Active</p>
                  <p className="text-[11px] text-red-400 mt-0.5">
                    EX-01 (Hydraulic drop), HMP-01 (Burner trip), BP-03 (Interlock)
                  </p>
                </div>

                <div
                  onClick={() => {
                    onNavigate('pm');
                    setShowNotifications(false);
                  }}
                  className="rounded-lg bg-amber-950/40 border border-amber-900/60 p-2 text-amber-200 cursor-pointer hover:bg-amber-950/70"
                >
                  <p className="font-semibold text-amber-300">3 Overdue PM Services</p>
                  <p className="text-[11px] text-amber-400 mt-0.5">
                    EX-03 (Cat 320D 500H), DG-01 (500kVA), CR-01 (Monthly)
                  </p>
                </div>

                <div
                  onClick={() => {
                    onNavigate('fuel');
                    setShowNotifications(false);
                  }}
                  className="rounded-lg bg-yellow-950/40 border border-yellow-900/60 p-2 text-yellow-200 cursor-pointer hover:bg-yellow-950/70"
                >
                  <p className="font-semibold text-yellow-300">Fuel Exceptions Detected</p>
                  <p className="text-[11px] text-yellow-400 mt-0.5">
                    Abnormal fuel variance detected – investigation required on EX-01 & HMP-01.
                  </p>
                </div>

                <div
                  onClick={() => {
                    onNavigate('spares');
                    setShowNotifications(false);
                  }}
                  className="rounded-lg bg-slate-800 p-2 text-slate-300 cursor-pointer hover:bg-slate-700"
                >
                  <p className="font-semibold text-slate-200">Critical Spare Shortages</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Duo-Cone Seal (CAT D6R) and Bauer Thermal Valve stock is ZERO.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher & User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2 rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-200 hover:border-slate-700 transition-colors"
            title="Switch User Role & Access Level"
          >
            <Shield className="h-3.5 w-3.5 text-amber-400" />
            <div className="text-left hidden sm:block">
              <span className="block text-[11px] font-bold text-white leading-tight">
                {currentRole}
              </span>
              <span className="block text-[9px] text-slate-400 leading-tight">
                Role-Based Access
              </span>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50">
              <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                Select Operating Role
              </div>
              <div className="space-y-1">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setCurrentRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-left transition-colors ${
                      currentRole === r
                        ? 'bg-amber-500/20 text-amber-400 font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{r}</span>
                    {currentRole === r && (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-500 px-2">
                Simulating enterprise role permissions across P&M hierarchy.
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
