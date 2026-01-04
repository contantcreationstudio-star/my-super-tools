'use client';

import { useState, useEffect, useCallback } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Utility Functions ---
const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// --- Components ---

// Individual PDF Card
const Item = ({ file, onRemove, onRotate, style, dragOverlay, ...props }) => (
  <div
    style={style}
    {...props}
    className={`
      bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col gap-2 
      group transition-all h-full relative overflow-hidden select-none
      ${dragOverlay ? 'shadow-2xl ring-2 ring-indigo-500 scale-105 rotate-2 cursor-grabbing z-50' : 'hover:border-indigo-300 hover:shadow-md cursor-grab'}
    `}
  >
    {/* Delete Button */}
    <button
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => { e.stopPropagation(); onRemove && onRemove(); }}
      className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors z-20 backdrop-blur-sm border border-transparent hover:border-red-100"
      title="Remove file"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>

    {/* Rotation Indicator/Button */}
    <button
       onPointerDown={(e) => e.stopPropagation()}
       onClick={(e) => { e.stopPropagation(); onRotate && onRotate(); }}
       className="absolute top-2 left-2 p-1.5 bg-white/80 hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 rounded-lg transition-colors z-20 backdrop-blur-sm border border-transparent hover:border-indigo-100"
       title="Rotate 90°"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
    </button>

    {/* Content */}
    <div className={`flex-1 flex flex-col items-center justify-center py-6 bg-slate-50/50 border-b border-slate-100 ${dragOverlay ? 'bg-indigo-50/30' : ''}`}>
      <div 
        className="transition-transform duration-300"
        style={{ transform: `rotate(${file.rotation || 0}deg)` }}
      >
        <span className="text-5xl drop-shadow-sm">📄</span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">
        <span>{file.pageCount} Pgs</span>
        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
        <span>{formatBytes(file.file.size)}</span>
      </div>
      {file.rotation > 0 && (
         <div className="mt-1 text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 rounded-full">
            {file.rotation}°
         </div>
      )}
    </div>

    {/* Footer */}
    <div className="px-4 py-3 bg-white">
      <div className="text-center truncate text-sm font-semibold text-slate-700" title={file.file.name}>
        {file.file.name}
      </div>
    </div>
  </div>
);

function SortableItem({ id, file, onRemove, onRotate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition, 
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : 'auto'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="h-full">
      <Item file={file} onRemove={() => onRemove(id)} onRotate={() => onRotate(id)} />
    </div>
  );
}

export default function PDFMerger() {
  const [files, setFiles] = useState([]); // Array of { id, file, pageCount, rotation }
  const [status, setStatus] = useState('idle'); // idle, proc, merging, error, success
  const [url, setUrl] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Sensors for Drag & Drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Cleanup Object URL on unmount
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  const handleFileChange = async (e) => {
    const fileList = e.target.files ? Array.from(e.target.files) : [];
    if (fileList.length > 0) await processFiles(fileList);
    e.target.value = ''; // Reset input
  };

  const handleDrop = async (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDraggingFile(false);
    const fileList = e.dataTransfer.files ? Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf') : [];
    if (fileList.length > 0) await processFiles(fileList);
  };

  const processFiles = async (list) => {
    setStatus('proc');
    setErrorMessage('');
    
    try {
      const processed = await Promise.all(list.map(async (file) => {
        let cnt = '?';
        try {
          const abs = await file.arrayBuffer();
          // Only load header to get page count (faster)
          const pdf = await PDFDocument.load(abs, { ignoreEncryption: true });
          cnt = pdf.getPageCount();
        } catch (err) {
          console.error("Error reading PDF", err);
          return null; // Skip bad files
        }
        
        return { 
          id: crypto.randomUUID(), // Better ID generation
          file, 
          pageCount: cnt,
          rotation: 0 // Default rotation
        };
      }));

      const validFiles = processed.filter(f => f !== null);
      if (validFiles.length < list.length) {
        setErrorMessage(`Skipped ${list.length - validFiles.length} invalid or encrypted files.`);
      }

      setFiles(prev => [...prev, ...validFiles]);
      if (url) { URL.revokeObjectURL(url); setUrl(null); } // Reset download if new files added
    } catch (err) {
      setErrorMessage("Error processing files.");
    } finally {
      setStatus('idle');
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    if (active.id !== over.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (url) { URL.revokeObjectURL(url); setUrl(null); }
  };

  const rotateFile = (id) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        // Rotate 0 -> 90 -> 180 -> 270 -> 0
        const newRot = (f.rotation + 90) % 360;
        return { ...f, rotation: newRot };
      }
      return f;
    }));
    if (url) { URL.revokeObjectURL(url); setUrl(null); }
  };

  const merge = async () => {
    if (files.length < 2) {
      setErrorMessage("Please select at least 2 files to merge.");
      return;
    }
    
    setStatus('merging');
    setErrorMessage('');
    
    try {
      const doc = await PDFDocument.create();
      
      for (const f of files) {
        const abs = await f.file.arrayBuffer();
        const src = await PDFDocument.load(abs);
        const pgs = await doc.copyPages(src, src.getPageIndices());
        
        pgs.forEach(p => {
            // Apply the user-selected rotation
            if (f.rotation !== 0) {
               const existingRotation = p.getRotation().angle;
               p.setRotation(degrees(existingRotation + f.rotation));
            }
            doc.addPage(p);
        });
      }
      
      const bytes = await doc.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const newUrl = URL.createObjectURL(blob);
      setUrl(newUrl);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to merge. One of the files might be corrupt.");
      setStatus('error');
    } finally {
        if(status !== 'error') setStatus('idle');
    }
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: { opacity: '0.4' },
      },
    }),
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-100 selection:text-indigo-800">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Advanced <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">PDF Merger</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Drag, drop, reorder, and rotate before merging. Secure & Client-side.
          </p>
        </div>

        {/* Main Interface */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden min-h-[600px] flex flex-col relative">
            
            {/* Toolbar */}
            <div className="p-6 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex flex-wrap gap-4 justify-between items-center">
                <div 
                    className={`relative group cursor-pointer`}
                    onDragEnter={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDraggingFile(false); }}
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                    onDrop={handleDrop}
                >
                    <input type="file" accept=".pdf" multiple onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className={`px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 border-2 ${isDraggingFile ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg'}`}>
                        <span className="font-bold text-lg">+</span> <span className="font-semibold">{isDraggingFile ? 'Drop files now' : 'Add Files'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                   {errorMessage && (
                       <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2 animate-pulse">
                           ⚠️ {errorMessage}
                       </div>
                   )}
                   <div className="bg-slate-100 px-4 py-2 rounded-lg text-slate-600 font-bold text-sm">
                       {files.length} PDF{files.length !== 1 && 's'}
                   </div>
                   {files.length > 0 && (
                       <button onClick={() => { setFiles([]); setUrl(null); }} className="text-sm font-semibold text-slate-500 hover:text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
                           Clear All
                       </button>
                   )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 bg-slate-50/50 overflow-y-auto relative">
                {status === 'proc' || status === 'merging' ? (
                    <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                         <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                         <p className="font-semibold text-slate-600 animate-pulse">
                             {status === 'proc' ? 'Processing Files...' : 'Merging PDFs...'}
                         </p>
                    </div>
                ) : null}

                {files.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-300 rounded-2xl p-12 hover:bg-white transition-colors">
                        <span className="text-6xl mb-4 opacity-20">📂</span>
                        <p className="font-medium text-lg">No files selected</p>
                        <p className="text-sm">Click "Add Files" or drag PDFs here</p>
                    </div>
                ) : (
                    <DndContext 
                        sensors={sensors} 
                        collisionDetection={closestCenter} 
                        onDragStart={(e) => setActiveId(e.active.id)} 
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={files.map(f => f.id)} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
                                {files.map((file) => (
                                    <SortableItem 
                                        key={file.id} 
                                        id={file.id} 
                                        file={file} 
                                        onRemove={removeFile}
                                        onRotate={rotateFile}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                        <DragOverlay dropAnimation={dropAnimation}>
                            {activeId ? (
                                <div className="w-full h-full">
                                    <Item file={files.find(f => f.id === activeId)} dragOverlay />
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                )}
            </div>

            {/* Bottom Action Bar */}
            <div className="p-6 bg-white border-t border-slate-200 flex justify-center sticky bottom-0 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                {url ? (
                    <div className="flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-500">
                        <a 
                            href={url} 
                            download="merged_document.pdf" 
                            className="px-8 py-4 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-200 hover:shadow-green-300 transition-all transform hover:-translate-y-1 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Download Merged PDF
                        </a>
                        <button 
                            onClick={() => { setUrl(null); }} 
                            className="px-6 py-4 rounded-full border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                        >
                            Edit More
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={merge} 
                        disabled={files.length === 0 || status === 'proc' || status === 'merging'} 
                        className={`
                            px-12 py-4 rounded-full font-bold text-lg shadow-xl transition-all flex items-center gap-2
                            ${files.length === 0 
                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none' 
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-indigo-300 hover:scale-105 active:scale-95'}
                        `}
                    >
                        Merge Files
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}