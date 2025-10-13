"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function SearchDoctor() {
  return (
    <section className="w-full py-8">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="rounded-xl border bg-card p-5 shadow-sm md:p-6">
          <h2 className="font-medium text-lg">Find A Doctor</h2>
          <form
            className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]"
            onSubmit={(e) => e.preventDefault()}
            aria-label="Find a doctor"
          >
            <Input placeholder="Name" aria-label="Doctor name" className="h-12 rounded-full bg-input" />
        <button
  type="submit"
  className="h-12 rounded-full px-6 text-white"
  style={{
    padding: "8px 16px",
    borderRadius: "6px",
    backgroundColor: "#2E6FF3",
  }}
>
  Search
</button>


          </form>
        </div>
      </div>
    </section>
  )
}
