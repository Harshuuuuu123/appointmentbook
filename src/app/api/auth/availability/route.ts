// app/api/auth/availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { userId, weeklyAvailability, startTime, endTime, maxBookingsPerSlot, slotDuration } =
    await request.json();

  try {
    const result = await query(
      `INSERT INTO doctor_timings 
       (doctor_id, monday, tuesday, wednesday, thursday, friday, saturday, sunday, start_time, end_time, max_bookings, slot_duration, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW()) RETURNING *`,
      [
        userId,
        weeklyAvailability.monday,
        weeklyAvailability.tuesday,
        weeklyAvailability.wednesday,
        weeklyAvailability.thursday,
        weeklyAvailability.friday,
        weeklyAvailability.saturday,
        weeklyAvailability.sunday,
        startTime,
        endTime,
        maxBookingsPerSlot,
        slotDuration,
      ]
    );
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to save availability" }, { status: 500 });
  }
}
