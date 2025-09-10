import React, { useState } from 'react';

const RegisterTouristModal = ({ isOpen, onClose, onRegister }) => {
  const [formData, setFormData] = useState({ name: '', passportId: '', nationality: '', touristPhone: '', emergencyContactName: '', emergencyContactPhone: '' ,
    // --- THIS IS THE FIX: We add the new fields to the form's state ---
    pnr: '',
    travelNumber: ''});
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); onRegister(formData); };

  if (!isOpen) return null;

  return (
    // --- THE FIX ---
    // The z-50 class gives this a high stacking order (Layer 50).
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-2xl border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Register New Tourist</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required className="bg-slate-700 p-3 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input name="passportId" value={formData.passportId} onChange={handleChange} placeholder="Passport / Aadhaar No." required className="bg-slate-700 p-3 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input name="nationality" value={formData.nationality} onChange={handleChange} placeholder="Nationality" required className="bg-slate-700 p-3 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input name="touristPhone" type="tel" value={formData.touristPhone} onChange={handleChange} placeholder="Tourist's Phone (+91...)" required className="bg-slate-700 p-3 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} placeholder="Emergency Contact Name" required className="bg-slate-700 p-3 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input name="emergencyContactPhone" type="tel" value={formData.emergencyContactPhone} onChange={handleChange} placeholder="Emergency Contact Phone" required className="bg-slate-700 p-3 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {/* --- THIS IS THE FIX: We add the new input fields to the form --- */}
            <input 
              name="pnr" 
              value={formData.pnr} 
              onChange={handleChange} 
              placeholder="PNR / Booking ID (Optional)" 
              className="bg-slate-700 p-3 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              name="travelNumber" 
              value={formData.travelNumber} 
              onChange={handleChange} 
              placeholder="Flight / Train / Bus No. (Optional)" 
              className="bg-slate-700 p-3 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={onClose} className="py-2 px-5 bg-slate-600 rounded hover:bg-slate-700 text-white font-semibold transition-colors">Cancel</button>
            <button type="submit" className="py-2 px-5 bg-blue-600 rounded hover:bg-blue-700 text-white font-semibold transition-colors">Register Tourist</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterTouristModal;