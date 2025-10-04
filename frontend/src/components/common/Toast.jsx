import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext({ addToast: () => {}, removeToast: () => {} });

const typeStyles = {
  info: {
    border: 'border-slate-200',
    bg: 'bg-white',
    title: 'text-slate-800',
    text: 'text-slate-600'
  },
  success: {
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    title: 'text-emerald-900',
    text: 'text-emerald-800'
  },
  error: {
    border: 'border-red-200',
    bg: 'bg-red-50',
    title: 'text-red-900',
    text: 'text-red-800'
  },
  warning: {
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    title: 'text-amber-900',
    text: 'text-amber-800'
  }
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).slice(2);
    const duration = toast.duration ?? 3000;
    const type = toast.type ?? 'info';
    const item = { id, type, duration, title: toast.title, message: toast.message };
    setToasts((prev) => [...prev, item]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, [removeToast]);

  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-[12000] space-y-3">
        <AnimatePresence>
          {toasts.map((t) => {
            const s = typeStyles[t.type] || typeStyles.info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className={`min-w-[260px] max-w-sm px-4 py-3 rounded-xl shadow-xl border ${s.border} ${s.bg}`}
              >
                <div className="text-sm">
                  {t.title && <p className={`font-semibold ${s.title}`}>{t.title}</p>}
                  {t.message && <p className={`${s.text}`}>{t.message}</p>}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
