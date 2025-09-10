import Tourist from '../models/Tourist.js';
// We are temporarily removing axios because we are mocking the mockchain call.
// import axios from 'axios';
import { sendRegistrationSMS } from '../services/notificationService.js';
// --- UPGRADED: This function now fetches from the REAL database ---
export const getAllTourists = async (req, res) => {
  try {
    // This fetches all documents from the 'tourists' collection in MongoDB.
    const tourists = await Tourist.find({});
    res.status(200).json(tourists);
  } catch (error) {
    // Basic error handling
    res.status(500).json({ message: 'Error fetching tourists from database', error: error.message });
  }
};

// --- NEW: The complete function to handle registration ---
export const registerTourist = async (req, res) => {
    const { name, passportId, nationality, touristPhone, emergencyContactName, emergencyContactPhone,pnr=null,travelNumber= null} = req.body;
    
    try {
        console.log("1. Received new tourist registration request.");

        // --- MOCK of the Mockchain API ---
        console.log("2. MOCKING the Mockchain API call...");
        const mockchainResponse = {
            data: {
                touristId: `STS-${Date.now()}`,
                verificationHash: `mock-hash-${Math.random().toString(36).substring(7)}`
            }
        };
        // --- END OF MOCK ---

        const { touristId, verificationHash } = mockchainResponse.data;
        console.log(`3. Received MOCKED ID from Mockchain: ${touristId}`);
        
        const newTourist = new Tourist({
            name, passportId, nationality, touristPhone,
            emergencyContact: {
                name: emergencyContactName,
                phone: emergencyContactPhone,
            },
            touristId,
            verificationHash,
            location: {
                lat: 23.1815 + (Math.random() - 0.5) * 0.01,
                lng: 79.9864 + (Math.random() - 0.5) * 0.01
            },// Guaranteed to have a device status
            ticketInfo: {
            pnr,
            travelNumber
            },
            deviceStatus: {
                battery: 100, // Start with a full battery
                network: 4    // Start with a full network signal
            }
        });

        await newTourist.save();
        console.log(`6. Saved new tourist to database.`);

        // 7. After saving, send the welcome SMS to the tourist.
        sendRegistrationSMS(newTourist);
        
        // --- THIS IS THE NEW PART ---
        // 8. Get the complete, updated list of ALL tourists from the database.
        const allTourists = await Tourist.find({});
        
        // 9. Use the 'io' object (from our middleware in index.js) to broadcast the full list.
        req.io.emit('touristUpdate', allTourists);
        console.log('📡 Broadcasted updated tourist list to all clients.');
        // --- END OF NEW PART ---

        res.status(201).json({ message: 'Tourist registered successfully (using mockchain)', tourist: newTourist });

    } catch (error) {
        if (error.code === 11000) { // MongoDB duplicate key error
            return res.status(400).json({ message: 'A tourist with this Passport/Aadhaar ID already exists.' });
        }
        console.error("Registration Error:", error.message);
        res.status(500).json({ message: 'Failed to register tourist due to a server error.' });
    }
};