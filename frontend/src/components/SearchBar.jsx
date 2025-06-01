import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaSearch } from 'react-icons/fa';
import { fetchCitySuggestions } from '../services/weatherService';
import { createPortal } from 'react-dom';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Update dropdown position when showing
  useEffect(() => {
    if (showDropdown && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [showDropdown, suggestions]);

  // Fetch city suggestions when search term changes
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    
    setLoading(true);
    const timeoutId = setTimeout(() => {
      fetchCitySuggestions(searchTerm).then((results) => {
        setSuggestions(results);
        setShowDropdown(results.length > 0);
        setLoading(false);
      });
    }, 300); // Debounce
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
      setShowDropdown(false);
    }
  };

  const handleSelect = (cityObj) => {
    setSearchTerm(`${cityObj.name}, ${cityObj.country}`);
    setShowDropdown(false);
    setSuggestions([]);
    onSearch(cityObj.name);
  };

  // Create a portal for the dropdown
  const SuggestionsDropdown = () => {
    if (!showDropdown || suggestions.length === 0) return null;
    
    return createPortal(
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl max-h-60 overflow-y-auto"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          zIndex: 9999
        }}
      >
        {suggestions.map((city, idx) => (
          <div
            key={`${city.name}-${city.lat}-${city.lon}-${idx}`}
            className="px-4 py-2 cursor-pointer hover:bg-blue-100 transition-colors text-gray-800 font-medium"
            onClick={() => handleSelect(city)}
          >
            {city.name}, {city.state ? `${city.state}, ` : ''}{city.country}
          </div>
        ))}
      </motion.div>,
      document.body
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative w-full"
    >
      <form onSubmit={handleSubmit} className="flex items-center">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="w-4 h-4 text-gray-500" />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="bg-white/70 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2.5 transition-all duration-300 ease-in-out"
            placeholder="Search for a city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            autoComplete="off"
            required
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <div className="animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent"></div>
            </div>
          )}
        </div>
        <button
          type="submit"
          className="p-2.5 ml-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 transition-all duration-300 ease-in-out"
        >
          <FaSearch className="w-4 h-4" />
          <span className="sr-only">Search</span>
        </button>
      </form>
      
      <SuggestionsDropdown />
    </motion.div>
  );
};

export default SearchBar;