import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Extract doctorId from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/"); // ['', 'api', 'doctors', '34', 'availability']
    const doctorId = Number(pathParts[3]);

    if (!doctorId) {
      return NextResponse.json(
        { success: false, message: "Doctor ID is required" },
        { status: 400 }
      );
    }

    const date = url.searchParams.get("date"); // YYYY-MM-DD
    if (!date) {
      return NextResponse.json(
        { success: false, message: "Date parameter is required" },
        { status: 400 }
      );
    }

    // Get day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = new Date(date).getDay();

    // Fetch doctor timings for the day
    const timingsRes = await query(
      `SELECT * FROM doctor_timings WHERE doctor_id = $1 AND day_of_week = $2 AND is_active = true`,
      [doctorId, dayOfWeek]
    );

    if (!timingsRes.rows.length) {
      return NextResponse.json({
        success: true,
        data: {
          date,
          dayOfWeek,
          availableSlots: [],
          totalSlots: 0,
          bookedSlots: 0,
          isFullyBooked: false,
        },
        message: "Doctor is not available on this day",
      });
    }

    const dayTiming = timingsRes.rows[0];

    // Generate all possible slots
    const slots = generateTimeSlots(
      dayTiming.start_time,
      dayTiming.end_time,
      Number(dayTiming.slot_duration)
    );

    // Fetch booked appointments
    const aptRes = await query(
      `SELECT time FROM appointment WHERE doctor_id = $1 AND date = $2 AND status != 'cancelled'`,
      [doctorId, date]
    );

    const bookedTimes = aptRes.rows.map((r) => r.time.slice(0, 5)); // 'HH:mm:ss' -> 'HH:mm'

    // Mark availability
    const availableSlots = slots.map((time) => ({
      time,
      isAvailable: !bookedTimes.includes(time),
    }));

    const maxBookings = Number(dayTiming.max_bookings_per_slot) || slots.length;
    const bookedCount = bookedTimes.length;

    return NextResponse.json({
      success: true,
      data: {
        date,
        dayOfWeek,
        allSlots: availableSlots,
        availableSlots: availableSlots.filter((s) =>
          s.isAvailable ? true : false
        ).slice(0, Math.max(0, maxBookings - bookedCount)),
        totalSlots: slots.length,
        bookedSlots: bookedCount,
        maxBookings,
        isFullyBooked: bookedCount >= maxBookings,
      },
      message: "Availability retrieved successfully",
    });
  } catch (err: any) {
    console.error("GET availability error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve availability", error: err.message },
      { status: 500 }
    );
  }
}

// Helper to generate time slots
function generateTimeSlots(startTime: string, endTime: string, slotDuration: number): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  while (currentMinutes + slotDuration <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    slots.push(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`);
    currentMinutes += slotDuration;
  }

  return slots;
}
