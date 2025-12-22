# Select on Map Feature - Implementation Guide

## Overview
A new "Select on Map" feature has been added to your GoCar application using LocationIQ and Leaflet maps. This allows users to visually select their pickup location on an interactive map.

## New Components & Files

### 1. **MapSelector Component**
**File:** `src/components/address/MapSelector.jsx`
- Interactive map component using Leaflet
- Click on map to select location
- Reverse geocoding with LocationIQ (converts coordinates to address)
- Displays selected location with marker and popup
- Props:
  - `onSelect` (function) - Callback when location is selected
  - `initialLat` (number) - Initial latitude (default: 23.8103)
  - `initialLon` (number) - Initial longitude (default: 90.4125)
  - `apiKey` (string) - LocationIQ API key for reverse geocoding

### 2. **MapSelectPage Component**
**File:** `src/pages/search/MapSelectPage.jsx`
- Full-page map selection interface
- Handles navigation and URL parameters
- Confirm/Cancel buttons
- Route: `/search/map-select`

### 3. **Styling**
- `src/components/address/MapSelector.css` - Map component styles
- `src/pages/search/MapSelectPage.css` - Page layout and button styles

## How It Works

1. **User Flow:**
   - User types in address search field
   - Sees autocomplete suggestions
   - Can click "📍 Select address on map" option
   - Opens interactive map at `/search/map-select`
   - Clicks on map to select location
   - Confirms selection, returns to search with selected coordinates

2. **Integration with SearchPage:**
   - SearchPage already has LocationIQ setup
   - Uses `VITE_LOCATIONIQ_KEY` environment variable
   - Selected location is passed via URL parameters:
     - `lat` - latitude
     - `lon` - longitude
     - `location` - display name

3. **AddressSearch Component Update:**
   - Added "Select address on map" option at top of suggestions
   - Navigates to map selection page with current search parameters
   - Preserves existing date/time parameters

## Usage

### Basic Setup
The feature is already integrated into your SearchPage. Users can access it by:

1. Going to the search page
2. Clicking the edit button next to the location field
3. Typing in the address search box
4. Selecting "📍 Select address on map" from the dropdown

### Features
- ✅ Interactive map with OpenStreetMap tiles
- ✅ Click to select location
- ✅ LocationIQ reverse geocoding (get address from coordinates)
- ✅ Automatic marker placement
- ✅ Address display in popup
- ✅ Responsive design (mobile & desktop)
- ✅ URL parameter preservation
- ✅ Confirm/Cancel functionality

## API Integration

### LocationIQ Setup
Make sure your `.env` file has:
```
VITE_LOCATIONIQ_KEY=your_locationiq_api_key
```

### API Endpoints Used
1. **Autocomplete** (in AddressSearch):
   ```
   https://us1.locationiq.com/v1/autocomplete.php
   ```
2. **Reverse Geocoding** (in MapSelector):
   ```
   https://us1.locationiq.com/v1/reverse.php
   ```

## Responsive Design
- Desktop: Full-screen map with side panels for header and footer
- Mobile: Map fills available space with stacked action buttons
- Breakpoint: 768px

## Browser Compatibility
- Modern browsers with fetch API support
- Leaflet 1.9.4+
- React 18.3+

## Future Enhancements
- Add route planning
- Add distance/duration display
- Add current location button
- Add location history
- Add favorite locations
- Add address autocomplete while map panning
- Support for multiple vehicle dropoff locations

## Troubleshooting

### Map not showing
- Verify `VITE_LOCATIONIQ_KEY` is set in `.env`
- Check browser console for errors
- Ensure Leaflet CSS is loaded

### Reverse geocoding not working
- Check LocationIQ API key is valid
- Verify API quota hasn't been exceeded
- Check browser network tab for failed requests

### Styling issues
- Ensure CSS files are imported
- Check Tailwind CSS is properly configured
- Verify MUI components are properly installed
