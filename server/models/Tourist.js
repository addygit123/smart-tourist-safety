import mongoose from 'mongoose';

const touristSchema = new mongoose.Schema({
    name: { type: String, required: true },
    passportId: { type: String, required: true, unique: true },
    nationality: { type: String, required: true },
    touristPhone: { type: String }, // Phone number from the form
    emergencyContact: { 
        name: String, 
        phone: String 
    },
    status: { type: String, default: 'Safe' },
    
    // Fields from the Mockchain
    touristId: { type: String, required: true, unique: true },
    verificationHash: { type: String, required: true },

}, { timestamps: true });

const Tourist = mongoose.model('Tourist', touristSchema);
export default Tourist;