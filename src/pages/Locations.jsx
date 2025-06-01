import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaStar, FaTrash, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiThunderstorm, WiFog } from 'react-icons/wi';
import SearchBar from '../components/SearchBar';
import WeatherMap from '../components/WeatherMap';
import { fetchWeatherByCity } from '../services/weatherService';
import { getThemeByWeather } from '../utils/weatherThemes';
import ErrorMessage from '../components/ErrorMessage';

const LocationsPage = ({ weatherTheme = {} }) => {
  const [savedCities, setSavedCities] = useState([]);
  const [defaultCity, setDefaultCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weatherData, setWeatherData] = useState({});
  const [showMap, setShowMap] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Use the theme from props with fallback to blue theme
  const locationsTheme = {
    bg: 'bg-gradient-to-br from-blue-100 to-blue-300',
    cardBg: 'bg-white/90',
    text: 'text-sky-900',
    secondaryText: 'text-sky-700',
    accent: 'text-sky-700',
    secondaryAccent: 'text-sky-600',
    border: 'border-sky-300',
    highlight: 'sky-200',
    shadow: 'rgba(191, 219, 254, 0.5)',
    icon: 'text-sky-600',
    ...weatherTheme // Spread the provided theme to override defaults
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  };

  const shimmerEffect = {
    hidden: { backgroundPosition: '200% 0' },
    visible: {
      backgroundPosition: '-200% 0',
      transition: {
        repeat: Infinity,
        duration: 3,
        ease: 'linear'
      }
    }
  };

  // Load saved cities from localStorage
  useEffect(() => {
    const loadSavedCities = async () => {
      const savedCitiesData = localStorage.getItem('savedCities');
      const defaultCityData = localStorage.getItem('defaultCity');
      
      if (savedCitiesData) {
        const cities = JSON.parse(savedCitiesData);
        setSavedCities(cities);
        
        // Fetch weather data for each city
        const weatherPromises = cities.map(city => fetchWeatherByCity(city.name));
        
        try {
          const weatherResults = await Promise.all(weatherPromises);
          const weatherMap = {};
          
          weatherResults.forEach((data, index) => {
            weatherMap[cities[index].name] = data;
          });
          
          setWeatherData(weatherMap);
        } catch (err) {
          console.error('Error fetching weather for saved cities:', err);
        }
      }
      
      if (defaultCityData) {
        setDefaultCity(defaultCityData);
      }
    };
    
    loadSavedCities();
    
    // Set up auto-refresh every 10 minutes
    const refreshInterval = setInterval(() => {
      loadSavedCities();
    }, 10 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  // Save cities to localStorage whenever the list changes
  useEffect(() => {
    if (savedCities.length > 0) {
      localStorage.setItem('savedCities', JSON.stringify(savedCities));
    }
  }, [savedCities]);
  
  // Save default city to localStorage
  useEffect(() => {
    if (defaultCity) {
      localStorage.setItem('defaultCity', defaultCity);
    }
  }, [defaultCity]);

  // Handle adding a new city
  const handleAddCity = async (cityName) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if city already exists in saved list
      if (savedCities.some(city => city.name.toLowerCase() === cityName.toLowerCase())) {
        setError(`${cityName} is already in your saved cities`);
        setLoading(false);
        return;
      }
      
      // Fetch weather data to verify city exists and get coordinates
      const data = await fetchWeatherByCity(cityName);
      
      // Add to saved cities
      const newCity = {
        name: data.name,
        country: data.sys.country,
        lat: data.coord.lat,
        lon: data.coord.lon,
        addedAt: new Date().toISOString()
      };
      
      setSavedCities(prev => [...prev, newCity]);
      
      // Add to weather data
      setWeatherData(prev => ({
        ...prev,
        [data.name]: data
      }));
      
      // If this is the first city, set as default
      if (savedCities.length === 0) {
        setDefaultCity(data.name);
      }
      
    } catch (err) {
      setError(`Could not find "${cityName}". Please check the city name and try again.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Set city as default
  const handleSetDefault = (cityName) => {
    setDefaultCity(cityName);
  };
  
  // Remove city from saved list
  const handleRemoveCity = (cityName) => {
    if (window.confirm(`Are you sure you want to remove ${cityName} from your saved cities?`)) {
      setSavedCities(prev => prev.filter(city => city.name !== cityName));
      
      // If removing the default city, set a new default if available
      if (defaultCity === cityName && savedCities.length > 1) {
        const newDefault = savedCities.find(city => city.name !== cityName);
        if (newDefault) setDefaultCity(newDefault.name);
      } else if (savedCities.length <= 1) {
        // If removing the last city, clear default
        setDefaultCity('');
      }
      
      // Remove from weather data
      const newWeatherData = { ...weatherData };
      delete newWeatherData[cityName];
      setWeatherData(newWeatherData);
    }
  };
  
  // View city on map
  const handleViewMap = (city) => {
    setSelectedCity(city);
    setShowMap(true);
  };
  
  // Get weather icon based on condition
  const getWeatherIcon = (condition) => {
    if (!condition) return <WiDaySunny className="text-4xl" />;
    
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
      return <WiDaySunny className="text-4xl" />;
    } else if (conditionLower.includes('rain') || conditionLower.includes('shower')) {
      return <WiRain className="text-4xl" />;
    } else if (conditionLower.includes('cloud')) {
      return <WiCloudy className="text-4xl" />;
    } else if (conditionLower.includes('snow') || conditionLower.includes('flurr')) {
      return <WiSnow className="text-4xl" />;
    } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
      return <WiThunderstorm className="text-4xl" />;
    } else if (conditionLower.includes('mist') || conditionLower.includes('fog') || conditionLower.includes('haze')) {
      return <WiFog className="text-4xl" />;
    }
    
    return <WiDaySunny className="text-4xl" />;
  };
  
  // Format last updated time
  const formatLastUpdated = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <main className={`min-h-screen p-4 md:p-8 ${locationsTheme.bg} font-sans`}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-semibold text-gray-900 mb-2">Saved Locations</h1>
            <p className="text-gray-700 text-lg">Manage your favorite weather locations</p>
          </div>
        </motion.div>
      
        {/* Search Bar */}
        <motion.div 
          variants={itemVariants}
          className={`${locationsTheme.cardBg} p-4 mb-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden ${locationsTheme.border} border`}
          whileHover={{ scale: 1.005, boxShadow: `0 10px 25px -5px ${locationsTheme.shadow || 'rgba(191, 219, 254, 0.5)'}` }}
        >
          <div className="relative z-10">
            <SearchBar onSearch={handleAddCity} />
          </div>
          
          {/* Add shimmer effect behind the search bar */}
          <motion.div 
            className={`absolute inset-0 bg-gradient-to-r from-transparent ${locationsTheme.highlight === 'blue-200' ? 'via-blue-200' : 'via-green-200'} to-transparent opacity-20`}
            variants={shimmerEffect}
            initial="hidden"
            animate="visible"
          />
        </motion.div>
      
      {/* Error Message */}
      {error && (
        <motion.div variants={itemVariants}>
          <ErrorMessage message={error} />
        </motion.div>
      )}
      
      {/* Loading Indicator */}
      {loading && (
        <motion.div 
          className="flex justify-center items-center h-20 mb-6 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className={`h-8 w-8 rounded-full border-t-2 border-b-2 ${locationsTheme.border}`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div 
            className={`absolute inset-0 bg-gradient-to-r from-transparent ${locationsTheme.highlight === 'blue-200' ? 'via-blue-200' : 'via-green-200'} to-transparent opacity-20`}
            variants={shimmerEffect}
            initial="hidden"
            animate="visible"
          />
        </motion.div>
      )}
      
      {/* Saved Cities Grid */}
      {savedCities.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {savedCities.map((city) => {
            const cityWeather = weatherData[city.name];
            
            return (
              <motion.div
                key={`${city.name}-${city.country}`}
                variants={itemVariants}
                whileHover={{ scale: 1.03, boxShadow: `0 10px 15px -3px ${locationsTheme.shadow}` }}
                className={`${locationsTheme.cardBg} p-4 rounded-xl shadow-md transition-all duration-300 cursor-pointer ${locationsTheme.border} border`}
                onClick={() => window.location.href = `/forecast/${city.name}`}
              >
                {cityWeather ? (
                  <div className="relative">
                    {/* Default City Indicator */}
                    {defaultCity === city.name && (
                      <div className={`absolute -top-2 -right-2 ${locationsTheme.accent} bg-opacity-90 text-white p-1 rounded-full`}>
                        <FaStar className="text-sm" />
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className={`text-2xl font-bold ${locationsTheme.text}`}>{city.name}</h3>
                        <p className={`text-sm ${locationsTheme.secondaryText}`}>{city.country}</p>
                      </div>
                      <div className="flex items-center">
                        <p className="text-gray-700 text-lg capitalize">{cityWeather.weather[0].description}</p>
                        <span className="text-4xl font-bold text-gray-900">
                          {Math.round(cityWeather.main.temp)}°C
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className={`text-sm ${locationsTheme.secondaryText}`}>
                        <p>Humidity: {cityWeather.main.humidity}%</p>
                        <p>Wind: {cityWeather.wind.speed} m/s</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Updated: {formatLastUpdated(new Date())}</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end mt-4 space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(city.name);
                        }}
                        className={`p-2 rounded-full ${defaultCity === city.name ? `bg-${locationsTheme.highlight} text-white` : 'bg-gray-200 text-gray-600'} hover:bg-${locationsTheme.highlight} hover:text-white transition-colors`}
                        title={defaultCity === city.name ? 'Default City' : 'Set as Default'}
                      >
                        <FaStar className="text-sm" />
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewMap(city);
                        }}
                        className={`p-2 rounded-full bg-${locationsTheme.secondaryAccent.replace('text-', '')}-100 ${locationsTheme.secondaryAccent} hover:bg-${locationsTheme.secondaryAccent.replace('text-', '')} hover:text-white transition-colors`}
                        title="View on Map"
                      >
                        <FaMapMarkerAlt className="text-sm" />
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCity(city.name);
                        }}
                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-500 hover:text-white transition-colors"
                        title="Remove City"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-40">
                    <motion.div 
                      className={`h-8 w-8 rounded-full border-t-2 border-b-2 ${locationsTheme.border}`}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div 
          variants={itemVariants}
          className={`${locationsTheme.cardBg} p-8 rounded-xl shadow-md text-center mb-8 ${locationsTheme.border} border`}
        >
          <h3 className={`text-2xl font-bold ${locationsTheme.text} mb-2`}>No Saved Locations</h3>
          <p className={`${locationsTheme.secondaryText} mb-4`}>Use the search bar above to add your favorite cities</p>
          <div className="flex justify-center">
            <FaPlus className={`${locationsTheme.accent} text-4xl animate-pulse`} />
          </div>
        </motion.div>
      )}
      
      {/* Weather Map Section */}
      <motion.div
        variants={itemVariants}
        className={`${locationsTheme.cardBg} p-4 rounded-xl shadow-md mb-6 ${locationsTheme.border} border`}
      >
        <h2 className={`text-2xl font-bold mb-4 ${locationsTheme.text}`}>Weather Map</h2>
        <p className={`${locationsTheme.secondaryText} mb-4`}>Interactive map with weather layers and city markers</p>
        
        {/* Weather Map Component */}
        <WeatherMap 
          savedCities={savedCities.map(city => ({
            ...city,
            weather: weatherData[city.name]
          }))}
          defaultCity={defaultCity}
          weatherTheme={{
            cardBg: locationsTheme.cardBg,
            text: locationsTheme.text,
            accent: locationsTheme.accent,
            border: locationsTheme.border,
            highlight: locationsTheme.highlight,
            shadow: locationsTheme.shadow,
            icon: locationsTheme.icon
          }}
        />
        
        <div className={`mt-4 text-sm ${locationsTheme.secondaryText}`}>
          <p>Toggle weather layers using the panel in the top-right corner of the map.</p>
          <p>Click on city markers to view weather details.</p>
        </div>
      </motion.div>

      {/* Weather Map Modal */}
      {showMap && selectedCity && (
        <motion.div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowMap(false)}
        >
          <motion.div 
            className={`${locationsTheme.cardBg} rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto ${locationsTheme.border} border`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{selectedCity.name}, {selectedCity.country}</h3>
              <button 
                onClick={() => setShowMap(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                aria-label="Close map"
              >
                &times;
              </button>
            </div>
            
            <div className="h-[60vh] rounded-lg overflow-hidden">
              <WeatherMap 
                savedCities={[{
                  ...selectedCity,
                  weather: weatherData[selectedCity.name]
                }]}
                defaultCity={selectedCity.name}
                weatherTheme={{
                  cardBg: locationsTheme.cardBg,
                  text: locationsTheme.text,
                  accent: locationsTheme.accent,
                  border: locationsTheme.border,
                  highlight: locationsTheme.highlight,
                  shadow: locationsTheme.shadow,
                  icon: locationsTheme.icon
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  </main>
  );
};

export default LocationsPage;
