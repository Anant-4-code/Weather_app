import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ForecastCards = ({ forecastData, theme }) => {
  const [dailyForecast, setDailyForecast] = useState([]);

  useEffect(() => {
    if (!forecastData || !forecastData.list) return;
    setDailyForecast(groupForecastByDay(forecastData));
  }, [forecastData]);

  // Helper function to group forecast data by day
  const groupForecastByDay = (forecastData) => {
    if (!forecastData || !forecastData.list) return [];
    
    const groupedData = {};
    
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      
      if (!groupedData[date]) {
        groupedData[date] = {
          date,
          day: new Date(item.dt * 1000).toLocaleDateString(undefined, { weekday: 'long' }),
          temps: [],
          icons: [],
          descriptions: [],
        };
      }
      
      groupedData[date].temps.push(item.main.temp);
      groupedData[date].icons.push(item.weather[0].icon);
      groupedData[date].descriptions.push(item.weather[0].description);
    });
    
    // Convert the grouped data to an array and take only the next 3 days
    return Object.values(groupedData).slice(1, 4);
  };

  // Get the most frequent icon and description for each day
  const getMostFrequent = (arr) => {
    const frequency = {};
    let maxFreq = 0;
    let mostFrequent;
    
    arr.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
      
      if (frequency[item] > maxFreq) {
        maxFreq = frequency[item];
        mostFrequent = item;
      }
    });
    
    return mostFrequent;
  };

  // If no forecast data is provided, show placeholder
  if (!forecastData) {
    return (
      <div className={`${theme.cardBg} backdrop-blur-sm p-6 rounded-xl border ${theme.border} shadow-lg`}>
        <h3 className={`text-xl font-semibold mb-4 ${theme.text}`}>3-Day Forecast</h3>
        <p className="text-gray-500">Search for a city to see the forecast</p>
      </div>
    );
  }

  // If forecast data is loading or empty
  if (dailyForecast.length === 0) {
    return (
      <div className={`${theme.cardBg} backdrop-blur-sm p-6 rounded-xl border ${theme.border} shadow-lg`}>
        <h3 className={`text-xl font-semibold mb-4 ${theme.text}`}>3-Day Forecast</h3>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className={`${theme.cardBg} backdrop-blur-sm p-6 rounded-xl border ${theme.border} shadow-lg`}
    >
      <h3 className={`text-xl font-semibold mb-4 ${theme.text}`}>3-Day Forecast</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dailyForecast.map((day, index) => {
          // Calculate min and max temperature for the day
          const minTemp = Math.round(Math.min(...day.temps));
          const maxTemp = Math.round(Math.max(...day.temps));
          
          // Get the most common icon and description
          const icon = getMostFrequent(day.icons);
          const description = getMostFrequent(day.descriptions);
          
          return (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index + 0.4 }}
              className={`${theme.cardBg} p-4 rounded-lg flex flex-col items-center`}
            >
              <h4 className={`font-medium text-lg ${theme.text}`}>{day.day}</h4>
              <img 
                src={`https://openweathermap.org/img/wn/${icon}@2x.png`} 
                alt={description} 
                className="w-16 h-16 my-2" 
              />
              <p className={`capitalize text-sm ${theme.text} mb-2`}>{description}</p>
              <div className="flex justify-between w-full px-2">
                <span className={`text-lg font-bold ${theme.text}`}>{maxTemp}°C</span>
                <span className={`text-lg text-gray-500`}>{minTemp}°C</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ForecastCards;
