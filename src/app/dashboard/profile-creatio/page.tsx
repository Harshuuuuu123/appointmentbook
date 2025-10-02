"use client";

import { useRouter } from "next/navigation";
import ProfileCreationForm from "@/components/onboarding/profile-creation";

export default function ProfileCreationPage() {
  const router = useRouter();

  const handleNext = (doctor: any) => {
    // doctor.id must come from API after saving profile
    router.push(`/dashboard/clinic-registration?doctorId=${doctor.id}`);
  };

  const handleSkip = () => {
    router.push("/dashboard/clinic-registration");
  };

  return <ProfileCreationForm onNext={handleNext} onSkip={handleSkip} />;
}
