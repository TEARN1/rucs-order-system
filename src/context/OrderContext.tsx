'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Order, OrderStatus, OrderQuantities, ClientAccountDetails, CollectionDetails, DeliveryBooking, ContainerId } from '@/types/order';
import { INITIAL_SEED_ORDERS, CONTAINER_PRODUCTS, SAMPLE_CLIENT_ACCOUNTS } from '@/lib/constants';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
}

interface OrderContextType {
  orders: Order[];
  activeRole: 'client' | 'planner';
  setActiveRole: (role: 'client' | 'planner') => void;
  plannerTab: OrderStatus;
  setPlannerTab: (tab: OrderStatus) => void;
  
  // Client persistent profile (Saved facility settings)
  clientProfile: ClientAccountDetails;
  saveClientProfile: (profile: ClientAccountDetails) => void;

  // Client active items settings (customized item catalog)
  configuredItemIds: ContainerId[];
  addItemToProfile: (id: ContainerId) => void;
  removeItemFromProfile: (id: ContainerId) => void;
  resetConfiguredItems: (ids?: ContainerId[]) => void;

  // Planner Calendar Date Filter
  plannerDateFilter: string | null;
  setPlannerDateFilter: (date: string | null) => void;

  // Selected Order / Drawer (Email Inbox row viewer)
  selectedOrderForModal: Order | null;
  setSelectedOrderForModal: (order: Order | null) => void;

  // Inspect Facility History Modal
  selectedFacilityHistoryAccount: string | null;
  setSelectedFacilityHistoryAccount: (acc: string | null) => void;
  getFacilityOrders: (accountNumber: string) => Order[];

