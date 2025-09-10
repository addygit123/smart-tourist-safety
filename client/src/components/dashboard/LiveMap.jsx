import React, { useState,useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline ,Circle} from 'react-leaflet';
import L from 'leaflet';
import PolylineDecorator from './PolylineDecorator'; // <-- Import our new component

// The icon creation logic remains exactly the same.
const customIconStyles = `
  .pulsing-alert { animation: pulse 1.5s infinite ease-in-out; }
  .map-icon-shadow { filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.6)); }
  @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
`;
const createIcon = (color, isAlert = false) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36px" height="36px"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${color}" stroke="white" stroke-width="1.5"/></svg>`;
  const animationClass = isAlert ? 'pulsing-alert' : '';
  return new L.DivIcon({ html: `<div class="map-icon-shadow ${animationClass}">${svg}</div>`, className: '', iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36] });
};
const icons = { Safe: createIcon('#3182CE'), Anomaly: createIcon('#DD6B20'), Alert: createIcon('#E53E3E', true) };

// --- NEW: A dedicated component for showing device status icons ---

const DeviceStatusIcons = ({ status }) => {
    // --- THE FIX: The Safety Net ---
    // If for any reason the status object doesn't exist,
    // this component will now render nothing instead of crashing the app.
    if (!status) {
        return null; 
    }

    const getBatteryColor = (level) => {
        if (level < 20) return '#E53E3E'; // Red
        if (level < 50) return '#DD6B20'; // Orange
        return '#38A169'; // Green
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            {/* Battery Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 5H7C5.89543 5 5 5.89543 5 7V17C5 18.1046 5.89543 19 7 19H17C18.1046 19 19 18.1046 19 17V7C19 5.89543 18.1046 5 17 5Z" stroke="#A0AEC0" strokeWidth="2"/>
                    <rect x="7" y="7" width="10" height="10" rx="1" 
                        fill={getBatteryColor(status.battery)} 
                        style={{ transform: `scaleX(${status.battery / 100})`, transformOrigin: 'left' }} 
                    />
                    <path d="M21 9V15" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: '12px', color: '#000000ff' }}>{Math.round(status.battery)}%</span>
            </div>
            {/* Network Icon */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '16px' }}>
                {[1, 2, 3, 4].map(bar => (
                    <div key={bar} style={{ width: '4px', height: `${bar * 4}px`, backgroundColor: status.network >= bar ? '#38A169' : '#4A5568', borderRadius: '1px' }}></div>
                ))}
            </div>
        </div>
    );
};


// This is our smarter marker component.
const TouristMarker = ({ tourist, onShowTrail }) => {
  const [address, setAddress] = useState('Click to find nearest landmark...');
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkerClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setAddress('Finding nearest landmark...');
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${tourist.location.lat}&lon=${tourist.location.lng}`);
      const data = await response.json();
      setAddress(data?.display_name || 'Address not found.');
    } catch (error) {
      setAddress('Could not fetch address.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Marker position={[tourist.location.lat, tourist.location.lng]} icon={icons[tourist.status] || icons['Safe']} eventHandlers={{click: handleMarkerClick }}>
      <Popup>
        <b>{tourist.name}</b><br />
        Status: {tourist.status}<br />
        <hr style={{ borderTop: '1px solid #4A5568', margin: '8px 0' }} />
        <b>Location:</b><br />
        {address}
        {/* --- NEW: Display the device status icons --- */}
        <DeviceStatusIcons status={tourist.deviceStatus} />
        <br />
        <button onClick={() => onShowTrail(tourist.locationHistory)} 
    // --- THIS IS THE FIX ---
    // The button will be grayed out if there's no history to show.
    disabled={!tourist.locationHistory || tourist.locationHistory.length < 2}
    className="bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded hover:bg-blue-700 w-full">
          Show Recent Trail
        </button>
      </Popup>
    </Marker>
  );
};


// The main LiveMap component.
const LiveMap = ({ tourists }) => {
  const mapCenter = [23.1815, 79.9864];
  const [activeTrail, setActiveTrail] = useState(null);

  // --- NEW: State to hold the geo-fence data ---
  const [fences, setFences] = useState([]);

  useEffect(() => {
    const fetchFences = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/geofences');
            const data = await response.json();
            setFences(data);
        } catch (error) {
            console.error("Failed to fetch geo-fences:", error);
        }
    };
    fetchFences();
  }, []); // The empty array ensures this runs only once.

  const handleShowTrail = (trailData) => {
    // If the same trail is clicked again, hide it.
    if (activeTrail === trailData) {
      setActiveTrail(null);
    } else {
      setActiveTrail(trailData);
    }
  };

   // Define visual options for the high-risk zones
  const dangerZoneOptions = {
      fillColor: '#E53E3E', // Red
      color: '#E53E3E',
      fillOpacity: 0.2,
      weight: 1,
  };

  return (
    <>
      <style>{customIconStyles}</style>
      <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '8px' }}>
        <TileLayer url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}" subdomains={['mt0', 'mt1', 'mt2', 'mt3']} attribution='&copy; Google Maps' />
        
        {tourists.map(tourist => (
          <TouristMarker key={tourist._id} tourist={tourist} onShowTrail={handleShowTrail} />
        ))}

        {/* --- UPGRADED TRAIL WITH ARROWS --- */}
        {activeTrail && (
          <>
            {/* 1. Draw the main path line */}
            <Polyline positions={activeTrail} color="#00A3FF" weight={5} opacity={0.8} />
            {/* 2. Draw the arrows on top of the line */}
            <PolylineDecorator positions={activeTrail} />
          </>
        )}
        {/* --- NEW: Render the geo-fences on the map --- */}
        {fences.map(fence => (
            <Circle 
                key={fence.id}
                center={[fence.center.lat, fence.center.lng]}
                radius={fence.radius}
                pathOptions={dangerZoneOptions}
            >
                <Popup><b>{fence.name}</b><br/>High-Risk Zone</Popup>
            </Circle>
        ))}
      </MapContainer>
    </>
  );
};

export default LiveMap;