import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { format } from 'date-fns';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('7');
  const [city, setCity] = useState('London');

  const fetchWeatherAnalytics = async (city, range) => {
    const response = await fetch(
      `${API_BASE_URL}/weather/analytics?city=${encodeURIComponent(city)}&days=${range}`
    );
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch weather analytics');
    }
    
    return response.json();
  };

  const fetchAnalytics = async (selectedCity = city, range = dateRange) => {
    const trimmedCity = selectedCity.trim();
    
    if (!trimmedCity) {
      setError('Please enter a city name');
      return;
    }

    // Basic city name validation
    if (!/^[a-zA-Z\s,.'-]+$/.test(trimmedCity)) {
      setError('Please enter a valid city name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchWeatherAnalytics(trimmedCity, range);
      
      // Validate the response data
      if (!result || !result.temperatureData || !Array.isArray(result.temperatureData)) {
        throw new Error('No data available for the selected location and date range');
      }
      
      setData(result);
      setCity(trimmedCity);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Clear previous results when starting a new search
    setData(null);
    fetchAnalytics();
  };

  const handleDateRangeChange = (e) => {
    const newRange = e.target.value;
    setDateRange(newRange);
    // Only refetch if we already have data (user is changing the range)
    if (data) {
      fetchAnalytics(city, newRange);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchAnalytics();
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading weather data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
              <button
                onClick={() => fetchAnalytics()}
                className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.temperatureData?.length) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No weather data available</h3>
        <p className="mt-1 text-sm text-gray-500">Please try a different city or date range.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <form onSubmit={handleSearch} className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
            Weather Analytics for {city}
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="flex-1">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter city name"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
                Days
              </label>
              <select
                id="dateRange"
                value={dateRange}
                onChange={handleDateRangeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="3">Last 3 Days</option>
                <option value="7">Last 7 Days</option>
                <option value="14">Last 14 Days</option>
                <option value="30">Last 30 Days</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 h-[42px]"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      </form>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Temperature Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.temperatureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(date) => format(new Date(date), 'MMM d')}
              />
              <YAxis 
                label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                formatter={(value, name) => [value, name === 'temp' ? 'Temperature' : name]}
                labelStyle={{ color: '#4B5563' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="temp" 
                name="Temperature (°C)" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="humidity" 
                name="Humidity (%)" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Weather Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Average Temperature:</span>
              <span className="font-medium">{data.averages?.temp?.toFixed(1)}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max Temperature:</span>
              <span className="font-medium">{data.max?.temp?.toFixed(1)}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Min Temperature:</span>
              <span className="font-medium">{data.min?.temp?.toFixed(1)}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Humidity:</span>
              <span className="font-medium">{data.averages?.humidity?.toFixed(1)}%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Wind Speed</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.temperatureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis 
                  label={{ value: 'Wind Speed (m/s)', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                  formatter={(value, name) => [value, name === 'wind_speed' ? 'Wind Speed' : name]}
                  labelStyle={{ color: '#4B5563' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="wind_speed" 
                  name="Wind Speed (m/s)" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>  );
};

export default Analytics;
