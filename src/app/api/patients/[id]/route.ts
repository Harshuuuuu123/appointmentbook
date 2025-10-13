import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET patient by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = Number(params.id);
    if (isNaN(patientId) || patientId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid patient ID" },
        { status: 400 }
      );
    }

    const patientRes = await query(`SELECT * FROM patient WHERE id = $1`, [
      patientId,
    ]);
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

// PUT update patient
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const patientId = Number(params.id);
  if (isNaN(patientId) || patientId <= 0) {
    return NextResponse.json(
      { success: false, message: "Invalid patient ID" },
      { status: 400 }
    );
  }

  try {
    const formData = await req.formData();
    const name = formData.get("name")?.toString() || "";
    const email = formData.get("email")?.toString() || "";
    const phone = formData.get("phone")?.toString() || null;

    const updateQuery = `
      UPDATE patient
      SET name = $1, email = $2, phone = $3
      WHERE id = $4
      RETURNING *
    `;
    const values = [name, email, phone, patientId];

    const result = await query(updateQuery, values);

    if (!result.rows[0]) {
      return NextResponse.json(
        { success: false, message: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: "Patient updated successfully",
    });
  } catch (err: any) {
    console.error("PUT patient error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update patient", error: err.message },
      { status: 500 }
    );
  }
}
