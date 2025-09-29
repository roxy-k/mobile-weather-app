import type { Theme } from "@/theme";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Units = "metric" | "imperial";

export default function UnitToggle({
  units,
  onChange,
  theme,
}: {
  units: Units;
  onChange: (u: Units) => void;
  theme: Theme; 
}) {
  const isDark = theme.mode === "dark";
  const chipBg = isDark ? "#374151" : "#e5e7eb";
  const chipText = isDark ? "#f9fafb" : "#111827";
  const activeBg = isDark ? "#2563eb" : "#3b82f6";
  const activeText = "#ffffff";

  return (
    <View style={s.row}>
      {(["metric", "imperial"] as Units[]).map((u) => {
        const active = units === u;
        return (
          <Pressable
            key={u}
            onPress={() => onChange(u)}
            style={[
              s.chipBtn,
              { backgroundColor: chipBg },
              active && { backgroundColor: activeBg },
            ]}
          >
            <Text style={[s.chipText, { color: chipText }, active && { color: activeText }]}>
              {u === "metric" ? "°C" : "°F"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, alignItems: "center" },
chipBtn: {
  height: 44,
  paddingHorizontal: 18,
  borderRadius: 34,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: StyleSheet.hairlineWidth,                      
  borderColor: "rgba(148,163,184,0.25)",                      
  shadowColor: "#000",                                        
  shadowOpacity: 0.1,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,                                               
},

  chipText: { fontWeight: "700", fontSize: 14 },  
});

