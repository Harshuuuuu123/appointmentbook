// app/api/auth/appointments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// Weekday map: string -> integer
const weekdayMap: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

// GET: fetch doctor availability
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }

    const res = await query(
      `SELECT day_of_week, start_time, end_time, slot_duration, max_bookings 
       FROM doctor_timings 
       WHERE doctor_id = $1 AND is_active = TRUE`,
      [Number(userId)]
    );

    return NextResponse.json({
      success: true,
      data: res.rows,
      message: "Doctor availability fetched successfully",
    });
  } catch (err: any) {
    console.error("GET doctor timings error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch doctor timings", error: err.message },
      { status: 500 }
    );
  }
}

// POST: save doctor availability
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, weeklyAvailability, startTime, endTime, maxBookingsPerSlot, slotDuration } = body;

    if (!userId || !weeklyAvailability || 
      !startTime || !endTime || !maxBookingsPerSlot || !slotDuration) {
      return NextResponse.json(
        { success: false, message: "Required fields are missing" },
        { status: 400 }
      );
    }

    // Ensure numeric values
    const maxBookings = parseInt(maxBookingsPerSlot, 10);
    const slotDur = parseInt(slotDuration, 10);

    const insertPromises = Object.keys(weeklyAvailability).map(async (day) => {
      if (weeklyAvailability[day]) {
        const dayInt = weekdayMap[day];
        if (!dayInt) return null;

        return query(
          `INSERT INTO doctor_timings
           (doctor_id, day_of_week, start_time, end_time, slot_duration, max_bookings, is_active, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, TRUE, NOW())
           RETURNING *`,
          [userId, dayInt, startTime, endTime, slotDur, maxBookings]
        );
      }
      return null;
    });

    const results = await Promise.all(insertPromises);
    const insertedRows = results.filter(Boolean).map(r => r!.rows[0]);

    return NextResponse.json({
      success: true,
      data: insertedRows,
      message: "Appointment settings saved successfully",
    });

  } catch (err: any) {
    console.error("POST doctor timings error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to save appointment settings" },
      { status: 500 }
    );
  }
}
