"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";

interface Patient {
  id: number;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: string;
  profileImage?: string;
}

// Extend Patient type for form state to allow file upload
interface PatientForm extends Partial<Patient> {
  profileImageFile?: File;
}

export default function PatientProfilePage() {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<PatientForm>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch patient info
  const fetchPatient = async () => {
    setLoading(true);
    setError("");
    try {
      const patientId = localStorage.getItem("loggedInUserId");
      if (!patientId) throw new Error("User not logged in");

      const res = await fetch(`/api/patients/${patientId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch patient");
      }

      setPatient(data.data);
      setFormData(data.data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, []);

  // Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile image selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, profileImageFile: file }));
      // Optional: preview image immediately
      const reader = new FileReader();
      reader.onload = () => {
        setPatient((prev) => prev && { ...prev, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSave = async () => {
    if (!patient) return;
    setSaving(true);
    setError("");

    try {
      const patientId = patient.id;
      const payload = new FormData();
      payload.append("name", formData.name || "");
      payload.append("email", formData.email || "");
      if (formData.phone) payload.append("phone", formData.phone);
      if (formData.age) payload.append("age", String(formData.age));
      if (formData.gender) payload.append("gender", formData.gender);
      if (formData.profileImageFile) {
        payload.append("profileImage", formData.profileImageFile);
      }

      const res = await fetch(`/api/patients/${patientId}`, {
        method: "PUT",
        body: payload,
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update");

      setPatient(data.data);
      alert("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center py-8">Loading patient info...</p>;
  if (error) return <p className="text-center py-8 text-red-600">{error}</p>;
  if (!patient) return <p className="text-center py-8">No patient found</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow mt-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">My Profile</h1>

      {/* Profile Image */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <img
            src={patient.profileImage || "/default-avatar.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border border-gray-300"
          />
          <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer">
            <Camera className="w-5 h-5" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{patient.name}</p>
          <p className="text-gray-500">{patient.email}</p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Age</label>
          <input
            type="number"
            name="age"
            value={formData.age || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Gender</label>
          <select
            name="gender"
            value={formData.gender || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
