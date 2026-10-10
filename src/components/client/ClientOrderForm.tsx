'use client';

import React, { useState } from 'react';
import { useOrders } from '@/context/OrderContext';
import { ProductSelector } from './ProductSelector';
import { CollectionSection } from './CollectionSection';
import { BookingCalendar } from './BookingCalendar';
import { ClientAccountDetails, CollectionDetails, DeliveryBooking, OrderQuantities, Order, ClientType } from '@/types/order';
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
  ArrowRight, 
  Clock, 
  Package, 
  AlertCircle,
  ShieldCheck,
  Send,
  SlidersHorizontal,
  PlusCircle,
  MapPinned
} from 'lucide-react';

export function ClientOrderForm() {
  const { createOrder, setActiveRole, setPlannerTab } = useOrders();

  // Initial account state: Arwyp Medical Centre (Kempton Park) -> ARW001
  const [account, setAccount] = useState<ClientAccountDetails>({
    accountNumber: 'ARW001',
    clientType: 'hospital',
    facilityName: 'Arwyp Medical Centre',
    region: 'Kempton Park',
    department: 'Theatres & Trauma Unit',
    contactName: 'Sister Annatjie van der Merwe',
    contactPhone: '+27 (011) 922-1000',
    contactEmail: 'orders@arwyp.com',
    deliveryAddress: '20 Pine Avenue, Kempton Park, 1619',
    poNumber: 'PO-ARW-8921',
  });

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

  // Collection state
  const [collection, setCollection] = useState<CollectionDetails>({
    collectionRequested: true,
    fullContainersCount: 12,
    wasteStream: 'Sharps (Yellow)',
    pickupBayNotes: 'Theatre sluice room holding bay',
    complianceCertified: true,
  });

  // Delivery calendar state (earliest selectable is 2026-10-13 due to 48h lead time)
  const [delivery, setDelivery] = useState<DeliveryBooking>({
    selectedDate: '2026-10-14',
    specialDeliveryInstructions: '',
  });

  const [priority, setPriority] = useState<'standard' | 'urgent'>('standard');
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick fill sample account
  const handleSelectSampleAccount = (sample: ClientAccountDetails) => {
    setAccount({ ...sample });
  };

  // Helper when changing hospital name manually to auto-derive 3 first letters + 001
  const handleFacilityNameChange = (newName: string) => {
    let derivedAcc = account.accountNumber;
    if (account.clientType === 'hospital') {
      const cleanLetters = newName.replace(/[^a-zA-Z]/g, '').toUpperCase();
      if (cleanLetters.length >= 3) {
        derivedAcc = cleanLetters.slice(0, 3) + '001';
      }
    }
    setAccount({
      ...account,
      facilityName: newName,
      accountNumber: derivedAcc,
    });
  };

  const totalItemsCount = Object.values(quantities).reduce((a, b) => a + (b || 0), 0);

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

  // If order was submitted, show clean receipt card (no emojis, pure icons)
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
            {/* Quick summary grid */}
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
                <p className="text-slate-500">Continuous Shift Delivery</p>
              </div>
            </div>

            {/* Container Breakdown */}
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
                    Collection Requested: {submittedOrder.collection.fullContainersCount} Full Bins
                  </span>
                  <span className="text-[11px] font-medium text-amber-900">
                    {submittedOrder.collection.wasteStream}
                  </span>
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="text-[11px] text-slate-500 bg-slate-100/70 p-3 rounded-lg flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Timestamp: <strong>{new Date(submittedOrder.timestamps.createdAt).toLocaleString()}</strong></span>
              </span>
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
                Status: Inbox (Awaiting Action)
              </span>
            </div>

            {/* Navigation Actions */}
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
      {/* Header Banner (No emojis, clean corporate medical logistics) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-300 text-xs font-semibold mb-3">
            <Building2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Healthcare Client Order Portal • Gauteng Fleet</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Order Placement & Waste Collection
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Order clean Daniels Sharpsmart containers (S14, S22, S32 Plus), 45 L & 90 L containers, yellow plastic liners, and 20cm security ties for hospitals and clinics in Midrand, Pretoria, and Kempton Park.
          </p>

          {/* Quick Pre-Fill Facility Selector */}
          <div className="mt-4 pt-4 border-t border-slate-700/80 space-y-2">
            <span className="text-xs text-slate-300 font-medium block">
              Quick Pre-Fill Sample Facility (Midrand, Pretoria, Kempton Park):
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_CLIENT_ACCOUNTS.map((sample) => (
                <button
                  key={`${sample.accountNumber}-${sample.branchOrStoreCode || sample.facilityName}`}
                  type="button"
                  onClick={() => handleSelectSampleAccount(sample)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all font-medium flex items-center gap-1.5 ${
                    account.accountNumber === sample.accountNumber && account.branchOrStoreCode === sample.branchOrStoreCode
                      ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                >
                  <span className="font-mono font-bold text-emerald-300">{sample.accountNumber}</span>
                  {sample.branchOrStoreCode && <span className="text-[10px] text-slate-300">({sample.branchOrStoreCode})</span>}
                  <span>- {sample.facilityName.split(' ')[0]} ({sample.region})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Order Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Account Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span>Account & Facility Details</span>
              </h3>
              <p className="text-xs text-slate-500">
                Hospital/Client identification in Midrand, Pretoria, or Kempton Park.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              Account Step
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Client Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client Organization Type
              </label>
              <select
                value={account.clientType}
                onChange={(e) => {
                  const newType = e.target.value as ClientType;
                  setAccount({
                    ...account,
                    clientType: newType,
                    accountNumber: newType === 'hospital' ? 'ARW001' : newType === 'dischem' ? 'DIS001' : 'NBTS 12',
                    branchOrStoreCode: newType === 'dischem' ? 'S204' : newType === 'sanbs' ? 'NBTS 12' : undefined,
                  });
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium text-slate-800"
              >
                <option value="hospital">Hospital (Midrand / Pretoria / Kempton Park)</option>
                <option value="dischem">Dis-Chem Pharmacy & Clinic (S & A Store Codes)</option>
                <option value="sanbs">SANBS (South African National Blood Service)</option>
                <option value="other">Other Medical Facility</option>
              </select>
            </div>

            {/* Facility Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <span>Facility Name</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={account.facilityName}
                onChange={(e) => handleFacilityNameChange(e.target.value)}
                placeholder="e.g. Arwyp Medical Centre"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium text-slate-800"
              />
            </div>

            {/* Account Number (Rule: 3 First Letters + 001 for Hospitals) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>Account Number</span>
                  <span className="text-rose-500">*</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {account.clientType === 'hospital' ? 'First 3 letters + 001' : 'DIS001 / NBTS'}
                </span>
              </label>
              <input
                type="text"
                required
                value={account.accountNumber}
                onChange={(e) => setAccount({ ...account, accountNumber: e.target.value.toUpperCase() })}
                placeholder="e.g. ARW001, WAT001, DIS001, NBTS 12"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Region / City */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Region / District
              </label>
              <select
                value={account.region}
                onChange={(e) => setAccount({ ...account, region: e.target.value as any })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium text-slate-800"
              >
                <option value="Midrand">Midrand</option>
                <option value="Pretoria">Pretoria</option>
                <option value="Kempton Park">Kempton Park</option>
              </select>
            </div>

            {/* Department / Unit */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department / Ward
              </label>
              <input
                type="text"
                value={account.department || ''}
                onChange={(e) => setAccount({ ...account, department: e.target.value })}
                placeholder="e.g. Theatre Complex, ICU, Sluice Room"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-800"
              />
            </div>

            {/* Branch or Store Code (for Dis-Chem or SANBS) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Branch / Store Code (Optional)
              </label>
              <input
                type="text"
                value={account.branchOrStoreCode || ''}
                onChange={(e) => setAccount({ ...account, branchOrStoreCode: e.target.value.toUpperCase() })}
                placeholder="e.g. S204, S410, A12, NBTS 12"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-800 font-mono"
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
                placeholder="e.g. Sister Annatjie van der Merwe"
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
                placeholder="e.g. +27 (011) 922-1000"
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
                placeholder="e.g. orders@arwyp.com"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Delivery Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Delivery Address (Midrand, Pretoria, or Kempton Park)</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={account.deliveryAddress}
                onChange={(e) => setAccount({ ...account, deliveryAddress: e.target.value })}
                placeholder="e.g. 20 Pine Avenue, Kempton Park, 1619"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-800"
              />
            </div>

            {/* Purchase Order (PO) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Purchase Order / Reference # (Optional)</span>
              </label>
              <input
                type="text"
                value={account.poNumber || ''}
                onChange={(e) => setAccount({ ...account, poNumber: e.target.value })}
                placeholder="e.g. PO-ARW-8921"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Container Quantities & Active Catalog Customization */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <ProductSelector quantities={quantities} onChange={setQuantities} />
        </div>

        {/* Step 3: Collection Status */}
        <CollectionSection collection={collection} onChange={setCollection} />

        {/* Step 4: Booking Calendar (48h lead limit enforced) */}
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
