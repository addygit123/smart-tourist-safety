import mongoose from 'mongoose';

// A sub-schema for the location object
const locationSchema = new mongoose.Schema({
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
}, { _id: false });

// --- NEW: A sub-schema for the device status object ---
const deviceStatusSchema = new mongoose.Schema({
    battery: { type: Number, required: true },
    network: { type: Number, required: true }
}, { _id: false });

const touristSchema = new mongoose.Schema({
    name: { type: String, required: true },
    passportId: { type: String, required: true, unique: true },
    nationality: { type: String, required: true },
    touristPhone: { type: String },
    emergencyContact: { 
        name: String, 
        phone: String 
    },
     // --- THIS IS THE NEW PART ---
    tripEndDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // --- END OF NEW PART ---
    ticketInfo: {
        pnr: { type: String },
        travelMode: { type: String }, // e.g., 'Flight', 'Train'
        travelNumber: { type: String } // e.g., '6E-2048'
    },
    locationHistory: {
        type: [[Number]], // An array of [lng, lat] pairs
        default: []
    },
    status: { 
        type: String, 
        enum: ['Safe', 'Anomaly', 'Alert', 'Investigating', 'Resolved'],
        default: 'Safe',
        required: true
    },
    
    location: { 
        type: locationSchema, 
        required: true 
    },
    
    // --- THIS IS THE FIX ---
    // The deviceStatus field is now officially part of the database schema and is required.
    deviceStatus: {
        type: deviceStatusSchema,
        required: true
    },

    touristId: { type: String, required: true, unique: true },
    verificationHash: { type: String, required: true },

}, { timestamps: true });

const Tourist = mongoose.model('Tourist', touristSchema);

export default Tourist;