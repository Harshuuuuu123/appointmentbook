import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// ---------------------- GET PATIENT QUEUE STATUS FOR DOCTOR ----------------------
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = Number(params.id);
    if (isNaN(patientId)) {
      return NextResponse.json({ success: false, message: "Invalid patient ID" }, { status: 400 });
    }

    const url = new URL(request.url);
    const doctorId = url.searchParams.get("doctorId");
    const date = url.searchParams.get("date") || new Date().toISOString().split("T")[0];

    if (!doctorId) {
      return NextResponse.json({ success: false, message: "Doctor ID required" }, { status: 400 });
    }

    // Fetch patient
    const patientRes = await query(`SELECT * FROM patient WHERE id = $1`, [patientId]);
    const patient = patientRes.rows[0];
    if (!patient) return NextResponse.json({ success: false, message: "Patient not found" }, { status: 404 });

    // Fetch patient's appointment for this doctor today
    const appointmentRes = await query(
      `SELECT * FROM appointment WHERE patient_id = $1 AND doctor_id = $2 AND date = $3 AND status IN ('scheduled','confirmed','in-progress')`,
      [patientId, Number(doctorId), date]
    );
    const patientAppointment = appointmentRes.rows[0];

    if (!patientAppointment) {
      return NextResponse.json({
        success: true,
        data: { hasAppointment: false },
        message: "No appointment found for today",
      });
    }

    // Fetch all appointments for the doctor today
    const doctorAppointmentsRes = await query(
      `SELECT * FROM appointment WHERE doctor_id = $1 AND date = $2 AND status IN ('scheduled','confirmed','in-progress') ORDER BY time ASC`,
      [Number(doctorId), date]
    );
    const doctorAppointments = doctorAppointmentsRes.rows;

    // Queue calculation
    const queuePosition = doctorAppointments.findIndex(a => a.id === patientAppointment.id) + 1;
    const patientsAhead = queuePosition - 1;
    const estimatedWaitTime = patientsAhead * 15; // avg consultation time in minutes
    const isCurrentPatient = patientAppointment.status === "in-progress";

    // Fetch doctor info
    const doctorRes = await query(`SELECT * FROM doctor WHERE id = $1`, [Number(doctorId)]);
    const doctor = doctorRes.rows[0];

    return NextResponse.json({
      status: 200,
      success: true,
      data: {
        hasAppointment: true,
        appointment: patientAppointment,
        doctor: doctor,
        queueStatus: {
          position: queuePosition,
          patientsAhead,
          estimatedWaitTime,
          isCurrentPatient,
          totalPatientsToday: doctorAppointments.length,
        },
        statusMessage: isCurrentPatient
          ? "You are currently being seen by the doctor"
          : patientsAhead === 0
          ? "You are next in line"
          : `You are #${queuePosition} in the queue. ${patientsAhead} patient${patientsAhead > 1 ? "s" : ""} ahead of you.`,
      },
      message: "Queue status retrieved successfully",
    });
  } catch (error: any) {
    console.error("GET queue status error:", error.message);
    return NextResponse.json({ status: 500, success: false, message: "Failed to retrieve queue status", error: error.message });
  }
}
