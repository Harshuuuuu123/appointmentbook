// src/app/api/settings/[doctorId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { doctorId: string } }
) {
  try {
    const doctorId = Number(params.doctorId);

    if (!doctorId) {
      return NextResponse.json(
        { success: false, message: "Doctor ID required" },
        { status: 400 }
      );
    }

    // Doctor profile
    const doctorRes = await query(
      `
      SELECT id, name, specialization, qualification, experience, phone, email, 
             consultation_fee, profile_image, bio
      FROM doctor
      WHERE id = $1
      `,
      [doctorId]
    );

    if (doctorRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 }
      );
    }

    const doctor = doctorRes.rows[0];

    // Clinic details
    const clinicRes = await query(
      `
      SELECT id, name, description, address, city, state, phone, consultation_fee, 
             facilities, offer_online_consultation, video_consultation_link
      FROM clinic
      WHERE user_id = $1 AND is_active = TRUE
      LIMIT 1
      `,
      [doctorId]
    );
    const clinic = clinicRes.rows[0] || null;

    // Schedule (doctor timings)
    const scheduleRes = await query(
      `
      SELECT id, day_of_week, start_time, end_time, slot_duration
      FROM doctor_timings
      WHERE doctor_id = $1 AND is_active = TRUE
      `,
      [doctorId]
    );

    return NextResponse.json({
      success: true,
      data: { doctor, clinic, schedule: scheduleRes.rows },
    });
  } catch (err: any) {
    console.error("Settings API Error:", err.message || err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch settings data", error: err.message },
      { status: 500 }
    );
  }
}
