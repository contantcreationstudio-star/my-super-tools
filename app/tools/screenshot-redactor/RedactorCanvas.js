'use client';

import React, { useState, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect } from 'react-konva';
import Konva from 'konva';
import { Download, Undo, Eraser, MousePointer2, EyeOff, Grid3X3, Square } from 'lucide-react';

export default function RedactorCanvas({ image, imageUrl, onReset }) {
    const [tool, setTool] = useState('pixelate'); // 'blur', 'pixelate', 'blackout'
    const [rectangles, setRectangles] = useState([]);
    const [newRect, setNewRect] = useState(null);
    const stageRef = useRef(null);
    const isDrawing = useRef(false);

    // Calculate canvas size to fit screen while maintaining aspect ratio
    const maxWidth = Math.min(window.innerWidth - 40, 1000); // Max width of container
    const scaleRatio = maxWidth / image.width;
    const stageWidth = maxWidth;
    const stageHeight = image.height * scaleRatio;

    // --- MOUSE EVENTS ---
    const handleMouseDown = (e) => {
        isDrawing.current = true;
        const pos = e.target.getStage().getPointerPosition();
        // Adjust for scale
        const x = pos.x / scaleRatio;
        const y = pos.y / scaleRatio;
        
        setNewRect({ x, y, width: 0, height: 0, type: tool });
    };

    const handleMouseMove = (e) => {
        if (!isDrawing.current || !newRect) return;
        const pos = e.target.getStage().getPointerPosition();
        const x = pos.x / scaleRatio;
        const y = pos.y / scaleRatio;

        setNewRect({
            ...newRect,
            width: x - newRect.x,
            height: y - newRect.y,
        });
    };

    const handleMouseUp = () => {
        isDrawing.current = false;
        if (newRect) {
            // Only add if it has some size
            if (Math.abs(newRect.width) > 5 && Math.abs(newRect.height) > 5) {
                setRectangles([...rectangles, newRect]);
            }
            setNewRect(null);
        }
    };

    // --- DOWNLOAD LOGIC ---
    const handleDownload = () => {
        const stage = stageRef.current;
        // Export at full resolution (1/scaleRatio)
        const dataURL = stage.toDataURL({ pixelRatio: 1 / scaleRatio });
        
        const link = document.createElement('a');
        link.download = 'redacted-image-secure.png';
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUndo = () => {
        setRectangles(rectangles.slice(0, -1));
    };

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-2">
                    <button 
                        onClick={() => setTool('blur')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${tool === 'blur' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-700 border hover:bg-slate-100'}`}
                    >
                        <EyeOff size={18} /> Blur
                    </button>
                    <button 
                        onClick={() => setTool('pixelate')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${tool === 'pixelate' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-700 border hover:bg-slate-100'}`}
                    >
                        <Grid3X3 size={18} /> Pixelate
                    </button>
                    <button 
                        onClick={() => setTool('blackout')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${tool === 'blackout' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-700 border hover:bg-slate-100'}`}
                    >
                        <Square size={18} fill="currentColor" /> Blackout
                    </button>
                </div>

                <div className="flex gap-2">
                    <button onClick={handleUndo} disabled={rectangles.length === 0} className="p-2 text-slate-600 hover:text-slate-900 bg-white border rounded-lg disabled:opacity-50">
                        <Undo size={20} />
                    </button>
                    <button onClick={onReset} className="p-2 text-red-600 hover:text-red-700 bg-white border rounded-lg" title="Clear All">
                        <Eraser size={20} />
                    </button>
                    <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-green-500/20 shadow-lg transition"
                    >
                        <Download size={18} /> Save Image
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="bg-slate-200 overflow-auto flex justify-center p-4 cursor-crosshair relative">
                 {/* NOTE: We scale the Stage to fit the screen, but the inner content uses 
                    scale({ x: scaleRatio, y: scaleRatio }) to render the image correctly.
                 */}
                <Stage 
                    width={stageWidth} 
                    height={stageHeight} 
                    onMouseDown={handleMouseDown}
                    onMousemove={handleMouseMove}
                    onMouseup={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseUp}
                    ref={stageRef}
                    className="shadow-2xl"
                >
                    <Layer scaleX={scaleRatio} scaleY={scaleRatio}>
                        {/* 1. Base Original Image */}
                        <KonvaImage image={image} />

                        {/* 2. Render Redactions (The Magic) */}
                        {rectangles.map((rect, i) => {
                            if (rect.type === 'blackout') {
                                return (
                                    <Rect
                                        key={i}
                                        x={rect.x}
                                        y={rect.y}
                                        width={rect.width}
                                        height={rect.height}
                                        fill="black"
                                    />
                                );
                            } else {
                                // For Blur/Pixelate: We render a cropped version of the original image
                                // at the rectangle's position and apply the filter to IT.
                                return (
                                    <KonvaImage
                                        key={i}
                                        image={image}
                                        crop={{
                                            x: rect.x,
                                            y: rect.y,
                                            width: rect.width,
                                            height: rect.height
                                        }}
                                        x={rect.x}
                                        y={rect.y}
                                        width={rect.width}
                                        height={rect.height}
                                        filters={[rect.type === 'blur' ? Konva.Filters.Blur : Konva.Filters.Pixelate]}
                                        blurRadius={20} // Intensity for Blur
                                        pixelSize={15}  // Intensity for Pixelate
                                    />
                                );
                            }
                        })}

                        {/* 3. Drawing Preview (While dragging) */}
                        {newRect && (
                            <Rect
                                x={newRect.x}
                                y={newRect.y}
                                width={newRect.width}
                                height={newRect.height}
                                fill={newRect.type === 'blackout' ? 'black' : 'white'}
                                opacity={0.5}
                                stroke="blue"
                                strokeWidth={1 / scaleRatio} // Keep stroke thin regardless of zoom
                            />
                        )}
                    </Layer>
                </Stage>
            </div>
            
            <div className="bg-slate-50 text-center py-2 text-xs text-slate-400 border-t">
                Privacy Mode Active: Images are processed in-memory and never uploaded.
            </div>
        </div>
    );
}