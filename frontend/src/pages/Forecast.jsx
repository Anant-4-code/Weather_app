import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchForecastByCity, fetchWeatherByCoordinates, fetchWeatherByCity, fetchForecastByCoordinates } from '../services/weatherService';
import { getThemeByWeather, getPageTheme } from '../utils/weatherThemes';
import ForecastCardList from './ForecastCardList';
import ForecastGraph from './ForecastGraph';
import ExpandedForecast from './ExpandedForecast';
import SearchBar from '../components/SearchBar';
import ErrorMessage from '../components/ErrorMessage';
import AISummary from '../components/AISummary';

const ForecastHeader = ({ city, dateRange, theme }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`overflow-hidden rounded-xl ${theme.cardBg} backdrop-blur-sm border ${theme.border} shadow-lg`}
      whileHover={{ scale: 1.01, boxShadow: `0 10px 25px -5px ${theme.shadow}` }}
    >
      <div className="p-4 sm:p-6 relative">
        {/* Background gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg.replace('bg-gradient-to-br', '')} opacity-20 z-0`}></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-3 sm:mb-0">
            <h2 className={`text-2xl sm:text-3xl font-bold ${theme.text}`}>{city}</h2>
            <p className="text-sky-600">{dateRange}</p>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

const WeatherDetails = ({ currentWeather, theme }) => {
  if (!currentWeather) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`overflow-hidden rounded-xl ${theme.cardBg} backdrop-blur-sm border ${theme.border} shadow-lg`}
      whileHover={{ scale: 1.01, boxShadow: `0 10px 25px -5px ${theme.shadow}` }}
    >
      <div className="p-4 sm:p-6 relative">
        {/* Background gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg.replace('bg-gradient-to-br', '')} opacity-20 z-0`}></div>
        
        <div className="relative z-10">
          <h2 className={`text-xl font-semibold mb-4 ${theme.text}`}>Weather Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center p-3 bg-white/30 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Humidity</p>
                <p className={`text-lg font-semibold ${theme.text}`}>{currentWeather.main.humidity}%</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-white/30 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Wind Speed</p>
                <p className={`text-lg font-semibold ${theme.text}`}>{currentWeather.wind.speed} m/s</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-white/30 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Pressure</p>
                <p className={`text-lg font-semibold ${theme.text}`}>{currentWeather.main.pressure} hPa</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-white/30 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Visibility</p>
                <p className={`text-lg font-semibold ${theme.text}`}>{(currentWeather.visibility / 1000).toFixed(1)} km</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ForecastHighlights = ({ forecast, forecastDays, theme }) => {
  if (!forecast) return null;
  
  // Calculate highest and lowest temperatures
  const tempData = forecast.list.slice(0, forecastDays * 8).map(item => item.main.temp);
  const highestTemp = Math.max(...tempData).toFixed(1);
  const lowestTemp = Math.min(...tempData).toFixed(1);
  
  // Calculate average humidity
  const avgHumidity = Math.round(
    forecast.list.slice(0, forecastDays * 8).reduce((acc, item) => acc + item.main.humidity, 0) / 
    (forecastDays * 8)
  );
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`overflow-hidden rounded-xl ${theme.cardBg} backdrop-blur-sm border ${theme.border} shadow-lg mt-4`}
      whileHover={{ scale: 1.01, boxShadow: `0 10px 25px -5px ${theme.shadow}` }}
    >
      <div className="p-4 sm:p-6 relative">
        {/* Background gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg.replace('bg-gradient-to-br', '')} opacity-20 z-0`}></div>
        
        <div className="relative z-10">
          <h2 className={`text-xl font-semibold mb-4 ${theme.text}`}>Forecast Highlights</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white/30 rounded-lg">
              <span className="text-gray-500">Highest Temp</span>
              <span className={`text-lg font-medium ${theme.text}`}>{highestTemp}°C</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/30 rounded-lg">
              <span className="text-gray-500">Lowest Temp</span>
              <span className={`text-lg font-medium ${theme.text}`}>{lowestTemp}°C</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/30 rounded-lg">
              <span className="text-gray-500">Average Humidity</span>
              <span className={`text-lg font-medium ${theme.text}`}>{avgHumidity}%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ForecastPage = () => {
  const [city, setCity] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const forecastDays = 7; // Fixed to 7 days forecast
  const [expandedDay, setExpandedDay] = useState(null);
  const [weatherTheme, setWeatherTheme] = useState(getThemeByWeather('Clear'));
  
  // Get the forecast page specific theme
  const forecastTheme = getPageTheme('forecast');

  // Get user's location on component mount
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              
              // Fetch weather data by coordinates
              const weatherData = await fetchWeatherByCoordinates(latitude, longitude);
              setCurrentWeather(weatherData);
              setCity(weatherData.name); // Set city name from the response
              
              // Set theme based on weather condition
              const condition = weatherData.weather[0].main;
              setWeatherTheme(getThemeByWeather(condition));
              
              // Fetch forecast data by coordinates
              const forecastData = await fetchForecastByCoordinates(latitude, longitude);
              setForecast(forecastData);
              
              setLoading(false);
            } catch (err) {
              console.error('Error fetching data by coordinates:', err);
              setError('Failed to fetch weather data for your location. Falling back to default city.');
              fetchDefaultCityData();
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
            setError('Unable to get your location. Falling back to default city.');
            fetchDefaultCityData();
          },
          { timeout: 10000 }
        );
      } else {
        setError('Geolocation is not supported by your browser. Falling back to default city.');
        fetchDefaultCityData();
      }
    };

    // Fallback function to fetch data for default city
    const fetchDefaultCityData = async () => {
      try {
        const defaultCity = 'London';
        setCity(defaultCity);
        
        // Fetch current weather
        const weatherData = await fetchWeatherByCity(defaultCity);
        setCurrentWeather(weatherData);
        
        // Set theme based on weather condition
        const condition = weatherData.weather[0].main;
        setWeatherTheme(getThemeByWeather(condition));
        
        // Fetch forecast data
        const forecastData = await fetchForecastByCity(defaultCity);
        setForecast(forecastData);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch weather data. Please try again later.');
        setLoading(false);
        console.error(err);
      }
    };

    getUserLocation();
  }, []);

  // Fetch data when city changes (but not on initial mount)
  useEffect(() => {
    const fetchData = async () => {
      if (!city) return; // Skip if city is empty (initial state)
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch current weather data
        const weatherData = await fetchWeatherByCity(city);
        setCurrentWeather(weatherData);
        
        // Set theme based on weather condition
        const condition = weatherData.weather[0].main;
        setWeatherTheme(getThemeByWeather(condition));
        
        // Fetch forecast data
        const forecastData = await fetchForecastByCity(city);
        setForecast(forecastData);
        
        setLoading(false);
      } catch (err) {
        setError(`Failed to fetch weather data for ${city}. Please try again later.`);
        setLoading(false);
        console.error(err);
      }
    };
    
    // Only fetch if city has been set by user input, not on initial mount
    if (city && !loading) {
      fetchData();
    }
  }, [city]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch forecast data
        const forecastData = await fetchForecastByCity(city);
        setForecast(forecastData);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch weather data. Please try again later.');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchData();
  }, [city, forecastDays]);

  // Calculate date range for header
  const getDateRange = () => {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + forecastDays - 1);
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    return `${formatDate(today)} - ${formatDate(endDate)}`;
  };

  // Handle city selection from SearchBar
  const handleCitySelect = async (searchCity) => {
    try {
      setLoading(true);
      setError(null);
      setCity(searchCity);
      
      // Get current weather for theme
      const weatherData = await fetchWeatherByCity(searchCity);
      setCurrentWeather(weatherData);
      
      // Set theme based on weather condition
      const condition = weatherData.weather[0].main;
      setWeatherTheme(getThemeByWeather(condition));
      
      // Fetch forecast data
      const forecastData = await fetchForecastByCity(searchCity);
      setForecast(forecastData);
      
      setLoading(false);
    } catch (err) {
      setError(`Could not find weather data for "${searchCity}". Please check the city name and try again.`);
      setLoading(false);
      console.error(err);
    }
  };

  // Handle forecast days change


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

  return (
    <main className={`flex-1 p-2 sm:p-3 overflow-auto pt-16 ${forecastTheme.bg}`}>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto max-w-7xl px-1 sm:px-2"
      >
        <motion.div variants={itemVariants}>
          <ForecastHeader 
            city={city} 
            dateRange={getDateRange()} 
            forecastDays={forecastDays} 
            theme={forecastTheme} 
          />
        </motion.div>
        
        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <motion.div 
            variants={itemVariants}
            className={`overflow-hidden rounded-xl ${forecastTheme.cardBg} backdrop-blur-sm border ${forecastTheme.border} shadow-lg`}
            whileHover={{ scale: 1.01, boxShadow: `0 10px 25px -5px ${forecastTheme.shadow}` }}
          >
            <div className="p-4 sm:p-6 relative">
              {/* Background gradient overlay */}
              <div className={`absolute inset-0 ${forecastTheme.gradient} opacity-20 z-0`}></div>
              
              <div className="relative z-10">
                <SearchBar onSearch={handleCitySelect} />
              </div>
              
              {/* Add shimmer effect behind the search bar */}
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-r from-transparent via-${forecastTheme.highlight} to-transparent opacity-20 z-0`}
                variants={shimmerEffect}
                initial="hidden"
                animate="visible"
              />
            </div>
          </motion.div>
        </motion.div>
        
        {/* Error Message */}
        {error && (
          <motion.div variants={itemVariants} className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mt-4">
            <p>{error}</p>
          </motion.div>
        )}
        
        {/* Loading State */}
        {loading ? (
          <motion.div 
            className="flex justify-center items-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={`h-12 w-12 rounded-full border-t-2 border-b-2 ${forecastTheme.accent}`}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div 
              className={`absolute bg-gradient-to-r from-transparent via-${forecastTheme.highlight} to-transparent w-full h-full opacity-20`}
              variants={shimmerEffect}
              initial="hidden"
              animate="visible"
            />
          </motion.div>
        ) : forecast ? (
          <AnimatePresence>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 20 }}
              className="mt-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-8 space-y-3">
                  {/* Daily Forecast Card */}
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, boxShadow: `0 10px 25px -5px ${forecastTheme.shadow}` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <ForecastCardList 
                      forecast={forecast} 
                      forecastDays={forecastDays} 
                      theme={forecastTheme}
                      setExpandedDay={setExpandedDay}
                    />
                  </motion.div>
                  
                  {/* Weather Trends Graph */}
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, boxShadow: `0 10px 25px -5px ${forecastTheme.shadow}` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`overflow-hidden rounded-xl ${forecastTheme.cardBg} backdrop-blur-sm border ${forecastTheme.border} shadow-lg`}
                  >
                    <div className="p-4 sm:p-6 relative">
                      {/* Background gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${forecastTheme.bg.replace('bg-gradient-to-br', '')} opacity-20 z-0`}></div>
                      <div className="relative z-10">
                        <ForecastGraph 
                          forecast={forecast} 
                          forecastDays={forecastDays} 
                          theme={forecastTheme}
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                <div className="md:col-span-4 space-y-3">
                  {/* Weather Details Card */}
                  <WeatherDetails currentWeather={currentWeather} theme={forecastTheme} />
                  
                  {/* Forecast Highlights Card */}
                  <ForecastHighlights forecast={forecast} forecastDays={forecastDays} theme={forecastTheme} />
                  
                  {/* AI Summary Card */}
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, boxShadow: `0 10px 25px -5px ${forecastTheme.shadow}` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`overflow-hidden rounded-xl ${forecastTheme.cardBg} backdrop-blur-sm border ${forecastTheme.border} shadow-lg`}
                  >
                    <div className="p-4 sm:p-6 relative">
                      {/* Background gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${forecastTheme.bg.replace('bg-gradient-to-br', '')} opacity-20 z-0`}></div>
                      <div className="relative z-10">
                        <h2 className={`text-xl font-semibold mb-4 ${forecastTheme.text}`}>AI Weather Insights</h2>
                        <AISummary weatherData={currentWeather} theme={forecastTheme} />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : null}
        
        {/* Expanded Forecast Modal */}
        <AnimatePresence>
          {expandedDay && (
            <ExpandedForecast 
              key="expanded-forecast"
              day={expandedDay} 
              theme={forecastTheme} 
              onClose={() => setExpandedDay(null)} 
            />
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
};

export default ForecastPage;
