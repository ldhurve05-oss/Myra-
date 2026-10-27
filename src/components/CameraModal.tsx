import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, X, Download, Check, Sparkles, SwitchCamera } from 'lucide-react';
import { sounds } from '../utils/audio';

interface CameraModalProps {
  isSelfie?: boolean;
  onClose: () => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isSelfie = true,
  onClose,
}) => {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    isSelfie ? 'user' : 'environment'
  );
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [flashAnimation, setFlashAnimation] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    stopCamera();
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.warn('Camera access unavailable or simulated:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const takePhoto = () => {
    setFlashAnimation(true);
    sounds.playSuccess();
    setTimeout(() => setFlashAnimation(false), 200);

    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        setCapturedImage(canvas.toDataURL('image/png'));
      }
    } else {
      setCapturedImage(
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'
      );
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-black border border-slate-800 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Flash White Screen Overlay */}
        {flashAnimation && (
          <div className="absolute inset-0 bg-white z-50 animate-in fade-in duration-75" />
        )}

        {/* Top Header */}
        <div className="p-3.5 bg-black/60 backdrop-blur-md flex items-center justify-between text-white z-20">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-pink-400" />
            <span className="text-xs font-bold">
              {facingMode === 'user' ? 'Front Camera (Selfie)' : 'Rear Camera'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleCamera}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
              title="Switch camera"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Camera Viewfinder */}
        <div className="relative aspect-[3/4] bg-slate-950 flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                facingMode === 'user' ? 'transform -scale-x-100' : ''
              }`}
            />
          )}

          {/* Golden ratio viewfinder grid marks */}
          {!capturedImage && (
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>
          )}
        </div>

        {/* Bottom Shutter Bar */}
        <div className="p-4 bg-black flex items-center justify-around z-20">
          {capturedImage ? (
            <>
              <button
                onClick={() => setCapturedImage(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700 transition"
              >
                Retake
              </button>
              <a
                href={capturedImage}
                download="myra-selfie.png"
                className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-pink-600/30 transition active:scale-95"
              >
                <Download className="w-4 h-4" /> Save Photo
              </a>
            </>
          ) : (
            <>
              <div className="w-10" />
              {/* Shutter Button */}
              <button
                onClick={takePhoto}
                className="w-16 h-16 rounded-full border-4 border-white p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-lg shadow-white/20 cursor-pointer"
              >
                <div className="w-full h-full rounded-full bg-white active:bg-slate-300" />
              </button>

              <button
                onClick={toggleCamera}
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
