'use client';

import React, { useState } from 'react';
import { useOrders } from '@/context/OrderContext';
import { ClientAccountDetails, ClientType } from '@/types/order';
import { SAMPLE_CLIENT_ACCOUNTS, CONTAINER_PRODUCTS } from '@/lib/constants';
import { 
  Building2, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Check, 
  Save, 
  SlidersHorizontal, 
  Package, 
  ArrowLeft,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface ClientSettingsProps {
  onBackToOrder: () => void;
}

export function ClientSettings({ onBackToOrder }: ClientSettingsProps) {
  const { 
    clientProfile, 
    saveClientProfile, 
    configuredItemIds, 
    addItemToProfile, 
    removeItemFromProfile, 
    resetConfiguredItems 
  } = useOrders();

  const [formProfile, setFormProfile] = useState<ClientAccountDetails>({ ...clientProfile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSelectSample = (sample: ClientAccountDetails) => {
    setFormProfile({ ...sample });
  };

  const handleFacilityNameChange = (name: string) => {
    let derivedAcc = formProfile.accountNumber;
    if (formProfile.clientType === 'hospital') {
      const clean = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
      if (clean.length >= 3) {
        derivedAcc = clean.slice(0, 3) + '001';
      }
    }
    setFormProfile({
      ...formProfile,
      facilityName: name,
      accountNumber: derivedAcc,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveClientProfile(formProfile);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onBackToOrder();
    }, 900);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <button
            type="button"
            onClick={onBackToOrder}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Order Screen</span>
          </button>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
            <span>Facility Account & Item Profile Settings</span>
          </h2>
          <p className="text-xs text-slate-500">
            Set your facility details and active items once. They will automatically load every time you place an order.
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToOrder}
          className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-black transition-colors"
        >
          Return to Ordering
        </button>
      </div>

      {/* Quick Load Preset Facility */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
        <span className="text-xs font-bold text-slate-700 block">
          Quick Preset: Select a Facility in Midrand, Pretoria, or Kempton Park:
        </span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_CLIENT_ACCOUNTS.map((sample) => (
            <button
              key={`${sample.accountNumber}-${sample.branchOrStoreCode || sample.facilityName}`}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-medium flex items-center gap-1.5 ${
                formProfile.accountNumber === sample.accountNumber && formProfile.branchOrStoreCode === sample.branchOrStoreCode
                  ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span className="font-mono font-bold">{sample.accountNumber}</span>
              {sample.branchOrStoreCode && <span className="text-[10px]">({sample.branchOrStoreCode})</span>}
              <span>- {sample.facilityName.split(' ')[0]} ({sample.region})</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Facility Details Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>1. Facility & Contact Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Organization Category
              </label>
              <select
                value={formProfile.clientType}
                onChange={(e) => {
                  const newType = e.target.value as ClientType;
                  setFormProfile({
                    ...formProfile,
                    clientType: newType,
                    accountNumber: newType === 'hospital' ? 'ARW001' : newType === 'dischem' ? 'DIS001' : 'NBTS 12',
                    branchOrStoreCode: newType === 'dischem' ? 'S204' : newType === 'sanbs' ? 'NBTS 12' : undefined,
                  });
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
              >
                <option value="hospital">Hospital (Midrand, Pretoria, Kempton Park)</option>
                <option value="dischem">Dis-Chem Pharmacy & Clinic</option>
                <option value="sanbs">SANBS (South African National Blood Service)</option>
                <option value="other">Other Medical Centre</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Facility Name
              </label>
              <input
                type="text"
                required
                value={formProfile.facilityName}
                onChange={(e) => handleFacilityNameChange(e.target.value)}
                placeholder="e.g. Arwyp Medical Centre"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Account Number</span>
                <span className="text-[10px] text-slate-400">First 3 letters + 001</span>
              </label>
              <input
                type="text"
                required
                value={formProfile.accountNumber}
                onChange={(e) => setFormProfile({ ...formProfile, accountNumber: e.target.value.toUpperCase() })}
                placeholder="e.g. ARW001, WAT001, DIS001, NBTS 12"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Region / City
              </label>
              <select
                value={formProfile.region}
                onChange={(e) => setFormProfile({ ...formProfile, region: e.target.value as any })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
              >
                <option value="Midrand">Midrand</option>
                <option value="Pretoria">Pretoria</option>
                <option value="Kempton Park">Kempton Park</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department / Ward
              </label>
              <input
                type="text"
                value={formProfile.department || ''}
                onChange={(e) => setFormProfile({ ...formProfile, department: e.target.value })}
                placeholder="e.g. Main Theatres, ICU, Sluice Room"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Store or Branch Code (Optional)
              </label>
              <input
                type="text"
                value={formProfile.branchOrStoreCode || ''}
                onChange={(e) => setFormProfile({ ...formProfile, branchOrStoreCode: e.target.value.toUpperCase() })}
                placeholder="e.g. S204, S410, A12, NBTS 12"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person Name
              </label>
              <input
                type="text"
                required
                value={formProfile.contactName}
                onChange={(e) => setFormProfile({ ...formProfile, contactName: e.target.value })}
                placeholder="e.g. Sister Annatjie van der Merwe"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone Number
              </label>
              <input
                type="tel"
                required
                value={formProfile.contactPhone}
                onChange={(e) => setFormProfile({ ...formProfile, contactPhone: e.target.value })}
                placeholder="e.g. +27 (011) 922-1000"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Email Address
              </label>
              <input
                type="email"
                value={formProfile.contactEmail}
                onChange={(e) => setFormProfile({ ...formProfile, contactEmail: e.target.value })}
                placeholder="e.g. orders@arwyp.com"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Delivery Address (Midrand, Pretoria, or Kempton Park)
            </label>
            <input
              type="text"
              required
              value={formProfile.deliveryAddress}
              onChange={(e) => setFormProfile({ ...formProfile, deliveryAddress: e.target.value })}
              placeholder="e.g. 20 Pine Avenue, Kempton Park, 1619"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
            />
          </div>
        </div>

        {/* Item Catalog Selection Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              <span>2. Active Ordering Items Catalog</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {configuredItemIds.length} of {CONTAINER_PRODUCTS.length} items active
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Check only the items your facility orders. Unchecked items won't clutter your ordering screen:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CONTAINER_PRODUCTS.map((prod) => {
              const isChecked = configuredItemIds.includes(prod.id);
              return (
                <label
                  key={prod.id}
                  className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-emerald-50/50 border-emerald-500 ring-1 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          removeItemFromProfile(prod.id);
                        } else {
                          addItemToProfile(prod.id);
                        }
                      }}
                      className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block leading-tight">
                        {prod.name}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {prod.unitSpec} • {prod.category}
                      </span>
                    </div>
                  </div>

                  <span
                    className="w-3 h-3 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: prod.colorHex }}
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Save Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToOrder}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings & Set as Default Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
}
