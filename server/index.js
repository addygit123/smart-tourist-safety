import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

const geoFences = [
  { id: 'zone-1', name: 'Restricted Forest Area', center: { lat: 23.1850, lng: 79.9900 }, radius: 500 },
  { id: 'zone-2', name: 'Unstable Cliffside', center: { lat: 23.1700, lng: 79.9750 }, radius: 250 }
];

const mockTourists = [
  { id: 1, name: 'Rohan Sharma', status: 'Safe', location: { lat: 23.1815, lng: 79.9864 }, locationHistory: [], deviceStatus: { battery: 85, network: 4 } },
  { id: 2, name: 'Priya Patel', status: 'Safe', location: { lat: 23.1820, lng: 79.9850 }, locationHistory: [], deviceStatus: { battery: 25, network: 3 } },
  { id: 3, name: 'Amit Singh', status: 'Safe', location: { lat: 23.1750, lng: 80.0010 }, locationHistory: [], deviceStatus: { battery: 95, network: 4 } },
  { id: 4, name: 'Sunita Devi', status: 'Safe', location: { lat: 23.1921, lng: 79.9654 }, locationHistory: [], deviceStatus: { battery: 60, network: 2 } },
];

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] } });
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/tourists', (req, res) => res.status(200).json(mockTourists));
app.get('/api/geofences', (req, res) => res.status(200).json(geoFences));

io.on('connection', (socket) => {
  console.log('✅ A user connected:', socket.id);
  socket.emit('touristUpdate', mockTourists);
  socket.on('panicAlert', (data) => {
    const tourist = mockTourists.find(t => t.id === data.touristId);
    if (tourist) {
        tourist.status = 'Alert';
        io.emit('touristUpdate', mockTourists);
    }
  });
  socket.on('disconnect', () => console.log('❌ User disconnected:', socket.id));
});

const haversineDistance = (coords1, coords2) => {
    const toRad = x => (x * Math.PI) / 180;
    const R = 6371e3;
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lng - coords1.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(coords1.lat)) * Math.cos(toRad(coords2.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

setInterval(() => {
    mockTourists.forEach(tourist => {
        tourist.locationHistory.push([tourist.location.lat, tourist.location.lng]);
        if (tourist.locationHistory.length > 20) tourist.locationHistory.shift();

        if (tourist.id === 2) {
            tourist.location.lat += 0.0004;
            tourist.location.lng += 0.0004;
        } else {
            tourist.location.lat += (Math.random() - 0.5) * 0.001;
            tourist.location.lng += (Math.random() - 0.5) * 0.001;
        }

        let isInDangerZone = false;
        for (const fence of geoFences) {
            const distance = haversineDistance(tourist.location, fence.center);
            
            // --- DEBUG LOGGING ---
            // This will print the exact calculation for Priya Patel every 3 seconds.
            if (tourist.id === 2 && fence.id === 'zone-1') {
                console.log(`Priya's distance from Zone 1: ${Math.round(distance)} meters (Radius is ${fence.radius}m)`);
            }
            
            if (distance < fence.radius) {
                isInDangerZone = true;
                break;
            }
        }

        if (tourist.status !== 'Alert') {
            tourist.status = isInDangerZone ? 'Anomaly' : 'Safe';
        }

        const drain = tourist.id === 2 ? 2 : 0.5;
        tourist.deviceStatus.battery = Math.max(0, tourist.deviceStatus.battery - drain);
        tourist.deviceStatus.network = Math.floor(Math.random() * 4) + 1;
    });

    io.emit('touristUpdate', mockTourists);
}, 3000);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});