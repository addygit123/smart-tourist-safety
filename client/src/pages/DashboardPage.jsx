    import React, { useEffect, useState } from 'react'; // <-- Import useState
    import io from 'socket.io-client';

    const StatsCard = ({ title, value, color }) => ( <div className="bg-slate-800 p-4 rounded-lg shadow-md"><h3 className="text-sm font-medium text-slate-400">{title}</h3><p className={`text-3xl font-bold ${color}`}>{value}</p></div>);
    const AlertsFeedPlaceholder = () => ( <div className="bg-slate-800 p-4 rounded-lg flex-grow"><h3 className="font-bold mb-4 text-white">Live Alerts</h3><div className="text-slate-400 italic">Component being built by Suraj...</div></div>);
    const MapPlaceholder = () => ( <div className="bg-slate-800 rounded-lg flex-grow flex items-center justify-center border border-slate-700"><p className="text-slate-500 text-2xl font-semibold">Live Map Area</p></div>);

    const DashboardPage = () => {
      // Create a state to hold the live tourist data
      const [tourists, setTourists] = useState([]);

      useEffect(() => {
        const socket = io('http://localhost:5000');

        socket.on('connect', () => {
          console.log('✅ Connected to real-time server!', socket.id);
        });

        // --- THE LISTENER ---
        // Listen for the 'touristUpdate' event from the server
        socket.on('touristUpdate', (data) => {
          console.log('Received tourist update:', data);
          // Update our component's state with the new data
          setTourists(data);
        });

        return () => {
          socket.disconnect();
        };
      }, []);

      return (
        <div className="bg-slate-900 text-white min-h-screen flex flex-col font-sans">
          <header className="bg-slate-800/70 backdrop-blur-sm border-b border-slate-700 p-4 flex justify-between items-center sticky top-0 z-10">
            <h1 className="text-xl font-bold">Tourist Safety Command Center</h1>
            {/* Display the live number of tourists to prove our connection works! */}
            <p className="text-sm text-slate-300">Tracking: {tourists.length} Tourists</p>
          </header>
          
          <main className="flex-grow flex p-4 gap-4 overflow-hidden">
            <div className="flex-[3] flex flex-col gap-4">
              {/* Make the StatsCards dynamic */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard title="Total Tourists" value={tourists.length} color="text-blue-400" />
                <StatsCard title="Anomalies Detected" value={tourists.filter(t => t.status === 'Anomaly').length} color="text-orange-400" />
                <StatsCard title="Active Alerts (SOS)" value={tourists.filter(t => t.status === 'Alert').length} color="text-red-500" />
              </div>
              <MapPlaceholder />
            </div>
            <div className="flex-[1] flex flex-col gap-4">
              <AlertsFeedPlaceholder />
            </div>
          </main>
        </div>
      );
    };

    export default DashboardPage;
    

