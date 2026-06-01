type FormatOption = "full" | "date" | "time";

export function formatDate(
  date: string | Date,
  option: FormatOption = "full",
): string {
  const d = date instanceof Date ? date : new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  switch (option) {
    case "date":
      return `${day}/${month}/${year}`;
    case "time":
      return `${hours}:${minutes}`;
    case "full":
    default:
      return `${day}/${month}/${year} - ${hours}:${minutes}`;
  }
}
