export type RoomStatus = 'Active' | 'Maintenance' | 'Inactive';

export interface Room {
  id: string;
  name: string;
  type: string;
  status: RoomStatus;
  pricingPreview: string; // e.g. "₹2000/month"
  rulesPreview: string[]; // e.g. ["Silent Zone", "Laptop Only"]
  revenueCollected: number;
  revenueExpected: number;
  totalSeats: number;
  occupiedSeats: number;
  seatPrefix: string;
  genderRestriction: 'Male' | 'Female' | 'Mixed';
  notes?: string;
}

export function isAllocationBlocked(status: RoomStatus): boolean {
  return status === 'Maintenance' || status === 'Inactive';
}

export function isValidTransition(from: RoomStatus, to: RoomStatus): boolean {
  if (from === to) return true;
  const allowed: Record<RoomStatus, RoomStatus[]> = {
    'Active': ['Maintenance', 'Inactive'],
    'Maintenance': ['Active'],
    'Inactive': ['Active']
  };
  return allowed[from]?.includes(to) ?? false;
}
