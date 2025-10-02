"use client";

import Link from "next/link";
import { useDoctor } from "@/context/DoctorContext";

export default function QuickActions() {
  const { doctor } = useDoctor();

  const actions = [
    { label: "Update Delay", icon: "⏱️", color: "#6C63FF", href: "/dashboard/status" },
    { label: "Add Staff", icon: "👥", color: "#FF6584", href: "/dashboard/staff" },
    {
      label: "View Queue",
      icon: "📋",
      color: "#00BFA6",
      href: doctor?.id ? `/dashboard/appointments` : "#", // Can append ?doctorId=${doctor.id} if needed
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "#f9f9fb",
        borderRadius: "12px",
        padding: "24px",
        fontFamily: "Segoe UI, sans-serif",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        border: "1px solid #e5e7eb",
      }}
    >
      <h3
        style={{
          fontWeight: 600,
          fontSize: "18px",
          marginBottom: "20px",
          color: "#333",
        }}
      >
        Quick Actions
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {actions.map((action, index) => (
          <Link key={index} href={action.href}>
            <button
              style={{
                backgroundColor: action.color,
                color: "white",
                padding: "14px 20px",
                borderRadius: "10px",
                fontWeight: 500,
                fontSize: "15px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                border: "none",
                cursor: doctor ? "pointer" : "not-allowed",
                opacity: doctor ? "1" : "0.5",
                boxShadow: "0 3px 6px rgba(0,0,0,0.12)",
                transition: "all 0.2s ease-in-out",
                width: "100%",
              }}
              disabled={!doctor}
              onMouseEnter={(e) =>
                ((e.target as HTMLButtonElement).style.opacity = doctor ? "0.9" : "0.5")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLButtonElement).style.opacity = doctor ? "1" : "0.5")
              }
            >
              <span style={{ fontSize: "20px" }}>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
