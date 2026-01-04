'use client';

import { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const parsePageRange = (rangeStr, totalPages) => {
    const pages = new Set();
    const parts = rangeStr.split(',').map(p => p.trim());
    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n));
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
                    if (i >= 1 && i <= totalPages) pages.add(i - 1);
                }
            }
        } else {
            const page = parseInt(part);
            if (!isNaN(page) && page >= 1 && page <= totalPages) pages.add(page - 1);
        }
    }
    return pages;
};

export default function PDFSplitter() {
    const [file, setFile] = useState(null);
    const [pages, setPages] = useState([]);
    const [selectedPages, setSelectedPages] = useState(new Set());
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState(''); // 'loading', 'extracting', 'zipping'
    const [rangeInput, setRangeInput] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // --- Actions ---

    const handleFileChange = async (e) => {
        const f = e.target.files?.[0];
        if (f) await loadFile(f);
    };

    const loadFile = async (uploadedFile) => {
        setIsProcessing(true);
        setProcessingStatus('loading');
        setFile(uploadedFile);
        setPages([]);
        setSelectedPages(new Set());
        setRangeInput('');

        try {
            // Dynamically import pdfjs-dist to avoid SSR issues with DOMMatrix
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

            const ab = await uploadedFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(ab).promise;

            const newPages = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                // Higher scale for better desktop quality
                const viewport = page.getViewport({ scale: 0.8 });
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: ctx, viewport }).promise;

                newPages.push({
                    pageIndex: i - 1,
                    thumbnail: canvas.toDataURL(),
                    width: viewport.width,
                    height: viewport.height
                });
            }
            setPages(newPages);
        } catch (err) {
            console.error(err);
            alert("Failed to load PDF.");
        } finally {
            setIsProcessing(false);
            setProcessingStatus('');
        }
    };

    const toggleSelection = (idx) => {
        const newSet = new Set(selectedPages);
        if (newSet.has(idx)) newSet.delete(idx);
        else newSet.add(idx);
        setSelectedPages(newSet);
    };

    const applyRange = () => {
        if (!rangeInput || pages.length === 0) return;
        const newSelection = parsePageRange(rangeInput, pages.length);
        setSelectedPages(newSelection);
    };

    const selectAll = () => setSelectedPages(new Set(pages.map(p => p.pageIndex)));
    const deselectAll = () => setSelectedPages(new Set());

    const extractSelected = async () => {
        if (!file || selectedPages.size === 0) return;
        setIsProcessing(true);
        setProcessingStatus('extracting');

        try {
            const ab = await file.arrayBuffer();
            const srcDoc = await PDFDocument.load(ab);
            const newDoc = await PDFDocument.create();

            const indices = Array.from(selectedPages).sort((a, b) => a - b);
            const copied = await newDoc.copyPages(srcDoc, indices);
            copied.forEach(p => newDoc.addPage(p));

            const bytes = await newDoc.save();
            saveAs(new Blob([bytes], { type: 'application/pdf' }), `extracted_${file.name}`);
        } catch (err) {
            console.error(err);
            alert("Extraction failed.");
        } finally {
            setIsProcessing(false);
            setProcessingStatus('');
        }
    };

    const splitAllZip = async () => {
        if (!file) return;
        setIsProcessing(true);
        setProcessingStatus('zipping');

        try {
            const ab = await file.arrayBuffer();
            const srcDoc = await PDFDocument.load(ab);
            const zip = new JSZip();

            for (let i = 0; i < srcDoc.getPageCount(); i++) {
                const newDoc = await PDFDocument.create();
                const [copied] = await newDoc.copyPages(srcDoc, [i]);
                newDoc.addPage(copied);
                const bytes = await newDoc.save();
                zip.file(`Page_${i + 1}.pdf`, bytes);
            }

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `split_${file.name.replace('.pdf', '')}.zip`);
        } catch (err) {
            console.error(err);
            alert("Splitting failed.");
        } finally {
            setIsProcessing(false);
            setProcessingStatus('');
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 font-sans selection:bg-pink-500 selection:text-white ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>

            {/* Navigation Bar */}
            <nav className={`sticky top-0 z-40 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-xl shadow-lg shadow-pink-500/20">✂️</div>
                    <div>
                        <h1 className="font-bold text-xl leading-none">UltraSplit <span className="text-pink-500 text-xs uppercase tracking-wider ml-1">Pro</span></h1>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Advanced PDF Extraction</p>
                    </div>
                </div>
                <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-full transition-all ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {darkMode ? '☀️' : '🌙'}
                </button>
            </nav>

            <div className="max-w-[1800px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 h-auto lg:h-[calc(100vh-80px)]">

                {/* LEFT SIDEBAR: Controls */}
                <div className="lg:w-80 flex-shrink-0 flex flex-col gap-6 h-auto transition-all">

                    {/* Upload / File Info Card */}
                    {!file ? (
                        <div
                            className={`relative group rounded-2xl border-2 border-dashed transition-all p-8 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden h-56 lg:h-auto
                                ${isDragging
                                    ? 'border-pink-500 bg-pink-500/10 scale-[1.02]'
                                    : darkMode ? 'border-slate-700 bg-slate-800/50 hover:border-pink-500/50 hover:bg-slate-800' : 'border-slate-300 bg-white hover:border-pink-400 hover:bg-pink-50/30'}
                            `}
                            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true) }}
                            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                            onDrop={async (e) => {
                                e.preventDefault(); setIsDragging(false);
                                const f = e.dataTransfer.files?.[0];
                                if (f?.type === 'application/pdf') await loadFile(f);
                            }}
                        >
                            <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">📂</div>
                            <h3 className="font-bold text-lg">Open PDF</h3>
                            <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tap to Upload</p>
                        </div>
                    ) : (
                        <div className={`rounded-2xl p-6 border flex flex-col gap-4 shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center gap-3 pb-4 border-b border-dashed border-slate-700/50 overflow-hidden">
                                <div className="min-w-[40px] h-[40px] bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-xl">📄</div>
                                <div className="overflow-hidden">
                                    <h3 className="font-bold truncate text-sm" title={file.name}>{file.name}</h3>
                                    <p className="text-xs opacity-60">{(file.size / 1024 / 1024).toFixed(2)} MB • {pages.length} Pages</p>
                                </div>
                            </div>
                            <button onClick={() => setFile(null)} className="text-xs text-red-500 hover:text-red-600 font-bold text-right">Remove File</button>
                        </div>
                    )}

                    {/* Selection Controls */}
                    {file && (
                        <div className={`rounded-2xl p-6 border flex flex-col gap-4 shadow-sm flex-1 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-sm uppercase tracking-wider opacity-70">Selection ({selectedPages.size})</span>
                                <div className="flex gap-2">
                                    <button onClick={selectAll} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded dark:bg-slate-700 dark:text-slate-300">All</button>
                                    <button onClick={deselectAll} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded dark:bg-slate-700 dark:text-slate-300">None</button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold opacity-70">Range (e.g. 1-5, 8)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={rangeInput}
                                        onChange={e => setRangeInput(e.target.value)}
                                        placeholder="1-3, 5"
                                        className={`flex-1 px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-pink-500 ${darkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50 border-slate-300'}`}
                                        onKeyDown={e => e.key === 'Enter' && applyRange()}
                                    />
                                    <button onClick={applyRange} className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-2 rounded-lg font-bold text-sm">Apply</button>
                                </div>
                            </div>

                            <div className="mt-auto space-y-3 pt-4 border-t border-slate-700/10 dark:border-slate-100/10">
                                <button
                                    onClick={extractSelected}
                                    disabled={selectedPages.size === 0 || isProcessing}
                                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg
                                        ${selectedPages.size === 0
                                            ? 'bg-slate-200 text-slate-400 dark:bg-slate-700 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-pink-500/30 hover:-translate-y-0.5'}`}
                                >
                                    {isProcessing && processingStatus === 'extracting' ? 'Extracting...' : `Extract ${selectedPages.size} Pages`}
                                </button>

                                <button
                                    onClick={splitAllZip}
                                    disabled={isProcessing}
                                    className={`w-full py-3 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-2
                                        ${darkMode
                                            ? 'border-slate-600 hover:bg-slate-700 text-slate-300'
                                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                                >
                                    {isProcessing && processingStatus === 'zipping' ? 'Zipping...' : 'Split All to ZIP'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT AREA: Grid */}
                <div className={`flex-1 rounded-3xl border lg:overflow-hidden flex flex-col relative transition-colors min-h-[500px] lg:min-h-0 ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                    {isProcessing && processingStatus === 'loading' ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50">
                            <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 font-bold text-lg animate-pulse">Rendering Pages...</p>
                        </div>
                    ) : null}

                    {!file ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-40 select-none">
                            <div className="text-8xl mb-4 grayscale">✂️</div>
                            <p className="text-xl font-medium">No PDF Loaded</p>
                        </div>
                    ) : (
                        <div className="flex-1 lg:overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                                {pages.map(page => (
                                    <div
                                        key={page.pageIndex}
                                        onClick={() => toggleSelection(page.pageIndex)}
                                        className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border-2 shadow-sm
                                            ${selectedPages.has(page.pageIndex)
                                                ? 'border-pink-500 shadow-xl shadow-pink-500/20 scale-[1.02] ring-2 ring-pink-500/20'
                                                : darkMode
                                                    ? 'border-slate-700 bg-slate-800 hover:border-slate-500'
                                                    : 'border-white bg-white hover:border-pink-200 hover:shadow-md'
                                            }
                                        `}
                                    >
                                        <div className={`aspect-[1/1.4] relative overflow-hidden ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
                                            <img src={page.thumbnail} loading="lazy" className="w-full h-full object-contain" alt="" />

                                            {/* Selection Overlay */}
                                            <div className={`absolute inset-0 transition-colors ${selectedPages.has(page.pageIndex) ? 'bg-pink-500/10' : 'group-hover:bg-black/5 dark:group-hover:bg-white/5'}`} />

                                            {/* Checkbox */}
                                            <div className={`absolute top-2 right-2 w-6 h-6 rounded-md border flex items-center justify-center transition-all shadow-sm
                                                ${selectedPages.has(page.pageIndex)
                                                    ? 'bg-pink-500 border-pink-500 text-white scale-110'
                                                    : 'bg-white/80 border-slate-300 dark:bg-slate-800/80 dark:border-slate-600'}`
                                            }>
                                                {selectedPages.has(page.pageIndex) && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                            </div>
                                        </div>
                                        <div className={`py-3 text-center text-xs font-bold border-t ${darkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-slate-500 border-slate-100'}`}>
                                            Page {page.pageIndex + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
