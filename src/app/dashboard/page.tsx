"use client";

import { useEffect, useState } from "react";
import DashboardContent from "@/components/dashboard/dashboard-content";
import Sidebar from "@/components/layout/sidebar";
import { DoctorProvider } from "@/context/DoctorContext";

export default function DashboardPage() {
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    const id = localStorage.getItem("doctorId");
    if (id) setDoctorId(Number(id));

    const storedData = localStorage.getItem("doctorData");
    if (storedData) setInitialData(JSON.parse(storedData));
  }, []);

  if (!doctorId)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );

  return (
    <DoctorProvider doctorId={doctorId} initialData={initialData}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <DashboardContent />
        </main>
      </div>
    </DoctorProvider>
  );
}
