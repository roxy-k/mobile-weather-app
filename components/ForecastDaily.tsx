// components/ForecastDaily.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { Theme } from "../theme";

type Day = { dt: number; main: string; min: number; max: number };

function pickIcon(main: string) {
  const m = (main || "").toLowerCase();
  if (m.includes("thunder")) return "weather-lightning";
  if (m.includes("drizzle")) return "weather-hail";
  if (m.includes("rain"))    return "weather-rainy";
  if (m.includes("snow"))    return "weather-snowy";
  if (m.includes("mist") || m.includes("fog") || m.includes("haze"))
    return "weather-fog";
  if (m.includes("cloud"))   return "weather-cloudy";
  if (m.includes("clear"))   return "weather-sunny";
  return "weather-partly-cloudy";
}

function iconColor(main: string, theme: Theme) {
  const m = (main || "").toLowerCase();
  if (m.includes("thunder")) return "#f59e0b"; // гроза
  if (m.includes("drizzle")) return "#60a5fa"; // морось
  if (m.includes("rain"))    return "#3b82f6"; // дождь
  if (m.includes("snow"))    return "#60a5fa"; // снег
  if (m.includes("mist") || m.includes("fog") || m.includes("haze"))
    return theme.mode === "dark" ? "#94a3b8" : "#64748b";
  if (m.includes("cloud"))
    return theme.mode === "dark" ? "#cbd5e1" : "#64748b";
  if (m.includes("clear"))   return "#fbbf24"; // ясно
  return theme.text;
}

export default function ForecastDaily({
  data = [],
  units,
  theme,
}: {
  data: Day[];
  units: "metric" | "imperial";
  theme: Theme;
}) {
  if (!data?.length) return null;

  return (
    <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[s.title, { color: theme.text }]}>5-day forecast</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scroller}>
        {data.slice(0, 7).map((d, i) => {
          const day = new Date(d.dt * 1000);
          const top = day.toLocaleDateString([], { weekday: "short" }).toUpperCase();
          const sub = day.toLocaleDateString([], { month: "short", day: "2-digit" });

          const icon = pickIcon(d.main);
          const tint = iconColor(d.main, theme);

          return (
            <View key={`${d.dt}-${i}`} style={[s.item, { borderColor: theme.border }]}>
              <Text style={[s.day, { color: theme.muted }]}>{top}</Text>
              <Text style={[s.sub, { color: theme.muted }]}>{sub}</Text>

              <MaterialCommunityIcons name={icon} size={28} color={tint} style={{ marginVertical: 6 }} />

              <Text style={[s.max, { color: theme.text }]}>
                {Number.isFinite(d.max) ? Math.round(d.max) : "-"}°
                <Text style={[s.min, { color: theme.muted }]}>
                  {" "}/ {Number.isFinite(d.min) ? Math.round(d.min) : "-"}°
                </Text>
                <Text style={[s.unit, { color: theme.muted }]}>
                  {" "}{units === "metric" ? "C" : "F"}
                </Text>
              </Text>

              <Text numberOfLines={1} style={[s.desc, { color: theme.muted }]}>{d.main}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  title: { fontWeight: "800", fontSize: 18, marginBottom: 8 },
  scroller: { gap: 18, paddingHorizontal: 4 },
  item: {
    width: 120,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  day: { fontSize: 11, fontWeight: "800", letterSpacing: 0.3 },
  sub: { fontSize: 11, fontWeight: "600" },
  max: { fontSize: 18, fontWeight: "800", marginTop: 2 },
  min: { fontSize: 14, fontWeight: "700" },
  unit: { fontSize: 12, fontWeight: "700" },
  desc: { fontSize: 12, fontWeight: "600" },
});
