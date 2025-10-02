"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ClinicRegistration from "@/components/onboarding/clinic-registration";

export default function ClinicRegistrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [doctorId, setDoctorId] = useState<number | null>(null);

  useEffect(() => {
    const id = searchParams.get("doctorId");
    if (id) setDoctorId(parseInt(id));
  }, [searchParams]);

  const handleNext = (clinic: any) => {
    if (!doctorId) return;
    router.push(`/dashboard/appointment-setup?doctorId=${doctorId}&clinicId=${clinic.id}`);
  };

  const handleSkip = () => {
    router.push("/dashboard/appointment-setup");
  };

  if (!doctorId) {
    return <p className="text-center p-6">Loading doctor info...</p>;
  }

  return (
    <ClinicRegistration
      doctorId={doctorId}
      onNext={handleNext}
      onSkip={handleSkip}
    />
  );
}
