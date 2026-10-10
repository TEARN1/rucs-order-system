'use client';

import React from 'react';
import { useOrders } from '@/context/OrderContext';
import { CONTAINER_PRODUCTS } from '@/lib/constants';
import { 
  Building2, 
  X, 
  Clock, 
  Calendar, 
  Truck, 
  RefreshCw, 
  Package, 
  CheckCircle2, 
  ArrowUpRight 
} from 'lucide-react';

export function FacilityHistoryModal() {
  const { 
    selectedFacilityHistoryAccount, 
    setSelectedFacilityHistoryAccount, 
    getFacilityOrders, 
    setSelectedOrderForModal 
  } = useOrders();

  if (!selectedFacilityHistoryAccount) return null;

  const facilityOrders = getFacilityOrders(selectedFacilityHistoryAccount);
  const sampleOrder = facilityOrders[0];
  const facilityName = sampleOrder?.account.facilityName || selectedFacilityHistoryAccount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">{facilityName}</h3>
                <span className="font-mono text-xs bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700">
                  {selectedFacilityHistoryAccount}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Facility Order History • {facilityOrders.length} Total Registered Consignments
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedFacilityHistoryAccount(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders History List */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Address:</span>
              <strong className="text-slate-800">{sampleOrder?.account.deliveryAddress}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Primary Contact:</span>
              <span className="text-slate-800">{sampleOrder?.account.contactName} ({sampleOrder?.account.contactPhone})</span>
            </div>
          </div>

          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pt-2">
            Chronological Order History:
          </h4>

          <div className="space-y-3">
            {facilityOrders.map((order, index) => {
              const totalItems = Object.values(order.items).reduce((a, b) => a + (b || 0), 0);
              const isInbox = order.status === 'inbox';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded">
                        {order.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isInbox
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {isInbox ? 'Inbox (New)' : 'Actioned / Dispatched'}
                      </span>
                      {index === 0 && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Latest Order
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Received: <strong>{new Date(order.timestamps.createdAt).toLocaleDateString()}</strong></span>
                    </div>
                  </div>

                  {/* Items Ordered Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {CONTAINER_PRODUCTS.map((prod) => {
                      const qty = order.items[prod.id] || 0;
                      if (qty === 0) return null;
                      return (
                        <div key={prod.id} className="bg-slate-50 p-2 rounded-lg border border-slate-200/80 flex items-center justify-between">
                          <span className="text-slate-600 truncate">{prod.name}</span>
                          <strong className="text-slate-900 ml-1">{qty}</strong>
                        </div>
                      );
                    })}
                  </div>

                  {/* Collection & Delivery info */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-600">
                    <div className="flex items-center gap-3">
                      <span>Target Delivery: <strong>{order.delivery.selectedDate}</strong></span>
                      {order.collection.collectionRequested && (
                        <span className="text-amber-800 font-semibold flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 text-amber-600" />
                          <span>Collected: {order.collection.fullContainersCount} Full Bins ({order.collection.wasteStream})</span>
                        </span>
                      )}
                    </div>

                    {order.assignedDriver && (
                      <span className="text-indigo-700 font-medium">
                        Driver: {order.assignedDriver} ({order.assignedVehicle})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={() => setSelectedFacilityHistoryAccount(null)}
            className="px-5 py-2 text-xs font-semibold bg-slate-900 hover:bg-black text-white rounded-lg transition-colors"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
}
