import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "DABS Marketplace",
  description: "Empowering Artisan Women",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#FFF7EF]">
        {/* GLOBAL NAVBAR */}
        <Navbar />

        {/* PAGE CONTENT */}
        {children}
      </body>
    </html>
  );
}
