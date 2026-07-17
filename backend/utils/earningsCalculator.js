/**
 * Shared utility to calculate trip-level financial details (revenue, expenses, and net profit).
 * This serves as the single source of truth for earnings calculations across all modules.
 */
export const calculateTripFinance = (trip) => {
  const distance = trip.actualDistance || trip.estimatedDistance || 250;
  const weight = trip.cargoWeight || 800;

  // Revenue = distance * 52 + cargoWeight * 4.5
  const revenue = Math.round(distance * 52 + weight * 4.5);
  
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
