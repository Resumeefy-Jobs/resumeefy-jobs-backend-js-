import Application from "../models/Application.js";
import SavedJob from "../models/SavedJob.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import JobseekerProfile from "../models/JobSeekerProfile.js";
import { sendNewApplicantNotification, sendApplicationSuccessEmail } from "../utils/EmailService.js";

export const applyForJob = async (req, res) => {
    try{
        const {jobId} = req.body;
        const userId = req.user._id || req.user.id;

        const job =  await Job.findById(jobId).populate('employer', 'email');
        if(!job || !job.isActive){
            return res.status(404).json({succeeded: false, message: 'Job Unavailable'});
        }

        const profile = await JobseekerProfile.findOne({user: userId});
        if(!profile || !profile.resumeUrl){
            return res.status(404).json({succeeded: false, message: 'Profile or Resume not available'});
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({succeeded: false, message: 'User not found'});
        }

        await Application.create({
            job: jobId,
            applicant: userId, 
            resumeUrl: profile.resumeUrl
        });


        job.lastActivityAt = Date.now();
        job.applicationCount += 1;
        await job.save();

        const applicantName = `${profile.firstName} ${profile.lastName}`;
        const employerName = job.employerName || 'Employer';
        const dashboardLink = `https://resumeefy.com/employer/dashboard`;
        const userEmail = user.email;

        await Promise.allSettled([
            sendApplicationSuccessEmail(userEmail, applicantName, job.title, job.companyName),
            sendNewApplicantNotification(job.employer.email, employerName, job.title, applicantName, dashboardLink)
        ]);

        res.status(201).json({succeeded: true, message: 'Application submitted successfully!'});
    } catch(error){
        if (error.code === 11000) return res.status(400).json({ succeeded: false, message: 'Already applied.' });
        res.status(500).json({succeeded: false, message: 'Server Error: ' + error.message});

    }
};

export const toggleSaveJob = async (req, res) => {
    try{
        const { jobId } = req.body;
        const userId = req.user._id || req.user.id; 

        const existing = await SavedJob.findOne({user: userId, job: jobId});

        if(existing){
            await SavedJob.deleteOne({ user: userId, job: jobId });
            return res.status(200).json({succeeded: true, message: 'Job Removed From Saved List.'})
        } else {
            await SavedJob.create({user: userId, job: jobId});
            return res.status(201).json({succeeded: true, message: 'Job Saved Successfully.'})
        }
    }catch(error){
        console.error(error);
        res.status(500).json({succeeded: false, message: error.message});
    }
};

export const getMyAppliactions = async(req, res)=>{
    try{
        const apps = await Application.find({applicant: req.user.id})
        .populate('job', 'title companyName location status')
        .sort({createdAt: -1})

        res.status(200).json({
            succeeded: true,
            data: apps
        });
    }catch(err){
        res.status(500).json({
            succeeded: false,
            message: err.message
        })
    }
};

export const getSavedJobs = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const saved = await SavedJob.find({ user: userId })
      .populate('job', 'title companyName location jobType') 
      .sort({ createdAt: -1 });

    res.status(200).json({ succeeded: true, data: saved });

  } catch (error) {
    res.status(500).json({ succeeded: false, message: error.message });
  }
};