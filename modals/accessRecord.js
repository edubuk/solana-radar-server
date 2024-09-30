import mongoose from "mongoose";

const accessRecordSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'is invalid'], // Basic email validation
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: Number,
        unique: true,
        
    },
    pinataHash: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('accessRecord', accessRecordSchema);