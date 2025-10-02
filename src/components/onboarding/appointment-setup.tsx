"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface WeeklyAvailability {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

interface Slot {
  time: string;
  isAvailable: boolean;
}

interface AppointmentSetupProps {
  doctorId: number;
  clinicId?: number;
  patientId?: number;
}

export default function AppointmentSetup({
  doctorId,
  clinicId,
  patientId,
}: AppointmentSetupProps) {
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10); // YYYY-MM-DD
  });

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);

  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability>({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });

  // New state for time settings
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [maxBookingsPerSlot, setMaxBookingsPerSlot] = useState(5);
  const [slotDuration, setSlotDuration] = useState(30);

  // Fetch availability slots
  useEffect(() => {
    if (!doctorId || !selectedDate) return;

    async function fetchSlots() {
      setLoading(true);
      try {
        const res = await fetch(`/api/doctors/${doctorId}/availability?date=${selectedDate}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setSlots(data.data.availableSlots || []);
        } else {
          console.error("Failed to fetch slots:", data.message);
          setSlots([]);
        }
      } catch (err) {
        console.error("Error fetching slots:", err);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSlots();
  }, [doctorId, selectedDate]);

  const handleCheckboxChange = (day: keyof WeeklyAvailability) => {
    setWeeklyAvailability(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const handleSaveAvailability = async () => {
    if (!doctorId) return;

    setLoading(true);
    try {
      const payload = {
        userId: doctorId,
        weeklyAvailability,
        startTime,
        endTime,
        maxBookingsPerSlot,
        slotDuration,
      };

      const res = await fetch("/api/auth/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("Availability saved successfully!");
        router.push("/dashboard");
      } else {
        alert(data.message || "Failed to save availability");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving availability");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow-md">
      <h2 className="text-lg font-semibold mb-4">Setup Availability</h2>

      <label className="block mb-3">
        Select Date:
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </label>

      <div className="flex flex-col gap-2 mb-4">
        <h3 className="font-medium">Weekly Availability</h3>
        {Object.keys(weeklyAvailability).map(day => (
          <label key={day} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={weeklyAvailability[day as keyof WeeklyAvailability]}
              onChange={() => handleCheckboxChange(day as keyof WeeklyAvailability)}
            />
            {day.charAt(0).toUpperCase() + day.slice(1)}
          </label>
        ))}
      </div>

      <div className="mb-4">
        <h3 className="font-medium mb-2">Time Settings</h3>
        <div className="flex gap-2 mb-2">
          <label className="flex flex-col">
            Start Time:
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="border p-1 rounded"
            />
          </label>
          <label className="flex flex-col">
            End Time:
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="border p-1 rounded"
            />
          </label>
        </div>
        <div className="flex gap-2">
          <label className="flex flex-col">
            Max Bookings per Slot:
            <input
              type="number"
              min={1}
              value={maxBookingsPerSlot}
              onChange={e => setMaxBookingsPerSlot(parseInt(e.target.value))}
              className="border p-1 rounded"
            />
          </label>
          <label className="flex flex-col">
            Slot Duration (minutes):
            <input
              type="number"
              min={5}
              value={slotDuration}
              onChange={e => setSlotDuration(parseInt(e.target.value))}
              className="border p-1 rounded"
            />
          </label>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-medium mb-2">Available Time Slots</h3>
        {loading ? (
          <p>Loading slots...</p>
        ) : slots.length === 0 ? (
          <p>No slots available for this date.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map(slot => (
              <span
                key={slot.time}
                className={`px-3 py-1 border rounded ${
                  slot.isAvailable ? "bg-green-100" : "bg-gray-200 line-through"
                }`}
              >
                {slot.time}
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleSaveAvailability}
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {loading ? "Saving..." : "Save Availability"}
      </button>

      {patientId && (
        <p className="mt-2 text-sm text-blue-600">
          Pre-booking enabled for patient ID: {patientId}
        </p>
      )}
    </div>
  );
}
