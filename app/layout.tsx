import type { Metadata, Viewport } from "next";
import { Cinzel, Plus_Jakarta_Sans } from "next/font/google";
import { ToastProvider } from "./components/Toast";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://teaterdekik.vercel.app";
const assetsBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/global`;
const logoUrl = `${assetsBase}/app-logo.png`;
const faviconUrl = `${assetsBase}/favicon.png?v=update`;

const author = "Indra Wardana";
const tagline = "Di mana cerita menemukan panggungnya.";
const description =
  "Teater Dekik: jadwal pementasan, tiket, galeri, dan kisah di balik tirai panggung kami.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `Teater Dekik — ${tagline}`,
    template: "%s | Teater Dekik",
  },
  description,
  applicationName: "Teater Dekik",
  keywords: ["Teater Dekik", "teater", "pementasan", "tiket teater", "jadwal pentas", "komunitas teater"],
  authors: [{ name: author }],
  creator: author,
  publisher: "Teater Dekik",
  alternates: { canonical: "/" },
  icons: {
    icon: faviconUrl,
    shortcut: faviconUrl,
    apple: logoUrl,
  },
  openGraph: {
    title: "Teater Dekik",
    description: tagline,
    url: "/",
    siteName: "Teater Dekik",
    images: [{ url: logoUrl, width: 800, height: 600, alt: "Logo Teater Dekik" }],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Teater Dekik",
    description: tagline,
    images: [logoUrl],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${cinzel.variable} ${jakarta.variable} dark scroll-smooth`}
    >
      <body className="min-h-screen w-full bg-black font-sans text-white antialiased selection:bg-white/20">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}