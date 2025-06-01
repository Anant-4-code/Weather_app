/**
 * Weather-themed UI color schemes
 * Each theme contains color classes for different UI elements based on weather conditions
 */

const weatherThemes = {
  // Golden Peach theme (for Sunny/Clear weather)
  GoldenPeach: {
    bg: 'bg-gradient-to-br from-[#fff4e6] to-[#ffd280]',
    cardBg: 'bg-white/80 backdrop-blur-md',
    text: 'text-[#4b371c]',
    accent: 'text-[#f6c453]',
    border: 'border-[#faae2b]',
    highlight: 'yellow-200',  
    shadow: 'rgba(255, 221, 153, 0.5)',
    icon: 'text-[#ffcf40]',
    secondaryText: 'text-[#5c3d1d]'
  },
  
  // Sunny / Clear weather theme
  Clear: {
    bg: 'bg-gradient-to-br from-yellow-100 to-yellow-400',
    cardBg: 'bg-white/70',
    text: 'text-yellow-900',
    accent: 'text-yellow-600',
    border: 'border-yellow-300',
    highlight: 'yellow-200',  
    shadow: 'rgba(253, 230, 138, 0.5)',
    icon: 'text-yellow-500'
  },
  
  // Rainy weather theme
  Rain: {
    bg: 'bg-gradient-to-br from-blue-100 to-blue-400',
    cardBg: 'bg-white/70',
    text: 'text-blue-900',
    accent: 'text-blue-600',
    border: 'border-blue-300',
    highlight: 'blue-200',  
    shadow: 'rgba(191, 219, 254, 0.5)',
    icon: 'text-blue-500'
  },
  
  // Cloudy weather theme
  Clouds: {
    bg: 'bg-gradient-to-br from-gray-200 to-gray-400',
    cardBg: 'bg-white/70',
    text: 'text-gray-800',
    accent: 'text-gray-600',
    border: 'border-gray-300',
    highlight: 'gray-200',  
    shadow: 'rgba(229, 231, 235, 0.5)',
    icon: 'text-gray-500'
  },
  
  // Snowy weather theme
  Snow: {
    bg: 'bg-gradient-to-br from-blue-50 to-blue-200',
    cardBg: 'bg-white/80',
    text: 'text-blue-800',
    accent: 'text-blue-500',
    border: 'border-blue-200',
    highlight: 'blue-100',  
    shadow: 'rgba(219, 234, 254, 0.5)',
    icon: 'text-blue-400'
  },
  
  // Thunderstorm weather theme
  Thunderstorm: {
    bg: 'bg-gradient-to-br from-gray-700 to-gray-900',
    cardBg: 'bg-gray-800/50',
    text: 'text-white',
    accent: 'text-yellow-400',
    border: 'border-gray-600',
    highlight: 'yellow-200',  
    shadow: 'rgba(17, 24, 39, 0.5)',
    icon: 'text-yellow-400'
  },
  
  // Misty/Foggy weather theme
  Mist: {
    bg: 'bg-gradient-to-br from-gray-300 to-gray-500',
    cardBg: 'bg-white/50',
    text: 'text-gray-800',
    accent: 'text-gray-600',
    border: 'border-gray-400',
    highlight: 'gray-200',  
    shadow: 'rgba(209, 213, 219, 0.5)',
    icon: 'text-gray-500'
  },
  
  // Drizzle weather theme
  Drizzle: {
    bg: 'bg-gradient-to-br from-blue-200 to-blue-300',
    cardBg: 'bg-white/70',
    text: 'text-blue-800',
    accent: 'text-blue-500',
    border: 'border-blue-300',
    highlight: 'blue-100',  
    shadow: 'rgba(191, 219, 254, 0.5)',
    icon: 'text-blue-400'
  },
  
  // Default theme (fallback)
  default: {
    bg: 'bg-gradient-to-br from-primary-100 to-primary-300',
    cardBg: 'bg-white/70',
    text: 'text-gray-800',
    accent: 'text-primary-600',
    border: 'border-primary-300',
    highlight: 'primary-200',  
    shadow: 'rgba(191, 219, 254, 0.5)',
    icon: 'text-primary-500'
  }
};

/**
 * Get theme based on weather condition
 *
 * @param {string} condition - Weather condition from API
 * @returns {Object} - Theme object with color classes
 */
export function getThemeByWeather(condition) {
  if (!condition) return weatherThemes.default;
  
  // Check if the condition exists directly
  if (weatherThemes[condition]) {
    return weatherThemes[condition];
  }
  
  // Check for partial matches
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
    return weatherThemes.GoldenPeach; // Use the new Golden Peach theme for clear/sunny weather
  } else if (conditionLower.includes('rain') || conditionLower.includes('shower')) {
    return weatherThemes.Rain;
  } else if (conditionLower.includes('cloud')) {
    return weatherThemes.Clouds;
  } else if (conditionLower.includes('snow') || conditionLower.includes('flurr')) {
    return weatherThemes.Snow;
  } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
    return weatherThemes.Thunderstorm;
  } else if (conditionLower.includes('mist') || conditionLower.includes('fog') || conditionLower.includes('haze')) {
    return weatherThemes.Mist;
  } else if (conditionLower.includes('drizzle')) {
    return weatherThemes.Drizzle;
  }
  
  // Default fallback
  return weatherThemes.default;
}

/**
 * Get theme for specific pages
 *
 * @param {string} page - Page name ('home', 'forecast', 'locations')
 * @returns {Object} - Theme object with color classes
 */
export function getPageTheme(page) {
  // Default to blue theme if page not specified
  if (!page) return {
    bg: 'bg-gradient-to-br from-blue-100 to-blue-300',
    cardBg: 'bg-white/70',
    text: 'text-gray-800',
    accent: 'text-blue-600',
    border: 'border-blue-300',
    highlight: 'blue-200',
    shadow: 'rgba(191, 219, 254, 0.5)',
    icon: 'text-blue-500',
    secondaryText: 'text-gray-600'
  };
  
  // Page-specific themes
  switch (page.toLowerCase()) {
    case 'home':
      return weatherThemes.GoldenPeach;
      
    case 'forecast':
      return {
        bg: 'bg-gradient-to-br from-sky-100 to-sky-300',
        cardBg: 'bg-white/70',
        text: 'text-sky-900',
        accent: 'text-sky-600',
        border: 'border-sky-300',
        highlight: 'sky-200',
        shadow: 'rgba(186, 230, 253, 0.5)',
        icon: 'text-sky-500',
        secondaryText: 'text-sky-700'
      };
      
    case 'locations':
      return {
        bg: 'bg-gradient-to-br from-indigo-100 to-teal-200',
        cardBg: 'bg-white/70',
        text: 'text-indigo-900',
        accent: 'text-teal-600',
        border: 'border-indigo-300',
        highlight: 'teal-200',
        shadow: 'rgba(199, 210, 254, 0.5)',
        icon: 'text-indigo-500',
        secondaryText: 'text-indigo-700'
      };
      
    default:
      return weatherThemes.default;
  }
}

export default weatherThemes;
