// @ts-nocheck
import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Volume2, VolumeX, AlertCircle, RefreshCw } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  lang: 'en' | 'bn';
  title?: string;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  lang,
  title
}) => {
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [muteSound, setMuteSound] = useState<boolean>(() => {
    return localStorage.getItem('pos_scanner_mute') === 'true';
  });
  const [continuousScan, setContinuousScan] = useState<boolean>(true);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [scanCooldown, setScanCooldown] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio beep synthesis using Web Audio API
  const playBeep = () => {
    if (muteSound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime); // 1000 Hz beep
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime); // volume control

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12); // Duration of 120ms
    } catch (err) {
      console.warn('Failed to play synthesized scan sound:', err);
    }
  };

  // Persist mute settings
  const toggleMute = () => {
    setMuteSound((prev) => {
      const next = !prev;
      localStorage.setItem('pos_scanner_mute', String(next));
      return next;
    });
  };

  // Load cameras
  useEffect(() => {
    if (!isOpen) return;

    const loadCameras = async () => {
      try {
        const devices = await Html5Qrcode.getCameras().catch((err) => {
          console.log('No hardware camera found or permission denied, fallback to simulated scan mode:', err);
          return [];
        });
        if (devices && devices.length > 0) {
          const formatted = devices.map(d => ({
            id: d.id,
            label: d.label || `Camera ${devices.indexOf(d) + 1}`
          }));
          setCameras(formatted);
          
          // Auto select back/environment camera if available
          const backCam = formatted.find(
            c => c.label.toLowerCase().includes('back') || 
                 c.label.toLowerCase().includes('environment') || 
                 c.label.toLowerCase().includes('rear')
          );
          setSelectedCameraId(backCam ? backCam.id : formatted[0].id);
        } else {
          setCameras([{ id: 'manual', label: 'Manual/Simulation Mode' }]);
          setSelectedCameraId('manual');
        }
      } catch (err: any) {
        console.log('Exception loading cameras:', err);
        setCameras([{ id: 'manual', label: 'Manual/Simulation Mode' }]);
        setSelectedCameraId('manual');
      }
    };

    loadCameras();

    return () => {
      setCameras([]);
      setSelectedCameraId('');
      setError('');
      setIsScanning(false);
      setLastScannedCode('');
      setScanCooldown(false);
      setManualCode('');
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, [isOpen, lang]);

  // Handle Scan Start/Stop lifecycle
  useEffect(() => {
    if (!isOpen || !selectedCameraId) return;
    if (selectedCameraId === 'manual') {
      setIsScanning(true);
      setError('');
      return;
    }

    let isMounted = true;
    const scannerId = 'barcode-scanner-video-element';

    const startScanner = async () => {
      try {
        setIsScanning(false);
        setError('');

        // Ensure container exists in DOM before constructing
        const container = document.getElementById(scannerId);
        if (!container) {
          setTimeout(startScanner, 100);
          return;
        }

        // Initialize scanner if not already created
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode(scannerId);
        }

        // Configuration
        const config = {
          fps: 15,
          qrbox: (width: number, height: number) => ({
            width: Math.min(width * 0.85, 340),
            height: Math.min(height * 0.45, 120)
          }),
          aspectRatio: 1.777778 // Widescreen format
        };

        await scannerRef.current.start(
          selectedCameraId,
          config,
          (decodedText) => {
            if (!isMounted) return;

            // Prevent rapid multi-scans of same barcode
            if (scanCooldown) return;

            setScanCooldown(true);
            setLastScannedCode(decodedText);
            playBeep();
            onScan(decodedText);

            if (continuousScan) {
              // Rate limit continuous scanning to once per 1.5 seconds for same or other items
              cooldownTimerRef.current = setTimeout(() => {
                setScanCooldown(false);
              }, 1500);
            } else {
              // Non-continuous: shut down scanner immediately and close modal
              onClose();
            }
          },
          () => {
            // Frame scanned, but no barcode found. Safe to ignore.
          }
        );

        if (isMounted) {
          setIsScanning(true);
        }
      } catch (err: any) {
        console.log('Error starting scanner stream:', err);
        if (isMounted) {
          setError(
            lang === 'bn'
              ? 'ক্যামেরা চালু করতে সমস্যা হয়েছে। অন্য কোন অ্যাপ ক্যামেরা ব্যবহার করছে কিনা চেক করুন।'
              : 'Error accessing camera. Please verify camera permissions or if it is in use by another application.'
          );
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((e) => console.log('Error stopping scanner during cleanup:', e));
      }
    };
  }, [isOpen, selectedCameraId, continuousScan, scanCooldown, lang]);

  // Handle stop and close manually
  const handleClose = async () => {
    if (selectedCameraId !== 'manual' && scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.log('Failed to stop camera on manual close:', e);
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      {/* Laser scan animation styles */}
      <style>{`
        @keyframes scanLaser {
          0% { top: 12%; opacity: 0.2; }
          50% { top: 88%; opacity: 1; }
          100% { top: 12%; opacity: 0.2; }
        }
        .animate-scan-laser {
          animation: scanLaser 2.2s ease-in-out infinite;
        }
      `}</style>

      <div className="bg-slate-900 text-white rounded-2xl w-full max-w-lg border border-slate-800 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">
                {title || (lang === 'bn' ? 'বারকোড ক্যামেরা স্ক্যানার' : 'Product Barcode Camera Scanner')}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                {lang === 'bn' ? 'POS ও ইনভেন্টরি দ্রুত পণ্য ফাইন্ডার' : 'High-speed POS & Inventory item finder'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 flex flex-col space-y-4 overflow-y-auto">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">
                  {lang === 'bn' ? 'ক্যামেরা ত্রুটি:' : 'Camera Error:'}
                </span>
                <p className="text-slate-300 leading-relaxed font-sans">{error}</p>
              </div>
            </div>
          )}

          {/* Camera Selection Dropdown */}
          {cameras.length > 1 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                {lang === 'bn' ? 'ক্যামেরা ডিভাইস নির্বাচন করুন' : 'Select Camera Device'}
              </label>
              <div className="relative">
                <select
                  value={selectedCameraId}
                  onChange={(e) => setSelectedCameraId(e.target.value)}
                  className="w-full py-2 pl-3.5 pr-10 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {cameras.map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-2.5 pointer-events-none text-slate-400">
                  <RefreshCw size={12} className="animate-spin-slow" />
                </div>
              </div>
            </div>
          )}

          {/* Viewfinder Container */}
          <div className="relative w-full aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
            {/* The Target div to attach Html5Qrcode scan */}
            {selectedCameraId !== 'manual' && (
              <div id="barcode-scanner-video-element" className="w-full h-full object-cover" />
            )}

            {/* Viewfinder Scanning laser and frame Overlay */}
            {selectedCameraId !== 'manual' && isScanning && !error && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10">
                {/* Laser animation */}
                <div className="absolute left-4 right-4 h-[2.5px] bg-red-500 animate-scan-laser shadow-[0_0_10px_rgba(239,68,68,0.95)]" />

                {/* Aesthetic corner brackets */}
                <div className="absolute inset-x-8 inset-y-12 border-2 border-dashed border-emerald-500/40 rounded-lg flex items-center justify-center">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400" />
                  
                  {/* Real-time laser line accent inside box */}
                  <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest bg-slate-950/80 px-2 py-0.5 rounded shadow-sm select-none">
                    {lang === 'bn' ? 'স্ক্যান করুন...' : 'SCANNING...'}
                  </span>
                </div>
              </div>
            )}

            {/* Manual Simulation scanner interface */}
            {selectedCameraId === 'manual' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 animate-pulse">
                  <Camera size={20} />
                </div>
                <h4 className="font-bold text-xs text-slate-200">
                  {lang === 'bn' ? 'ম্যানুয়াল স্ক্যান সিমুলেশন মোড' : 'Manual Scan Simulation Mode'}
                </h4>
                <p className="text-[10px] text-slate-400 max-w-[320px] mt-1 mb-3.5 leading-normal">
                  {lang === 'bn' 
                    ? 'ক্যামেরা ডিভাইস অনুপস্থিত। নিচে বারকোড টাইপ করে সরাসরি স্ক্যান সিমুলেট করুন।' 
                    : 'No physical camera detected. Type a product barcode below to simulate a hardware scan.'}
                </p>
                <div className="flex gap-2 w-full max-w-xs">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder={lang === 'bn' ? 'বারকোড টাইপ করুন...' : 'Type/paste barcode...'}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && manualCode.trim()) {
                        const targetCode = manualCode.trim();
                        setLastScannedCode(targetCode);
                        playBeep();
                        onScan(targetCode);
                        setManualCode('');
                        if (!continuousScan) {
                          onClose();
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (manualCode.trim()) {
                        const targetCode = manualCode.trim();
                        setLastScannedCode(targetCode);
                        playBeep();
                        onScan(targetCode);
                        setManualCode('');
                        if (!continuousScan) {
                          onClose();
                        }
                      }
                    }}
                    className="bg-[#008d44] hover:bg-[#00733e] text-white px-3.5 py-2 rounded-lg text-xs font-bold transition active:scale-95 border-none cursor-pointer shrink-0"
                  >
                    {lang === 'bn' ? 'স্ক্যান' : 'Scan'}
                  </button>
                </div>
                {/* Suggestions */}
                <div className="mt-2.5 flex flex-wrap justify-center gap-1.5 max-w-xs">
                  <span className="text-[9px] text-slate-500 font-bold block w-full">Quick suggestions:</span>
                  {['IM-8371', 'IM-4927', 'MOB-101', 'SM-G991B'].map(sug => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setManualCode(sug)}
                      className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 text-[9px] px-2 py-0.5 rounded transition font-mono cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loader placeholder when connecting camera */}
            {selectedCameraId !== 'manual' && !isScanning && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-slate-400 gap-3">
                <RefreshCw className="animate-spin text-emerald-400" size={28} />
                <span className="text-xs font-semibold">
                  {lang === 'bn' ? 'ক্যামেরা সংযোগ হচ্ছে...' : 'Initializing camera stream...'}
                </span>
              </div>
            )}
          </div>

          {/* Control Settings and Live Feed info */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Continuous scanning preference */}
            <button
              type="button"
              onClick={() => setContinuousScan(prev => !prev)}
              className={`py-2 px-3 border rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                continuousScan
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${continuousScan ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              <span>
                {lang === 'bn' ? 'ক্রমাগত স্ক্যানিং' : 'Continuous Scan'}
              </span>
            </button>

            {/* Mute toggle button */}
            <button
              type="button"
              onClick={toggleMute}
              className={`py-2 px-3 border rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                !muteSound
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              {!muteSound ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span>
                {lang === 'bn' ? (!muteSound ? 'শব্দ অন' : 'শব্দ অফ') : (!muteSound ? 'Sound On' : 'Sound Off')}
              </span>
            </button>
          </div>

          {/* Last Scanned Code Display */}
          {lastScannedCode && (
            <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block">
                {lang === 'bn' ? 'সর্বশেষ স্ক্যানকৃত কোড' : 'Last Scanned Code'}
              </span>
              <span className="text-sm font-mono text-emerald-400 font-extrabold select-all px-2.5 py-1 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
                {lastScannedCode}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 text-center">
          <p className="text-[10px] text-slate-500 font-medium">
            {lang === 'bn' 
              ? 'ক্যামেরার সম্মুখে পণ্যের ১D বারকোড বা ২D QR কোডটি সরাসরি স্থাপন করুন।' 
              : 'Hold a 1D barcode or 2D QR code steadily in front of your camera lens.'}
          </p>
        </div>
      </div>
    </div>
  );
};