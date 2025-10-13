import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { SearchDoctor } from "@/components/search-doctor"
import { Features } from "@/components/features"
import { DoctorCards } from "@/components/doctor-cards"
import { SiteFooter } from "@/components/site-footer"
import "@/app/globals.css";


export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <SearchDoctor />
        <Features />
        <DoctorCards />
      </main>
      <SiteFooter />
    </>
  )
}
