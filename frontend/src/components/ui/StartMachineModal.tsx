import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

interface StartMachineModalProps {
  isOpen: boolean;
  machineType?: 'WASHER' | 'DRYER';
  machineBlock?: string;
  onSubmit: (durationMinutes: number, userNote?: string) => void;
  onClose: () => void;
}

const WASHER_PRESETS = [
  { label: 'Hızlı / 14\'', value: 28 },
  { label: 'Sentetik', value: 124 },
  { label: 'Karma', value: 125 },
  { label: 'Pamuklu', value: 132 },
  { label: 'Koyu Renkliler', value: 148 },
  { label: 'Eko 40-60', value: 153 },
];

const VILLA_WASHER_PRESETS = [
  { label: 'Süper Hızlı', value: 12 },
  { label: 'Hızlı 60°', value: 60 },
  { label: 'Sentetik', value: 110 },
  { label: 'Renkliler', value: 130 },
  { label: 'Pamuklu', value: 145 },
  { label: 'Eko 3:58', value: 238 },
];

const DRYER_PRESETS = [
  { label: '30 Dakika', value: 30 },
  { label: '45 Dakika', value: 45 },
  { label: '1 Saat', value: 60 },
  { label: '1.5 Saat', value: 90 },
  { label: '2 Saat', value: 120 },
  { label: '3 Saat', value: 180 },
];

