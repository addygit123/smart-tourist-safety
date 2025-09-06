
// server/controllers/touristController.js

// This is the mock data. It's our "fake database" for now.
const mockTourists = [
  { id: 1, name: 'Rohan Sharma', status: 'Safe', location: { lat: 23.1815, lng: 79.9864 }, lastSeen: '2 mins ago' },
  { id: 2, name: 'Priya Patel', status: 'Anomaly', location: { lat: 23.2000, lng: 79.9500 }, lastSeen: '10 mins ago' },
  { id: 3, name: 'Amit Singh', status: 'Alert', location: { lat: 23.1750, lng: 80.0010 }, lastSeen: '1 min ago' },
  { id: 4, name: 'Sunita Devi', status: 'Safe', location: { lat: 23.1921, lng: 79.9654 }, lastSeen: '15 mins ago' }
];

// This is the function that will be called when someone visits our API route.
export const getAllTourists = (req, res) => {
  try {
    // We just send the mock data back as a JSON response.
    res.status(200).json(mockTourists);
  } catch (error) {
    // Basic error handling
    res.status(500).json({ message: 'Error fetching tourists', error: error.message });
  }
};