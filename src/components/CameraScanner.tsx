import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { identifyFood } from '../services/gemini';

interface CameraScannerProps {
  onItemDetected: (item: { name: string; category: string; expiryDays: number }) => void;
  onClose: () => void;
}

export default function CameraScanner({ onItemDetected, onClose }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setError("Could not access camera. Please check permissions.");
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureAndIdentify = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsScanning(true);
    setError(null);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
      
      const result = await identifyFood(base64Image);
      if (result) {
        onItemDetected({
          name: result.name,
          category: result.category,
          expiryDays: result.estimatedExpiryDays
        });
      } else {
        setError("Could not identify food. Try again with better lighting.");
      }
    }
    setIsScanning(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
    >
      <div className="relative w-full max-w-md aspect-[3/4] bg-zinc-900 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Viewfinder Overlay */}
        <div className="absolute inset-0 border-2 border-white/20 m-12 rounded-xl pointer-events-none">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 -mt-1 -ml-1 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 -mt-1 -mr-1 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 -mb-1 -ml-1 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 -mb-1 -mr-1 rounded-br-lg" />
        </div>

        {isScanning && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mb-4" />
            <p className="font-medium">Analyzing food item...</p>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-500/90 text-white p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center gap-6">
        <button 
          onClick={onClose}
          className="p-4 bg-zinc-800 text-white rounded-full hover:bg-zinc-700 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <button 
          onClick={captureAndIdentify}
          disabled={isScanning}
          className="p-6 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
        >
          <Camera className="w-8 h-8" />
        </button>
      </div>
      
      <p className="mt-6 text-zinc-400 text-sm font-medium">
        Point camera at a food item to identify it
      </p>
    </motion.div>
  );
}
