import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Truck,
  AlertOctagon,
  Boxes,
  GitBranch,
  FolderOpen,
  ArrowRight,
} from 'lucide-react';
import { Equipment, BreakdownRecord, SparePart, RcaRecord, DocumentItem } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment[];
  breakdowns: BreakdownRecord[];
  spares: SparePart[];
  rcas: RcaRecord[];
  documents: DocumentItem[];
  onSelectResult: (type: string, id: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  equipment,
  breakdowns,
  spares,
  rcas,
  documents,
  onSelectResult,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const results = useMemo(() => {
    if (!searchTerm.trim()) return { equipment: [], breakdowns: [], spares: [], rcas: [], documents: [] };
    const q = searchTerm.toLowerCase();

    return {
      equipment: equipment.filter(
        (e) =>
          e.equipmentId.toLowerCase().includes(q) ||
          e.make.toLowerCase().includes(q) ||
          e.model.toLowerCase().includes(q) ||
          e.serialNumber.toLowerCase().includes(q) ||
          e.site.toLowerCase().includes(q)
      ),
      breakdowns: breakdowns.filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          b.equipmentId.toLowerCase().includes(q) ||
          b.complaint.toLowerCase().includes(q) ||
          (b.rootCause && b.rootCause.toLowerCase().includes(q))
      ),
      spares: spares.filter(
        (s) =>
          s.partNumber.toLowerCase().includes(q) ||
          s.partName.toLowerCase().includes(q) ||
          s.applicableMakeModel.toLowerCase().includes(q) ||
          s.supplier.toLowerCase().includes(q)
      ),
      rcas: rcas.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.problem.toLowerCase().includes(q) ||
          r.rootCause.toLowerCase().includes(q) ||
          r.equipmentId.toLowerCase().includes(q)
      ),
      documents: documents.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.fileName.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      ),
    };
  }, [searchTerm, equipment, breakdowns, spares, rcas, documents]);

  const totalResults =
    results.equipment.length +
    results.breakdowns.length +
    results.spares.length +
    results.rcas.length +
    results.documents.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/80 p-4 pt-16 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Bar Input */}
        <div className="flex items-center border-b border-slate-800 px-4 py-3.5 bg-slate-950">
          <Search className="h-5 w-5 text-amber-400 mr-3 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Equipment ID, Complaint, Part #, Error Code, RCA, Site, Doc..."
            autoFocus
            className="w-full bg-transparent text-sm font-medium text-white placeholder-slate-500 focus:outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="p-1 text-slate-400 hover:text-white mr-1">
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700 ml-2"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!searchTerm.trim() ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              <p className="font-semibold text-slate-400">Plant & Machinery Enterprise Search</p>
              <p className="mt-1 text-slate-500">
                Type an equipment ID like <span className="font-mono text-amber-400">EX-01</span>, a part like{' '}
                <span className="font-mono text-amber-400">Relief Valve</span>, or an error code.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['EX-01', 'HMP-01', 'Relief Valve', 'Hydraulic', 'Overdue PM', 'Apollo'].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setSearchTerm(chip)}
                    className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-medium text-slate-300 hover:bg-amber-500/20 hover:text-amber-400 border border-slate-700 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No matching P&M records found for &ldquo;<span className="text-white font-semibold">{searchTerm}</span>&rdquo;.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Equipment Matches */}
              {results.equipment.length > 0 && (
                <div>
                  <h4 className="flex items-center text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-2">
                    <Truck className="h-3 w-3 mr-1.5" />
                    Equipment Master ({results.equipment.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.equipment.map((eq) => (
                      <div
                        key={eq.equipmentId}
                        onClick={() => {
                          onSelectResult('equipment', eq.equipmentId);
                          onClose();
                        }}
                        className="flex items-center justify-between rounded-lg bg-slate-950 p-2.5 border border-slate-800 hover:border-amber-500/50 cursor-pointer group transition-all"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-amber-400 text-xs">{eq.equipmentId}</span>
                            <span className="text-xs font-semibold text-white">
                              {eq.make} {eq.model}
                            </span>
                            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-medium text-slate-300">
                              {eq.currentStatus}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {eq.site} • HMR: {eq.hmr} hrs • Operator: {eq.operator}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Breakdown Matches */}
              {results.breakdowns.length > 0 && (
                <div>
                  <h4 className="flex items-center text-[10px] font-bold uppercase tracking-wider text-red-400 mb-2">
                    <AlertOctagon className="h-3 w-3 mr-1.5" />
                    Breakdowns ({results.breakdowns.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.breakdowns.map((bd) => (
                      <div
                        key={bd.id}
                        onClick={() => {
                          onSelectResult('breakdown', bd.id);
                          onClose();
                        }}
                        className="flex items-center justify-between rounded-lg bg-slate-950 p-2.5 border border-slate-800 hover:border-red-500/50 cursor-pointer group transition-all"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-red-400 text-xs">{bd.id}</span>
                            <span className="text-xs font-semibold text-white">
                              {bd.equipmentId} – {bd.failureMode}
                            </span>
                            <span className="rounded bg-red-950/60 text-red-300 px-1.5 py-0.5 text-[9px] font-bold border border-red-800">
                              {bd.stage}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{bd.complaint}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-red-400 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Spare Parts Matches */}
              {results.spares.length > 0 && (
                <div>
                  <h4 className="flex items-center text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-2">
                    <Boxes className="h-3 w-3 mr-1.5" />
                    Spare Inventory ({results.spares.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.spares.map((sp) => (
                      <div
                        key={sp.partNumber}
                        onClick={() => {
                          onSelectResult('spares', sp.partNumber);
                          onClose();
                        }}
                        className="flex items-center justify-between rounded-lg bg-slate-950 p-2.5 border border-slate-800 hover:border-cyan-500/50 cursor-pointer group transition-all"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-cyan-400 text-xs">{sp.partNumber}</span>
                            <span className="text-xs font-semibold text-white">{sp.partName}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Stock: {sp.closingStock} • Unit Price: ₹{sp.unitPrice.toLocaleString('en-IN')} • Loc:{' '}
                            {sp.binLocation}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RCA Matches */}
              {results.rcas.length > 0 && (
                <div>
                  <h4 className="flex items-center text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-2">
                    <GitBranch className="h-3 w-3 mr-1.5" />
                    Root Cause Analysis ({results.rcas.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.rcas.map((rca) => (
                      <div
                        key={rca.id}
                        onClick={() => {
                          onSelectResult('rca', rca.id);
                          onClose();
                        }}
                        className="flex items-center justify-between rounded-lg bg-slate-950 p-2.5 border border-slate-800 hover:border-purple-500/50 cursor-pointer group transition-all"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-purple-400 text-xs">{rca.id}</span>
                            <span className="text-xs font-semibold text-white">{rca.equipmentId}</span>
                            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-medium text-slate-300">
                              {rca.method}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{rca.problem}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Matches */}
              {results.documents.length > 0 && (
                <div>
                  <h4 className="flex items-center text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
                    <FolderOpen className="h-3 w-3 mr-1.5" />
                    Documents & Manuals ({results.documents.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.documents.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => {
                          onSelectResult('documents', doc.id);
                          onClose();
                        }}
                        className="flex items-center justify-between rounded-lg bg-slate-950 p-2.5 border border-slate-800 hover:border-emerald-500/50 cursor-pointer group transition-all"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-white">{doc.title}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {doc.folderName} • {doc.fileName} ({doc.fileSize})
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
