// app/api/appointment/[id]/summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = Number(params.id);

    const sql = `
      SELECT a.*, 
             d.name AS doctor_name, d.clinic_name, d.phone AS doctor_phone,
             p.name AS patient_name, p.phone AS patient_phone
      FROM appointment a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN patients p ON a.patient_id = p.id
      WHERE a.id = $1
    `;
    const res = await query(sql, [appointmentId]);
    const appointment = res.rows[0];

    if (!appointment) {
      return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: appointment, message: "Appointment summary retrieved" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to retrieve summary", error: error.message }, { status: 500 });
  }
}
