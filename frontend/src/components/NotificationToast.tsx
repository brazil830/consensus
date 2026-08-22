import React, { createContext, useContext, useState } from 'react';
import {
  CheckCircle,
  TriangleAlert,
  ShieldX,
  RefreshCw,
  FileText,
  LockKeyhole,
  X
} from 'lucide-react';

export type ToastType = 'AUTHORIZED' | 'ESCALATED' | 'BLOCKED' | 'QUARANTINED' | 'REVISED' | 'REPORT' | 'CAPSULE_FAIL';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

interface ToastContextType {
  addToast: (type: ToastType, title: string, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastType, title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-md w-full pointer-events-none">
        {toasts.map(toast => {
          const getIcon = () => {
            switch (toast.type) {
              case 'AUTHORIZED': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
              case 'ESCALATED': return <TriangleAlert className="w-5 h-5 text-amber-400" />;
              case 'BLOCKED': return <ShieldX className="w-5 h-5 text-red-400" />;
              case 'QUARANTINED': return <LockKeyhole className="w-5 h-5 text-purple-400" />;
              case 'REVISED': return <RefreshCw className="w-5 h-5 text-sky-400" />;
              case 'REPORT': return <FileText className="w-5 h-5 text-indigo-400" />;
              case 'CAPSULE_FAIL': return <TriangleAlert className="w-5 h-5 text-red-500 animate-pulse" />;
              default: return <CheckCircle className="w-5 h-5 text-emerald-400" />;
            }
          };

          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-start space-x-3 p-4 bg-[#111827]/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md animate-slideInRight"
            >
              <div className="mt-0.5 shrink-0">{getIcon()}</div>
              <div className="flex-1 pr-2">
                <h4 className="text-sm font-semibold text-white leading-snug">{toast.title}</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
