import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import PropTypes from 'prop-types';
import './MapSelector.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

// Component to handle map clicks
function MapClickHandler({ onLocationSelect, selectedLocation }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect({
        lat: lat.toString(),
        lon: lng.toString(),
        display_name: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      });
    },
  });
  return null;
}

const MapSelector = ({ onSelect, initialLat = 23.8103, initialLon = 90.4125, apiKey = '' }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);

  // Reverse geocode coordinates to get address using LocationIQ
  const reverseGeocodeLocation = async (lat, lon) => {
    if (!apiKey) return;
    
    setReverseGeocoding(true);
    try {
      const url = `https://us1.locationiq.com/v1/reverse.php?key=${encodeURIComponent(apiKey)}&lat=${lat}&lon=${lon}&format=json`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        return data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    } finally {
      setReverseGeocoding(false);
    }
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  };

  const handleLocationSelect = async (location) => {
    setSelectedLocation(location);
    
    // Try to get address name if LocationIQ key is available
    if (apiKey) {
      const displayName = await reverseGeocodeLocation(location.lat, location.lon);
      location.display_name = displayName;
    }
    
    onSelect(location);
  };

  return (
    <div className="map-selector-container">
      <div className="map-selector-header">
        <h3>Select Location on Map</h3>
        <p>Click on the map to select a pickup location</p>
      </div>
      
      <MapContainer 
        center={[parseFloat(initialLat), parseFloat(initialLon)]} 
        zoom={12} 
        className="map-selector"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        
        <MapClickHandler 
          onLocationSelect={handleLocationSelect}
          selectedLocation={selectedLocation}
        />
        
        {selectedLocation && (
          <Marker position={[parseFloat(selectedLocation.lat), parseFloat(selectedLocation.lon)]}>
            <Popup>
              <div className="marker-popup">
                <strong>{selectedLocation.display_name}</strong>
                <div className="coordinates">
                  {selectedLocation.lat}, {selectedLocation.lon}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <div className="map-selector-footer">
        {selectedLocation && (
          <div className="selected-info">
            <p>
              <strong>Selected Location:</strong><br />
              {selectedLocation.display_name}
            </p>
            {reverseGeocoding && <p className="loading">Loading address...</p>}
          </div>
        )}
      </div>
    </div>
  );
};

MapSelector.propTypes = {
  onSelect: PropTypes.func.isRequired,
  initialLat: PropTypes.number,
  initialLon: PropTypes.number,
  apiKey: PropTypes.string,
};

export default MapSelector;
