import React, { useState, useEffect } from 'react';

interface StatusModalProps {
  isOpen: boolean;
  currentStatus: string;
  onSubmit: (status: string) => void;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { value: 'BOS',   label: '🟢 Boş',        description: 'Makine müsait' },
  { value: 'DOLU',  label: '🔴 Dolu',        description: 'Kullanımda' },
  { value: 'BITTI', label: '🟡 Süre Bitti',  description: 'Çamaşır bekliyor' },
  { value: 'BOZUK', label: '⚪ Arızalı',     description: 'Bakım gerekiyor' },
];

const StatusModal: React.FC<StatusModalProps> = ({ isOpen, currentStatus, onSubmit, onClose }) => {
  const [selected, setSelected] = useState(currentStatus);

  useEffect(() => {
    if (isOpen) setSelected(currentStatus);
  }, [isOpen, currentStatus]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-slate-800 mb-1">Durum Değiştir</h3>
        <p className="text-sm text-slate-500 mb-5">
          Mevcut durum: <span className="font-bold text-slate-700">{STATUS_OPTIONS.find(o => o.value === currentStatus)?.label || currentStatus}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 mb-6">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelected(opt.value)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                  selected === opt.value
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="text-base font-bold text-slate-800 flex-1">{opt.label}</span>
                <span className="text-xs text-slate-400">{opt.description}</span>
                {selected === opt.value && (
                  <svg className="w-4 h-4 text-slate-900 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={selected === currentStatus}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Güncelle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusModal;
