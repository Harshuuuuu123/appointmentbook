import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get("doctorId")
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

    // Fetch appointments for the given date (and doctor if provided)
    let sql = `SELECT * FROM appointment WHERE date = $1`
    let params: any[] = [date]

    if (doctorId) {
      sql += ` AND doctor_id = $2`
      params.push(Number(doctorId))
    }

    const { rows: appointments } = await query(sql, params)

    // Calculate statistics
    const stats = {
      date,
      totalAppointments: appointments.length,
      completed: appointments.filter((apt) => apt.status === "completed").length,
      noShows: appointments.filter((apt) => apt.status === "no-show").length,
      cancelled: appointments.filter((apt) => apt.status === "cancelled").length,
      inProgress: appointments.filter((apt) => apt.status === "in-progress").length,
      waiting: appointments.filter(
        (apt) => apt.status === "scheduled" || apt.status === "confirmed"
      ).length,
    }

    // Completion & no-show rates
    const completionRate =
      stats.totalAppointments > 0
        ? ((stats.completed / stats.totalAppointments) * 100).toFixed(1)
        : "0.0"

    const noShowRate =
      stats.totalAppointments > 0
        ? ((stats.noShows / stats.totalAppointments) * 100).toFixed(1)
        : "0.0"

    // Fetch doctor info with clinic name if doctorId is provided
    let doctorStats = null
    if (doctorId) {
      const { rows: doctorRows } = await query(
        `SELECT d.id, d.name, d.specialization, c.name AS clinic_name
         FROM doctor d
         LEFT JOIN clinic c ON d.clinic_id = c.id
         WHERE d.id = $1`,
        [doctorId]
      )

      if (doctorRows.length > 0) {
        const doctor = doctorRows[0]
        doctorStats = {
          doctorId: doctor.id,
          doctorName: doctor.name,
          specialization: doctor.specialization,
          clinicName: doctor.clinic_name || "N/A",
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        completionRate: `${completionRate}%`,
        noShowRate: `${noShowRate}%`,
        doctor: doctorStats,
      },
      message: "Queue statistics retrieved successfully",
    })
  } catch (error: any) {
    console.error("Error in GET /api/queue/stats:", error.message)
    return NextResponse.json(
      { success: false, message: "Failed to retrieve stats", error: error.message },
      { status: 500 }
    )
  }
}
