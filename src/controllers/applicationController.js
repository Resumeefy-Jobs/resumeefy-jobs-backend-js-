import Application from "../models/Application.js";
import SavedJob from "../models/SavedJob.js";
import Job from "../models/Job.js";
import JobseekerProfile from "../models/JobSeekerProfile.js";

export const applyForJob = async (req, res) => {
    try{
        const {jobId} = req.body;
        const userId = req.user._id;

        const job =  await Job.findById(jobId);
        if(!job || !job.isActive){
            return res.status(404).json({succeeded: false, message: 'Job Unavailable'});
        }

        const profile = await JobseekerProfile.findOne({user: userId});
        if(!profile || !profile.resumeUrl){
            return res.status(404).json({succeeded: false, message: 'Profile or Resume not available'});
        }

        await Application.create({
            job: jobId,
            user: userId,
            resumeUrl: profile.resumeUrl
        });

        job.lastActivityAt = Date.now();
        job.ApplicationsCount += 1;
        await job.save();

        res.status(201).json({succeeded: true, message: 'Application submitted successfully!'});
    } catch(error){
        if (error.code === 11000) return res.status(400).json({ succeeded: false, message: 'Already applied.' });
        res.status(500).json({succeeded: false, message: 'Server Error: ' + error.message});

    }
};

export const toggleSaveJob = async (req, res) => {
    try{
        const { jobId } = req.body;
        const userId = req.user._id;

        const existing = SavedJob.findOne({user: userId, job: jobId});
        if(existing){
            await SavedJob.findByIdAndDelete(existing.__id)
            return res.status(200).json({succeeded: true, message: 'Job Removed From Saved List.'})
        }else{
            await SavedJob.create({user: userId, job: jobId})
            return res.status(200).json({succeeded: true, message: 'Job Saved Successfully.'})
        }
    }catch(error){
        res.status(500).json({succeeded: false, message: error.message});
    }
};

export const getMyAppliactions = async(req, res)=>{
    try{
        const apps = await Application.Find({applicant: req.user.id})
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

export const getSavedJobs =  async(req,res) =>{
    try{
        const saved = SavedJob.Find({user: req.user.id})
        .populate('job', 'title companyName location status')
        .sort({createdAt: -1})

        res.status(200).json({
            succeeded: true,
            data: saved
        });
    }catch(error){
        res.status(500).json({
            succeeded: false,
            message: error.message
        })
    }
};