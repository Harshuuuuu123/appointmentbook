// src/app/layout.tsx
"use client";

import { useState, useEffect, ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DoctorProvider } from "@/context/DoctorContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: ReactNode }) {
  const [doctorId, setDoctorId] = useState<number | null>(null);

  useEffect(() => {
    // Get doctorId from localStorage, session, or auth
    const storedId = localStorage.getItem("doctorId");
    if (storedId) setDoctorId(Number(storedId));
  }, []);

  // Show loading while doctorId is not ready
  if (!doctorId) {
    return (
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <p className="p-6 text-gray-500">Loading application...</p>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Provide dynamic doctorId to all pages */}
        <DoctorProvider doctorId={doctorId}>{children}</DoctorProvider>
      </body>
    </html>
  );
}
