"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AppointmentSetup from "@/components/onboarding/appointment-setup";

export default function AppointmentSetupPage() {
  const searchParams = useSearchParams();
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [clinicId, setClinicId] = useState<number | null>(null);

  useEffect(() => {
    const docId = searchParams.get("doctorId");
    const clId = searchParams.get("clinicId");
    if (docId) setDoctorId(parseInt(docId));
    if (clId) setClinicId(parseInt(clId));
  }, [searchParams]);

  if (!doctorId || !clinicId) {
    return <p className="text-center p-6">Loading doctor and clinic info...</p>;
  }

  return (
    <AppointmentSetup
          doctorId={doctorId} patientId={0}    />
  );
}
