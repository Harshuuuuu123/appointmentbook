// app/api/patients/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } } // Correct: destructure params from context
) {
  try {
    const patientId = Number(params.id); // Use params directly
    if (isNaN(patientId) || patientId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid patient ID" },
        { status: 400 }
      );
    }

    // Fetch patient info only (no doctorId required here)
    const patientRes = await query(`SELECT * FROM patient WHERE id = $1`, [patientId]);
    if (patientRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: patientRes.rows[0],
      message: "Patient retrieved successfully",
    });
  } catch (error: any) {
    console.error("GET patient error:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to fetch patient", error: error.message },
      { status: 500 }
    );
  }
}
