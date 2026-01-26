import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },

  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  }
}, { timestamps: true });

export default mongoose.model('Skill', skillSchema);