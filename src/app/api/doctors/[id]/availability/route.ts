// import { type NextRequest, NextResponse } from "next/server";
// import { query } from "@/lib/db";

// // GET availability for a doctor on a specific date
// export async function GET(request: NextRequest) {
//   try {
//     // Extract doctorId from URL path
//     const url = new URL(request.url);
//     const pathParts = url.pathname.split("/"); // ['', 'api', 'doctors', '25']
//     const doctorId = Number(pathParts[3]);

//     if (!doctorId) {
//       return NextResponse.json(
//         { success: false, message: "Doctor ID is required" },
//         { status: 400 }
//       );
//     }

//     const date = url.searchParams.get("date"); // YYYY-MM-DD
//     if (!date) {
//       return NextResponse.json(
//         { success: false, message: "Date parameter is required" },
//         { status: 400 }
//       );
//     }

//     // Determine day of week: 0 = Sunday, 6 = Saturday
//     const requestedDate = new Date(date);
//     const dayOfWeek = requestedDate.getDay();

//     // Fetch doctor timings for that day
//     const timingsRes = await query(
//       `SELECT * FROM doctor_timings WHERE doctor_id = $1 AND day_of_week = $2 AND is_active = true`,
//       [doctorId, dayOfWeek]
//     );

//     if (!timingsRes.rows.length) {
//       return NextResponse.json({
//         success: true,
//         data: { date, availableSlots: [], totalSlots: 0, bookedSlots: 0, isFullyBooked: false },
//         message: "Doctor is not available on this day",
//       });
//     }

//     const dayTiming = timingsRes.rows[0];
//     const slots = generateTimeSlots(dayTiming.start_time, dayTiming.end_time, Number(dayTiming.slot_duration));

//     // Fetch booked appointments for this date
//     const aptRes = await query(
//       `SELECT time FROM appointment WHERE doctor_id = $1 AND date = $2 AND status != 'cancelled'`,
//       [doctorId, date]
//     );

//     const bookedTimes = aptRes.rows.map(r => r.time.slice(0, 5)); // 'HH:mm:ss' -> 'HH:mm'

//     // Map slots with availability
//     const availableSlots = slots.map(slot => ({
//       time: slot,
//       isAvailable: !bookedTimes.includes(slot),
//     }));

//     const maxBookings = Number(dayTiming.max_bookings_per_slot) || slots.length;
//     const bookedCount = bookedTimes.length;

//     return NextResponse.json({
//       success: true,
//       data: {
//         date,
//         dayOfWeek,
//         allSlots: availableSlots,
//         availableSlots: availableSlots.filter(s => s.isAvailable).slice(
//           0,
//           maxBookings - bookedCount >= 0 ? maxBookings - bookedCount : 0
//         ),
//         totalSlots: slots.length,
//         bookedSlots: bookedCount,
//         maxBookings,
//         isFullyBooked: bookedCount >= maxBookings,
//       },
//       message: "Availability retrieved successfully",
//     });

//   } catch (error: any) {
//     console.error("GET availability error:", error.message, error.stack);
//     return NextResponse.json(
//       { success: false, message: "Failed to retrieve availability", error: error.message },
//       { status: 500 }
//     );
//   }
// }

// // Helper: Generate time slots
// function generateTimeSlots(startTime: string, endTime: string, slotDuration: number): string[] {
//   const slots: string[] = [];
//   const [startHour, startMin] = startTime.split(":").map(Number);
//   const [endHour, endMin] = endTime.split(":").map(Number);

//   let currentMinutes = startHour * 60 + startMin;
//   const endMinutes = endHour * 60 + endMin;

//   while (currentMinutes + slotDuration <= endMinutes) {
//     const hours = Math.floor(currentMinutes / 60);
//     const minutes = currentMinutes % 60;
//     slots.push(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`);
//     currentMinutes += slotDuration;
//   }

//   return slots;
// }



import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET availability for a doctor on a specific date
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/"); // ['', 'api', 'doctors', '25', 'availability']
    const doctorId = Number(pathParts[3]);

    if (!doctorId) {
      return NextResponse.json(
        { success: false, message: "Doctor ID is required" },
        { status: 400 }
      );
    }

    const date = url.searchParams.get("date"); // YYYY-MM-DD
    if (!date) {
      return NextResponse.json(
        { success: false, message: "Date parameter is required" },
        { status: 400 }
      );
    }

    // Determine day of week: 0 = Sunday, 6 = Saturday
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay(); // 0-6 (Sunday-Saturday)

    // Fetch doctor timings for that day
    const timingsRes = await query(
      `SELECT * FROM doctor_timings WHERE doctor_id = $1 AND day_of_week = $2 AND is_active = true`,
      [doctorId, dayOfWeek]
    );

    if (!timingsRes.rows.length) {
      return NextResponse.json({
        success: true,
        data: { date, availableSlots: [], totalSlots: 0, bookedSlots: 0, isFullyBooked: false },
        message: "Doctor is not available on this day",
      });
    }

    const dayTiming = timingsRes.rows[0];
    const slots = generateTimeSlots(dayTiming.start_time, dayTiming.end_time, Number(dayTiming.slot_duration));

    // Fetch booked appointments for this date
    const aptRes = await query(
      `SELECT time FROM appointment WHERE doctor_id = $1 AND date = $2 AND status != 'cancelled'`,
      [doctorId, date]
    );

    const bookedTimes = aptRes.rows.map(r => r.time.slice(0, 5)); // 'HH:mm:ss' -> 'HH:mm'

    // Map slots with availability
    const allSlots = slots.map(slot => ({
      time: slot,
      isAvailable: !bookedTimes.includes(slot),
    }));

    const maxBookings = Number(dayTiming.max_bookings_per_slot) || slots.length;
    const bookedCount = bookedTimes.length;

    // Only show slots up to maxBookings per slot
    const availableSlots = allSlots.filter(s => s.isAvailable);

    return NextResponse.json({
      success: true,
      data: {
        date,
        dayOfWeek,
        allSlots,
        availableSlots: availableSlots.slice(0, Math.max(maxBookings - bookedCount, 0)),
        totalSlots: slots.length,
        bookedSlots: bookedCount,
        maxBookings,
        isFullyBooked: bookedCount >= maxBookings,
      },
      message: "Availability retrieved successfully",
    });
  } catch (error: any) {
    console.error("GET availability error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve availability", error: error.message },
      { status: 500 }
    );
  }
}

// Helper: Generate time slots
function generateTimeSlots(startTime: string, endTime: string, slotDuration: number): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  while (currentMinutes + slotDuration <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    slots.push(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`);
    currentMinutes += slotDuration;
  }

  return slots;
}

