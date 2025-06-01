import { motion } from 'framer-motion';
import { WiSunrise, WiSunset, WiHumidity, WiStrongWind, WiBarometer, WiCloudy } from 'react-icons/wi';

const WeatherDetails = ({ data }) => {
  if (!data) return null;

  const {
    main: { humidity, pressure },
    wind,
    clouds,
    sys: { sunrise, sunset },
    visibility,
  } = data;

  // Convert Unix timestamps to readable time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const detailItems = [
    {
      id: 'sunrise',
      icon: <WiSunrise className="text-4xl text-yellow-500" />,
      title: 'Sunrise',
      value: formatTime(sunrise),
    },
    {
      id: 'sunset',
      icon: <WiSunset className="text-4xl text-orange-500" />,
      title: 'Sunset',
      value: formatTime(sunset),
    },
    {
      id: 'humidity',
      icon: <WiHumidity className="text-4xl text-blue-500" />,
      title: 'Humidity',
      value: `${humidity}%`,
    },
    {
      id: 'wind',
      icon: <WiStrongWind className="text-4xl text-teal-500" />,
      title: 'Wind Speed',
      value: `${wind.speed} m/s`,
    },
    {
      id: 'pressure',
      icon: <WiBarometer className="text-4xl text-purple-500" />,
      title: 'Pressure',
      value: `${pressure} hPa`,
    },
    {
      id: 'clouds',
      icon: <WiCloudy className="text-4xl text-gray-500" />,
      title: 'Cloudiness',
      value: `${clouds.all}%`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-effect p-6 rounded-xl"
    >
      <h3 className="text-xl font-semibold mb-4">Today's Highlights</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {detailItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            className="bg-white/50 p-4 rounded-lg flex flex-col items-center justify-center"
          >
            {item.icon}
            <h4 className="text-gray-500 mt-2">{item.title}</h4>
            <p className="text-lg font-semibold">{item.value}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default WeatherDetails;
