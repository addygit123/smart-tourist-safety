
// server/controllers/touristController.js

// This is the mock data. It's our "fake database" for now.

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