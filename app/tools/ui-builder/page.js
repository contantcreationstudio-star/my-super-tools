'use client';

import React, { useState } from 'react';
import { COMPONENT_REGISTRY } from './registry';
import { Trash2, Copy, Code, Layers, Plus } from 'lucide-react';
import AdUnit from '@/components/AdUnit'; // Adjust path based on your project

export default function UIBuilder() {
    // State to hold the list of items added to the canvas
    const [canvasItems, setCanvasItems] = useState([]);
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [copied, setCopied] = useState(false);

    // Function to add a component to the canvas
    const addItem = (component) => {
        const newItem = {
            ...component,
            uniqueId: Date.now() + Math.random().toString(36).substr(2, 9), // Generate unique ID
        };
        setCanvasItems([...canvasItems, newItem]);
    };

    // Function to remove a component
    const removeItem = (uniqueId) => {
        setCanvasItems(canvasItems.filter(item => item.uniqueId !== uniqueId));
    };

    // Function to generate the full HTML code
    const generateCode = () => {
        return canvasItems.map(item => item.content).join('\n\n\n');
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(generateCode());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden">
            
            {/* Top Bar / Header */}
            <header className="h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-2">
                    <Layers className="text-blue-500 w-6 h-6" />
                    <h1 className="font-bold text-lg text-white">UI Builder <span className="text-xs bg-blue-600 px-2 py-0.5 rounded text-white ml-2">Beta</span></h1>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setCanvasItems([])}
                        className="px-4 py-2 text-sm text-slate-400 hover:text-white transition"
                    >
                        Clear Canvas
                    </button>
                    <button 
                        onClick={() => setShowCodeModal(true)}
                        className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
                    >
                        <Code className="w-4 h-4" />
                        Export Code
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* Sidebar (Component Palette) */}
                <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
                    <div className="p-4 border-b border-slate-800">
                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Components</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {COMPONENT_REGISTRY.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => addItem(item)}
                                className="w-full flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 rounded-lg group transition-all text-left"
                            >
                                <div className="p-2 bg-slate-700 rounded text-slate-300 group-hover:text-blue-400 group-hover:bg-slate-900 transition">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-slate-200 text-sm">{item.label}</p>
                                    <p className="text-xs text-slate-500">Click to add</p>
                                </div>
                                <Plus className="w-4 h-4 text-slate-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 bg-slate-950 overflow-y-auto p-8 relative">
                    
                    {canvasItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
                            <Layers className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">Canvas is Empty</p>
                            <p className="text-sm">Click components from the sidebar to start building.</p>
                        </div>
                    ) : (
                        <div className="min-h-full space-y-2 pb-20">
                            {canvasItems.map((item, index) => (
                                <div key={item.uniqueId} className="group relative border border-transparent hover:border-blue-500/50 rounded transition-all">
                                    {/* Action Bar (Visible on Hover) */}
                                    <div className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button 
                                            onClick={() => removeItem(item.uniqueId)}
                                            className="bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600"
                                            title="Remove Component"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                    
                                    {/* Render HTML Content */}
                                    <div dangerouslySetInnerHTML={{ __html: item.content }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Code Export Modal */}
            {showCodeModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[80vh]">
                        <div className="flex items-center justify-between p-4 border-b border-slate-800">
                            <h3 className="font-bold text-lg text-white">Export Code</h3>
                            <button onClick={() => setShowCodeModal(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-sm text-blue-300">
                            <pre className="whitespace-pre-wrap break-all">{generateCode() || ''}</pre>
                        </div>
                        <div className="p-4 border-t border-slate-800 flex justify-end gap-3">
                            <button onClick={() => setShowCodeModal(false)} className="px-4 py-2 text-slate-300 hover:text-white">Close</button>
                            <button 
                                onClick={handleCopyCode}
                                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition"
                            >
                                {copied ? 'Copied!' : <><Copy className="w-4 h-4" /> Copy HTML</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <AdUnit />
        </div>
    );
}