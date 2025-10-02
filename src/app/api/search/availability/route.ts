import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// ✅ GET available doctors with slots
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date") // YYYY-MM-DD
    const specialization = searchParams.get("specialization")
    const city = searchParams.get("city")
    const timeSlot = searchParams.get("timeSlot") // HH:MM

    if (!date) {
      return NextResponse.json(
        { success: false, message: "Date parameter is required" },
        { status: 400 }
      )
    }

    const requestedDate = new Date(date)
    const dayOfWeek = requestedDate.getDay()

    // ✅ Fetch doctors (active only)
    let doctorSql = `SELECT * FROM doctors WHERE is_active = true`
    const doctorParams: any[] = []

    if (specialization) {
      doctorSql += ` AND LOWER(specialization) = LOWER($${doctorParams.length + 1})`
      doctorParams.push(specialization)
    }

    if (city) {
      doctorSql += ` AND LOWER(clinic_city) = LOWER($${doctorParams.length + 1})`
      doctorParams.push(city)
    }

    const { rows: doctors } = await query(doctorSql, doctorParams)

    // ✅ Fetch all appointments for requested date
    const { rows: appointments } = await query(
      `SELECT * FROM appointment WHERE date = $1 AND status != 'cancelled'`,
      [date]
    )

    // ✅ Check availability for each doctor
    const availabilityResults = doctors
      .map((doctor) => {
        const timings = doctor.timings ? JSON.parse(doctor.timings) : [] // timings stored as JSON
        const dayTiming = timings.find(
          (t: any) => t.dayOfWeek === dayOfWeek && t.isActive
        )

        if (!dayTiming) return null

        // Doctor’s appointments for this date
        const doctorAppointments = appointments.filter(
          (apt) => apt.doctor_id === doctor.id
        )

        // Generate slots
        const allSlots = generateTimeSlots(
          dayTiming.startTime,
          dayTiming.endTime,
          dayTiming.slotDuration
        )

        const availableSlots = allSlots.filter((slot) => {
          const isBooked = doctorAppointments.some((apt) => apt.time === slot)
          const matchesTimeFilter = !timeSlot || slot === timeSlot
          return !isBooked && matchesTimeFilter
        })

        const hasCapacity = doctorAppointments.length < dayTiming.maxBookings

        if (availableSlots.length === 0 || !hasCapacity) return null

        return {
          doctor: {
            id: doctor.id,
            name: doctor.name,
            specialization: doctor.specialization,
            experience: doctor.experience,
            consultationFee: doctor.consultation_fee,
            rating: doctor.rating || 4.5,
            clinic: {
              name: doctor.clinic_name,
              address: doctor.clinic_address,
              city: doctor.clinic_city,
              phone: doctor.clinic_phone,
            },
          },
          availability: {
            date,
            dayOfWeek,
            availableSlots: timeSlot
              ? availableSlots
              : availableSlots.slice(0, 5), // only first 5 if no filter
            totalAvailableSlots: availableSlots.length,
            maxBookings: dayTiming.maxBookings,
            currentBookings: doctorAppointments.length,
            workingHours: {
              start: dayTiming.startTime,
              end: dayTiming.endTime,
              slotDuration: dayTiming.slotDuration,
            },
          },
        }
      })
      .filter(Boolean)

    // Sort by available slots, then rating
    availabilityResults.sort((a, b) => {
      const availabilityDiff =
        b!.availability.totalAvailableSlots -
        a!.availability.totalAvailableSlots
      if (availabilityDiff !== 0) return availabilityDiff
      return (b!.doctor.rating || 0) - (a!.doctor.rating || 0)
    })

    return NextResponse.json({
      success: true,
      data: {
        date,
        results: availabilityResults,
        summary: {
          totalDoctorsFound: availabilityResults.length,
          filters: { specialization, city, timeSlot },
        },
      },
      message: "Availability search completed successfully",
    })
  } catch (error) {
    console.error("Error in GET /availability:", error)
    return NextResponse.json(
      { success: false, message: "Failed to search availability" },
      { status: 500 }
    )
  }
}

// ✅ Helper function to generate slots
function generateTimeSlots(
  startTime: string,
  endTime: string,
  slotDuration: number
): string[] {
  const slots: string[] = []
  const [startHour, startMin] = startTime.split(":").map(Number)
  const [endHour, endMin] = endTime.split(":").map(Number)

  let currentMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin

  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes / 60)
    const minutes = currentMinutes % 60
    const timeString = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`
    slots.push(timeString)
    currentMinutes += slotDuration
  }

  return slots
}
