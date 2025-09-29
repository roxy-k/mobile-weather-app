import Constants from "expo-constants"; 
const cfg: any = (Constants as any)?.expoConfig ?? (Constants as any)?.manifest ?? {};  
const API_KEY: string | undefined = cfg?.extra?.owmApiKey;                    
if (!API_KEY) throw new Error("OpenWeather API key is missing");              

const BASE = "https://api.openweathermap.org/data/2.5";                       
const GEO  = "https://api.openweathermap.org/geo/1.0";                        


export async function fetchWeather(lat: number, lon: number, units: string) {
  const url = `${BASE}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch weather");
  const data = await res.json();

  return {
    lat: data.coord.lat,
    lon: data.coord.lon,
    name: data.name,
    locationName: `${data.name}${data.sys?.country ? ", " + data.sys.country : ""}`,
    current: {
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      sunrise: data.sys?.sunrise,
      sunset: data.sys?.sunset,
      weather: data.weather,
    },
  };
}


export async function fetchWeatherByCity(q: string, units: string) {
  const url = `${BASE}/weather?q=${encodeURIComponent(q)}&appid=${API_KEY}&units=${units}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("City not found");
  const data = await res.json();

  return {
    lat: data.coord.lat,
    lon: data.coord.lon,
    name: data.name,
    locationName: `${data.name}${data.sys?.country ? ", " + data.sys.country : ""}`,
    current: {
      temp: data.main.temp,
      sunrise: data.sys?.sunrise,
      sunset: data.sys?.sunset,
      weather: data.weather,
    },
  };
}


export async function fetchForecast3h(lat: number, lon: number, units: string) {
  const url = `${BASE}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch forecast");
  const data = await res.json();

  return (data.list ?? []).map((it: any) => ({
    dt: it.dt,
    dt_txt: it.dt_txt,
    main: { temp: it.main.temp },
    weather: it.weather,
    description: it.weather?.[0]?.description,
  }));
}


export async function searchCities(
  q: string,
  near?: { lat: number; lon: number },
  limit = 8
) {
  if (!q) return [];
  const url = `${GEO}/direct?q=${encodeURIComponent(q)}&limit=${limit}&appid=${API_KEY}`; 
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geo lookup failed");
  const data = await res.json();

  const list = (Array.isArray(data) ? data : []).map((c: any) => ({
    label: `${c.name}${c.state ? ", " + c.state : ""}, ${c.country}`,
    lat: c.lat,
    lon: c.lon,
  }));

  if (near && Number.isFinite(near.lat) && Number.isFinite(near.lon)) {
    list.sort(
      (a, b) =>
        (a.lat - near.lat) ** 2 + (a.lon - near.lon) ** 2 -
        ((b.lat - near.lat) ** 2 + (b.lon - near.lon) ** 2)
    );
  }
  return list;
}

