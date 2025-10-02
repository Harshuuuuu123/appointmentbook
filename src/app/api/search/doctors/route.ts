import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db" // db.ts se query import

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get("q")
    const specialization = searchParams.get("specialization")
    const city = searchParams.get("city")
    const state = searchParams.get("state")
    const availability = searchParams.get("availability") // date in YYYY-MM-DD
    const minExperience = searchParams.get("minExperience")
    const maxFee = searchParams.get("maxFee")
    const sortBy = searchParams.get("sortBy") || "name"
    const sortOrder = searchParams.get("sortOrder") || "asc"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // --- Fetch doctors with clinics from DB ---
    const doctorsResult = await query(
      `
      SELECT 
        d.id as doctor_id,
        d.name as doctor_name,
        d.specialization,
        d.experience,
        d.qualification,
        d.consultation_fee,
        d.profile_image,
        d.bio,
        d.rating,
        d.review_count,
        d.is_active,
        c.id as clinic_id,
        c.name as clinic_name,
        c.address as clinic_address,
        c.city as clinic_city,
        c.state as clinic_state,
        c.phone as clinic_phone
      FROM doctor d
      LEFT JOIN clinic c ON d.clinic_id = c.id
      WHERE d.is_active = true
      `
    )

    let doctors = doctorsResult.rows.map((row: any) => ({
      id: row.doctor_id,
      name: row.doctor_name,
      specialization: row.specialization,
      experience: row.experience,
      qualification: row.qualification,
      consultationFee: row.consultation_fee,
      profileImage: row.profile_image,
      bio: row.bio,
      rating: row.rating || 4.5,
      reviewCount: row.review_count || 0,
      clinic: row.clinic_id
        ? {
            id: row.clinic_id,
            name: row.clinic_name,
            address: row.clinic_address,
            city: row.clinic_city,
            state: row.clinic_state,
            phone: row.clinic_phone,
          }
        : null,
      timings: [], // TODO: timings ko alag table se laana hoga
    }))

    // --- Apply filters ---
    if (searchQuery) {
      const term = searchQuery.toLowerCase()
      doctors = doctors.filter(
        (doc) =>
          doc.name.toLowerCase().includes(term) ||
          doc.specialization?.toLowerCase().includes(term) ||
          doc.clinic?.name?.toLowerCase().includes(term) ||
          doc.bio?.toLowerCase().includes(term)
      )
    }

    if (specialization) {
      doctors = doctors.filter((doc) => doc.specialization?.toLowerCase() === specialization.toLowerCase())
    }

    if (city) {
      doctors = doctors.filter((doc) => doc.clinic?.city?.toLowerCase() === city.toLowerCase())
    }

    if (state) {
      doctors = doctors.filter((doc) => doc.clinic?.state?.toLowerCase() === state.toLowerCase())
    }

    if (minExperience) {
      doctors = doctors.filter((doc) => (doc.experience || 0) >= Number(minExperience))
    }

    if (maxFee) {
      doctors = doctors.filter((doc) => !doc.consultationFee || doc.consultationFee <= Number(maxFee))
    }

    // Filter by availability
    if (availability) {
      const requestedDate = new Date(availability)
      const dayOfWeek = requestedDate.getDay()
      doctors = doctors.filter((doc) => {
        const dayTiming = doc.timings?.find((t: any) => t.dayOfWeek === dayOfWeek && t.isActive)
        return !!dayTiming
      })
    }

    // --- Sorting ---
    doctors.sort((a, b) => {
      let aValue: any, bValue: any
      switch (sortBy) {
        case "experience":
          aValue = a.experience || 0
          bValue = b.experience || 0
          break
        case "fee":
          aValue = a.consultationFee || 0
          bValue = b.consultationFee || 0
          break
        case "rating":
          aValue = a.rating || 0
          bValue = b.rating || 0
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }
      if (sortOrder === "desc") return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    })

    // --- Pagination ---
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedDoctors = doctors.slice(startIndex, endIndex)

    // --- Response ---
    return NextResponse.json({
      success: true,
      data: {
        doctors: paginatedDoctors,
        pagination: {
          page,
          limit,
          total: doctors.length,
          totalPages: Math.ceil(doctors.length / limit),
          hasNext: endIndex < doctors.length,
          hasPrev: page > 1,
        },
        filters: {
          searchQuery,
          specialization,
          city,
          state,
          availability,
          minExperience,
          maxFee,
          sortBy,
          sortOrder,
        },
      },
      message: "Doctors retrieved successfully",
    })
  } catch (error) {
    console.error("Doctors API Error:", error)
    return NextResponse.json({ success: false, message: "Failed to search doctors" }, { status: 500 })
  }
}
