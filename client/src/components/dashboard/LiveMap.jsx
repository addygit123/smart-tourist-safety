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
    <Marker position={[tourist.location.lat, tourist.location.lng]} icon={icons[tourist.status] || icons['Safe']} eventHandlers={{ click: handleMarkerClick }}>
      <Popup>
        <b>{tourist.name}</b><br />
        Status: {tourist.status}<br /><br />
        <b>Location:</b><br />
        {address}
        <br /><br />
        <button 
          onClick={() => onShowTrail(tourist.locationHistory)}
          className="bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded hover:bg-blue-700 w-full"
        >
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
          <TouristMarker key={tourist.id} tourist={tourist} onShowTrail={handleShowTrail} />
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