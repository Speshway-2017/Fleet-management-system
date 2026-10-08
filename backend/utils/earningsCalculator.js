import { calculateDistance } from './distanceCalculator.js';

/**
 * Shared utility to calculate trip-level financial details (revenue, expenses, and net profit).
 * This serves as the single source of truth for earnings calculations across all modules.
 */
export const calculateTripFinance = (trip) => {
  let distance = Number(trip?.actualDistance) || Number(trip?.estimatedDistance) || 0;
  if (!Number.isFinite(distance) || distance < 0 || distance > 50000) {
    if (trip?.startLocation && trip?.endLocation) {
      try {
        distance = calculateDistance(trip.startLocation, trip.endLocation) || 0;
      } catch {
        distance = 0;
      }
    } else {
      distance = 0;
    }
  }

  let weight = Number(trip?.cargoWeight) || 0;
  if (!Number.isFinite(weight) || weight < 0 || weight > 100000) {
    const wbNet = Number(trip?.weighbridgeSlip?.netWeight || trip?.weighbridgeSlip?.grossWeight);
    if (Number.isFinite(wbNet) && wbNet > 0 && wbNet <= 100000) {
      weight = wbNet;
    } else {
      weight = 0;
    }
  }

  const rawDirectAmount = Number(trip?.revenue || trip?.fare || trip?.totalAmount || trip?.amount || trip?.codAmount || 0);
  const directAmount = (Number.isFinite(rawDirectAmount) && rawDirectAmount > 0 && rawDirectAmount <= 50000000)
    ? Math.round(rawDirectAmount)
    : 0;

  if (distance <= 0 && weight <= 0) {
    return {
      revenue: directAmount,
      expenses: 0,
      netEarnings: directAmount,
      distance: 0,
      weight: 0
    };
  }

  // Revenue = distance * 52 + cargoWeight * 4.5
  const calculatedRevenue = Math.round(distance * 52 + weight * 4.5);
  const revenue = (Number.isFinite(calculatedRevenue) && calculatedRevenue > 0) ? calculatedRevenue : directAmount;
  
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
