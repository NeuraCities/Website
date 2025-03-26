import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ContactForm from "../components/ContactForm";
import React from "react";
import "./globals.css";
//import Head from "next/head";
import Script from 'next/script';

export const metadata = {
  title: 'NeuraCities – Your AI-Powered Geospatial Assistant',
  description:
    'NeuraCities is a platform for advanced geospatial analysis, unifying GIS, data management, and collaboration in one intelligent solution.',
  keywords: [
    'neuracities',
    'neural cities',
    'urban intelligence',
    'smart cities',
    'geospatial AI',
    'NeuraCities',
    'Efficiency',
    'Data management',
    'Easy data',
    'GIS data',
    'map creation'
  ],
  openGraph: {
    title: 'NeuraCities',
    description:
      'NeuraCities is a platform for advanced geospatial analysis, unifying GIS, data management, and collaboration in one intelligent solution.',
    url: 'https://neuracities.com',
    siteName: 'NeuraCities',
    images: [
      {
        url: 'https://neuracities.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NeuraCities',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeuraCities',
    description:
      'NeuraCities is a platform for advanced geospatial analysis, unifying GIS, data management, and collaboration in one intelligent solution.',
    images: ['https://neuracities.com/twitter-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/*<Head>
         Structured Data (optional JSON-LD will be injected via separate component) 
      </Head>*/}
      {/* Using next/script to load GA early */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-EMVFEF7Z9R"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-EMVFEF7Z9R');
        `}
      </Script>
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
          {/* Your site components */}
          <Navbar />
          <main className="relative z-20">{children}</main>
          <ContactForm />
          <Footer />
        </div>
      </body>
    </html>
  );
}
