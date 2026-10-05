import { useState } from 'react'
import './App.css'

// WMO Weather interpretation codes -> description + emoji
// Reference: https://open-meteo.com/en/docs
const WEATHER_CODES = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mainly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Fog', icon: '🌫️' },
  48: { label: 'Depositing rime fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Moderate drizzle', icon: '🌦️' },
  55: { label: 'Dense drizzle', icon: '🌧️' },
  61: { label: 'Slight rain', icon: '🌧️' },
  63: { label: 'Moderate rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  71: { label: 'Slight snow', icon: '🌨️' },
  73: { label: 'Moderate snow', icon: '🌨️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  80: { label: 'Rain showers', icon: '🌦️' },
  81: { label: 'Moderate rain showers', icon: '🌧️' },
  82: { label: 'Violent rain showers', icon: '⛈️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm with hail', icon: '⛈️' },
  99: { label: 'Thunderstorm with heavy hail', icon: '⛈️' },
}

function getWeatherInfo(code) {
  return WEATHER_CODES[code] || { label: 'Unknown', icon: '❓' }
}

function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const searchWeather = async (e) => {
    e.preventDefault()
    const query = city.trim()
    if (!query) return

    setLoading(true)
    setError('')
    setWeather(null)

    try {
      // Step 1: Convert city name -> latitude/longitude (free, no API key)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1`
      )
      const geoData = await geoRes.json()

      if (!geoData.results || geoData.results.length === 0) {
        setError(`"${query}" nahi mila. Spelling check karo.`)
        setLoading(false)
        return
      }

      const { latitude, longitude, name, country, admin1 } = geoData.results[0]

      // Step 2: Fetch current weather for that location (free, no API key)
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relative_humidity_2m&timezone=auto`
      )
      const weatherData = await weatherRes.json()

      // Find current hour's humidity from hourly data
      const currentHourIndex = weatherData.hourly.time.indexOf(
        weatherData.current_weather.time.slice(0, 13) + ':00'
      )
      const humidity =
        currentHourIndex !== -1
          ? weatherData.hourly.relative_humidity_2m[currentHourIndex]
          : null

      setWeather({
        city: name,
        region: admin1,
        country,
        temp: weatherData.current_weather.temperature,
        windSpeed: weatherData.current_weather.windspeed,
        weatherCode: weatherData.current_weather.weathercode,
        humidity,
        time: weatherData.current_weather.time,
      })
    } catch (err) {
      setError('Kuch gadbad ho gayi. Internet connection check karo.')
    } finally {
      setLoading(false)
    }
  }

  const info = weather ? getWeatherInfo(weather.weatherCode) : null

  return (
    <div className="app">
      <h1>🌦️ Weather App</h1>

      <form className="search-form" onSubmit={searchWeather}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Shehar ka naam likho (e.g. Delhi, Mumbai)"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-card">
          <h2>
            {weather.city}
            {weather.region ? `, ${weather.region}` : ''}
          </h2>
          <p className="country">{weather.country}</p>

          <div className="main-info">
            <span className="icon">{info.icon}</span>
            <span className="temp">{Math.round(weather.temp)}°C</span>
          </div>
          <p className="condition">{info.label}</p>

          <div className="details">
            <div className="detail-item">
              <span className="detail-label">💨 Wind</span>
              <span className="detail-value">{weather.windSpeed} km/h</span>
            </div>
            {weather.humidity !== null && (
              <div className="detail-item">
                <span className="detail-label">💧 Humidity</span>
                <span className="detail-value">{weather.humidity}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!weather && !error && !loading && (
        <p className="hint">Kisi bhi shehar ka naam daalke mausam check karo.</p>
      )}
    </div>
  )
}

export default App
