"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

interface Notification {
  id: number
  title: string
  message: string
  user_id: number
  is_read: boolean
  created_at: string
  updated_at: string
}

export default function NotificationDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [notification, setNotification] = useState<Notification | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) fetchNotification()
  }, [id])

  const fetchNotification = async () => {
    try {
      const res = await fetch(`/api/notification?id=${id}`)
      const data = await res.json()
      if (data.success && data.data.length) {
        setNotification(data.data[0])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async () => {
    try {
      const res = await fetch(`/api/notification`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(id), is_read: true }),
      })
      const data = await res.json()
      if (data.success) {
        alert("Marked as read")
        fetchNotification()
      } else {
        alert(`Failed: ${data.message}`)
      }
    } catch (error) {
      console.error(error)
      alert("Error while marking as read")
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!notification) return <div className="p-6">Notification not found</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">{notification.title}</h1>
      <p className="mb-4 text-muted-foreground">{notification.message}</p>
      <div className="flex gap-3">
        {!notification.is_read && (
          <button
            onClick={markAsRead}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Mark as Read
          </button>
        )}
        <button
          onClick={() => router.push("/dashboard/notifications")}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Back
        </button>
      </div>
    </div>
  )
}
