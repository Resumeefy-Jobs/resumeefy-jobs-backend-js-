import JobSeekerProfile from '../models/JobSeekerProfile.js';

export const uploadResume = async (req, res) => {
    try{
        if(!req.file){
            return res.status(400).json({ succeeded: false, message: 'No file uploaded.' });
        }

        const resumeUrl = req.file.path;

        const profile = await JobSeekerProfile.findOneAndUpdate(
            { user: req.user._id || req.user.id },
            { resumeUrl: resumeUrl },
            { new: true , upsert: true }
        );

        res.status(200).json(
        {   succeeded: true, 
            message: 'Resume uploaded successfully.', 
            data: profile.resumeUrl 
        });
    }catch(error)
    {
        res.status(500).json({ succeeded: false, message: 'Server Error: ' + error.message });
    }
}

export const getProfile = async (req, res) => {
    try{
        const userId = req.user.id; 
        
        const profile = await JobSeekerProfile.findOne({ user: userId }).populate('user', 'email');
        
        if(!profile){
            return res.status(404).json({ succeeded: false, message: 'Profile not found.' });
        }
        res.status(200).json({ succeeded: true, data: profile });
    }catch(error){
        res.status(500).json({ succeeded: false, message: 'Server Error: ' + error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; 

        const { 
            firstName, lastName, phone, city, country, bio, 
            headline, portfolioUrl, linkedinUrl, githubUrl,
            workExperience,
            education,    
            skills        
        } = req.body;

        const profile = await JobSeekerProfile.findOneAndUpdate(
            { user: userId },
            { 
                firstName, lastName, phone, city, country, bio, 
                headline, portfolioUrl, linkedinUrl, githubUrl,
                workExperience, 
                education, 
                skills 
            },
            { new: true, upsert: true, runValidators: true } 
        );

        res.status(200).json({ succeeded: true, message: 'Profile updated successfully.', data: profile });
    } catch (error) {
        res.status(500).json({ succeeded: false, message: 'Server Error: ' + error.message });
    }
}