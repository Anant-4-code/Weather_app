import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '../components/SearchBar';
import CurrentWeather from '../components/CurrentWeather';
import WeatherDetails from '../components/WeatherDetails';
import ForecastCards from '../components/ForecastCards';
import HourlyGraph from '../components/HourlyGraph';
import AISummary from '../components/AISummary';

const HomePage = ({ weatherData, forecastData, loading, error, city, weatherTheme, handleCitySelect }) => {
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
  
  const renderContent = () => {
    if (loading) {
      return (
        <motion.div 
          className="flex justify-center items-center h-64"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </motion.div>
      );
    }

    if (!weatherData) {
      return (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="text-center py-12"
        >
          <h2 className="text-xl font-semibold mb-2">No weather data available</h2>
          <p className="text-gray-600">Search for a city to see the weather</p>
        </motion.div>
      );
    }

    return (
      <AnimatePresence>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: 20 }}
        >
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <motion.div 
              className="md:col-span-2"
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <CurrentWeather data={weatherData} theme={weatherTheme} />
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <AISummary weatherData={weatherData} theme={weatherTheme} />
            </motion.div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <WeatherDetails data={weatherData} theme={weatherTheme} />
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <HourlyGraph forecastData={forecastData} theme={weatherTheme} />
            </motion.div>
          </motion.div>
          
          <motion.div 
            variants={itemVariants} 
            className="mb-6"
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <ForecastCards forecastData={forecastData} theme={weatherTheme} />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <main className="flex-1 p-4 overflow-auto pt-16 text-sky-900"> 
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto"
      >
        <motion.div 
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-md p-4 mb-6 rounded-xl shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-300 relative overflow-hidden"
          whileHover={{ scale: 1.01 }}
        >
          <div className="relative z-10">
            <SearchBar onSearch={handleCitySelect} />
          </div>
          
          {/* Add shimmer effect behind the search bar */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-20"
            variants={shimmerEffect}
            initial="hidden"
            animate="visible"
          />
        </motion.div>
        
        {renderContent()}
      </motion.div>
    </main>
  );
};

export default HomePage;
