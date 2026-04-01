import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Voltix ⚡ — Premium Electronics",
    template: "%s | Voltix ⚡",
  },
  description:
    "The premium destination for cutting-edge electronics and tech accessories.",
  keywords: ["electronics", "tech", "gadgets", "smartphones", "voltix"],
  openGraph: {
    title: "Voltix ⚡ — Premium Electronics",
    description: "The premium destination for cutting-edge electronics.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${syne.variable} ${dmSans.variable} font-sans bg-[#080A0F] text-white antialiased min-h-screen flex flex-col`}
      >
        {/* Subtle background grid */}
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <Providers>
          
          <main className="relative z-10 flex-1">{children}</main>
         
        </Providers>
      </body>
    </html>
  );
}