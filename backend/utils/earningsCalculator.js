import { calculateDistance } from './distanceCalculator.js';

/**
 * Shared utility to calculate trip-level financial details (revenue, expenses, and net profit).
 * This serves as the single source of truth for earnings calculations across all modules.
 *
 * Operational Costs (expenses) are strictly calculated by summing actual Fuel, Toll, and
 * Driver Allowance expenses. Excludes GST/taxes, base freight, service fees, and loading/unloading charges.
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

  // 1. Actual recorded operational expenses: Fuel (Single Source of Truth, prevent duplicates)
  let actualFuelAmount = 0;
  if (Array.isArray(fuelRecords) && fuelRecords.length > 0) {
    const seenFuelIds = new Set();
    actualFuelAmount = fuelRecords.reduce((sum, f) => {
      const fId = (f?._id || f?.id)?.toString();
      if (fId && seenFuelIds.has(fId)) return sum;
      if (fId) seenFuelIds.add(fId);
      const amt = Number(f?.amount || f?.totalAmount) || 0;
      return sum + (amt > 0 ? amt : 0);
    }, 0);
  } else if (Number(invoice?.charges?.fuelCharges) > 0) {
    actualFuelAmount = Number(invoice.charges.fuelCharges);
  } else if (Number(trip?.totalFuelAmount) > 0) {
    actualFuelAmount = Number(trip.totalFuelAmount);
  }

  // 2. Actual recorded operational expenses: Tolls (Single Source of Truth, prevent duplicates)
  let actualTollAmount = 0;
  if (Array.isArray(tollRecords) && tollRecords.length > 0) {
    const seenTollIds = new Set();
    actualTollAmount = tollRecords.reduce((sum, t) => {
      const tId = (t?._id || t?.id)?.toString();
      if (tId && seenTollIds.has(tId)) return sum;
      if (tId) seenTollIds.add(tId);
      const amt = Number(t?.amountPaid || t?.amount) || 0;
      return sum + (amt > 0 ? amt : 0);
    }, 0);
  } else if (Number(invoice?.charges?.tollCharges) > 0) {
    actualTollAmount = Number(invoice.charges.tollCharges);
  } else if (Number(trip?.totalTollsAmount) > 0) {
    actualTollAmount = Number(trip.totalTollsAmount);
  }

  // 3. Actual recorded / calculated Driver Allowance (Single Source of Truth, count missing as ₹0)
  let driverAllowance = 0;
  if (trip?.driverAllowance !== undefined && Number(trip.driverAllowance) >= 0) {
    driverAllowance = Number(trip.driverAllowance);
  } else if (trip?.allowance !== undefined && Number(trip.allowance) >= 0) {
    driverAllowance = Number(trip.allowance);
  } else if (trip?.operationalAllowance !== undefined && Number(trip.operationalAllowance) >= 0) {
    driverAllowance = Number(trip.operationalAllowance);
  } else if (invoice?.charges?.driverAllowance !== undefined && Number(invoice.charges.driverAllowance) >= 0) {
    driverAllowance = Number(invoice.charges.driverAllowance);
  } else if (distance > 0) {
    driverAllowance = Math.round(distance * 5.3);
  } else {
    driverAllowance = 0;
  }
  if (!Number.isFinite(driverAllowance) || driverAllowance < 0) {
    driverAllowance = 0;
  }

  // 4. Single source of truth for direct trip/invoice amount
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

  // 5. Dynamic billing calculation matching trip creation & driver invoice
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

  // 6. Actual recorded operational costs (expenses) calculation
  // Total Operational Costs = Fuel + Toll + Driver Allowance expenses.
  // Excludes GST/taxes, base freight, service fees, and loading/unloading charges.
  const expenses = actualFuelAmount + actualTollAmount + driverAllowance;

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
    actualTollAmount,
    driverAllowance
  };
};

/**
 * Formats a numeric value into the standard Indian numbering system currency string (e.g., ₹8,36,218).
 */
export const formatIndianCurrency = (val) => {
  const num = Number(val) || 0;
  if (num === 0) return '₹0';
  const prefix = num < 0 ? '-₹' : '₹';
  const absNum = Math.round(Math.abs(num));
  return `${prefix}${absNum.toLocaleString('en-IN')}`;
};

/**
 * Single source of truth to aggregate fleet-level and manager-level earnings,
 * operational costs (expenses), net profits, and monthly breakdown.
 * Calculates total Operational Costs from completed trips only.
 */
