/**
 * Safely parse date strings into Date objects supporting ISO, IST offsets, and space-separated formats
 */
export const parseDateTimeSafe = (dateVal) => {
  if (!dateVal) return null;
  if (dateVal instanceof Date) return isNaN(dateVal.getTime()) ? null : dateVal;

  let str = String(dateVal).trim();
  if (!str) return null;

  // 1. Direct standard constructor
  let d = new Date(str);
  if (!isNaN(d.getTime())) return d;

  // 2. Space separated date/time e.g., "2026-10-07 15:30" -> "2026-10-07T15:30"
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(str)) {
    d = new Date(str.replace(/\s+/, 'T'));
    if (!isNaN(d.getTime())) return d;
  }

  // 3. Offset fallback with IST (+05:30) if timezone is absent
  const hasTimezone = /(?:Z|[-+]\d{2}(?::?\d{2})?)$/i.test(str) || str.includes('GMT') || str.includes('UTC');
  if (!hasTimezone) {
    const withT = str.includes('T') ? str : str.replace(/\s+/, 'T');
    d = new Date(withT + '+05:30');
    if (!isNaN(d.getTime())) return d;
  }

  return null;
};

/**
 * Determines whether a trip is delayed based on status, flags, delay reasons, or past-due ETA
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

  // 2. Explicit boolean flags or delay reasons on the trip object
  if (typeof trip === 'object' && trip !== null) {
    if (
      trip.isDelayed === true ||
      trip.delayed === true ||
      trip.isOverdue === true ||
      (trip.delayReason && String(trip.delayReason).trim().length > 0) ||
      (trip.categoryData?.delayReason && String(trip.categoryData.delayReason).trim().length > 0)
    ) {
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
      if (!isFinished) return true;
    }
  }

  // 3. Dynamic overdue calculation based on Start Time (Departure) or Arrival Time (ETA)
  if (typeof trip === 'object' && trip !== null) {
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
      // Arrival Time (ETA) is late
      if (trip.eta) {
        const etaDate = parseDateTimeSafe(trip.eta);
        if (etaDate && Date.now() > etaDate.getTime()) {
          return true;
        }
      }

      // Start Time (Departure Time) is late without starting
      if (trip.departureTime) {
        const isNotStarted = (
          clean === 'scheduled' ||
          clean === 'assigned' ||
          clean === 'pending driver acceptance' ||
          clean === 'pending_driver_acceptance' ||
          clean === 'pending' ||
          clean === 'upcoming' ||
          clean === 'ready to dispatch' ||
          clean === 'accepted' ||
          clean === 'waiting for manager approval' ||
          clean === 'draft' ||
          !clean
        );
        if (isNotStarted) {
          const depDate = parseDateTimeSafe(trip.departureTime);
          if (depDate && Date.now() > depDate.getTime()) {
            return true;
          }
        }
      }
    }
  }

  return false;
};

/**
 * Returns human-readable delay reason for a trip
 */
export const getTripDelayReason = (trip) => {
  if (!trip) return '';
  if (typeof trip === 'string') return isTripDelayed(trip) ? 'Trip is marked as delayed' : '';
  
  if (trip.delayReason && String(trip.delayReason).trim().length > 0) {
    return String(trip.delayReason).trim();
  }
  if (trip.categoryData?.delayReason && String(trip.categoryData.delayReason).trim().length > 0) {
    return String(trip.categoryData.delayReason).trim();
  }

  const rawStatus = trip.status || '';
  const clean = String(rawStatus).trim().toLowerCase();
  const isFinished = ['completed', 'complete', 'finished', 'delivered', 'complete trip', 'cancelled', 'canceled', 'rejected'].includes(clean);
  if (isFinished) return '';

  if (trip.eta) {
    const etaDate = parseDateTimeSafe(trip.eta);
    if (etaDate && Date.now() > etaDate.getTime()) {
      return 'Arrival Overdue: Scheduled ETA has elapsed';
    }
  }

  if (trip.departureTime) {
    const isNotStarted = ['scheduled', 'assigned', 'pending driver acceptance', 'pending', 'upcoming', 'ready to dispatch', 'accepted', 'draft', ''].includes(clean);
    if (isNotStarted) {
      const depDate = parseDateTimeSafe(trip.departureTime);
      if (depDate && Date.now() > depDate.getTime()) {
        return 'Late Start: Scheduled departure time has passed';
      }
    }
  }

  return isTripDelayed(trip) ? 'Trip delayed' : '';
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
