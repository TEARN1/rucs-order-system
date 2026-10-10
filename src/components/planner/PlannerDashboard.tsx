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
  CheckCircle2, 
  Search, 
  Filter, 
  PlusCircle, 
  Sparkles, 
  Download, 
  Package, 
  RefreshCw, 
  Truck,
  RotateCcw
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
  const [collectionFilter, setCollectionFilter] = useState<'all' | 'collection-only' | 'delivery-only'>('all');
  const [sortBy, setSortBy] = useState<'created-desc' | 'delivery-asc' | 'priority'>('created-desc');
  
  // Action Modal state
  const [orderToAction, setOrderToAction] = useState<Order | null>(null);

  // Tab counts
  const inboxOrders = useMemo(() => orders.filter((o) => o.status === 'inbox'), [orders]);
  const actionedOrders = useMemo(() => orders.filter((o) => o.status === 'actioned'), [orders]);
  const doneOrders = useMemo(() => orders.filter((o) => o.status === 'done'), [orders]);

  // Total containers in schedule
  const totalScheduledContainers = useMemo(() => {
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
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = order.id.toLowerCase().includes(q);
          const matchAccount = order.account.accountNumber.toLowerCase().includes(q);
          const matchFacility = order.account.facilityName.toLowerCase().includes(q);
          const matchContact = order.account.contactName.toLowerCase().includes(q);
          const matchDept = order.account.department.toLowerCase().includes(q);
          if (!matchId && !matchAccount && !matchFacility && !matchContact && !matchDept) {
            return false;
          }
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
  }, [orders, plannerTab, searchQuery, collectionFilter, sortBy]);

  // Simulate an incoming client order for testing reactivity
  const handleSimulateIncomingOrder = () => {
    const sample = SAMPLE_CLIENT_ACCOUNTS[Math.floor(Math.random() * SAMPLE_CLIENT_ACCOUNTS.length)];
    createOrder({
      account: { ...sample },
      items: {
        'daniels-s14': Math.floor(Math.random() * 8) + 2,
        'daniels-s22': Math.floor(Math.random() * 6) + 1,
        'daniels-a32-plus': Math.floor(Math.random() * 4) + 1,
        'container-45l': Math.floor(Math.random() * 6),
        'container-90l': Math.floor(Math.random() * 2),
      },
      collection: {
        collectionRequested: Math.random() > 0.3,
        fullContainersCount: Math.floor(Math.random() * 12) + 4,
        wasteStream: 'Sharps (Yellow)',
        pickupBayNotes: 'Staged at main clean-to-dirty exchange room.',
        complianceCertified: true,
      },
      delivery: {
        selectedDate: '2026-10-15',
        timeSlot: 'Morning (08:00 - 12:00)',
        specialDeliveryInstructions: 'Generated via test simulation.',
      },
      priority: Math.random() > 0.6 ? 'urgent' : 'standard',
    });
    setPlannerTab('inbox');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Status', 'Account No', 'Facility', 'Department', 'Delivery Date', 'Total Units', 'Collection Units', 'Created At'];
    const rows = orders.map((o) => {
      const units = Object.values(o.items).reduce((a, b) => a + (b || 0), 0);
      const colUnits = o.collection.collectionRequested ? o.collection.fullContainersCount || 0 : 0;
      return [
        o.id,
        o.status,
        o.account.accountNumber,
        `"${o.account.facilityName}"`,
        `"${o.account.department}"`,
        o.delivery.selectedDate,
        units,
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Planner Operations Dashboard
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              Logistics Dispatch Hub
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time queue triage: Daniels Sharpsmart container replenishment & hazardous waste collection.
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
            <span className="hidden sm:inline">Export CSV</span>
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
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inbox (Unassigned)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{inboxOrders.length}</span>
            <span className="text-xs text-amber-700 font-semibold">Requires Action</span>
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
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Actioned / Routes</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{actionedOrders.length}</span>
            <span className="text-xs text-indigo-700 font-semibold">In Transit / Scheduled</span>
          </div>
        </div>

        {/* Done KPI */}
        <div 
          onClick={() => setPlannerTab('done')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            plannerTab === 'done'
              ? 'bg-emerald-50/60 border-emerald-300 shadow-sm ring-1 ring-emerald-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Done (Completed)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{doneOrders.length}</span>
            <span className="text-xs text-emerald-700 font-semibold">Verified Closed</span>
          </div>
        </div>

        {/* Total Volumes KPI */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rotation Units</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalScheduledContainers}</span>
            <span className="text-xs text-slate-500 font-medium">({totalCollections} collections)</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation (Inbox, Actioned, Done) */}
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
            <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
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
            <Clock className="w-4 h-4" />
            <span>Actioned</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
              plannerTab === 'actioned'
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {actionedOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPlannerTab('done')}
            className={`py-3 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all ${
              plannerTab === 'done'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Done</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
              plannerTab === 'done'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {doneOrders.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Filter, Search, and Sort Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facility, account #, order ID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-xs"
          />
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Collection Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Filter:</span>
            <select
              value={collectionFilter}
              onChange={(e) => setCollectionFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none font-medium"
            >
              <option value="all">All Orders</option>
              <option value="collection-only">🔄 Collection Required</option>
              <option value="delivery-only">📦 Delivery Only</option>
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
              ? `No matching results found for "${searchQuery}". Try clearing filters.`
              : plannerTab === 'inbox'
              ? 'All new incoming orders have been actioned. Good job!'
              : plannerTab === 'actioned'
              ? 'No active orders currently dispatched.'
              : 'No orders have been marked as completed yet.'}
          </p>
          {plannerTab === 'inbox' && (
            <button
              type="button"
              onClick={handleSimulateIncomingOrder}
              className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors"
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
