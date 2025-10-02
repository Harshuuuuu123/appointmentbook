"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "./progress-bar";

interface ClinicRegistrationProps {
  doctorId: number | null; // ✅ doctorId from Profile step
  onNext?: (clinic: any) => void;
  onSkip?: () => void;
}

export default function ClinicRegistration({ doctorId, onNext, onSkip }: ClinicRegistrationProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    phone: "",
    facilities: [] as string[],
    consultationFee: "",
    offerOnlineConsultation: false,
    videoConsultationLink: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.address || !formData.phone) {
      alert("Clinic Name, Address, and Phone are required!");
      return;
    }

    let userId = doctorId;
    if (!userId) {
      // fallback: get from localStorage if doctorId is not passed
      const storedId = localStorage.getItem("doctorId");
      if (storedId) userId = parseInt(storedId, 10);
    }

    if (!userId) {
      alert("Doctor ID missing. Cannot register clinic.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        userId, // ✅ include doctorId/userId
        consultationFee: formData.consultationFee ? parseFloat(formData.consultationFee) : null,
      };

      const res = await fetch("/api/auth/clinic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (onNext) onNext(data.data);
        else router.push("/dashboard"); // fallback
      } else {
        alert(data.message || "Failed to save clinic");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving clinic");
    } finally {
      setLoading(false);
    }
  };

  if (!doctorId && !localStorage.getItem("doctorId")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading doctor info...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 min-h-screen flex flex-col">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onSkip} className="p-2 hover:bg-muted rounded-lg">←</button>
          <span className="text-sm text-muted-foreground">Step 2 of 3</span>
        </div>
        <ProgressBar currentStep={2} totalSteps={3} />
      </div>

      <form onSubmit={handleSubmit} className="flex-1 space-y-4">
        <input
          type="text"
          placeholder="Clinic Name *"
          value={formData.name}
          onChange={e => handleInputChange("name", e.target.value)}
          required
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Address *"
          value={formData.address}
          onChange={e => handleInputChange("address", e.target.value)}
          required
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="text"
          placeholder="City"
          value={formData.city}
          onChange={e => handleInputChange("city", e.target.value)}
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="text"
          placeholder="State"
          value={formData.state}
          onChange={e => handleInputChange("state", e.target.value)}
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="tel"
          placeholder="Phone *"
          value={formData.phone}
          onChange={e => handleInputChange("phone", e.target.value)}
          required
          className="w-full p-3 border rounded-lg"
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={e => handleInputChange("description", e.target.value)}
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Video Consultation Link"
          value={formData.videoConsultationLink}
          onChange={e => handleInputChange("videoConsultationLink", e.target.value)}
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="number"
          placeholder="Consultation Fee"
          value={formData.consultationFee}
          onChange={e => handleInputChange("consultationFee", e.target.value)}
          className="w-full p-3 border rounded-lg"
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.offerOnlineConsultation}
            onChange={e => handleInputChange("offerOnlineConsultation", e.target.checked)}
          />
          <label>Offer Online Consultation</label>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary text-white py-3 rounded-lg"
          >
            {loading ? "Saving..." : "Next →"}
          </button>
          {onSkip && (
            <button type="button" onClick={onSkip} className="px-6 py-3 border rounded-lg">
              Skip
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
