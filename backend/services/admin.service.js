import {
  getDistinctOrganizations,
  getUsersCount,
  getVehiclesCount,
  getRevenueAggregate,
  getRealRecentActivities,
  getRecentNotifications,
  getRevenueChartData,
  getFilteredCount,
  getFuelUsageAggregate,
  getOrgGrowthData,
  getManagerGrowthData,
  getSubscriptionDistribution,
  getLoginActivityData,
  getAnalyticsSummary
} from '../repositories/admin.repository.js';

// Helper to convert filter string to date filter
const getDateFilter = (filterStr) => {
  const now = new Date();
  const filter = {};
  
  if (filterStr === 'today') {
    const start = new Date(now.setHours(0,0,0,0));
    filter.createdAt = { $gte: start };
  } else if (filterStr === 'week') {
    const start = new Date(now.setDate(now.getDate() - now.getDay()));
    start.setHours(0,0,0,0);
    filter.createdAt = { $gte: start };
  } else if (filterStr === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    filter.createdAt = { $gte: start };
  } else if (filterStr === 'year') {
    const start = new Date(now.getFullYear(), 0, 1);
    filter.createdAt = { $gte: start };
  }
  
  return filter;
};

export const getAdminDashboardData = async () => {
  const [
    totalOrganizations,
    activeOrganizations,
    fleetManagers,
    activeVehicles,
    revenue,
    pendingRequests,
    recentActivities,
    recentNotifications,
    analyticsSummaryAgg,
    chartDataAgg
  ] = await Promise.all([
    getDistinctOrganizations(), // total organizations
    getDistinctOrganizations({ isActive: true }), // active organizations
    getUsersCount({ role: 'FLEET_MANAGER' }), // fleet managers count
    getVehiclesCount({ status: 'ACTIVE' }), // active vehicles count
    getRevenueAggregate(), // total revenue
    getUsersCount({ isActive: false }), // pending requests count
    getRealRecentActivities(5), // real recent activities
    getRecentNotifications(5), // recent notifications
    getAnalyticsSummary(), // analytics summary
    getRevenueChartData() // chart data
  ]);

  // Format analytics summary to object
  const analyticsSummary = {};
  analyticsSummaryAgg.forEach(item => {
    analyticsSummary[item._id] = item.total;
  });

  // Format chart data (mocking month names for simplicity, assuming 1=Jan, 12=Dec)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = chartDataAgg.map(item => ({
    name: monthNames[item._id - 1] || `Month ${item._id}`,
    revenue: item.total
  }));

  // Ensure 12 months are present, even if 0 revenue (optional but good for frontend)
  const formattedChartData = monthNames.map((month, index) => {
    const existing = chartData.find(d => d.name === month);
    return existing ? existing : { name: month, revenue: 0 };
  });

  return {
    statistics: {
      totalOrganizations,
      activeOrganizations,
      fleetManagers,
      activeVehicles,
      revenue,
      pendingRequests
    },
    recentActivities,
    recentNotifications,
    analyticsSummary,
    chartData: formattedChartData
  };
};

export const getAdminAnalyticsData = async (filterStr) => {
  const dateFilter = getDateFilter(filterStr);

  const [
    totalOrganizations,
    fleetManagers,
    vehicles,
    drivers,
    activeTrips,
    completedTrips,
    maintenanceCount,
    fuelUsage,
    orgGrowthData,
    managerGrowthData,
    subscriptionData,
    loginActivityData
  ] = await Promise.all([
    getFilteredCount('Organization', dateFilter),
    getFilteredCount('User', { role: 'FLEET_MANAGER', ...dateFilter }),
    getFilteredCount('Vehicle', dateFilter),
    getFilteredCount('Driver', dateFilter),
    getFilteredCount('Trip', { status: 'IN_PROGRESS', ...dateFilter }), // assuming active trip is IN_PROGRESS
    getFilteredCount('Trip', { status: 'COMPLETED', ...dateFilter }),
    getFilteredCount('Maintenance', dateFilter),
    getFuelUsageAggregate(dateFilter),
    getOrgGrowthData(dateFilter),
    getManagerGrowthData(dateFilter),
    getSubscriptionDistribution(),
    getLoginActivityData(dateFilter)
  ]);

  // Format subscription data color
  const colors = { 'Enterprise': '#0f172a', 'Professional': '#b45309', 'Standard': '#cbd5e1' };
  const formattedSubscriptionData = subscriptionData.map(item => ({
    name: item.name,
    value: item.value,
    color: colors[item.name] || '#cbd5e1'
  }));

  return {
    kpis: {
      totalOrganizations,
      fleetManagers,
      vehicles,
      drivers,
      activeTrips,
      completedTrips,
      maintenanceCount,
      fuelUsage
    },
    charts: {
      orgGrowthData: orgGrowthData.length ? orgGrowthData : [{ name: 'N/A', value: 0 }],
      managerGrowthData: managerGrowthData.length ? managerGrowthData : [{ name: 'N/A', value: 0 }],
      subscriptionData: formattedSubscriptionData.length ? formattedSubscriptionData : [{ name: 'Standard', value: 0, color: '#cbd5e1' }],
      loginActivityData
    }
  };
};
