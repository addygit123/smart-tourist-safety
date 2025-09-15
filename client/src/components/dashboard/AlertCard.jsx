import React from 'react';
import { useSocket } from '../../hooks/useSocket';

const AlertCard = ({ alert }) => {
    const socket = useSocket();

    const handleStatusUpdate = (newStatus) => {
        if (socket && alert?.touristId) {
            socket.emit('updateStatus', {
                touristId: alert.touristId,
                newStatus: newStatus
            });
        }
    };

    // --- Safety Net ---
    // This also now correctly filters out tourists that are no longer in an active alert state.
    if (!alert || !alert.status || alert.status === 'Safe' || alert.status === 'Resolved') {
        return null;
    }

    const isSos = alert.status === 'Alert';
    const isInvestigating = alert.status === 'Investigating';
    
    // Determine card color and text based on the current status
    let bgColor = 'bg-orange-500/10 border-orange-500/30';
    let textColor = 'text-orange-400';
    if (isSos) {
        bgColor = 'bg-red-500/10 border-red-500/30';
        textColor = 'text-red-400';
    } else if (isInvestigating) {
        bgColor = 'bg-yellow-500/10 border-yellow-500/30';
        textColor = 'text-yellow-400';
    }

    return (
        <div className={`p-3 rounded-lg border ${bgColor} flex flex-col gap-2`}>
            <div>
                <h4 className={`font-bold ${textColor}`}>{alert.status.toUpperCase()}</h4>
                <p className="text-sm text-white font-semibold">{alert.name}</p>
            </div>
            
            {/* --- THIS IS THE FIX: The buttons now change based on the status --- */}
            <div className="flex items-center gap-2 mt-2 border-t border-slate-700 pt-2">
                {/* The "Acknowledge" button ONLY shows if the alert is new. */}
                {alert.status !== 'Investigating' && (
                    <button 
                        onClick={() => handleStatusUpdate('Investigating')}
                        className="flex-1 text-xs bg-yellow-500/20 text-yellow-400 py-1 px-2 rounded hover:bg-yellow-500/40"
                    >
                        Acknowledge
                    </button>
                )}
                {/* The "Resolve" button is always there to close the case. */}
                <button 
                    onClick={() => handleStatusUpdate('Resolved')} // We resolve by setting them back to 'Safe'
                    className="flex-1 text-xs bg-green-500/20 text-green-400 py-1 px-2 rounded hover:bg-green-500/40"
                >
                    Resolve
                </button>
            </div>
        </div>
    );
};

export default AlertCard;