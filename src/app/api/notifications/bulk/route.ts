import { type NextRequest, NextResponse } from "next/server"

// Mock data store
const notifications: any[] = []

interface BulkActionBody {
  action: string
  recipientId?: number | string | null
  recipientType?: string | null
  notificationIds?: number[]
}

export async function PUT(request: NextRequest) {
  try {
    const body: BulkActionBody = await request.json()
    const { action, recipientId, recipientType, notificationIds } = body

    if (!action) {
      return NextResponse.json({ success: false, message: "Action is required" }, { status: 400 })
    }

    let updatedCount = 0

    // Convert recipientId to number safely
    const recipientIdNum: number | undefined =
      recipientId !== undefined && recipientId !== null ? Number(recipientId) : undefined

    if (action === "mark_all_read") {
      if (!recipientIdNum || !recipientType) {
        return NextResponse.json(
          { success: false, message: "recipientId and recipientType are required for mark_all_read" },
          { status: 400 },
        )
      }

      notifications.forEach((notif) => {
        if (
          notif.recipientId === recipientIdNum &&
          notif.recipientType === recipientType &&
          !notif.isRead
        ) {
          notif.isRead = true
          notif.updatedAt = new Date().toISOString()
          updatedCount++
        }
      })
    } else if (action === "mark_selected_read") {
      if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return NextResponse.json(
          { success: false, message: "notificationIds array is required" },
          { status: 400 },
        )
      }

      notifications.forEach((notif) => {
        if (notificationIds.includes(notif.id) && !notif.isRead) {
          notif.isRead = true
          notif.updatedAt = new Date().toISOString()
          updatedCount++
        }
      })
    } else if (action === "delete_selected") {
      if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return NextResponse.json(
          { success: false, message: "notificationIds array is required" },
          { status: 400 },
        )
      }

      for (let i = notifications.length - 1; i >= 0; i--) {
        if (notificationIds.includes(notifications[i].id)) {
          notifications.splice(i, 1)
          updatedCount++
        }
      }
    } else {
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: { updatedCount },
      message: `Bulk operation completed. ${updatedCount} notifications ${action.replace(/_/g, " ")}`,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to perform bulk operation" }, { status: 500 })
  }
}
