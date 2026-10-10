'use client';

import React, { useState } from 'react';
import { Order } from '@/types/order';
import { AVAILABLE_DRIVERS } from '@/lib/constants';
import { Truck, User, Calendar, CheckCircle, X, ShieldAlert } from 'lucide-react';

interface ActionOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (orderId: string, driver: string, vehicle: string, notes?: string) => void;
}

export function ActionOrderModal({ order, isOpen, onClose, onAction }: ActionOrderModalProps) {
  const [selectedDriverId, setSelectedDriverId] = useState(AVAILABLE_DRIVERS[0].id);
  const [notes, setNotes] = useState('');

  if (!isOpen || !order) return null;

  const currentDriver = AVAILABLE_DRIVERS.find((d) => d.id === selectedDriverId) || AVAILABLE_DRIVERS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAction(order.id, currentDriver.name, currentDriver.vehicle, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-50 duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Action & Dispatch Order</h3>
              <p className="text-xs text-indigo-200 font-mono">{order.id} • {order.account.facilityName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Order Summary Snapshot */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Scheduled Date:</span>
              <strong className="text-slate-800">{order.delivery.selectedDate} ({order.delivery.timeSlot})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Facility / Dock:</span>
              <span className="font-medium text-slate-800 truncate max-w-[260px]">{order.account.facilityName} - {order.account.buildingDockNotes || 'Standard dock'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Collection Status:</span>
              {order.collection.collectionRequested ? (
                <span className="font-bold text-amber-700">
                  Yes ({order.collection.fullContainersCount} units • {order.collection.wasteStream})
                </span>
              ) : (
                <span className="text-slate-600">Delivery Only</span>
              )}
            </div>
          </div>

          {/* Driver & Vehicle Assignment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Assign Logistics Driver & Vehicle Unit</span>
            </label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 font-medium"
            >
              {AVAILABLE_DRIVERS.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} — {driver.vehicle}
                </option>
              ))}
            </select>
          </div>

          {/* Dispatcher Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Planner Instructions / Route Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Assigned to North Metropolitan morning run. Consignment note printed. Priority clean drop-off."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Move to Actioned Tab</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
