const express = require('express');
const axios = require('axios');
const router = express.Router();

// Environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

// Generate AI summary for weather data
router.post('/ai-summary', async (req, res, next) => {
  try {
    const { temperature, description, city, humidity, windSpeed, forecast } = req.body;
    
    if (!temperature || !description || !city) {
      return res.status(400).json({ 
        error: true, 
        message: 'Required weather data is missing' 
      });
    }
    
    // Create a prompt for Gemini API
    let prompt = `Provide a friendly, concise summary of the current weather in ${city}. `;
    prompt += `It's currently ${temperature}°C with ${description}. `;
    
    if (humidity) {
      prompt += `The humidity is ${humidity}%. `;
    }
    
    if (windSpeed) {
      prompt += `Wind speed is ${windSpeed} m/s. `;
    }
    
    if (forecast && forecast.length > 0) {
      prompt += `Here's a brief forecast for the next few days: ${JSON.stringify(forecast)}. `;
    }
    
    prompt += `Include any relevant advice based on these conditions (what to wear, activities to consider, etc). Keep it under 100 words and make it conversational.`;
    
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    const summary = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No summary available';
    console.log('Gemini API response:', summary);
    
    res.json({ summary });
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    next(error);
  }
});

// Add a test route to check if Gemini API is working
router.get('/test', async (req, res) => {
  try {
    console.log('Testing Gemini API with key:', GEMINI_API_KEY.substring(0, 5) + '...');
    
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: 'Hello, please respond with a simple greeting.' }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    const result = response.data;
    console.log('Gemini API test successful');
    res.json({ success: true, result });
  } catch (error) {
    console.error('Gemini API test failed:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

module.exports = router;
