// app/index.tsx
import * as Location from "expo-location";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { fetchForecast3h, fetchWeather, fetchWeatherByCity, searchCities } from "./owm";

import { light, pickTheme, type Theme } from "../theme";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import ErrorBanner from "../components/ErrorBanner";
import ForecastDaily from "../components/ForecastDaily";
import ForecastHourly from "../components/ForecastHourly";
import SearchBar, { type Suggestion } from "../components/SearchBar";
import UnitToggle from "../components/UnitToggle";
import WeatherNow from "../components/WeatherNow";


              

type Units = "metric" | "imperial";
type Coords = { lat: number; lon: number };

type HourlyItem = {
  dt: number;
  temp: number;
  main: string;
  description: string;
};

type Day = { dt: number; main: string; min: number; max: number };

export default function HomeScreen() {
  const [units, setUnits] = useState<Units>("metric");
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [weather, setWeather] = useState<any>(null);
  const [hourly, setHourly] = useState<HourlyItem[]>([]);
  const [daily, setDaily] = useState<Day[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);   
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null); 

  const onChangeSearch = (q: string) => {                               
  if (debounceRef.current) clearTimeout(debounceRef.current);         
  if (!q || q.trim().length < 2) { setSuggestions([]); return; }      
  debounceRef.current = setTimeout(async () => {                      
    try {                                                           
      const res = await searchCities(q.trim(), coords ?? undefined);  
      setSuggestions(res);                                            
    } catch {                                                         
      setSuggestions([]);                                             
    }                                                                 
  }, 250);                                                            
};                                                                     

const onPickCity = (s: Suggestion) => {                                
  setSuggestions([]);                                                
  setCoords({ lat: s.lat, lon: s.lon });                               
};                                                                     



  const [geos, setGeos] = useState<Suggestion[]>([]);
  const geoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const theme: Theme = weather ? pickTheme(weather) : light;

  // initial location (run on all platforms)
useEffect(() => {
  (async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setCoords({ lat: loc.coords.latitude, lon: loc.coords.longitude });
    } catch (e: any) {
      setError(e?.message || "Location error");
    }
  })();
}, []);


  // fetch weather when coords/units change
useEffect(() => {
  (async () => {
    if (!coords) return;
    try {
      setLoading(true);
      setError(null);

      // ── 1) Текущее состояние
      const data = await fetchWeather(coords.lat, coords.lon, units);
      setWeather(data);
      const label = String(data?.locationName || data?.name || "");
      setLocationName(label);

      // ── 2) Почасовой прогноз (3-часовые слоты на 5 суток)
      const raw = await fetchForecast3h(coords.lat, coords.lon, units);
      const hourlyItems: HourlyItem[] = (raw ?? []).map(
        (h: {
          dt: any;
          dt_txt?: string;
          main: { temp: any };
          weather: any;
          description?: any;
        }) => {
          const dt =
            typeof h?.dt === "number"
              ? h.dt
              : Math.floor(Date.parse(h?.dt_txt ?? "") / 1000) ||
                Math.floor(Date.now() / 1000);

          const temp =
            typeof h?.main?.temp === "number"
              ? h.main.temp
              : Number(h?.main?.temp ?? NaN);

          const w0 = Array.isArray(h?.weather) ? h.weather[0] : h?.weather;
          const main = String(w0?.main ?? h?.description ?? "");
          const description = String(w0?.description ?? h?.description ?? main);

          return { dt, temp, main, description };
        }
      );

      // ── 3) Оставляем ТОЛЬКО ближайшие 24 часа (8 слотов по 3 часа)
      const now = Math.floor(Date.now() / 1000);
      const in24h = now + 24 * 3600;
      const next24h = hourlyItems
        .filter((h) => Number(h.dt) > now && Number(h.dt) <= in24h)
        .slice(0, 8);

      setHourly(next24h);

      // ── 4) Дневной прогноз считаем по всем слотам (на 5 дней)
      const byDay = new Map<string, Day>();
      hourlyItems.forEach((h: HourlyItem) => {
        const key = new Date(h.dt * 1000).toDateString();
        const prev = byDay.get(key);
        byDay.set(key, {
          dt: h.dt,
          main: prev?.main || h.main,
          min: Math.min(prev?.min ?? Infinity, Number(h.temp)),
          max: Math.max(prev?.max ?? -Infinity, Number(h.temp)),
        });
      });

      const days = Array.from(byDay.values())
        .filter((d) => Number.isFinite(d.min) && Number.isFinite(d.max))
        .slice(0, 5);

      setDaily(days);
    } catch (e: any) {
      setError(e?.message || "Failed to load weather");
    } finally {
      setLoading(false);
    }
  })();
}, [coords, units]);


  async function handleSearch(q: string) {
    try {
      setLoading(true);
      setError(null);
const first = (await searchCities(q.trim(), coords ?? undefined, 1))?.[0];
if (first) {
  setCoords({ lat: first.lat, lon: first.lon });
  setLocationName(first.label);
  setGeos([]);
  return;
}


      const res = await fetchWeatherByCity(q, units);
      setCoords({ lat: Number(res.lat), lon: Number(res.lon) }); 
      setLocationName(String(res.locationName || res.name || q));
      setGeos([]);
    } catch (e: any) {
      setError(e?.message || "City not found");
    } finally {
      setLoading(false);
    }
  }


