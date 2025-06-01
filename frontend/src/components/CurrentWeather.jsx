import { motion } from 'framer-motion';
import { WiThermometer, WiHumidity, WiStrongWind, WiBarometer } from 'react-icons/wi';

const CurrentWeather = ({ data, theme }) => {
  if (!data) return null;

  const {
    name,
    main: { temp, feels_like, humidity, pressure },
    weather,
    wind,
    sys: { country },
  } = data;

  // Format date
  const currentDate = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = currentDate.toLocaleDateString(undefined, dateOptions);
  
  // Get weather icon URL
  const weatherIcon = `https://openweathermap.org/img/wn/${weather[0].icon}@4x.png`;
  const weatherDescription = weather[0].description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`overflow-hidden rounded-xl ${theme.cardBg} backdrop-blur-sm border ${theme.border} shadow-lg`}
    >
      <div className="p-6 relative">
        {/* Background gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg.replace('bg-gradient-to-br', '')} opacity-20 z-0`}></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div>
              <h2 className={`text-3xl font-bold ${theme.text}`}>{name}, {country}</h2>
              <p className="text-gray-600">{formattedDate}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className={`text-5xl font-bold ${theme.text}`}>{Math.round(temp)}°C</span>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center mb-6">
            <div className="flex items-center mr-6">
              <img src={weatherIcon} alt={weatherDescription} className="w-20 h-20" />
              <span className={`text-xl capitalize ${theme.text}`}>{weatherDescription}</span>
            </div>
            <div className="flex items-center mt-4 md:mt-0">
              <WiThermometer className={`${theme.icon} text-2xl mr-1`} />
              <span className={theme.text}>Feels like {Math.round(feels_like)}°C</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`flex items-center p-3 ${theme.cardBg} rounded-lg`}>
              <WiHumidity className={`${theme.icon} text-3xl mr-2`} />
              <div>
                <p className="text-sm text-gray-500">Humidity</p>
                <p className={`text-lg font-semibold ${theme.text}`}>{humidity}%</p>
              </div>
            </div>
            
            <div className={`flex items-center p-3 ${theme.cardBg} rounded-lg`}>
              <WiStrongWind className={`${theme.icon} text-3xl mr-2`} />
              <div>
                <p className="text-sm text-gray-500">Wind Speed</p>
                <p className={`text-lg font-semibold ${theme.text}`}>{wind.speed} m/s</p>
              </div>
            </div>
            
            <div className={`flex items-center p-3 ${theme.cardBg} rounded-lg`}>
              <WiBarometer className={`${theme.icon} text-3xl mr-2`} />
              <div>
                <p className="text-sm text-gray-500">Pressure</p>
                <p className={`text-lg font-semibold ${theme.text}`}>{pressure} hPa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CurrentWeather;
