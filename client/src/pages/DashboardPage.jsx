import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import LiveMap from '../components/dashboard/LiveMap'; // We import the real map

// --- Reusable Components ---
const StatsCard = ({ title, value, color }) => (
  <div className="bg-slate-800 p-4 rounded-lg shadow-md">
    <h3 className="text-sm font-medium text-slate-400">{title}</h3>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

const AlertsFeedPlaceholder = () => (
    <div className="bg-slate-800 p-4 rounded-lg flex-grow">
        <h3 className="font-bold mb-4 text-white">Live Alerts</h3>
        <div className="text-slate-400 italic">Component being built by Suraj...</div>
    </div>
);

// --- The Main Page Component ---
const DashboardPage = () => {
  // This state will hold the live tourist data received from the server
  const [tourists, setTourists] = useState([]);

  // This hook runs once when the page loads to set up our real-time connection
  useEffect(() => {
    
    // Connect to our backend server
    const socket = io('http://localhost:5000');
    // --- THIS IS THE FIX ---
    // We are temporarily attaching the socket to the global window object
    // so we can access it from the browser's developer console for testing.
    window.socket = socket;

    socket.on('connect', () => {
      console.log('✅ Connected to real-time server!', socket.id);
    });

    // Listen for the 'touristUpdate' event from the server
    socket.on('touristUpdate', (dataFromServer) => {
      // When we get new data, we update our component's state
      setTourists(dataFromServer);
    });

    // This is a cleanup function that runs when the page is closed
    // It's important for preventing memory leaks
    return () => {
      socket.disconnect();
      delete window.socket; // Clean up our temporary backdoor
    };
  }, []); // The empty array [] tells React to only run this effect once

  return (
    <div className="bg-slate-900 text-white min-h-screen flex flex-col font-sans">
      {/* --- Header --- */}
      <header className="bg-slate-800/70 backdrop-blur-sm border-b border-slate-700 p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold">Tourist Safety Command Center</h1>
        <p className="text-sm text-slate-300">Tracking: {tourists.length} Tourists</p>
      </header>
      
      {/* --- Main Content --- */}
      <main className="flex-grow flex p-4 gap-4 overflow-hidden">
        
        {/* Left Column (Map & Stats) */}
        <div className="flex-[3] flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* These cards are now powered by the live 'tourists' state! */}
            <StatsCard title="Total Tourists" value={tourists.length} color="text-blue-400" />
            <StatsCard title="Anomalies Detected" value={tourists.filter(t => t.status === 'Anomaly').length} color="text-orange-400" />
            <StatsCard title="Active Alerts (SOS)" value={tourists.filter(t => t.status === 'Alert').length} color="text-red-500" />
          </div>
          
          {/* We replace the old placeholder with the real, live map component */}
          <div className="flex-grow rounded-lg overflow-hidden">
            <LiveMap tourists={tourists} />
          </div>

        </div>

        {/* Right Column (Alerts) */}
        <div className="flex-[1] flex flex-col gap-4">
          <AlertsFeedPlaceholder />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;