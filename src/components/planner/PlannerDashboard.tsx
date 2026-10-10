'use client';

import React, { useState, useMemo } from 'react';
import { useOrders } from '@/context/OrderContext';
import { OrderCard } from './OrderCard';
import { ActionOrderModal } from './ActionOrderModal';
import { OrderDetailsModal } from './OrderDetailsModal';
import { Order, OrderStatus } from '@/types/order';
import { CONTAINER_PRODUCTS, SAMPLE_CLIENT_ACCOUNTS } from '@/lib/constants';
import { 
  Inbox, 
  Clock, 
  Search, 
  Filter, 
  Sparkles, 
  Download, 
  Package, 
  RefreshCw, 
  Truck,
  Building2,
  CheckCircle2
} from 'lucide-react';

export function PlannerDashboard() {
  const { 
    orders, 
    plannerTab, 
    setPlannerTab, 
    actionOrder, 
    createOrder,
    selectedOrderForModal, 
    setSelectedOrderForModal 
  } = useOrders();

  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<'all' | 'Midrand' | 'Pretoria' | 'Kempton Park'>('all');
  const [collectionFilter, setCollectionFilter] = useState<'all' | 'collection-only' | 'delivery-only'>('all');
  const [sortBy, setSortBy] = useState<'created-desc' | 'delivery-asc' | 'priority'>('created-desc');
  
  // Action Modal state
  const [orderToAction, setOrderToAction] = useState<Order | null>(null);

  // Tab counts: Only Inbox and Actioned! (Done tab removed as requested)
  const inboxOrders = useMemo(() => orders.filter((o) => o.status === 'inbox'), [orders]);
  const actionedOrders = useMemo(() => orders.filter((o) => o.status === 'actioned'), [orders]);

  // Total containers in rotation
  const totalContainers = useMemo(() => {
    return orders.reduce((sum, ord) => {
      return sum + Object.values(ord.items).reduce((a, b) => a + (b || 0), 0);
    }, 0);
  }, [orders]);

  // Total full collections in schedule
  const totalCollections = useMemo(() => {
    return orders.reduce((sum, ord) => {
      return sum + (ord.collection.collectionRequested ? (ord.collection.fullContainersCount || 0) : 0);
    }, 0);
  }, [orders]);

  // Filter and sort orders for current tab
  const displayedOrders = useMemo(() => {
    const listForTab = orders.filter((o) => o.status === plannerTab);

    return listForTab
      .filter((order) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = order.id.toLowerCase().includes(q);
          const matchAccount = order.account.accountNumber.toLowerCase().includes(q);
          const matchFacility = order.account.facilityName.toLowerCase().includes(q);
          const matchBranch = (order.account.branchOrStoreCode || '').toLowerCase().includes(q);
          const matchAddress = order.account.deliveryAddress.toLowerCase().includes(q);
          const matchContact = order.account.contactName.toLowerCase().includes(q);
          if (!matchId && !matchAccount && !matchFacility && !matchBranch && !matchAddress && !matchContact) {
            return false;
          }
        }

        // Region filter (Midrand, Pretoria, Kempton Park)
        if (regionFilter !== 'all' && order.account.region !== regionFilter) {
          return false;
        }

        // Collection filter
        if (collectionFilter === 'collection-only' && !order.collection.collectionRequested) {
          return false;
        }
        if (collectionFilter === 'delivery-only' && order.collection.collectionRequested) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'created-desc') {
          return new Date(b.timestamps.createdAt).getTime() - new Date(a.timestamps.createdAt).getTime();
        }
        if (sortBy === 'delivery-asc') {
          return new Date(a.delivery.selectedDate).getTime() - new Date(b.delivery.selectedDate).getTime();
        }
        if (sortBy === 'priority') {
          if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
          if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
          return new Date(b.timestamps.createdAt).getTime() - new Date(a.timestamps.createdAt).getTime();
        }
        return 0;
      });
  }, [orders, plannerTab, searchQuery, regionFilter, collectionFilter, sortBy]);

  // Simulate incoming order for Midrand, Pretoria, Kempton Park, Dis-Chem, or SANBS
  const handleSimulateIncomingOrder = () => {
    const sample = SAMPLE_CLIENT_ACCOUNTS[Math.floor(Math.random() * SAMPLE_CLIENT_ACCOUNTS.length)];
    createOrder({
      account: { ...sample },
      items: {
        'daniels-s14': Math.floor(Math.random() * 8) + 2,
        'daniels-s22': Math.floor(Math.random() * 6) + 1,
        'daniels-s32-plus': Math.floor(Math.random() * 4) + 1,
        'container-45l': Math.floor(Math.random() * 6),
        'container-90l': Math.floor(Math.random() * 3),
        'plastic-liners': 3,
        'cable-ties-20cm': 2,
      },
      collection: {
        collectionRequested: true,
        fullContainersCount: Math.floor(Math.random() * 14) + 4,
        wasteStream: 'Sharps (Yellow)',
        pickupBayNotes: 'Staged at sluice room / receiving dock',
        complianceCertified: true,
      },
      delivery: {
        selectedDate: '2026-10-14',
        specialDeliveryInstructions: 'Generated via test simulation.',
      },
      priority: Math.random() > 0.6 ? 'urgent' : 'standard',
    });
    setPlannerTab('inbox');
  };

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Status', 'Account No', 'Branch / Store Code', 'Facility Name', 'Region', 'Delivery Address', 'Target Date', 'Items Count', 'Full Bins Collection', 'Created At'];
    const rows = orders.map((o) => {
      const itemsCount = Object.values(o.items).reduce((a, b) => a + (b || 0), 0);
      const colUnits = o.collection.collectionRequested ? o.collection.fullContainersCount || 0 : 0;
      return [
        o.id,
        o.status,
        o.account.accountNumber,
        `"${o.account.branchOrStoreCode || ''}"`,
        `"${o.account.facilityName}"`,
        `"${o.account.region}"`,
        `"${o.account.deliveryAddress}"`,
        o.delivery.selectedDate,
        itemsCount,
        colUnits,
        `"${o.timestamps.createdAt}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rucs-orders-${plannerTab}-manifest.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Operations Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Planner Operations Dashboard
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Gauteng Fleet Hub
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch triage for Midrand, Pretoria, and Kempton Park: Hospitals, Dis-Chem branches, and SANBS blood banks.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSimulateIncomingOrder}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Simulate Incoming Order</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export Manifest</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Inbox KPI */}
        <div 
          onClick={() => setPlannerTab('inbox')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            plannerTab === 'inbox'
              ? 'bg-amber-50/60 border-amber-300 shadow-sm ring-1 ring-amber-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inbox</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{inboxOrders.length}</span>
            <span className="text-xs text-amber-700 font-semibold">Awaiting Dispatch</span>
          </div>
        </div>

        {/* Actioned KPI */}
        <div 
          onClick={() => setPlannerTab('actioned')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            plannerTab === 'actioned'
              ? 'bg-indigo-50/60 border-indigo-300 shadow-sm ring-1 ring-indigo-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Actioned</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{actionedOrders.length}</span>
            <span className="text-xs text-indigo-700 font-semibold">Dispatched / In Route</span>
          </div>
        </div>

        {/* Total Units KPI */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled Items</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalContainers}</span>
            <span className="text-xs text-slate-500 font-medium">units</span>
          </div>
        </div>

        {/* Total Bins Collection KPI */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bins to Collect</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-900">{totalCollections}</span>
            <span className="text-xs text-slate-500 font-medium">full bins</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation: Strictly Inbox and Actioned (Done is removed!) */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8" aria-label="Planner Tabs">
          <button
            type="button"
            onClick={() => setPlannerTab('inbox')}
            className={`py-3 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all ${
              plannerTab === 'inbox'
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Inbox</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              plannerTab === 'inbox'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {inboxOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPlannerTab('actioned')}
            className={`py-3 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all ${
              plannerTab === 'actioned'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Actioned</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              plannerTab === 'actioned'
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {actionedOrders.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Filters and Search Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospital, ARW001, S204, NBTS, address..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-xs"
          />
        </div>

        {/* Region, Collection, and Sort Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          {/* Region filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Region:</span>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none font-medium"
            >
              <option value="all">All Regions</option>
              <option value="Midrand">Midrand</option>
              <option value="Pretoria">Pretoria</option>
              <option value="Kempton Park">Kempton Park</option>
            </select>
          </div>

          {/* Collection Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Filter:</span>
            <select
              value={collectionFilter}
              onChange={(e) => setCollectionFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none font-medium"
            >
              <option value="all">All Orders</option>
              <option value="collection-only">Collection Required</option>
              <option value="delivery-only">Delivery Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none font-medium"
            >
              <option value="created-desc">Timestamp (Newest First)</option>
              <option value="delivery-asc">Delivery Date (Earliest)</option>
              <option value="priority">Priority (Urgent First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Grid / Cards List */}
      {displayedOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No orders in the {plannerTab.toUpperCase()} queue
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No matching results found for "${searchQuery}".`
              : plannerTab === 'inbox'
              ? 'All new incoming hospital orders have been actioned.'
              : 'No orders are currently in active dispatch.'}
          </p>
          {plannerTab === 'inbox' && (
            <button
              type="button"
              onClick={handleSimulateIncomingOrder}
              className="mt-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              Simulate an incoming order now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {displayedOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onOpenActionModal={setOrderToAction}
              onOpenDetailsModal={setSelectedOrderForModal}
            />
          ))}
        </div>
      )}

      {/* Action Order Modal */}
      <ActionOrderModal
        order={orderToAction}
        isOpen={Boolean(orderToAction)}
        onClose={() => setOrderToAction(null)}
        onAction={actionOrder}
      />

      {/* Full Order Docket Modal */}
      <OrderDetailsModal
        order={selectedOrderForModal}
        onClose={() => setSelectedOrderForModal(null)}
      />
    </div>
  );
}
