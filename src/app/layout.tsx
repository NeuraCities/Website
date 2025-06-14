import React from "react";
import "./globals.css";
import Script from 'next/script';

export const metadata = {
  title: 'NeuraCities',
  description: 'NeuraCities is a platform for advanced geospatial analysis, unifying GIS, data management, and collaboration in one intelligent solution.',
  keywords: [
    'neuracities',
    'neural cities',
    'urban intelligence',
    'smart cities', 'smart city', 'Smart City',
    'geospatial AI', 'GIS', 'GIS AI',
    'NeuraCities', 'NeuraCity', 'NeuralCity', 'neuralcity', 'neuralcities',
    'Efficiency', 'NeuralCities',
    'Data management',
    'Easy data',
    'GIS data',
    'map creation',
    'urban planning', 'planning',
    'neura city',
    'neural city',
    'planning', 'urban AI'
  ],
  openGraph: {
    title: 'NeuraCities',
    description: 'NeuraCities is a platform for advanced geospatial analysis, unifying GIS, data management, and collaboration in one intelligent solution.',
    url: 'https://neuracities.com',
    siteName: 'NeuraCities',
    images: [
      {
        url: 'https://neuracities.com/logo.png',
        width: 1200,
        height: 630,
        alt: 'NeuraCities Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeuraCities',
    description: 'NeuraCities is a platform for advanced geospatial analysis, unifying GIS, data management, and collaboration in one intelligent solution.',
    images: ['https://neuracities.com/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: "url('/topography.svg')",
              backgroundPosition: "center",
              filter: "opacity(0.1)",
            }}
          />
          {children}
        </div>
      </body>
    </html>
  );
}