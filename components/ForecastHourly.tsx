import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { Theme } from "../theme";

type Item = { dt: number; temp?: number; main: string; description: string };

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
  if (m.includes("thunder")) return "#f59e0b";
  if (m.includes("drizzle")) return "#60a5fa";
  if (m.includes("rain"))    return "#3b82f6";
  if (m.includes("snow"))    return "#60a5fa";
  if (m.includes("mist") || m.includes("fog") || m.includes("haze"))
    return theme.mode === "dark" ? "#94a3b8" : "#64748b";
  if (m.includes("cloud"))
    return theme.mode === "dark" ? "#cbd5e1" : "#64748b";
  if (m.includes("clear"))   return "#fbbf24";
  return theme.text;
}

export default function ForecastHourly({
  data = [],
  units,
  theme,
}: {
  data: Item[];
  units: "metric" | "imperial";
  theme: Theme;
}) {
  if (!data?.length) return null;

  return (
    <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[s.title, { color: theme.text }]}>Today • Next 24h</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scroller}>
        {data.map((h, i) => {
          const time = new Date(h.dt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const icon = pickIcon(h.main);
          const tint = iconColor(h.main, theme);
          const t = typeof h.temp === "number" ? Math.round(h.temp) : "-";
          const label = h.description || h.main; 
          return (
            <View key={`${h.dt}-${i}`} style={[s.item, { borderColor: theme.border }]}>
              <Text style={[s.time, { color: theme.muted }]}>{time}</Text>
              <MaterialCommunityIcons name={icon} size={28} color={tint} style={{ marginVertical: 6 }} />
              <Text style={[s.temp, { color: theme.text }]}>{t}° {units === "metric" ? "C" : "F"}</Text>
              {!!label && (
<Text
  numberOfLines={2}
  ellipsizeMode="tail"
  style={[s.desc, { color: theme.muted }]}
>
  {label}
</Text>
              )}
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
  },
  title: { fontWeight: "800", fontSize: 18, marginBottom: 8 },
  scroller: { gap: 18, paddingHorizontal: 4 },
  item: {
    width: 110,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  time: { fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },
  temp: { fontSize: 18, fontWeight: "800" },
desc: {
  fontSize: 12,
  fontWeight: "600",
  textAlign: "center",
  lineHeight: 14,       
  paddingHorizontal: 2, 
  maxWidth: "100%",
},
});
