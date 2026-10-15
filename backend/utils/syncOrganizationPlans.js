import Organization from '../models/Organization.js';
import User from '../models/User.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import SubscriptionRequest from '../models/SubscriptionRequest.js';

/**
 * Synchronizes and standardizes all organization subscription plans
 * to guarantee dynamic consistency between organizations and their subscribed fleet managers.
 * Normalizes 'Standard' and unassigned plans to 'Basic'.
 * Automatically heals any orphaned subscription requests or manager plan references.
 */
export const syncOrganizationPlans = async () => {
  try {
    // 1. Ensure all subscription requests and users reference valid, existing plans
    const allActivePlans = await SubscriptionPlan.find({}).lean();
    if (allActivePlans && allActivePlans.length > 0) {
      const validPlanIds = allActivePlans.map(p => p._id.toString());
      const basicPlan = allActivePlans.find(p => p.name?.toLowerCase().includes('basic')) || allActivePlans[0];

      if (basicPlan) {
        // Heal orphaned subscription requests
        const orphanedRequests = await SubscriptionRequest.find({
          $or: [
            { plan: null },
            { plan: { $nin: validPlanIds } }
          ]
        });
        if (orphanedRequests.length > 0) {
          for (const req of orphanedRequests) {
            req.plan = basicPlan._id;
            await req.save();
          }
          console.log(`✅ [SYNC] Healed ${orphanedRequests.length} orphaned subscription requests to "${basicPlan.name}".`);
        }

        // Heal orphaned user subscription plans
        const orphanedUsers = await User.find({
          subscriptionPlan: { $nin: [...validPlanIds, null] }
        });
        if (orphanedUsers.length > 0) {
          for (const u of orphanedUsers) {
            u.subscriptionPlan = basicPlan._id;
            await u.save();
          }
          console.log(`✅ [SYNC] Healed ${orphanedUsers.length} orphaned manager subscription plans to "${basicPlan.name}".`);
        }
      }
    }

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
            highestManagerTier = 'Basic';
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
          finalPlan = 'Basic';
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
