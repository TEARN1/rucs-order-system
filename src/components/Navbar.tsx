'use client';

import React from 'react';
import { useOrders } from '@/context/OrderContext';
import { 
  Truck, 
  ClipboardList, 
  RotateCcw, 
  Calendar, 
  Activity, 
  Inbox,
  ShieldCheck,
  Building2
} from 'lucide-react';

export function Navbar() {
  const { activeRole, setActiveRole, orders, resetAllData } = useOrders();

  const inboxCount = orders.filter((o) => o.status === 'inbox').length;
  const actionedCount = orders.filter((o) => o.status === 'actioned').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md">
              <Truck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl tracking-tight text-slate-900">
                  RUCS
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                  Container Logistics
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Midrand • Pretoria • Kempton Park Gauteng Fleet
              </p>
            </div>
          </div>

          {/* Interface Role Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <button
              onClick={() => setActiveRole('client')}
              type="button"
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeRole === 'client'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-emerald-600" />
              <span>Client Portal</span>
            </button>

            <button
              onClick={() => setActiveRole('planner')}
              type="button"
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 relative ${
                activeRole === 'planner'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Planner Dashboard</span>
              {inboxCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-bold leading-none text-white bg-amber-600 rounded-full">
                  {inboxCount}
                </span>
              )}
            </button>
          </div>

          {/* System Date & Quick Reset Controls */}
          <div className="flex items-center space-x-2">
            <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Oct 10, 2026</span>
            </div>

            <button
              onClick={resetAllData}
              title="Reset to default seed data"
              type="button"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 rounded-lg border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
