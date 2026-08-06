import {
  getDistinctOrganizations,
  getUsersCount,
  getVehiclesCount,
  getRevenueAggregate,
  getRecentTrips,
  getRecentNotifications,
  getAnalyticsSummary,
  getRevenueChartData,
  getTodayRevenueAggregate,
  getPendingRequestsCount
} from '../repositories/admin.repository.js';
import Organization from '../models/Organization.js';
import User from '../models/User.js';

export const getAdminDashboardData = async () => {
  const [
    totalOrganizations,
    activeOrganizations,
    fleetManagers,
    activeFleetManagers,
    activeVehicles,
    revenue,
    todayRevenue,
    pendingRequests,
    recentActivities,
    recentNotifications,
    analyticsSummaryAgg,
    chartDataAgg
  ] = await Promise.all([
    getDistinctOrganizations(), // total organizations
    getDistinctOrganizations({ isActive: true }), // active organizations
    getUsersCount({ role: 'FLEET_MANAGER' }), // total fleet managers
    getUsersCount({ role: 'FLEET_MANAGER', isActive: { $ne: false } }), // active fleet managers
    getVehiclesCount({ status: 'Active' }), // active vehicles count
    getRevenueAggregate(), // total revenue
    getTodayRevenueAggregate(), // today revenue
    getPendingRequestsCount(), // pending requests count
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
      activeFleetManagers,
      activeVehicles,
      revenue,
      todayRevenue,
      pendingRequests
    },
    recentActivities,
    recentNotifications,
    analyticsSummary,
    chartData: formattedChartData
  };
};

export const getMonthlyGrowthStats = async () => {
  const months = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      name: monthNames[d.getMonth()]
    });
  }

  // Get cumulative start counts
  const firstMonthStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  let orgCumulative = await Organization.countDocuments({ createdAt: { $lt: firstMonthStart } });
  let managerCumulative = await User.countDocuments({ role: 'FLEET_MANAGER', createdAt: { $lt: firstMonthStart } });

  // Grouped counts per month
  const orgGrowthAgg = await Organization.aggregate([
    { $match: { createdAt: { $gte: firstMonthStart } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    }
  ]);

  const managerGrowthAgg = await User.aggregate([
    { $match: { role: 'FLEET_MANAGER', createdAt: { $gte: firstMonthStart } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    }
  ]);

  const orgGrowthData = months.map(m => {
    const match = orgGrowthAgg.find(item => item._id === m.key);
    orgCumulative += match ? match.count : 0;
    return { name: m.name, value: orgCumulative };
  });

  const managerGrowthData = months.map(m => {
    const match = managerGrowthAgg.find(item => item._id === m.key);
    managerCumulative += match ? match.count : 0;
    return { name: m.name, value: managerCumulative };
  });

  return { orgGrowthData, managerGrowthData };
};
