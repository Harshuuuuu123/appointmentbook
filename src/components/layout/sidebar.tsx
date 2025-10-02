"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FiMenu, FiX } from "react-icons/fi"

const menuItems = [
  { icon: "🏠", label: "Dashboard", href: "/dashboard" },
  { icon: "📅", label: "Appointments", href: "/dashboard/appointments" },
  { icon: "👥", label: "Patients", href: "/dashboard/patients" },
  { icon: "👨‍⚕️", label: "Staff", href: "/dashboard/staff" },
  { icon: "🔔", label: "Notifications", href: "/dashboard/notifications" },
  { icon: "📊", label: "Reports", href: "/dashboard/reports" },
  { icon: "⚙️", label: "Settings", href: "/dashboard/settings" },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-md border"
      >
        <FiMenu className="text-xl" />
      </button>

      {/* Sidebar for Desktop */}
      <div
        className={`hidden lg:block bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">MC</span>
              </div>
              {!isCollapsed && <span className="font-bold text-sidebar-foreground">MediClinic</span>}
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded hover:bg-sidebar-accent"
            >
              {isCollapsed ? "→" : "←"}
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-full bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 z-50 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } w-64`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">MC</span>
              </div>
              <span className="font-bold text-sidebar-foreground">MediClinic</span>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1 rounded hover:bg-sidebar-accent text-xl"
            >
              <FiX />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}

// Updated DashboardLayout component with mobile support
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Main content area */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* Add top padding on mobile to avoid hamburger menu overlap */}
          <div className="pt-16 lg:pt-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}