import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "DABS",
  description: "Empowering Artisan Women",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#FFF7EF]">
        {/* GLOBAL NAVBAR (client component) */}
        <Navbar />

        {/* PAGE CONTENT */}
        {children}
      </body>
    </html>
  );
}
