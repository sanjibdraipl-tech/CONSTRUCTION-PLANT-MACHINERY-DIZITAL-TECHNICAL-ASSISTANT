import React, { useState } from 'react';
import {
  FolderOpen,
  FileText,
  Upload,
  Search,
  Filter,
  Download,
  Eye,
  Tag,
  Link,
  BookOpen,
  Sparkles,
  ExternalLink,
  X,
  FileCheck,
} from 'lucide-react';
import { DocumentItem } from '../types';
import { DOCUMENT_FOLDERS } from '../data/mockData';

interface DocumentsViewProps {
  documents: DocumentItem[];
  onUploadDocument: (doc: DocumentItem) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ documents, onUploadDocument }) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingDoc, setViewingDoc] = useState<DocumentItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const filteredDocs = documents.filter((doc) => {
    const matchFolder = selectedFolder === 'ALL' || doc.folderNumber === selectedFolder;
    const matchSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchFolder && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] font-black uppercase text-emerald-400 border border-emerald-500/30">
              Module 18 & 20 • Technical Repository
            </span>
            <span className="text-xs text-slate-400">20 Standardized Folders</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Plant & Machinery Document Management Desk
          </h1>
          <p className="text-xs text-slate-400">
            OEM shop manuals, hydraulic schematics, PM checklists, insurance certificates, and technical knowledge base
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/20"
        >
          <Upload className="h-4 w-4 stroke-[2.5]" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* SPECIAL GOOGLE REFERENCE DOCUMENT IMPORT ZONE (Sections 1 & 20) */}
      <div className="rounded-2xl border-2 border-dashed border-amber-500/50 bg-gradient-to-r from-amber-950/20 via-slate-900 to-amber-950/20 p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Primary Knowledge-Base Import Gateway
                </span>
                <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400 font-mono">
                  Google Docs Connector
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">
                Technical Knowledge Base Import & Indexing Area
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                As instructed: When the primary Google Document reference material is provided, it is ingested, tokenized, and indexed into the Plant & Machinery AI Diagnostic Engine across OEM specifications, hydraulic schematics, and troubleshooting sequences.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end md:self-center shrink-0">
            <button
              onClick={() => {
                alert(
                  'Knowledge Ingestion Ready: If a Google Document URL or file is connected, it will be automatically parsed into the 20 structured technical categories.'
                );
              }}
              className="flex items-center space-x-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Connect / Import Knowledge Doc</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = 20 Folders, Right = Files */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 20 Folders Navigation (4 Cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center">
              <FolderOpen className="h-4 w-4 text-amber-400 mr-1.5" />
              Standard Folders (20)
            </span>
            <button
              onClick={() => setSelectedFolder('ALL')}
              className="text-[11px] text-amber-400 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1 text-xs">
            {DOCUMENT_FOLDERS.map((f) => {
              const isSelected = selectedFolder === f.folderNumber;
              const docCount = documents.filter((d) => d.folderNumber === f.folderNumber).length;

              return (
                <button
                  key={f.folderNumber}
                  onClick={() => setSelectedFolder(f.folderNumber)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="font-mono text-[10px] text-slate-500">{f.folderNumber.slice(0, 2)}</span>
                    <span className="truncate">{f.folderName}</span>
                  </div>
                  {docCount > 0 && (
                    <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] font-mono text-slate-400">
                      {docCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Files Table (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs">
            <div className="relative flex-1 mr-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search documents by title, file name, or tag..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-3 py-1.5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <span className="text-slate-400 font-mono">
              {filteredDocs.length} Documents
            </span>
          </div>

          {/* Files List */}
          <div className="space-y-2.5">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-700 transition-all shadow-md space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-amber-400 border border-slate-800">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white hover:text-amber-400 cursor-pointer">
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {doc.fileName} • {doc.fileSize} • Uploaded by {doc.uploadedBy} on {doc.uploadDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => setViewingDoc(doc)}
                      className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                      title="Preview Document Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => alert(`Downloading ${doc.fileName}...`)}
                      className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                      title="Download"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Tags & Linked Equipment */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                  <span className="rounded bg-slate-950 px-2 py-0.5 text-slate-400 border border-slate-800">
                    Folder: {doc.folderNumber}
                  </span>
                  {doc.equipmentId && (
                    <span className="rounded bg-amber-500/15 text-amber-400 px-2 py-0.5 font-bold font-mono">
                      Asset: {doc.equipmentId}
                    </span>
                  )}
                  {doc.isKnowledgeBaseSource && (
                    <span className="rounded bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 font-semibold">
                      Knowledge Base Indexed
                    </span>
                  )}
                  {doc.tags.map((tag) => (
                    <span key={tag} className="rounded bg-slate-800 text-slate-400 px-1.5 py-0.5">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Document Metadata & Reference View
              </h3>
              <button onClick={() => setViewingDoc(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Document Title</span>
                <p className="font-bold text-white text-sm mt-0.5">{viewingDoc.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono">
                <div className="rounded bg-slate-950 p-2 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">File Name</span>
                  <span>{viewingDoc.fileName}</span>
                </div>
                <div className="rounded bg-slate-950 p-2 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Size & Format</span>
                  <span>{viewingDoc.fileSize} ({viewingDoc.fileType})</span>
                </div>
              </div>

              <div className="rounded bg-slate-950 p-3 border border-slate-800 text-slate-300 space-y-1">
                <span className="text-slate-500 text-[10px] block">Knowledge Base Category</span>
                <p className="text-amber-400 font-semibold">{viewingDoc.folderName}</p>
                <p className="text-[11px] text-slate-400">
                  Indexed for search queries and root cause cross-referencing.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setViewingDoc(null)}
                className="rounded bg-slate-800 px-4 py-2 text-xs font-semibold text-white"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Upload Document to P&M Repository
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                const folder = DOCUMENT_FOLDERS.find((f) => f.folderNumber === form.folder.value);
                const newDoc: DocumentItem = {
                  id: `DOC-NEW-${Date.now()}`,
                  folderNumber: form.folder.value,
                  folderName: folder?.folderName || 'General',
                  title: form.title.value,
                  fileName: form.fname.value || 'document.pdf',
                  fileSize: '2.4 MB',
                  fileType: 'PDF',
                  uploadDate: new Date().toISOString().slice(0, 10),
                  uploadedBy: 'Current Engineer',
                  equipmentId: form.eqId.value || undefined,
                  tags: form.tags.value.split(',').map((t: string) => t.trim()),
                  isKnowledgeBaseSource: true,
                };
                onUploadDocument(newDoc);
                setShowUploadModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-slate-400 block mb-1">Target Folder (20 Categories) *</label>
                <select name="folder" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white">
                  {DOCUMENT_FOLDERS.map((f) => (
                    <option key={f.folderNumber} value={f.folderNumber}>
                      {f.folderNumber} - {f.folderName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Document Title *</label>
                <input name="title" required placeholder="e.g. Komatsu PC210 Hydraulic Schematic" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">File Name</label>
                <input name="fname" placeholder="e.g. PC210_Hydraulics_Rev2.pdf" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white font-mono" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Link Equipment ID</label>
                  <input name="eqId" placeholder="e.g. EX-02" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Tags (comma separated)</label>
                  <input name="tags" placeholder="hydraulic, schematic, pump" className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-white" />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowUploadModal(false)} className="rounded bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="rounded bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500">
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
