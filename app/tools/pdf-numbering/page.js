'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';

// Position Grid Constants
const POSITIONS = [
    { id: 'top-left', label: 'Top Left', x: 0, y: 1 },
    { id: 'top-center', label: 'Top Center', x: 0.5, y: 1 },
    { id: 'top-right', label: 'Top Right', x: 1, y: 1 },
    { id: 'bottom-left', label: 'Bottom Left', x: 0, y: 0 },
    { id: 'bottom-center', label: 'Bottom Center', x: 0.5, y: 0 },
    { id: 'bottom-right', label: 'Bottom Right', x: 1, y: 0 },
];

export default function PageNumberingTool() {
    const [file, setFile] = useState(null);
    const [previewImages, setPreviewImages] = useState([]); // Array of { url, index }
    const [pageCount, setPageCount] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Settings
    const [position, setPosition] = useState('bottom-center');
    const [startNumber, setStartNumber] = useState(1);
    const [format, setFormat] = useState('1'); // '1', '1 of n', 'Page 1', 'Page 1 of n', 'custom'
    const [customText, setCustomText] = useState('Page {n} - Draft');
    const [fontSize, setFontSize] = useState(12);
    const [margin, setMargin] = useState(20);
    const [color, setColor] = useState('#000000');

    // Typography
    const [fontFamily, setFontFamily] = useState('Helvetica'); // Helvetica, Times, Courier
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [opacity, setOpacity] = useState(1);

    // Page Range
    const [rangeType, setRangeType] = useState('all'); // 'all', 'skip-first', 'custom'
    const [customRange, setCustomRange] = useState(''); // e.g., '2-5, 8, 11-13'
    const [resetNumbering, setResetNumbering] = useState(true); // If true, first numbered page = startNumber. If false, page # follows physical index.

    // Mobile Responsive State
    const [mobileTab, setMobileTab] = useState('settings'); // 'settings' | 'preview'

    // Logic to load visual preview of 1st page
    // Logic to load visual preview of FIRST 10 pages (or fewer)
    const loadFile = async (f) => {
        setLoading(true);
        setFile(f);
        setPreviewImages([]);

        try {
            // Load PDF for page count
            const ab = await f.arrayBuffer();
            const pdfDoc = await PDFDocument.load(ab);
            const total = pdfDoc.getPageCount();
            setPageCount(total);

            // Render first 10 pages thumbnails using pdfjs-dist
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

            const pdf = await pdfjsLib.getDocument(ab).promise;

            // Limit preview to first 12 pages for performance
            const limit = Math.min(total, 12);
            const images = [];

            for (let i = 1; i <= limit; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.6 }); // Slightly smaller scale for list view

                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
                images.push({ url: canvas.toDataURL(), index: i - 1 });
            }
            setPreviewImages(images);
        } catch (err) {
            console.error(err);
            alert("Could not load PDF");
        } finally {
            setLoading(false);
        }
    };

    const processPDF = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const ab = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(ab);

            // Resolve Font
            let fontName = 'Helvetica';
            if (fontFamily === 'Helvetica') {
                if (isBold && isItalic) fontName = 'HelveticaBoldOblique';
                else if (isBold) fontName = 'HelveticaBold';
                else if (isItalic) fontName = 'HelveticaOblique';
                else fontName = 'Helvetica';
            } else if (fontFamily === 'Times') {
                if (isBold && isItalic) fontName = 'TimesRomanBoldItalic';
                else if (isBold) fontName = 'TimesRomanBold';
                else if (isItalic) fontName = 'TimesRomanItalic';
                else fontName = 'TimesRoman';
            } else if (fontFamily === 'Courier') {
                if (isBold && isItalic) fontName = 'CourierBoldOblique';
                else if (isBold) fontName = 'CourierBold';
                else if (isItalic) fontName = 'CourierOblique';
                else fontName = 'Courier';
            }

            const fontToUse = await pdfDoc.embedFont(StandardFonts[fontName]);
            const pages = pdfDoc.getPages();
            const total = pages.length;

            // Helper to parse range string "1-3, 5" into set of 0-based indices
            const getDocsIndicesToNumber = () => {
                if (rangeType === 'all') return pages.map((_, i) => i);
                if (rangeType === 'skip-first') return pages.map((_, i) => i).slice(1);

                // Custom Parsing
                const indices = new Set();
                const parts = customRange.split(',').map(s => s.trim()).filter(Boolean);
                parts.forEach(part => {
                    if (part.includes('-')) {
                        const [start, end] = part.split('-').map(n => parseInt(n));
                        if (!isNaN(start) && !isNaN(end)) {
                            for (let i = start; i <= end; i++) indices.add(i - 1);
                        }
                    } else {
                        const num = parseInt(part);
                        if (!isNaN(num)) indices.add(num - 1);
                    }
                });
                // Filter out of bounds
                return Array.from(indices).filter(i => i >= 0 && i < total).sort((a, b) => a - b);
            };

            const indicesToNumber = getDocsIndicesToNumber();
            const totalNumbered = indicesToNumber.length;

            const hexToRgb = (hex) => {
                const r = parseInt(hex.slice(1, 3), 16) / 255;
                const g = parseInt(hex.slice(3, 5), 16) / 255;
                const b = parseInt(hex.slice(5, 7), 16) / 255;
                return [r, g, b];
            };
            const [r, g, b] = hexToRgb(color);

            // Iterate through ALL pages, but only draw on selected ones
            pages.forEach((page, pageIndex) => {
                // Check if this page should be numbered
                const sequenceIndex = indicesToNumber.indexOf(pageIndex);
                if (sequenceIndex === -1) return; // Skip this page

                // Calculate the number to display
                // If resetNumbering is true, we count 1, 2, 3... starting from the first numbered page
                // If false, we use the physical page number (pageIndex + 1) adjusted by startNumber

                // Effective Number Calculation:
                // reset: startNumber + 0, startNumber + 1...
                // no-reset: startNumber + pageIndex
                const num = resetNumbering
                    ? startNumber + sequenceIndex
                    : startNumber + pageIndex;

                let text = '';
                // For {total}, if resetNumbering is true, we use the count of numbered pages? 
                // Usually "Page 1 of 5" means 5 total pages in logic. 
                // Let's assume {total} is always total VALID pages if reset is on, or physical total if off.
                const totalDisplay = resetNumbering ? totalNumbered : total;

                switch (format) {
                    case '1': text = `${num}`; break;
                    case '1 of n': text = `${num} of ${totalDisplay}`; break;
                    case 'Page 1': text = `Page ${num}`; break;
                    case 'Page 1 of n': text = `Page ${num} of ${totalDisplay}`; break;
                    case 'custom': text = customText.replace('{n}', num).replace('{total}', totalDisplay); break;
                    default: text = `${num}`;
                }

                const textWidth = fontToUse.widthOfTextAtSize(text, fontSize);
                const textHeight = fontToUse.heightAtSize(fontSize);

                const { width, height } = page.getSize();
                const posConfig = POSITIONS.find(p => p.id === position);

                let x = 0;
                let y = 0;

                // X Calculation
                if (posConfig.x === 0) x = margin; // Left
                else if (posConfig.x === 0.5) x = (width - textWidth) / 2; // Center
                else x = width - textWidth - margin; // Right

                // Y Calculation
                if (posConfig.y === 0) y = margin; // Bottom
                else y = height - textHeight - margin; // Top (PDF coords start bottom-left, typically)

                page.drawText(text, {
                    x,
                    y,
                    size: fontSize,
                    font: fontToUse,
                    color: rgb(r, g, b),
                    opacity: opacity,
                });
            });

            const pdfBytes = await pdfDoc.save();
            saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), `numbered_${file.name}`);

        } catch (err) {
            console.error(err);
            alert("Error processing PDF");
        } finally {
            setIsProcessing(false);
        }
    };

    // Helper to calculate text for a specific page index
    const getPageNumberText = (pageIndex) => {
        if (!pageCount) return null;

        // 1. Calculate Indices to Number
        let indices = [];
        if (rangeType === 'all') {
            indices = Array.from({ length: pageCount }, (_, i) => i);
        } else if (rangeType === 'skip-first') {
            indices = Array.from({ length: pageCount }, (_, i) => i).slice(1);
        } else {
            const idxSet = new Set();
            const parts = customRange.split(',').map(s => s.trim()).filter(Boolean);
            parts.forEach(part => {
                if (part.includes('-')) {
                    const [s, e] = part.split('-').map(n => parseInt(n));
                    if (!isNaN(s) && !isNaN(e)) for (let i = s; i <= e; i++) idxSet.add(i - 1);
                } else {
                    const n = parseInt(part);
                    if (!isNaN(n)) idxSet.add(n - 1);
                }
            });
            indices = Array.from(idxSet).filter(i => i >= 0 && i < pageCount).sort((a, b) => a - b);
        }

        // 2. Check if current page is in list
        const seqIdx = indices.indexOf(pageIndex);
        if (seqIdx === -1) return null;

        // 3. Calculate Number
        const num = resetNumbering ? startNumber + seqIdx : startNumber + pageIndex;
        const totalDisplay = resetNumbering ? indices.length : pageCount;

        // 4. Format Text
        let text = '';
        switch (format) {
            case '1': text = `${num}`; break;
            case '1 of n': text = `${num} of ${totalDisplay}`; break;
            case 'Page 1': text = `Page ${num}`; break;
            case 'Page 1 of n': text = `Page ${num} of ${totalDisplay}`; break;
            case 'custom': text = customText.replace('{n}', num).replace('{total}', totalDisplay); break;
            default: text = `${num}`;
        }
        return text;
    };

    return (
        <div className="h-[100dvh] w-full bg-slate-50 font-sans text-slate-900 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 h-14 flex items-center px-4 lg:px-6 shrink-0 z-20 shadow-sm relative justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-lg text-white">🔢</div>
                    <h1 className="text-lg font-bold text-slate-800">Page Numbering Pro</h1>
                </div>
                <div className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">v2.1 Compact</div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                {/* LEFT SIDEBAR: Settings */}
                <div className={`w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] shrink-0 ${mobileTab === 'settings' ? 'flex h-full' : 'hidden lg:flex'}`}>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-indigo-100">
                        {/* 1. File Section */}
                        <div className="space-y-2">
                            {!file ? (
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-xl hover:border-indigo-500 hover:bg-slate-50 transition-all cursor-pointer bg-white group">
                                    <div className="flex items-center gap-2">
                                        <div className="text-xl opacity-50 group-hover:scale-110 transition-transform">📂</div>
                                        <span className="text-xs font-semibold text-slate-600">Select PDF</span>
                                    </div>
                                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
                                </label>
                            ) : (
                                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between group hover:border-indigo-300 transition-colors">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center text-sm">📄</div>
                                        <div className="min-w-0">
                                            <p className="font-bold truncate text-xs text-slate-700 max-w-[160px]">{file.name}</p>
                                            <p className="text-[10px] text-slate-400">{pageCount} Pages</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setFile(null)} className="text-[10px] font-bold text-slate-400 hover:text-red-500 px-2">CHANGE</button>
                                </div>
                            )}
                        </div>

                        {file && (
                            <>
                                {/* 2. Layout (Position & Margin) */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Position</label>
                                    <div className="flex gap-3">
                                        {/* Grid Widget */}
                                        <div className="grid grid-cols-3 gap-1 w-20 flex-none bg-slate-100 p-1 rounded-lg">
                                            {POSITIONS.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => setPosition(p.id)}
                                                    className={`aspect-square rounded flex items-center justify-center transition-all duration-200
                                                        ${position === p.id
                                                            ? 'bg-indigo-600 shadow-md transform scale-105'
                                                            : 'hover:bg-white text-slate-300'}`}
                                                    title={p.label}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${position === p.id ? 'bg-white' : 'bg-current'}`}></div>
                                                </button>
                                            ))}
                                        </div>
                                        {/* Margin Input */}
                                        <div className="flex-1 flex flex-col justify-center space-y-3">
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] uppercase font-bold text-slate-500">Margin</span>
                                                    <span className="text-[10px] text-slate-400">{margin}px</span>
                                                </div>
                                                <input type="range" min="0" max="100" value={margin} onChange={e => setMargin(Number(e.target.value))} className="w-full h-1 bg-slate-200 rounded-full appearance-none accent-indigo-600" />
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] uppercase font-bold text-slate-500">Start #</span>
                                                </div>
                                                <input type="number" value={startNumber} onChange={e => setStartNumber(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-mono focus:border-indigo-500 outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Format */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Format</label>
                                    <select
                                        value={format}
                                        onChange={e => setFormat(e.target.value)}
                                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all"
                                    >
                                        <option value="1">1, 2, 3...</option>
                                        <option value="1 of n">1 of 5, 2 of 5...</option>
                                        <option value="Page 1">Page 1, Page 2...</option>
                                        <option value="Page 1 of n">Page 1 of 5...</option>
                                        <option value="custom">Custom Format...</option>
                                    </select>

                                    {format === 'custom' && (
                                        <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                                            <input
                                                type="text"
                                                value={customText}
                                                onChange={(e) => setCustomText(e.target.value)}
                                                placeholder="{n} of {total}"
                                                className="w-full px-3 py-2 rounded-lg border border-indigo-300 bg-indigo-50/50 text-indigo-900 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <p className="text-[10px] text-indigo-400 mt-1">Variables: {'{n}'}, {'{total}'}</p>
                                        </div>
                                    )}
                                </div>

                                {/* 4. Range */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scope</label>
                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        {['all', 'skip-first', 'custom'].map(rt => (
                                            <button
                                                key={rt}
                                                onClick={() => setRangeType(rt)}
                                                className={`flex-1 py-1.5 text-[10px] uppercase font-bold rounded-md transition-all ${rangeType === rt ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {rt === 'skip-first' ? 'Skip Cover' : rt}
                                            </button>
                                        ))}
                                    </div>
                                    {rangeType === 'custom' && (
                                        <input
                                            type="text"
                                            placeholder="e.g. 2-5, 8"
                                            value={customRange}
                                            onChange={e => setCustomRange(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:border-indigo-500 outline-none"
                                        />
                                    )}
                                    <label className="flex items-center gap-2 cursor-pointer select-none group">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${resetNumbering ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300 group-hover:border-indigo-400'}`}>
                                            {resetNumbering && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <input type="checkbox" checked={resetNumbering} onChange={e => setResetNumbering(e.target.checked)} className="hidden" />
                                        <span className="text-xs text-slate-600">Reset count (Page X = {startNumber})</span>
                                    </label>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-slate-200 bg-white sticky bottom-0 z-20">
                        <button
                            onClick={processPDF}
                            disabled={!file || isProcessing}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
                        >
                            {isProcessing ? <span className="animate-spin text-lg">⟳</span> : <span className="text-lg">⚡</span>}
                            {isProcessing ? 'Processing...' : 'Number It'}
                        </button>
                    </div>
                </div>

                {/* MAIN: Preview + Toolbar */}
                <div className={`flex-1 flex flex-col bg-slate-100 min-w-0 ${mobileTab === 'preview' ? 'flex h-full' : 'hidden lg:flex'}`}>
                    {/* Top Toolbar (Styling) */}
                    <div className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-6 overflow-x-auto shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)] z-10">

                        <div className="flex items-center gap-3">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Font</span>
                            <div className="flex items-center gap-2">
                                <select
                                    value={fontFamily}
                                    onChange={e => setFontFamily(e.target.value)}
                                    className="h-8 px-2 pl-3 rounded-lg border border-slate-200 text-xs bg-transparent outline-none hover:border-indigo-400 focus:border-indigo-500 font-medium min-w-[120px]"
                                >
                                    <option value="Helvetica">Helvetica</option>
                                    <option value="Times">Times New Roman</option>
                                    <option value="Courier">Courier</option>
                                </select>
                                <input
                                    type="number"
                                    value={fontSize}
                                    onChange={e => setFontSize(Number(e.target.value))}
                                    className="w-14 h-8 px-2 rounded-lg border border-slate-200 text-xs text-center outline-none focus:border-indigo-500 font-medium"
                                    title="Font Size"
                                />
                            </div>
                        </div>

                        <div className="w-px h-8 bg-slate-100"></div>

                        <div className="flex items-center gap-3">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Style</span>
                            <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                                <button onClick={() => setIsBold(!isBold)} className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm transition-all ${isBold ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-700'}`}>B</button>
                                <button onClick={() => setIsItalic(!isItalic)} className={`w-8 h-8 rounded-md flex items-center justify-center italic font-serif text-sm transition-all ${isItalic ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-700'}`}>I</button>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 h-10 hover:border-slate-300 transition-colors cursor-pointer relative group">
                                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-6 h-6 rounded border-none bg-transparent cursor-pointer absolute opacity-0 inset-0 z-10" />
                                <div className="w-6 h-6 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: color }}></div>
                                <span className="text-[10px] font-mono text-slate-500 uppercase">{color}</span>
                            </div>
                        </div>

                        <div className="w-px h-8 bg-slate-100"></div>

                        <div className="flex items-center gap-3 min-w-[200px]">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Opacity</span>
                            <div className="flex-1 flex items-center gap-3">
                                <input type="range" min="0.1" max="1" step="0.1" value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))} className="flex-1 h-1.5 bg-slate-200 rounded-full appearance-none accent-indigo-600 cursor-pointer" />
                                <span className="text-xs font-medium text-slate-500 w-8 text-right">{Math.round(opacity * 100)}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Preview Canvas */}
                    <div className="flex-1 overflow-auto bg-slate-100 flex items-center justify-center p-8 relative">
                        {/* Dot Pattern Background */}
                        <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                        {!file ? (
                            <div className="text-center opacity-40 select-none z-10">
                                <div className="text-7xl mb-6 animate-bounce">📄</div>
                                <p className="font-bold text-slate-400 text-2xl tracking-tight">Preview Canvas</p>
                                <p className="text-slate-400 mt-2">Upload a document to begin editing</p>
                            </div>
                        ) : loading ? (
                            <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center z-10">
                                <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin shadow-xl"></div>
                                <p className="mt-6 text-indigo-600 font-bold bg-white px-4 py-1 rounded-full shadow-sm text-sm">Rendering Preview...</p>
                            </div>
                        ) : previewUrl && (
                            <div className="relative shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] transition-all duration-300 z-10 group">
                                <img src={previewUrl} alt="Preview" className="max-w-none rounded shadow-sm border border-slate-200 bg-white" style={{ maxHeight: 'calc(100vh - 180px)' }} />
                                {/* Live Overlay */}
                                {previewInfo.show && (
                                    <div
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150 border-2 border-indigo-500 bg-indigo-500/10 backdrop-blur-[2px] px-3 py-1 whitespace-nowrap z-20 hover:bg-indigo-500/20 shadow-sm rounded-[4px] cursor-move select-none"
                                        style={{
                                            left: position.includes('left') ? '0%' : position.includes('right') ? '100%' : '50%',
                                            top: position.includes('top') ? '0%' : '100%',
                                            marginLeft: position.includes('left') ? `${margin / 2}px` : 0,
                                            marginRight: position.includes('right') ? `${margin / 2}px` : 0,
                                            marginTop: position.includes('top') ? `${margin / 2}px` : 0,
                                            marginBottom: position.includes('bottom') ? `${margin / 2}px` : 0,
                                            transform: `translate(${position.includes('left') ? '0' : position.includes('right') ? '-100%' : '-50%'}, ${position.includes('top') ? '0' : '-100%'})`,
                                            fontSize: `${fontSize * 0.8}px`,
                                            color: color,
                                            fontFamily: fontFamily === 'Times' ? 'Times New Roman' : fontFamily === 'Courier' ? 'Courier New' : 'Helvetica, sans-serif',
                                            fontWeight: isBold ? 'bold' : 'normal',
                                            fontStyle: isItalic ? 'italic' : 'normal',
                                            opacity: opacity
                                        }}
                                    >
                                        {format === 'custom'
                                            ? customText.replace('{n}', previewInfo.number).replace('{total}', previewInfo.total)
                                            : format.replace('1', previewInfo.number).replace('n', previewInfo.total)
                                        }
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden h-16 bg-white border-t border-slate-200 flex items-center justify-around shrink-0 z-30 pb-safe">
                <button
                    onClick={() => setMobileTab('settings')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${mobileTab === 'settings' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}
                >
                    <div className="text-xl">⚙️</div>
                    <span className="text-[10px] font-bold uppercase">Settings</span>
                </button>
                <button
                    onClick={() => setMobileTab('preview')}
                    disabled={!file}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${mobileTab === 'preview' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'} ${!file ? 'opacity-50 grayscale' : ''}`}
                >
                    <div className="text-xl">👁️</div>
                    <span className="text-[10px] font-bold uppercase">Preview</span>
                </button>
            </div>
        </div>
    );
}
