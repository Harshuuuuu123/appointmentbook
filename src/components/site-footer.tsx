"use client"

import Link from "next/link"
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="w-full bg-primary text-primary-foreground">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-12 md:px-6 md:grid-cols-5">
        {/* Logo and copyright */}
        <div className="md:col-span-2">
          <div className="inline-flex items-center gap-2">
            <img
              src="/footerlogo.png" // replace with your logo path
              alt="DoctorApp Logo"
              className="h-9 w-9 rounded-md object-cover shadow-sm"
            />
            <span className="font-semibold text-lg leading-none">DoctorApp</span>
          </div>
          <p className="mt-4 text-sm/6 opacity-90">
            Copyright © 2025 • All rights reserved
          </p>
        </div>

        {/* Product links */}
        <div>
          <h4 className="text-sm font-semibold">Product</h4>
          <ul className="mt-3 space-y-2 text-sm opacity-90">
            <li>
              <Link href="#">Features</Link>
            </li>
            <li>
              <Link href="#">Pricing</Link>
            </li>
            <li>
              <Link href="#">Doctors</Link>
            </li>
            <li>
              <Link href="#">Appointments</Link>
            </li>
          </ul>
        </div>

        {/* Company links */}
        <div>
          <h4 className="text-sm font-semibold">Company</h4>
          <ul className="mt-3 space-y-2 text-sm opacity-90">
            <li>
              <Link href="#">About</Link>
            </li>
            <li>
              <Link href="#">Careers</Link>
            </li>
            <li>
              <Link href="#">Culture</Link>
            </li>
            <li>
              <Link href="#">Blog</Link>
            </li>
          </ul>
        </div>

        {/* Social links */}
        <div>
          <h4 className="text-sm font-semibold">Follow us</h4>
          <ul className="mt-3 space-y-2 text-sm opacity-90">
            <li className="flex items-center gap-2">
              <Facebook className="h-4 w-4" />
              <Link href="#">Facebook</Link>
            </li>
            <li className="flex items-center gap-2">
              <Twitter className="h-4 w-4" />
              <Link href="#">Twitter</Link>
            </li>
            <li className="flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              <Link href="#">Instagram</Link>
            </li>
            <li className="flex items-center gap-2">
              <Linkedin className="h-4 w-4" />
              <Link href="#">LinkedIn</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
