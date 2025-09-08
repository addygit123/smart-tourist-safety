import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    officialId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Official' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;