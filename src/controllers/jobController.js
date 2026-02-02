import Job from '../models/Job.js'

export const createJob = async(req, res) =>
{
    try{
        const newJob = new Job({
            ...req.body,
            employer: req.user.id
        });

        const savedJob = await newJob.save();

        res.status(201).json({
            succeeded: true,
            message: 'Job Posted Successfully',
            data: savedJob
        });

    }catch(error){
        res.status(500).json({
            succeeded: false,
            message: 'Server Error' + error.message
        })
    }
};

export const getAllJobs = async(req, res) =>{
    try{
        const{
            keyword, location,jobType, workMode, page= 1,limit= 10
        } = req.query;

        const query = {
            isActive: true,
            moderationStatus: 'Approved'
        }

        if(keyword){
            query.$text = {$search: keyword};
        }

        if(location) query.location = new RegExp(location, 'i');
        if(jobType) query.jobType = jobType;
        if(workMode) query.workMode = workMode;

        const skip = (page - 1) * limit;

        const jobs = await Job.find(query)
        .populate('employer', 'firstName lastName')
        .sort({ createdAt: -1})
        .skip(skip)
        .limit(Number(limit));

        const totalJobs = await Job.countDocuments(query);

        res.status(200).json({
            succeeded : true,
            data: jobs,
            pagination: {
                totalJobs, 
                totalPages: Math.ceil(totalJobs/limit),
                currentPage: Number(page)
            }
        });

    }catch(error){
        res.status(500).json({
            succeeded: false,
            message: 'Server Error' + error.message
        })
    }
};

export const getJobById = async(req, res) => {
    try{
        const job  = await Job.findById(req.params.id).populate('employer', 'firstName lastName email')
        if (!job){
            return res.status(404).json({
                succeeded: false,
                message: 'Job not Found'
            });
        }
        res.status(200).json({
            succeeded:  true,
            data: job
        });
    }catch(error){
        res.status(500).json({
            succeeded: false,
            message: 'Server Error' + error.message
        });
    }
}