import { type NextRequest, NextResponse } from "next/server"

interface Template {
  title: string
  message: string
  variables: string[]
}

const templates: Record<string, Template> = {
  appointment_delay: {
    title: "Appointment Delayed",
    message: "Dr. {doctorName} is running {delayMinutes} minutes late. Your new appointment time is {newTime}.",
    variables: ["doctorName", "delayMinutes", "newTime"],
  },
  appointment_reminder: {
    title: "Appointment Reminder",
    message: "You have an appointment with Dr. {doctorName} tomorrow at {time}. Please arrive 15 minutes early.",
    variables: ["doctorName", "time"],
  },
  appointment_confirmed: {
    title: "Appointment Confirmed",
    message: "Your appointment with Dr. {doctorName} on {date} at {time} has been confirmed.",
    variables: ["doctorName", "date", "time"],
  },
  appointment_cancelled: {
    title: "Appointment Cancelled",
    message: "Your appointment with Dr. {doctorName} on {date} at {time} has been cancelled. {reason}",
    variables: ["doctorName", "date", "time", "reason"],
  },
  queue_update: {
    title: "Queue Update",
    message: "You are now #{position} in the queue. Estimated wait time: {waitTime} minutes.",
    variables: ["position", "waitTime"],
  },
  ready_for_consultation: {
    title: "Ready for Consultation",
    message: "Dr. {doctorName} is ready to see you now. Please proceed to {location}.",
    variables: ["doctorName", "location"],
  },
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (type) {
      const template = templates[type]
      if (!template) {
        return NextResponse.json({ success: false, message: "Template not found" }, { status: 404 })
      }
      return NextResponse.json({
        success: true,
        data: template,
        message: "Template retrieved successfully",
      })
    }

    // Return all templates if no type is provided
    return NextResponse.json({
      success: true,
      data: templates,
      message: "All templates retrieved successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to retrieve templates" }, { status: 500 })
  }
}
