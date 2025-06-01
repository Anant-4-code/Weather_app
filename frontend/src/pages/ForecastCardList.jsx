import React from 'react';
import { motion } from 'framer-motion';

const ForecastCardList = ({ forecast, forecastDays, theme, setExpandedDay }) => {
  if (!forecast) return null;

  // Group forecast data by day
  const groupedByDay = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  forecast.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    date.setHours(0, 0, 0, 0);
    const dayKey = date.toISOString().split('T')[0];
    
    if (!groupedByDay[dayKey]) {
      groupedByDay[dayKey] = [];
    }
    
    groupedByDay[dayKey].push(item);
  });

  // Get the daily data (average of each day)
  const dailyData = Object.keys(groupedByDay)
    .slice(0, forecastDays) // Limit to the specified number of days
    .map(dayKey => {
      const dayData = groupedByDay[dayKey];
      const date = new Date(dayKey);
      const isToday = date.getTime() === today.getTime();
      
      // Calculate average temperature
      const avgTemp = dayData.reduce((sum, item) => sum + item.main.temp, 0) / dayData.length;
      
      // Get the most common weather condition
      const weatherCounts = {};
      let mostCommonIcon = '';
      
      dayData.forEach(item => {
        const condition = item.weather[0].main;
        const icon = item.weather[0].icon;
        weatherCounts[condition] = (weatherCounts[condition] || 0) + 1;
        
        // Store the icon for the most common condition
        if (!weatherCounts[condition] || weatherCounts[condition] > (weatherCounts[mostCommonIcon] || 0)) {
          mostCommonIcon = icon;
        }
      });
      
      let mostCommonWeather = '';
      let maxCount = 0;
      
      Object.keys(weatherCounts).forEach(condition => {
        if (weatherCounts[condition] > maxCount) {
          maxCount = weatherCounts[condition];
          mostCommonWeather = condition;
        }
      });
      
      // Calculate average humidity and wind speed
      const avgHumidity = Math.round(dayData.reduce((sum, item) => sum + item.main.humidity, 0) / dayData.length);
      const avgWindSpeed = (dayData.reduce((sum, item) => sum + item.wind.speed, 0) / dayData.length).toFixed(1);
      
      // Get min and max temperature
      const minTemp = Math.min(...dayData.map(item => item.main.temp_min));
      const maxTemp = Math.max(...dayData.map(item => item.main.temp_max));
      
      // Prepare hourly data for expanded view
      const hourlyData = dayData.map(item => {
        const itemDate = new Date(item.dt * 1000);
        return {
          time: itemDate.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true }),
          temp: item.main.temp,
          feelsLike: item.main.feels_like,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed,
          pressure: item.main.pressure,
          clouds: item.clouds.all,
          visibility: item.visibility
        };
      });
      
      // Debug log
      console.log('Prepared hourly data:', hourlyData);
      
      return {
        date,
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayOfMonth: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        avgTemp: Math.round(avgTemp),
        minTemp: Math.round(minTemp),
        maxTemp: Math.round(maxTemp),
        weather: mostCommonWeather,
        weatherIcon: mostCommonIcon,
        humidity: avgHumidity,
        windSpeed: avgWindSpeed,
        isToday,
        hourlyData,
        // Add these fields for the expanded view
        day: date.toLocaleDateString('en-US', { weekday: 'long' }),
        dayMonth: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
        temps: dayData.map(item => item.main.temp),
        descriptions: dayData.map(item => item.weather[0].description),
        icons: dayData.map(item => item.weather[0].icon)
      };
    });

  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <div>
      <h2 className={`text-lg font-semibold mb-2 ${theme.text}`}>Daily Forecast</h2>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
      >
        {dailyData.map((day, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 }, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setExpandedDay(day)}
            className={`cursor-pointer ${theme.cardBg} rounded-lg p-2 sm:p-3 text-center ${theme.border} border shadow-md hover:shadow-xl transition-all duration-300`}
          >
            <div className="mb-1">
              <div className={`font-medium ${theme.text}`}>{day.dayOfWeek}</div>
              <div className={`text-xs ${theme.accent}`}>{day.dayOfMonth} {day.month}</div>
            </div>
            
            <div className="flex justify-center my-1 sm:my-2">
              <img 
                src={`https://openweathermap.org/img/wn/${day.weatherIcon}@2x.png`} 
                alt={day.weather}
                className="w-10 h-10 sm:w-12 sm:h-12"
              />
            </div>
            
            <div className={`text-lg font-bold ${theme.text} mb-1`}>
              {day.avgTemp}&#176;
              <span className={`text-xs font-normal ${theme.accent} ml-1`}>{day.maxTemp}&#176;</span>
            </div>
            
            <div className="grid grid-cols-2 gap-1 text-xs border-t border-gray-100 pt-1">
              <div className="text-left">
                <div className={theme.accent}>Humidity</div>
                <div className={`font-medium ${theme.text}`}>{day.humidity}%</div>
              </div>
              <div className="text-right">
                <div className={theme.accent}>Wind</div>
                <div className={`font-medium ${theme.text}`}>{day.windSpeed} m/s</div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default ForecastCardList;
