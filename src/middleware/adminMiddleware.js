import User from '../models/User.js';

export const requireAdmin = async (req, res, next) => {
  try {
        const user = await User.findById(req.user._id || req.user.id);
        if (!user || !user.isAdmin) {
        return res.status(403).json({ succeeded: false, message: 'Access Denied.' });
        }

        req.adminUser = user; 
        next();
    } 
    catch (error) {
    res.status(500).json({ succeeded: false, message: 'Server Error.' });
  }
};

export const requireSuperAdmin = (req, res, next) => {
  if (req.adminUser.adminRole !== 'SuperAdmin') {
    return res.status(403).json({ 
      succeeded: false, 
      message: 'Access Denied. SuperAdmin privileges required.' 
    });
  }
  next();
};