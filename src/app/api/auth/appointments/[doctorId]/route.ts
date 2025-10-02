import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { doctorId?: string } }
) {
  try {
    const doctorId = Number(params.doctorId);
    if (!doctorId) return NextResponse.json({ success: false, message: "Doctor ID required" }, { status: 400 });

    const res = await query(
      `SELECT * FROM doctor_timings WHERE doctor_id = $1 AND is_active = TRUE`,
      [doctorId]
    );

    return NextResponse.json({ success: true, data: res.rows, message: "Doctor timings retrieved" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to fetch timings", error: err.message }, { status: 500 });
  }
}
