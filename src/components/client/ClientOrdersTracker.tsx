'use client';

import React from 'react';
import { useOrders } from '@/context/OrderContext';
import { CONTAINER_PRODUCTS } from '@/lib/constants';
import { Clock, CheckCircle2, AlertCircle, ArrowUpRight, Box, RefreshCw, Truck, Building2 } from 'lucide-react';

export function ClientOrdersTracker() {
  const { orders, setSelectedOrderForModal } = useOrders();

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-xl border border-slate-200 p-6 text-slate-500 text-sm">
        No orders found in the system yet.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Registered Facility Orders</h2>
          <p className="text-xs text-slate-500">
            Real-time status tracking for orders across Midrand, Pretoria, and Kempton Park facilities.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
          {orders.length} Active Orders
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => {
          const totalUnits = Object.values(order.items).reduce((a, b) => a + (b || 0), 0);

          let statusBadgeClass = '';
          let statusText = '';
          if (order.status === 'inbox') {
            statusBadgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
            statusText = 'Inbox (Pending Dispatch)';
          } else {
            statusBadgeClass = 'bg-indigo-100 text-indigo-800 border-indigo-200';
            statusText = 'Actioned (Dispatched / In Route)';
          }

          return (
            <div
              key={order.id}
              onClick={() => setSelectedOrderForModal(order)}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {order.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadgeClass}`}>
                    {statusText}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-slate-800 text-sm leading-tight">{order.account.facilityName}</h3>
                  <span className="text-[10px] text-slate-500 font-mono">({order.account.accountNumber})</span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{order.account.deliveryAddress}</p>
              </div>

              {/* Items summary */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-500">Scheduled Items:</span>
                  <strong className="text-slate-800 font-bold">{totalUnits} units</strong>
                </div>

                {order.collection.collectionRequested && (
                  <div className="flex items-center justify-between text-[11px] text-amber-800 font-semibold pt-1 border-t border-slate-200/60">
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 text-amber-600" />
                      <span>Full Bin Collection:</span>
                    </span>
                    <span>{order.collection.fullContainersCount} bins</span>
                  </div>
                )}
              </div>

              {/* Delivery date & creation time */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Target Delivery: <strong>{order.delivery.selectedDate}</strong></span>
                <span className="text-slate-400">
                  {new Date(order.timestamps.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
