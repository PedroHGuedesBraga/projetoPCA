export function formatDescontoDate(date: Date): string {
  return date.toISOString().split("T")[0];
}