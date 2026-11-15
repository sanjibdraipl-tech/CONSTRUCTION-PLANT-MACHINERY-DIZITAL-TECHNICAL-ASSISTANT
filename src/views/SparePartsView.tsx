import React, { useState, useMemo } from 'react';
import {
  Boxes,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Download,
  ShieldAlert,
  TrendingDown,
  CheckCircle,
} from 'lucide-react';
import { SparePart } from '../types';

interface SparePartsViewProps {
  spares: SparePart[];
  onAddStock?: (partNo: string, qty: number) => void;
}

export const SparePartsView: React.FC<SparePartsViewProps> = ({ spares }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAbc, setFilterAbc] = useState<string>('ALL');
  const [filterVed, setFilterVed] = useState<string>('ALL');
  const [filterMovement, setFilterMovement] = useState<string>('ALL');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Filter logic
  const filtered = useMemo(() => {
    return spares.filter((s) => {
      const matchSearch =
        s.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.applicableMakeModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.supplier.toLowerCase().includes(searchTerm.toLowerCase());

      const matchAbc = filterAbc === 'ALL' || s.abcClass === filterAbc;
      const matchVed = filterVed === 'ALL' || s.criticality === filterVed;
      const matchMove = filterMovement === 'ALL' || s.movement === filterMovement;
      const matchLowStock = !filterLowStockOnly || s.closingStock <= s.reorderLevel;

      return matchSearch && matchAbc && matchVed && matchMove && matchLowStock;
    });
  }, [spares, searchTerm, filterAbc, filterVed, filterMovement, filterLowStockOnly]);

  // Derived alerts
  const criticalShortages = spares.filter(
    (s) => s.criticality === 'Vital' && s.closingStock <= s.minimumLevel
  );
  const reorderRecommendations = spares.filter((s) => s.closingStock <= s.reorderLevel);
  const totalStockValue = spares.reduce((acc, c) => acc + c.closingStock * c.unitPrice, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[11px] font-black uppercase text-cyan-400 border border-cyan-500/30">
              Module 12 • Materials & Stores
            </span>
            <span className="text-xs text-slate-400">ABC • VED • FSN Matrix</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Spare Parts Inventory & Stores Desk</h1>
          <p className="text-xs text-slate-400">
            Critical machine spare parts control, reorder trigger levels, bin locations, and OEM vendor lead times
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Total Inventory Valuation</span>
          <span className="text-2xl font-black font-mono text-cyan-400">
            ₹{(totalStockValue / 100000).toFixed(2)} Lakhs
          </span>
        </div>
      </div>

      {/* KPI Alert Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Critical Spare Alert */}
        <div
          onClick={() => {
            setFilterVed('Vital');
            setFilterLowStockOnly(true);
          }}
          className="rounded-xl border border-red-900/60 bg-red-950/25 p-4 cursor-pointer hover:border-red-700 transition-all"
        >
          <div className="flex items-center justify-between text-red-400">
            <span className="text-xs font-bold uppercase tracking-wider">Critical Spare Alert (VED: Vital)</span>
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-white">
            {criticalShortages.length} Items
          </div>
          <p className="mt-1 text-[11px] text-red-300">
            Stock is at or below minimum buffer. Machinery breakdown risk.
          </p>
        </div>

        {/* Reorder Recommendation */}
        <div
          onClick={() => setFilterLowStockOnly(true)}
          className="rounded-xl border border-amber-900/60 bg-amber-950/25 p-4 cursor-pointer hover:border-amber-700 transition-all"
        >
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">Reorder Recommendations</span>
            <TrendingDown className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-white">
            {reorderRecommendations.length} Items
          </div>
          <p className="mt-1 text-[11px] text-amber-300">
            Stock &le; Reorder Level. Purchase indent dispatch required.
          </p>
        </div>

        {/* Classification Summary */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Classification Matrix
          </span>
          <div className="flex justify-between text-xs text-slate-300">
            <div>
              <span className="text-[10px] text-slate-500 block">ABC Class A</span>
              <strong className="text-amber-400 font-mono">
                {spares.filter((s) => s.abcClass === 'A').length} High Value
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">VED Vital</span>
              <strong className="text-red-400 font-mono">
                {spares.filter((s) => s.criticality === 'Vital').length} Vital Parts
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">FSN Fast</span>
              <strong className="text-emerald-400 font-mono">
                {spares.filter((s) => s.movement === 'Fast Moving').length} Fast Moving
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Part Number, Name, Make/Model, or Supplier..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 py-1.5 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* ABC Filter */}
        <select
          value={filterAbc}
          onChange={(e) => setFilterAbc(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white"
        >
          <option value="ALL">All ABC Classes</option>
          <option value="A">Class A (Top 70% Value)</option>
          <option value="B">Class B (Moderate 20%)</option>
          <option value="C">Class C (Low Value 10%)</option>
        </select>

        {/* VED Filter */}
        <select
          value={filterVed}
          onChange={(e) => setFilterVed(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white"
        >
          <option value="ALL">All VED</option>
          <option value="Vital">Vital (V)</option>
          <option value="Essential">Essential (E)</option>
          <option value="Desirable">Desirable (D)</option>
        </select>

        {/* Movement Filter */}
        <select
          value={filterMovement}
          onChange={(e) => setFilterMovement(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white"
        >
          <option value="ALL">All Movement</option>
          <option value="Fast Moving">Fast Moving</option>
          <option value="Slow Moving">Slow Moving</option>
          <option value="Non Moving">Non Moving</option>
        </select>

        {/* Low Stock Toggle */}
        <button
          onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition-colors ${
            filterLowStockOnly
              ? 'bg-amber-500 text-slate-950 border-amber-400'
              : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-600'
          }`}
        >
          Low Stock Only
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <th className="p-3">Part Number</th>
              <th className="p-3">Part Description</th>
              <th className="p-3">Applicable Model</th>
              <th className="p-3">Stock (Closing)</th>
              <th className="p-3">Reorder / Min</th>
              <th className="p-3">Class (ABC / VED)</th>
              <th className="p-3">Unit Price</th>
              <th className="p-3">Supplier & Lead Time</th>
              <th className="p-3">Bin Location</th>
              <th className="p-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-200">
            {filtered.map((sp) => {
              const isLow = sp.closingStock <= sp.reorderLevel;
              const isStockOut = sp.closingStock === 0;

              return (
                <tr key={sp.partNumber} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-cyan-400">{sp.partNumber}</td>
                  <td className="p-3 font-semibold text-white">
                    <div>{sp.partName}</div>
                    <div className="text-[10px] text-slate-500">{sp.category}</div>
                  </td>
                  <td className="p-3 text-slate-300 max-w-[160px] truncate">
                    {sp.applicableMakeModel}
                  </td>
                  <td className="p-3 font-mono font-bold text-base">
                    <span
                      className={
                        isStockOut
                          ? 'text-red-500'
                          : isLow
                          ? 'text-amber-400'
                          : 'text-white'
                      }
                    >
                      {sp.closingStock}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-400">
                    <span className="text-amber-400 font-semibold">{sp.reorderLevel}</span> / {sp.minimumLevel}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-1.5">
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold font-mono text-amber-300">
                        {sp.abcClass}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          sp.criticality === 'Vital'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : sp.criticality === 'Essential'
                            ? 'bg-amber-950 text-amber-300'
                            : 'bg-blue-950 text-blue-300'
                        }`}
                      >
                        {sp.criticality}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 font-mono font-semibold text-slate-200">
                    ₹{sp.unitPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3">
                    <div className="text-white truncate max-w-[150px]">{sp.supplier}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{sp.leadTimeDays} days lead</div>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-400">{sp.binLocation}</td>
                  <td className="p-3 text-right">
                    {isStockOut ? (
                      <span className="rounded bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 text-[10px] font-black uppercase">
                        Stock-Out!
                      </span>
                    ) : isLow ? (
                      <span className="rounded bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                        Reorder
                      </span>
                    ) : (
                      <span className="rounded bg-emerald-950 text-emerald-400 px-2 py-0.5 text-[10px] font-bold uppercase">
                        Adequate
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
  );
};
