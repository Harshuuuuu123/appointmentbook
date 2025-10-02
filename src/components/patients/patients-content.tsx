"use client";

import { useState, useEffect } from "react";
import { Search, Plus, FileText } from "lucide-react";
import Link from "next/link";
import { useDoctor } from "@/context/DoctorContext";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  lastVisit?: string;
  condition?: string;
  status: string;
  avatar?: string;
}

export function PatientsContent() {
  const { doctor } = useDoctor();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Fetch patients for logged-in doctor
  const fetchPatients = async (query: string = "") => {
    if (!doctor?.id) return; // Ensure doctor is loaded

    try {
      setLoading(true);
      const res = await fetch(
        `/api/patients?doctorId=${doctor.id}${query ? `&q=${query}` : ""}`
      );
      const data = await res.json();

      if (data.success) {
        setPatients(data.data);
        setError("");
      } else {
        setError(data.message || "Failed to fetch patients");
      }
    } catch (err) {
      setError("Error fetching patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [doctor?.id]);

  const handleSearch = () => {
    fetchPatients(searchTerm);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this patient?")) return;

    try {
      const res = await fetch(`/api/patients?id=${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) setPatients((prev) => prev.filter((p) => p.id !== id));
      else alert(data.message || "Failed to delete");
    } catch (err) {
      alert("Error deleting patient");
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesStatus =
      statusFilter === "All" || patient.status === statusFilter;
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Patients</h1>
        <p className="text-gray-600">
          Manage your patient records and information
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by patient name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Search
            </button>
          </div>
        </div>
      </div>

      {loading && <p className="text-center py-4">Loading patients...</p>}
      {error && <p className="text-red-500 text-center py-2">{error}</p>}

      {/* Patients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-2xl">
                    {patient.avatar || "👤"}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                  <p className="text-sm text-gray-500">ID: {patient.id}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  patient.status === "Active"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {patient.status}
              </span>
            </div>

            {/* Phone + Email (instead of Age + Gender) */}
<div className="flex items-center gap-2 text-muted-foreground">
  <span className="flex items-center gap-2">
    📞
    <span className="text-sm font-medium text-card-foreground">9755383333</span>
  </span>
</div>

<div className="flex items-center gap-2 text-muted-foreground">
  <span className="flex items-center gap-2">
    ✉️
    <span className="text-sm font-medium text-card-foreground">sha@gmail.com</span>
  </span>
</div>


            <div className="flex gap-2">
              <Link
                href={`/dashboard/patients/${patient.id}`}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition-colors"
              >
                <FileText className="h-4 w-4" />
                View Details
              </Link>
              <button
                onClick={() => handleDelete(patient.id)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPatients.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No patients found
          </h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}
