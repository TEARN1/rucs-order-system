'use client';

import React, { useState } from 'react';
import { useOrders } from '@/context/OrderContext';
import { ProductSelector } from './ProductSelector';
import { CollectionSection } from './CollectionSection';
import { BookingCalendar } from './BookingCalendar';
import { ClientAccountDetails, CollectionDetails, DeliveryBooking, OrderQuantities, Order } from '@/types/order';
import { SAMPLE_CLIENT_ACCOUNTS, CONTAINER_PRODUCTS } from '@/lib/constants';
import confetti from 'canvas-confetti';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Package, 
  AlertCircle,
  ShieldCheck,
  Send
} from 'lucide-react';

export function ClientOrderForm() {
  const { createOrder, setActiveRole, setPlannerTab } = useOrders();

  // Initial account state
  const [account, setAccount] = useState<ClientAccountDetails>({
    accountNumber: 'ACC-89104',
    facilityName: 'St. Jude Regional Hospital',
    department: 'Central Operating Theatres & Trauma',
    contactName: 'Nurse Mgr. Sarah Jenkins',
    contactPhone: '+1 (555) 234-8901',
    contactEmail: 's.jenkins@stjude-health.org',
    deliveryAddress: '742 Medical Center Way, Building B, Level 3',
    buildingDockNotes: 'Delivery via Loading Dock 2. Ring buzzer 14 for clean supply lift.',
    poNumber: 'PO-2026-10492',
  });

  // Quantities state
  const [quantities, setQuantities] = useState<OrderQuantities>({
    'daniels-s14': 6,
    'daniels-s22': 10,
    'daniels-a32-plus': 4,
    'container-45l': 5,
    'container-90l': 2,
  });

  // Collection state
  const [collection, setCollection] = useState<CollectionDetails>({
    collectionRequested: true,
    fullContainersCount: 15,
    wasteStream: 'Sharps (Yellow)',
    pickupBayNotes: 'Staged in Level 3 Biohazard Holding Room 302.',
    complianceCertified: true,
  });

  // Delivery calendar state (earliest selectable is 2026-10-13 due to 48h lead time)
  const [delivery, setDelivery] = useState<DeliveryBooking>({
    selectedDate: '2026-10-14',
    timeSlot: 'Morning (08:00 - 12:00)',
    specialDeliveryInstructions: 'Signature required from charge nurse on shift.',
  });

  const [priority, setPriority] = useState<'standard' | 'urgent'>('standard');
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick fill sample account
  const handleSelectSampleAccount = (index: number) => {
    const sample = SAMPLE_CLIENT_ACCOUNTS[index];
    if (sample) {
      setAccount({ ...sample });
    }
  };

  const totalContainers = Object.values(quantities).reduce((a, b) => a + (b || 0), 0);
  const totalLiters = CONTAINER_PRODUCTS.reduce((acc, prod) => {
    return acc + (quantities[prod.id] || 0) * prod.volumeLiters;
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!account.accountNumber.trim()) {
      setErrorMessage('Account Number is required.');
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
    if (totalContainers === 0) {
      setErrorMessage('Please select at least one container to place an order.');
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

      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#34d399', '#3b82f6', '#f59e0b'],
        });
      } catch {
        // Confetti fallback
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
    setQuantities({
      'daniels-s14': 0,
      'daniels-s22': 0,
      'daniels-a32-plus': 0,
      'container-45l': 0,
      'container-90l': 0,
    });
    setDelivery({
      selectedDate: '2026-10-14',
      timeSlot: 'Morning (08:00 - 12:00)',
    });
    setCollection({
      collectionRequested: false,
    });
  };

  // If order was successfully submitted, show success receipt card
  if (submittedOrder) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Order Placed Successfully!</h2>
            <p className="text-emerald-100 text-sm mt-1 max-w-md mx-auto">
              Your request has been registered in the logistics dispatch system with Transaction ID:
            </p>
            <div className="mt-3 inline-block bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-lg border border-white/20 font-mono text-base font-bold tracking-wider">
              {submittedOrder.id}
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Quick summary grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Facility & Account
                </span>
                <p className="font-bold text-slate-800 text-sm">{submittedOrder.account.facilityName}</p>
                <p className="text-slate-600">Account: {submittedOrder.account.accountNumber}</p>
                <p className="text-slate-500">{submittedOrder.account.department}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Delivery Schedule
                </span>
                <p className="font-bold text-slate-800 text-sm">{submittedOrder.delivery.selectedDate}</p>
                <p className="text-slate-600">{submittedOrder.delivery.timeSlot}</p>
                <p className="text-emerald-700 font-semibold">48h Minimum Lead Time Verified ✓</p>
              </div>
            </div>

            {/* Container Breakdown */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Ordered Containers Breakdown</span>
                <span className="text-emerald-700 font-semibold">{totalContainers} Units Total</span>
              </h4>
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
                    🔄 Collection Requested: {submittedOrder.collection.fullContainersCount} Full Containers
                  </span>
                  <span className="text-[11px] font-medium text-amber-900">
                    {submittedOrder.collection.wasteStream}
                  </span>
                </div>
              )}
            </div>

            {/* Timestamps & Audit Info */}
            <div className="text-[11px] text-slate-500 bg-slate-100/70 p-3 rounded-lg flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Transaction Timestamp: <strong>{new Date(submittedOrder.timestamps.createdAt).toLocaleString()}</strong></span>
              </span>
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
                Status: INBOX (Pending Dispatch)
              </span>
            </div>

            {/* Navigation Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleGoToPlanner}
                className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <span>Switch to Planner Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleResetForm}
                className="w-full sm:w-auto py-3 px-5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
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
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <ShieldCheck className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>RUCS Healthcare Client Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hospital & Clinic Order Placement
          </h1>

          <p className="text-emerald-100 text-sm mt-2 leading-relaxed">
            Order certified Daniels Sharpsmart containers (S14, S22, A32 Plus) and heavy-duty 45 L & 90 L clinical waste bins. Request simultaneous waste pickup with automated 48-hour route enforcement.
          </p>

          {/* Quick preset selector for testing convenience */}
          <div className="mt-4 pt-4 border-t border-emerald-700/50 flex flex-wrap items-center gap-2">
            <span className="text-xs text-emerald-200 font-medium">⚡ Quick Pre-Fill Account:</span>
            {SAMPLE_CLIENT_ACCOUNTS.map((sample, idx) => (
              <button
                key={sample.accountNumber}
                type="button"
                onClick={() => handleSelectSampleAccount(idx)}
                className="text-xs bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg border border-white/20 transition-all font-medium"
              >
                {sample.facilityName.split(' ')[0]} ({sample.accountNumber})
              </button>
            ))}
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Account Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                Account & Facility Details
              </h3>
              <p className="text-xs text-slate-500">
                Healthcare facility identity, contact person, and receiving dock information.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              Step 1 of 4
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Account Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <span>Account Number</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={account.accountNumber}
                onChange={(e) => setAccount({ ...account, accountNumber: e.target.value })}
                placeholder="e.g. ACC-89104"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-mono font-bold text-slate-800"
              />
            </div>

            {/* Facility Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <span>Facility / Hospital Name</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={account.facilityName}
                onChange={(e) => setAccount({ ...account, facilityName: e.target.value })}
                placeholder="e.g. St. Jude Regional Hospital"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium text-slate-800"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department / Ward / Suite
              </label>
              <input
                type="text"
                value={account.department}
                onChange={(e) => setAccount({ ...account, department: e.target.value })}
                placeholder="e.g. Surgical Suite 3, ICU"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Contact Person */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Contact Person</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={account.contactName}
                onChange={(e) => setAccount({ ...account, contactName: e.target.value })}
                placeholder="e.g. Nurse Mgr. Sarah Jenkins"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-800"
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Contact Phone</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={account.contactPhone}
                onChange={(e) => setAccount({ ...account, contactPhone: e.target.value })}
                placeholder="e.g. +1 (555) 234-8901"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-800"
              />
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Contact Email</span>
              </label>
              <input
                type="email"
                value={account.contactEmail}
                onChange={(e) => setAccount({ ...account, contactEmail: e.target.value })}
                placeholder="e.g. s.jenkins@hospital.org"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Delivery Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Delivery Street Address</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={account.deliveryAddress}
                onChange={(e) => setAccount({ ...account, deliveryAddress: e.target.value })}
                placeholder="e.g. 742 Medical Center Way, Building B"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-800"
              />
            </div>

            {/* Building / Loading Dock Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Loading Dock Access Notes / Purchase Order #</span>
              </label>
              <input
                type="text"
                value={account.buildingDockNotes}
                onChange={(e) => setAccount({ ...account, buildingDockNotes: e.target.value })}
                placeholder="e.g. Dock 2, ring buzzer 14. PO-2026-10492"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Container Selection */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between mb-4">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              Step 2 of 4: Quantities
            </span>
          </div>
          <ProductSelector quantities={quantities} onChange={setQuantities} />
        </div>

        {/* Step 3: Collection Status Checkbox & Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              Step 3 of 4: Waste Collection Status
            </span>
          </div>
          <CollectionSection collection={collection} onChange={setCollection} />
        </div>

        {/* Step 4: Calendar with 48h limit and booked days */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              Step 4 of 4: Delivery Booking (48h Lead Time Limit)
            </span>
          </div>
          <BookingCalendar delivery={delivery} onChange={setDelivery} />
        </div>

        {/* Submit & Priority Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-700">Order Priority:</label>
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
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                🚨 Urgent Medical Request
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || totalContainers === 0 || !delivery.selectedDate}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:pointer-events-none text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all transform active:scale-98 text-sm"
          >
            <Send className="w-4 h-4" />
            <span>Confirm & Submit Order ({totalContainers} Containers)</span>
          </button>
        </div>
      </form>
    </div>
  );
}
