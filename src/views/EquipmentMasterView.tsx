import React, { useState, useMemo } from 'react';
import {
  Truck,
  Plus,
  Download,
  Upload,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertOctagon,
  Eye,
  FileSpreadsheet,
  X,
  ExternalLink,
} from 'lucide-react';
import { Equipment, EquipmentCategory, EquipmentStatus } from '../types';

interface EquipmentMasterViewProps {
  equipment: Equipment[];
  onAddEquipment: (newEq: Equipment) => void;
  onSelectForDiagnostic: (eqId: string) => void;
}

export const EquipmentMasterView: React.FC<EquipmentMasterViewProps> = ({
  equipment,
  onAddEquipment,
  onSelectForDiagnostic,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedOwnership, setSelectedOwnership] = useState<string>('ALL');

  // Modal states
  const [viewingEquipment, setViewingEquipment] = useState<Equipment | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportNotice, setShowImportNotice] = useState(false);

  // Filtered equipment
  const filteredList = useMemo(() => {
    return equipment.filter((eq) => {
      const matchSearch =
        eq.equipmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.site.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategory === 'ALL' || eq.category === selectedCategory;
      const matchStatus = selectedStatus === 'ALL' || eq.currentStatus === selectedStatus;
      const matchOwnership = selectedOwnership === 'ALL' || eq.ownershipType === selectedOwnership;

      return matchSearch && matchCategory && matchStatus && matchOwnership;
    });
  }, [equipment, searchTerm, selectedCategory, selectedStatus, selectedOwnership]);

  // CSV Export simulation
  const handleExportCSV = () => {
    const headers = [
      'Equipment_ID',
      'Asset_Code',
      'Category',
      'Type',
      'Make',
      'Model',
      'Serial_Number',
      'Engine_Model',
      'Engine_Serial_Number',
      'Year',
      'Purchase_Date',
      'Purchase_Value_INR',
      'Current_Value_INR',
      'Site',
      'Project',
      'Department',
      'Ownership_Type',
      'Vendor',
      'Hire_Rate',
      'HMR',
      'KM',
      'Capacity',
      'Rated_Output',
      'Fuel_Type',
      'Fuel_Tank_Capacity',
      'Average_Fuel_Consumption',
      'Current_Status',
      'Operator',
      'Supervisor',
      'Maintenance_Engineer',
      'Criticality',
      'GPS_Status',
    ];

    const rows = filteredList.map((eq) => [
      eq.equipmentId,
      eq.assetCode,
      eq.category,
      eq.type,
      eq.make,
      eq.model,
      eq.serialNumber,
      eq.engineModel,
      eq.engineSerialNumber,
      eq.year,
      eq.purchaseDate,
      eq.purchaseValue,
      eq.currentValue,
      `"${eq.site}"`,
      `"${eq.project}"`,
      eq.department,
      eq.ownershipType,
      eq.vendor || '',
      eq.hireRate || '',
      eq.hmr,
      eq.km,
      `"${eq.capacity}"`,
      `"${eq.ratedOutput}"`,
      eq.fuelType,
      eq.fuelTankCapacity,
      eq.averageFuelConsumption,
      eq.currentStatus,
      eq.operator,
      eq.supervisor,
      eq.maintenanceEngineer,
      eq.criticality,
      eq.gpsStatus,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Plant_and_Machinery_Equipment_Master_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-black uppercase text-amber-400 border border-amber-500/30">
              Module 03 • Asset Register
            </span>
            <span className="text-xs text-slate-400">Total 35+ Standard P&M Fields</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Equipment Master Database
          </h1>
          <p className="text-xs text-slate-400">
            Centrally registry for Departmental & Hired machinery across highways, metro viaducts, tunneling, and batching complexes
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowImportNotice(true)}
            className="flex items-center space-x-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import CSV/Excel</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/90 p-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Equipment ID, Make, Model, Serial #, or Site..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
        >
          <option value="ALL">All Categories</option>
          <option value="Earthmoving">Earthmoving</option>
          <option value="Road & Paving">Road & Paving</option>
          <option value="Concrete & Batching">Concrete & Batching</option>
          <option value="Aggregate & Crushing">Aggregate & Crushing</option>
          <option value="Foundation & Piling">Foundation & Piling</option>
          <option value="Lifting & Material Handling">Lifting & Material Handling</option>
          <option value="Power & Utility">Power & Utility</option>
          <option value="Transport & Haulage">Transport & Haulage</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Running">Running</option>
          <option value="Idle">Idle</option>
          <option value="Under Maintenance">Under Maintenance</option>
          <option value="Breakdown">Breakdown</option>
        </select>

        <select
          value={selectedOwnership}
          onChange={(e) => setSelectedOwnership(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
        >
          <option value="ALL">All Ownership</option>
          <option value="Departmental">Departmental (Owned)</option>
          <option value="Hired">Hired (Rental)</option>
        </select>

        <div className="text-xs font-semibold text-slate-400 ml-auto font-mono">
          Showing {filteredList.length} of {equipment.length} Units
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <th className="p-3">Equip ID</th>
              <th className="p-3">Make & Model</th>
              <th className="p-3">Category / Type</th>
              <th className="p-3">Current Site / Project</th>
              <th className="p-3">HMR (Hrs)</th>
              <th className="p-3">Ownership</th>
              <th className="p-3">Status</th>
              <th className="p-3">Criticality</th>
              <th className="p-3">Operator / In-Charge</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-200">
            {filteredList.map((eq) => (
              <tr key={eq.equipmentId} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-3 font-mono font-bold text-amber-400">{eq.equipmentId}</td>
                <td className="p-3">
                  <div className="font-semibold text-white">{eq.make} {eq.model}</div>
                  <div className="text-[10px] text-slate-500 font-mono">S/N: {eq.serialNumber}</div>
                </td>
                <td className="p-3">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                    {eq.type}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-0.5">{eq.category}</div>
                </td>
                <td className="p-3">
                  <div className="font-medium text-slate-200 max-w-[180px] truncate">{eq.site}</div>
                  <div className="text-[10px] text-slate-500 max-w-[180px] truncate">{eq.project}</div>
                </td>
                <td className="p-3 font-mono font-bold text-white">
                  {eq.hmr.toLocaleString('en-IN')}
                </td>
                <td className="p-3">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      eq.ownershipType === 'Departmental'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}
                  >
                    {eq.ownershipType}
                  </span>
                  {eq.vendor && (
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[100px]">
                      {eq.vendor}
                    </div>
                  )}
                </td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center space-x-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      eq.currentStatus === 'Running'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : eq.currentStatus === 'Available'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : eq.currentStatus === 'Under Maintenance'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : eq.currentStatus === 'Breakdown'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    <span>{eq.currentStatus}</span>
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`text-[10px] font-bold ${
                      eq.criticality === 'Critical'
                        ? 'text-red-400'
                        : eq.criticality === 'Major'
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {eq.criticality}
                  </span>
                </td>
                <td className="p-3">
                  <div className="text-xs text-white">{eq.operator}</div>
                  <div className="text-[10px] text-slate-500">Eng: {eq.maintenanceEngineer}</div>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    <button
                      onClick={() => setViewingEquipment(eq)}
                      className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                      title="View Complete Spec Sheet"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectForDiagnostic(eq.equipmentId)}
                      className="rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 px-2 py-1 text-[10px] font-bold transition-colors"
                      title="Launch AI Diagnosis for this machine"
                    >
                      Diagnose
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FULL SPECIFICATION MODAL */}
      {viewingEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-base font-bold text-amber-400">
                    {viewingEquipment.equipmentId}
                  </span>
                  <span className="text-xs text-slate-400">({viewingEquipment.assetCode})</span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-200">
                    {viewingEquipment.currentStatus}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">
                  {viewingEquipment.make} {viewingEquipment.model} ({viewingEquipment.type})
                </h2>
              </div>
              <button
                onClick={() => setViewingEquipment(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Complete 35+ Fields Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs my-4">
              <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Serial Number</span>
                <span className="font-mono font-semibold text-white">{viewingEquipment.serialNumber}</span>
              </div>
              <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Engine Model</span>
                <span className="font-semibold text-white">{viewingEquipment.engineModel}</span>
              </div>
              <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Engine S/N</span>
                <span className="font-mono text-white">{viewingEquipment.engineSerialNumber}</span>
              </div>
              <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Year / Purchase Date</span>
                <span className="text-white">{viewingEquipment.year} • {viewingEquipment.purchaseDate}</span>
              </div>
              <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Purchase Value (INR)</span>
                <span className="font-mono text-amber-400 font-bold">
                  ₹{viewingEquipment.purchaseValue.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Current Book Value</span>
                <span className="font-mono text-slate-300">
                  ₹{viewingEquipment.currentValue.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Assigned Site</span>
                <span className="text-white">{viewingEquipment.site}</span>
              </div>
              <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Infrastructure Project</span>
                <span className="text-white">{viewingEquipment.project}</span>
              </div>
              <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Specific Location / Chainage</span>
                <span className="text-white">{viewingEquipment.location}</span>
              </div>
              <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Department</span>
                <span className="text-white">{viewingEquipment.department}</span>
              </div>
              <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Ownership & Contract</span>
                <span className="text-white">
                  {viewingEquipment.ownershipType} {viewingEquipment.vendor ? `(${viewingEquipment.vendor})` : ''}
                </span>
              </div>
              <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Current HMR / KM</span>
                <span className="font-mono font-bold text-cyan-400">{viewingEquipment.hmr} hrs / {viewingEquipment.km} km</span>
              </div>
              <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Capacity & Rated Output</span>
                <span className="text-white">{viewingEquipment.capacity} • {viewingEquipment.ratedOutput}</span>
              </div>
              <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Fuel Spec</span>
                <span className="text-white">
                  {viewingEquipment.fuelType} • Tank: {viewingEquipment.fuelTankCapacity}L • Avg: {viewingEquipment.averageFuelConsumption} L/hr
                </span>
              </div>
              <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">PM Service Status</span>
                <span className="text-white">
                  Last: {viewingEquipment.lastServiceDate} • Due: {viewingEquipment.pmHours} hrs
                </span>
              </div>
              <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Assigned Operator</span>
                <span className="text-white">{viewingEquipment.operator}</span>
              </div>
              <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Maintenance Engineer</span>
                <span className="text-white">{viewingEquipment.maintenanceEngineer}</span>
              </div>
              <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Warranty / Insurance / GPS</span>
                <span className="text-white">
                  {viewingEquipment.warrantyStatus} • {viewingEquipment.insuranceStatus} • GPS: {viewingEquipment.gpsStatus}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-xs">
              <span className="text-slate-400 font-bold block mb-1">Supervisor Remarks:</span>
              <p className="text-slate-300">{viewingEquipment.remarks}</p>
            </div>

            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => {
                  const id = viewingEquipment.equipmentId;
                  setViewingEquipment(null);
                  onSelectForDiagnostic(id);
                }}
                className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
              >
                Launch AI Diagnosis
              </button>
              <button
                onClick={() => setViewingEquipment(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
              >
                Close Spec Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV/Excel Import Info Modal */}
      {showImportNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                <FileSpreadsheet className="h-5 w-5" />
                <span>CSV / Excel Batch Importer</span>
              </div>
              <button onClick={() => setShowImportNotice(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Plant & Machinery Control Desk supports importing bulk equipment registers from SAP, Nway ERP, MS Excel, and Google Sheets.
            </p>
            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-xs space-y-1.5 font-mono text-slate-400">
              <p className="text-amber-400 font-bold">Standard Import Column Schema:</p>
              <p>Equipment_ID, Make, Model, Category, Type, Serial_Number, HMR, Site, Ownership, Capacity, Fuel_Type</p>
            </div>
            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => {
                  alert('Demo Mode: Imported 5 sample highway tipper & roller records successfully into local state.');
                  setShowImportNotice(false);
                }}
                className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
              >
                Load Sample CSV Data
              </button>
              <button
                onClick={() => setShowImportNotice(false)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Register New Equipment Asset
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                const newAsset: Equipment = {
                  equipmentId: form.eqId.value,
                  assetCode: `AST-2026-${form.eqId.value}`,
                  category: form.cat.value,
                  type: form.type.value,
                  make: form.make.value,
                  model: form.model.value,
                  serialNumber: form.sn.value,
                  engineModel: 'Cummins QSB 6.7',
                  engineSerialNumber: 'ENG-NEW-2026',
                  year: 2024,
                  purchaseDate: '2024-01-15',
                  purchaseValue: Number(form.val.value) || 5000000,
                  currentValue: Number(form.val.value) || 4500000,
                  site: 'Package-4 Km 142+200',
                  project: 'NHAI Delhi-Amritsar-Katra PKG-5',
                  location: 'Base Camp',
                  department: 'Earthwork',
                  ownershipType: 'Departmental',
                  hmr: Number(form.hmr.value) || 120,
                  km: 0,
                  capacity: 'Standard HD',
                  ratedOutput: '150 HP',
                  fuelType: 'Diesel',
                  fuelTankCapacity: 350,
                  averageFuelConsumption: 16.0,
                  lastServiceDate: '2026-10-01',
                  nextServiceDate: '2026-11-01',
                  pmHours: 250,
                  currentStatus: 'Available',
                  operator: form.op.value || 'Site Pool',
                  supervisor: 'Sunil Sharma',
                  maintenanceEngineer: 'Er. Amit Verma',
                  criticality: 'Major',
                  warrantyStatus: 'In Warranty',
                  insuranceStatus: 'Valid',
                  gpsStatus: 'Online',
                  remarks: 'Newly inducted into fleet.',
                };
                onAddEquipment(newAsset);
                setShowAddModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Equipment ID *</label>
                  <input name="eqId" required placeholder="e.g. EX-05" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Category *</label>
                  <select name="cat" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white">
                    <option value="Earthmoving">Earthmoving</option>
                    <option value="Road & Paving">Road & Paving</option>
                    <option value="Concrete & Batching">Concrete & Batching</option>
                    <option value="Foundation & Piling">Foundation & Piling</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Make *</label>
                  <input name="make" required placeholder="e.g. Tata Hitachi" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Model *</label>
                  <input name="model" required placeholder="e.g. ZX220LC" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Equipment Type</label>
                  <input name="type" defaultValue="Excavator" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Serial Number</label>
                  <input name="sn" placeholder="e.g. TH-2024-9912" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Initial HMR</label>
                  <input name="hmr" type="number" defaultValue="50" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Purchase Value (₹)</label>
                  <input name="val" type="number" defaultValue="6500000" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Operator</label>
                  <input name="op" placeholder="Operator Name" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
