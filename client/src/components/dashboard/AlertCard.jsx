import React from 'react';
import { useSocket } from '../../hooks/useSocket';

const AlertCard = ({ alert }) => {
    // This hook safely gets the socket instance we created in App.jsx
    const socket = useSocket();

    // This function will be called when an official clicks a button.
    const handleStatusUpdate = (newStatus) => {
        // Safety check to make sure the socket is connected before sending a message.
        if (socket) {
            console.log(`Sending status update for ${alert.touristId} to ${newStatus}`);
            // We emit the 'updateStatus' message that our backend is listening for.
            socket.emit('updateStatus', {
                touristId: alert.touristId,
                newStatus: newStatus
            });
        }
    };
    // --- SAFETY NET ---
    // If for any reason the alert object is invalid, this component
    // will render nothing instead of crashing the entire application.
    if (!alert || !alert.status) {
        return null;
    }

    const isSos = alert.status === 'Alert';
    const bgColor = isSos ? 'bg-red-500/10 border-red-500/30' : 'bg-orange-500/10 border-orange-500/30';
    const textColor = isSos ? 'text-red-400' : 'text-orange-400';

    return (
        <div className={`p-3 rounded-lg border ${bgColor} flex flex-col gap-2`}>
            <div>
                <h4 className={`font-bold ${textColor}`}>{isSos ? 'PANIC ALERT' : 'ANOMALY DETECTED'}</h4>
                <p className="text-sm text-white font-semibold">{alert.name}</p>
                <p className="text-xs text-slate-400">ID: {alert.touristId}</p>
            </div>
            {/* --- THIS IS THE NEW PART: The Action Buttons --- */}
            <div className="flex items-center gap-2 mt-2 border-t border-slate-700 pt-2">
                <button 
                    onClick={() => handleStatusUpdate('Investigating')}
                    className="flex-1 text-xs bg-yellow-500/20 text-yellow-400 py-1 px-2 rounded hover:bg-yellow-500/40 transition-colors"
                >
                    Acknowledge
                </button>
                <button 
                    onClick={() => handleStatusUpdate('Safe')} // We resolve by setting them back to 'Safe'
                    className="flex-1 text-xs bg-green-500/20 text-green-400 py-1 px-2 rounded hover:bg-green-500/40 transition-colors"
                >
                    Resolve
                </button>
            </div>
        </div>
    );
};

export default AlertCard;