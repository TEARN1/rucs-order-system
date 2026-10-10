export type ContainerId =
  | 'daniels-s14'
  | 'daniels-s22'
  | 'daniels-s32-plus'
  | 'container-45l'
  | 'container-90l'
  | 'plastic-liners'
  | 'cable-ties-20cm';

export interface ContainerProduct {
  id: ContainerId;
  name: string;
  code: string;
  category: 'Sharpsmart' | 'Clinical Waste Containers' | 'Consumables & Accessories';
  volumeLiters?: number;
  unitSpec: string;
  description: string;
  colorHex: string;
  badge: string;
}

export type OrderQuantities = Partial<Record<ContainerId, number>>;

export type ClientType = 'hospital' | 'dischem' | 'sanbs' | 'other';

export interface ClientAccountDetails {
  accountNumber: string; // e.g., ARW001, CAR001, WAT001, DIS001, NBTS-12
  clientType: ClientType;
  facilityName: string; // e.g., Arwyp Medical Centre, Netcare Waterfall City, Dis-Chem
  branchOrStoreCode?: string; // e.g., S204, S810, A01, NBTS 12
  region: 'Midrand' | 'Pretoria' | 'Kempton Park';
  department?: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  deliveryAddress: string;
  poNumber?: string;
}

export interface CollectionDetails {
  collectionRequested: boolean;
  fullContainersCount?: number;
  wasteStream?: 'Sharps (Yellow)' | 'Cytotoxic (Purple)' | 'Anatomical (Red)' | 'Clinical / Infectious (Orange)';
  pickupBayNotes?: string;
  complianceCertified?: boolean;
}

export interface DeliveryBooking {
  selectedDate: string; // YYYY-MM-DD
  specialDeliveryInstructions?: string;
}

export type OrderStatus = 'inbox' | 'actioned';

export interface OrderTimestamps {
  createdAt: string; // ISO string
  actionedAt?: string; // ISO string
}

export interface Order {
  id: string; // e.g., ORD-2026-9041
  status: OrderStatus;
  account: ClientAccountDetails;
  items: OrderQuantities;
  collection: CollectionDetails;
  delivery: DeliveryBooking;
  timestamps: OrderTimestamps;
  priority: 'standard' | 'urgent';
  assignedDriver?: string;
  assignedVehicle?: string;
  plannerNotes?: string;
}
