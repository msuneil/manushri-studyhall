import type { Room } from '../types';

export const mockRooms: Room[] = [
  {
    id: 'room_1',
    name: 'Hall A',
    type: 'AC • Full Day',
    status: 'Active',
    pricingPreview: '₹2000/month',
    rulesPreview: ['Silent Zone', 'Laptop Only'],
    revenueCollected: 76000,
    revenueExpected: 100000,
    totalSeats: 50,
    occupiedSeats: 48,
    seatPrefix: 'AC',
    genderRestriction: 'Mixed',
    notes: 'Main AC hall, high demand.'
  },
  {
    id: 'room_2',
    name: 'Hall B',
    type: 'Non-AC • Regular',
    status: 'Active',
    pricingPreview: '₹1200/month',
    rulesPreview: ['Discussion Allowed'],
    revenueCollected: 24000,
    revenueExpected: 36000,
    totalSeats: 30,
    occupiedSeats: 20,
    seatPrefix: 'NAC',
    genderRestriction: 'Mixed',
    notes: 'Good for group studies.'
  },
  {
    id: 'room_3',
    name: 'Hall C',
    type: 'Premium Hall',
    status: 'Maintenance',
    pricingPreview: '₹3000/month',
    rulesPreview: ['Silent Zone', 'Dedicated Desk'],
    revenueCollected: 45000,
    revenueExpected: 60000,
    totalSeats: 20,
    occupiedSeats: 15,
    seatPrefix: 'PRM',
    genderRestriction: 'Female',
    notes: 'Premium hall currently under AC maintenance.'
  }
];
