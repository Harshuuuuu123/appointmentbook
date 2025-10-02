// app/api/appointment/[id]/receipt/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = Number(params.id);

    const sql = `
      SELECT a.id, a.date, a.time, a.payment_amount, a.payment_method,
             d.name AS doctor_name, d.clinic_name,
             p.name AS patient_name
      FROM appointment a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN patients p ON a.patient_id = p.id
      WHERE a.id = $1
    `;
    const res = await query(sql, [appointmentId]);
    const receipt = res.rows[0];

    if (!receipt) {
      return NextResponse.json({ success: false, message: "Receipt not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: receipt, message: "Receipt retrieved successfully" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to retrieve receipt", error: error.message }, { status: 500 });
  }
}
