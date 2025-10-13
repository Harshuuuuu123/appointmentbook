"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"

export function Features() {
  return (
    <section className="w-full py-10">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-4 md:px-6 lg:grid-cols-2">
        <div>
          <h3 className="font-serif text-2xl sm:text-3xl">Book Your Doctor Appointment in Minutes</h3>
          <p className="mt-3 max-w-prose text-muted-foreground leading-relaxed">
            We make healthcare simple and accessible. From easy recommendations to booking confirmations, you&apos;ll
            find reliable options right at your fingertips.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button className="rounded-full px-6">Get started</Button>
           <Button className="rounded-full px-6">Book Appointments</Button>

          </div>
        </div>

        <div>
          <Image
            src="/calendar-appointment-desk.jpg"
            alt="Calendar showing appointment scheduled on desk"
            width={500}
            height={300}
            className="w-full rounded-lg border bg-card object-cover shadow-md"
          />
        </div>
      </div>
    </section>
  )
}
