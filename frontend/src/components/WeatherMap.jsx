import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FaLayerGroup, FaWind, FaTemperatureHigh, FaCloud, FaTint, FaFire } from 'react-icons/fa';
// Import Leaflet CSS directly from CDN to avoid build issues
import './WeatherMap.css'; // Import the CSS styles

const WeatherMap = ({ savedCities = [], defaultCity, weatherTheme }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [activeLayers, setActiveLayers] = useState({
    wind: false,
    temperature: true, // Set temperature as default active layer
    clouds: false,
    precipitation: false,
    thermal: false
  });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  
  // These will be created when the map initializes
  const layerRefs = useRef({
    wind: null,
    temperature: null,
    clouds: null,
    precipitation: null,
    thermal: null
  });

  // Fix Leaflet icon path issues
  useEffect(() => {
    // Add Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(link);

    // Clean up
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);
  
  useEffect(() => {
    // This code will run after the component mounts
    const initializeMap = () => {
      try {
        // Dynamically load Leaflet
        const L = window.L;
        if (!L) {
          console.error('Leaflet not loaded');
          return;
        }

        // Fix Leaflet icon path issues
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        });
        
        // If map already exists, clean it up
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }
        
        // Initialize the map with a darker style for better contrast with temperature colors
        const map = L.map(mapRef.current, {
          center: [20, 78], // Center on India by default
          zoom: 4,
          zoomControl: true,
          attributionControl: true
        });
        
        mapInstanceRef.current = map;
        
        // Add a dark base map with high contrast
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20,
          detectRetina: true
        }).addTo(map);
        
        // Add high-contrast labels
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20,
          detectRetina: true
        }).addTo(map);
        
        // Create weather tile layers (but don't add them to the map yet)
        // Hardcode the API key for testing
        const apiKey = 'd4902e6d1e25156458d8bb43c167d3c0';
        console.log('Using API key:', apiKey);
        
        // Create custom temperature layer with higher opacity and custom styling
        layerRefs.current = {
          wind: L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
            attribution: '&copy; OpenWeatherMap',
            opacity: 0.8
          }),
          temperature: L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
            attribution: '&copy; OpenWeatherMap',
            opacity: 0.85, // Slightly reduced for better text visibility
            className: 'temperature-layer', // Custom class for styling
            pane: 'tilePane' // Ensure it's in the correct pane
          }),
          clouds: L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
            attribution: '&copy; OpenWeatherMap',
            opacity: 0.7
          }),
          precipitation: L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
            attribution: '&copy; OpenWeatherMap',
            opacity: 0.7
          }),
          thermal: L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
            attribution: '&copy; OpenWeatherMap',
            opacity: 0.9,
            className: 'thermal-layer' // We'll add a CSS filter to make it look different
          })
        };
        
        // Add temperature layer by default to match the example image
        layerRefs.current.temperature.addTo(map);
        
        // Add markers for saved cities
        const markers = [];
        savedCities.forEach(city => {
          if (city.lat && city.lon) {
            const marker = L.marker([city.lat, city.lon])
              .addTo(map)
              .bindPopup(`
                <div class="city-popup">
                  <h3>${city.name}, ${city.country}</h3>
                  ${city.weather ? `
                    <div class="weather-info">
                      <p>${Math.round(city.weather.main.temp)}°C</p>
                      <p>${city.weather.weather[0].description}</p>
                    </div>
                  ` : ''}
                </div>
              `);
            
            // Highlight default city marker
            if (defaultCity === city.name) {
              marker.setIcon(L.divIcon({
                className: 'default-city-marker',
                html: `<div class="marker-icon default"></div>`,
                iconSize: [25, 41],
                iconAnchor: [12, 41]
              }));
            }
            
            markers.push(marker);
          }
        });
        
        // If we have cities, fit the map to show all of them
        if (markers.length > 0) {
          const group = L.featureGroup(markers);
          map.fitBounds(group.getBounds().pad(0.5)); // Add some padding
        } else {
          // If no cities, center on India (like in the example image)
          map.setView([20, 78], 4);
        }
        
        // Add a scale control
        L.control.scale().addTo(map);
        
        setMapLoaded(true);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };
    
    // Load Leaflet from CDN
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
    script.integrity = 'sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==';
    script.crossOrigin = '';
    script.onload = () => {
      // Initialize map with a small delay to ensure DOM is ready
      setTimeout(() => {
        if (mapRef.current) {
          initializeMap();
        }
      }, 100);
    };
    document.head.appendChild(script);
    
    // Cleanup function
    return () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [savedCities, defaultCity]); // Re-initialize when cities or default city changes
  
  // Toggle weather layers when activeLayers state changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || !window.L) return;
    console.log('Updating active layers:', activeLayers);
    
    // For each layer, add or remove based on active state
    Object.entries(activeLayers).forEach(([layerName, isActive]) => {
      const layer = layerRefs.current[layerName];
      if (!layer) {
        console.warn(`Layer ${layerName} not found in refs`);
        return;
      }
      
      console.log(`${layerName}: ${isActive ? 'adding' : 'removing'}`);
      if (isActive) {
        layer.addTo(mapInstanceRef.current);
      } else {
        layer.remove();
      }
    });
  }, [activeLayers, mapLoaded]);
  
  // Toggle layer visibility
  const toggleLayer = (layerName) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
    
    // Force a small delay and then invalidate the map size to ensure proper rendering
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize({ animate: true });
      }, 100);
    }
  };
  
  // Center map on a specific city
  const centerOnCity = (city) => {
    if (!mapInstanceRef.current || !city.lat || !city.lon) return;
    
    mapInstanceRef.current.setView([city.lat, city.lon], 10, {
      animate: true,
      duration: 1
    });
  };
  
  return (
    <motion.div 
      className="relative w-full rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-[50vh] md:h-[60vh] z-10"
        style={{ background: '#1e2124' }} // Darker background before map loads
      />
      
      {/* Layer Toggle Panel */}
      <motion.div 
        className={`absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-2 ${showLayerPanel ? 'w-auto' : 'w-10'}`}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className={`p-2 rounded-full ${weatherTheme?.accent || 'text-blue-500'} hover:bg-gray-100`}
            title="Toggle Layer Panel"
          >
            <FaLayerGroup />
          </button>
          {showLayerPanel && <span className="ml-2 font-medium text-sm">Weather Layers</span>}
        </div>
        
        {showLayerPanel && (
          <div className="space-y-2">
            <LayerToggle 
              active={activeLayers.wind}
              onClick={() => toggleLayer('wind')}
              icon={<FaWind />}
              label="Wind"
              theme={weatherTheme}
            />
            
            <LayerToggle 
              active={activeLayers.temperature}
              onClick={() => toggleLayer('temperature')}
              icon={<FaTemperatureHigh />}
              label="Temperature"
              theme={weatherTheme}
            />
            
            <LayerToggle 
              active={activeLayers.clouds}
              onClick={() => toggleLayer('clouds')}
              icon={<FaCloud />}
              label="Clouds"
              theme={weatherTheme}
            />
            
            <LayerToggle 
              active={activeLayers.precipitation}
              onClick={() => toggleLayer('precipitation')}
              icon={<FaTint />}
              label="Precipitation"
              theme={weatherTheme}
            />
            
            <LayerToggle 
              active={activeLayers.thermal}
              onClick={() => toggleLayer('thermal')}
              icon={<FaFire />}
              label="Thermal"
              theme={weatherTheme}
            />
          </div>
        )}
      </motion.div>
      
      {/* City Quick Access (Optional) */}
      {savedCities.length > 0 && (
        <motion.div 
          className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-2 max-w-[70%] overflow-x-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex space-x-2">
            {savedCities.map(city => (
              <button
                key={`map-btn-${city.name}`}
                onClick={() => centerOnCity(city)}
                className={`px-3 py-1 text-xs rounded-full whitespace-nowrap
                  ${defaultCity === city.name 
                    ? 'bg-yellow-400 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Loading Indicator */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
          <motion.div 
            className="h-10 w-10 rounded-full border-t-2 border-b-2 border-blue-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}
    </motion.div>
  );
};

// Layer toggle button component
const LayerToggle = ({ active, onClick, icon, label, theme }) => {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${active 
        ? `${theme?.highlight || 'bg-blue-500'} text-white` 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
    >
      <span className="mr-2">{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
};

export default WeatherMap;
