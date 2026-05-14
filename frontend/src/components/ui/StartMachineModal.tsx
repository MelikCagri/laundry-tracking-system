import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface StartMachineModalProps {
  isOpen: boolean;
  onSubmit: (durationMinutes: number, userNote?: string) => void;
  onClose: () => void;
}

const PRESET_TIMES = [
  { label: '30 Dakika', value: 30 },
  { label: '45 Dakika', value: 45 },
  { label: '1 Saat', value: 60 },
  { label: '1.5 Saat', value: 90 },
  { label: '2 Saat', value: 120 },
  { label: '3 Saat', value: 180 },
];

const StartMachineModal: React.FC<StartMachineModalProps> = ({ isOpen, onSubmit, onClose }) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(45);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setHours(0);
      setMinutes(45);
      setNote('');
    }
  }, [isOpen]);

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
              <div className="grid grid-cols-3 gap-2">
                {PRESET_TIMES.map((time) => (
                  <button
                    key={time.value}
                    type="button"
                    onClick={() => handlePresetClick(time.value)}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
                      (hours * 60 + minutes) === time.value
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Inputs */}
            <div className="mb-6">
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Özel Süre</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <input 
                      type="number"
                      min="0"
                      max="5"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-bold text-lg"
                      value={hours}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setHours(isNaN(val) ? 0 : Math.min(5, Math.max(0, val)));
                      }}
                    />
                    <span className="absolute -top-2 left-3 px-1 bg-white text-[10px] text-slate-400 font-bold">SAAT</span>
                  </div>
                </div>
                <div className="text-slate-300 font-bold text-2xl">:</div>
                <div className="flex-1">
                  <div className="relative">
                    <input 
                      type="number"
                      min="0"
                      max="59"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-bold text-lg"
                      value={minutes}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setMinutes(isNaN(val) ? 0 : Math.min(59, Math.max(0, val)));
                      }}
                    />
                    <span className="absolute -top-2 left-3 px-1 bg-white text-[10px] text-slate-400 font-bold">DAKİKA</span>
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
