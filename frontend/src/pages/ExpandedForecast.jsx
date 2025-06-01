import React from 'react';
import { motion } from 'framer-motion';

const ExpandedForecast = ({ day, theme, onClose }) => {
  // Add debug logging
  console.log('ExpandedForecast received day:', day);
  
  if (!day) {
    console.error('No day data provided to ExpandedForecast');
    return null;
  }
  
  if (!day.hourlyData) {
    console.error('No hourly data in day object:', day);
    return null;
  }

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 100, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 25,
        delay: 0.1
      } 
    },
    exit: { 
      opacity: 0, 
      y: 100, 
      scale: 0.9,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 25 
      } 
    }
  };

  // Get sunrise and sunset times (mock data, you would get this from API)
  const sunrise = '06:30 AM';
  const sunset = '07:15 PM';

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
    >
      <motion.div 
        className={`${theme.cardBg} backdrop-blur-md rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar`}
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex justify-between items-center p-3 sm:p-6 border-b border-gray-200 bg-white/80 backdrop-blur-md">
          <div>
            <h2 className={`text-xl sm:text-2xl font-bold ${theme.text}`}>{day.day || day.dayOfWeek}</h2>
            <p className={`text-base sm:text-lg ${theme.secondaryText || theme.text}`}>{day.dayMonth || `${day.month} ${day.dayOfMonth}`}</p>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-3 sm:p-6">
          {/* Daily Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
            <div className={`${theme.cardBg} p-3 sm:p-4 rounded-xl border ${theme.border} shadow-md`}>
              <h3 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${theme.text}`}>Daily Summary</h3>
              
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center">
                  <img 
                    src={`https://openweathermap.org/img/wn/${day.weatherIcon}@2x.png`} 
                    alt={day.weather} 
                    className="w-12 h-12 sm:w-16 sm:h-16" 
                  />
                  <div>
                    <p className={`capitalize text-base sm:text-lg font-medium ${theme.text}`}>{day.weather}</p>
                    <p className={`text-xs sm:text-sm ${theme.secondaryText || theme.text}`}>Main condition for the day</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`text-2xl sm:text-3xl font-bold ${theme.text}`}>{day.maxTemp}°</p>
                  <p className="text-lg sm:text-xl text-gray-500">{day.minTemp}°</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm text-gray-500">Humidity</span>
                  <span className={`text-base sm:text-lg font-medium ${theme.text}`}>{day.humidity}%</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm text-gray-500">Wind Speed</span>
                  <span className={`text-base sm:text-lg font-medium ${theme.text}`}>{day.windSpeed} m/s</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm text-gray-500">Sunrise</span>
                  <span className={`text-base sm:text-lg font-medium ${theme.text}`}>{sunrise}</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm text-gray-500">Sunset</span>
                  <span className={`text-base sm:text-lg font-medium ${theme.text}`}>{sunset}</span>
                </div>
              </div>
              
              <p className={`mt-3 sm:mt-4 text-sm ${theme.secondaryText || theme.text}`}>
                {day.isToday 
                  ? `Today will have ${day.weather.toLowerCase()} conditions with temperatures around ${day.avgTemp}°C.` 
                  : `${day.day || day.dayOfWeek} will have ${day.weather.toLowerCase()} conditions with temperatures around ${day.avgTemp}°C.`
                }
              </p>
            </div>
            
            <div className={`${theme.cardBg} p-3 sm:p-4 rounded-xl border ${theme.border} shadow-md`}>
              <h3 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${theme.text}`}>Temperature Range</h3>
              
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-500">●</span>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Min Temp</p>
                    <p className={`text-base sm:text-lg font-medium ${theme.text}`}>{day.minTemp}°C</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-red-500">●</span>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Max Temp</p>
                    <p className={`text-base sm:text-lg font-medium ${theme.text}`}>{day.maxTemp}°C</p>
                  </div>
                </div>
              </div>
              
              <div className="relative h-4 bg-gradient-to-r from-blue-500 to-red-500 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 h-full bg-white/30 rounded-full"
                  style={{
                    left: '20%',
                    width: '10%',
                    transform: 'translateX(-50%)',
                  }}
                />
              </div>
              
              <p className="mt-6 text-center text-xs sm:text-sm text-gray-500">
                Temperature variation throughout the day
              </p>
            </div>
          </div>
          
          {/* Hourly Forecast */}
          <div className={`${theme.cardBg} p-3 sm:p-4 rounded-xl border ${theme.border} shadow-md mb-4 sm:mb-6`}>
            <h3 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${theme.text}`}>Hourly Forecast</h3>
            
            <div className="overflow-x-auto pb-2 custom-scrollbar">
              <div className="flex space-x-4 sm:space-x-6 min-w-max">
                {day.hourlyData.map((hour, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <span className={`text-xs sm:text-sm font-medium ${theme.text}`}>{hour.time}</span>
                    <img 
                      src={`https://openweathermap.org/img/wn/${hour.icon}.png`} 
                      alt={hour.description} 
                      className="w-8 h-8 sm:w-10 sm:h-10 my-1" 
                    />
                    <span className={`text-base sm:text-lg font-bold ${theme.text}`}>{Math.round(hour.temp)}°</span>
                    <span className="text-xs text-gray-500">{hour.humidity}%</span>
                    <span className="text-xs text-gray-500">{hour.windSpeed} m/s</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Additional Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className={`${theme.cardBg} p-3 sm:p-4 rounded-xl border ${theme.border} shadow-md`}>
              <h4 className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 ${theme.text}`}>Pressure</h4>
              <p className={`text-xl sm:text-2xl font-bold ${theme.text}`}>
                {day.hourlyData && day.hourlyData.length > 0 ? 
                  Math.round(day.hourlyData.reduce((sum, hour) => sum + hour.pressure, 0) / day.hourlyData.length) : 
                  "N/A"} hPa
              </p>
              <p className="text-xs text-gray-500 mt-1">Average for the day</p>
            </div>
            
            <div className={`${theme.cardBg} p-3 sm:p-4 rounded-xl border ${theme.border} shadow-md`}>
              <h4 className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 ${theme.text}`}>Cloud Cover</h4>
              <p className={`text-xl sm:text-2xl font-bold ${theme.text}`}>
                {day.hourlyData && day.hourlyData.length > 0 ? 
                  Math.round(day.hourlyData.reduce((sum, hour) => sum + hour.clouds, 0) / day.hourlyData.length) : 
                  "N/A"}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Average for the day</p>
            </div>
            
            <div className={`${theme.cardBg} p-3 sm:p-4 rounded-xl border ${theme.border} shadow-md`}>
              <h4 className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 ${theme.text}`}>Feels Like</h4>
              <p className={`text-xl sm:text-2xl font-bold ${theme.text}`}>
                {day.hourlyData && day.hourlyData.length > 0 ? 
                  Math.round(day.hourlyData.reduce((sum, hour) => sum + hour.feelsLike, 0) / day.hourlyData.length) : 
                  Math.round(day.avgTemp)}°C
              </p>
              <p className="text-xs text-gray-500 mt-1">Mid-day temperature</p>
            </div>
          </div>
        </div>

        {/* Add custom scrollbar styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            height: 6px;
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${theme.accent ? theme.accent.replace('text-', '') : 'rgba(100, 100, 100, 0.5)'};
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${theme.highlight ? theme.highlight.replace('bg-', '') : 'rgba(80, 80, 80, 0.8)'};
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: ${theme.accent ? theme.accent.replace('text-', '') : 'rgba(100, 100, 100, 0.5)'} rgba(255, 255, 255, 0.1);
          }
        `}</style>
      </motion.div>
    </motion.div>
  );
};

export default ExpandedForecast;
