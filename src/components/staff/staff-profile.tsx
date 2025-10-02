"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDoctor } from "@/context/DoctorContext";

interface StaffProfileProps {
  staffId: string;
}

interface StaffMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone?: string;
  status?: string;
}

export default function StaffProfile({ staffId }: StaffProfileProps) {
  const { doctor } = useDoctor();
  const router = useRouter();
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", role: "", email: "", phone: "", status: "Active" });

  // Fetch staff by ID
  useEffect(() => {
    const fetchStaff = async () => {
      if (!doctor) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/staff?id=${staffId}`, {
          headers: { "x-doctor-id": doctor.id.toString() },
        });
        const data = await res.json();
        if (data.success) {
          setStaff(data.data);
          setFormData({
            name: data.data.name,
            role: data.data.role,
            email: data.data.email,
            phone: data.data.phone || "",
            status: data.data.status || "Active",
          });
        } else {
          alert(data.message || "Staff not found");
          router.push("/dashboard/staff");
        }
      } catch (err) {
        console.error(err);
        alert("Error fetching staff");
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [doctor, staffId, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    if (!doctor || !staff) return;
    try {
      const res = await fetch("/api/staff", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-doctor-id": doctor.id.toString() },
        body: JSON.stringify({ id: staff.id, ...formData }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Staff updated successfully");
        setStaff(data.data);
        setEditMode(false);
      } else alert(data.message || "Failed to update staff");
    } catch (err) {
      console.error(err);
      alert("Error updating staff");
    }
  };

  const handleDelete = async () => {
    if (!doctor || !staff) return;
    if (!confirm("Are you sure you want to remove this staff member?")) return;

    try {
      const res = await fetch(`/api/staff?id=${staff.id}`, {
        method: "DELETE",
        headers: { "x-doctor-id": doctor.id.toString() },
      });
      const data = await res.json();
      if (data.success) {
        alert("Staff removed successfully");
        router.push("/dashboard/staff");
      } else alert(data.message || "Failed to remove staff");
    } catch (err) {
      console.error(err);
      alert("Error removing staff");
    }
  };

  if (loading) return <p>Loading staff profile...</p>;
  if (!staff) return <p>Staff not found.</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto bg-card rounded-lg border border-border">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-card-foreground">{editMode ? "Edit Staff" : staff.name}</h1>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button
                onClick={handleUpdate}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Remove
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Name</label>
          {editMode ? (
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full p-3 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-ring"
            />
          ) : (
            <p className="text-card-foreground">{staff.name}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Role</label>
          {editMode ? (
            <input
              type="text"
              value={formData.role}
              onChange={(e) => handleInputChange("role", e.target.value)}
              className="w-full p-3 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-ring"
            />
          ) : (
            <p className="text-card-foreground">{staff.role}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Email</label>
          {editMode ? (
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full p-3 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-ring"
            />
          ) : (
            <p className="text-card-foreground">{staff.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
          {editMode ? (
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="w-full p-3 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-ring"
            />
          ) : (
            <p className="text-card-foreground">{staff.phone || "-"}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Status</label>
          {editMode ? (
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full p-3 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          ) : (
            <p className="text-card-foreground">{staff.status || "Active"}</p>
          )}
        </div>
      </div>
    </div>
  );
}
