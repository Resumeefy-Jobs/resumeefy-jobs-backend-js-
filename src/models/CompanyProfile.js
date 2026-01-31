import mongoose from 'mongoose';

const CompanyProfileSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },

  companyName: { type: String, required: true, unique: true },
  logoUrl: { type: String }, 
  website: { type: String },
  location: { type: String },
  
  industry: { 
    type: String, 
    enum: ['Technology', 'Finance', 'Health', 'Education', 'Retail', 'Other'],
    default: 'Other'
  },
  
  description: { type: String },
  size: { type: String }, 

  isVerified: { type: Boolean, default: false },
  verificationDocUrl: { type: String }

}, { timestamps: true });

export default mongoose.model('CompanyProfile', CompanyProfileSchema);