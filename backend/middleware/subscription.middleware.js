export const checkActiveSubscription = (req, res, next) => {
  if (req.user && req.user.role === 'FLEET_MANAGER') {
    if (req.user.subscriptionStatus !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'This feature is available after activating a subscription.'
      });
    }
  }
  next();
};
