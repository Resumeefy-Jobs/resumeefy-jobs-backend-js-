import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },

  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    lowercase: true 
  },
  passwordHash: { type: String, required: true },
  
  role: { 
    type: String, 
    enum: ['Admin', 'Employer', 'JobSeeker'], 
    required: true 
  },

  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },

  verificationToken: { type: String },
  passwordResetToken: { type: String },
  tokenExpiresAt: { type: Date },
  passwordResetTokenExpiresAt: { type: Date },

  isAdmin: {
    type: Boolean,
    default: false
  },

  isBanned: {
    type: Boolean,
    default: false
  },

  adminRole: { 
    type: String, 
    enum: ['Moderator', 'SuperAdmin', 'None'], 
    default: 'None' 
  },

}, { 
  timestamps: true,
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true } 
});

UserSchema.virtual('jobSeekerProfile', {
  ref: 'JobSeekerProfile',
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

UserSchema.virtual('companyProfile', {
  ref: 'CompanyProfile',
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

export default mongoose.model('User', UserSchema);