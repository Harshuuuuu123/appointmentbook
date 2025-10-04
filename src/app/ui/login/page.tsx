"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ emailOrPhone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.emailOrPhone || !form.password) {
      alert("Please fill in all fields!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setLoading(false);

      if (!data.success) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("loggedInUserId", String(data.user.id));
      localStorage.setItem("loggedInUserRole", data.user.role);

      if (data.user.role === "doctor") {
        if (!data.user.doctor) {
          alert("Doctor profile not found. Please complete your profile first.");
          router.push("/ui/profile-creation");
          return;
        }

        localStorage.setItem("doctorId", String(data.user.doctor.id));
        localStorage.setItem(
          "doctorData",
          JSON.stringify({
            doctor: data.user.doctor,
            clinic: data.user.clinic || null,
            appointments: data.user.appointments || [],
          })
        );

        router.push("/dashboard");
      } else {
        router.push("/ui/search-dr");
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
      alert("Something went wrong. Try again later.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-96"
      >
        <h1 className="text-xl font-bold mb-4 text-center">Login</h1>

        <input
          type="text"
          name="emailOrPhone"
          placeholder="Email or Phone"
          value={form.emailOrPhone}
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
          className="w-full p-3 mb-4 border rounded-lg"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Forgot Password link below login button */}
        <div className="flex justify-end mt-2 mb-4">
          <button
            type="button"
            onClick={() => router.push("/ui/forgot-pass")}
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <p className="text-center text-sm mt-4">
          Don't have an account?{" "}
          <a href="/ui/signup" className="text-blue-600">
            Sign Up
          </a>
        </p>
      </form>
    </div>
  );
}
