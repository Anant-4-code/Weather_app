import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiRobot2Line } from 'react-icons/ri';
import { getAISummary } from '../services/weatherService';

const AISummary = ({ weatherData, theme }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add a fallback summary function if the API fails
  const generateFallbackSummary = (data) => {
    if (!data) return '';
    
    const { main, weather, name, wind } = data;
    const temp = Math.round(main.temp);
    const description = weather[0].description;
    
    return `It's currently ${temp}°C with ${description} in ${name}. ` +
           `The humidity is ${main.humidity}% and wind speed is ${wind.speed} m/s. ` +
           `${temp < 10 ? 'Dress warmly!' : temp > 25 ? 'Stay cool and hydrated!' : 'Enjoy the pleasant weather!'}`;
  };

  useEffect(() => {
    const fetchAISummary = async () => {
      if (!weatherData) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // First try to get AI summary from the Gemini API
        try {
          const summaryText = await getAISummary(weatherData);
          // If we get a response but it's empty or in an unexpected format
          if (!summaryText || typeof summaryText !== 'string') {
            throw new Error('Invalid response from AI service');
          }
          setSummary(summaryText);
        } catch (apiError) {
          console.warn('AI Summary API failed, using fallback:', apiError);
          // Fall back to the local summary generation
          setSummary(generateFallbackSummary(weatherData));
        }
      } catch (err) {
        console.error('Error in AI summary process:', err);
        setError('Unable to generate AI insights at this time.');
        setSummary(generateFallbackSummary(weatherData));
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to prevent too many rapid requests
    const timer = setTimeout(fetchAISummary, 500);
    return () => clearTimeout(timer);
  }, [weatherData]);

  if (!weatherData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`${theme.cardBg} backdrop-blur-sm p-6 rounded-xl h-full border ${theme.border} shadow-lg`}
    >
      <div className="flex items-center mb-4">
        <RiRobot2Line className={`text-2xl ${theme.icon} mr-2`} />
        <h3 className={`text-xl font-semibold ${theme.text}`}>AI Weather Insights</h3>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2.5"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`${theme.text} leading-relaxed`}
        >
          {summary}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AISummary;