const StartMachineModal: React.FC<StartMachineModalProps> = ({ isOpen, machineType = 'WASHER', machineBlock = '', onSubmit, onClose }) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(45);
  const [note, setNote] = useState('');
  
  // Choose presets based on type and block
  let presets = DRYER_PRESETS;
  if (machineType === 'WASHER') {
    presets = machineBlock === 'Villa' ? VILLA_WASHER_PRESETS : WASHER_PRESETS;
  }
  const [lastUsed, setLastUsed] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAdjusting = (type: 'hours' | 'minutes', amount: number) => {
    // Initial immediate step
    if (type === 'hours') {
      setHours(prev => Math.min(5, Math.max(0, prev + amount)));
    } else {
      setMinutes(prev => Math.min(59, Math.max(0, prev + amount)));
    }

    // Set up continuous stepping after a short delay
    const delayTimer = setTimeout(() => {
      timerRef.current = setInterval(() => {
        if (type === 'hours') {
          setHours(prev => Math.min(5, Math.max(0, prev + amount)));
        } else {
          setMinutes(prev => Math.min(59, Math.max(0, prev + amount)));
        }
      }, 100); // 100ms interval for fast stepping
    }, 400); // 400ms delay before continuous stepping kicks in

    // Store the initial timeout so we can cancel it if they just tap
    timerRef.current = delayTimer;
  };

  const stopAdjusting = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current as any);
      clearInterval(timerRef.current as any);
      timerRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return stopAdjusting;
  }, []);

  useEffect(() => {
    if (isOpen) {
      const savedDuration = localStorage.getItem(`last${machineType}Duration`);
      const defaultMins = savedDuration ? parseInt(savedDuration, 10) : (machineType === 'WASHER' ? 28 : 60);
      const validMinutes = isNaN(defaultMins) || defaultMins <= 0 ? 45 : defaultMins;
      
      if (savedDuration && !isNaN(parseInt(savedDuration, 10))) {
        setLastUsed(validMinutes);
      } else {
        setLastUsed(null);
      }

      setHours(Math.floor(validMinutes / 60));
      setMinutes(validMinutes % 60);
      setNote('');
    }
  }, [isOpen, machineType]);

  if (!isOpen) return null;

  const handlePresetClick = (totalMinutes: number) => {
    setHours(Math.floor(totalMinutes / 60));
    setMinutes(totalMinutes % 60);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalMinutes = hours * 60 + minutes;
    
    if (totalMinutes <= 0 || totalMinutes > 300) {
      alert('Süre 0 ile 300 dakika arasında olmalıdır.');
      return;
    }
    
    localStorage.setItem(`last${machineType}Duration`, totalMinutes.toString());
    onSubmit(totalMinutes, note.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        className="bg-white rounded-3xl w-[94%] sm:w-full sm:max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Süreyi Belirleyin</h3>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Quick Presets */}
            <div className="mb-6">
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Hızlı Seçim</label>
              
              {lastUsed !== null && !presets.some(p => p.value === lastUsed) && (
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={() => handlePresetClick(lastUsed)}
                    className={`w-full py-2 px-1 text-xs font-bold rounded-lg border transition-all flex justify-center items-center gap-2 ${
                      (hours * 60 + minutes) === lastUsed
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                    }`}
                  >
                    <span>🔄 Son Kullanılan</span>
                    <span className="opacity-80">({lastUsed}dk)</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {presets.map((time) => {
                  const isSelected = (hours * 60 + minutes) === time.value;
                  const isLastUsed = time.value === lastUsed;
                  
                  let btnClass = 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50';
                  if (isSelected) {
                    btnClass = 'bg-blue-600 text-white border-blue-600 shadow-sm';
                  } else if (isLastUsed) {
                    btnClass = 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100';
                  }

                  return (
                    <button
                      key={time.value}
                      type="button"
                      onClick={() => handlePresetClick(time.value)}
                      className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all flex flex-col items-center justify-center h-14 ${btnClass}`}
                    >
                      <span>{time.label}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {Math.floor(time.value / 60) > 0 ? `${Math.floor(time.value / 60)}s ` : ''}{time.value % 60}dk
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Inputs */}
            <div className="mb-6">
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Özel Süre</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500">
                    <button 
                      type="button" 
                      onPointerDown={(e) => { e.preventDefault(); startAdjusting('hours', -1); }}
                      onPointerUp={stopAdjusting}
                      onPointerLeave={stopAdjusting}
                      onContextMenu={(e) => e.preventDefault()}
                      className="px-3 py-3 text-xl text-slate-400 hover:text-slate-600 active:bg-slate-200 rounded-l-xl transition-colors select-none outline-none"
                    >−</button>
                    <input 
                      type="number"
                      min="0"
                      max="5"
                      className="w-full py-3 bg-transparent border-none focus:outline-none focus:ring-0 text-center font-bold text-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={hours}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setHours(isNaN(val) ? 0 : Math.min(5, Math.max(0, val)));
                      }}
                    />
                    <button 
                      type="button" 
                      onPointerDown={(e) => { e.preventDefault(); startAdjusting('hours', 1); }}
                      onPointerUp={stopAdjusting}
                      onPointerLeave={stopAdjusting}
                      onContextMenu={(e) => e.preventDefault()}
                      className="px-3 py-3 text-xl text-slate-400 hover:text-slate-600 active:bg-slate-200 rounded-r-xl transition-colors select-none outline-none"
                    >+</button>
                    <span className="absolute -top-2 left-3 px-1 bg-white text-[10px] text-slate-400 font-bold rounded-sm z-10">SAAT</span>
                  </div>
                </div>
                <div className="text-slate-300 font-bold text-2xl mb-1">:</div>
                <div className="flex-1">
                  <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500">
                    <button 
                      type="button" 
                      onPointerDown={(e) => { e.preventDefault(); startAdjusting('minutes', -1); }}
                      onPointerUp={stopAdjusting}
                      onPointerLeave={stopAdjusting}
                      onContextMenu={(e) => e.preventDefault()}
                      className="px-3 py-3 text-xl text-slate-400 hover:text-slate-600 active:bg-slate-200 rounded-l-xl transition-colors select-none outline-none"
                    >−</button>
                    <input 
                      type="number"
                      min="0"
                      max="59"
                      className="w-full py-3 bg-transparent border-none focus:outline-none focus:ring-0 text-center font-bold text-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={minutes}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setMinutes(isNaN(val) ? 0 : Math.min(59, Math.max(0, val)));
                      }}
                    />
                    <button 
                      type="button" 
                      onPointerDown={(e) => { e.preventDefault(); startAdjusting('minutes', 1); }}
                      onPointerUp={stopAdjusting}
                      onPointerLeave={stopAdjusting}
                      onContextMenu={(e) => e.preventDefault()}
                      className="px-3 py-3 text-xl text-slate-400 hover:text-slate-600 active:bg-slate-200 rounded-r-xl transition-colors select-none outline-none"
                    >+</button>
                    <span className="absolute -top-2 left-3 px-1 bg-white text-[10px] text-slate-400 font-bold rounded-sm z-10">DAKİKA</span>
                  </div>
                </div>
              </div>
          </div>

            <div className="mb-6">
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Notunuz (İsteğe bağlı)</label>
              <input
                type="text"
                maxLength={50}
                placeholder="Sonraki kişiye not bırakın..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-all"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="flex-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all shadow-lg"
              >
                Makineyi Başlat
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StartMachineModal;
