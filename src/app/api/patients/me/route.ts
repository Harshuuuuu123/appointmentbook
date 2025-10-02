import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const patientId = url.searchParams.get("id");

    if (!patientId) {
      return NextResponse.json(
        { success: false, message: "Patient ID is required" },
        { status: 400 }
      );
    }

    const res = await query(
      `SELECT id, name AS username, email, phone, age, gender
       FROM patient
       WHERE id = $1`,
      [Number(patientId)]
    );

    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: res.rows[0],
      message: "Patient retrieved successfully",
    });
  } catch (err: any) {
    console.error("GET /api/patients/me error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch patient", error: err.message },
      { status: 500 }
    );
  }
}