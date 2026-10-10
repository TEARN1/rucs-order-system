'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Order, OrderStatus, OrderQuantities, ClientAccountDetails, CollectionDetails, DeliveryBooking } from '@/types/order';
import { INITIAL_SEED_ORDERS } from '@/lib/constants';

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
  createOrder: (orderData: {
    account: ClientAccountDetails;
    items: OrderQuantities;
    collection: CollectionDetails;
    delivery: DeliveryBooking;
    priority?: 'standard' | 'urgent' | 'scheduled';
  }) => Order;
  actionOrder: (orderId: string, driver: string, vehicle: string, notes?: string) => void;
  markOrderDone: (orderId: string, notes?: string) => void;
  reopenOrder: (orderId: string) => void;
  resetAllData: () => void;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  addToast: (type: 'success' | 'info' | 'warning', title: string, message: string) => void;
  selectedOrderForModal: Order | null;
  setSelectedOrderForModal: (order: Order | null) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const STORAGE_KEY = 'rucs_orders_v1';

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(INITIAL_SEED_ORDERS);
  const [activeRole, setActiveRole] = useState<'client' | 'planner'>('client');
  const [plannerTab, setPlannerTab] = useState<OrderStatus>('inbox');
  const [isLoaded, setIsLoaded] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOrders(parsed);
        }
      }
    } catch {
      // Fallback to initial seeds
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
      } catch (err) {
        console.error('Failed to save orders to localStorage', err);
      }
    }
  }, [orders, isLoaded]);

  const addToast = (type: 'success' | 'info' | 'warning', title: string, message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto dismiss after 5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const createOrder = (orderData: {
    account: ClientAccountDetails;
    items: OrderQuantities;
    collection: CollectionDetails;
    delivery: DeliveryBooking;
    priority?: 'standard' | 'urgent' | 'scheduled';
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
      `Order ${newId} has been submitted and is now waiting in the Planner's Inbox.`
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

  const markOrderDone = (orderId: string, notes?: string) => {
    const nowIso = new Date().toISOString();
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'done',
            plannerNotes: notes ? `${ord.plannerNotes || ''} | Completion: ${notes}` : ord.plannerNotes,
            timestamps: {
              ...ord.timestamps,
              completedAt: nowIso,
            },
          };
        }
        return ord;
      })
    );

    addToast(
      'success',
      'Order Marked as Done',
      `Order ${orderId} has been completed and archived in the Done tab.`
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
      'Order Returned to Inbox',
      `Order ${orderId} has been returned to the Inbox for re-planning.`
    );
  };

  const resetAllData = () => {
    setOrders(INITIAL_SEED_ORDERS);
    localStorage.removeItem(STORAGE_KEY);
    addToast('info', 'Demo Data Reset', 'The order system has been reset to default realistic seed data.');
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        activeRole,
        setActiveRole,
        plannerTab,
        setPlannerTab,
        createOrder,
        actionOrder,
        markOrderDone,
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
