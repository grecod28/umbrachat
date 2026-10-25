/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://umbrachat.org",
  generateRobotsTxt: true, // También genera el robots.txt
  sitemapSize: 7000,
  sourceDir: "./.next",
  outDir: "./public",
  additionalPaths: async (config) => {
    const result = [];
    const locales = ["es", "en"]; // Tus idiomas configurados
    const pages = ["", "/info", "/contact", "/chat/search"]; // rutas públicas reales

    for (const locale of locales) {
      for (const page of pages) {
        // Esto generará: /es, /es/contact, /en, /en/contact...
        result.push(await config.transform(config, `/${locale}${page}`));
      }
    }

    return result;
  },
};
