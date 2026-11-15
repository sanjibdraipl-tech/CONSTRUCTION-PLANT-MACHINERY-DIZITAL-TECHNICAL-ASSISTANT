import React from 'react';
import {
  Settings,
  Shield,
  Database,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Layers,
  Server,
  Cpu,
  Wifi,
} from 'lucide-react';
import { UserRole } from '../types';

interface SettingsViewProps {
  currentRole: UserRole;
  setCurrentRole: (r: UserRole) => void;
  onResetDemoData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentRole,
  setCurrentRole,
  onResetDemoData,
}) => {
  const rolePermissions: { role: UserRole; desc: string; rights: string[] }[] = [
    {
      role: 'Admin',
      desc: 'Full administrative access across all projects, configurations, and user accounts',
      rights: ['All Permissions', 'System Configuration', 'User Management', 'Data Reset'],
    },
    {
      role: 'Head P&M',
      desc: 'Senior executive overseeing corporate fleet, capex, and tender owned vs. hired decisions',
      rights: ['Capex Approval', 'Owned vs Hired Models', 'Monthly MIS Release', 'Asset Scrap Authorization'],
    },
    {
      role: 'Project Manager',
      desc: 'Overall project in-charge responsible for site timeline, DPR sign-offs, and hiring demands',
      rights: ['Daily DPR Sign-off', 'Shift Planning', 'Breakdown Escalation', 'Fuel Variance Review'],
    },
    {
      role: 'P&M Manager',
      desc: 'Senior mechanical engineer heading site workshops, preventative maintenance, and spares staging',
      rights: ['PM Schedule Release', 'Technician Dispatch', 'Major Breakdown Workflow', 'Spare Indents'],
    },
    {
      role: 'Maintenance Engineer',
      desc: 'Field mechanical/electrical engineer executing diagnostics, 5-Why RCAs, and repairs',
      rights: ['AI Technical Diagnostics', 'PM Execution Sign-off', 'Job Card Issuance', 'RCA Dossiers'],
    },
    {
      role: 'Store Officer',
      desc: 'Inventory in-charge managing diesel bowsers, lubricants, filters, and VED spares',
      rights: ['Stock Receipts & Issues', 'Bowser Dip Log', 'Reorder Alerts', 'Vendor Lead Time Tracking'],
    },
    {
      role: 'Operator',
      desc: 'Equipment operator conducting daily 8-point walkaround checks and reporting field complaints',
      rights: ['Daily Walkaround Check', 'Pre-Start Logging', 'Shift Hours Input', 'Complaint Flagging'],
    },
    {
      role: 'Viewer',
      desc: 'Auditor or client representative with read-only access to availability and production records',
      rights: ['Read-only View', 'DPR Export', 'Monthly Report Print'],
    },
  ];

  const enterpriseConnectors = [
    {
      name: 'Google Sheets & Google Forms',
      type: 'Direct Spreadsheet Bridge',
      status: 'Ready for Connection',
      desc: 'Two-way synchronization for Daily Plant Reports (DPR), site diesel bowser slips, and mechanic work orders.',
    },
    {
      name: 'SAP & Nway Construction ERP',
      type: 'Enterprise Asset Bridge',
      status: 'API Adapter Ready',
      desc: 'PO creation, inventory ledger sync, and plant depreciation posting into general ledger.',
    },
    {
      name: 'IoT Telematics & GPS Gateways',
      type: 'CAN-bus Telemetry Protocol',
      status: 'Protocol Mapped',
      desc: 'Direct HMR engine hours, fuel level sensor dips, GPS geofencing, and engine DTC error ingestion.',
    },
    {
      name: 'Firebase / Supabase Cloud DB',
      type: 'Managed Persistent Storage',
      status: 'Ready for Cloud Provisioning',
      desc: 'PostgreSQL / Firestore database schema mapped for production multi-tenant deployment.',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-black uppercase text-amber-400 border border-amber-500/30">
            System Architecture & Security
          </span>
          <span className="text-xs text-slate-400">Enterprise Readiness</span>
        </div>
        <h1 className="text-2xl font-black text-white mt-1">Settings & Data Architecture</h1>
        <p className="text-xs text-slate-400">
          Role-based access control (RBAC), ERP/IoT connector readiness, and demo data state management
        </p>
      </div>

      {/* DEMO DATA CLEAR LABEL BANNER (Section 23) */}
      <div className="rounded-2xl border border-blue-900/60 bg-gradient-to-r from-blue-950/30 via-slate-900 to-slate-950 p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-blue-400 font-bold text-sm">
            <Database className="h-5 w-5" />
            <span>DATA ARCHITECTURE & DEMO STATE (SECTION 23 COMPLIANCE)</span>
          </div>
          <span className="rounded bg-blue-950 border border-blue-800 px-2.5 py-0.5 text-xs font-bold text-blue-300 font-mono">
            DEMO DATA ACTIVE
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          As required by technical specifications: The Plant and Machinery Control Desk is modularly architected to connect with Google Sheets, Google Forms, Firebase, Supabase, SAP, Nway ERP, and IoT GPS telematics. To preserve complete transparency without pretending simulated connections are live, all records are explicitly marked as{' '}
          <strong className="text-white font-mono">DEMO DATA</strong> until external credentials and production endpoints are provisioned.
        </p>

        <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
          <span className="text-[11px] text-slate-400">
            Reset test modifications, break-even parameters, and restored 20 initial equipment assets.
          </span>
          <button
            onClick={onResetDemoData}
            className="flex items-center space-x-1.5 rounded-lg bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo Records</span>
          </button>
        </div>
      </div>

      {/* ROLE-BASED ACCESS CONTROL (RBAC) (Section 22) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Role-Based Access Control (RBAC Hierarchy)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Current Role: <strong className="text-amber-400">{currentRole}</strong></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rolePermissions.map((rp) => {
            const isCurrent = currentRole === rp.role;

            return (
              <div
                key={rp.role}
                onClick={() => setCurrentRole(rp.role)}
                className={`rounded-xl border p-4 cursor-pointer transition-all ${
                  isCurrent
                    ? 'border-amber-500 bg-amber-500/10 shadow-lg ring-1 ring-amber-500/50'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white flex items-center">
                    {rp.role}
                    {isCurrent && (
                      <span className="ml-2 rounded bg-amber-500 text-slate-950 px-1.5 py-0.2 text-[9px] font-black uppercase">
                        Active
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">P&M Role</span>
                </div>

                <p className="mt-1.5 text-[11px] text-slate-400 leading-relaxed">
                  {rp.desc}
                </p>

                <div className="mt-3 flex flex-wrap gap-1 border-t border-slate-800/80 pt-2">
                  {rp.rights.map((r, i) => (
                    <span key={i} className="rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-mono text-slate-300">
                      ✓ {r}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ENTERPRISE INTEGRATIONS READINESS (Section 23) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Server className="h-5 w-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Future Enterprise Connector Adapters
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {enterpriseConnectors.map((c, idx) => (
            <div key={idx} className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-xs">{c.name}</span>
                <span className="rounded bg-slate-800 text-slate-300 px-2 py-0.5 text-[10px] font-mono">
                  {c.status}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
