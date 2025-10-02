import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const VALID_STATUSES = ["scheduled", "confirmed", "completed", "cancelled"];

// ---------------------- GET all appointments with full doctor profile ----------------------
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const doctorId = url.searchParams.get("doctorId");
    const patientId = url.searchParams.get("patientId");

    if (!doctorId && !patientId) {
      return NextResponse.json(
        { success: false, message: "doctorId or patientId is required" },
        { status: 400 }
      );
    }

    let querySQL = `
      SELECT 
        a.id,
        a.doctor_id,
        a.patient_id,
        a.date AS appointment_date,
        a.time,
        a.status,
        d.id AS doc_id,
        d.name AS doctor_name,
        d.specialization AS doctor_specialization,
        d.qualification AS doctor_qualification,
        d.experience AS doctor_experience,
        d.phone AS doctor_phone,
        d.email AS doctor_email,
        d.consultation_fee AS doctor_fees,
        d.profile_image AS doctor_image,
        d.bio AS doctor_bio,
        d.rating AS doctor_rating,
        p.id AS patient_id,
        p.username AS patient_name,
        p.email AS patient_email,
        p.phone AS patient_phone,
        a.notes
      FROM appointment a
      LEFT JOIN users p ON a.patient_id = p.id
      LEFT JOIN doctor d ON a.doctor_id = d.id
    `;

    const values: any[] = [];
    if (doctorId) {
      querySQL += ` WHERE a.doctor_id=$1 ORDER BY a.date ASC, a.time ASC`;
      values.push(Number(doctorId));
    } else if (patientId) {
      querySQL += ` WHERE a.patient_id=$1 ORDER BY a.date ASC, a.time ASC`;
      values.push(Number(patientId));
    }

    const res = await query(querySQL, values);

    const appointments = res.rows.map((appt) => ({
      id: appt.id,
      doctor: {
        id: appt.doc_id,
        fullName: appt.doctor_name || "Unknown",
        specialization: appt.doctor_specialization || "N/A",
        qualification: appt.doctor_qualification || "N/A",
        experience: appt.doctor_experience || 0,
        phone: appt.doctor_phone || "",
        email: appt.doctor_email || "",
        consultationFee: appt.doctor_fees || 0,
        profileImage: appt.doctor_image || null,
        bio: appt.doctor_bio || "",
        rating: appt.doctor_rating || 0,
      },
      patient: {
        id: appt.patient_id,
        name: appt.patient_name || "Unknown",
        email: appt.patient_email || "",
        phone: appt.patient_phone || "",
      },
      appointmentDate: appt.appointment_date
        ? new Date(appt.appointment_date).toISOString().split("T")[0]
        : "",
      time: appt.time?.substring(0, 5) || "",
      status: appt.status,
      notes: appt.notes || "",
    }));

    return NextResponse.json({ success: true, appointments });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}

// ---------------------- POST create new appointment ----------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { doctor_id, patient_id, date, time, status } = body;

    if (!doctor_id || !patient_id || !date || !time) {
      return NextResponse.json(
        { success: false, message: "doctor_id, patient_id, date, time are required" },
        { status: 400 }
      );
    }

    const appointmentStatus = VALID_STATUSES.includes(status) ? status : "scheduled";

    const res = await query(
      `INSERT INTO appointment (doctor_id, patient_id, date, time, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [doctor_id, patient_id, date, time, appointmentStatus]
    );

    const appointment = res.rows[0];

    // Notification for doctor
    const notificationMessage = `New appointment booked by patient ID ${patient_id} on ${date} at ${time}`;
    await query(
      `INSERT INTO notification (title, message, recipient_id, recipient_type, is_read, created_at, updated_at)
       VALUES ($1, $2, $3, $4, false, NOW(), NOW())`,
      ["New Appointment", notificationMessage, doctor_id, "doctor"]
    );

    return NextResponse.json({ success: true, data: appointment });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}

// ---------------------- PUT update appointment status ----------------------
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, doctor_id } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "id and status are required" },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    let sql = `UPDATE appointment SET status=$1, updated_at=NOW() WHERE id=$2`;
    const values: any[] = [status, id];

    if (doctor_id) {
      sql += ` AND doctor_id=$3`;
      values.push(doctor_id);
    }

    const res = await query(sql, values);

    if (res.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Appointment not found or not authorized" },
        { status: 404 }
      );
    }

    const updated = await query(`SELECT * FROM appointment WHERE id=$1`, [id]);

    // Notification for status change
    const updatedAppointment = updated.rows[0];
    const notificationMsg = `Appointment ID ${id} status changed to ${status}`;
    await query(
      `INSERT INTO notification (title, message, recipient_id, recipient_type, is_read, created_at, updated_at)
       VALUES ($1, $2, $3, $4, false, NOW(), NOW())`,
      ["Appointment Status Updated", notificationMsg, updatedAppointment.doctor_id, "doctor"]
    );

    return NextResponse.json({ success: true, data: updated.rows[0], message: "Status updated" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
};
