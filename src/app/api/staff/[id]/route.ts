import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// PUT: Update Staff
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const doctorId = req.headers.get("x-doctor-id");
    if (!doctorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, role, phone, is_active } = await req.json();

    const result = await query(
      `UPDATE staff
       SET name=$1, email=$2, role=$3, phone=$4, is_active=$5, updated_at=NOW()
       WHERE id=$6 AND doctor_id=$7
       RETURNING id, name, email, role, phone, is_active, created_at, updated_at`,
      [name, email, role, phone, is_active ?? true, params.id, doctorId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("PUT /staff/:id error:", error);
    return NextResponse.json({ error: "Failed to update staff" }, { status: 500 });
  }
}

// DELETE: Delete Staff
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const doctorId = _.headers.get("x-doctor-id");
    if (!doctorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await query(
      `DELETE FROM staff WHERE id=$1 AND doctor_id=$2 RETURNING id`,
      [params.id, doctorId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Staff deleted successfully" });
  } catch (error) {
    console.error("DELETE /staff/:id error:", error);
    return NextResponse.json({ error: "Failed to delete staff", status: 500 });
  }
};
