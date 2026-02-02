import mongoose from 'mongoose'

const AuditLogSchema = new mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    }, 

    action: {
        type: String, 
        required: true,
        enum: ['BAN_USER', 'UNBAN_USER', 'APPROVE_JOB', 'REJECT_JOB', 'CREATE_MODERATOR']
    }, 
    targetId : {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    targetModel: {
        type: String, 
        required: true
    }, 
    details: {
        type: String
    }
}, { timestamps: true});

export default mongoose.model('AuditLog', AuditLogSchema);