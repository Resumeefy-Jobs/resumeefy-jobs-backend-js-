import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    title: { type: String, required: true, index: true},
    companyName: {type: String, required: true},
    location: {type: String, required: true},

    jobType: {
        type: String, 
        enum: ['Full-Time', 'Part-Time', 'Contract', 'Intership', 'Freelance'],
        required: true,
        index: true
    },
    workMode: {
        type: String,
        enum: ['On-Site', 'Remote', 'Intership', 'Hybrid'],
        required: true,
        index: true
    },

    description:{ type: String, required: true},
    requirement: { type: [String], default: []},

    salaryRange: {
        min: { type: Number},
        max: { type: Number},
        currency: { type: String, default: 'NGN'}
    },

    isActive: {type: Boolean, default: true},
    applicationCount: {type: Number, default: 0}

},{timeStamps: true});

JobSchema.index({title: 'text', description: 'text', companyName: 'text'});

export default mongoose.model('Job', JobSchema);