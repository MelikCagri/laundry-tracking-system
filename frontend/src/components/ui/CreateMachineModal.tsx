import React, { useState, useEffect } from 'react';

interface CreateMachineModalProps {
  isOpen: boolean;
  onSubmit: (floor: number, type: 'WASHER' | 'DRYER', block: 'A' | 'C' | 'D' | 'E' | 'F' | 'Villa') => void;
  onClose: () => void;
}

const CreateMachineModal: React.FC<CreateMachineModalProps> = ({ isOpen, onSubmit, onClose }) => {
  const [block, setBlock] = useState<'A' | 'C' | 'D' | 'E' | 'F' | 'Villa'>('Villa');
  const [floor, setFloor] = useState('1');
  const [type, setType] = useState<'WASHER' | 'DRYER'>('WASHER');

  useEffect(() => {
    if (isOpen) {
      setBlock('Villa');
      setFloor('1');
      setType('WASHER');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const floorNum = parseInt(floor, 10);
    if (isNaN(floorNum) || floorNum < 1) {
      alert('Geçerli bir kat numarası girin.');
      return;
    }
    onSubmit(floorNum, type, block);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-slate-800 mb-4">Yeni Makine Ekle</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-slate-700 text-sm font-bold mb-2">Blok</label>
            <div className="flex flex-wrap gap-2">
              {(['Villa', 'A', 'C', 'D', 'E', 'F'] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBlock(b)}
                  className={`flex-1 min-w-[30%] py-2 rounded-lg text-sm font-bold border transition-all ${block === b
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                    }`}
                >
                  {b === 'Villa' ? 'Villa' : `${b} Blok`}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-slate-700 text-sm font-bold mb-2">
              {block === 'Villa' ? 'Grup Numarası (1: 1-10 Arası, 2: 11-19 Arası)' : 'Kat Numarası'}
            </label>
            <input
              type="number"
              min="1"
              max="2"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-slate-700 text-sm font-bold mb-2">Makine Tipi</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={type}
              onChange={(e) => setType(e.target.value as 'WASHER' | 'DRYER')}
            >
              <option value="WASHER">Çamaşır Makinesi (WASHER)</option>
              <option value="DRYER">Kurutma Makinesi (DRYER)</option>
            </select>
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
              Makineyi Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMachineModal;
