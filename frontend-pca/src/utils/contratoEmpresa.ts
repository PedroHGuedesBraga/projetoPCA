export const formatContratoDate = (date: Date | null) => {
  if (!date) return "";
  return date.toISOString().split("T")[0];
};