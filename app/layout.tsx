import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Undangan Digital Teater Dekik",
  description: "Undangan Eksklusif Teater Dekik",
  icons: {
    icon: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/global/favicon.png?v=update`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-black text-white selection:bg-neutral-800 selection:text-white">
        {children}
      </body>
    </html>
  );
}
