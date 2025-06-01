import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaMapMarkerAlt, FaLocationArrow, FaExclamationTriangle } from 'react-icons/fa';
import { WiDaySunny } from 'react-icons/wi';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ loading, error, isRequestingLocation, onRetryLocation }) => {
  const location = useLocation();
  const [showError, setShowError] = useState(false);
  
  // Show error message when error changes
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 10000); // Hide after 10 seconds
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  // Close error message
  const handleCloseError = () => {
    setShowError(false);
  };
  const [activeItem, setActiveItem] = useState(() => {
    // Set active item based on current path
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/forecast') return 'forecast';
    if (path === '/locations') return 'locations';
    return 'home';
  });

  const navItems = [
    { id: 'home', icon: <FaHome size="18" />, label: 'Home', path: '/' },
    { id: 'forecast', icon: <WiDaySunny size="22" />, label: 'Forecast', path: '/forecast' },
    { id: 'locations', icon: <FaMapMarkerAlt size="18" />, label: 'Locations', path: '/locations' },
  ];

  return (
    <div className="sticky top-0 z-50">
      {/* Error Banner */}
      <AnimatePresence>
        {showError && error && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="w-full bg-yellow-500 text-white text-sm p-2 flex items-center justify-between"
          >
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2" />
              <span>{error}</span>
            </div>
            <div className="flex items-center space-x-2">
              {onRetryLocation && (
                <button 
                  onClick={onRetryLocation}
                  disabled={isRequestingLocation}
                  className="px-2 py-1 bg-white/20 rounded hover:bg-white/30 text-xs flex items-center"
                >
                  {isRequestingLocation ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Locating...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FaLocationArrow className="mr-1" size={10} />
                      Retry
                    </span>
                  )}
                </button>
              )}
              <button 
                onClick={handleCloseError}
                className="px-2 py-1 hover:bg-white/20 rounded"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Navbar */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full py-2 px-4 bg-gradient-to-r from-blue-800 to-blue-700 shadow-md"
      >
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-white font-bold hover:text-blue-100 transition-colors flex items-center">
          <WiDaySunny size="32" className="mr-2 text-cyan-200" />
          <span className="text-lg font-semibold text-cyan-100">Weather App</span>
        </Link>

        <nav className="flex items-center space-x-1 sm:space-x-2">
          {navItems.map((item) => (
            <div key={item.id} className="relative group">
              <Link
                to={item.path}
                className={`navbar-item ${activeItem === item.id ? 'bg-blue-600/50 text-white' : 'hover:bg-blue-600/30 text-white'}`}
                onClick={() => setActiveItem(item.id)}
              >
                <span className="mr-1 sm:mr-2 text-blue-200">{item.icon}</span>
                <span className="hidden sm:inline text-sm font-medium text-white">{item.label}</span>
                
                {/* Mobile tooltip for small screens */}
                <span className="navbar-tooltip sm:hidden group-hover:scale-100 text-white">{item.label}</span>
              </Link>
              {activeItem === item.id && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-300 rounded-t-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
          ))}
        </nav>
      </div>
      </motion.div>
    </div>
  );
};

export default Navbar;
