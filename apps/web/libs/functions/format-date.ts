type FormatOption = "full" | "date" | "time";

export function formatDate(
  dateStr: string,
  option: FormatOption = "full",
): string {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

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
