'use client';

import React from 'react';
import { useOrders } from '@/context/OrderContext';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, dismissToast } = useOrders();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bgStyle = 'bg-slate-900 text-white border-slate-700';
        let Icon = Info;

        if (toast.type === 'success') {
          bgStyle = 'bg-emerald-950 text-emerald-100 border-emerald-800';
          Icon = CheckCircle2;
        } else if (toast.type === 'warning') {
          bgStyle = 'bg-amber-950 text-amber-100 border-amber-800';
          Icon = AlertTriangle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-bottom-5 ${bgStyle}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <strong className="block font-bold text-sm text-white mb-0.5">{toast.title}</strong>
              <p className="opacity-90 leading-relaxed">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-white/60 hover:text-white p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
