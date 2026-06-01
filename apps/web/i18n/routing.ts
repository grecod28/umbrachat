import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en", // Por defecto en caso de no detectar idioma del navegador
});
