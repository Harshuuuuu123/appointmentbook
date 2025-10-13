# 🏥 MediClinic - Appointment Management System

**MediClinic** is a complete doctor–patient appointment management system built with **Next.js** and **TypeScript**.  
It provides a **Doctor Dashboard** for managing appointments and a **Patient Interface (UI)** for booking and viewing appointments.  
All backend operations are handled through **Next.js API routes**.

---

## 🚀 Features

### 👨‍⚕️ Doctor (Dashboard Module)
- View **today’s, upcoming, and all appointments**.
- Update appointment **status** (`Confirmed`, `Completed`, `Cancelled`).
- View **patient details** for each appointment.
- **DoctorContext** provides the logged-in doctor's data globally across the dashboard.

### 👤 Patient (UI Module)
- **Login / Signup** functionality.
- Book and manage appointments.
- View appointment confirmation and doctor details.

### ⚙️ Backend (API Module)
- REST APIs for handling appointments, authentication, and data persistence.
- Fetch and update appointments using `doctorId`.
- Extensible for integration with a real backend or database.

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | React |
| Icons | React Icons |
| State Management | React Context (DoctorContext) |

---

## 📁 Folder Structure

src/
├── app/
│ ├── dashboard/ # Doctor module (dashboard UI)
│ │ ├── appointments/ # Appointments-related pages & components
│ │ └── layout.tsx # Dashboard layout
│ │
│ ├── ui/ # Patient-facing UI (login, signup, etc.)
│ │ ├── login/
│ │ ├── register/
│ │ └── forgot-password/
│ │
│ └── api/ # API routes (Next.js backend)
│ ├── appointments/
│ ├── auth/
│ └── ...
│
├── components/ # Reusable components (layout, forms, modals, etc.)
├── context/ # React Context (DoctorContext)
└── lib/ # Database and utility functions


---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone <your-bitbucket-repo-url>
cd doctor-app

2️⃣ Install Dependencies
npm install
# or
yarn install

3️⃣ Run the Development Server
npm run dev


Now open http://localhost:3000
 in your browser.

Doctor Dashboard:
👉 http://localhost:3000/dashboard/appointments

Patient UI:
👉 http://localhost:3000/ui/login

🧠 How It Works
Doctor Flow

Doctor logs in and doctorId is stored in localStorage.

The dashboard uses DoctorContext to fetch and share this data.

Appointments are loaded from /api/appointments?doctorId={id}.

Appointment statuses can be updated via a PUT request to /api/appointments/{id}?doctorId={id}.

Patient Flow

The patient accesses the UI module for login or appointment booking.

API routes handle authentication and appointment creation.

The UI fetches confirmation data and displays appointment details.

🔌 API Endpoints
Endpoint	Method	Description
/api/appointments?doctorId={id}	GET	Fetch appointments for a doctor
/api/appointments/{id}?doctorId={id}	PUT	Update appointment status
/api/auth/login	POST	Login endpoint
/api/auth/register	POST	Register new doctor/patient
/api/auth/forgot-password	POST	Password reset flow
🧰 Environment Variables

Create a .env.local file in the root directory:

NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
DATABASE_URL=your_database_url_here