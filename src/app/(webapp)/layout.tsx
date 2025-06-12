import React from "react";

export default function WebAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative z-20 min-h-screen">
      {children}
    </main>
  );
}