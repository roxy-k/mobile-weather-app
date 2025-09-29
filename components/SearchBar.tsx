import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export type Suggestion = { label: string; lat: number; lon: number };

type Props = {
  suggestions: Suggestion[];
  onChangeText: (q: string) => void;
  onPick: (s: Suggestion) => void;
  onSubmit: (q: string) => void;
  disabled?: boolean;
};

export default function SearchBar({
  suggestions,
  onChangeText,
  onPick,
  onSubmit,
  disabled,
}: Props) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  const data = useMemo(() => suggestions ?? [], [suggestions]);

  function handleSubmit() {
    const q = value.trim();
    if (q) onSubmit(q);
    setOpen(false);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Search city..."
          placeholderTextColor="#94a3b8"
          editable={!disabled}
          value={value}
          onChangeText={(t) => {
            setValue(t);
            setOpen(true);
            onChangeText(t);
          }}
          onSubmitEditing={handleSubmit}
        />
        <Pressable style={styles.btn} onPress={handleSubmit} disabled={disabled}>
          <Text style={styles.btnText}>Search</Text>
        </Pressable>
      </View>

      {open && data.length > 0 && (
        <View style={styles.dropdown} pointerEvents="auto">
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={data}
            keyExtractor={(it, i) => `${it.label}-${i}`}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onPick(item);
                  setValue(item.label);
                  setOpen(false);
                }}
                style={styles.item}
              >
                <Text numberOfLines={1} style={styles.itemText}>
                  {item.label}
                </Text>
              </Pressable>
            )}
            style={{ maxHeight: 260 }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", position: "relative" },
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 34,
    backgroundColor: "#fff",
  },
  btn: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5e7eb",
  },
  btnText: { fontWeight: "600", color: "#111827" },
  dropdown: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 84,               
    zIndex: 50,
    backgroundColor: "#fff",
    borderRadius: 34,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(148,163,184,0.25)",
    overflow: "hidden",
  },
  item: { paddingVertical: 10, paddingHorizontal: 12 },
  itemText: { color: "#0f172a" },
});
