import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ContactForm from "../components/ContactForm";
import React from "react";
import "./globals.css";
import Script from 'next/script';

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
      <head>
        {/* Add this script to inject the Netlify form definitions */}
        <Script id="netlify-forms" strategy="afterInteractive">
          {`
            if (typeof window !== 'undefined') {
              const div = document.createElement('div');
              div.innerHTML = \`
                <form name="footer-form" netlify netlify-honeypot="bot-field" hidden>
                  <input type="text" name="name" />
                  <input type="email" name="email" />
                  <textarea name="message"></textarea>
                </form>
                
                <form name="contact" netlify netlify-honeypot="bot-field" hidden>
                  <input type="text" name="name" />
                  <input type="email" name="email" />
                  <input type="text" name="jobTitle" />
                  <input type="tel" name="phone" />
                  <select name="organizationType"></select>
                  <textarea name="message"></textarea>
                </form>
                
                <form name="demo-form" netlify netlify-honeypot="bot-field" hidden>
                  <input type="text" name="name" />
                  <input type="email" name="email" />
                  <input type="checkbox" name="newsletter" />
                </form>
              \`;
              document.body.appendChild(div);
            }
          `}
        </Script>
      </head>
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