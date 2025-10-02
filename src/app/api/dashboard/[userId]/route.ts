// /api/dashboard/[userId].ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// Dynamic API route: /api/dashboard/[userId]
export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const params = await context.params;
  const userId = params.userId;

  if (!userId) {
    return NextResponse.json(
      { success: false, message: "UserId missing" },
      { status: 400 }
    );
  }

  try {
    // ------------------ Doctor Info ------------------
    const { rows: doctorRows } = await query(
      `SELECT 
         id, 
         name AS "fullName", 
         specialization, 
         qualification, 
         profile_image AS "profileImage", 
         clinic_id AS "clinicId"
       FROM doctor
       WHERE id = $1`,
      [Number(userId)]
    );

    let doctor = doctorRows?.[0] || null;

    if (!doctor) {
      // fallback doctor
      doctor = {
        id: Number(userId),
        fullName: "Demo Doctor",
        specialization: "General Medicine",
        qualification: "MBBS",
        profileImage: null,
        clinicId: null,
      };
    }

    // ------------------ Clinic Info ------------------
    let clinic = null;
    if (doctor.clinicId) {
      const { rows: clinicRows } = await query(
        `SELECT id, name, address, phone AS "contactNumber"
         FROM clinic
         WHERE id = $1`,
        [doctor.clinicId]
      );
      clinic = clinicRows?.[0] || null;
    }

    // ------------------ Today's Appointments ------------------
    const today = new Date().toISOString().split("T")[0];
    const { rows: appointments } = await query(
      `SELECT 
         a.id, 
         a.patient_id AS "patientId",
         p.name AS "patientName",
         p.phone AS "patientPhone",
         a.date AS "appointmentDate",
         a.status, 
         a.time,
         a.doctor_id
       FROM appointment a
       LEFT JOIN patient p ON a.patient_id = p.id
       WHERE a.doctor_id = $1 AND a.date = $2
       ORDER BY a.time ASC`,
      [doctor.id, today]
    );

    // ------------------ All Patients ------------------
    const { rows: allPatients } = await query(
      `SELECT DISTINCT p.id, p.name, p.phone
       FROM patient p
       JOIN appointment a ON a.patient_id = p.id
       WHERE a.doctor_id = $1`,
      [doctor.id]
    );

    // ------------------ Response ------------------
    return NextResponse.json({
      success: true,
      doctor,
      clinic,
      appointments,
      patients: allPatients,
    });
  } catch (err: any) {
    console.error("Dashboard API error:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
