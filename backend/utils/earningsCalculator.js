import { calculateDistance } from './distanceCalculator.js';

/**
 * Shared utility to calculate trip-level financial details (revenue, expenses, and net profit).
 * This serves as the single source of truth for earnings calculations across all modules.
 */
export const calculateTripFinance = (trip) => {
  let distance = Number(trip?.actualDistance) || Number(trip?.estimatedDistance) || 0;
  if (distance <= 0 && trip?.startLocation && trip?.endLocation) {
    try {
      distance = calculateDistance(trip.startLocation, trip.endLocation) || 0;
    } catch {
      distance = 0;
    }
  }

  const weight = Number(trip?.cargoWeight) || 0;
  const directAmount = Number(trip?.revenue || trip?.fare || trip?.totalAmount || trip?.amount || trip?.codAmount || 0);

  if (distance <= 0 && weight <= 0) {
    return {
      revenue: directAmount > 0 ? Math.round(directAmount) : 0,
      expenses: 0,
      netEarnings: directAmount > 0 ? Math.round(directAmount) : 0,
      distance: 0,
      weight: 0
    };
  }

  // Revenue = distance * 52 + cargoWeight * 4.5
  const calculatedRevenue = Math.round(distance * 52 + weight * 4.5);
  const revenue = calculatedRevenue > 0 ? calculatedRevenue : (directAmount > 0 ? Math.round(directAmount) : 0);
  
  // Expenses = distance * 19.5 + weight-based charge + 1000 base
  const expenses = Math.round(distance * 19.5 + (weight > 1000 ? 1200 : 600) + 1000);
  const netEarnings = revenue - expenses;

  return {
    revenue,
    expenses,
    netEarnings,
    distance,
    weight
  };
};
