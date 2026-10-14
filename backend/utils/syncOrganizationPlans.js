import Organization from '../models/Organization.js';
import User from '../models/User.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';

/**
 * Synchronizes and standardizes all organization subscription plans
 * to guarantee dynamic consistency between organizations and their subscribed fleet managers.
 * Normalizes 'Basic' and unassigned plans to 'Standard'.
 */
export const syncOrganizationPlans = async () => {
  try {
    const allOrgs = await Organization.find({});
    let updatedCount = 0;

    for (const org of allOrgs) {
      const managers = await User.find({
        organization: org._id,
        role: { $in: ['FLEET_MANAGER', 'fleet_manager'] }
      }).populate('subscriptionPlan');

      let highestManagerTier = null;
      for (const m of managers) {
        const pName = m.subscriptionPlan?.name ? String(m.subscriptionPlan.name).toLowerCase() : '';
        if (pName) {
          if (pName.includes('enterprise')) {
            highestManagerTier = 'Enterprise';
          } else if (pName.includes('pro') && highestManagerTier !== 'Enterprise') {
            highestManagerTier = 'Professional';
          } else if (!highestManagerTier) {
            highestManagerTier = 'Standard';
          }
        }
      }

      let finalPlan = highestManagerTier;
      if (!finalPlan) {
        const currentPlan = org.plan ? String(org.plan).toLowerCase() : '';
        if (currentPlan.includes('enterprise')) {
          finalPlan = 'Enterprise';
        } else if (currentPlan.includes('pro')) {
          finalPlan = 'Professional';
        } else {
          finalPlan = 'Standard';
        }
      }

      if (org.plan !== finalPlan) {
        await Organization.updateOne({ _id: org._id }, { $set: { plan: finalPlan } });
        updatedCount++;
      }
    }

    console.log(`✅ [SYNC] Organization subscription plans synced. ${updatedCount} updated.`);
  } catch (error) {
    console.error('⚠️ [SYNC] Error syncing organization plans:', error);
  }
};
