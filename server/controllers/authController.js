import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    const { officialId, name, password } = req.body;
    try {
        let user = await User.findOne({ officialId });
        if (user) {
            return res.status(400).json({ message: 'Official with this ID already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = new User({ officialId, name, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'Official registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration' });
    }
};

export const login = async (req, res) => {
    const { officialId, password } = req.body;
    try {
        const user = await User.findOne({ officialId });
        if (!user) {
            return res.status(404).json({ message: 'Official ID not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login' });
    }
};