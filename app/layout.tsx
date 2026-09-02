import "./globals.css";
import { Fraunces, Manrope, IBM_Plex_Mono } from "next/font/google";
import SiteNav from "@/components/SiteNav";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata = {
  title: "Warung Depan Rumah",
  description: "Kuliner Rumahan, Rasa Profesional",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${fraunces.variable} ${manrope.variable} ${ibmPlexMono.variable}`}
    >
      <body className="bg-[#F6EFE2] text-[#3B2A1E] font-sans min-h-screen flex flex-col">
        <SiteNav />
        <main className="flex-grow w-full">{children}</main>
      </body>
    </html>
  );
}