function handleQueryChange(text: string) {
  if (geoTimer.current) clearTimeout(geoTimer.current);
  const q = text.trim();
  if (q.length < 2) { setGeos([]); return; }
  geoTimer.current = setTimeout(async () => {
    try {
      const list = await searchCities(q, coords ?? undefined, 8);
      setGeos(list);
      console.log("suggestions:", list.length); 
    } catch {
      setGeos([]);
    }
  }, 250);
}





  async function handleLocate() {
    try {
      setLoading(true);
      setError(null);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setCoords({ lat: loc.coords.latitude, lon: loc.coords.longitude });
      setLocationName(""); 
      setGeos([]);
    } catch (e: any) {
      setError(e?.message || "Location error");
    } finally {
      setLoading(false);
    }
  }
  

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: theme.bg },
        container: { alignItems: "center", paddingHorizontal: 16, paddingBottom: 24 },


topbar: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  gap: 8,
},
searchWrap: {
  flex: 1,
},
brand: {
  fontSize: 42,
  fontWeight: "800",
  color:  "#2563eb",
  textAlign: "center",
  marginTop: 12,
  marginBottom: 8,
},

searchRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  width: "100%",
  paddingHorizontal: 12,
  marginBottom: 16,
  position: "relative",
  zIndex: 2000

},

locBtn: {
  width: 44,
  height: 44,
  borderRadius: 22,                                  
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.mode === "dark" ? "#1f2937" : "#f3f4f6", 
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: theme.mode === "dark" ? "rgba(148,163,184,0.25)" : "rgba(17,24,39,0.15)",

  shadowColor: "#000",
  shadowOpacity: 0.15,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 6,
  elevation: 3,                                       // Android
},


locBtnText: {
  fontSize: 20,
},

card: {
  marginTop: 16,
  width: "100%",
  borderRadius: 34,
  paddingVertical: 14,
  paddingHorizontal: 16,
  borderWidth: StyleSheet.hairlineWidth,
  zIndex: 0,               
},



        chipBtn: {
          height: 44,
          paddingHorizontal: 18,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.mode === "dark" ? "#374151" : "#e5e7eb",
        },
        chipText: { fontWeight: "700", color: theme.mode === "dark" ? "#f9fafb" : "#111827" },

        block: { width: "100%", marginTop: 12 },
      }),
    [theme]
  );

 function handlePick(s: Suggestion): void {
  setCoords({ lat: s.lat, lon: s.lon });
  setLocationName(s.label);
  setGeos([]); 
}


  return (
  <SafeAreaView style={styles.safe}>
  <Text style={styles.brand}>Weather Forecast</Text>

  <View style={{ alignItems: "flex-end", marginBottom: 12,paddingHorizontal:12 }}>
    <UnitToggle units={units} onChange={setUnits} theme={theme} />
  </View>

  <View style={styles.searchRow}>
    <View style={styles.searchWrap}>
      <SearchBar
        suggestions={geos}
        onChangeText={handleQueryChange}
        onPick={handlePick}
        onSubmit={handleSearch}
        disabled={loading}
      />
    </View>

 <Pressable
  onPress={handleLocate}
  disabled={loading}
  android_ripple={{ color: "rgba(255,255,255,0.15)", borderless: true }}
  style={[
    styles.locBtn,               
    loading && { opacity: 0.6 },
  ]}
  accessibilityLabel="Use my location"
>
  <MaterialCommunityIcons
    name="map-marker"            
    size={22}
    color={theme.mode === "dark" ? "#e5e7eb" : "#111827"}
  />
</Pressable>

  </View>


  <ScrollView
  style={{ zIndex: 0 }}  
    contentContainerStyle={styles.container}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
  >



        {!!error && <ErrorBanner>{error}</ErrorBanner>}

        {!!weather && (
          <View style={styles.block}>
            <WeatherNow
              weather={weather}
              theme={theme}
              units={units}
              locationName={locationName}
              
              
            />
          </View>
          
        )}

        {hourly.length > 0 && (
          <View style={styles.block}>
            <ForecastHourly data={hourly} units={units} theme={theme} />
          </View>
        )}

        {daily.length > 0 && (
          <View style={styles.block}>
            <ForecastDaily data={daily} units={units} theme={theme} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
