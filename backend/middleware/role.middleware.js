export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const userRole = String(req.user.role || '').toUpperCase();
    const allowedRoles = roles.map((r) => String(r).toUpperCase());

    // Super Admins have access to all routes (including manager routes)
    if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
      return next();
    }

    const hasPermission = allowedRoles.some((allowed) => {
      if (allowed === userRole) return true;
      if (
        (allowed === 'FLEET_MANAGER' || allowed === 'MANAGER') &&
        (userRole === 'FLEET_MANAGER' || userRole === 'MANAGER')
      ) {
        return true;
      }
      if (
        (allowed === 'SUPER_ADMIN' || allowed === 'ADMIN') &&
        (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN')
      ) {
        return true;
      }
      if (allowed === 'DRIVER' && userRole === 'DRIVER') {
        return true;
      }
      return false;
    });

    if (!hasPermission) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    next();
  };
};

