import Job from '../models/Job.js';
import CompanyProfile from '../models/CompanyProfile.js';
import Application from '../models/Application.js';

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