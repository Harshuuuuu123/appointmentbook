// api/patients
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const doctorId = url.searchParams.get("doctorId"); // filter by doctor
    const searchQuery = url.searchParams.get("q") || "";

    if (!doctorId) {
      return NextResponse.json({ success: false, message: "Doctor ID required" }, { status: 400 });
    }

    let sql = `
      SELECT DISTINCT p.*
      FROM patient p
      JOIN appointment a ON a.patient_id = p.id
      WHERE a.doctor_id = $1
    `;
    const values: any[] = [Number(doctorId)];

    if (searchQuery) {
      sql += ` AND (p.name ILIKE $${values.length + 1} OR p.email ILIKE $${values.length + 1})`;
      values.push(`%${searchQuery}%`);
    }

    sql += ` ORDER BY p.id`;

    const res = await query(sql, values);

    return NextResponse.json({
      status: 200,
      success: true,
      data: res.rows,
      message: res.rows.length ? "Patients retrieved successfully" : "No patients found",
    });
  } catch (error: any) {
    console.error("GET patient error:", error.message);
    return NextResponse.json({
      status: 500,
      success: false,
      message: "Failed to retrieve patients",
      error: error.message,
    });
  }
};
