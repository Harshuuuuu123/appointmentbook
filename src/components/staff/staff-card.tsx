"use client";

import Link from "next/link";
import { useState } from "react";
import { useDoctor } from "@/context/DoctorContext";

interface StaffCardProps {
  staff: {
    id: number;
    name: string;
    role: string;
    email: string;
    phone?: string;
    avatar?: string;
    status?: string;
  };
  onDelete?: (id: number) => void;
}

export default function StaffCard({ staff, onDelete }: StaffCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { doctor } = useDoctor();

  const handleDelete = async () => {
    if (!doctor) return alert("Doctor not loaded yet");
    if (!confirm(`Are you sure you want to remove ${staff.name}?`)) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/staff?id=${staff.id}`, {
        method: "DELETE",
        headers: {
          "x-doctor-id": doctor.id.toString(),
        },
      });
      const data = await res.json();

      if (data.success) {
        alert("Staff removed successfully");
        onDelete?.(staff.id);
      } else {
        alert(data.message || "Failed to remove staff");
      }
    } catch (err) {
      console.error(err);
      alert("Error removing staff");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 border border-border hover:shadow-md transition-shadow relative">
      <Link href={`/dashboard/staff/${staff.id}`}>
        <div className="flex items-center gap-4 mb-4 cursor-pointer">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <span className="text-xl">{staff.avatar || "👤"}</span>
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">{staff.name}</h3>
            <p className="text-sm text-muted-foreground">{staff.role}</p>
          </div>
        </div>
      </Link>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">✉️</span>
          <span className="text-sm text-muted-foreground truncate">{staff.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">📞</span>
          <span className="text-sm text-muted-foreground">{staff.phone || "N/A"}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary">
          {staff.status || "Active"}
        </span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-destructive text-sm font-medium hover:underline"
        >
          {isDeleting ? "Removing..." : "Remove"}
        </button>
      </div>
    </div>
  );
}
