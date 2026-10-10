'use client';

import React, { useState } from 'react';
import { OrderProvider, useOrders } from '@/context/OrderContext';
import { Navbar } from '@/components/Navbar';
import { ClientOrderForm } from '@/components/client/ClientOrderForm';
import { ClientSettings } from '@/components/client/ClientSettings';
import { ClientOrdersTracker } from '@/components/client/ClientOrdersTracker';
import { PlannerDashboard } from '@/components/planner/PlannerDashboard';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { 
  ClipboardList, 
  ShieldCheck, 
  Layers,
  ArrowRightLeft,
  SlidersHorizontal,
  Building2
} from 'lucide-react';

function MainApp() {
  const { activeRole, setActiveRole, orders, clientProfile } = useOrders();
  const [clientSubTab, setClientSubTab] = useState<'form' | 'settings' | 'orders'>('form');

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Header & Role Switcher */}
      <Navbar />

      {/* Floating Demo Ribbon */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-slate-200">Prototype Demo Mode:</span>
            <span className="text-slate-300">
              Active facility: <strong>{clientProfile.facilityName}</strong> ({clientProfile.accountNumber} - {clientProfile.region}).
            </span>
          </div>

          <button
            onClick={() => setActiveRole(activeRole === 'client' ? 'planner' : 'client')}
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors text-[11px]"
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>Switch to {activeRole === 'client' ? 'Planner Dashboard' : 'Client Portal'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeRole === 'client' ? (
          <div>
            {/* Client Subtabs */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setClientSubTab('form')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      clientSubTab === 'form'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>Place Order</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setClientSubTab('settings')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      clientSubTab === 'settings'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Facility Settings & Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setClientSubTab('orders')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      clientSubTab === 'orders'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Track Facility Orders</span>
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px]">
                      {orders.length}
                    </span>
                  </button>
                </div>

                <div className="text-xs text-slate-500 font-mono hidden sm:block">
                  Current Profile: <strong className="text-slate-800">{clientProfile.accountNumber}</strong>
                </div>
              </div>
            </div>

            {clientSubTab === 'form' ? (
              <ClientOrderForm onOpenSettings={() => setClientSubTab('settings')} />
            ) : clientSubTab === 'settings' ? (
              <ClientSettings onBackToOrder={() => setClientSubTab('form')} />
            ) : (
              <ClientOrdersTracker />
            )}
          </div>
        ) : (
          <PlannerDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700">RUCS Clinical Waste Logistics</span>
            <span>• Midrand, Pretoria & Kempton Park Gauteng Fleet</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Enforced 48h Minimum Lead Time</span>
            <span>•</span>
            <span>Email-Style Operations Queue</span>
            <span>•</span>
            <span>System Date: Oct 10, 2026</span>
          </div>
        </div>
      </footer>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function Home() {
  return (
    <OrderProvider>
      <MainApp />
    </OrderProvider>
  );
}
