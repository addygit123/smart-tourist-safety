import React from 'react';
import AlertCard from './AlertCard'; // It uses the "brick" we just made

const AlertsFeed = ({ alerts }) => {
    return (
        <div className="bg-slate-800 p-4 rounded-lg flex flex-col h-full">
            <h3 className="font-bold mb-4 text-white">Live Alerts</h3>
            <div className="flex flex-col gap-3 overflow-y-auto">
                {/* --- SAFETY NET --- */}
                {/* We check if the 'alerts' array exists and has items before trying to loop */}
                {alerts && alerts.length > 0 ? (
                    alerts.map(alert => (
                        // We use the unique database ID for the key to prevent warnings
                        <AlertCard key={alert._id} alert={alert} />
                    ))
                ) : (
                    <p className="text-slate-400 italic">No active alerts.</p>
                )}
            </div>
        </div>
    );
};

export default AlertsFeed;