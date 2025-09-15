import express from "express";
import crypto from 'crypto';
import fs from 'fs/promises';
import cors from 'cors'; // Import cors

const app = express();
app.use(cors()); // Use cors to allow requests from our main server
app.use(express.json());
const PORT = 5001; // Runs on a different port than our main server

// Helper function to create a SHA256 hash
const createHash = (data) => {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
};

// This is the main endpoint our server will call
app.post('/createID', async (req, res) => {
    try {
        const { name, passportId } = req.body;
        
        const ledgerData = await fs.readFile('database.json', 'utf-8');
        const ledger = JSON.parse(ledgerData);
        
        const previousHash = ledger.length > 0 ? ledger[ledger.length - 1].hash : '0';

        const newRecord = {
            touristId: `STS-${Date.now()}`,
            data: { name, passportId },
            timestamp: new Date().toISOString(),
            previousHash,
        };

        newRecord.hash = createHash(newRecord);
        ledger.push(newRecord);
        await fs.writeFile('database.json', JSON.stringify(ledger, null, 2));

        console.log(`✅ Mockchain: Generated ID ${newRecord.touristId}`);

        res.status(201).json({
            touristId: newRecord.touristId,
            verificationHash: newRecord.hash,
        });

    } catch (error) {
        console.error("Mockchain Error:", error);
        res.status(500).json({ message: 'Error generating ID' });
    }
});

app.listen(PORT, () => console.log(`🔗 Mockchain service running on port ${PORT}`));