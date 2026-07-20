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
  title: "Undangan Digital Teater Dekik",
  description: "Undangan Digital Teater Dekik",
  icons: {
    icon: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/global/favicon.png?v=update`,
  },
  openGraph: {
    title: "Undangan Digital Teater Dekik",
    description: "Pementasan Teater Dekik — undangan-dekik.vercel.app",
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
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${cinzel.variable} ${jakarta.variable} h-full antialiased dark overscroll-none`}
    >
      <body className="min-h-full flex flex-col bg-black text-white selection:bg-neutral-800 selection:text-white overscroll-none">
        {children}
      </body>
    </html>
  );
}
