import { createContext, useContext, useState } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { cn } from '../lib/utils';

let toastCounter = 0;
const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = ++toastCounter;
    setToasts(prev => [...prev.slice(-2), { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map(t => (
          <div key={t.id} className={cn(
            "px-4 py-3 rounded-[var(--radius-sm)] border flex items-center gap-3 text-[13px] font-medium shadow-2xl fade-in",
            "bg-[var(--bg3)] text-[var(--text)]",
            t.type === 'success' ? "border-[var(--success)]/30" :
            t.type === 'error' ? "border-[var(--red)]/30" : "border-[var(--border2)]"
          )}>
            {t.type === 'success' && <CheckCircle2 size={16} className="text-[var(--success)]" />}
            {t.type === 'error' && <XCircle size={16} className="text-[var(--red)]" />}
            {t.type === 'info' && <Info size={16} className="text-[var(--text2)]" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);