"use client";

import { useState } from "react";
import ProgressBar from "./progress-bar";

interface ProfileCreationProps {
  onNext: (doctor: any) => void;
  onSkip: () => void;
}

export default function ProfileCreation({ onNext, onSkip }: ProfileCreationProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    specialty: "",
    qualification: "",
    yearsOfExperience: "",
    contactNumber: "",
    emailAddress: "",
    consultationFee: "",
    profileImage: "", 
    bio: "",
    clinicId: "",
  });

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const specialties = [
    "General Medicine", "Cardiology", "Dermatology", "Pediatrics",
    "Orthopedics", "Neurology", "Psychiatry", "Gynecology"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Image upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const result = await res.json();
      if (res.ok && result.url) {
        setFormData(prev => ({ ...prev, profileImage: result.url }));
      } else {
        alert("Failed to upload image");
      }
    } catch (err) {
      console.error("Upload error", err);
      alert("Upload failed");
    }
  };

  // Submit profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.contactNumber || !formData.emailAddress) {
      alert("Full Name, Email, and Contact Number are required!");
      return;
    }

    setLoading(true);

    try {
      const userId = localStorage.getItem("loggedInUserId"); // ✅ get logged-in user id
      if (!userId) {
        alert("User not logged in");
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        userId: parseInt(userId, 10), // ✅ include userId
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : null,
        consultationFee: formData.consultationFee ? parseFloat(formData.consultationFee) : null,
        clinicId: formData.clinicId ? parseInt(formData.clinicId) : null,
      };

      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success && data.data?.id) {
        // ✅ doctorId save karna yahan
        localStorage.setItem("doctorId", String(data.data.id));

        onNext(data.data); // pass doctor object with ID to next step
      } else {
        alert(data.message || "Failed to save profile");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 min-h-screen flex flex-col">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onSkip} className="p-2 hover:bg-gray-100 rounded-lg">←</button>
          <span className="text-sm text-gray-500">Step 1 of 3</span>
        </div>
        <ProgressBar currentStep={1} totalSteps={3} />
      </div>

      <form onSubmit={handleSubmit} className="flex-1 space-y-4">
        <input type="text" placeholder="Full Name *" value={formData.fullName} onChange={e => handleInputChange("fullName", e.target.value)} required className="w-full p-3 border rounded-lg" />
        <input type="tel" placeholder="Contact Number *" value={formData.contactNumber} onChange={e => handleInputChange("contactNumber", e.target.value)} required className="w-full p-3 border rounded-lg" />
        <input type="email" placeholder="Email Address *" value={formData.emailAddress} onChange={e => handleInputChange("emailAddress", e.target.value)} required className="w-full p-3 border rounded-lg" />

        <select value={formData.specialty} onChange={e => handleInputChange("specialty", e.target.value)} className="w-full p-3 border rounded-lg">
          <option value="">Select Specialty</option>
          {specialties.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <input type="text" placeholder="Qualification" value={formData.qualification} onChange={e => handleInputChange("qualification", e.target.value)} className="w-full p-3 border rounded-lg" />
        <input type="number" placeholder="Years of Experience" value={formData.yearsOfExperience} onChange={e => handleInputChange("yearsOfExperience", e.target.value)} className="w-full p-3 border rounded-lg" />
        <input type="number" placeholder="Consultation Fee" value={formData.consultationFee} onChange={e => handleInputChange("consultationFee", e.target.value)} className="w-full p-3 border rounded-lg" />

        {/* Profile Image */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Profile Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-2 border rounded-lg" />
          {preview && <img src={preview} alt="Preview" className="w-24 h-24 rounded-full object-cover mt-2" />}
        </div>

        <textarea placeholder="Bio" value={formData.bio} onChange={e => handleInputChange("bio", e.target.value)} className="w-full p-3 border rounded-lg" />

        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-lg">{loading ? "Saving..." : "Next →"}</button>
          <button type="button" onClick={onSkip} className="px-6 py-3 border rounded-lg">Skip</button>
        </div>
      </form>
    </div>
  );
}
