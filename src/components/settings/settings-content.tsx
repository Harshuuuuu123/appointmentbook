"use client";

import { useState, useEffect } from "react";
import { Save, Bell, Shield, User, Building, Clock, Camera } from "lucide-react";
import { useDoctor } from "@/context/DoctorContext";

// -------------------- Type Definitions --------------------
type Doctor = {
  id: number;
  fullName: string;
  specialty?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
};

type Notifications = {
  email: boolean;
  sms: boolean;
  push: boolean;
  appointments: boolean;
  reminders: boolean;
};

type Clinic = {
  name: string;
  address: string;
  consultationFee: number;
  slotDuration: number;
};

type WorkingHours = {
  start: string;
  end: string;
  active: boolean;
};

type Schedule = Record<string, WorkingHours>;

type Security = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type Profile = {
  fullName: string;
  specialty: string;
  email: string;
  phone: string;
};

type Settings = {
  profile: Profile;
  clinic: Clinic;
  notifications: Notifications;
  security: Security;
  schedule: Schedule;
};

// -------------------- Component --------------------
export function SettingsContent() {
  const { doctor } = useDoctor() as { doctor: Doctor | null };
  const [settings, setSettings] = useState<Settings | null>(null);
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "clinic", label: "Clinic", icon: Building },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "schedule", label: "Schedule", icon: Clock },
  ];

  // -------------------- Fetch settings (once on mount or doctor.id change) --------------------
  useEffect(() => {
    if (!doctor?.id) return;

    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/settings/${doctor.id}`);
        const data = await res.json();

        if (res.ok && data.success) {
          const scheduleJson = data.data.schedule || {};
          const schedule: Schedule = {};
          const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
          days.forEach(day => {
            schedule[day] = scheduleJson.find((s: any) => String(s.day_of_week).toLowerCase() === day) || { start: "09:00", end: "17:00", active: true };
          });

          const mappedSettings: Settings = {
            profile: {
              fullName:
                data.data.profile?.fullName?.trim() ||
                data.data.doctor?.name?.trim() ||
                doctor.fullName || "",
              specialty:
                data.data.profile?.specialization?.trim() ||
                data.data.doctor?.specialization?.trim() ||
                doctor.specialty || "",
              email: data.data.profile?.email || data.data.doctor?.email || doctor.email || "",
              phone: data.data.profile?.phone || data.data.doctor?.phone || doctor.phone || "",
            },
            clinic: {
              name: data.data.clinic?.name || "",
              address: data.data.clinic?.address || "",
              consultationFee: data.data.clinic?.consultationFee || 0,
              slotDuration: data.data.clinic?.slotDuration || 30,
            },
            notifications: {
              email: data.data.notifications?.email ?? false,
              sms: data.data.notifications?.sms ?? false,
              push: data.data.notifications?.push ?? false,
              appointments: data.data.notifications?.appointments ?? false,
              reminders: data.data.notifications?.reminders ?? false,
            },
            security: {
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            },
            schedule,
          };

          setSettings(mappedSettings);
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [doctor?.id]); // ✅ dependency fixed

  // -------------------- Save settings --------------------
  const saveSettings = async () => {
    if (!doctor?.id || !settings) return;

    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: doctor.id, ...settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save settings");
      alert("Settings saved successfully!");
    } catch (err: any) {
      console.error("Save error:", err);
      alert(err.message || "Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (!doctor) return <p className="text-center py-6 text-blue-500">Loading doctor data...</p>;
  if (loading || !settings) return <p className="text-center py-6 text-blue-500">Loading settings...</p>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and clinic preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            {/* Profile */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={doctor.profileImage || "https://via.placeholder.com/80"}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <button className="absolute bottom-0 right-0 p-1 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 transition-colors">
                      <Camera className="h-3 w-3" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{settings.profile.fullName}</h3>
                    <p className="text-gray-500">{settings.profile.specialty}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={settings.profile.fullName}
                    onChange={(e) =>
                      setSettings({ ...settings, profile: { ...settings.profile, fullName: e.target.value } })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={settings.profile.specialty}
                    onChange={(e) =>
                      setSettings({ ...settings, profile: { ...settings.profile, specialty: e.target.value } })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) =>
                      setSettings({ ...settings, profile: { ...settings.profile, email: e.target.value } })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="tel"
                    value={settings.profile.phone}
                    onChange={(e) =>
                      setSettings({ ...settings, profile: { ...settings.profile, phone: e.target.value } })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Clinic */}
            {activeTab === "clinic" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinic Information</h2>
                <input
                  type="text"
                  value={settings.clinic.name}
                  onChange={(e) =>
                    setSettings({ ...settings, clinic: { ...settings.clinic, name: e.target.value } })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <textarea
                  value={settings.clinic.address}
                  onChange={(e) =>
                    setSettings({ ...settings, clinic: { ...settings.clinic, address: e.target.value } })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={settings.clinic.consultationFee}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        clinic: { ...settings.clinic, consultationFee: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    value={settings.clinic.slotDuration}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        clinic: { ...settings.clinic, slotDuration: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="font-medium capitalize">{key}</span>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, [key]: e.target.checked },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Security */}
            {activeTab === "security" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
                <input
                  type="password"
                  placeholder="Current Password"
                  value={settings.security.currentPassword}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, currentPassword: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={settings.security.newPassword}
                  onChange={(e) =>
                    setSettings({ ...settings, security: { ...settings.security, newPassword: e.target.value } })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={settings.security.confirmPassword}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, confirmPassword: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}

            {/* Schedule */}
            {activeTab === "schedule" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Working Hours</h2>
                {Object.entries(settings.schedule).map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={hours.active}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            schedule: { ...settings.schedule, [day]: { ...hours, active: e.target.checked } },
                          })
                        }
                      />
                      <span className="font-medium capitalize">{day}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={hours.start}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            schedule: { ...settings.schedule, [day]: { ...hours, start: e.target.value } },
                          })
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={hours.end}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            schedule: { ...settings.schedule, [day]: { ...hours, end: e.target.value } },
                          })
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end mt-6 pt-4 border-t">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
