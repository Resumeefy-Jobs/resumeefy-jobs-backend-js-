import Job from '../models/Job.js';
import CompanyProfile from '../models/CompanyProfile.js';
import Application from '../models/Application.js';
import JobSeekerProfile from '../models/JobSeekerProfile.js';
import {sendShortlistEmail, sendRejectionEmail} from '../utils/EmailService.js'

export const updateCompanyProfile = async (req, res) => {
    try{
        const userId = req.user.__id || req.user.id;
        const {companyName, website, location, industry, description, size, logoUrl} = req.body;

        const profile = await CompanyProfile.findOneAndUpdate(
            {user: userId},
            {companyName, website, location, industry, description, size, logoUrl},
            {new : true, upsert: true, runValidators: true}
        );

        res.status(200).json({
            succeeded: true,
            data:  profile
        });
    }catch(error){
        res.status(500).json({
            succeeded: false,
            message: error.message
        });
    }
};

export const getCompanyProfile = async(req, res) =>{
    try{
        const userId = req.user.__id || req.user.id;
        const profile = await CompanyProfile.findOne({user: userId});

        if(!profile){
            return res.status(404).json({succeeded: false, message: 'Company Profile Not Found.'});
        }

        res.status(200).json({succeeded: true, data: profile});
    }catch(error){
        res.status(500).json({
            succeeded: false,
            message: error.message
        });
    }
};

export const getEmployerStats = async(req, res) => {
    try{
        const userId = req.user.__id || req.user.id;

        const jobs = await Job.find({employer: userId});
        const jobIds = jobs.map(job => job.__id || job.id);

        const activeJobs = jobs.filter(j => j.isActive).length;
        const totalApplications = await Application.countDocuments({
            job: {$in: jobIds}
        });

        res.status(200).json({
            succeeded: true, 
            data:{
                totalJobs: jobs.length,
                activeJobs, 
                totalApplications
            }
        });
    }
    catch(error){
        res.status(500).json({
            succeeded: false,
            message: error.message
        });
    }
};

export const getJobApplicants = async(req, res) => {
    try{
        const { jobId } = req.params
        const userId = req.user._id || req.user.id;


        const job = await Job.findOne({ _id: jobId, employer: userId });
        if(!job){
            return res.status(404).json({
                succeeded: false,
                message: "Job not found / unauthorized"
            });
        }

        const applications = await Application.find({job: jobId})
        .populate('applicant', 'email')
        .sort({createdAt: -1});

        const applicantIds = applications.map(app => app.applicant._id || app.applicant.id);
        const profiles = await JobSeekerProfile.find({user: {$in : applicantIds}});

        const profileMap = {};
        profiles.forEach(p => {profileMap[p.user.toString()] = p;});

        const sanitizedApplicants = applications.map(app => {
            const profile = profileMap[app.applicant._id.toString()] || {};

            const data = {
                applicationId: app._id,
                status: app.status,
                appliedAt: app.createdAt,
                skills: profile.skills || [],
                workExperience: profile.workExperience || [],
                education: profile.education || [],
                resumeUrl: app.resumeUrl
            };

            if (job.isBlindMode) {
                data.applicantName = "Candidate #" + app._id.toString().slice(-4);
                data.email = "HIDDEN";
                data.phone = "HIDDEN";
                data.links = { linkedin: "HIDDEN", portfolio: "HIDDEN" };
            } else {
                data.applicantName = `${profile.firstName} ${profile.lastName}`;
                data.email = app.applicant.email;
                data.phone = profile.phone;
                data.headline = profile.headline;
                data.location = `${profile.city}, ${profile.country}`;
                data.links = {
                linkedin: profile.linkedinUrl,
                portfolio: profile.portfolioUrl,
                github: profile.githubUrl
                };
            }

            return data;
        });

        res.status(200).json({
            succeeded: true,
            data: sanitizedApplicants
        });
    }
    catch(error){
        res.status(500).json({
            succeeded: false,
            message: error.message
        });
    }
};

export const updateApplicationStatus = async(req, res) => {
    try{
        const {applicationId} = req.params;
        const { status, rejectionReason } = req.body;
        const userId = req.user._id || req.user.id;

        const application = await Application.findById(applicationId)
        .populate('job')
        .populate('applicant', 'email');

        if(!application){
            return res.status(404).json({
                succeeded : false,
                message: 'Job Application not Found.'
            });
        }

        if(application.job.employer.toString() !== userId.toString()){
            return res.status(403).json({
                succeeded: false,
                message: 'Unauthorized action'
            });
        }

        if(status === 'Rejected' && !rejectionReason){
            return res.status(400).json({
                succeeded: false,
                message: 'Rejection Reason Is Mandatory. Pls provide Feedback'
            });
        }

        application.applicationStatus = status;
        if(status === 'Rejected'){
            application.rejectionReason = rejectionReason;
        }

        await application.save();

        const candidateEmail = application.applicant.email;
        const jobTitle = application.job.title;
        const companyName = application.job.companyName;

        const jobSeekerProfile = await JobSeekerProfile.findOne({user: application.applicant._id});
        const candidateName = jobSeekerProfile ? `${jobSeekerProfile.firstName} ${jobSeekerProfile.lastName}` : 'Candidate';

        if(status === 'Rejected'){
            sendRejectionEmail(candidateEmail, candidateName, jobTitle, companyName, rejectionReason).catch(console.error);
        }else if( status === 'Shortlisted' || status === 'Interview'){
            sendShortlistEmail(candidateEmail, candidateName, jobTitle, companyName).catch(console.error);
        }

        res.status(200).json({
            succeeded: true,
            message: `Application status updated to ${status}.`
        });
    }
    catch(error){
        res.status(500).json({
            succeeded: true,
            message: error.message
        });
    }
};