import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenTool, Type, Eraser, Check, X, RotateCcw } from 'lucide-react';

interface SignaturePadProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureDataUrl: string) => void;
  title: string;
}

type SignatureTab = 'draw' | 'type';
type CursiveStyle = 'classic' | 'modern' | 'elegant' | 'artistic';

export const SignaturePad: React.FC<SignaturePadProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
}) => {
  const [activeTab, setActiveTab] = useState<SignatureTab>('draw');
  const [typedName, setTypedName] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<CursiveStyle>('classic');
  
  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas details when tab switches to 'draw' or modal opens
  useEffect(() => {
    if (isOpen && activeTab === 'draw') {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#0f172a'; // slate-900
            ctx.lineWidth = 3;
          }
        }
      }, 100);
    }
  }, [isOpen, activeTab]);

  // Drawing handlers
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    canvas.setPointerCapture(e.pointerId);
    const coords = getEventCoords(e, canvas);
    lastPointRef.current = coords;
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getEventCoords(e, canvas);
    const previous = lastPointRef.current || coords;
    ctx.beginPath();
    ctx.moveTo(previous.x, previous.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    lastPointRef.current = coords;
  };

  const stopDrawing = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(false);
    lastPointRef.current = null;
    if (e) {
      const canvas = canvasRef.current;
      canvas?.releasePointerCapture(e.pointerId);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getEventCoords = (e: React.PointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Convert typed name to cursive font preview family name
  const getFontStyleFamily = (style: CursiveStyle) => {
    switch (style) {
      case 'classic':
        return '"Brush Script MT", "Apple Chancery", cursive';
      case 'modern':
        return '"Lucida Handwriting", "Segoe Print", cursive';
      case 'elegant':
        return '"Georgia", "Times New Roman", serif';
      case 'artistic':
        return '"Courier New", monospace';
      default:
        return 'cursive';
    }
  };

  // Generate typed signature image
  const generateTypedSignaturePng = (text: string, style: CursiveStyle): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const fontFamily = getFontStyleFamily(style);
    ctx.font = `italic bold 44px ${fontFamily}`;
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw typed name
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Elegant underline
    ctx.strokeStyle = '#475569'; // slate-600
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, canvas.height - 35);
    ctx.quadraticCurveTo(
      canvas.width / 2,
      canvas.height - 22,
      canvas.width - 50,
      canvas.height - 40
    );
    ctx.stroke();

    return canvas.toDataURL('image/png');
  };

  const handleSave = () => {
    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (canvas) {
        // Quick verification that canvas is not empty (contains non-transparent pixels)
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const buffer = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = buffer.data;
          let hasDrawn = false;
          for (let i = 3; i < data.length; i += 4) {
            if (data[i] > 10) {
              hasDrawn = true;
              break;
            }
          }
          if (!hasDrawn) {
            alert('Please sign on the canvas before saving.');
            return;
          }
        }
        onSave(canvas.toDataURL('image/png'));
      }
    } else {
      if (!typedName.trim()) {
        alert('Please type your name before saving.');
        return;
      }
      const dataUrl = generateTypedSignaturePng(typedName, selectedStyle);
      onSave(dataUrl);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Modal Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 no-print"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 no-print select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-[#FDFDFB] rounded-2xl border border-gray-200 shadow-2xl w-full max-w-[550px] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 bg-white flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-gray-900">{title}</h3>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest leading-none mt-1">
                    Digital Electronic Signature
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full text-gray-400 hover:text-black hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mode Tabs */}
              <div className="px-6 pt-4 bg-gray-50/50 flex border-b border-gray-200 gap-4">
                <button
                  onClick={() => setActiveTab('draw')}
                  className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'draw'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  Draw Signature
                </button>
                <button
                  onClick={() => setActiveTab('type')}
                  className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'type'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  Type Cursive
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-6 flex-1 bg-white">
                {activeTab === 'draw' ? (
                  <div className="space-y-4">
                    <div className="relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50/30 h-[180px]">
                      <canvas
                        ref={canvasRef}
                        onPointerDown={startDrawing}
                        onPointerMove={draw}
                        onPointerUp={stopDrawing}
                        onPointerCancel={stopDrawing}
                        onPointerLeave={stopDrawing}
                        className="w-full h-full cursor-crosshair touch-none"
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={clearCanvas}
                          className="p-1.5 bg-white border border-gray-200 hover:border-gray-400 text-gray-500 rounded-lg transition-all shadow-sm flex items-center gap-1 text-[10px] font-bold uppercase cursor-pointer"
                        >
                          <Eraser className="w-3 h-3 text-red-500" />
                          Clear
                        </button>
                      </div>
                      
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-[10px] text-gray-400 font-semibold uppercase tracking-wider pointer-events-none">
                        Draw your signature by hand with mouse, touch, or stylus
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">Type Your Name</label>
                      <input
                        type="text"
                        value={typedName}
                        onChange={(e) => setTypedName(e.target.value)}
                        placeholder="e.g. Johnathan Doe"
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cursive Typography Theme</label>
                      <div className="grid grid-cols-4 gap-2">
                        {(['classic', 'modern', 'elegant', 'artistic'] as CursiveStyle[]).map((style) => (
                          <button
                            key={style}
                            type="button"
                            onClick={() => setSelectedStyle(style)}
                            className={`py-1.5 px-2 text-2xs font-bold uppercase tracking-wider border rounded-lg transition-all cursor-pointer ${
                              selectedStyle === style
                                ? 'bg-black border-black text-white'
                                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Styled Cursive Signature Preview Card */}
                    <div className="border border-gray-100 bg-gray-50/50 rounded-xl h-[120px] flex items-center justify-center p-6 relative overflow-hidden">
                      <div className="absolute top-2 left-2 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                        Signature Preview
                      </div>
                      
                      {typedName.trim() ? (
                        <div className="text-center w-full">
                          <p
                            style={{ fontFamily: getFontStyleFamily(selectedStyle) }}
                            className="text-4xl italic text-slate-900 truncate duration-300 transform select-none"
                          >
                            {typedName}
                          </p>
                          <div className="w-[80%] mx-auto h-[1.5px] bg-slate-400 mt-2 rounded" />
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">Cursive signature will generate dynamically as you type</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-6 border-t border-gray-200 bg-white flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold border border-gray-200 hover:border-gray-400 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-[0.98]"
                >
                  <Check className="w-3.5 h-3.5" />
                  Apply Signature
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
