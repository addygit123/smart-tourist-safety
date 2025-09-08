import Tourist from '../models/Tourist.js';
// We are temporarily removing axios because we are mocking the mockchain call.
// import axios from 'axios';

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
    const { name, passportId, nationality, touristPhone, emergencyContactName, emergencyContactPhone } = req.body;
    
    try {
        console.log("1. Received new tourist registration request.");

        // --- MOCK of the Mockchain API ---
        // Instead of calling Shivam's API, we create a fake response right here.
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
        
        // Create the full tourist object with all the data
        const newTourist = new Tourist({
            name,
            passportId,
            nationality,
            touristPhone,
            emergencyContact: {
                name: emergencyContactName,
                phone: emergencyContactPhone,
            },
            touristId, // The ID from our mock
            verificationHash, // The hash from our mock
        });

        // Save the complete record to your real MongoDB database
        await newTourist.save();
        console.log(`6. Saved new tourist to database.`);

        res.status(201).json({ message: 'Tourist registered successfully (using mockchain)', tourist: newTourist });

    } catch (error) {
        if (error.code === 11000) { // MongoDB duplicate key error
            return res.status(400).json({ message: 'A tourist with this Passport/Aadhaar ID already exists.' });
        }
        console.error("Registration Error:", error.message);
        res.status(500).json({ message: 'Failed to register tourist due to a server error.' });
    }
};