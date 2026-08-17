/**
 * Normalizes any raw trip status into a standardized category:
 * 'active' | 'scheduled' | 'completed' | 'delayed' | 'cancelled' | 'other'
 */
export const getNormalizedTripCategory = (rawStatus) => {
  if (!rawStatus) return 'other';
  const clean = String(rawStatus).trim().toLowerCase();

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
    clean === 'dispatched'
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
    clean === 'upcoming'
  ) {
    return 'scheduled';
  }

  // Completed
  if (
    clean === 'completed' ||
    clean === 'complete' ||
    clean === 'finished'
  ) {
    return 'completed';
  }

  // Delayed
  if (
    clean === 'delayed' ||
    clean === 'overdue'
  ) {
    return 'delayed';
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
    const category = getNormalizedTripCategory(t.status);
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
