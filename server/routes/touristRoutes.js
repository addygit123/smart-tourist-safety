// server/routes/touristRoutes.js
import express from 'express';
import { getAllTourists } from '../controllers/touristController.js';
import { registerTourist } from '../controllers/touristController.js';

const router = express.Router();

// When someone makes a GET request to "/", run the getAllTourists function.
router.get('/', getAllTourists);

// --- THIS IS THE CRITICAL LINE THAT WAS LIKELY MISSING ---
// This rule tells the server what to do with POST requests to /api/tourists/register
router.post('/register', registerTourist);

export default router;