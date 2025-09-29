// app/theme.ts

export type Theme = {
  mode: "light" | "dark";
  bg: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  chip: string;
};

export const light: Theme = {
  mode: "light",
  bg: "#eef2f7",
  card: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  border: "rgba(148,163,184,0.25)",
  chip: "#f1f5f9",
};

export const dark: Theme = {
  mode: "dark",
  bg: "#0b1424",
  card: "#111827",
  text: "#e5e7eb",
  muted: "#9ca3af",
  border: "rgba(148,163,184,0.18)",
  chip: "#1e293b",
};

export const shadow = {
  shadowColor: "#000",
  shadowOpacity: 0.10,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

export function pickTheme(weather: any): Theme {
  try {
    const now = Date.now() / 1000; 
    const sr = Number(weather?.current?.sunrise);
    const ss = Number(weather?.current?.sunset);
    const isNight =
      Number.isFinite(sr) && Number.isFinite(ss) ? !(now > sr && now < ss) : false;
    return isNight ? dark : light;
  } catch {
    return light;
  }
}
