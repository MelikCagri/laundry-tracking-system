import React from 'react';
import { X } from 'lucide-react';

interface LayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: string;
  floor: number;
}

const LayoutModal: React.FC<LayoutModalProps> = ({ isOpen, onClose, block, floor }) => {
  if (!isOpen) return null;

  // We only have layouts for block A at the moment
  const hasLayout = ['A', 'C', 'D', 'E', 'F'].includes(block);
  const imageUrl = `/krokiler/${block}_${floor}.svg`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {block} Blok - {floor}. Kat Krokisi
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 overflow-auto flex-1 bg-slate-50 flex items-center justify-center min-h-[300px]">
          {hasLayout ? (
            <img
              src={imageUrl}
              alt={`${block} Blok ${floor}. Kat Krokisi`}
              className="max-w-full h-auto object-contain rounded-lg shadow-sm border border-slate-200 bg-white"
            />
          ) : (
            <div className="text-center text-slate-500">
              <div className="text-4xl mb-3">🗺️</div>
              <p className="font-medium text-lg">Bu kat için henüz kroki bulunmamaktadır.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LayoutModal;
