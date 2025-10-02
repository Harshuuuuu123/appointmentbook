"use client";

import { useState, useEffect } from "react";
import StaffCard from "./staff-card";
import { useDoctor } from "@/context/DoctorContext";

interface StaffMember {
  id: number;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: string;
}

interface DoctorMember {
  id: number;
  name: string;
  specialization: string;
  email: string;
  experience: string;
  qualification: string;
}

export default function StaffContent() {
  const { doctor } = useDoctor();
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [doctors, setDoctors] = useState<DoctorMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddStaffForm, setShowAddStaffForm] = useState(false);
  const [showAddDoctorForm, setShowAddDoctorForm] = useState(false);

  // Fetch staff
  const fetchStaff = async (query: string = "") => {
    if (!doctor) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/staff${query ? `?q=${query}` : ""}`, {
        headers: { "x-doctor-id": doctor.id.toString() },
      });
      const data = await res.json();
      if (data.success) setStaffMembers(data.data);
      else alert(data.message || "Failed to fetch staff");
    } catch (err) {
      console.error(err);
      alert("Error fetching staff");
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctors
  const fetchDoctors = async () => {
    if (!doctor) return;
    try {
      const res = await fetch(`/api/staff/member`, {
        headers: { "x-doctor-id": doctor.id.toString() },
      });
      const data = await res.json();
      if (data.success) setDoctors(data.data);
      else alert(data.message || "Failed to fetch doctors");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchDoctors();
  }, [doctor]);

  const handleSearch = () => fetchStaff(searchTerm);

  // ------------------- Remove Doctor -------------------
  const handleRemoveDoctor = async (id: number) => {
    if (!doctor) return;
    if (!confirm("Are you sure you want to remove this doctor?")) return;

    try {
      const res = await fetch(`/api/staff/member?id=${id}`, {
        method: "DELETE",
        headers: { "x-doctor-id": doctor.id.toString() },
      });
      const data = await res.json();
      if (data.success) {
        setDoctors((prev) => prev.filter((d) => d.id !== id));
        alert("Doctor removed successfully");
      } else {
        alert(data.message || "Failed to remove doctor");
      }
    } catch (err) {
      console.error(err);
      alert("Error removing doctor");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">My Staff</h1>
          <p className="text-muted-foreground">Manage your clinic staff members</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowAddStaffForm(true)}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span className="text-lg">+</span> Add Staff
          </button>
          <button
            onClick={() => setShowAddDoctorForm(true)}
            className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span className="text-lg">+</span> Add Doctor
          </button>
        </div>
      </div>

      {/* Add Staff Form */}
      {showAddStaffForm && (
        <AddStaffForm
          onClose={() => setShowAddStaffForm(false)}
          doctorId={doctor?.id}
          fetchStaff={fetchStaff}
        />
      )}

      {/* Add Doctor Form */}
      {showAddDoctorForm && (
        <AddDoctorForm
          onClose={() => setShowAddDoctorForm(false)}
          doctorId={doctor?.id}
          fetchDoctors={fetchDoctors}
          setDoctors={setDoctors}
        />
      )}

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-3 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={handleSearch}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Search
        </button>
      </div>

      {loading && <p>Loading staff...</p>}

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {staffMembers.length > 0 ? (
          staffMembers.map((staff) => (
            <StaffCard
              key={staff.id}
              staff={{ ...staff, email: staff.email || "" }}
              onDelete={(id) =>
                setStaffMembers((prev) => prev.filter((s) => s.id !== id))
              }
            />
          ))
        ) : (
          <p>No staff members found.</p>
        )}
      </div>

      {/* Doctors Section */}
      <h2 className="text-2xl font-bold text-primary mb-4">Doctors</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.length > 0 ? (
          doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-card rounded-lg p-6 border border-border flex flex-col justify-between"
            >
              <div>
                <h3 className="font-semibold text-card-foreground">{doc.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Specialization: {doc.specialization}
                </p>
                <p className="text-sm text-muted-foreground">Email: {doc.email}</p>
                <p className="text-sm text-muted-foreground">
                  Experience: {doc.experience} years
                </p>
                <p className="text-sm text-muted-foreground">
                  Qualification: {doc.qualification}
                </p>
              </div>
              <button
                onClick={() => handleRemoveDoctor(doc.id)}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p>No doctors added yet.</p>
        )}
      </div>
    </div>
  );
}

// ------------------- Add Staff Form -------------------
function AddStaffForm({
  onClose,
  doctorId,
  fetchStaff,
}: {
  onClose: () => void;
  doctorId?: number;
  fetchStaff: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
  });
  const roles = ["Receptionist", "Assistant", "Nurse", "Janitor", "Security"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) return alert("Doctor not loaded yet");

    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-doctor-id": doctorId.toString(),
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert("Staff added successfully");
        onClose();
        fetchStaff();
      } else alert(data.message || "Failed to add staff");
    } catch (err) {
      console.error(err);
      alert("Error adding staff");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-card rounded-lg p-6 border border-border mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-card-foreground">
          Add New Staff Member
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
          ✖
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Staff Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full p-3 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Role</label>
          <select
            value={formData.role}
            onChange={(e) => handleInputChange("role", e.target.value)}
            className="w-full p-3 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-ring"
            required
          >
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="w-full p-3 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className="w-full p-3 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="md:col-span-2 flex gap-4 pt-4">
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Add Staff
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ------------------- Add Doctor Form -------------------
function AddDoctorForm({
  onClose,
  fetchDoctors,
  doctorId,
  setDoctors,
}: {
  onClose: () => void;
  fetchDoctors: () => void;
  doctorId?: number;
  setDoctors: React.Dispatch<React.SetStateAction<DoctorMember[]>>;
}) {
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    email: "",
    experience: "",
    qualification: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) return alert("Doctor not loaded yet");

    const { name, email, specialization, experience, qualification } = formData;
    if (!name || !email || !specialization || !experience || !qualification) {
      return alert("All required fields must be provided");
    }

    try {
      const res = await fetch("/api/staff/member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-doctor-id": doctorId.toString(),
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert("Doctor added successfully");
        setDoctors((prev) => [...prev, data.data]);
        onClose();
      } else alert(data.message || "Failed to add doctor");
    } catch (err) {
      console.error(err);
      alert("Error adding doctor");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-card rounded-lg p-6 border border-border mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-card-foreground">Add New Doctor</h2>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
          ✖
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Doctor Name" value={formData.name} onChange={(v) => handleInputChange("name", v)} required />
        <InputField label="Specialization" value={formData.specialization} onChange={(v) => handleInputChange("specialization", v)} required />
        <InputField label="Email" type="email" value={formData.email} onChange={(v) => handleInputChange("email", v)} required />
        <InputField label="Experience (Years)" type="number" value={formData.experience} onChange={(v) => handleInputChange("experience", v)} required />
        <InputField label="Qualification" value={formData.qualification} onChange={(v) => handleInputChange("qualification", v)} required />

        <div className="md:col-span-2 flex gap-4 pt-4">
          <button type="submit" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Add Doctor
          </button>
          <button type="button" onClick={onClose} className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ------------------- InputField Component -------------------
function InputField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-ring"
        required={required}
      />
    </div>
  );
}
