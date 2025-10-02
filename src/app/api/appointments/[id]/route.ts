import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const VALID_STATUSES = ["scheduled", "confirmed", "completed", "cancelled"];

// ---------------------- GET APPOINTMENT BY ID ----------------------
export async function GET(
  req: NextRequest,
  context: { params: { id: string } } // explicit type
) {
  try {
    // Directly use context.params.id
    const appointmentId = Number(context.params.id);

    if (!appointmentId || isNaN(appointmentId)) {
      return NextResponse.json(
        { success: false, message: "Invalid appointment ID" },
        { status: 400 }
      );
    }

    // Optional doctorId query param (filter by doctor)
    const url = new URL(req.url);
    const doctorId = url.searchParams.get("doctorId");

    let sql = `
      SELECT 
        a.*,
        d.name AS doctor_name,
        d.phone AS doctor_phone,
        p.name AS patient_name,
        p.email AS patient_email,
        p.phone AS patient_phone
      FROM appointment a
      LEFT JOIN doctor d ON a.doctor_id = d.id
      LEFT JOIN patient p ON a.patient_id = p.id
      WHERE a.id = $1
    `;
    const values: any[] = [appointmentId];

    if (doctorId) {
      sql += ` AND a.doctor_id = $2`;
      values.push(Number(doctorId));
    }

    const res = await query(sql, values);

    if (!res.rows.length) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: res.rows[0],
      message: "Appointment retrieved successfully",
    });
  } catch (error: any) {
    console.error("GET appointment error:", error.message);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// ---------------------- UPDATE APPOINTMENT STATUS ----------------------
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } } // explicit type
) {
  try {
    // Directly use context.params.id
    const appointmentId = Number(context.params.id);

    if (!appointmentId || isNaN(appointmentId)) {
      return NextResponse.json(
        { success: false, message: "Invalid appointment ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    // Optional doctorId: only allow doctor to update their own appointments
    const url = new URL(req.url);
    const doctorId = url.searchParams.get("doctorId");

    const values: any[] = [status, appointmentId];
    let sql = `
      UPDATE appointment
      SET status = $1, updated_at = NOW()
      WHERE id = $2
    `;
    if (doctorId) {
      sql += " AND doctor_id = $3";
      values.push(Number(doctorId));
    }

    sql += " RETURNING *"; // ensure we get updated row

    const res = await query(sql, values);

    if (!res.rows.length) {
      return NextResponse.json(
        { success: false, message: "Appointment not found or not authorized" },
        { status: 404 }
      );
    }

    // fetch full appointment with patient & doctor info
    const updated = await query(
      `
      SELECT 
        a.*,
        d.name AS doctor_name,
        d.phone AS doctor_phone,
        p.name AS patient_name,
        p.email AS patient_email,
        p.phone AS patient_phone
      FROM appointment a
      LEFT JOIN doctor d ON a.doctor_id = d.id
      LEFT JOIN patient p ON a.patient_id = p.id
      WHERE a.id = $1
      `,
      [appointmentId]
    );

    return NextResponse.json({
      success: true,
      data: updated.rows[0],
      message: "Appointment updated successfully",
    });
  } catch (err: any) {
    console.error("PUT appointment error:", err.message);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
