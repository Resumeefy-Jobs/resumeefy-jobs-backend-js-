import mongoose from 'mongoose';

const RefreshTokenSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date },
  revokedByIp: { type: String },

}, { timestamps: true });

export default mongoose.model('RefreshToken', RefreshTokenSchema);