import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ErrorBanner({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <View style={s.box}>
      <Text style={s.text}>{String(children)}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  box: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fee2e2",
  },
  text: { color: "#991b1b" },
});
