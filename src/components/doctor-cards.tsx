"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const doctors = [
  {
    name: "Dr. Priya Sharma",
    specialty: "Cardiologist",
    desc: "Specializes in heart health and prevention, helping patients manage cardiovascular conditions.",
    avatar: "/doctor-avatar-female.jpg",
    fallback: "PS",
  },
  {
    name: "Dr. Rahul Verma",
    specialty: "Pediatrician",
    desc: "Provides personal pediatric care with expertise in childhood wellness and vaccinations.",
    avatar: "/doctor-avatar-male.jpg",
    fallback: "RV",
  },
  {
    name: "Dr. Neha Patel",
    specialty: "Dermatologist",
    desc: "Expert in diagnosing and treating skin conditions, ensuring confidence and comfort.",
    avatar: "/dermatologist-avatar.jpg",
    fallback: "NP",
  },
];

export function DoctorCards() {
  return (
    <section className="w-full py-16 bg-secondary">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h3 className="font-serif text-3xl font-semibold text-primary">
            Meet Our Trusted Doctors
          </h3>
          <p className="mt-3 text-muted-foreground text-sm md:text-base">
            Connect with qualified medical professionals you can trust.
          </p>
          <div className="mt-4 w-20 mx-auto border-b-4 border-accent rounded-full"></div>
        </div>

        {/* Doctor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((d) => (
            <Card
              key={d.name}
              className="rounded-2xl border border-border bg-card shadow-md p-6 hover:shadow-xl transition-all duration-300"
            >
              <CardHeader className="flex flex-row items-center gap-4 mb-4">
                <Avatar className="h-14 w-14 ring-2 ring-accent/30">
                  <AvatarImage
                    src={d.avatar || "/placeholder.svg"}
                    alt={`${d.name} headshot`}
                  />
                  <AvatarFallback>{d.fallback}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg text-foreground font-semibold mb-1">
                    {d.name}
                  </CardTitle>
                  <p className="text-sm text-primary font-medium">{d.specialty}</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {d.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
