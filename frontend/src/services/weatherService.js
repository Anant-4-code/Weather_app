import axios from 'axios';

// For development fallback if API calls fail
const OPENWEATHERMAP_API_KEY = 'd4902e6d1e25156458d8bb43c167d3c0';
const API_BASE_URL = '/api';

// Fallback direct API call in case the backend server is not running
const callDirectWeatherAPI = async (endpoint, params) => {
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/${endpoint}`, {
      params: {
        ...params,
        appid: OPENWEATHERMAP_API_KEY,
        units: 'metric'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Direct API call failed:', error);
    throw error;
  }
};

// Fetch current weather by city name
export const fetchWeatherByCity = async (city) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/weather/current`, { params: { city } });
    return response.data;
  } catch (error) {
    console.log('Backend API failed, trying direct API call...');
    try {
      // Fallback to direct API call if backend fails
      return await callDirectWeatherAPI('weather', { q: city });
    } catch (directError) {
      throw error.response?.data?.message || 'Failed to fetch weather data';
    }
  }
};

// Fetch current weather by coordinates
export const fetchWeatherByCoordinates = async (lat, lon) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/weather/current/coordinates`, { params: { lat, lon } });
    return response.data;
  } catch (error) {
    console.log('Backend API failed, trying direct API call...');
    try {
      // Fallback to direct API call if backend fails
      return await callDirectWeatherAPI('weather', { lat, lon });
    } catch (directError) {
      throw error.response?.data?.message || 'Failed to fetch weather data';
    }
  }
};

/**
 * Fetch city suggestions for autocomplete
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of city objects
 */
export const fetchCitySuggestions = async (query) => {
  if (!query || query.length < 2) return [];
  try {
    const response = await axios.get(`${API_BASE_URL}/weather/cities`, {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching city suggestions:', error);
    return [];
  }
};

/**
 * Fetch 5-day forecast by city name
 * @param {string} city - City name
 * @returns {Promise<Object>} - Forecast data
 */
export const fetchForecastByCity = async (city) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/weather/forecast`, { params: { city } });
    return response.data;
  } catch (error) {
    console.log('Backend API failed, trying direct API call...');
    try {
      // Fallback to direct API call if backend fails
      return await callDirectWeatherAPI('forecast', { q: city });
    } catch (directError) {
      throw error.response?.data?.message || 'Failed to fetch forecast data';
    }
  }
};

/**
 * Fetch 5-day forecast by coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} - Forecast data
 */
export const fetchForecastByCoordinates = async (lat, lon) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/weather/forecast/coordinates`, { params: { lat, lon } });
    return response.data;
  } catch (error) {
    console.log('Backend API failed, trying direct API call...');
    try {
      // Fallback to direct API call if backend fails
      return await callDirectWeatherAPI('forecast', { lat, lon });
    } catch (directError) {
      throw error.response?.data?.message || 'Failed to fetch forecast data';
    }
  }
};

/**
 * Get AI-generated summary for weather data
 * @param {Object} weatherData - Current weather data
 * @param {Array} forecastData - Optional forecast data
 * @returns {Promise<string>} - AI-generated summary
 */
export const getAISummary = async (weatherData, forecastData = null) => {
  try {
    if (!weatherData || !weatherData.main || !weatherData.weather || !weatherData.name || !weatherData.wind) {
      throw new Error('Invalid weather data provided');
    }

    const { main, weather, name: city, wind } = weatherData;
    
    const payload = {
      temperature: main.temp,
      description: weather[0].description,
      city,
      humidity: main.humidity,
      windSpeed: wind.speed
    };
    
    if (forecastData && forecastData.list) {
      // Format forecast data for the AI summary
      payload.forecast = forecastData.list
        .filter((item, index) => index % 8 === 0) // Get one forecast per day (every 8th item)
        .map(item => ({
          date: new Date(item.dt * 1000).toLocaleDateString(),
          temp: item.main.temp,
          description: item.weather[0].description
        }));
    }
    
    try {
      const response = await axios.post(`${API_BASE_URL}/gemini/ai-summary`, payload, {
        timeout: 10000 // 10 second timeout
      });
      
      // Check if response has the expected format
      if (response.data && typeof response.data.summary === 'string') {
        return response.data.summary;
      }
      throw new Error('Invalid response format from AI service');
    } catch (apiError) {
      console.warn('AI service request failed, using fallback summary');
      // Return null to trigger the fallback in the component
      return null;
    }
  } catch (error) {
    console.error('Error in getAISummary:', error);
    // Return null to trigger the fallback in the component
    return null;
  }
};

/**
 * Generate a basic weather summary locally
 * @param {Object} weatherData - Current weather data
 * @returns {string} - Generated summary
 */
const generateLocalSummary = (weatherData) => {
  try {
    const { main, weather, name, wind } = weatherData;
    const temp = Math.round(main.temp);
    const description = weather[0].description;
    
    return `It's currently ${temp}°C with ${description} in ${name}. ` +
           `The humidity is ${main.humidity}% and wind speed is ${wind.speed} m/s. ` +
           `${temp < 10 ? '❄️ Dress warmly!' : temp > 25 ? '☀️ Stay cool and hydrated!' : '🌤️ Enjoy the pleasant weather!'}`;
  } catch (error) {
    console.error('Error generating local summary:', error);
    return 'Weather information is currently available. Please check back later.';
  }
};