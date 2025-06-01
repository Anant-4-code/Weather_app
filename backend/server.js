require('dotenv').config();
const express = require('express');
const cors = require('cors');
const weatherRoutes = require('./routes/weather');
const geminiRoutes = require('./routes/gemini');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Configure CORS based on environment
const corsOptions = {
  origin: isProduction 
    ? ['https://your-frontend-domain.com'] // Replace with your frontend domain
    : 'http://localhost:5173', // Default Vite dev server
  optionsSuccessStatus: 200,
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Log environment for debugging
console.log(`Running in ${isProduction ? 'production' : 'development'} mode`);

// Serve static files in production
if (isProduction) {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // Handle SPA routing - serve index.html for all routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Routes
app.use('/api/weather', weatherRoutes);
app.use('/api/gemini', geminiRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: err.message || 'An unexpected error occurred',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
