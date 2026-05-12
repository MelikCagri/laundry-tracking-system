import React, { useState } from 'react';
import { requireAuth } from '../../services/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneRegex = /^5\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError('Lütfen 10 haneli geçerli bir numara girin (Örn: 5551234567)');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const user = await requireAuth(phone);
      
      // İlk girişte bildirim izni iste (Darlamadan, sadece bir kez)
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        const { subscribeToPush } = await import('../../services/pushNotifications');
        await subscribeToPush(user.id).catch(err => console.error('Initial push sub failed', err));
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Doğrulama Gerekli</h2>
          <p className="text-sm text-slate-500 mb-6">
            Devam etmek için telefon numaranızı girin. Bu bilgi, çamaşırlarınız bittiğinde size bildirim göndermek ve makinelerinizi yönetmek için kullanılır.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Telefon Numarası
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="5XX XXX XX XX"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all outline-none"
                disabled={loading}
              />
              {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                disabled={loading}
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Devam Et'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
