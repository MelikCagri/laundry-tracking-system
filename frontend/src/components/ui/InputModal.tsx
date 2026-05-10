import React, { useState, useEffect } from 'react';

interface InputModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  label: string;
  inputType?: 'text' | 'number';
  placeholder?: string;
  defaultValue?: string;
  submitText?: string;
  cancelText?: string;
  onSubmit: (value: string) => void;
  onClose: () => void;
  required?: boolean;
}

const InputModal: React.FC<InputModalProps> = ({
  isOpen, title, description, label, inputType = 'text', placeholder, defaultValue = '',
  submitText = 'Gönder', cancelText = 'Vazgeç', onSubmit, onClose, required = true
}) => {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setError('');
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (required && !value.trim()) {
      setError('Bu alan zorunludur.');
      return;
    }
    onSubmit(value);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        {description && <p className="text-slate-600 text-sm mb-4">{description}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-slate-700 text-sm font-bold mb-2">{label}</label>
            <input 
              type={inputType}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-slate-300'}`}
              placeholder={placeholder}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError('');
              }}
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div className="flex gap-3 justify-end">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
            >
              {cancelText}
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputModal;
