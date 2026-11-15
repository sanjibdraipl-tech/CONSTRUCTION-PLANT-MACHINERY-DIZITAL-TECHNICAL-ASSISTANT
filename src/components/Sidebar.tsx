import React from 'react';
import {
  LayoutDashboard,
  Truck,
  Activity,
  Wrench,
  CalendarClock,
  AlertOctagon,
  Boxes,
  Fuel,
  Disc,
  BatteryCharging,
  DollarSign,
  TrendingUp,
  Gauge,
  CheckCircle2,
  BarChart3,
  FileSpreadsheet,
  FileText,
  GitBranch,
  ClipboardList,
  CheckSquare,
  FolderOpen,
  Bot,
  PieChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Compass,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  breakdownCount?: number;
  overduePmCount?: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  badge?: number;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isCollapsed,
  setIsCollapsed,
  breakdownCount = 3,
  overduePmCount = 3,
}) => {
  const navSections: NavSection[] = [
    {
      title: 'CONTROL DESK',
      items: [
        { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
        { id: 'equipment-master', label: 'Equipment Master', icon: Truck },
        { id: 'equipment-status', label: 'Equipment Status', icon: Activity },
      ],
    },
    {
      title: 'DIAGNOSTICS & AI',
      items: [
        { id: 'diagnostic', label: 'Technical Diagnostic', icon: Wrench, highlight: true },
        { id: 'ai-assistant', label: 'Plant & Machinery AI Chat', icon: Bot, highlight: true },
        { id: 'ai-voice', label: 'AI Voice Agent (Hands-Free)', icon: Headphones, highlight: true },
      ],
    },
    {
      title: 'MAINTENANCE OPS',
      items: [
        { id: 'pm', label: 'Preventive Maintenance', icon: CalendarClock, badge: overduePmCount },
        { id: 'breakdown', label: 'Breakdown Management', icon: AlertOctagon, badge: breakdownCount, badgeColor: 'bg-red-500' },
        { id: 'rca', label: 'Root Cause Analysis (RCA)', icon: GitBranch },
        { id: 'job-card', label: 'Workshop Job Cards', icon: ClipboardList },
        { id: 'inspection', label: 'Daily Walkaround Inspection', icon: CheckSquare },
      ],
    },
    {
      title: 'FLEET ASSETS & STORES',
      items: [
        { id: 'spares', label: 'Spare Parts Inventory', icon: Boxes },
        { id: 'fuel', label: 'Fuel Management', icon: Fuel },
        { id: 'tyre', label: 'Tyre Management', icon: Disc },
        { id: 'battery', label: 'Battery Management', icon: BatteryCharging },
      ],
    },
    {
      title: 'METRICS & PERFORMANCE',
      items: [
        { id: 'bridge-pm-control', label: 'Bridge P&M Control & Economics', icon: Compass, highlight: true },
        { id: 'kpi', label: 'KPI Engine & Formulas', icon: BarChart3 },
        { id: 'productivity', label: 'Plant Productivity', icon: TrendingUp },
        { id: 'costing', label: 'Costing & Owned vs Hired', icon: DollarSign },
        { id: 'utilization', label: 'Utilization Analysis', icon: Gauge },
        { id: 'availability', label: 'Availability Analysis', icon: CheckCircle2 },
      ],
    },
    {
      title: 'REPORTING & REPOSITORY',
      items: [
        { id: 'dpr', label: 'Daily Plant Report (DPR)', icon: FileSpreadsheet },
        { id: 'monthly-report', label: 'Monthly P&M Report', icon: FileText },
        { id: 'management-reports', label: 'Management Reports', icon: PieChart },
        { id: 'documents', label: 'Document Desk (20 Folders)', icon: FolderOpen },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Settings & Integrations', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-800 bg-slate-950 transition-all duration-300 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {section.title}
              </h3>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`group relative flex w-full items-center rounded-lg px-2.5 py-2 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-400 font-bold shadow-sm'
                        : item.highlight
                        ? 'text-amber-200/90 hover:bg-slate-900 hover:text-amber-400'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        isActive
                          ? 'text-amber-400 scale-110'
                          : item.highlight
                          ? 'text-amber-400/80'
                          : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />

                    {!isCollapsed && (
                      <span className="ml-3 truncate">{item.label}</span>
                    )}

                    {/* Active Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-amber-400 shadow-md shadow-amber-500" />
                    )}

                    {/* Notification Badge */}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`ml-auto rounded-full px-1.5 py-0.2 text-[10px] font-black text-white ${
                          item.badgeColor || 'bg-amber-600'
                        } ${isCollapsed ? 'absolute -top-1 -right-1' : ''}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="border-t border-slate-800 p-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center justify-center rounded-lg bg-slate-900/80 py-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="flex items-center space-x-2 text-xs font-medium">
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse Sidebar</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
