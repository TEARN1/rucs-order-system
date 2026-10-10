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
  ArrowRight, 
  RotateCcw, 
  Eye,
  AlertCircle,
  Tag,
  Package
} from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onOpenActionModal: (order: Order) => void;
  onOpenDetailsModal: (order: Order) => void;
}

export function OrderCard({ order, onOpenActionModal, onOpenDetailsModal }: OrderCardProps) {
  const { actionOrder, reopenOrder } = useOrders();

  const totalItemsCount = Object.values(order.items).reduce((a, b) => a + (b || 0), 0);

  const handleQuickAction = () => {
    const driver = AVAILABLE_DRIVERS[0];
    actionOrder(order.id, driver.name, driver.vehicle, 'Quick-dispatched to default route.');
  };

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
      }),
      relative: getRelativeTimeString(d),
    };
  };

  function getRelativeTimeString(date: Date) {
    const now = new Date(2026, 9, 10, 13, 31);
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

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 bg-white overflow-hidden shadow-xs hover:shadow-md ${
        order.priority === 'urgent'
          ? 'border-rose-300 ring-1 ring-rose-300/40'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Top Banner / Order ID & Account Header */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
            {order.id}
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono">
              Acc: {order.account.accountNumber}
            </span>
            {order.account.branchOrStoreCode && (
              <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono">
                Store: {order.account.branchOrStoreCode}
              </span>
            )}
          </div>

          {order.priority === 'urgent' && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
              URGENT
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
        {/* Client & Address Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base leading-tight">
                    {order.account.facilityName}
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {order.account.region}
                  </span>
                </div>
                {order.account.department && (
                  <p className="text-xs font-medium text-slate-600 mt-0.5">
                    Dept: {order.account.department}
                  </p>
                )}
                <div className="flex items-start gap-1 text-xs text-slate-600 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span className="leading-snug">{order.account.deliveryAddress}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Person Details */}
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Contact: {order.account.contactName}</span>
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

        {/* Daniels Containers & Consumables Breakdown */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Ordered Items Breakdown ({totalItemsCount} Total Units)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CONTAINER_PRODUCTS.map((prod) => {
              const qty = order.items[prod.id] || 0;
              if (qty === 0) return null;
              return (
                <div
                  key={prod.id}
                  className="p-2 rounded-lg border bg-slate-50 border-slate-300 text-slate-900 font-bold text-center"
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
          {/* Collection Status (Bins count) */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            {order.collection.collectionRequested ? (
              <div className="flex items-center gap-2 text-amber-900">
                <RefreshCw className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold">
                    Collect: {order.collection.fullContainersCount} Full Bins
                  </span>
                  <span className="block text-[11px] text-amber-700">{order.collection.wasteStream}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                <span>Delivery Only (0 bins for collection)</span>
              </div>
            )}
          </div>

          {/* Target Delivery Date (Booked day after 48h) */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-800">Target Delivery: {order.delivery.selectedDate}</span>
              <span className="block text-[11px] text-slate-500">Continuous Shift Run</span>
            </div>
          </div>
        </div>

        {/* Dispatch Driver info (if Actioned) */}
        {order.status === 'actioned' && order.assignedDriver && (
          <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200 text-xs flex items-center justify-between text-indigo-950">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" />
              <span>Dispatched with: <strong>{order.assignedDriver}</strong> ({order.assignedVehicle})</span>
            </div>
            {order.timestamps.actionedAt && (
              <span className="text-[11px] text-indigo-700 font-mono">
                Actioned: {new Date(order.timestamps.actionedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        )}

        {/* Card Action Controls */}
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
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors hidden sm:block"
                >
                  Quick Action
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
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                  Status: Actioned & Scheduled
                </span>
                <button
                  type="button"
                  onClick={() => reopenOrder(order.id)}
                  title="Revert back to inbox"
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Revert to Inbox</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
