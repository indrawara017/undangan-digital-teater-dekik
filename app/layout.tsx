import type { Metadata, Viewport } from "next";
import { Cinzel, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const logoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/global/app-logo.png`;

export const metadata: Metadata = {
  title: "Teater Dekik — Portal Resmi",
  description: "Portal resmi Teater Dekik. Lihat jadwal pementasan, beli tiket, dan kenali lebih dekat komunitas teater kami.",
  icons: {
    icon: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/global/favicon.png?v=update`,
  },
  openGraph: {
    title: "Teater Dekik — Portal Resmi",
    description: "Portal resmi Teater Dekik — jadwal pementasan, tiket online, galeri, dan informasi komunitas.",
    url: "https://undangan-dekik.vercel.app",
    siteName: "Teater Dekik",
    images: [
      {
        url: logoUrl,
        width: 800,
        height: 600,
        alt: "Logo Teater Dekik",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

import { ToastProvider } from "./components/Toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${cinzel.variable} ${jakarta.variable} min-h-full antialiased dark`}
    >
      <body className="min-h-full w-full bg-black text-white antialiased font-sans">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
