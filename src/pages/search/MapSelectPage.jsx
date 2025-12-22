import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MapSelector from '../../components/address/MapSelector';
import { Button, Box } from '@mui/material';
import './MapSelectPage.css';

const MapSelectPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // Get LocationIQ key from environment
  const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_KEY || '';
  
  // Get initial coordinates from query params if available
  const params = new URLSearchParams(location.search);
  const initialLat = parseFloat(params.get('lat')) || 23.8103;
  const initialLon = parseFloat(params.get('lon')) || 90.4125;

  const handleLocationSelect = (locationData) => {
    setSelectedLocation(locationData);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      // Navigate back to search with the selected location
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('lat', selectedLocation.lat);
      searchParams.set('lon', selectedLocation.lon);
      searchParams.set('location', selectedLocation.display_name);
      searchParams.set('fromMapSelect', 'true');
      
      navigate(`/search/queries?${searchParams.toString()}`);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="map-select-page">
      <MapSelector
        onSelect={handleLocationSelect}
        initialLat={initialLat}
        initialLon={initialLon}
        apiKey={LOCATIONIQ_KEY}
      />
      
      <Box className="action-buttons">
        <Button
          variant="outlined"
          onClick={handleCancel}
          className="cancel-btn"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!selectedLocation}
          className="confirm-btn"
        >
          Confirm Location
        </Button>
      </Box>
    </div>
  );
};

export default MapSelectPage;
