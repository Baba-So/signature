import React, { useEffect, useState } from 'react';

export interface ShortcutToastMessage {
  id: number;
  icon?: React.ReactNode;
  badge?: string;
  message: string;
}

interface ShortcutToastProps {
  toast: ShortcutToastMessage | null;
}

export const ShortcutToast: React.FC<ShortcutToastProps> = ({ toast }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast || !visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-900/90 text-white rounded-xl shadow-xl backdrop-blur-md border border-slate-700/80 text-xs font-medium">
        {toast.icon && <span className="text-blue-400">{toast.icon}</span>}
        {toast.badge && (
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-slate-200 border border-slate-600 rounded">
            {toast.badge}
          </kbd>
        )}
        <span className="tracking-wide">{toast.message}</span>
      </div>
    </div>
  );
};
