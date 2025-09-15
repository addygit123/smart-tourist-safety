import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import touristRoutes from './routes/touristRoutes.js';
import authRoutes from './routes/authRoutes.js';
import Tourist from './models/Tourist.js';
import { sendAlertSMS } from './services/notificationService.js';

// --- 1. Connect to DB and Set Up Server ---
connectDB();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 10000;

// --- 2. Middleware ---
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    req.io = io;
    next();
});

// --- 3. Define Geo-Fences ---
// This was missing from the last version. This is now correct.
const geoFences = [
  { id: 'zone-1', name: 'Restricted Forest Area', center: { lat: 23.1850, lng: 79.9900 }, radius: 800 },
  // { id: 'zone-2', name: 'Unstable Cliffside', center: { lat: 23.1700, lng: 79.9750 }, radius: 250 },
  { id: 'zone-3', name: 'Robertson Lake (Water Body)', center: { lat: 23.200892, lng: 79.985356 }, radius: 500 }
];

// --- 4. API Routes ---
app.use('/api/tourists', touristRoutes);
app.use('/api/auth', authRoutes);
// The /api/geofences route was missing. It is now fixed.
app.get('/api/geofences', (req, res) => {
    res.status(200).json(geoFences);
});

// --- 5. Real-time Socket.IO Logic ---
io.on('connection', async (socket) => {
  console.log('✅ A user connected:', socket.id);
  try {
    // --- CHANGE THIS LINE ---
    const activeTourists = await Tourist.find({ isActive: true });
    socket.emit('touristUpdate', activeTourists);
  } catch (error) { console.error("Error sending initial tourist list:", error); }

  socket.on('updateStatus', async (data) => {
  console.log(`STATUS UPDATE for tourist ${data.touristId} to ${data.newStatus}`);
  try {
      const updatedTourist = await Tourist.findOneAndUpdate(
        { touristId: data.touristId },
        { $set: { status: data.newStatus } },
        { new: true } // return updated doc
      );

      if (!updatedTourist) {
          console.warn(`⚠️ Tourist not found: ${data.touristId}`);
          return;
      }

      console.log(`✅ DB updated: ${updatedTourist.touristId} is now ${updatedTourist.status}`);

      const allTourists = await Tourist.find({isActive: true});
      io.emit('touristUpdate', allTourists);
  } catch (error) {
      console.error("Error updating status:", error);
  }
});

  socket.on('disconnect', () => console.log('❌ User disconnected:', socket.id));
});

// --- 6. THE FINAL, CORRECT "HEARTBEAT" SIMULATOR ---

const haversineDistance = (coords1, coords2) => {
    const toRad = x => (x * Math.PI) / 180; const R = 6371e3; const dLat = toRad(coords2.lat - coords1.lat); const dLon = toRad(coords2.lng - coords1.lng); const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(coords1.lat)) * Math.cos(toRad(coords2.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c;
};

const runSimulation = async () => {
    try {
        const touristsFromDB = await Tourist.find({isActive:true});

        for (const tourist of touristsFromDB) {
           
            
            const oldStatus = tourist.status;
            let newStatus = tourist.status;

            let isInDangerZone = false;
            for (const fence of geoFences) {
                if (haversineDistance(tourist.location, fence.center) < fence.radius) {
                    isInDangerZone = true;
                    break;
                }
            }
            
            // --- THIS IS THE CRITICAL LOGIC FIX ---
            // Rule 1: The AI is ONLY allowed to act if the tourist is currently 'Safe'.
            // Only auto-manage Safe <-> Anomaly. 
// Protect manual statuses (Investigating, Resolved, Alert).
const protectedStatuses = ['Investigating', 'Resolved', 'Alert'];
//console.log(`Tourist ${tourist.touristId} current DB status: ${oldStatus}, dangerZone: ${isInDangerZone}`);

if (protectedStatuses.includes(oldStatus)) {
    // Skip: keep whatever status was set manually
    newStatus = oldStatus;
} else if (oldStatus === 'Safe' && isInDangerZone) {
    // Only Safe → Anomaly triggers alerts
    newStatus = 'Anomaly';
    sendAlertSMS(tourist);
} else if (oldStatus === 'Anomaly' && !isInDangerZone) {
    // Only Anomaly → Safe when leaving the zone
    newStatus = 'Safe';
}
// --- END FIX ---
            // In all other cases ('Alert', 'Investigating', 'Resolved'), the AI does nothing to the status.

            await Tourist.updateOne(
                { _id: tourist._id },
                { $set: { status: newStatus } }
            );
        }
        
        const updatedTourists = await Tourist.find({isActive: true});
        io.emit('touristUpdate', updatedTourists);

    } catch (error) {
        console.error("Error in simulation loop:", error);
    }
};

setInterval(runSimulation, 5000);
// --- THE "JANITOR" - AUTOMATED TRIP EXPIRATION ---
const cleanupExpiredTourists = async () => {
    try {
        const now = new Date();
        // console.log(`🧹 Janitor is running its check at ${now.toLocaleTimeString()}`);
        // Find all active tourists whose trip end date is in the past
        const result = await Tourist.updateMany(
            { tripEndDate: {  $exists: true,$lt: now }, isActive: true },
            { $set: { isActive: false } }
        );

        if (result.modifiedCount > 0) {
            console.log(`🧹 Janitor: Deactivated ${result.modifiedCount} expired tourist profiles.`);
            // After cleaning up, broadcast the new, shorter list of tourists.
            const activeTourists = await Tourist.find({ isActive: true });
            io.emit('touristUpdate', activeTourists);
        }
    } catch (error) {
        console.error("Error during tourist cleanup:", error);
    }
};

// Run the cleanup task every hour. For the demo, you can set it to 60000 (1 minute).
setInterval(cleanupExpiredTourists, 3600000); 
// --- 7. Start the Server ---
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));