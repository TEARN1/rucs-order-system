'use client';

import React from 'react';
import { Order } from '@/types/order';
import { CONTAINER_PRODUCTS } from '@/lib/constants';
import { 
  X, 
  Printer, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  Truck, 
  RefreshCw, 
  Package, 
  FileText 
} from 'lucide-react';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
}

export function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  if (!order) return null;

  const totalItemsCount = Object.values(order.items).reduce((a, b) => a + (b || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-emerald-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Consignment & Order Docket</h3>
                <span className="font-mono text-xs bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700">
                  {order.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">RUCS Clinical Waste Logistics • Gauteng Fleet</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Docket</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-sm">
          {/* Status & Timestamp Header Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Current Status:</span>
              <span className="font-bold uppercase tracking-wider text-slate-900">
                {order.status}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Order Created At:</span>
              <strong className="text-slate-800">{new Date(order.timestamps.createdAt).toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Priority Level:</span>
              <span className={`font-bold uppercase ${order.priority === 'urgent' ? 'text-rose-600' : 'text-slate-700'}`}>
                {order.priority}
              </span>
            </div>
          </div>

          {/* Client & Facility Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Client Account & Delivery Address</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block">Facility Name</span>
                <p className="font-bold text-slate-900 text-sm">{order.account.facilityName}</p>
                <p className="text-slate-700 mt-0.5 font-mono font-bold">
                  Account: {order.account.accountNumber}
                  {order.account.branchOrStoreCode && ` (Store: ${order.account.branchOrStoreCode})`}
                </p>
                <p className="text-slate-500">Region: {order.account.region}</p>
                {order.account.department && <p className="text-slate-500">Dept: {order.account.department}</p>}
              </div>

              <div>
                <span className="text-slate-400 block">Contact Personnel</span>
                <p className="font-semibold text-slate-800">{order.account.contactName}</p>
                <p className="text-slate-600">Phone: {order.account.contactPhone}</p>
                <p className="text-slate-600">Email: {order.account.contactEmail}</p>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <span className="text-slate-400 block">Delivery Address</span>
                <p className="font-medium text-slate-800">{order.account.deliveryAddress}</p>
                {order.account.poNumber && (
                  <p className="text-slate-500 mt-1 font-mono text-[11px]">
                    Purchase Order / Ref: <strong>{order.account.poNumber}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>Container & Consumables Manifest</span>
              </h4>
              <span className="text-xs font-bold text-slate-700">
                Total: {totalItemsCount} Units
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Specification</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CONTAINER_PRODUCTS.map((prod) => {
                    const qty = order.items[prod.id] || 0;
                    if (qty === 0) return null;
                    return (
                      <tr key={prod.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-800">{prod.name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{prod.category}</td>
                        <td className="py-2.5 px-3 text-slate-600">{prod.unitSpec}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">{qty}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Collection Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-emerald-600" />
              <span>Full Bins Waste Collection Status</span>
            </h4>

            {order.collection.collectionRequested ? (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 text-sm">
                    Collection Scheduled: Full Waste Containers Pickup
                  </span>
                  <span className="bg-amber-200/70 text-amber-900 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                    Stream: {order.collection.wasteStream}
                  </span>
                </div>
                {order.collection.pickupBayNotes && (
                  <p className="text-amber-800 text-[11px]">
                    <strong>Collection Point:</strong> {order.collection.pickupBayNotes}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                Delivery only. No full containers scheduled for collection.
              </div>
            )}
          </div>

          {/* Scheduling & Dispatch Audit Trail */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Transaction & Dispatch Audit Trail</span>
            </h4>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Target Delivery Date:</span>
                <strong className="text-slate-800">{order.delivery.selectedDate}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Order Placed Timestamp:</span>
                <span className="font-mono text-slate-700">{new Date(order.timestamps.createdAt).toUTCString()}</span>
              </div>
              {order.timestamps.actionedAt && (
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Actioned / Dispatched Timestamp:</span>
                  <span className="font-mono text-slate-700">{new Date(order.timestamps.actionedAt).toUTCString()}</span>
                </div>
              )}
              {order.assignedDriver && (
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Assigned Driver & Unit:</span>
                  <strong className="text-indigo-700">{order.assignedDriver} — {order.assignedVehicle}</strong>
                </div>
              )}
              {order.plannerNotes && (
                <div className="pt-1">
                  <span className="text-slate-500 block mb-1">Dispatcher Log:</span>
                  <p className="bg-white p-2 rounded border border-slate-200 text-slate-700">
                    {order.plannerNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors"
          >
            Close Docket
          </button>
        </div>
      </div>
    </div>
  );
}
