"use client";

import { useState } from "react";
import Link from "next/link";
import { useDoctor } from "@/context/DoctorContext";

export { StatusUpdate };
export default function StatusUpdate() {
  const { doctor } = useDoctor(); 
  const [currentStatus, setCurrentStatus] = useState("On Time");
  const [delayMinutes, setDelayMinutes] = useState(15);
  const [customMessage, setCustomMessage] = useState("");
  const [notifyPatients, setNotifyPatients] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSaveAndNotify = async () => {
    if (!doctor?.id) return alert("Doctor not loaded");

    setLoading(true);
    try {
   const res = await fetch(`/api/doctors/${doctor.id}/status`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    status: currentStatus === "On Time" ? "available" : "delayed",
    estimatedDelay: delayMinutes,
    message: customMessage,
  }),
});

      const data = await res.json();
      if (data.success) alert("Status updated successfully");
      else alert(data.message || "Failed to update status");
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Update Clinic Status</h1>
          <p className="text-muted-foreground">Delay Status Updated</p>
          <p className="text-sm text-muted-foreground">Patients have been updated about the clinic status</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="bg-card rounded-lg p-6 border border-border mb-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-6">Current Status</h2>

          <div className="space-y-6">
            {/* Status Buttons */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Status</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStatus("On Time")}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentStatus === "On Time"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  On Time
                </button>
                <button
                  onClick={() => setCurrentStatus("Delayed")}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentStatus === "Delayed"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Delayed
                </button>
              </div>
            </div>

            {/* Delay Time */}
            {currentStatus === "Delayed" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Delay Time (minutes): {delayMinutes}
                </label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={delayMinutes}
                  onChange={(e) => setDelayMinutes(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5 min</span>
                  <span>60 min</span>
                </div>
              </div>
            )}

            {/* Custom Message */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Custom Message for Patients (Optional)
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter a custom message for patients"
                rows={4}
                className="w-full p-3 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {/* Notify Patients */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <h3 className="font-medium text-foreground">Notify Patients</h3>
                <p className="text-sm text-muted-foreground">Send update to all waiting patients</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyPatients}
                  onChange={(e) => setNotifyPatients(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              onClick={handleSaveAndNotify}
              disabled={loading}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Updating..." : "Save & Notify"}
            </button>
            <Link href="/dashboard">
              <button className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
