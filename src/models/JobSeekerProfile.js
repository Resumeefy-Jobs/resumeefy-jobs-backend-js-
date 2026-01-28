import mongoose from 'mongoose';

const JobSeekerProfileSchema = new mongoose.Schema({
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },

  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },

  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String },
  city: { type: String },
  country: { type: String },
  bio: { type: String },
  resumeUrl: { type: String },
  portfolioUrl: { type: String },

  experienceLevel: {
    type: String,
    enum: ['Intern', 'Junior', 'MidLevel', 'Senior', 'Lead', 'Manager'],
    required: true
  },

  skills: { 
    type: [String], 
    default: [] 
  },

  headline: { type: String },
  
  workExperience: [{
    company: String,
    role: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    description: String
  }],

  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startDate: Date,
    endDate: Date
  }],

  linkedinUrl: { type: String },
  githubUrl: { type: String },

}, { timestamps: true });

export default mongoose.model('JobSeekerProfile', JobSeekerProfileSchema);