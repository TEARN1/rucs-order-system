'use client';

import React from 'react';
import { useOrders } from '@/context/OrderContext';
import { 
  Truck, 
  ClipboardList, 
  RotateCcw, 
  Calendar, 
  Activity, 
  Sparkles,
  Inbox,
  CheckCircle2,
  Clock
} from 'lucide-react';

export function Navbar() {
  const { activeRole, setActiveRole, orders, resetAllData, setPlannerTab } = useOrders();

  const inboxCount = orders.filter((o) => o.status === 'inbox').length;
  const actionedCount = orders.filter((o) => o.status === 'actioned').length;
  const doneCount = orders.filter((o) => o.status === 'done').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-800 bg-clip-text text-transparent">
                  RUCS
                </span>
                <span className="text-xs uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Container Logistics
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Clinical Waste & Daniels Sharpsmart Management
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
              <span className="text-[10px] hidden md:inline-block px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                Order Placement
              </span>
            </button>

            <button
              onClick={() => {
                setActiveRole('planner');
              }}
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
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-bold leading-none text-white bg-amber-500 rounded-full animate-pulse">
                  {inboxCount}
                </span>
              )}
            </button>
          </div>

          {/* System Date & Quick Reset Controls */}
          <div className="flex items-center space-x-2">
            <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>System: <strong>Oct 10, 2026</strong></span>
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
