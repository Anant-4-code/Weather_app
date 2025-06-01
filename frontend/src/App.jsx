import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Base URL for GitHub Pages
const BASE_NAME = '/Weather_app';
import { fetchWeatherByCity, fetchWeatherByCoordinates, fetchForecastByCity } from './services/weatherService';
import Navbar from './components/Navbar';
import ForecastPage from './pages/Forecast';
import LocationsPage from './pages/Locations';
import HomePage from './pages/HomePage';
import weatherThemes, { getThemeByWeather, getPageTheme } from './utils/weatherThemes';

// Simple component to display when the app is starting
// const LoadingScreen = () => (
//   <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
//     <div className="text-center p-8 bg-white/80 backdrop-blur-md rounded-xl shadow-lg text-sky-700">
//       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto mb-4"></div>
//       <h2 className="text-2xl font-bold text-sky-700 mb-2">Loading Weather App</h2>
//       <p className="text-sky-600">Please wait while we fetch the latest weather data...</p>
//     </div>
//   </div>
// );

// Simple component to display when there's an error
const ErrorScreen = ({ message }) => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-100 to-red-300">
    <div className="text-center p-8 bg-white/80 backdrop-blur-md rounded-xl shadow-lg max-w-md text-sky-700">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-red-700 mb-2">Something went wrong</h2>
      <p className="text-red-600 mb-6">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Reload App
      </button>
    </div>
  </div>
);

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [city, setCity] = useState('');
  const [appError, setAppError] = useState(null);
  const [weatherTheme, setWeatherTheme] = useState(weatherThemes.default);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  // Function to fetch weather by coordinates
  const fetchWeatherByLocation = async (latitude, longitude) => {
    try {
      setLoading(true);
      setError(null);
      
      const [weather, forecast] = await Promise.all([
        fetchWeatherByCoordinates(latitude, longitude),
        fetchForecastByCity('') // Empty string will use coordinates
      ]);
      
      setWeatherData(weather);
      setForecastData(forecast);
      updateTheme(weather.weather[0].main);
      setCity(weather.name || '');
      return true;
    } catch (err) {
      console.error('Error fetching weather by location:', err);
      throw new Error('Failed to fetch weather for your location.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle geolocation success
  const handleGeolocationSuccess = async (position) => {
    try {
      const { latitude, longitude } = position.coords;
      console.log('Got location coordinates:', { latitude, longitude });
      
      // First try to fetch weather by coordinates
      try {
        const success = await fetchWeatherByLocation(latitude, longitude);
        if (success) {
          console.log('Successfully fetched weather for current location');
          return; // Success, we're done
        }
      } catch (err) {
        console.error('Error fetching weather for coordinates:', err);
      }
      
      // If that fails, try to get the city name from coordinates and fetch by city name
      try {
        console.log('Trying to get city name from coordinates...');
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        const locationData = await response.json();
        
        if (locationData?.city) {
          console.log('Found city name from coordinates:', locationData.city);
          await handleCitySelect(locationData.city);
          return; // Success, we're done
        }
      } catch (err) {
        console.error('Error getting city name from coordinates:', err);
      }
      
      // If we still don't have a location, show an error but don't fall back to London
      setError('Could not determine your location. Please try again or search for a city.');
      
    } catch (err) {
      console.error('Error in geolocation success handler:', err);
      setError('Error processing your location. Please try again or search for a city.');
    } finally {
      setIsRequestingLocation(false);
    }
  };

  // Function to handle geolocation error
  const handleGeolocationError = (error) => {
    console.warn('Geolocation error:', error);
    let errorMessage = 'Could not detect your location. ';
    
    switch(error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access was denied. Please enable location access in your browser settings or search for a city.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is currently unavailable. Please try again later or search for a city.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out. Please check your connection and try again.';
        break;
      default:
        errorMessage = 'Could not get your location. Please search for a city.';
    }
    
    setError(errorMessage);
    setIsRequestingLocation(false);
    
    // Don't automatically fall back to London - let the user decide
  };

  // Function to request user's location
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please search for a city.');
      return;
    }

    console.log('Requesting geolocation...');
    setIsRequestingLocation(true);
    setError(null);
    
    navigator.geolocation.getCurrentPosition(
      handleGeolocationSuccess,
      handleGeolocationError,
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout to 15 seconds
        maximumAge: 0
      }
    );
  };

  // Get user's current location on component mount
  useEffect(() => {
    // Only request location if we don't have any weather data yet
    if (!weatherData) {
      console.log('No weather data found, requesting location...');
      requestLocation();
    } else {
      console.log('Using existing weather data');
    }
  }, []);

  const updateTheme = (weatherCondition) => {
    const theme = getThemeByWeather(weatherCondition);
    if (theme) {
      setWeatherTheme(theme);
    }
  };

  const handleCitySelect = async (selectedCity) => {
    if (!selectedCity) return;
    
    console.log('Selected city:', selectedCity);
    setLoading(true);
    setError(null);
    setCity(selectedCity);
    
    try {
      const [weather, forecast] = await Promise.all([
        fetchWeatherByCity(selectedCity),
        fetchForecastByCity(selectedCity)
      ]);
      
      if (!weather || !forecast) {
        throw new Error('No weather data received');
      }
      
      setWeatherData(weather);
      setForecastData(forecast);
      updateTheme(weather.weather[0].main);
      
      // Clear any previous errors on success
      setError(null);
      
    } catch (err) {
      console.error('Error fetching weather data:', err);
      const errorMsg = `Failed to fetch weather for "${selectedCity}". Please try another location.`;
      setError(errorMsg);
      
      // If this was the initial load and it failed, fall back to London
      if (!weatherData) {
        console.log('Falling back to London');
        setTimeout(() => handleCitySelect('London'), 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while initializing
  if (appError) {
    return <ErrorScreen message={appError} />;
  }

  return (
    <Router basename={BASE_NAME}>
      <AppContent
        weatherData={weatherData}
        forecastData={forecastData}
        loading={loading}
        error={error}
        city={city}
        weatherTheme={weatherTheme}
        handleCitySelect={handleCitySelect}
        isRequestingLocation={isRequestingLocation}
        onRetryLocation={requestLocation}
      />
    </Router>
  );
}

// New component to make useLocation work correctly within Router context
const AppContent = ({ weatherData, forecastData, loading, error, city, weatherTheme, handleCitySelect, isRequestingLocation, onRetryLocation }) => {
  const location = useLocation();
  // Determine the theme for the main page background
  // HomePage and LocationsPage get 'forecast' theme background, others get dynamic 'weatherTheme' background
  const pageBackgroundTheme = (location.pathname === '/' || location.pathname.startsWith('/locations')) ? getPageTheme('forecast') : weatherTheme;

  return (
    <div className={`flex flex-col min-h-screen ${pageBackgroundTheme.bg} transition-all duration-1000`}>
      <Navbar 
        loading={loading} 
        error={error} 
        isRequestingLocation={isRequestingLocation}
        onRetryLocation={onRetryLocation}
      />
      <Routes>
        <Route 
          path="/" 
          element={
            <HomePage 
              weatherData={weatherData}
              forecastData={forecastData}
              loading={loading}
              error={error}
              city={city}
              // HomePage internal components also use the 'forecast' theme
              weatherTheme={getPageTheme('forecast')} 
              handleCitySelect={handleCitySelect}
            />
          } 
        />
        <Route 
          path="/forecast" 
          element={<ForecastPage />} // ForecastPage manages its own internal themes
        />
        <Route 
          path="/forecast/:city" 
          element={<ForecastPage />} 
        />
        <Route 
          path="/locations" 
          element={
            <LocationsPage 
              // LocationsPage now also uses the 'forecast' theme
              weatherTheme={getPageTheme('forecast')} 
            />
          } 
        />
      </Routes>
    </div>
  );
};

export default App;