import "./globals.css";
import SiteNav from "@/components/SiteNav";

export const metadata = {
  title: "Warung Depan Rumah",
  description: "Kuliner Rumahan, Rasa Profesional",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-[#FFF8E7] text-[#166534] min-h-screen flex flex-col">
        <SiteNav />
        <main className="flex-grow w-full">{children}</main>
      </body>
    </html>
  );
}