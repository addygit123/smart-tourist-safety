import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import LiveMap from '../components/dashboard/LiveMap';

// --- We are now importing Suraj's final, polished components ---
// NOTE: Double-check that the filenames are correct (e.g., 'StatisticCard.jsx' vs 'StatsCard.jsx')
import StatsCard from '../components/dashboard/StatisticsCard'; 
import AlertCard from '../components/dashboard/AlertCard';

// --- The Main Page Component ---
const DashboardPage = () => {
  // This state will hold the live tourist data received from the server
  const [tourists, setTourists] = useState([]);

  // This hook runs once when the page loads to set up our real-time connection
  useEffect(() => {
    // Connect to our backend server
    const socket = io('http://localhost:5000');
    
    // This is the temporary backdoor for testing from the console. It's correct.
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
    return () => {
      socket.disconnect();
      delete window.socket; // Clean up our temporary backdoor
    };
  }, []); // The empty array [] tells React to only run this effect once



  // We filter the live data to get only the tourists with active alerts.
  const activeAlerts = tourists.filter(t => t.status === 'Alert' || t.status === 'Anomaly');

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

          {/* FIX #1: We are now using the IMPORTED StatsCard component */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard title="Total Tourists" value={tourists.length} color="text-blue-400" />
            <StatsCard title="Anomalies Detected" value={activeAlerts.filter(t => t.status === 'Anomaly').length} color="text-orange-400" />
            <StatsCard title="Active Alerts (SOS)" value={activeAlerts.filter(t => t.status === 'Alert').length} color="text-red-500" />
          </div>
          
          <div className="flex-grow rounded-lg overflow-hidden">
            <LiveMap tourists={tourists} />
          </div>
        </div>

        {/* Right Column (Alerts) */}
        <div className="flex-[1] flex flex-col gap-4">

          {/* FIX #2: We are now using the IMPORTED AlertsFeed component */}
          <AlertCard alerts={activeAlerts} />

        </div>
      </main>
    </div>
  );
};

export default DashboardPage;