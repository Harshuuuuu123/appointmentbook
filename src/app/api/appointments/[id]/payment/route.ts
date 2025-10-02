import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = Number(params.id);
    if (isNaN(appointmentId)) {
      return NextResponse.json({ success: false, message: "Invalid appointment ID" }, { status: 400 });
    }

    const res = await query(`SELECT * FROM appointment WHERE id = $1`, [appointmentId]);
    const appointment = res.rows[0];

    if (!appointment) {
      return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: appointment });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch appointment", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = Number(params.id);
    if (isNaN(appointmentId)) {
      return NextResponse.json({ success: false, message: "Invalid appointment ID" }, { status: 400 });
    }

    const body = await request.json();
    const { amount, method, doctorId } = body;

    if (!amount || !method) {
      return NextResponse.json(
        { success: false, message: "Payment amount and method are required" },
        { status: 400 }
      );
    }

    // Optional: you can also update doctorId if passed
    const sql = `
      UPDATE appointment
      SET payment_status = 'paid',
          payment_amount = $1,
          payment_method = $2,
          payment_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    const res = await query(sql, [amount, method, appointmentId]);
    const updatedAppointment = res.rows[0];

    if (!updatedAppointment) {
      return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedAppointment,
      message: "Payment processed successfully",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Payment failed", error: error.message }, { status: 500 });
  }
}
