"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function SiteHeader() {
  const router = useRouter()

  return (
    <header className="site-header w-full">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="header-inner flex items-center justify-between py-5">
          <Link href="/" className="logo-link inline-flex items-center gap-3">
            <img 
              src="/logo.png"
              alt="DoctorApp Logo"
              className="logo-img h-10 w-10 rounded-md object-cover shadow-sm"
            />
            <span className="logo-text font-semibold text-lg leading-none">
              <span className="text-foreground">Doctor</span>
              <span className="text-primary">App</span>
            </span>
            <span className="sr-only">DoctorApp Home</span>
          </Link>

          <nav aria-label="primary" className="nav-links flex items-center gap-3">
            <Button
              className="login-btn"
              style={{
                backgroundColor: "#2E6FF3",
                color: "#FFFFFF",
                padding: "8px 16px",
                borderRadius: "6px",
              }}
              onClick={() => router.push("/ui/login")}
            >
              Login
            </Button>

            <Button
              className="signup-btn"
              style={{
                backgroundColor: "#2E6FF3",
                color: "#FFFFFF",
                padding: "8px 16px",
                borderRadius: "6px",
              }}
              onClick={() => router.push("/ui/signup")}
            >
              Sign Up
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
