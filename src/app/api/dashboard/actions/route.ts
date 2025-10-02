// app/api/dashboard/actions/route.ts
import { NextResponse } from "next/server";

// Example: dynamically returned actions
export async function GET() {
  try {
    // In a real app, you can fetch actions from DB based on the doctor's role/permissions
    const actions = [
      { label: "Update Delay", icon: "⏱️", color: "bg-secondary", href: "/dashboard/status" },
      { label: "Add Staff", icon: "👥", color: "bg-accent", href: "/dashboard/staff" },
      { label: "View Queue", icon: "📋", color: "bg-primary", href: "/dashboard/appointments" }
    ];

    return NextResponse.json({
      success: true,
      data: actions,
      message: "Quick actions retrieved successfully"
    });
  } catch (error: any) {
    console.error("Error in GET /api/dashboard/actions:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve actions", error: error.message },
      { status: 500 }
    );
  }
}
