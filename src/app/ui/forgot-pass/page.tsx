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
        alert(`OTP sent: ${data.data.otp}`); // remove in production
        setStep("reset");
      } else {
        alert(data.message);
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Failed to generate OTP");
    }
  };

  // Step 2: Reset password
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
        window.location.href = "/ui/login"; // Redirect to login
      } else {
        alert(data.message);
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

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-3 border rounded-lg"
          required
          disabled={step === "reset"}
        />

        {step === "reset" && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 mb-3 border rounded-lg"
              required
            />
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 mb-3 border rounded-lg"
              required
            />
          </>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold"
          disabled={loading}
        >
          {loading ? "Please wait..." : step === "email" ? "Send OTP" : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
