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
const io = new Server(server, { cors: { origin: "http://localhost:5173" } });
const PORT = process.env.PORT || 5000;

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
  { id: 'zone-3', name: 'Hanuman Tal Lake (Water Body)', center: { lat: 23.200892, lng: 79.985356 }, radius: 500 }
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
    const allTourists = await Tourist.find({});
    socket.emit('touristUpdate', allTourists);
  } catch (error) { console.error("Error sending initial tourist list:", error); }

   // Listener for Alert Triage from the dashboard
  socket.on('updateStatus', async (data) => {
    console.log(`STATUS UPDATE for tourist ${data.touristId} to ${data.newStatus}`);
    try {
        await Tourist.findOneAndUpdate({ touristId: data.touristId }, { status: a.newStatus });
        const allTourists = await Tourist.find({});
        io.emit('touristUpdate', allTourists);
    } catch (error) {
        console.error("Error updating status:", error);
    }
  });

  socket.on('disconnect', () => console.log('❌ User disconnected:', socket.id));
});
  
// --- 6. THE FINAL, CORRECT "HEARTBEAT" SIMULATOR ---


setInterval(async () => {
    try {
        const allTourists = await Tourist.find({});
        io.emit('touristUpdate', allTourists);
    } catch (error) {
        console.error("Error in broadcast loop:", error);
    }
}, 5000); // Sync every 5 seconds

// --- 7. Start the Server ---
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));