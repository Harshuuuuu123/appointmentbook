import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// ---------------------- GET PATIENT APPOINTMENTS ----------------------
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = Number(params.id);
    if (isNaN(patientId)) {
      return NextResponse.json(
        { success: false, message: "Invalid patient ID" },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const doctorId = url.searchParams.get("doctorId"); // optional filter
    const date = url.searchParams.get("date"); // optional filter

    // Check if patient exists
    const patientRes = await query(`SELECT * FROM patient WHERE id = $1`, [patientId]);
    if (patientRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Patient not found" },
        { status: 404 }
      );
    }

    // Build SQL dynamically
    let sql = `
      SELECT 
        a.*, 
        d.name AS doctor_name, 
        d.specialty AS doctor_specialization, 
        d.clinic_id AS doctor_clinic
      FROM appointment a
      JOIN doctor d ON a.doctor_id = d.id
      WHERE a.patient_id = $1
    `;
    const values: any[] = [patientId];

    if (doctorId) {
      sql += ` AND a.doctor_id = $${values.length + 1}`;
      values.push(Number(doctorId));
    }

    if (date) {
      sql += ` AND a.date = $${values.length + 1}`;
      values.push(date);
    }

    sql += ` ORDER BY a.date DESC, a.time DESC`;

    const appointmentsRes = await query(sql, values);

    return NextResponse.json({
      status: 200,
      success: true,
      data: appointmentsRes.rows,
      message: appointmentsRes.rows.length
        ? "Appointments retrieved successfully"
        : "No appointments found",
    });
  } catch (error: any) {
    console.error("GET patient appointments error:", error.message);
    return NextResponse.json({
      status: 500,
      success: false,
      message: "Failed to retrieve appointments",
      error: error.message,
    });
  }
}
