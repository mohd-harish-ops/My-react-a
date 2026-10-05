# Vite + React Weather App

A weather app that shows current temperature, wind speed, and humidity for
any city — no API key or signup required (uses the free [Open-Meteo](https://open-meteo.com) API).

## Setup

```bash
npm install
```

## Run in development

```bash
npm run dev
```

Opens at http://localhost:5173

## How it works

1. User types a city name and submits the form.
2. The app calls Open-Meteo's **Geocoding API** to convert the city name
   into latitude/longitude.
3. It then calls the **Forecast API** with those coordinates to get the
   current weather (temperature, wind speed, weather code).
4. The weather code (a WMO standard number) is mapped to a human-readable
   label and emoji icon in `App.jsx`.

No `.env` file or API key needed — Open-Meteo's free tier works directly
from the browser.

## Project structure

```
vite-weather-app/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx       # React entry point
    ├── App.jsx        # Weather search + fetch logic
    ├── App.css        # Styles
    └── index.css      # Global styles
```
