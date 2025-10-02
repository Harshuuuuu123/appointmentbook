"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = searchParams?.get("id"); // appointment ID from query
  const doctorId = searchParams?.get("doctorId"); // optional

  const [appointment, setAppointment] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [method, setMethod] = useState("card");

  useEffect(() => {
    if (!id) {
      setError("Appointment ID is missing");
      setLoading(false);
      return;
    }

    const fetchAppointment = async () => {
      try {
        const res = await fetch(`/api/appointments/${id}/payment`);
        const data = await res.json();

        if (res.ok && data.success) {
          setAppointment(data.data);
          setAmount((data.data.payment_amount || 0).toString());
        } else {
          setError(data.message || "Failed to fetch appointment");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch appointment");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  const handleNumberClick = (num: string) => {
    if (amount.length < 10) setAmount((prev) => prev + num);
  };

  const handleClear = () => setAmount("");
  const handleBackspace = () => setAmount((prev) => prev.slice(0, -1));

  const handlePay = async () => {
    if (!amount || Number(amount) <= 0) return;

    try {
      const res = await fetch(`/api/appointments/${id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), method, doctorId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          router.push("/"); // redirect home
        }, 3000);
      } else {
        setError(data.message || "Payment failed");
      }
    } catch (err) {
      console.error(err);
      setError("Payment failed");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!appointment) return <p className="text-center mt-10 text-red-500">{error || "Appointment not found"}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
            ← Back
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Payment</h1>
          <div></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 grid lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Doctor Info */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center border-4 border-blue-500">
              <img
                src="/images/doctor-avatar-1.jpg"
                alt={appointment.doctor_name}
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Pay To</h2>
              <p className="text-gray-600">{appointment.doctor_name}</p>
              <p className="text-gray-500 text-sm">{appointment.hospital || "Hospital"}</p>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Enter Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                value={amount}
                readOnly
                placeholder="Amount"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1,2,3,4,5,6,7,8,9].map((num)=>(
              <button key={num} onClick={()=>handleNumberClick(num.toString())} className="h-12 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">{num}</button>
            ))}
            <button onClick={handleClear} className="h-12 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Clear</button>
            <button onClick={()=>handleNumberClick("0")} className="h-12 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">0</button>
            <button onClick={handleBackspace} className="h-12 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">⌫</button>
          </div>

          {/* Action */}
          <button
            onClick={handlePay}
            disabled={!amount || Number(amount) <= 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Pay Now
          </button>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        {/* Payment Summary */}
        <div className="bg-blue-50 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Transaction Details</h4>
            <p className="text-sm text-gray-600">Recipient: {appointment.doctor_name}</p>
            <p className="text-sm text-gray-600">Service: Medical Consultation</p>
            <p className="text-sm text-gray-600">Date: {appointment.date}</p>
            <p className="text-sm text-gray-600">Time: {appointment.time}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Amount Breakdown</h4>
            <div className="flex justify-between text-sm mb-1">
              <span>Consultation Fee:</span>
              <span>${appointment.payment_amount || 25}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>Platform Fee:</span>
              <span>$2.00</span>
            </div>
            <div className="flex justify-between text-sm font-medium border-t pt-2">
              <span>Total:</span>
              <span>${(Number(amount) || appointment.payment_amount || 25) + 2}</span>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">✓</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-4">Your appointment has been paid successfully.</p>
              <button onClick={()=>router.push("/")} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Go to Home</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
