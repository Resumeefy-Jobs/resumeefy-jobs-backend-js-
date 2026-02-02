import User from '../models/User.js';
import Job from '../models/Job.js';
import crypto from 'crypto';
import Application from '../models/Application.js'
import {sendModeratorWelcomeEmail} from '../utils/EmailService.js';
import AuditLog from '../models/AuditLog.js'

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
    
    if (!req.user) {
      return res.status(401).json({ succeeded: false, message: "User not authenticated." });
    }

    const adminId = req.user._id || req.user.id;
    if (userId === adminId.toString()) {
      return res.status(400).json({ succeeded: false, message: "You cannot ban yourself." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ succeeded: false, message: "User not found." });

    user.isBanned = !user.isBanned;
    await user.save();

    await AuditLog.create({
        admin: req.user._id,
        action: user.isBanned ? 'BAN_USER' : 'UNBAN_USER',
        targetId: user._id, 
        targetModel: 'User', 
        details: user.isBanned ? 'User Banned by Admin' : 'User unbanned'
    })

    const status = user.isBanned ? "Banned" : "Active";
    res.status(200).json({ succeeded: true, message: `User marked as ${status}.` });

  } catch (error) {
    res.status(500).json({ succeeded: false, message: error.message });
  }
};

export const getJobsForModeration = async (req, res) => {
    try{
        const {status , page = 1, limit= 10} = req.query;

        const query = status ? { moderationStatus: status } : {};

        const jobs = await Job.find(query)
        .populate('employer', 'firstName lastName email companyName') // See who posted it
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)); 

        const total = await Job.countDocuments(query);
        res.status(200).json({
            succeeded: true,
            data: jobs, 
            pagination: {
               pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
            }
        });
    }
    catch(error){
        res.status(500).json({
            succeeded: false,
            message : error.message
        })
    }
};

export const moderateJob = async (req, res) => {
    try{
        const {jobId} = req.params;
        const {action} = req.body;

        if (!['Approve', 'Reject']. includes(action)){
            return res.status(400).json({
                succeeded: false,
                message: 'Invalid action.'
            })
        }

        const job = await Job.findById(jobId);
        if(!job){
            return res.status(404).json({
                succeeded: false,
                message: 'Job Not Found.'
            });
        }

        job.moderationStatus = action === "Approve" ? "Approved" : "Rejected";

        if(action === 'Rejected'){
            job.isActive = false;
        }

        await job.save();

        await AuditLog.create({
            admin: req.user._id,
            action: action === 'Approve' ? 'APPROVE_JOB' : 'REJECT_JOB',
            targetId: job._id, 
            targetModel: 'Job',
            details: `Job ${action}d`
        });
        res.status(200).json({
            succeeded: true,
            message: `Job ${job.moderationStatus} Successfully.`
        });
    }catch(error){
        res.status(500).json({
            succeeded: false,
            message: error.message
        });
    }
};

const generatePassword = () =>{
    return crypto.randomBytes(4).toString('hex');
};

export const createModerator = async (req, res) =>{
    try{
        const {firstName, lastName, email} =  req.body;

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                succeeded: false,
                message: "User with email already exists"
            });
        }

        const tempPassword = generatePassword();

        const newModerator = await User.create({
            firstName, 
            lastName,
            email, 
            passwordHash: tempPassword,
            role: 'Admin',
            isAdmin: true,
            isEmailVerified: true,
            adminRole: 'Moderator'
        });

        await sendModeratorWelcomeEmail(email, firstName, tempPassword);

        await AuditLog.create({
            admin: req.user._id || req.user.id,
            action: 'CREATE_MODERATOR',
            targetId: newModerator._id,
            targetModel: 'User',
            details: `Created Moderator ${email}`
        });

        res.status(201).json({
            succeeded: true,
            message: `Moderator ${firstName} created. Credentials sent to email.`
        })
    }
    catch(error){
        res.status(500).json({
            succeeded: false,
            message: error.message
        });
    }
};

export const getAuditLogs = async (req, res) => {
    try{
        const logs= await AuditLog.find()
        .populate('admin', 'firstName lastName, email')
        .sort({createdAt: -1})
        .limit(50)

        res.status(200).json({
            succeeded: true,
            data: logs
        });
    }catch(error){
        res.status(500).json({
            succeeded: false,
            message: error.message
        });
    }
};