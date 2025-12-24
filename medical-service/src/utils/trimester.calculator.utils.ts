export function getTrimesterByWeek(week: number): "first" | "second" | "third" {
  if (week < 1 || week > 40) {
    throw new Error("Invalid pregnancy week. Week must be between 1 and 40.");
  }

  if (week <= 12) return "first";
  if (week <= 27) return "second";
  return "third";
}
