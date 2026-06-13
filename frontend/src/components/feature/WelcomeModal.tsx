import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const WelcomeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      // Show after a short delay so it doesn't pop instantly
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenTour', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl w-[94%] sm:w-full sm:max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="p-6 relative">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm">
            ✨
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Yeni Özellikleri Keşfedin!
          </h2>
          <p className="text-slate-500 mb-6">
            Çamaşırhane sistemimize işinizi kolaylaştıracak harika özellikler ekledik. İşte öne çıkanlar:
          </p>

          <div className="space-y-4">
            <div className="flex gap-4 p-4 bg-purple-50 rounded-2xl border border-purple-100">
              <div className="text-2xl">⏳</div>
              <div>
                <h3 className="font-bold text-purple-900 mb-1">Sıraya Girin</h3>
                <p className="text-sm text-purple-700">Makineler dolu mu? Makineye tıklayıp "Sıraya Gir" diyerek boşaldığı an telefonunuza bildirim alabilirsiniz. Kimse sıranızı kapmasın!</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="text-2xl">🗺️</div>
              <div>
                <h3 className="font-bold text-blue-900 mb-1">Çamaşırhane Krokisi</h3>
                <p className="text-sm text-blue-700">Sayfanın üst kısmındaki "Kroki" butonuna tıklayarak makinelerin yerleşim planını harita üzerinden görebilirsiniz.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleClose}
            className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold transition-all shadow-md active:scale-[0.98]"
          >
            Harika, Anladım!
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
