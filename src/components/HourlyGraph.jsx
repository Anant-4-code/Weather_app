import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const HourlyGraph = ({ forecastData, theme }) => {
  const [hourlyData, setHourlyData] = useState([]);

  useEffect(() => {
    if (!forecastData) return;
    
    try {
      // Extract the next 24 hours (8 data points, as each is 3 hours apart)
      const next24Hours = forecastData.list.slice(0, 8).map(item => ({
        time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: Math.round(item.main.temp),
        icon: item.weather[0].icon,
        description: item.weather[0].description
      }));
      
      setHourlyData(next24Hours);
    } catch (err) {
      console.error('Error processing forecast data:', err);
    }
  }, [forecastData]);

  // Find the min and max temperatures for scaling the graph
  const minTemp = hourlyData.length > 0 ? Math.min(...hourlyData.map(h => h.temp)) - 2 : 0;
  const maxTemp = hourlyData.length > 0 ? Math.max(...hourlyData.map(h => h.temp)) + 2 : 30;
  const tempRange = maxTemp - minTemp;

  // Function to calculate the height percentage for a temperature value
  const getHeightPercentage = (temp) => {
    return ((temp - minTemp) / tempRange) * 70; // 70% of the container height
  };

  if (!forecastData) {
    return (
      <div className={`${theme.cardBg} backdrop-blur-sm p-6 rounded-xl border ${theme.border} shadow-lg`}>
        <h3 className={`text-xl font-semibold mb-4 ${theme.text}`}>Today's Hourly Forecast</h3>
        <p className="text-gray-500">Search for a city to see the hourly forecast</p>
      </div>
    );
  }

  if (hourlyData.length === 0) {
    return (
      <div className={`${theme.cardBg} backdrop-blur-sm p-6 rounded-xl border ${theme.border} shadow-lg`}>
        <h3 className={`text-xl font-semibold mb-4 ${theme.text}`}>Today's Hourly Forecast</h3>
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
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`${theme.cardBg} backdrop-blur-sm p-6 rounded-xl border ${theme.border} shadow-lg`}
    >
      <h3 className={`text-xl font-semibold mb-4 ${theme.text}`}>Today's Hourly Forecast</h3>
      
      <div className="relative h-64">
        {/* Temperature lines */}
        <div className={`absolute inset-0 flex flex-col justify-between text-xs ${theme.text}`}>
          <div>{maxTemp}°C</div>
          <div>{Math.round((maxTemp + minTemp) / 2)}°C</div>
          <div>{minTemp}°C</div>
        </div>
        
        {/* Graph container */}
        <div className="ml-8 h-full flex items-end">
          <div className="w-full h-full flex justify-between items-end relative">
            {/* Horizontal grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-b border-gray-200 w-full"></div>
              <div className="border-b border-gray-200 w-full"></div>
              <div className="border-b border-gray-200 w-full"></div>
            </div>
            
            {/* Temperature points and connecting lines */}
            <svg className="absolute inset-0 w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              
              {/* Area under the curve */}
              <path
                d={`
                  M 0,${100 - getHeightPercentage(hourlyData[0].temp)} 
                  ${hourlyData.map((h, i) => `L ${(i / (hourlyData.length - 1)) * 100},${100 - getHeightPercentage(h.temp)}`).join(' ')} 
                  L 100,100 L 0,100 Z
                `}
                fill="url(#gradient)"
                className="opacity-50"
              />
              
              {/* Line connecting points */}
              <path
                d={`
                  M 0,${100 - getHeightPercentage(hourlyData[0].temp)} 
                  ${hourlyData.map((h, i) => `L ${(i / (hourlyData.length - 1)) * 100},${100 - getHeightPercentage(h.temp)}`).join(' ')}
                `}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                className="opacity-80"
              />
              
              {/* Temperature points */}
              {hourlyData.map((h, i) => (
                <circle
                  key={i}
                  cx={`${(i / (hourlyData.length - 1)) * 100}%`}
                  cy={`${100 - getHeightPercentage(h.temp)}%`}
                  r="4"
                  fill="#3b82f6"
                  className="opacity-80"
                />
              ))}
            </svg>
            
            {/* Time labels and temperature values */}
            {hourlyData.map((h, i) => (
              <div 
                key={i} 
                className="flex flex-col items-center justify-end z-10"
                style={{ height: '100%', width: `${100 / hourlyData.length}%` }}
              >
                <div className="absolute bottom-0 transform -translate-y-24">
                  <div className={`text-sm font-semibold ${theme.text}`}>{h.temp}°C</div>
                </div>
                <img 
                  src={`https://openweathermap.org/img/wn/${h.icon}.png`} 
                  alt={h.description}
                  className="w-8 h-8 mb-1"
                />
                <div className="text-xs text-gray-500 whitespace-nowrap">{h.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HourlyGraph;
