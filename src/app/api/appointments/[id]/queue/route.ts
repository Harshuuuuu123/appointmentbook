// app/api/appointment/[id]/queue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = Number(params.id);

    // Fetch appointment and queue info
    const sql = `
      SELECT a.id, a.status, a.date, a.time, a.position_in_queue,
             d.name AS doctor_name, p.name AS patient_name
      FROM appointment a
      JOIN doctor d ON a.doctor_id = d.id
      JOIN patient p ON a.patient_id = p.id
      WHERE a.id = $1
    `;
    const res = await query(sql, [appointmentId]);
    const queueInfo = res.rows[0];

    if (!queueInfo) {
      return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: queueInfo, message: "Queue info retrieved" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to retrieve queue info", error: error.message }, { status: 500 });
  }
}
