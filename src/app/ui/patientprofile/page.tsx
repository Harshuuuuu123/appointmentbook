"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

interface Patient {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface PatientForm extends Partial<Patient> {}

export default function PatientProfilePage() {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<PatientForm>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

      const res = await fetch(`/api/patients/${patientId}`, {
        method: "PUT",
        body: payload,
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update");

      setPatient(data.data);
      setFormData(data.data);
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
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow mt-6 relative">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md flex items-center gap-1"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6 text-gray-900 text-center">My Profile</h1>

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
      </div>

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
