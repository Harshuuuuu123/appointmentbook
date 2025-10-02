"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();
  const [sendingOtp, setSendingOtp] = useState(false);

  const email = typeof window !== "undefined" ? localStorage.getItem("signupEmail") : null;
  const userRole = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;

  // Auto-send OTP when page loads
  useEffect(() => {
    if (email) sendOtp();
  }, [email]);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Send OTP via API
  const sendOtp = async () => {
    if (!email) return;
    try {
      setSendingOtp(true);
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        alert("OTP sent to your email!");
        setTimer(60);
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      alert("Something went wrong while sending OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  // OTP input change
  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 4) {
      alert("Please enter the complete OTP.");
      return;
    }

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredOtp, type: "signup" }),
      });
      const data = await res.json();

      if (data.success) {
        alert("OTP verified successfully!");
        if (userRole === "doctor") router.push("/dashboard/profile-creation");
        else router.push("/ui/search-dr");

        localStorage.removeItem("signupEmail");
        localStorage.removeItem("userRole");
      } else {
        alert(data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("OTP verify error:", err);
      alert("Something went wrong. Try again!");
    }
  };

  const handleResend = async () => {
    setOtp(["", "", "", ""]);
    await sendOtp();
    inputsRef.current[0]?.focus();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md w-96">
        <h1 className="text-xl font-bold mb-4 text-center">Enter OTP</h1>

        {/* OTP Inputs */}
        <div className="flex justify-between mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => { inputsRef.current[index] = el; }} // ✅ returns void
              className="w-14 h-14 text-center text-2xl border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold mb-2"
        >
          Verify
        </button>

        <p className="text-center text-sm mt-2">
          {timer > 0 ? (
            <>We will resend the code in {timer}s</>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-blue-600 font-medium"
              disabled={sendingOtp}
            >
              {sendingOtp ? "Sending..." : "Resend OTP"}
            </button>
          )}
        </p>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600">
            Sign In
          </a>
        </p>
      </form>
    </div>
  );
}
