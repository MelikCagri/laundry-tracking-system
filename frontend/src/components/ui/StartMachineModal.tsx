import React, { useState, useEffect } from 'react';

interface StartMachineModalProps {
  isOpen: boolean;
  onSubmit: (durationMinutes: number, userNote?: string) => void;
  onClose: () => void;
}

const StartMachineModal: React.FC<StartMachineModalProps> = ({ isOpen, onSubmit, onClose }) => {
  const [duration, setDuration] = useState('45');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDuration('45');
      setNote('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(duration, 10);
    if (isNaN(mins) || mins <= 0 || mins > 300) {
      return;
    }
    onSubmit(mins, note.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-slate-800 mb-4">Makineyi Başlat</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-slate-700 text-sm font-bold mb-2">Süre (Dakika)</label>
            <input 
              type="number"
              min="1"
              max="300"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              autoFocus
            />
            <p className="text-xs text-slate-500 mt-1">Örn: 45, 60, 90</p>
          </div>

          <div className="mb-6">
            <label className="block text-slate-700 text-sm font-bold mb-2">Notunuz (İsteğe bağlı)</label>
            <input 
              type="text"
              maxLength={50}
              placeholder="Sonraki kişiye not bırakın..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
            >
              İptal
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Başlat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartMachineModal;
