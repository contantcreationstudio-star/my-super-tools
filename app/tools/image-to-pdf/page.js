'use client';

import { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import AdUnit from '../../../components/AdUnit';

export default function ImageToPdf() {
    const [images, setImages] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [orientation, setOrientation] = useState('portrait'); // 'portrait' | 'landscape'
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);
    const [compression, setCompression] = useState(1.0); // 1.0 = Original, 0.75 = High, 0.5 = Medium, 0.25 = Low

    const fileInputRef = useRef(null);

    // Renaming State
    const [editingIndex, setEditingIndex] = useState(null);
    const [editName, setEditName] = useState("");

    const startEditing = (index, currentName) => {
        setEditingIndex(index);
        setEditName(currentName);
    };

    const saveName = (index) => {
        if (editName.trim()) {
            const newImages = [...images];
            newImages[index].name = editName.trim();
            setImages(newImages);
        }
        setEditingIndex(null);
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Enter') {
            saveName(index);
        } else if (e.key === 'Escape') {
            setEditingIndex(null);
        }
    };

    // Helper to format bytes
    const formatBytes = (bytes, decimals = 1) => {
        if (!+bytes) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    // Calculate estimated total size
    const estimatedSize = images.reduce((acc, img) => acc + img.file.size, 0) * compression;

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newImages = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            url: URL.createObjectURL(file), // Create URL once
            name: file.name
        }));

        setImages(prev => [...prev, ...newImages]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        if (files.length === 0) return;

        const newImages = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            url: URL.createObjectURL(file),
            name: file.name
        }));

        setImages(prev => [...prev, ...newImages]);
    };

    // --- Reordering Logic ---

    const moveImage = (index, direction) => {
        if (direction === -1 && index === 0) return;
        if (direction === 1 && index === images.length - 1) return;

        const newImages = [...images];
        const temp = newImages[index];
        newImages[index] = newImages[index + direction];
        newImages[index + direction] = temp;
        setImages(newImages);
    };

    const moveToPosition = (index, position) => {
        const newImages = [...images];
        const item = newImages.splice(index, 1)[0];

        if (position === 'top') {
            newImages.unshift(item);
        } else if (position === 'bottom') {
            newImages.push(item);
        }
        setImages(newImages);
    };

    // --- Drag & Drop Logic (Native HTML5) ---

    const onDragStart = (e, index) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const onDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const onDropItem = (e, targetIndex) => {
        e.preventDefault();
        if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;

        const newImages = [...images];
        const itemToMove = newImages[draggedItemIndex];

        // Remove from old position
        newImages.splice(draggedItemIndex, 1);
        // Insert at new position
        newImages.splice(targetIndex, 0, itemToMove);

        setImages(newImages);
        setDraggedItemIndex(null);
    };

    const onDragEnd = () => {
        setDraggedItemIndex(null);
    };

    const deleteImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // Helper to compress image if needed
    const getProcessedImage = (imgUrl, quality) => {
        return new Promise((resolve) => {
            if (quality >= 1.0) {
                resolve(imgUrl); // No compression
                return;
            }

            const img = new Image();
            img.src = imgUrl;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
        });
    };

    const generatePdf = async () => {
        if (images.length === 0) return;
        setIsGenerating(true);

        try {
            const doc = new jsPDF({
                orientation: orientation,
                unit: 'mm',
                format: 'a4'
            });

            for (let i = 0; i < images.length; i++) {
                if (i > 0) doc.addPage();

                const img = images[i];
                // Process image with compression if needed
                const imgData = await getProcessedImage(img.url, compression);

                const imgProps = doc.getImageProperties(imgData);
                const pdfWidth = doc.internal.pageSize.getWidth();
                const pdfHeight = doc.internal.pageSize.getHeight();

                const imgWidth = imgProps.width;
                const imgHeight = imgProps.height;

                // Calculate ratio to fit page with small margin
                const margin = 10;
                const availableWidth = pdfWidth - (margin * 2);
                const availableHeight = pdfHeight - (margin * 2);

                const widthRatio = availableWidth / imgWidth;
                const heightRatio = availableHeight / imgHeight;
                const ratio = Math.min(widthRatio, heightRatio);

                const w = imgWidth * ratio;
                const h = imgHeight * ratio;

                // Center image
                const x = (pdfWidth - w) / 2;
                const y = (pdfHeight - h) / 2;

                doc.addImage(imgData, 'JPEG', x, y, w, h);
            }

            doc.save('merged-document.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-rose-50 font-sans selection:bg-rose-200 pb-20">
            {/* Sticky Header */}
            <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-rose-100 shadow-sm supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📄</span>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 tracking-tight">
                                JPG to <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">PDF</span>
                            </h1>
                            <p className="text-xs text-slate-500 font-medium hidden sm:block">Merge multiple images into one document</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">

                {/* Upload Area */}
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-3 border-dashed border-rose-200 rounded-3xl p-10 text-center bg-white/50 hover:bg-rose-50 hover:border-rose-400 transition-all cursor-pointer group animate-in fade-in zoom-in duration-300"
                >
                    <input
                        type="file"
                        multiple
                        accept="image/jpeg, image/png, image/jpg"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                    <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform text-3xl shadow-sm">
                        ☁️
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-1 group-hover:text-rose-600 transition-colors">
                        Click or Drag Images Here
                    </h3>
                    <p className="text-slate-400 text-sm">Supports JPG, PNG</p>
                </div>

                {/* Main Content Area: Split View */}
                {images.length > 0 && (
                    <div className="grid lg:grid-cols-3 gap-8 items-start">

                        {/* Left: Visual Grid */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-700">Visual Overview</h2>
                                <span className="text-sm text-slate-400">{images.length} Pages • Est. {formatBytes(estimatedSize)}</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                {images.map((img, index) => (
                                    <div
                                        key={img.id}
                                        draggable="true"
                                        onDragStart={(e) => onDragStart(e, index)}
                                        onDragOver={(e) => onDragOver(e, index)}
                                        onDrop={(e) => onDropItem(e, index)}
                                        onDragEnd={onDragEnd}
                                        className={`group relative bg-slate-50 rounded-3xl p-3 shadow-sm border transition-all duration-300 cursor-move ${draggedItemIndex === index
                                            ? 'border-rose-300 opacity-50 scale-95'
                                            : 'border-slate-100 hover:shadow-xl hover:-translate-y-1'
                                            }`}
                                    >
                                        <div
                                            className={`relative mx-auto bg-white shadow-sm border border-slate-200 transition-all duration-500 cursor-zoom-in ${orientation === 'portrait' ? 'aspect-[210/297] w-[80%]' : 'aspect-[297/210] w-full'
                                                }`}
                                            onClick={() => setPreviewImage(img)}
                                        >
                                            <div className="absolute inset-0 p-2 flex items-center justify-center">
                                                <img
                                                    src={img.url}
                                                    alt={img.name}
                                                    className="max-w-full max-h-full object-contain pointer-events-none shadow-sm"
                                                />
                                            </div>

                                            <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md">
                                                {index + 1}
                                            </div>
                                            <div className="absolute top-2 right-2 bg-rose-100 text-rose-600 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                                {formatBytes(img.file.size)}
                                            </div>
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <span className="bg-white/90 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                                                    🔍 Preview
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3">
                                            <div className="flex-1 flex gap-1 bg-white p-1 rounded-xl border border-slate-100">
                                                <button
                                                    onClick={() => moveImage(index, -1)}
                                                    disabled={index === 0}
                                                    className="flex-1 py-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg disabled:opacity-30 transition-all font-bold text-lg"
                                                    title="Move Up"
                                                >
                                                    ⬅️
                                                </button>
                                                <div className="w-[1px] bg-slate-100 my-1"></div>
                                                <button
                                                    onClick={() => moveImage(index, 1)}
                                                    disabled={index === images.length - 1}
                                                    className="flex-1 py-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg disabled:opacity-30 transition-all font-bold text-lg"
                                                    title="Move Down"
                                                >
                                                    ➡️
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => deleteImage(index)}
                                                className="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                                title="Remove"
                                            >
                                                ❌
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Layer System Sidebar */}
                        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm sticky top-24 overflow-hidden flex flex-col max-h-[calc(100vh-120px)]">
                            <div className="p-4 border-b border-rose-50 bg-rose-50/50 flex items-center justify-between shrink-0">
                                <h2 className="font-bold text-slate-700 flex items-center gap-2">
                                    <span className="text-lg">📚</span> Layers
                                </h2>
                                <button
                                    onClick={() => setImages([])}
                                    className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                                {images.map((img, index) => (
                                    <div
                                        key={img.id}
                                        draggable="true"
                                        onDragStart={(e) => onDragStart(e, index)}
                                        onDragOver={(e) => onDragOver(e, index)}
                                        onDrop={(e) => onDropItem(e, index)}
                                        onDragEnd={onDragEnd}
                                        className={`flex items-center gap-3 p-2 rounded-xl border transition-all cursor-move select-none ${draggedItemIndex === index
                                            ? 'bg-rose-50 border-rose-300 opacity-50'
                                            : 'bg-white hover:bg-slate-50 border-transparent hover:border-slate-100'
                                            }`}
                                    >
                                        <div className="w-6 text-center text-xs font-bold text-slate-400 cursor-grab active:cursor-grabbing">
                                            ⋮⋮ {index + 1}
                                        </div>
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 pointer-events-none relative">
                                            <img src={img.url} alt="thumb" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {editingIndex === index ? (
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    onBlur={() => saveName(index)}
                                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                                    autoFocus
                                                    className="w-full text-xs font-medium text-slate-700 p-1 border border-rose-300 rounded outline-none bg-rose-50"
                                                />
                                            ) : (
                                                <div
                                                    className="text-xs font-medium text-slate-700 truncate cursor-text hover:text-rose-600 transition-colors"
                                                    title="Click to rename"
                                                    onClick={() => startEditing(index, img.name)}
                                                >
                                                    {img.name}
                                                </div>
                                            )}
                                            <div className="text-[10px] text-slate-400">
                                                {formatBytes(img.file.size)}
                                            </div>
                                        </div>

                                        {/* Layer Controls */}
                                        <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                            {editingIndex !== index && (
                                                <button
                                                    onClick={() => startEditing(index, img.name)}
                                                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors mr-1"
                                                    title="Rename"
                                                >
                                                    ✎
                                                </button>
                                            )}
                                            <div className="flex flex-col gap-0.5">
                                                <button
                                                    onClick={() => moveToPosition(index, 'top')}
                                                    disabled={index === 0}
                                                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 disabled:opacity-20 transition-colors"
                                                    title="Move to Top"
                                                >
                                                    ⤒
                                                </button>
                                                <button
                                                    onClick={() => moveImage(index, -1)}
                                                    disabled={index === 0}
                                                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 disabled:opacity-20 transition-colors"
                                                    title="Move Up"
                                                >
                                                    ↑
                                                </button>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <button
                                                    onClick={() => moveToPosition(index, 'bottom')}
                                                    disabled={index === images.length - 1}
                                                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 disabled:opacity-20 transition-colors"
                                                    title="Move to Bottom"
                                                >
                                                    ⤓
                                                </button>
                                                <button
                                                    onClick={() => moveImage(index, 1)}
                                                    disabled={index === images.length - 1}
                                                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 disabled:opacity-20 transition-colors"
                                                    title="Move Down"
                                                >
                                                    ↓
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => deleteImage(index)}
                                                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors ml-1"
                                                title="Delete"
                                            >
                                                ❌
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 border-t border-rose-50 bg-white space-y-3 shrink-0">

                                {/* Compression Selector */}
                                <div className="space-y-1">
                                    <div className="flex justify-between items-end">
                                        <label className="text-xs font-bold text-slate-500">Compression</label>
                                        <span className="text-xs font-medium text-rose-500">{Math.round((1 - compression) * 100)}% Saved</span>
                                    </div>
                                    <select
                                        value={compression}
                                        onChange={(e) => setCompression(parseFloat(e.target.value))}
                                        className="w-full text-sm p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all font-medium"
                                    >
                                        <option value={1.0}>Original Quality (Largest)</option>
                                        <option value={0.8}>High Quality (Good)</option>
                                        <option value={0.6}>Medium Quality (Balanced)</option>
                                        <option value={0.4}>Low Quality (Smallest)</option>
                                    </select>
                                </div>

                                {/* Orientation Toggle */}
                                <div className="flex items-center justify-between bg-slate-50 p-1 rounded-xl border border-slate-100">
                                    <button
                                        onClick={() => setOrientation('portrait')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${orientation === 'portrait' ? 'bg-white text-rose-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <span className="text-base">📄</span> Portrait
                                    </button>
                                    <button
                                        onClick={() => setOrientation('landscape')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${orientation === 'landscape' ? 'bg-white text-rose-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <span className="text-base rotate-90">📄</span> Landscape
                                    </button>
                                </div>

                                {/* Estimated Size Display */}
                                <div className="bg-rose-50 rounded-lg p-2 text-center border border-rose-100">
                                    <span className="text-xs text-rose-400 font-medium">Est. PDF Size: </span>
                                    <span className="text-sm font-bold text-rose-600">{formatBytes(estimatedSize)}</span>
                                </div>

                                <button
                                    onClick={generatePdf}
                                    disabled={isGenerating}
                                    className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/30 hover:shadow-rose-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        <>Convert {images.length} Pages</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-12 text-center">
                    <AdUnit />
                </div>
            </main>

            {/* Simple Lightbox Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setPreviewImage(null)}
                >
                    <button
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-all"
                    >
                        ✕
                    </button>
                    <img
                        src={previewImage.url}
                        alt="Full Preview"
                        className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md flex flex-col items-center">
                        <span>{previewImage.name}</span>
                        <span className="text-xs text-white/70">{formatBytes(previewImage.file.size)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
