import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ContactForm from "../components/ContactForm";
import React from "react";
import "./globals.css";

export const metadata = {
  title: 'NeuraCities',
  description: 'We enable Planners with AI solutions!',
  icons: {
    icon: '/icon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="relative min-h-screen">
          {/* Topographic Overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: "url('/topography.svg')",
              backgroundPosition: "center",
              filter: "opacity(0.1)",
            }}
          />
          <Navbar />
          <main className="relative z-20">{children}</main>
          <ContactForm/>
          <Footer />
        </div>
      </body>
    </html>
  );
}
