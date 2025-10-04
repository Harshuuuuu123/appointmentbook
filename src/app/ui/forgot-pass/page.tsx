"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"email" | "reset">("email");
  const [loading, setLoading] = useState(false);

  // Step 1: Generate OTP
  const handleGenerateOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        alert("OTP has been sent to your email! ✅");
        setStep("reset");
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Failed to generate OTP");
    }
  };

  // Step 2: Reset password
// Step 2: Reset password and fetch full user data like login
const handleResetPassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      alert("Password reset successful! ✅");

      const user = data.user;

      // Store data in localStorage just like login
      localStorage.setItem("loggedInUserId", String(user.id));
      localStorage.setItem("loggedInUserRole", user.role);

      if (user.role === "doctor") {
        if (!user.doctor) {
          alert("Doctor profile not found. Please complete your profile first.");
          window.location.href = "/ui/profile-creation";
          return;
        }

        localStorage.setItem("doctorId", String(user.doctor.id));
        localStorage.setItem(
          "doctorData",
          JSON.stringify({
            doctor: user.doctor,
            clinic: user.clinic || null,
            appointments: user.appointments || [],
          })
        );

        window.location.href = "/dashboard";
      } else {
        // Patient
        localStorage.setItem(
          "patientData",
          JSON.stringify({
            patient: user.patient,
            appointments: user.appointments || [],
          })
        );
        window.location.href = "/ui/search-dr";
      }
    } else {
      alert(data.message || "Invalid OTP. Please try again.");
    }
  } catch (err) {
    setLoading(false);
    console.error(err);
    alert("Failed to reset password");
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={step === "email" ? handleGenerateOtp : handleResetPassword}
        className="bg-white p-6 rounded-2xl shadow-md w-96"
      >
        <h1 className="text-xl font-bold mb-4 text-center">Forgot Password</h1>

        {/* Email Input */}
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={step === "reset"}
        />

        {/* OTP + Password Fields */}
        {step === "reset" && (
          <>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full p-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
          </>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Please wait..." : step === "email" ? "Send OTP" : "Reset Password"}
        </button>

        <p className="text-center text-sm mt-4">
          Remember your password?{" "}
          <a href="/ui/login" className="text-blue-600 hover:underline">
            Sign In
          </a>
        </p>
      </form>
    </div>
  );
}