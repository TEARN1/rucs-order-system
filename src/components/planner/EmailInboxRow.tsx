'use client';

import React, { useState } from 'react';
import { Order } from '@/types/order';
import { CONTAINER_PRODUCTS, AVAILABLE_DRIVERS } from '@/lib/constants';
import { useOrders } from '@/context/OrderContext';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Calendar, 
  Truck, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  History, 
  Eye, 
  User, 
  Phone, 
  RotateCcw,
  CheckCircle2,
  Package
} from 'lucide-react';

interface EmailInboxRowProps {
  order: Order;
  onOpenActionModal: (order: Order) => void;
  onOpenDetailsModal: (order: Order) => void;
}

export function EmailInboxRow({ order, onOpenActionModal, onOpenDetailsModal }: EmailInboxRowProps) {
  const { actionOrder, reopenOrder, setSelectedFacilityHistoryAccount } = useOrders();
  const [isOpen, setIsOpen] = useState(false);

  const totalItemsCount = Object.values(order.items).reduce((a, b) => a + (b || 0), 0);

  // Quick summary string (snippet like an email preview)
  const itemsSnippet = CONTAINER_PRODUCTS
    .filter((p) => (order.items[p.id] || 0) > 0)
    .map((p) => `${p.name}: ${order.items[p.id]}`)
    .join(' • ');

  const isInbox = order.status === 'inbox';
  const createdDate = new Date(order.timestamps.createdAt);
  const formattedTime = createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = createdDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

  const handleQuickAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    const driver = AVAILABLE_DRIVERS[0];
    actionOrder(order.id, driver.name, driver.vehicle, 'Quick-dispatched to default route.');
  };

  const handleOpenFacilityHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFacilityHistoryAccount(order.account.accountNumber);
  };

  return (
    <div className={`border-b border-slate-200 transition-colors ${isOpen ? 'bg-slate-50/80' : 'bg-white hover:bg-slate-50/60'}`}>
      {/* Email Inbox Line (Row) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between py-3 px-4 cursor-pointer text-xs select-none gap-3"
      >
        {/* Left: Status & Order ID */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 transition-colors"
            title={isOpen ? 'Collapse order' : 'Expand order'}
          >
            {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
            {order.id}
          </span>

          {order.priority === 'urgent' && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
              URGENT
            </span>
          )}
        </div>

        {/* Facility Name (Clickable link for History) */}
        <div className="w-48 sm:w-60 shrink-0">
          <button
            type="button"
            onClick={handleOpenFacilityHistory}
            title="Click to view full order history for this facility"
            className="text-left font-bold text-slate-900 hover:text-emerald-700 hover:underline flex items-center gap-1.5 truncate text-xs group"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
            <span className="truncate">{order.account.facilityName}</span>
          </button>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
            <span>{order.account.accountNumber}</span>
            {order.account.branchOrStoreCode && <span>({order.account.branchOrStoreCode})</span>}
            <span className="text-slate-400 font-sans">• {order.account.region}</span>
          </div>
        </div>

        {/* Middle Snippet: Items breakdown preview */}
        <div className="flex-1 hidden md:flex items-center gap-2 text-slate-600 truncate text-[11px]">
          <span className="font-medium text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] shrink-0">
            {totalItemsCount} units
          </span>
          <span className="truncate text-slate-500">{itemsSnippet || 'No items'}</span>
        </div>

        {/* Collection Badge */}
        <div className="hidden lg:block shrink-0">
          {order.collection.collectionRequested ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
              <RefreshCw className="w-2.5 h-2.5 text-amber-600" />
              <span>Waste Collection</span>
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">Delivery Only</span>
          )}
        </div>

        {/* Target Delivery Date */}
        <div className="hidden sm:block shrink-0 text-slate-600 text-right">
          <span className="block text-[11px] font-semibold text-slate-800">{order.delivery.selectedDate}</span>
          <span className="block text-[10px] text-slate-400">Target Delivery</span>
        </div>

        {/* Received Timestamp */}
        <div className="shrink-0 text-right w-20">
          <span className="block text-[11px] font-medium text-slate-700">{formattedDate}</span>
          <span className="block text-[10px] text-slate-400">{formattedTime}</span>
        </div>

        {/* Quick Action Button */}
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          {isInbox ? (
            <button
              type="button"
              onClick={() => onOpenActionModal(order)}
              className="px-2.5 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs flex items-center gap-1 transition-all"
            >
              <span>Action</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              Actioned
            </span>
          )}
        </div>
      </div>

      {/* Expanded Reading Pane (Open like Email message) */}
      {isOpen && (
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 space-y-4 animate-in fade-in-50 duration-150">
          {/* Action Ribbon & Facility History Trigger */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenFacilityHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200/70 rounded-lg transition-colors border border-emerald-300"
              >
                <History className="w-3.5 h-3.5 text-emerald-700" />
                <span>View {order.account.facilityName} Order History</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenDetailsModal(order)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Printable Consignment Docket</span>
              </button>

              {isInbox ? (
                <>
                  <button
                    type="button"
                    onClick={handleQuickAction}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  >
                    Quick Action (Dave Miller)
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenActionModal(order)}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Assign Driver & Action</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => reopenOrder(order.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3 text-slate-500" />
                  <span>Revert to Inbox</span>
                </button>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Address & Contact */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Delivery Address:</span>
                  <p className="font-semibold text-slate-900">{order.account.deliveryAddress}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Region: {order.account.region}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-start gap-2">
                <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Contact Person:</span>
                  <p className="font-medium text-slate-800">{order.account.contactName} ({order.account.contactPhone})</p>
                  <p className="text-slate-500 text-[11px]">{order.account.contactEmail}</p>
                </div>
              </div>
            </div>

            {/* Collection & Delivery Details */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Delivery Schedule:</span>
                  <p className="font-bold text-slate-900">{order.delivery.selectedDate} (Continuous Shift Run)</p>
                  {order.delivery.specialDeliveryInstructions && (
                    <p className="text-slate-500 text-[11px] mt-0.5">Note: {order.delivery.specialDeliveryInstructions}</p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-start gap-2">
                <RefreshCw className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Waste Collection Request:</span>
                  {order.collection.collectionRequested ? (
                    <div>
                      <p className="font-bold text-amber-900">Full Containers Collection Scheduled</p>
                      <p className="text-amber-800 text-[11px]">{order.collection.wasteStream || 'Sharps & Clinical Waste'} • Staging: {order.collection.pickupBayNotes || 'Designated sluice'}</p>
                    </div>
                  ) : (
                    <p className="text-slate-500">Delivery Only (No collection requested)</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Full Container Breakdown Table */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">
              Ordered Items Breakdown ({totalItemsCount} Total Units):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {CONTAINER_PRODUCTS.map((prod) => {
                const qty = order.items[prod.id] || 0;
                return (
                  <div
                    key={prod.id}
                    className={`p-2 rounded-lg border text-center ${
                      qty > 0
                        ? 'bg-slate-50 border-slate-300 text-slate-900 font-bold'
                        : 'bg-slate-50/30 border-slate-100 text-slate-400 opacity-50'
                    }`}
                  >
                    <span className="block text-[10px] text-slate-500 font-medium truncate">{prod.name}</span>
                    <span className="text-sm font-extrabold">{qty}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dispatch Driver info if Actioned */}
          {order.assignedDriver && (
            <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-900 flex items-center justify-between">
              <span>Assigned Driver: <strong>{order.assignedDriver}</strong> ({order.assignedVehicle})</span>
              {order.plannerNotes && <span className="text-indigo-700">{order.plannerNotes}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
