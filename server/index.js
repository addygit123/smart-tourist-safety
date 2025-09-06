// server/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
// --- IMPORT YOUR NEW ROUTES ---
import touristRoutes from './routes/touristRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Smart Tourist Safety API is running!');
});

// --- TELL THE APP TO USE THEM ---
// Any request starting with /api/tourists will be handled by touristRoutes
app.use('/api/tourists', touristRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});