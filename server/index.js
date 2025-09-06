import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

// --- NEW: Define our Geo-fenced "High-Risk" Zones ---
// A geo-fence is defined by a center point (lat, lng) and a radius in meters.
const geoFences = [
  { id: 'zone-1', name: 'Restricted Forest Area', center: { lat: 23.1850, lng: 79.9900 }, radius: 500 },
  { id: 'zone-2', name: 'Unstable Cliffside', center: { lat: 23.1700, lng: 79.9750 }, radius: 250 }
];

// --- NEW: Added deviceStatus to each tourist ---
const mockTourists = [
  { id: 1, name: 'Rohan Sharma', status: 'Safe', location: { lat: 23.1815, lng: 79.9864 }, locationHistory: [], deviceStatus: { battery: 85, network: 4 } },
  { id: 2, name: 'Priya Patel', status: 'Safe', location: { lat: 23.1820, lng: 79.9850 }, locationHistory: [], deviceStatus: { battery: 25, network: 3 } }, // Priya's battery is lower
  { id: 3, name: 'Amit Singh', status: 'Safe', location: { lat: 23.1750, lng: 80.0010 }, locationHistory: [], deviceStatus: { battery: 95, network: 4 } },
  { id: 4, name: 'Sunita Devi', status: 'Safe', location: { lat: 23.1921, lng: 79.9654 }, locationHistory: [], deviceStatus: { battery: 60, network: 2 } },
];

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

app.get('/api/tourists', (req, res) => {
    res.status(200).json(mockTourists);
});

// --- NEW: API Endpoint to serve the geo-fence data ---
app.get('/api/geofences', (req, res) => {
    res.status(200).json(geoFences);
});

io.on('connection', (socket) => {
  console.log('✅ A user connected:', socket.id);
  socket.emit('touristUpdate', mockTourists);
  // --- NEW: Listen for a Panic Alert from a client ---
  socket.on('panicAlert', (data) => {
    console.log(`🚨 PANIC ALERT RECEIVED for tourist ID: ${data.touristId}`);

    // Find the tourist in our mock data
    const tourist = mockTourists.find(t => t.id === data.touristId);

    if (tourist) {
        // Forcefully update their status to 'Alert'
        tourist.status = 'Alert';

        // Immediately broadcast the updated list to ALL connected dashboards
        // This ensures every official sees the alert instantly.
        io.emit('touristUpdate', mockTourists);
    }
  });
  
  socket.on('disconnect', () => console.log('❌ User disconnected:', socket.id));
});

// --- UPGRADED SIMULATOR with Geo-fence check ---
// Helper function to calculate distance between two lat/lng points in meters
const haversineDistance = (coords1, coords2) => {
    const toRad = x => (x * Math.PI) / 180;
    const R = 6371e3; // Earth's radius in metres
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lng - coords1.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(coords1.lat)) * Math.cos(toRad(coords2.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// --- UPGRADED SIMULATOR ---
setInterval(() => {
    mockTourists.forEach(tourist => {
        // ... (location history and movement logic remains the same)
        tourist.locationHistory.push([tourist.location.lat, tourist.location.lng]);
        if (tourist.locationHistory.length > 20) tourist.locationHistory.shift();
        // --- THIS IS THE SECOND CHANGE ---
        // We give Priya Patel a specific, non-random path into the danger zone.
        if (tourist.id === 2) { // If the tourist is Priya Patel
            // Move her steadily northeast, towards the center of zone-1
            tourist.location.lat += 0.0004;
            tourist.location.lng += 0.0004;
        } else {
            // All other tourists still move randomly.
            tourist.location.lat += (Math.random() - 0.5) * 0.001;
            tourist.location.lng += (Math.random() - 0.5) * 0.001;
        }
        // --- NEW: Check if the tourist is inside any geo-fence ---
        let isInDangerZone = false;
        for (const fence of geoFences) {
            const distance = haversineDistance(tourist.location, fence.center);
            if (distance < fence.radius) {
                isInDangerZone = true;
                break; // No need to check other fences
            }
        }

        // Update status based on the check. We won't override a manual SOS alert.
        if (tourist.status !== 'Alert') { // 'Alert' is reserved for Panic Button
            tourist.status = isInDangerZone ? 'Anomaly' : 'Safe';
        }
         // --- NEW: Simulate device status changes ---
        // Battery drains slowly, Priya's drains faster
        const drain = tourist.id === 2 ? 2 : 0.5;
        tourist.deviceStatus.battery = Math.max(0, tourist.deviceStatus.battery - drain);

        // Network signal fluctuates
        tourist.deviceStatus.network = Math.floor(Math.random() * 4) + 1; // Random number between 1 and 4
    });

    io.emit('touristUpdate', mockTourists);
    // console.log('📡 Broadcasting tourist updates with history...'); // Optional: can be noisy
}, 3000);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});