export type ContainerId =
  | 'daniels-s14'
  | 'daniels-s22'
  | 'daniels-a32-plus'
  | 'container-45l'
  | 'container-90l';

export interface ContainerProduct {
  id: ContainerId;
  name: string;
  code: string;
  category: 'Sharpsmart' | 'Access Plus' | 'Clinical Waste Containers';
  volumeLiters: number;
  description: string;
  usage: string;
  colorHex: string;
  badge: string;
  imageUrl?: string;
}

export type OrderQuantities = Record<ContainerId, number>;

export interface ClientAccountDetails {
  accountNumber: string;
  facilityName: string;
  department: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  deliveryAddress: string;
  buildingDockNotes: string;
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
  timeSlot: 'Morning (08:00 - 12:00)' | 'Afternoon (12:00 - 17:00)' | 'Express Priority';
  specialDeliveryInstructions?: string;
}

export type OrderStatus = 'inbox' | 'actioned' | 'done';

export interface OrderTimestamps {
  createdAt: string; // ISO string
  actionedAt?: string; // ISO string
  completedAt?: string; // ISO string
}

export interface Order {
  id: string; // e.g., ORD-2026-9041
  status: OrderStatus;
  account: ClientAccountDetails;
  items: OrderQuantities;
  collection: CollectionDetails;
  delivery: DeliveryBooking;
  timestamps: OrderTimestamps;
  priority: 'standard' | 'urgent' | 'scheduled';
  assignedDriver?: string;
  assignedVehicle?: string;
  plannerNotes?: string;
  internalRef?: string;
}
