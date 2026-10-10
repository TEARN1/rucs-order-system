'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Order, OrderStatus, OrderQuantities, ClientAccountDetails, CollectionDetails, DeliveryBooking, ContainerId } from '@/types/order';
import { INITIAL_SEED_ORDERS, CONTAINER_PRODUCTS } from '@/lib/constants';

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
  
  // Client active items settings (customized item catalog)
  configuredItemIds: ContainerId[];
  addItemToProfile: (id: ContainerId) => void;
  removeItemFromProfile: (id: ContainerId) => void;
  resetConfiguredItems: (ids?: ContainerId[]) => void;

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
  selectedOrderForModal: Order | null;
  setSelectedOrderForModal: (order: Order | null) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const STORAGE_KEY = 'rucs_orders_v2';
const ITEMS_STORAGE_KEY = 'rucs_configured_items_v2';

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
  const [configuredItemIds, setConfiguredItemIds] = useState<ContainerId[]>(DEFAULT_ITEM_IDS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem(STORAGE_KEY);
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out legacy 'done' orders if any
          const validOrders = parsed.filter((o: any) => o.status === 'inbox' || o.status === 'actioned');
          setOrders(validOrders.length > 0 ? validOrders : INITIAL_SEED_ORDERS);
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
        localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(configuredItemIds));
      } catch (err) {
        console.error('Failed to save to localStorage', err);
      }
    }
  }, [orders, configuredItemIds, isLoaded]);

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

  const addItemToProfile = (id: ContainerId) => {
    setConfiguredItemIds((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
    const product = CONTAINER_PRODUCTS.find((p) => p.id === id);
    addToast('info', 'Item Added to Your List', `${product?.name || id} is now on your active order screen.`);
  };

  const removeItemFromProfile = (id: ContainerId) => {
    setConfiguredItemIds((prev) => prev.filter((item) => item !== id));
    const product = CONTAINER_PRODUCTS.find((p) => p.id === id);
    addToast('info', 'Item Removed', `${product?.name || id} removed from your active order list.`);
  };

  const resetConfiguredItems = (ids?: ContainerId[]) => {
    setConfiguredItemIds(ids || DEFAULT_ITEM_IDS);
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
      'Order Placed Successfully',
      `Order ${newId} submitted to Planner Inbox for ${orderData.account.facilityName} (${orderData.account.accountNumber}).`
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
      `Order ${orderId} moved to Actioned tab. Assigned to ${driver} (${vehicle}).`
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
      `Order ${orderId} returned to Inbox for re-assignment.`
    );
  };

  const resetAllData = () => {
    setOrders(INITIAL_SEED_ORDERS);
    setConfiguredItemIds(DEFAULT_ITEM_IDS);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ITEMS_STORAGE_KEY);
    addToast('info', 'Reset Complete', 'System reset to default seed data for Midrand, Pretoria & Kempton Park.');
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        activeRole,
        setActiveRole,
        plannerTab,
        setPlannerTab,
        configuredItemIds,
        addItemToProfile,
        removeItemFromProfile,
        resetConfiguredItems,
        createOrder,
        actionOrder,
        reopenOrder,
        resetAllData,
        toasts,
        dismissToast,
        addToast,
        selectedOrderForModal,
        setSelectedOrderForModal,
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
