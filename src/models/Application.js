import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
    job:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicant:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resumeUrl: {type: String, required: true},

    applicationStatus: {
        type: String,
        enum: ['Applied', 'In Review', 'Interview', 'Offered', 'Rejected', 'Hired'],
        default: 'Applied',
        required: true
    },

    rejectionReason: {
        type: String,
        enum: ['Skill Mismatch', 'Experience Gap', 'Position Filled', 'Salary Expectations', 'Other']
    },

    
},{timestamps : true});

ApplicationSchema.index({
        job: 1,     
        applicant: 1
    }, {unique: true})

export default mongoose.model('Application', ApplicationSchema);