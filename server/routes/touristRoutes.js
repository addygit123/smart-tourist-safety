// server/routes/touristRoutes.js
import express from 'express';
import { getAllTourists } from '../controllers/touristController.js';

const router = express.Router();

// When someone makes a GET request to "/", run the getAllTourists function.
router.get('/', getAllTourists);

export default router;