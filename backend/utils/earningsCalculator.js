import { calculateDistance } from './distanceCalculator.js';

/**
 * Shared utility to calculate trip-level financial details (revenue, expenses, and net profit).
 * This serves as the single source of truth for earnings calculations across all modules.
 */
export const calculateTripFinance = (trip, invoice = null, fuelRecords = [], tollRecords = []) => {
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

  // 1. Actual recorded operational expenses (Fuel & Tolls)
  let actualFuelAmount = 0;
  if (Array.isArray(fuelRecords) && fuelRecords.length > 0) {
    actualFuelAmount = fuelRecords.reduce((sum, f) => sum + (Number(f?.amount) || 0), 0);
  } else if (Number(invoice?.charges?.fuelCharges) > 0) {
    actualFuelAmount = Number(invoice.charges.fuelCharges);
  } else if (Number(trip?.totalFuelAmount) > 0) {
    actualFuelAmount = Number(trip.totalFuelAmount);
  }

  let actualTollAmount = 0;
  if (Array.isArray(tollRecords) && tollRecords.length > 0) {
    actualTollAmount = tollRecords.reduce((sum, t) => sum + (Number(t?.amountPaid) || 0), 0);
  } else if (Number(invoice?.charges?.tollCharges) > 0) {
    actualTollAmount = Number(invoice.charges.tollCharges);
  } else if (Number(trip?.totalTollsAmount) > 0) {
    actualTollAmount = Number(trip.totalTollsAmount);
  }

  // 2. Single source of truth for direct trip/invoice amount
  const rawDirectAmount = Number(
    invoice?.totalAmount ||
    invoice?.charges?.totalAmount ||
    trip?.totalAmount ||
    trip?.billingAmount ||
    trip?.revenue ||
    trip?.fare ||
    trip?.amount ||
    0
  );
  const directAmount = (Number.isFinite(rawDirectAmount) && rawDirectAmount > 0 && rawDirectAmount <= 50000000)
    ? Math.round(rawDirectAmount)
    : 0;

  // 3. Synchronized dynamic billing calculation matching trip creation & driver invoice
  const serviceFee = (trip?.serviceFee !== undefined && Number(trip.serviceFee) > 0)
    ? Number(trip.serviceFee)
    : (invoice?.charges?.serviceFee !== undefined && Number(invoice.charges.serviceFee) > 0)
      ? Number(invoice.charges.serviceFee)
      : (trip?.serviceType?.includes('Express') ? 1500 : trip?.serviceType?.includes('Same Day') ? 3000 : 500);

  const loadingCharges = trip?.loadingCharges !== undefined
    ? Number(trip.loadingCharges)
    : (invoice?.charges?.loadingCharges !== undefined ? Number(invoice.charges.loadingCharges) : 2500);

  const unloadingCharges = trip?.unloadingCharges !== undefined
    ? Number(trip.unloadingCharges)
    : (invoice?.charges?.unloadingCharges !== undefined ? Number(invoice.charges.unloadingCharges) : 2500);

  const baseFreight = (trip?.freightCharges !== undefined && Number(trip.freightCharges) > 0)
    ? Number(trip.freightCharges)
    : (invoice?.charges?.freightCharges !== undefined && Number(invoice.charges.freightCharges) > 0)
      ? Number(invoice.charges.freightCharges)
      : Math.round(distance * 52 + weight * 4.5);

  const subtotal = (trip?.subtotal !== undefined && Number(trip.subtotal) > 0 && actualFuelAmount === 0 && actualTollAmount === 0)
    ? Number(trip.subtotal)
    : (invoice?.charges?.subtotal !== undefined && Number(invoice.charges.subtotal) > 0 && actualFuelAmount === 0 && actualTollAmount === 0)
      ? Number(invoice.charges.subtotal)
      : (baseFreight + serviceFee + loadingCharges + unloadingCharges + actualFuelAmount + actualTollAmount);

  const gstTax = (trip?.gstTax !== undefined && Number(trip.gstTax) > 0 && actualFuelAmount === 0 && actualTollAmount === 0)
    ? Number(trip.gstTax)
    : (invoice?.charges?.gstTax !== undefined && Number(invoice.charges.gstTax) > 0 && actualFuelAmount === 0 && actualTollAmount === 0)
      ? Number(invoice.charges.gstTax)
      : (invoice?.taxAmount !== undefined && Number(invoice.taxAmount) > 0 && actualFuelAmount === 0 && actualTollAmount === 0)
        ? Number(invoice.taxAmount)
        : Math.round(subtotal * 0.18);

  const calculatedTotal = subtotal + gstTax;
  const revenue = directAmount > 0 ? directAmount : calculatedTotal;

  // 4. Actual recorded operational costs (expenses) calculation
  const operationalAllowance = Math.round(distance * 5.3);
  const expenses = loadingCharges + unloadingCharges + actualFuelAmount + actualTollAmount + operationalAllowance;

  const netEarnings = revenue - expenses;
  const marginPercent = revenue > 0 ? Math.round((netEarnings / revenue) * 100) : 0;

  return {
    revenue,
    expenses,
    netEarnings,
    marginPercent,
    distance,
    weight,
    serviceFee,
    loadingCharges,
    unloadingCharges,
    baseFreight,
    subtotal,
    gstTax,
    totalAmount: revenue,
    actualFuelAmount,
    actualTollAmount
  };
};

