import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaCalendarAlt, FaMapMarkerAlt, FaChartLine, FaCog } from 'react-icons/fa';
import { WiDaySunny } from 'react-icons/wi';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(() => {
    // Set active item based on current path
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/forecast') return 'forecast';
    if (path === '/locations') return 'locations';
    if (path === '/analytics') return 'analytics';
    if (path === '/calendar') return 'calendar';
    if (path === '/settings') return 'settings';
    return 'home';
  });

  const sidebarItems = [
    { id: 'home', icon: <FaHome size="20" />, label: 'Home', path: '/' },
    { id: 'forecast', icon: <WiDaySunny size="24" />, label: 'Forecast', path: '/forecast' },
    { id: 'locations', icon: <FaMapMarkerAlt size="20" />, label: 'Locations', path: '/locations' },
    { id: 'analytics', icon: <FaChartLine size="20" />, label: 'Analytics', path: '/analytics' },
    { id: 'calendar', icon: <FaCalendarAlt size="20" />, label: 'Calendar', path: '/calendar' },
    { id: 'settings', icon: <FaCog size="20" />, label: 'Settings', path: '/settings' },
  ];

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center w-16 h-screen py-8 bg-gradient-to-b from-secondary-900 to-secondary-800 dark:from-secondary-950 dark:to-secondary-900"
    >
      <div className="flex flex-col items-center mt-6 -mx-2">
        <Link to="/" className="mx-2 mt-2 mb-8 text-white font-bold hover:text-primary-400 transition-colors">
          <WiDaySunny size="32" />
        </Link>
      </div>

      <div className="flex flex-col items-center mt-6 w-full">
        {sidebarItems.map((item) => (
          <div key={item.id} className="relative w-full flex justify-center">
            <Link
              to={item.path}
              className={`sidebar-icon ${activeItem === item.id ? 'bg-secondary-200 dark:bg-secondary-700' : ''}`}
              onClick={() => setActiveItem(item.id)}
            >
              {item.icon}
              <span className="sidebar-tooltip group-hover:scale-100">{item.label}</span>
            </Link>
            {activeItem === item.id && (
              <motion.div
                layoutId="sidebar-indicator"
                className="absolute left-0 w-1 h-8 bg-primary-500 rounded-r-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Sidebar;
