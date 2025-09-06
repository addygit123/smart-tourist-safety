import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// The customIconStyles and createIcon logic remain exactly the same.
const customIconStyles = `
  .pulsing-alert { animation: pulse 1.5s infinite ease-in-out; }
  .map-icon-shadow { filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.6)); }
  @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
`;
const createIcon = (color, isAlert = false) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36px" height="36px"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${color}" stroke="white" stroke-width="1.5"/></svg>`;
  const animationClass = isAlert ? 'pulsing-alert' : '';
  return new L.DivIcon({
    html: `<div class="map-icon-shadow ${animationClass}">${svg}</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};
const icons = {
  Safe: createIcon('#3182CE'),
  Anomaly: createIcon('#DD6B20'),
  Alert: createIcon('#E53E3E', true)
};


// --- THIS IS OUR NEW, SMARTER MARKER COMPONENT ---
const TouristMarker = ({ tourist }) => {
  // Each marker now manages its own address state.
  const [address, setAddress] = useState('Click to find nearest landmark...');
  const [isLoading, setIsLoading] = useState(false);

  // This function is called when the marker is clicked.
  const handleMarkerClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setAddress('Finding nearest landmark...');

    try {
      // Fetch data from the OpenStreetMap (Nominatim) reverse geocoding API.
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${tourist.location.lat}&lon=${tourist.location.lng}`);
      const data = await response.json();

      // The 'display_name' field usually has the most useful address.
      if (data && data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress('Address not found.');
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      setAddress('Could not fetch address.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Marker
      position={[tourist.location.lat, tourist.location.lng]}
      icon={icons[tourist.status] || icons['Safe']}
      eventHandlers={{
        click: handleMarkerClick, // We attach our function to the click event.
      }}
    >
      <Popup>
        <b>{tourist.name}</b><br />
        Status: {tourist.status}<br /><br />
        <b>Location:</b><br />
        {address}
      </Popup>
    </Marker>
  );
};


// --- The Main LiveMap Component ---
const LiveMap = ({ tourists }) => {
  const mapCenter = [23.1815, 79.9864];

  return (
    <>
      <style>{customIconStyles}</style>
      <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '8px' }}>
        <TileLayer
          url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
        />
        
        {/* We now map over our new, smarter TouristMarker component */}
        {tourists.map(tourist => (
          <TouristMarker key={tourist.id} tourist={tourist} />
        ))}
      </MapContainer>
    </>
  );
};

export default LiveMap;