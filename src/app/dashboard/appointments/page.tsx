"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import AppointmentsContent from "@/components/appointments/appointments-content";
import { DoctorProvider } from "@/context/DoctorContext";

export default function AppointmentsPage() {
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get doctor ID from your auth system
    const getCurrentDoctorId = async () => {
      try {
        // Option 1: From session/JWT token
        // const session = await getSession();
        // const doctorId = session?.user?.doctorId;

        // Option 2: From localStorage (if stored during login)
        const storedDoctorId = localStorage.getItem('doctorId');
        
        // Option 3: From API call to get current user
        // const response = await fetch('/api/auth/me');
        // const user = await response.json();
        // const doctorId = user.doctorId;

        if (storedDoctorId) {
          setDoctorId(Number(storedDoctorId));
        } else {
          // Fallback or redirect to login
          setDoctorId(43); // temporary fallback
        }
      } catch (error) {
        console.error('Error getting doctor ID:', error);
        // Handle error - maybe redirect to login
      } finally {
        setLoading(false);
      }
    };

    getCurrentDoctorId();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!doctorId) {
    return <div className="flex items-center justify-center h-screen">Doctor ID not found</div>;
  }

  console.log(doctorId, "doctorId from auth");

  return (
    <DoctorProvider doctorId={doctorId}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <AppointmentsContent />
        </main>
      </div>
    </DoctorProvider>
  );
}