# 🌤️ WeatherWise - Your Personal Weather Assistant

> Never get caught in the rain again! ☔ WeatherWise brings you **real-time weather updates** and **accurate forecasts** right at your fingertips. 

🌍 **Auto-location** | 🔍 **Search Anywhere** | 📱 **Works Everywhere**

---

## ✨ Why WeatherWise?

### 🌡️ Real-time Weather at a Glance
- **Current Conditions** - See temperature, humidity, and more
- **Beautiful Icons** - Instantly recognize weather conditions
- "Feels Like" - Know what it really feels like outside

### 📅 Smart Forecasts
- 7-day forecast with high/low temperatures
- Hourly predictions for perfect planning
- Rain or shine, we've got you covered! ☔☀️

### 📍 Location Magic
- Auto-find me 🌍 (or)
- Type any city in the world
- Save your favorite spots

### 🎨 Beautiful Experience
- Works on phone, tablet, or computer
- Automatically adjusts to light/dark mode
- Smooth animations that make checking weather fun!

### 🤖 AI Weather Assistant
- Get smart weather summaries
- Personalized recommendations
- Natural language insights

---

## 🏗️ Under the Hood

Here's how everything's organized:

```
weather-app/
├── frontend/                 # React frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── AISummary.jsx      # AI weather insights
│   │   │   ├── CurrentWeather.jsx  # Current weather display
│   │   │   ├── ErrorMessage.jsx    # Error handling
│   │   │   ├── ForecastCards.jsx   # Daily forecast cards
│   │   │   ├── HourlyGraph.jsx     # Hourly weather graph
│   │   │   ├── Navbar.jsx          # Top navigation
│   │   │   ├── SearchBar.jsx       # City search component
│   │   │   ├── Sidebar.jsx         # Side navigation
│   │   │   ├── WeatherDetails.jsx  # Detailed weather info
│   │   │   └── WeatherMap.jsx      # Interactive weather map
│   │   │
│   │   ├── pages/           # Page components
│   │   │   ├── HomePage.jsx        # Main dashboard
│   │   │   ├── Forecast.jsx        # Forecast page
│   │   │   ├── ForecastCardList.jsx# List of forecast cards
│   │   │   ├── ForecastGraph.jsx   # Weather trends graph
│   │   │   ├── ExpandedForecast.jsx# Detailed forecast view
│   │   │   └── Locations.jsx       # Saved locations
│   │   │
│   │   ├── services/        # API services
│   │   │   └── weatherService.js   # Weather API calls
│   │   │
│   │   ├── utils/           # Utility functions
│   │   │   └── weatherThemes.js    # Weather-based theming
│   │   │
│   │   ├── App.jsx          # Main application component
│   │   └── main.jsx         # Application entry point
│   └── package.json         # Frontend dependencies
│
└── backend/                # Node.js backend
    ├── routes/             # API endpoints
    │   ├── weather.js      # Weather API routes
    │   └── gemini.js       # Gemini AI routes
    ├── .env                # Environment variables
    ├── package.json        # Backend dependencies
    └── server.js           # Server entry point
```

## 🎮 How to Use WeatherWise

### 🏠 Home Sweet Home
- **Current Weather** - See what's happening outside right now
- **Quick Stats** - Temperature, humidity, wind - all in one place
- **5-Day Preview** - Plan your week at a glance
- **One-Tap Access** to maps and AI insights

### 🌦️ Forecast Page
- Scroll through **7-day forecasts**
- Beautiful cards show daily weather
- Toggle between 7 or 10 days
- See temperature trends at a glance
- Expand any day for hourly details

### 🔍 Deep Dive View
- **Hour-by-hour breakdown** - Plan your day perfectly
- **Sunrise/Sunset** - Catch that golden hour! 🌅
- **Air Quality** - Breathe easy with air quality index
- **Weather Alerts** - Stay safe with instant notifications

---

## ⚙️ Behind the Scenes

### 🔄 How Data Flows
1. Your browser asks: "Where are we?" (with permission!)
2. We fetch weather data from trusted sources
3. Our AI adds smart insights
4. Everything gets a beautiful makeover before you see it

### 📱 Works Everywhere
- Looks great on phones, tablets, and computers
- Super fast loading
- Works even with slow internet

### 🤖 AI Magic
- Gets smarter with every use
- Understands natural language
- Always has a backup plan if AI is unavailable

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)
- OpenWeatherMap API key (free tier available)
- Google Gemini API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/weather-app.git
   cd weather-app
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server** (in the backend directory)
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:5000`

2. **Start the frontend** (in the frontend directory)
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## 🔑 Configuration

Create a `.env` file in the `backend` directory with the following variables:

```
PORT=5000
NODE_ENV=development
OPENWEATHERMAP_API_KEY=your_openweathermap_key_here
GEMINI_API_KEY=your_gemini_key_here
```

### Obtaining API Keys

1. **OpenWeatherMap API**:
   - Visit [OpenWeatherMap](https://openweathermap.org/api) and sign up for a free account
   - Navigate to the API keys section and create a new API key

2. **Google Gemini API** (optional):
   - Go to [Google AI Studio](https://ai.google.dev/)
   - Create an API key for the Gemini model

## 📝 Notes

- The app will automatically detect your location when you first open it (requires location access permission)
- You can search for any city using the search bar at the top
- For the best experience, allow location access in your browser
- AI features require a valid Gemini API key

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [Your Name]
