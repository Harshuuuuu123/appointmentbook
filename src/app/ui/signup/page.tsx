"use client"

import { useState } from "react"
import { FaGoogle, FaApple } from "react-icons/fa"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "patient", // default patient
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (form.password !== form.confirmPassword) {
      alert("Passwords don't match!")
      return
    }

    if (!form.username || !form.email || !form.phone || !form.password) {
      alert("Please fill in all fields!")
      return
    }

    try {
      setLoading(true)

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          phone: form.phone,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      })

      const data = await res.json()
      setLoading(false)

      if (!data.success || !data.data?.id) {
        alert(data.message || "Signup failed. Try again.")
        return
      }

      // Save user ID and role to localStorage
      localStorage.setItem("loggedInUserId", data.data.id)
      localStorage.setItem("loggedInUserRole", form.role)

      // Redirect based on role
      if (form.role === "patient") {
        router.push("/ui/search-dr")
      } else if (form.role === "doctor") {
        // Doctor needs to complete profile
        router.push("/dashboard/profile-creatio")
      } else {
        router.push("/") // fallback
      }
    } catch (error) {
      console.error("Signup error:", error)
      setLoading(false)
      alert("Something went wrong. Please try again later.")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-96"
      >
        <h1 className="text-xl font-bold mb-4 text-center">Sign Up</h1>

        {/* Role */}
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full p-3 mb-3 border rounded-lg"
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full p-3 mb-3 border rounded-lg"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 mb-3 border rounded-lg"
          required
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          className="w-full p-3 mb-3 border rounded-lg"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-3 mb-3 border rounded-lg"
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full p-3 mb-4 border rounded-lg"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? "Signing up..." : "Continue"}
        </button>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <a href="/ui/login" className="text-blue-600">
            Sign In
          </a>
        </p>

        {/* Social login */}
        <div className="flex items-center justify-center gap-4 mt-5">
          <button type="button" className="p-3 border rounded-full">
            <FaGoogle className="text-red-500 w-5 h-5" />
          </button>
          <button type="button" className="p-3 border rounded-full">
            <FaApple className="text-black w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
