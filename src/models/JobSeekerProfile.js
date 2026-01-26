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
  bio: { type: String },
  resumeUrl: { type: String },
  portfolioUrl: { type: String },

  experienceLevel: {
    type: String,
    enum: ['Intern', 'Junior', 'MidLevel', 'Senior', 'Lead', 'Manager'],
    required: true
  },

  skills: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Skill' 
  }]

}, { timestamps: true });

export default mongoose.model('JobSeekerProfile', JobSeekerProfileSchema);