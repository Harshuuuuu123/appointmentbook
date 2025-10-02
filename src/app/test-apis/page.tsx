"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestAPIsPage() {
  const [results, setResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const testAPI = async (name: string, url: string, method = "GET", body?: any) => {
    setLoading((prev) => ({ ...prev, [name]: true }))

    try {
      console.log(`[v0] Testing ${name} API:`, { url, method, body })

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      })

      console.log(`[v0] ${name} response status:`, response.status)
      const responseText = await response.text()
      console.log(`[v0] ${name} response text:`, responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.log(`[v0] JSON parse error for ${name}:`, parseError)
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`)
      }

      setResults((prev) => ({
        ...prev,
        [name]: { status: response.status, success: response.ok, data },
      }))
    } catch (error) {
      console.log(`[v0] ${name} API error:`, error)
      setResults((prev) => ({
        ...prev,
        [name]: {
          status: "ERROR",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }))
    } finally {
      setLoading((prev) => ({ ...prev, [name]: false }))
    }
  }

  const runAllTests = async () => {
    const timestamp = Date.now()
    const testEmail = `testuser${timestamp}@example.com`

    await testAPI("SignUp", "/api/auth/signup", "POST", {
      name: "Test User",
      email: testEmail,
      password: "password123",
      role: "patient",
      phone: "+1234567890",
    })

    await testAPI("Send OTP", "/api/auth/send-otp", "POST", {
      email: testEmail,
      type: "signup",
    })

    await testAPI("Verify OTP", "/api/auth/verify-otp", "POST", {
      email: testEmail,
      otp: "123456",
      type: "signup",
    })

    await testAPI("Login", "/api/auth/login", "POST", {
      email: testEmail,
      password: "password123",
    })

    await testAPI("Forgot Password", "/api/auth/forgot-password", "POST", {
      email: testEmail,
      newPassword: "newpassword123",
      otp: "123456",
    })

    // Existing API tests
    await testAPI("Get Doctors", "/api/doctors")
    await testAPI("Create Doctor", "/api/doctors", "POST", {
      name: "Dr. Test Smith",
      email: "test@example.com",
      phone: "+1234567890",
      specialization: "General Medicine",
      experience: 5,
      qualification: "MBBS, MD",
      bio: "Experienced general practitioner",
      consultationFee: 500,
    })
    await testAPI("Search Doctors", "/api/search/doctors?specialization=General Medicine")
    await testAPI("Search Clinics", "/api/search/clinics")
    await testAPI("Get Patients", "/api/patients")
    await testAPI("Create Patient", "/api/patients", "POST", {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      age: 30,
      gender: "male",
      address: "123 Main St, City, State",
    })
    await testAPI("Get Appointments", "/api/appointments")
    await testAPI("Get Staff", "/api/staff")
    await testAPI("Get Notifications", "/api/notifications")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">API Testing Dashboard</h1>
        <p className="text-muted-foreground">Test all doctor appointment system APIs</p>
      </div>

      <div className="mb-6 flex gap-4">
        <Button onClick={runAllTests}>Run All Tests</Button>
        <Button onClick={() => setResults({})}>Clear Results</Button>
      </div>

      <div className="grid gap-4">
        {Object.entries(results).map(([name, result]) => (
          <Card key={name}>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center justify-between">
                  {name}
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {result.status}
                  </span>
                </div>
              </CardTitle>
              <CardDescription>{loading[name] ? "Testing..." : result.success ? "Success" : "Failed"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <pre className="bg-muted p-3 rounded text-sm overflow-auto max-h-40">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(results).length === 0 && (
        <Card>
          <CardContent>
            <div className="pt-6 text-center text-muted-foreground">Click "Run All Tests" to test all APIs</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
