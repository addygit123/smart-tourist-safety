import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';  
import LiveMap from '../components/dashboard/LiveMap';
import {useNavigate} from "react-router-dom";
// --- CORRECTED IMPORTS BASED ON YOUR FILENAMES ---
import StatsCard from '../components/dashboard/StatisticsCard'; 
import AlertsFeed from '../components/dashboard/AlertFeeds';
import RegisterTouristModal from '../components/dashboard/RegisterTouristModal';
import { API_URL } from '../context/Api';
import { Toaster, toast } from "react-hot-toast";


const DashboardPage = () => {
  const [tourists, setTourists] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchInitialTourists = async () => {
        try {
            const response = await fetch(`${API_URL}/api/tourists`);
            const data = await response.json();
            setTourists(data);
        } catch (error) { console.error("Failed to fetch initial tourists:", error); }
    };
    fetchInitialTourists();

     const socket = io(`${API_URL}`);


    
    // --- THIS IS THE FIX ---
    // We are temporarily attaching the socket to the global window object
    // so we can access it from the browser's developer console for testing.
    window.socket = socket;

    socket.on('connect', () => {
      console.log('✅ Connected to real-time server!', socket.id);
    });

    socket.on('touristUpdate', (updatedTourists) => {
      setTourists(updatedTourists);
    });

    // Cleanup function
    return () => {
      socket.disconnect();
      delete window.socket; // Clean up our temporary backdoor when the page closes
    };
  }, []);


  const handleRegisterTourist = async (formData) => {
    try {
        await fetch(`${API_URL}/api/tourists/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        setIsModalOpen(false);
    } catch (error) {
        console.error("Failed to register tourist:", error);
    }
  };

  // --- 3. THIS IS THE NEW LOGOUT FUNCTION ---
  const handleLogout = () => {
    // First, remove the authentication token from the browser's storage.
    localStorage.removeItem('authToken');
    // Then, redirect the user back to the login page.
    navigate('/login');
    toast.success("You have been logged out successfully.");
  };
  // --- END OF NEW FUNCTION ---

  const activeAlerts = tourists.filter(t => 
    t.status === 'Alert' || 
    t.status === 'Anomaly' || 
    t.status === 'Investigating'
  );

  return (
    <>
    <Toaster 
        position="top-right" 
        toastOptions={{ 
            style: { 
                background: '#334155', 
                color: '#f1f5f9' 
            } 
        }} 
      />
      <RegisterTouristModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRegister={handleRegisterTourist} />
      <div className="bg-slate-900 text-white min-h-screen flex flex-col font-sans">
        <header className="bg-slate-800/70 backdrop-blur-sm border-b border-slate-700 p-4 flex justify-between items-center sticky top-0 z-20">
          <h1 className="text-xl font-bold">Tourist Safety Command Center</h1>
          
          <div className="flex items-center gap-4">
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
              + Register New Tourist
            </button>
            
            {/* --- 4. THIS IS THE NEW LOGOUT BUTTON --- */}
            <button 
              onClick={handleLogout} 
              className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-grow flex p-4 gap-4 overflow-hidden">
          <div className="flex-[3] flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard title="Total Tourists" value={tourists.length} color="text-blue-400" />
              <StatsCard title="Anomalies Detected" value={activeAlerts.filter(t => t.status === 'Anomaly').length} color="text-orange-400" />
              <StatsCard title="Active Alerts (SOS)" value={activeAlerts.filter(t => t.status === 'Alert').length} color="text-red-500" />
            </div>
            <div className="relative z-10 flex-grow rounded-lg overflow-hidden">
              <LiveMap tourists={tourists} />
            </div>
          </div>
          <div className="flex-[1] flex flex-col gap-4">
            <AlertsFeed alerts={activeAlerts} />
          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardPage;