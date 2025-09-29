
# Weather Forecast (React Native + Expo)

A cross-platform **React Native + Expo** weather forecast application powered by the **OpenWeatherMap API**.

##  Features
- **Current Weather**: Temperature, feels-like, humidity, wind speed, sunrise/sunset.
- **Hourly Forecast**: Next 24 hours with icons, temperature, and two-line descriptions.
- **Daily Forecast**: 5-day outlook with min/max temperatures and weather icons.
- **Unit Toggle**: Switch between °C and °F.
- **City Search**: Autocomplete search with suggestions.
- **Geolocation**: Automatically fetch weather based on device location.
- **Error Handling**: Error banner for API or location issues.
- **Dark/Light Themes**: Automatically switches depending on time of day.

##  Project Structure
```
app/
  _layout.tsx            # Optional (Expo Router support)
  index.tsx              # Main entry screen
  owm.ts                 # OpenWeatherMap API wrapper
  components/
    ErrorBanner.tsx
    ForecastDaily.tsx
    ForecastHourly.tsx
    SearchBar.tsx
    UnitToggle.tsx
    WeatherNow.tsx
app.json
theme.ts                 # Theme configuration (light/dark/pickTheme)
.eslint.config.js
package.json
tsconfig.json
README.md
```

##  Setup & Run
1. Install dependencies:
```bash
npm install
```

2. Add your OpenWeatherMap API key in `app.json` under `extra`:
```json
{
  "expo": {
    "extra": {
      "owmApiKey": "YOUR_API_KEY_HERE"
    }
  }
}
```

3. Start the app:
```bash
npx expo start
```

4. Scan the QR code with **Expo Go** on your device.

## 🔌 Data Flow
1. `index.tsx` requests location permission → `setCoords(...)`  
2. On `coords/units` change → calls `fetchWeather(...)` and `fetchForecast3h(...)` from `owm.ts`  
3. Passes data into components: `WeatherNow`, `ForecastHourly`, `ForecastDaily`.

##  Implementation Notes
- **WeatherNow** expects `weather.current` to contain:  
  `temp`, `feels_like`, `humidity`, `wind_speed`, `sunrise`, `sunset`, and `weather[]`.  
  Make sure `owm.ts` returns these values:
  ```ts
  current: {
    temp: data.main.temp,
    feels_like: data.main.feels_like,
    humidity: data.main.humidity,
    wind_speed: data.wind?.speed,
    sunrise: data.sys?.sunrise,
    sunset: data.sys?.sunset,
    weather: data.weather,
  }
  ```
- **ForecastHourly** descriptions are displayed in two lines (`numberOfLines={2}`) for better fit.

##  Initial Load (iOS/Android)
On first launch, the app requests location permission:  
- Allowed → loads weather automatically.  
- Denied → user can search manually (optional: fallback to a default city in `index.tsx`).

##  Test Scenarios
- Search by city input and suggestion
- Toggle °C/°F (all components update)
- Location permission denied → manual search
- Dark/light theme switch (day vs. night)

## 🛠 Troubleshooting
- **Feels/Humidity/Wind not showing** → ensure `owm.ts` includes these fields in `current`.
- **Blank screen on startup** → ensure initial geolocation effect runs on **all platforms** (remove `Platform.OS === "web"`).
- **Long descriptions cut off** → `ForecastHourly` supports `numberOfLines={2}` with `ellipsizeMode="tail"`.



---

Built with ❤️ using React Native + Expo and OpenWeatherMap API.
