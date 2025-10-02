import Sidebar from "@/components/layout/sidebar"
import NotificationHistory from "@/components/notifications/notification-history"

export default function NotificationsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <NotificationHistory />
      </main>
    </div>
  )
}
