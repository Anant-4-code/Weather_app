const express = require('express');
const axios = require('axios');
const router = express.Router();

// Environment variables
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Get current weather by city name
router.get('/current', async (req, res, next) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({ error: true, message: 'City parameter is required' });
    }
    
    console.log("Backend: Fetching weather for city:", city); // Debug log
    
    const response = await axios.get(`${WEATHER_API_BASE_URL}/weather`, {
      params: {
        q: city,
        appid: OPENWEATHERMAP_API_KEY,
        units: 'metric'
      }
    });
    
    console.log("Backend: Weather data received for", city); // Debug log
    res.json(response.data);
  } catch (error) {
    console.error("Backend error:", error.response?.data || error.message); // Better error logging
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: true, message: 'City not found' });
    }
    next(error);
  }
});

// Get current weather by coordinates
router.get('/current/coordinates', async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: true, message: 'Latitude and longitude parameters are required' });
    }
    
    const response = await axios.get(`${WEATHER_API_BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: OPENWEATHERMAP_API_KEY,
        units: 'metric'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

// Get 5-day forecast by city name
router.get('/forecast', async (req, res, next) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({ error: true, message: 'City parameter is required' });
    }
    
    const response = await axios.get(`${WEATHER_API_BASE_URL}/forecast`, {
      params: {
        q: city,
        appid: OPENWEATHERMAP_API_KEY,
        units: 'metric'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: true, message: 'City not found' });
    }
    next(error);
  }
});

// Get 5-day forecast by coordinates
router.get('/forecast/coordinates', async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: true, message: 'Latitude and longitude parameters are required' });
    }
    
    const response = await axios.get(`${WEATHER_API_BASE_URL}/forecast`, {
      params: {
        lat,
        lon,
        appid: OPENWEATHERMAP_API_KEY,
        units: 'metric'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

// Get weather analytics data
router.get('/analytics', async (req, res, next) => {
  try {
    const { city, days = 7 } = req.query;
    
    if (!city) {
      return res.status(400).json({ error: true, message: 'City parameter is required' });
    }
    
    // Generate realistic mock data with daily variations
    const now = new Date();
    const temperatureData = Array.from({ length: days }, (_, i) => {
      // Create a date for each day in the range
      const date = new Date(now);
      date.setDate(now.getDate() - (days - i - 1));
      
      // Base temperature with seasonal variation (colder in winter, warmer in summer)
      const month = date.getMonth();
      const seasonalBase = 10 + 15 * Math.sin((month / 12) * 2 * Math.PI);
      
      // Add some randomness but keep it realistic
      const dailyVariation = Math.sin((i / days) * Math.PI * 2) * 5; // Smooth wave pattern
      const randomVariation = (Math.random() - 0.5) * 4; // Small random variation
      
      const temp = Math.round((seasonalBase + dailyVariation + randomVariation) * 10) / 10;
      
      // Humidity inversely related to temperature
      const humidity = Math.round(70 - (temp / 30) * 20 + (Math.random() - 0.5) * 10);
      
      // Wind speed with some randomness
      const wind_speed = Math.round((3 + Math.random() * 7) * 10) / 10;
      
      return {
        date: date.toISOString().split('T')[0],
        temp,
        humidity: Math.max(20, Math.min(95, humidity)), // Keep within 20-95%
        wind_speed: Math.max(0.5, Math.min(15, wind_speed)) // Keep within 0.5-15 m/s
      };
    });
    
    // Calculate statistics
    const temps = temperatureData.map(d => d.temp);
    const humidities = temperatureData.map(d => d.humidity);
    const windSpeeds = temperatureData.map(d => d.wind_speed);
    
    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    const min = arr => Math.min(...arr);
    const max = arr => Math.max(...arr);
    
    const response = {
      temperatureData,
      city,
      days: parseInt(days, 10),
      stats: {
        temperature: {
          avg: avg(temps),
          min: min(temps),
          max: max(temps)
        },
        humidity: {
          avg: avg(humidities),
          min: min(humidities),
          max: max(humidities)
        },
        wind_speed: {
          avg: avg(windSpeeds),
          min: min(windSpeeds),
          max: max(windSpeeds)
        },
        lastUpdated: new Date().toISOString()
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ 
      error: true, 
      message: error.response?.data?.message || 'Failed to fetch analytics data' 
    });
  }
});

// Get city suggestions for autocomplete
router.get('/cities', async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }
    
    const response = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
      params: {
        q: q,
        limit: 5,
        appid: OPENWEATHERMAP_API_KEY
      }
    });
    
    const cities = response.data.map(city => ({
      name: city.name,
      country: city.country,
      state: city.state,
      lat: city.lat,
      lon: city.lon
    }));
    
    res.json(cities);
  } catch (error) {
    console.error('Error fetching city suggestions:', error);
    res.status(500).json({ message: 'Failed to fetch city suggestions' });
  }
});

module.exports = router;
