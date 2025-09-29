import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Theme } from "../theme";

export function pickIcon(main: string = ""): any {
  const m = main.toLowerCase();
  if (m.includes("thunder")) return "weather-lightning";
  if (m.includes("drizzle")) return "weather-hail";
  if (m.includes("rain")) return "weather-rainy";
  if (m.includes("snow")) return "weather-snowy";
  if (m.includes("mist") || m.includes("fog") || m.includes("haze")) return "weather-fog";
  if (m.includes("cloud")) return "weather-cloudy";
  if (m.includes("clear")) return "weather-sunny";
  return "weather-partly-cloudy";
}

export function iconColor(main: string = "", theme: Theme): string {
  const m = main.toLowerCase();
  if (m.includes("thunder")) return "#f59e0b";
  if (m.includes("drizzle")) return "#60a5fa";
  if (m.includes("rain")) return "#3b82f6";
  if (m.includes("snow")) return "#60a5fa";
  if (m.includes("mist") || m.includes("fog") || m.includes("haze")) return theme.mode === "dark" ? "#94a3b8" : "#64748b";
  if (m.includes("cloud")) return theme.mode === "dark" ? "#cbd5e1" : "#64748b";
  if (m.includes("clear")) return "#fbbf24";
  return theme.text;
}

function getAt(obj: any, path: (string | number)[]): any {
  return path.reduce((o: any, k: any) => (o == null ? undefined : o[k]), obj);
}
function num(v: unknown) {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}
function firstOf(obj: any, paths: (string | number)[][]) {
  for (const p of paths) {
    const v = getAt(obj, p);
    const n = num(v);
    if (n !== null) return n;
  }
  return null;
}
function firstStr(obj: any, paths: (string | number)[][]) {
  for (const p of paths) {
    const v = getAt(obj, p);
    if (typeof v === "string" && v.length) return v;
  }
  return "";
}

export default function WeatherNow({
  weather,
  theme,
  units,
  locationName,
}: {
  weather: any;
  theme: Theme;
  units: "metric" | "imperial";
  locationName?: string;
}) {
  const base = weather ?? {};
  const data = base?.data ?? base?.payload ?? base?.response ?? {};
  const current = base?.current ?? data?.current ?? {};
  const root = { ...base, ...data, ...current };

  const temp =
    firstOf(root, [
      ["temp"], ["main", "temp"],
      ["current", "temp"], ["data", "current", "temp"],
    ]);

const w0 = getAt(root, ["weather", 0]) ?? {};
  const main = String(w0?.main ?? "");
  const descRaw = String(w0?.description ?? "");
  const desc = descRaw ? descRaw[0].toUpperCase() + descRaw.slice(1) : "";

  const feels = firstOf(root, [
    ["feels_like"], ["main", "feels_like"],
    ["current", "feels_like"], ["data", "current", "feels_like"],
    ["payload", "current", "feels_like"], ["response", "current", "feels_like"],
  ]);

  const humidity = firstOf(root, [
    ["humidity"], ["main", "humidity"],
    ["current", "humidity"], ["data", "current", "humidity"],
  ]);

  const windSpeed = firstOf(root, [
    ["wind_speed"], ["wind", "speed"],
    ["current", "wind_speed"], ["current", "wind", "speed"],
    ["data", "current", "wind_speed"], ["data", "current", "wind", "speed"],
  ]);

  const windUnit = units === "imperial" ? "mph" : "m/s";

  const sunrise = firstOf(root, [
    ["sunrise"], ["sys", "sunrise"], ["current", "sunrise"], ["data", "current", "sunrise"],
  ]);
  const sunset = firstOf(root, [
    ["sunset"], ["sys", "sunset"], ["current", "sunset"], ["data", "current", "sunset"],
  ]);

  const show = (v: number | null, digits = 0, dash = "–") => (v === null ? dash : v.toFixed(digits));

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.city, { color: theme.text }]}>{locationName}</Text>
          <Text style={[styles.date, { color: theme.muted }]}>
            {new Date().toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} ·{" "}
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>

          <Text style={[styles.nowTemp, { color: theme.text }]}>
            {temp !== null ? Math.round(temp) : "–"}° {units === "metric" ? "C" : "F"}
          </Text>

          {!!desc && <Text style={[styles.desc, { color: theme.muted }]}>{desc}</Text>}

          <View style={styles.statsRow}>
            <Text style={[styles.stat, { color: theme.muted }]}>
              Feels: <Text style={{ color: theme.text }}>{show(feels, 0)}</Text>°
            </Text>
            <Text style={[styles.stat, { color: theme.muted }]}>
              Humidity: <Text style={{ color: theme.text }}>{show(humidity, 0)}</Text>%
            </Text>
            <Text style={[styles.stat, { color: theme.muted }]}>
              Wind: <Text style={{ color: theme.text }}>{show(windSpeed, 1)}</Text> {windUnit}
            </Text>
          </View>

          {/* Sunrise / Sunset */}
          <View style={styles.sunRow}>
            <View style={styles.sunItem}>
              <MaterialCommunityIcons name="weather-sunset-up" size={20} color="#fbbf24" />
              <Text style={[styles.sunText, { color: theme.muted }]}>
                {sunrise !== null
                  ? new Date(sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "–"}
              </Text>
            </View>
            <View style={styles.sunItem}>
              <MaterialCommunityIcons name="weather-sunset-down" size={20} color="#f87171" />
              <Text style={[styles.sunText, { color: theme.muted }]}>
                {sunset !== null
                  ? new Date(sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "–"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name={pickIcon(main)} size={72} color={iconColor(main, theme)} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    marginTop: 12,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  city: { fontWeight: "700", fontSize: 16, marginBottom: 4 },
  date: { fontSize: 14, marginBottom: 12 },
  nowTemp: { fontSize: 48, fontWeight: "800" },
  desc: { fontSize: 16, marginTop: 4, marginBottom: 12 },
  statsRow: { marginTop: 8, gap: 4 },
  stat: { fontSize: 14 },
  sunRow: { flexDirection: "row", justifyContent: "flex-start", marginTop: 12, gap: 16 },
  sunItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  sunText: { fontSize: 14 },
  iconWrap: { marginLeft: 12, alignItems: "center", justifyContent: "center" },
});
