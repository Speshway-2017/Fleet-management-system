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
  const suspendedOrgs = await Organization.find({ status: 'Suspended' }).select('_id');
  const suspendedOrgIds = suspendedOrgs.map(o => o._id);

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
    getUsersCount({ role: { $in: ['FLEET_MANAGER', 'fleet_manager'] } }), // total fleet managers
    getUsersCount({
      role: { $in: ['FLEET_MANAGER', 'fleet_manager'] },
      isActive: { $ne: false },
      status: { $nin: ['Inactive', 'Suspended'] },
      organization: { $nin: suspendedOrgIds }
    }), // active fleet managers (excluding managers of suspended orgs)
    getVehiclesCount({ status: { $nin: ['Inactive', 'Retired', 'Out of Service'] } }), // active vehicles count
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
  const chartData = (chartDataAgg || []).map(item => ({
    name: monthNames[item._id - 1] || `Month ${item._id}`,
    revenue: Number(item.total) || 0
  }));

  // Ensure 12 months are present, even if 0 revenue (optional but good for frontend)
  const formattedChartData = monthNames.map((month) => {
    const existing = chartData.find(d => d.name === month);
    return existing ? existing : { name: month, revenue: 0 };
  });

  return {
    statistics: {
      totalOrganizations: Number(totalOrganizations) || 0,
      activeOrganizations: Number(activeOrganizations) || 0,
      fleetManagers: Number(fleetManagers) || 0,
      activeFleetManagers: Number(activeFleetManagers) || 0,
      activeVehicles: Number(activeVehicles) || 0,
      revenue: Number(revenue) || 0,
      todayRevenue: Number(todayRevenue) || 0,
      pendingRequests: Number(pendingRequests) || 0
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
  let managerCumulative = await User.countDocuments({ role: { $in: ['FLEET_MANAGER', 'fleet_manager'] }, createdAt: { $lt: firstMonthStart } });

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
    { $match: { role: { $in: ['FLEET_MANAGER', 'fleet_manager'] }, createdAt: { $gte: firstMonthStart } } },
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
