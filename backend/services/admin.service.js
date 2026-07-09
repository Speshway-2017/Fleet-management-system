import {
  getDistinctOrganizations,
  getUsersCount,
  getVehiclesCount,
  getRevenueAggregate,
  getRecentTrips,
  getRecentNotifications,
  getAnalyticsSummary,
  getRevenueChartData
} from '../repositories/admin.repository.js';

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
    getRecentTrips(5), // recent activities (trips)
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