export const calculateFleetEarnings = (trips = [], invoices = [], fuels = [], tolls = []) => {
  const invoiceByTripId = new Map();
  if (Array.isArray(invoices)) {
    invoices.forEach(inv => {
      if (inv.trip) invoiceByTripId.set(inv.trip.toString(), inv);
      if (inv.invoiceNumber) invoiceByTripId.set(inv.invoiceNumber, inv);
    });
  }

  // Deduplicate and group fuel records by trip key to prevent double counting
  const fuelsByTripId = new Map();
  const seenFuelRecordIds = new Set();
  if (Array.isArray(fuels)) {
    fuels.forEach(f => {
      const fId = (f?._id || f?.id)?.toString();
      if (fId && seenFuelRecordIds.has(fId)) return;
      if (fId) seenFuelRecordIds.add(fId);

      const key = f.tripId?.toString().replace('#', '');
      if (key) {
        if (!fuelsByTripId.has(key)) fuelsByTripId.set(key, []);
        fuelsByTripId.get(key).push(f);
      }
    });
  }

  // Deduplicate and group toll records by trip key to prevent double counting
  const tollsByTripId = new Map();
  const seenTollRecordIds = new Set();
  if (Array.isArray(tolls)) {
    tolls.forEach(t => {
      const tId = (t?._id || t?.id)?.toString();
      if (tId && seenTollRecordIds.has(tId)) return;
      if (tId) seenTollRecordIds.add(tId);

      if (t.trip) {
        const key = t.trip.toString();
        if (!tollsByTripId.has(key)) tollsByTripId.set(key, []);
        tollsByTripId.get(key).push(t);
      }
    });
  }

  let totalRevenue = 0;
  let totalExpenses = 0; // Total Operational Costs from completed trips
  let totalNetEarnings = 0;
  let totalFuelExpenses = 0;
  let totalTollExpenses = 0;
  let totalDriverAllowance = 0;

  const isCompletedStatus = (status) => {
    const s = String(status || '').trim().toLowerCase();
    return s === 'completed' || s === 'complete trip' || s === 'delivered';
  };

  const tripEarnings = trips.map(trip => {
    const tripIdStr = (trip._id || trip.id)?.toString();
    const inv = (tripIdStr && invoiceByTripId.get(tripIdStr)) || (trip.tripInvoice?.invoiceNumber ? invoiceByTripId.get(trip.tripInvoice.invoiceNumber) : null);
    const cleanNum = trip.tripNumber?.replace('#', '');
    const tripFuels = (tripIdStr && fuelsByTripId.get(tripIdStr)) || (cleanNum && fuelsByTripId.get(cleanNum)) || [];
    const tripTolls = (tripIdStr && tollsByTripId.get(tripIdStr)) || [];

    const fin = calculateTripFinance(trip, inv, tripFuels, tripTolls);

    const isCompleted = isCompletedStatus(trip.status);

    if (isCompleted) {
      totalRevenue += fin.revenue;
      totalExpenses += fin.expenses;
      totalFuelExpenses += fin.actualFuelAmount;
      totalTollExpenses += fin.actualTollAmount;
      totalDriverAllowance += fin.driverAllowance;
      totalNetEarnings += fin.netEarnings;
    }

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
      fuelExpense: fin.actualFuelAmount,
      tollExpense: fin.actualTollAmount,
      driverAllowance: fin.driverAllowance,
      netEarnings: fin.netEarnings,
      marginPercent: fin.marginPercent,
      isCompleted,
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
    if (te.isCompleted) {
      monthlyStats[monthYear].revenue += te.revenue;
      monthlyStats[monthYear].expenses += te.expenses;
      monthlyStats[monthYear].netEarnings += te.netEarnings;
    }
  });

  const chartData = Object.values(monthlyStats).reverse();

  const formattedRevenue = formatIndianCurrency(totalRevenue);
  const formattedExpenses = formatIndianCurrency(totalExpenses); // e.g. ₹8,36,218
  const formattedNetEarnings = formatIndianCurrency(totalNetEarnings);
  const marginPercent = totalRevenue > 0 ? Math.round((totalNetEarnings / totalRevenue) * 100) : 0;

  return {
    stats: {
      totalRevenue,
      totalExpenses,
      totalNetEarnings,
      marginPercent,
      tripCount: trips.length,
      completedTripCount: trips.filter(t => isCompletedStatus(t.status)).length,
      formattedRevenue,
      formattedExpenses,
      formattedTotalExpenses: formattedExpenses,
      formattedNetEarnings,
      operationalCosts: formattedExpenses,
      totalFuelExpenses,
      totalTollExpenses,
      totalDriverAllowance
    },
    totalRevenue,
    totalExpenses,
    totalNetEarnings,
    formattedRevenue,
    formattedExpenses,
    formattedTotalExpenses: formattedExpenses,
    operationalCosts: formattedExpenses,
    chartData,
    tripEarnings,
    invoiceByTripId,
    fuelsByTripId,
    tollsByTripId
  };
};