  createOrder: (orderData: {
    account: ClientAccountDetails;
    items: OrderQuantities;
    collection: CollectionDetails;
    delivery: DeliveryBooking;
    priority?: 'standard' | 'urgent';
  }) => Order;
  actionOrder: (orderId: string, driver: string, vehicle: string, notes?: string) => void;
  reopenOrder: (orderId: string) => void;
  resetAllData: () => void;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  addToast: (type: 'success' | 'info' | 'warning', title: string, message: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const STORAGE_KEY = 'rucs_orders_v3';
const PROFILE_STORAGE_KEY = 'rucs_client_profile_v3';
const ITEMS_STORAGE_KEY = 'rucs_configured_items_v3';

const DEFAULT_ITEM_IDS: ContainerId[] = [
  'daniels-s14',
  'daniels-s22',
  'daniels-s32-plus',
  'container-45l',
  'container-90l',
  'plastic-liners',
  'cable-ties-20cm',
];

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(INITIAL_SEED_ORDERS);
  const [activeRole, setActiveRole] = useState<'client' | 'planner'>('client');
  const [plannerTab, setPlannerTab] = useState<OrderStatus>('inbox');
  const [clientProfile, setClientProfile] = useState<ClientAccountDetails>(SAMPLE_CLIENT_ACCOUNTS[0]);
  const [configuredItemIds, setConfiguredItemIds] = useState<ContainerId[]>(DEFAULT_ITEM_IDS);
  const [plannerDateFilter, setPlannerDateFilter] = useState<string | null>(null);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
  const [selectedFacilityHistoryAccount, setSelectedFacilityHistoryAccount] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem(STORAGE_KEY);
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validOrders = parsed.filter((o: any) => o.status === 'inbox' || o.status === 'actioned');
          setOrders(validOrders.length > 0 ? validOrders : INITIAL_SEED_ORDERS);
        }
      }

      const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        if (parsedProfile && parsedProfile.accountNumber) {
          setClientProfile(parsedProfile);
        }
      }

      const savedItems = localStorage.getItem(ITEMS_STORAGE_KEY);
      if (savedItems) {
        const parsedItems = JSON.parse(savedItems);
        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          setConfiguredItemIds(parsedItems);
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(clientProfile));
        localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(configuredItemIds));
      } catch (err) {
        console.error('Failed to save to localStorage', err);
      }
    }
  }, [orders, clientProfile, configuredItemIds, isLoaded]);

  const addToast = (type: 'success' | 'info' | 'warning', title: string, message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const saveClientProfile = (profile: ClientAccountDetails) => {
    setClientProfile(profile);
    addToast('success', 'Profile Settings Saved', `Default settings saved for ${profile.facilityName} (${profile.accountNumber}).`);
  };

  const addItemToProfile = (id: ContainerId) => {
    setConfiguredItemIds((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
    const product = CONTAINER_PRODUCTS.find((p) => p.id === id);
    addToast('info', 'Item Added', `${product?.name || id} is now on your order screen.`);
  };

  const removeItemFromProfile = (id: ContainerId) => {
    setConfiguredItemIds((prev) => prev.filter((item) => item !== id));
    const product = CONTAINER_PRODUCTS.find((p) => p.id === id);
    addToast('info', 'Item Removed', `${product?.name || id} removed from your order list.`);
  };

  const resetConfiguredItems = (ids?: ContainerId[]) => {
    setConfiguredItemIds(ids || DEFAULT_ITEM_IDS);
  };

  const getFacilityOrders = (accountNumber: string) => {
    return orders.filter((o) => o.account.accountNumber.toUpperCase() === accountNumber.toUpperCase());
  };

  const createOrder = (orderData: {
    account: ClientAccountDetails;
    items: OrderQuantities;
    collection: CollectionDetails;
    delivery: DeliveryBooking;
    priority?: 'standard' | 'urgent';
  }): Order => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `ORD-2026-${randomSuffix}`;
    const nowIso = new Date().toISOString();

    const newOrder: Order = {
      id: newId,
      status: 'inbox',
      account: orderData.account,
      items: orderData.items,
      collection: orderData.collection,
      delivery: orderData.delivery,
      priority: orderData.priority || 'standard',
      timestamps: {
        createdAt: nowIso,
      },
    };

    setOrders((prev) => [newOrder, ...prev]);

    addToast(
      'success',
      'Order Sent to Planner',
      `Order ${newId} received in Planner Inbox for ${orderData.account.facilityName}.`
    );

    return newOrder;
  };

  const actionOrder = (orderId: string, driver: string, vehicle: string, notes?: string) => {
    const nowIso = new Date().toISOString();
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'actioned',
            assignedDriver: driver,
            assignedVehicle: vehicle,
            plannerNotes: notes || ord.plannerNotes,
            timestamps: {
              ...ord.timestamps,
              actionedAt: nowIso,
            },
          };
        }
        return ord;
      })
    );

    addToast(
      'info',
      'Order Actioned',
      `Order ${orderId} dispatched with ${driver} (${vehicle}).`
    );
  };

  const reopenOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'inbox',
          };
        }
        return ord;
      })
    );

    addToast(
      'warning',
      'Returned to Inbox',
      `Order ${orderId} returned to Inbox.`
    );
  };

  const resetAllData = () => {
    setOrders(INITIAL_SEED_ORDERS);
    setClientProfile(SAMPLE_CLIENT_ACCOUNTS[0]);
    setConfiguredItemIds(DEFAULT_ITEM_IDS);
    setPlannerDateFilter(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    localStorage.removeItem(ITEMS_STORAGE_KEY);
    addToast('info', 'System Reset', 'All orders, profiles, and catalog preferences reset to defaults.');
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        activeRole,
        setActiveRole,
        plannerTab,
        setPlannerTab,
        clientProfile,
        saveClientProfile,
        configuredItemIds,
        addItemToProfile,
        removeItemFromProfile,
        resetConfiguredItems,
        plannerDateFilter,
        setPlannerDateFilter,
        selectedOrderForModal,
        setSelectedOrderForModal,
        selectedFacilityHistoryAccount,
        setSelectedFacilityHistoryAccount,
        getFacilityOrders,
        createOrder,
        actionOrder,
        reopenOrder,
        resetAllData,
        toasts,
        dismissToast,
        addToast,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
