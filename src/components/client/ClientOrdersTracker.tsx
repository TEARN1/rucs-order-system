'use client';

import React from 'react';
import { useOrders } from '@/context/OrderContext';
import { CONTAINER_PRODUCTS } from '@/lib/constants';
import { Clock, CheckCircle2, AlertCircle, ArrowUpRight, Box, RefreshCw } from 'lucide-react';

export function ClientOrdersTracker() {
  const { orders, setSelectedOrderForModal } = useOrders();

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-xl border border-slate-200 p-6 text-slate-500 text-sm">
        No orders found in system yet.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Recent Facility Orders</h2>
          <p className="text-xs text-slate-500">
            Real-time status tracking for orders placed across all hospital wards.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
          {orders.length} Total Registered Orders
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
          } else if (order.status === 'actioned') {
            statusBadgeClass = 'bg-indigo-100 text-indigo-800 border-indigo-200';
            statusText = 'Actioned (In Transit / Scheduled)';
          } else {
            statusBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
            statusText = 'Done (Delivered)';
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

                <h3 className="font-bold text-slate-800 text-sm">{order.account.facilityName}</h3>
                <p className="text-xs text-slate-500 truncate">{order.account.department}</p>
              </div>

              {/* Items summary */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-500">Containers:</span>
                  <strong className="text-slate-800 font-bold">{totalUnits} units</strong>
                </div>

                {order.collection.collectionRequested && (
                  <div className="flex items-center justify-between text-[11px] text-amber-700 font-semibold pt-1 border-t border-slate-200/60">
                    <span>🔄 Full Collection:</span>
                    <span>{order.collection.fullContainersCount} units</span>
                  </div>
                )}
              </div>

              {/* Delivery date & creation time */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Delivery: <strong>{order.delivery.selectedDate}</strong></span>
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
