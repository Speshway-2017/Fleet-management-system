/**
 * Determines whether a trip is delayed based on status, flags, or past-due ETA
 */
export const isTripDelayed = (trip) => {
  if (!trip) return false;
  const rawStatus = typeof trip === 'string' ? trip : (trip.status || '');
  const clean = String(rawStatus).trim().toLowerCase();

  // 1. Explicit status string check
  if (
    clean === 'delayed' ||
    clean === 'delay' ||
    clean === 'overdue' ||
    clean === 'late' ||
    clean === 'behind schedule' ||
    clean === 'delayed in transit' ||
    clean === 'delayed delivery'
  ) {
    return true;
  }

  // 2. Explicit boolean flags on the trip object
  if (typeof trip === 'object' && (trip.isDelayed === true || trip.delayed === true || trip.isOverdue === true)) {
    return true;
  }

  // 3. Dynamic overdue calculation based on ETA
  if (typeof trip === 'object' && trip.eta) {
    const isFinished = (
      clean === 'completed' ||
      clean === 'complete' ||
      clean === 'finished' ||
      clean === 'delivered' ||
      clean === 'complete trip' ||
      clean === 'cancelled' ||
      clean === 'canceled' ||
      clean === 'rejected'
    );
    if (!isFinished) {
      try {
        const etaDate = new Date(trip.eta);
        if (!isNaN(etaDate.getTime()) && Date.now() > etaDate.getTime()) {
          return true;
        }
      } catch (_) {}
    }
  }

  return false;
};

/**
 * Normalizes any raw trip status / trip object into a standardized category:
 * 'active' | 'scheduled' | 'completed' | 'delayed' | 'cancelled' | 'other'
 */
export const getNormalizedTripCategory = (rawStatus, trip) => {
  const tripObj = typeof rawStatus === 'object' && rawStatus !== null ? rawStatus : (trip || {});
  const statusStr = typeof rawStatus === 'string' ? rawStatus : (tripObj.status || '');
  const clean = String(statusStr).trim().toLowerCase();

  // Delayed Check
  if (isTripDelayed(tripObj) || isTripDelayed(statusStr)) {
    return 'delayed';
  }

  // Active / In Progress / On Transit
  if (
    clean === 'in progress' ||
    clean === 'in_progress' ||
    clean === 'active' ||
    clean === 'on trip' ||
    clean === 'on_trip' ||
    clean === 'on transit' ||
    clean === 'on_transit' ||
    clean === 'in transit' ||
    clean === 'in_transit' ||
    clean === 'dispatched' ||
    clean === 'en route' ||
    clean === 'started' ||
    clean === 'at loading' ||
    clean === 'loading'
  ) {
    return 'active';
  }

  // Scheduled / Assigned / Pending Driver Acceptance
  if (
    clean === 'scheduled' ||
    clean === 'assigned' ||
    clean === 'pending driver acceptance' ||
    clean === 'pending_driver_acceptance' ||
    clean === 'pending' ||
    clean === 'upcoming' ||
    clean === 'ready to dispatch' ||
    clean === 'accepted' ||
    clean === 'waiting for manager approval'
  ) {
    return 'scheduled';
  }

  // Completed
  if (
    clean === 'completed' ||
    clean === 'complete' ||
    clean === 'finished' ||
    clean === 'delivered' ||
    clean === 'complete trip'
  ) {
    return 'completed';
  }

  // Cancelled / Rejected
  if (
    clean === 'cancelled' ||
    clean === 'canceled' ||
    clean === 'rejected'
  ) {
    return 'cancelled';
  }

  return 'other';
};

/**
 * Computes exact KPI counts from the raw trips array.
 * Ensures totalTrips = active + scheduled + completed + delayed + cancelled + other
 */
export const calculateTripKPIs = (trips = []) => {
  const totalTrips = trips.length;

  let activeCount = 0;
  let scheduledCount = 0;
  let completedCount = 0;
  let delayedCount = 0;
  let cancelledCount = 0;
  let otherCount = 0;

  trips.forEach((t) => {
    const category = getNormalizedTripCategory(t.status, t);
    switch (category) {
      case 'active':
        activeCount++;
        break;
      case 'scheduled':
        scheduledCount++;
        break;
      case 'completed':
        completedCount++;
        break;
      case 'delayed':
        delayedCount++;
        break;
      case 'cancelled':
        cancelledCount++;
        break;
      default:
        otherCount++;
        break;
    }
  });

  return {
    totalTrips,
    activeTripsCount: activeCount,
    scheduledTripsCount: scheduledCount,
    completedTripsCount: completedCount,
    delayedTripsCount: delayedCount,
    cancelledTripsCount: cancelledCount,
    otherTripsCount: otherCount
  };
};