/**
 * Single source of truth to aggregate fleet-level and manager-level earnings,
 * expenses, net profits, and monthly breakdown.
 */
export const calculateFleetEarnings = (trips = [], invoices = [], fuels = [], tolls = []) => {
  const invoiceByTripId = new Map();
  if (Array.isArray(invoices)) {
    invoices.forEach(inv => {
      if (inv.trip) invoiceByTripId.set(inv.trip.toString(), inv);
      if (inv.invoiceNumber) invoiceByTripId.set(inv.invoiceNumber, inv);
    });
  }

  const fuelsByTripId = new Map();
  if (Array.isArray(fuels)) {
    fuels.forEach(f => {
      const key = f.tripId?.toString().replace('#', '');
      if (key) {
        if (!fuelsByTripId.has(key)) fuelsByTripId.set(key, []);
        fuelsByTripId.get(key).push(f);
      }
    });
  }

  const tollsByTripId = new Map();
  if (Array.isArray(tolls)) {
    tolls.forEach(t => {
      if (t.trip) {
        const key = t.trip.toString();
        if (!tollsByTripId.has(key)) tollsByTripId.set(key, []);
        tollsByTripId.get(key).push(t);
      }
    });
  }

  let totalRevenue = 0;
  let totalExpenses = 0;
  let totalNetEarnings = 0;

  const tripEarnings = trips.map(trip => {
    const tripIdStr = (trip._id || trip.id)?.toString();
    const inv = (tripIdStr && invoiceByTripId.get(tripIdStr)) || (trip.tripInvoice?.invoiceNumber ? invoiceByTripId.get(trip.tripInvoice.invoiceNumber) : null);
    const cleanNum = trip.tripNumber?.replace('#', '');
    const tripFuels = (tripIdStr && fuelsByTripId.get(tripIdStr)) || (cleanNum && fuelsByTripId.get(cleanNum)) || [];
    const tripTolls = (tripIdStr && tollsByTripId.get(tripIdStr)) || [];

    const fin = calculateTripFinance(trip, inv, tripFuels, tripTolls);

    totalRevenue += fin.revenue;
    totalExpenses += fin.expenses;
    totalNetEarnings += fin.netEarnings;

    return {
      tripId: trip._id,
      tripNumber: trip.tripNumber,
      vehicleName: trip.vehicleName || (trip.vehicle ? trip.vehicle.vehicleName : 'N/A'),
      vehiclePlate: trip.vehiclePlate || (trip.vehicle ? trip.vehicle.vehicleNumber : 'N/A'),
      driverName: trip.driverName || (trip.driver ? trip.driver.fullName : 'Unassigned'),
      startLocation: trip.startLocation,
      endLocation: trip.endLocation,
      status: trip.status,
      date: trip.createdAt,
      distance: fin.distance,
      cargoWeight: fin.weight,
      revenue: fin.revenue,
      expenses: fin.expenses,
      netEarnings: fin.netEarnings,
      marginPercent: fin.marginPercent,
      finance: fin
    };
  });

  // Group earnings by month for chart data
  const monthlyStats = {};
  tripEarnings.forEach(te => {
    const date = new Date(te.date);
    const monthYear = date.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
    if (!monthlyStats[monthYear]) {
      monthlyStats[monthYear] = { month: monthYear, revenue: 0, expenses: 0, netEarnings: 0 };
    }
    monthlyStats[monthYear].revenue += te.revenue;
    monthlyStats[monthYear].expenses += te.expenses;
    monthlyStats[monthYear].netEarnings += te.netEarnings;
  });

  const chartData = Object.values(monthlyStats).reverse();

  let formattedRevenue = "";
  if (totalRevenue >= 10000000) {
    formattedRevenue = `₹${(totalRevenue / 10000000).toFixed(1)} Cr`;
  } else if (totalRevenue >= 100000) {
    formattedRevenue = `₹${(totalRevenue / 100000).toFixed(1)} L`;
  } else {
    formattedRevenue = `₹${totalRevenue.toLocaleString('en-IN')}`;
  }

  return {
    stats: {
      totalRevenue,
      totalExpenses,
      totalNetEarnings,
      tripCount: trips.length,
      formattedRevenue
    },
    totalRevenue,
    totalExpenses,
    totalNetEarnings,
    formattedRevenue,
    chartData,
    tripEarnings,
    invoiceByTripId,
    fuelsByTripId,
    tollsByTripId
  };
};

