// Formats a raw stat value the same way across every homepage/FAQ stat display,
// e.g. formatStatNumber(10000, "+") -> "10k+", formatStatNumber(98, "%") -> "98%"
export function formatStatNumber(value, suffix = "") {
  if (typeof value !== "number") return `${value ?? ""}${suffix}`;
  if (value >= 1000) {
    const k = value / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k${suffix}`;
  }
  return `${value}${suffix}`;
}
