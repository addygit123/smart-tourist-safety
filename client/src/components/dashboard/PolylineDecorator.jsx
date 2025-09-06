import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import 'leaflet-polylinedecorator';
import L from 'leaflet';

// This is a special component that "bridges" the gap between React and the Leaflet plugin.
const PolylineDecorator = ({ positions }) => {
  const map = useMap(); // This hook gives us access to the main map instance.

  useEffect(() => {
    if (!map || positions.length === 0) {
      return;
    }

    // Create a decorator layer with our arrow pattern.
    const decorator = L.polylineDecorator(positions, {
      patterns: [
        {
          offset: '15%', // Start drawing arrows 15% of the way down the line
          repeat: '80px', // Repeat an arrow every 80 pixels
          symbol: L.Symbol.arrowHead({
            pixelSize: 12,
            polygon: false,
            pathOptions: {
              stroke: true,
              weight: 2,
              color: '#FFFFFF', // A crisp white color for the arrows
              opacity: 1
            }
          })
        }
      ]
    });

    // Add the decorator to the map.
    decorator.addTo(map);

    // This is a cleanup function: when the trail disappears, we remove the arrows.
    return () => {
      map.removeLayer(decorator);
    };
  }, [map, positions]); // Rerun this effect if the map or positions change.

  return null; // This component doesn't render any visible HTML itself.
};

export default PolylineDecorator;