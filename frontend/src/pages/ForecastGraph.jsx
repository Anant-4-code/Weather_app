import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ForecastGraph = ({ forecast, forecastDays, theme }) => {
  const [activeTab, setActiveTab] = useState('temperature');

  if (!forecast || !forecast.list) return null;

  // Prepare data for the chart
  const prepareChartData = () => {
    // Limit data to the selected number of days
    const limitedData = forecast.list.slice(0, forecastDays * 8); // 8 data points per day (3-hour intervals)
    
    // Format dates for x-axis labels
    const labels = limitedData.map(item => {
      const date = new Date(item.dt * 1000);
      return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }) + ' ' + 
             date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true });
    });
    
    // Get temperature data
    const temperatureData = limitedData.map(item => Math.round(item.main.temp));
    
    // Get humidity data
    const humidityData = limitedData.map(item => item.main.humidity);
    
    // Get wind speed data
    const windData = limitedData.map(item => item.wind.speed);
    
    return { labels, temperatureData, humidityData, windData };
  };
  
  const { labels, temperatureData, humidityData, windData } = prepareChartData();
  
  // Chart options
  const getChartOptions = () => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 10,
          right: 25,
          bottom: 10,
          left: 25
        }
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#1e293b',
          bodyColor: '#1e293b',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          titleFont: {
            size: 14,
            weight: 'bold',
          },
          bodyFont: {
            size: 12,
          },
          callbacks: {
            title: function(tooltipItems) {
              return tooltipItems[0].label;
            },
            label: function(context) {
              let label = '';
              if (activeTab === 'temperature') {
                label = `Temperature: ${context.raw}\u00b0C`;
              } else if (activeTab === 'humidity') {
                label = `Humidity: ${context.raw}%`;
              } else if (activeTab === 'wind') {
                label = `Wind Speed: ${context.raw} m/s`;
              }
              return label;
            }
          }
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            maxRotation: 0,
            minRotation: 0,
            autoSkip: true,
            maxTicksLimit: 8,
            color: '#64748b',
            font: {
              size: 10,
            },
            callback: function(val, index) {
              // Only show date (not time) for first point of each day
              const label = this.getLabelForValue(val);
              if (index === 0 || label.includes('12 AM')) {
                return label.split(' ')[0] + ' ' + label.split(' ')[1]; // Show day and date
              }
              return label.split(' ')[2]; // Show only time
            }
          },
        },
        y: {
          grid: {
            color: 'rgba(226, 232, 240, 0.5)',
          },
          ticks: {
            color: '#64748b',
            font: {
              size: 12,
            },
            padding: 8,
            callback: function(value) {
              if (activeTab === 'temperature') {
                return value + '\u00b0C';
              } else if (activeTab === 'humidity') {
                return value + '%';
              } else if (activeTab === 'wind') {
                return value + ' m/s';
              }
              return value;
            }
          },
          beginAtZero: activeTab === 'humidity' || activeTab === 'wind',
        },
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      elements: {
        line: {
          tension: 0.3,
        },
        point: {
          radius: 1,
          hoverRadius: 5,
        },
      },
    };
  };

  // Chart data
  const getChartData = () => {
    let data = [];
    let borderColor = '';
    let backgroundColor = '';
    
    if (activeTab === 'temperature') {
      data = temperatureData;
      // Use theme colors for temperature with proper opacity
      borderColor = '#f97316'; // Orange for temperature
      backgroundColor = 'rgba(249, 115, 22, 0.2)';
    } else if (activeTab === 'humidity') {
      data = humidityData;
      borderColor = '#0ea5e9'; // Blue for humidity
      backgroundColor = 'rgba(14, 165, 233, 0.2)';
    } else if (activeTab === 'wind') {
      data = windData;
      borderColor = '#10b981'; // Green for wind
      backgroundColor = 'rgba(16, 185, 129, 0.2)';
    }
    
    return {
      labels,
      datasets: [
        {
          label: activeTab.charAt(0).toUpperCase() + activeTab.slice(1),
          data,
          borderColor,
          backgroundColor,
          fill: true,
          pointBackgroundColor: borderColor,
          pointBorderColor: '#fff',
          pointBorderWidth: 1,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: borderColor,
          pointHoverBorderWidth: 2,
        },
      ],
    };
  };

  // Tab animation variants
  const tabVariants = {
    inactive: { scale: 1 },
    active: { scale: 1.05 }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className={`text-xl font-semibold ${theme.text}`}>Weather Trends</h2>
        <div className="flex bg-gray-100 rounded-md p-0.5 mt-2 sm:mt-0">
          <motion.button
            variants={tabVariants}
            animate={activeTab === 'temperature' ? 'active' : 'inactive'}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1 text-sm rounded-md transition-all ${activeTab === 'temperature' ? `bg-white shadow-sm ${theme.text}` : 'text-gray-600'}`}
            onClick={() => setActiveTab('temperature')}
          >
            Temperature
          </motion.button>
          <motion.button
            variants={tabVariants}
            animate={activeTab === 'humidity' ? 'active' : 'inactive'}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1 text-sm rounded-md transition-all ${activeTab === 'humidity' ? `bg-white shadow-sm ${theme.text}` : 'text-gray-600'}`}
            onClick={() => setActiveTab('humidity')}
          >
            Humidity
          </motion.button>
          <motion.button
            variants={tabVariants}
            animate={activeTab === 'wind' ? 'active' : 'inactive'}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1 text-sm rounded-md transition-all ${activeTab === 'wind' ? `bg-white shadow-sm ${theme.text}` : 'text-gray-600'}`}
            onClick={() => setActiveTab('wind')}
          >
            Wind
          </motion.button>
        </div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-[220px] sm:h-[250px] w-full"
      >
        <Line data={getChartData()} options={getChartOptions()} />
      </motion.div>
      
      <div className={`text-center mt-1 text-xs ${theme.accent}`}>
        {activeTab === 'temperature' && `Temperature forecast for the next ${forecastDays} days`}
        {activeTab === 'humidity' && `Humidity forecast for the next ${forecastDays} days`}
        {activeTab === 'wind' && `Wind speed forecast for the next ${forecastDays} days`}
      </div>
    </div>
  );
};

export default ForecastGraph;
