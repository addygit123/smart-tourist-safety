import Tourist from '../models/Tourist.js';
// We are temporarily removing axios because we are mocking the mockchain call.
// import axios from 'axios';
import axios from "axios";
import { sendRegistrationSMS } from '../services/notificationService.js';
// --- UPGRADED: This function now fetches from the REAL database ---
export const getAllTourists = async (req, res) => {
  try {
    // This fetches all documents from the 'tourists' collection in MongoDB.
    const tourists = await Tourist.find({
  $or: [
    { isActive: true },
    { isActive: { $exists: false } } // include old tourists
  ]
});
    res.status(200).json(tourists);
  } catch (error) {
    // Basic error handling
    res.status(500).json({ message: 'Error fetching tourists from database', error: error.message });
  }
};

// --- NEW: The complete function to handle registration ---
export const registerTourist = async (req, res) => {
    const { name, passportId, nationality, touristPhone, emergencyContactName, emergencyContactPhone,pnr=null,travelNumber= null, tripEndDate } = req.body;
    
    try {
        console.log("1. Received new tourist registration request.");

        // --- THIS IS THE ENGINE SWAP ---
        // We are now making a REAL API call to the standalone mockchain server.
        console.log("2. Calling the real Mockchain API service...");
        const mockchainResponse = await axios.post('http://localhost:5001/createID', {
            name,
            passportId,
        });
        // --- END OF ENGINE SWAP ---


        const { touristId, verificationHash } = mockchainResponse.data;
        console.log(`3. Received REAL ID from Mockchain: ${touristId}`);
        
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
            tripEndDate:new Date(tripEndDate),
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

export const getATourist = async (req, res) => {
    const {id}  = req.body
    console.log('here :',id);
    

    try {
        const data = await Tourist.find({touristId: id})
        console.log(data);
        
        res.status(200).json({data: data})
    }
    catch(e){
        console.log(e);
        res.status(500).send({error: e})
    }
}

// --- THIS IS THE FINAL, CORRECT VERSION OF updateLocation ---
export const updateLocation = async (req, res) => {
    // Note: The mobile dev is sending touristId in the body as 'id'. We match that.
    const { id, lat, long, blevel, network, cache } = req.body;
    console.log('cache',  cache);

    let history = []
    if(cache !== null){
        history = [...cache]
    }

    history = [...history, [lat, long]]

    try {
        // Find the tourist and update everything in one efficient database operation.
        await Tourist.updateOne(
            { touristId: id },
            { 
                $set: { 
                    "location.lat": lat, 
                    "location.lng": long,
                    "deviceStatus.battery": blevel,
                    "deviceStatus.network": network
                },
                // --- FIX: Add the new location to the history array ---
                $push: {
                    locationHistory: {
                        $each: history, // Add the new point
                        $slice: -20         // Keep only the last 20 elements
                    }
                }
            }
        );

        // --- FIX: Broadcast the change to all dashboards ---
        const allTourists = await Tourist.find({});
        req.io.emit('touristUpdate', allTourists);

        // Send a success response back to the Expo app.
        res.status(200).json({ message: 'ok' });

    } catch (error) {
        console.error("Error updating location:", error.message);
        res.status(500).json({ message: 'Server error while updating location.' });
    }
};

// --- This function is now also fixed to broadcast its change ---
export const makeUnsafe = async (req, res) => {
    const { id } = req.body;
    console.log(id);
    
    try {
        await Tourist.updateOne({ touristId: id }, { $set: { status: "Alert" } });
        
        // --- FIX: Broadcast the change ---
        const allTourists = await Tourist.find({});
        req.io.emit('touristUpdate', allTourists);

        res.status(200).json({ message: 'ok' });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e });
    }
};