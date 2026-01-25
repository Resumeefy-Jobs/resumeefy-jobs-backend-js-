import mongoose from 'mongoose';

const CompanyProfileSchema = new mongoose.Schema({
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },

  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },

  companyName: { type: String, required: true },
  description: { type: String },
  websiteUrl: { type: String },
  logoUrl: { type: String },
  
  city: { type: String },
  country: { type: String },
  address: { type: String }

}, { timestamps: true });

export default mongoose.model('CompanyProfile', CompanyProfileSchema);