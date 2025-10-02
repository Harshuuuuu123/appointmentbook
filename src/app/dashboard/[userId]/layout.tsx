// app/dashboard/[userId]/layout.tsx
"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/layout/sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
