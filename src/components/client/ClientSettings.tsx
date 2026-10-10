'use client';

import React, { useState, useMemo } from 'react';
import { useOrders } from '@/context/OrderContext';
import { ClientAccountDetails, ClientType } from '@/types/order';
import { SAMPLE_CLIENT_ACCOUNTS, CONTAINER_PRODUCTS, DEFAULT_FACILITY_SCHEDULE } from '@/lib/constants';
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
  RotateCcw,
  Search,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Ban
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

  const [formProfile, setFormProfile] = useState<ClientAccountDetails>({ 
    ...clientProfile,
    scheduleConfig: clientProfile.scheduleConfig || { ...DEFAULT_FACILITY_SCHEDULE }
  });
  const [facilitySearch, setFacilitySearch] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Filter existing facilities for search bar
  const filteredFacilities = useMemo(() => {
    if (!facilitySearch.trim()) return SAMPLE_CLIENT_ACCOUNTS;
    const q = facilitySearch.toLowerCase();
    return SAMPLE_CLIENT_ACCOUNTS.filter((acc) => {
      const matchName = acc.facilityName.toLowerCase().includes(q);
      const matchNumber = acc.accountNumber.toLowerCase().includes(q);
      const matchStore = (acc.branchOrStoreCode || '').toLowerCase().includes(q);
      const matchRegion = acc.region.toLowerCase().includes(q);
      const matchAddr = acc.deliveryAddress.toLowerCase().includes(q);
      return matchName || matchNumber || matchStore || matchRegion || matchAddr;
    });
  }, [facilitySearch]);

  const handleSelectFacility = (sample: ClientAccountDetails) => {
    setFormProfile({
      ...sample,
      scheduleConfig: sample.scheduleConfig || { ...DEFAULT_FACILITY_SCHEDULE }
    });
    setFacilitySearch('');
  };

  const handleCreateCustomFacility = () => {
    setFormProfile({
      accountNumber: 'NEW001',
      clientType: 'hospital',
      facilityName: '',
      region: 'Midrand',
      department: 'Main Hospital Complex',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      deliveryAddress: '',
      scheduleConfig: { ...DEFAULT_FACILITY_SCHEDULE },
    });
    setFacilitySearch('');
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
    }, 800);
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
            Search or configure your facility details and active items once. They will automatically load every time you place an order.
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

      {/* Facility Search Bar & Quick Preset Directory */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Facility Directory Search
            </h3>
          </div>
          <button
            type="button"
            onClick={handleCreateCustomFacility}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Custom Facility Profile</span>
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={facilitySearch}
            onChange={(e) => setFacilitySearch(e.target.value)}
            placeholder="Search facility name, account number, or city (e.g. Arwyp, Waterfall, Steve Biko, DISC001, NBTS 12, Pretoria)..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
          />
          {facilitySearch && (
            <button
              type="button"
              onClick={() => setFacilitySearch('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filtered Facility Results */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredFacilities.map((sample) => {
              const isSelected = formProfile.accountNumber === sample.accountNumber && formProfile.branchOrStoreCode === sample.branchOrStoreCode;
              return (
                <button
                  key={`${sample.accountNumber}-${sample.branchOrStoreCode || sample.facilityName}`}
                  type="button"
                  onClick={() => handleSelectFacility(sample)}
                  className={`text-left p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500/20'
                      : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-slate-900 truncate">{sample.facilityName}</span>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 shrink-0">
                      {sample.accountNumber}
                      {sample.branchOrStoreCode && ` (${sample.branchOrStoreCode})`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate">{sample.region}</span>
                    {isSelected && (
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {filteredFacilities.length === 0 && (
            <div className="text-center py-4 text-xs text-slate-500 bg-slate-50 rounded-lg">
              No matching facility found. You can click &quot;Create New Custom Facility Profile&quot; above to add your hospital details.
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Facility Details Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>1. Facility Profile & Account Details</span>
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
                    accountNumber: newType === 'hospital' ? 'ARW001' : newType === 'dischem' ? 'DISC001' : 'NBTS 12',
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
                placeholder="e.g. ARW001, WAT001, DISC001, NBTS 12"
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

        {/* Section 2: Active Ordering Items Catalog (Items managed strictly here, not deleted in front) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>2. Active Ordering Items Catalog (Add / Remove)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Items enabled here will appear on your order form. Removed items will be hidden from the order form so they do not clutter your screen.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {configuredItemIds.length} of {CONTAINER_PRODUCTS.length} items active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CONTAINER_PRODUCTS.map((prod) => {
              const isActive = configuredItemIds.includes(prod.id);
              return (
                <div
                  key={prod.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                    isActive
                      ? 'bg-emerald-50/40 border-emerald-400 ring-1 ring-emerald-500/20'
                      : 'bg-slate-50/60 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0"
                        style={{ backgroundColor: prod.colorHex }}
                      />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 leading-tight">
                          {prod.name}
                        </h4>
                        <span className="text-[11px] text-slate-500 block">
                          {prod.unitSpec} • {prod.category}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isActive ? 'Active on Screen' : 'Hidden'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-mono">{prod.code}</span>
                    
                    {isActive ? (
                      <button
                        type="button"
                        onClick={() => removeItemFromProfile(prod.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove Item</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addItemToProfile(prod.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add to Screen</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Client Route Routine Days */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>3. Facility Route Schedule Rules</span>
          </h3>
          <p className="text-xs text-slate-500">
            Assigned collection and delivery routine for this facility:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Booked Days</span>
              </div>
              <p className="text-amber-800 text-[11px]">
                <strong>Mondays, Wednesdays, and Fridays</strong> are routine high-volume sweep rounds and are pre-booked.
              </p>
            </div>

            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-rose-900">
                <Ban className="w-3.5 h-3.5 text-rose-600" />
                <span>Banned Days</span>
              </div>
              <p className="text-rose-800 text-[11px]">
                <strong>Tuesdays and Saturdays</strong> are banned from delivery booking for this facility.
              </p>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Available Days</span>
              </div>
              <p className="text-emerald-800 text-[11px]">
                <strong>Thursdays</strong> are open for scheduled deliveries (subject to 48-hour minimum lead time).
              </p>
            </div>
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
