import { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ShapeProvider } from "@/providers/shape-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("default.title"),
    description: t("default.description"),
    applicationName: "UmbraChat",
    metadataBase: new URL("https://umbrachat.org"),
    icons: {
      icon: [
        { url: "/images/favicon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/images/favicon-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: "/images/favicon-192.png",
    },
    openGraph: {
      title: t("default.title"),
      description: t("default.description"),
      siteName: "UmbraChat",
      type: "website",
      images: [{ url: "/images/favicon-512.png" }],
    },
    twitter: {
      card: "summary",
      title: t("default.title"),
      description: t("default.description"),
      images: ["/images/favicon-512.png"],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#07070a",
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

const shapeScript = `(function(){try{var raw=localStorage.getItem("umbra-shape");if(!raw)return;var c=JSON.parse(raw);var r=document.documentElement;if(c.font)r.dataset.font=c.font;if(c.size)r.dataset.size=c.size;if(c.color)r.dataset.color=c.color;if(c.theme==="light")r.classList.add("light");}catch(e){}})();`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-background text-text">
        <script dangerouslySetInnerHTML={{ __html: shapeScript }} />
        <ShapeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ShapeProvider>
      </body>
    </html>
  );
}
