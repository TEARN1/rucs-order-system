'use client';

import React, { useState, useMemo } from 'react';
import { useOrders } from '@/context/OrderContext';
import { EmailInboxRow } from './EmailInboxRow';
import { ActionOrderModal } from './ActionOrderModal';
import { OrderDetailsModal } from './OrderDetailsModal';
import { FacilityHistoryModal } from './FacilityHistoryModal';
import { Order } from '@/types/order';
import { SAMPLE_CLIENT_ACCOUNTS } from '@/lib/constants';
import { 
  Inbox, 
  Clock, 
  Search, 
  Sparkles, 
  Download, 
  Package, 
  RefreshCw, 
  Truck,
  Calendar as CalendarIcon,
  Filter,
  CheckCircle2,
  Building2,
  X
} from 'lucide-react';

export function PlannerDashboard() {
  const { 
    orders, 
    plannerTab, 
    setPlannerTab, 
    actionOrder, 
    createOrder,
    plannerDateFilter,
    setPlannerDateFilter,
    selectedOrderForModal, 
    setSelectedOrderForModal 
  } = useOrders();

  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<'all' | 'Midrand' | 'Pretoria' | 'Kempton Park'>('all');
  const [collectionFilter, setCollectionFilter] = useState<'all' | 'collection-only' | 'delivery-only'>('all');
  const [orderToAction, setOrderToAction] = useState<Order | null>(null);

  // Tab counts (Inbox and Actioned only)
  const inboxOrders = useMemo(() => orders.filter((o) => o.status === 'inbox'), [orders]);
  const actionedOrders = useMemo(() => orders.filter((o) => o.status === 'actioned'), [orders]);

  // Extract all unique creation dates present in the system for calendar date filter
  const distinctReceivedDates = useMemo(() => {
    const datesMap: Record<string, number> = {};
    orders.forEach((ord) => {
      const d = ord.timestamps.createdAt.split('T')[0];
      datesMap[d] = (datesMap[d] || 0) + 1;
    });
    return Object.entries(datesMap).sort((a, b) => b[0].localeCompare(a[0]));
  }, [orders]);

  // Filter orders for current tab
  const displayedOrders = useMemo(() => {
    const listForTab = orders.filter((o) => o.status === plannerTab);

    return listForTab
      .filter((order) => {
        // Date Received filter
        if (plannerDateFilter) {
          const orderDate = order.timestamps.createdAt.split('T')[0];
          if (orderDate !== plannerDateFilter) {
            return false;
          }
        }

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

        // Region filter
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
      .sort((a, b) => new Date(b.timestamps.createdAt).getTime() - new Date(a.timestamps.createdAt).getTime());
  }, [orders, plannerTab, plannerDateFilter, searchQuery, regionFilter, collectionFilter]);

  // Total scheduled items and collection bins
  const totalItemsCount = useMemo(() => {
    return orders.reduce((sum, ord) => sum + Object.values(ord.items).reduce((a, b) => a + (b || 0), 0), 0);
  }, [orders]);

  const totalBinsToCollect = useMemo(() => {
    return orders.reduce((sum, ord) => sum + (ord.collection.collectionRequested ? (ord.collection.fullContainersCount || 0) : 0), 0);
  }, [orders]);

  // Simulate an incoming order
  const handleSimulateIncomingOrder = () => {
    const sample = SAMPLE_CLIENT_ACCOUNTS[Math.floor(Math.random() * SAMPLE_CLIENT_ACCOUNTS.length)];
    createOrder({
      account: { ...sample },
      items: {
        'daniels-s14': Math.floor(Math.random() * 8) + 2,
        'daniels-s22': Math.floor(Math.random() * 6) + 1,
        'daniels-s32-plus': Math.floor(Math.random() * 4) + 1,
        'container-45l': Math.floor(Math.random() * 6),
        'container-90l': Math.floor(Math.random() * 2),
        'plastic-liners': 3,
        'cable-ties-20cm': 2,
      },
      collection: {
        collectionRequested: true,
        fullContainersCount: Math.floor(Math.random() * 12) + 4,
        wasteStream: 'Sharps (Yellow)',
        pickupBayNotes: 'Theatre dirty utility holding room',
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
    const headers = ['Order ID', 'Status', 'Account No', 'Branch / Store', 'Facility Name', 'Region', 'Delivery Address', 'Target Date', 'Items', 'Collection Bins', 'Received Timestamp'];
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
    link.setAttribute('download', `rucs-planner-${plannerTab}-manifest.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-5">
      {/* Top Operations Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Planner Operations Hub
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Email-Style Inbox
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Incoming hospital consignments from Midrand, Pretoria, and Kempton Park. Click any row to expand details, or click a hospital name to view its order history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSimulateIncomingOrder}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all shadow-2xs"
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

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setPlannerTab('inbox')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            plannerTab === 'inbox'
              ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Inbox (New)</span>
            <Inbox className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{inboxOrders.length}</span>
            <span className="text-xs text-amber-800 font-semibold">orders</span>
          </div>
        </div>

        <div 
          onClick={() => setPlannerTab('actioned')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            plannerTab === 'actioned'
              ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Actioned</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{actionedOrders.length}</span>
            <span className="text-xs text-indigo-800 font-semibold">dispatched</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Items</span>
            <Package className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{totalItemsCount}</span>
            <span className="text-xs text-slate-500">units</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Bins To Collect</span>
            <RefreshCw className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-900">{totalBinsToCollect}</span>
            <span className="text-xs text-slate-500">full bins</span>
          </div>
        </div>
      </div>

      {/* Calendar Received-Date Filter Bar (Date Selector for Planner) */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">
              Filter by Order Received Date:
            </span>
            {plannerDateFilter ? (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <span>Selected: {plannerDateFilter}</span>
                <button
                  type="button"
                  onClick={() => setPlannerDateFilter(null)}
                  className="hover:text-black ml-1"
                  title="Clear date filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : (
              <span className="text-xs text-slate-500 font-medium">Viewing all dates</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPlannerDateFilter(null)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                !plannerDateFilter
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Dates ({orders.length})
            </button>
          </div>
        </div>

        {/* Quick Date Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          {distinctReceivedDates.map(([dateStr, count]) => {
            const isSelected = plannerDateFilter === dateStr;
            const isToday = dateStr === '2026-10-10';
            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setPlannerDateFilter(isSelected ? null : dateStr)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 font-medium ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>{isToday ? 'Today (Oct 10)' : dateStr}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Mailbox Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Inbox / Actioned Tabs & Search / Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          {/* Tab Selector */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPlannerTab('inbox')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                plannerTab === 'inbox'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Inbox</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                plannerTab === 'inbox' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {inboxOrders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPlannerTab('actioned')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                plannerTab === 'actioned'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Actioned</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                plannerTab === 'actioned' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {actionedOrders.length}
              </span>
            </button>
          </div>

          {/* Search & Region Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hospital, account, address..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium"
            >
              <option value="all">All Regions</option>
              <option value="Midrand">Midrand</option>
              <option value="Pretoria">Pretoria</option>
              <option value="Kempton Park">Kempton Park</option>
            </select>

            <select
              value={collectionFilter}
              onChange={(e) => setCollectionFilter(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium"
            >
              <option value="all">All Collections</option>
              <option value="collection-only">Collection Only</option>
              <option value="delivery-only">Delivery Only</option>
            </select>
          </div>
        </div>

        {/* Column Headers for Email Line View */}
        <div className="hidden sm:flex items-center justify-between py-2 px-4 bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <div className="flex items-center gap-2.5 shrink-0 w-28">
            <span>Order ID</span>
          </div>
          <div className="w-48 sm:w-60 shrink-0">
            <span>Hospital / Client & Account</span>
          </div>
          <div className="flex-1 hidden md:block">
            <span>Consignment Summary</span>
          </div>
          <div className="hidden lg:block shrink-0 w-32 text-center">
            <span>Collection</span>
          </div>
          <div className="hidden sm:block shrink-0 w-28 text-right">
            <span>Delivery Date</span>
          </div>
          <div className="shrink-0 w-20 text-right">
            <span>Received</span>
          </div>
          <div className="shrink-0 w-16 text-right">
            <span>Status</span>
          </div>
        </div>

        {/* Email Inbox Rows */}
        {displayedOrders.length === 0 ? (
          <div className="p-12 text-center space-y-2 bg-white">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">
              No orders found in {plannerTab.toUpperCase()}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {plannerDateFilter
                ? `No orders received on ${plannerDateFilter}. Try selecting "All Dates".`
                : searchQuery
                ? `No matches for "${searchQuery}".`
                : 'All orders in this queue are cleared.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayedOrders.map((order) => (
              <EmailInboxRow
                key={order.id}
                order={order}
                onOpenActionModal={setOrderToAction}
                onOpenDetailsModal={setSelectedOrderForModal}
              />
            ))}
          </div>
        )}
      </div>

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

      {/* Facility Order History Modal */}
      <FacilityHistoryModal />
    </div>
  );
}
