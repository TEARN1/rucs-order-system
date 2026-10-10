'use client';

import React, { useState } from 'react';
import { Order } from '@/types/order';
import { CONTAINER_PRODUCTS, AVAILABLE_DRIVERS } from '@/lib/constants';
import { useOrders } from '@/context/OrderContext';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  Truck, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  RotateCcw, 
  Eye,
  FileSpreadsheet,
  ShieldAlert,
  Send
} from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onOpenActionModal: (order: Order) => void;
  onOpenDetailsModal: (order: Order) => void;
}

export function OrderCard({ order, onOpenActionModal, onOpenDetailsModal }: OrderCardProps) {
  const { actionOrder, markOrderDone, reopenOrder } = useOrders();
  const [isExpanded, setIsExpanded] = useState(false);

  const totalContainers = Object.values(order.items).reduce((a, b) => a + (b || 0), 0);
  const totalVolume = CONTAINER_PRODUCTS.reduce((acc, p) => acc + (order.items[p.id] || 0) * p.volumeLiters, 0);

  // Quick 1-click action helper
  const handleQuickAction = () => {
    const driver = AVAILABLE_DRIVERS[0];
    actionOrder(order.id, driver.name, driver.vehicle, 'Quick-dispatched to default morning route.');
  };

  const handleMarkDone = () => {
    markOrderDone(order.id, 'Delivery & container handover completed. Signed by hospital receiving clerk.');
  };

  // Format date helper
  const formatTime = (isoString?: string) => {
    if (!isoString) return null;
    const d = new Date(isoString);
    return {
      full: d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      relative: getRelativeTimeString(d),
    };
  };

  function getRelativeTimeString(date: Date) {
    const now = new Date(2026, 9, 10, 13, 31); // Anchored to 2026-10-10
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  const createdTime = formatTime(order.timestamps.createdAt);
  const actionedTime = formatTime(order.timestamps.actionedAt);
  const completedTime = formatTime(order.timestamps.completedAt);

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 bg-white overflow-hidden shadow-xs hover:shadow-md ${
        order.priority === 'urgent'
          ? 'border-rose-300 ring-1 ring-rose-300/40'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Top Banner / Order ID & Status Header */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-black text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
            {order.id}
          </span>
          <span className="text-xs font-bold text-slate-500">
            Account: <strong className="text-slate-800 font-mono">{order.account.accountNumber}</strong>
          </span>
          {order.priority === 'urgent' && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
              🚨 URGENT
            </span>
          )}
        </div>

        {/* Transaction Timestamp in Header */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Created: <strong>{createdTime?.full}</strong> ({createdTime?.relative})</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Client & Facility Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">
                  {order.account.facilityName}
                </h3>
                <p className="text-xs font-medium text-slate-600 mt-0.5">
                  Dept: {order.account.department || 'General Facility'}
                </p>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{order.account.deliveryAddress}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Person Details */}
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{order.account.contactName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{order.account.contactPhone}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{order.account.contactEmail}</span>
            </div>
          </div>
        </div>

        {/* Loading Dock / Building Access Note */}
        {order.account.buildingDockNotes && (
          <div className="bg-amber-50/50 border border-amber-200/60 rounded-lg p-2.5 text-xs text-amber-900 flex items-start gap-2">
            <span className="font-bold shrink-0">Dock Access:</span>
            <span className="text-amber-800">{order.account.buildingDockNotes}</span>
          </div>
        )}

        {/* Container Quantities Breakdown (Pills) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Container Breakdown ({totalContainers} Units • {totalVolume} L)</span>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 text-[11px] font-semibold"
            >
              <span>{isExpanded ? 'Less info' : 'Full details'}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {CONTAINER_PRODUCTS.map((prod) => {
              const qty = order.items[prod.id] || 0;
              const hasQty = qty > 0;
              return (
                <div
                  key={prod.id}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    hasQty
                      ? 'bg-slate-50 border-slate-300 text-slate-900 font-bold'
                      : 'bg-slate-50/30 border-slate-100 text-slate-400 opacity-60'
                  }`}
                >
                  <span className="block text-[10px] text-slate-500 font-medium truncate">
                    {prod.name}
                  </span>
                  <span className="text-sm font-extrabold">{qty}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Collection Status & Delivery Booking Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Collection Status */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            {order.collection.collectionRequested ? (
              <div className="flex items-center gap-2 text-amber-900">
                <RefreshCw className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold">Collection: {order.collection.fullContainersCount} Full Units</span>
                  <span className="block text-[11px] text-amber-700">{order.collection.wasteStream}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                <span>Delivery Only (No collection requested)</span>
              </div>
            )}
          </div>

          {/* Delivery Schedule Target */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-800">Target: {order.delivery.selectedDate}</span>
              <span className="block text-[11px] text-slate-500">{order.delivery.timeSlot}</span>
            </div>
          </div>
        </div>

        {/* Expanded Info: Detailed Timestamps & Driver Assignments */}
        {isExpanded && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 animate-in fade-in-50 duration-200">
            <div className="font-bold text-slate-700 border-b border-slate-200 pb-1 flex justify-between">
              <span>Full Audit Timestamps</span>
              <span className="text-slate-400 font-mono text-[10px]">ISO 8601</span>
            </div>

            <div className="space-y-1 font-mono text-[11px] text-slate-600">
              <p>• Created At: <strong>{order.timestamps.createdAt}</strong></p>
              {order.timestamps.actionedAt && (
                <p>• Actioned At: <strong>{order.timestamps.actionedAt}</strong></p>
              )}
              {order.timestamps.completedAt && (
                <p>• Completed At: <strong>{order.timestamps.completedAt}</strong></p>
              )}
            </div>

            {order.assignedDriver && (
              <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-indigo-700 font-semibold">
                <span>Driver: {order.assignedDriver}</span>
                <span className="text-slate-600">{order.assignedVehicle}</span>
              </div>
            )}

            {order.plannerNotes && (
              <p className="text-slate-600 text-[11px] pt-1">
                <strong>Notes:</strong> {order.plannerNotes}
              </p>
            )}
          </div>
        )}

        {/* Action Controls Bar based on Tab Status */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onOpenDetailsModal(order)}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>View Full Docket</span>
          </button>

          <div className="flex items-center gap-2">
            {order.status === 'inbox' && (
              <>
                <button
                  type="button"
                  onClick={handleQuickAction}
                  title="Quick-assign to Unit-14 (Dave Miller)"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors hidden sm:block"
                >
                  Quick Dispatch
                </button>
                <button
                  type="button"
                  onClick={() => onOpenActionModal(order)}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Action Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {order.status === 'actioned' && (
              <>
                <button
                  type="button"
                  onClick={() => reopenOrder(order.id)}
                  title="Revert to inbox"
                  className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Revert</span>
                </button>
                <button
                  type="button"
                  onClick={handleMarkDone}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Done / Delivered</span>
                </button>
              </>
            )}

            {order.status === 'done' && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Completed & Closed</span>
                </span>
                <button
                  type="button"
                  onClick={() => reopenOrder(order.id)}
                  className="text-xs text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-slate-100 transition-colors"
                  title="Reopen order into Inbox"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
