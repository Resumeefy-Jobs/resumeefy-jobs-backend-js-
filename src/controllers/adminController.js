import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js'

export const getSystemStats = async (req, res) => {
    try{
        const[ totalUsers, totalJobs, totalApplications, usersByRole ] = await Promise.all([
          User.countDocuments({}),
          Job.countDocuments({}),
          Application.countDocuments({}),
          User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } } 
            ])
        ]);

        const userBreakdown = usersByRole.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        res.status(200).json({
            succeeded: true,
            data: {
                totalUsers, 
                totalJobs, 
                totalApplications, 
                breakdown: {
                    users: userBreakdown
                }
            }
        })
    }catch(error){
        res.status(500).json({
            succeeded: false,
            error: error.message
        });
    }
};

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const users = await User.find()
      .select('-passwordHash') 
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments();

    res.status(200).json({
      succeeded: true,
      data: users,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ succeeded: false, message: error.message });
  }
};

export const toggleUserBan = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ succeeded: false, message: "You cannot ban yourself." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ succeeded: false, message: "User not found." });

    user.isBanned = !user.isBanned;
    await user.save();

    const status = user.isBanned ? "Banned" : "Active";
    res.status(200).json({ succeeded: true, message: `User marked as ${status}.` });

  } catch (error) {
    res.status(500).json({ succeeded: false, message: error.message });
  }
};