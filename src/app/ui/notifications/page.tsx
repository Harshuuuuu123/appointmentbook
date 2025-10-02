"use client"

import Link from "next/link"
import Image from "next/image"

interface Notification {
  id: number
  doctorName: string
  message: string
  timestamp: string
  avatar: string
}

export default function Notifications() {
  const notifications: Notification[] = [
    {
      id: 1,
      doctorName: "Dr. Sharma",
      message: "Mr sharma wants to fix appointment with you",
      timestamp: "5 min ago",
      avatar: "/images/doctor-avatar-2.jpg",
    },
    {
      id: 2,
      doctorName: "Dr. Sharma",
      message: "Mr sharma wants to fix appointment with you",
      timestamp: "5 min ago",
      avatar: "/images/doctor-avatar-2.jpg",
    },
    {
      id: 3,
      doctorName: "Dr. Sharma",
      message: "Mr sharma wants to fix appointment with you",
      timestamp: "5 min ago",
      avatar: "/images/doctor-avatar-2.jpg",
    },
    {
      id: 4,
      doctorName: "Dr. Sharma",
      message: "Mr sharma wants to fix appointment with you",
      timestamp: "5 min ago",
      avatar: "/images/doctor-avatar-2.jpg",
    },
    {
      id: 5,
      doctorName: "Dr. Sharma",
      message: "Mr sharma wants to fix appointment with you",
      timestamp: "5 min ago",
      avatar: "/images/doctor-avatar-2.jpg",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-gray-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-blue-500 text-white rounded-lg p-4 flex items-center gap-3 hover:bg-blue-600 transition-colors cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  // Handle notification click
                }
              }}
            >
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src={notification.avatar || "/placeholder.svg"}
                  alt={notification.doctorName}
                  fill
                  className="rounded-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{notification.message}</p>
              </div>

              <div className="text-xs text-blue-100 flex-shrink-0">{notification.timestamp}</div>
            </div>
          ))}
        </div>

        {/* Empty State (if no notifications) */}
        {notifications.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h10V9H4v2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        )}
      </main>
    </div>
  )
}
