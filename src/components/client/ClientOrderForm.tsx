'use client';

import React, { useState, useEffect } from 'react';
import { useOrders } from '@/context/OrderContext';
import { ProductSelector } from './ProductSelector';
import { CollectionSection } from './CollectionSection';
import { BookingCalendar } from './BookingCalendar';
import { ClientAccountDetails, CollectionDetails, DeliveryBooking, OrderQuantities, Order } from '@/types/order';
import { CONTAINER_PRODUCTS } from '@/lib/constants';
import confetti from 'canvas-confetti';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Package, 
  AlertCircle,
  ShieldCheck,
  Send,
  SlidersHorizontal,
  Edit3
} from 'lucide-react';

interface ClientOrderFormProps {
  onOpenSettings?: () => void;
}

export function ClientOrderForm({ onOpenSettings }: ClientOrderFormProps) {
  const { createOrder, setActiveRole, setPlannerTab, clientProfile } = useOrders();

  // Load account from persistent profile
  const [account, setAccount] = useState<ClientAccountDetails>({ ...clientProfile });

  // Update account if persistent profile changes
  useEffect(() => {
    setAccount({ ...clientProfile });
  }, [clientProfile]);

  // Quantities state
  const [quantities, setQuantities] = useState<OrderQuantities>({
    'daniels-s14': 6,
    'daniels-s22': 8,
    'daniels-s32-plus': 4,
    'container-45l': 5,
    'container-90l': 0,
    'plastic-liners': 2,
    'cable-ties-20cm': 2,
  });

  // Collection state (simple toggle without required count)
  const [collection, setCollection] = useState<CollectionDetails>({
    collectionRequested: true,
    wasteStream: 'Sharps (Yellow)',
    pickupBayNotes: 'Theatre dirty utility / sluice holding bay',
    complianceCertified: true,
  });

  // Delivery calendar state (earliest eligible available day is Thursday 2026-10-15)
  const [delivery, setDelivery] = useState<DeliveryBooking>({
    selectedDate: '2026-10-15',
    specialDeliveryInstructions: '',
  });

  const [priority, setPriority] = useState<'standard' | 'urgent'>('standard');
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalItemsCount = Object.values(quantities).reduce((a, b) => a + (b || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!account.accountNumber.trim()) {
      setErrorMessage('Account Number is required. Please check your profile settings.');
      return;
    }
    if (!account.facilityName.trim()) {
      setErrorMessage('Facility Name is required.');
      return;
    }
    if (!account.contactName.trim() || !account.contactPhone.trim()) {
      setErrorMessage('Contact person name and phone number are required.');
      return;
    }
    if (!account.deliveryAddress.trim()) {
      setErrorMessage('Delivery Address is required.');
      return;
    }
    if (totalItemsCount === 0) {
      setErrorMessage('Please select at least one container or consumable item.');
      return;
    }
    if (!delivery.selectedDate) {
      setErrorMessage('Please select an available delivery date on the calendar.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newOrder = createOrder({
        account,
        items: quantities,
        collection,
        delivery,
        priority,
      });

      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#3b82f6', '#f59e0b'],
        });
      } catch {
        // Fallback
      }

      setSubmittedOrder(newOrder);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToPlanner = () => {
    setActiveRole('planner');
    setPlannerTab('inbox');
  };

  const handleResetForm = () => {
    setSubmittedOrder(null);
    setQuantities({});
    setDelivery({
      selectedDate: '2026-10-14',
    });
    setCollection({
      collectionRequested: false,
    });
  };

  // If order was submitted, show clean receipt card
  if (submittedOrder) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xl overflow-hidden animate-in fade-in duration-200">
          <div className="bg-gradient-to-r from-emerald-700 to-teal-800 px-6 py-8 text-white text-center">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-3 border border-white/30">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Order Placed Successfully</h2>
            <p className="text-emerald-100 text-xs mt-1 max-w-md mx-auto">
              Your order has been registered in the logistics dispatch system with Transaction Reference:
            </p>
            <div className="mt-2.5 inline-block bg-black/25 px-4 py-1.5 rounded-lg border border-white/20 font-mono text-base font-bold tracking-wider">
              {submittedOrder.id}
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Facility & Account
                </span>
                <p className="font-bold text-slate-900 text-sm">{submittedOrder.account.facilityName}</p>
                <p className="text-slate-700 font-mono font-bold">
                  Account: {submittedOrder.account.accountNumber}
                  {submittedOrder.account.branchOrStoreCode && ` (${submittedOrder.account.branchOrStoreCode})`}
                </p>
                <p className="text-slate-500">Region: {submittedOrder.account.region}</p>
                <p className="text-slate-500">{submittedOrder.account.deliveryAddress}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Delivery Date & Lead Time
                </span>
                <p className="font-bold text-slate-900 text-sm">{submittedOrder.delivery.selectedDate}</p>
                <p className="text-emerald-700 font-semibold">48-Hour Minimum Lead Time Verified</p>
                <p className="text-slate-500">Continuous Shift Delivery Run</p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Ordered Items & Quantities
                </h4>
                <span className="text-emerald-700 font-bold text-xs">{totalItemsCount} Total Units</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {CONTAINER_PRODUCTS.map((prod) => {
                  const qty = submittedOrder.items[prod.id] || 0;
                  if (qty === 0) return null;
                  return (
                    <div key={prod.id} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="font-medium text-slate-700 truncate">{prod.name}</span>
                      <strong className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs ml-2">
                        {qty}
                      </strong>
                    </div>
                  );
                })}
              </div>

              {submittedOrder.collection.collectionRequested && (
                <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-amber-800 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200">
                  <span className="font-semibold">
                    Waste Collection Scheduled: Full Containers Pickup
                  </span>
                  <span className="text-[11px] font-medium text-amber-900">
                    {submittedOrder.collection.wasteStream || 'Sharps / Clinical'}
                  </span>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 bg-slate-100/70 p-3 rounded-lg flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Timestamp: <strong>{new Date(submittedOrder.timestamps.createdAt).toLocaleString()}</strong></span>
              </span>
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
                Status: Inbox (Awaiting Action)
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleGoToPlanner}
                className="w-full sm:flex-1 py-3 px-4 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all text-xs"
              >
                <span>Switch to Planner Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleResetForm}
                className="w-full sm:w-auto py-3 px-5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-xs"
              >
                Place Another Order
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Active Facility Profile Card (Pre-loaded from Settings) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {account.facilityName}
              </h2>
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                {account.accountNumber}
                {account.branchOrStoreCode && ` (${account.branchOrStoreCode})`}
              </span>
              <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {account.region}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {account.deliveryAddress} • Contact: {account.contactName} ({account.contactPhone})
            </p>
          </div>
        </div>

        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile / Switch Facility</span>
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Order Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Manual Section: Request Collection / Waste Pickup */}
        <CollectionSection collection={collection} onChange={setCollection} />

        {/* Purchase Order Number (Optional) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">Internal Reference / Purchase Order (Optional):</span>
          </div>
          <input
            type="text"
            value={account.poNumber || ''}
            onChange={(e) => setAccount({ ...account, poNumber: e.target.value })}
            placeholder="e.g. PO-ARW-8921"
            className="w-full sm:w-64 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        {/* Container Quantities & Active Catalog Customization */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <ProductSelector quantities={quantities} onChange={setQuantities} />
        </div>

        {/* Booking Calendar (Enforces Booked Days Mon/Wed/Fri, Banned Days Tue/Sat, 48h limit) */}
        <BookingCalendar delivery={delivery} onChange={setDelivery} />

        {/* Priority & Submit Controls */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">Order Priority:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPriority('standard')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  priority === 'standard'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Standard Replenishment
              </button>
              <button
                type="button"
                onClick={() => setPriority('urgent')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  priority === 'urgent'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                Urgent Medical Run
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || totalItemsCount === 0 || !delivery.selectedDate}
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-98 text-sm"
          >
            <Send className="w-4 h-4" />
            <span>Confirm & Send Order ({totalItemsCount} Total Items)</span>
          </button>
        </div>
      </form>
    </div>
  );
}
