"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

export function Hero() {
  return (
    <section className="w-full">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 md:px-6 lg:grid-cols-2 lg:gap-12">
        <div className="flex flex-col">
          <h1 className="font-serif text-3xl leading-tight text-balance sm:text-4xl md:text-5xl lg:text-5xl">
            {"Book Appointments With "}
            <span className="text-accent">Doctors</span>
            {" For A Brighter And Healthy Future"}
          </h1>
          <p className="mt-4 max-w-prose text-muted-foreground leading-relaxed">
            We aim to make doctor consultations easy and stress-free. Book reliable appointments from qualified
            professionals you can trust.
          </p>

          <div className="mt-6">
            <Button className="rounded-full px-6 py-5 text-sm font-semibold shadow-md">Book Appointments</Button>
          </div>

          <div className="mt-6 flex items-center gap-4">
        
          </div>
        </div>

        <div className="relative">
          {/* pill */}
          <div className="absolute right-3 top-3 z-20">
            <div className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-foreground shadow">
              <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              24/7 Service
            </div>
          </div>

          {/* gradient capsule with doctor image */}
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary/15 to-accent/30 p-6 shadow-md">
            <Image
              src="/portrait-doctor-smiling.jpg"
              alt="Smiling doctor wearing stethoscope"
              width={520}
              height={520}
              className="mx-auto h-[420px] w-auto object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
