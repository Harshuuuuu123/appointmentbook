# MediClinic - Appointment Management System

This is a Next.js project for a doctor appointment management dashboard. It allows doctors or clinic staff to view and manage patient appointments efficiently.

## Features

- **Responsive Dashboard:** A clean and responsive interface for managing clinic operations.
- **Collapsible Sidebar:** Easy navigation through different sections of the application.
- **Appointment Management:**
  - View today's, upcoming, and all appointments for a specific doctor.
  - Update appointment status (`Confirmed`, `Completed`, `Cancelled`).
  - See patient details associated with each appointment.
- **Authentication (In-progress):** The structure is set up to handle doctor-specific data by fetching a `doctorId`.

## Tech Stack

- **Framework:** Next.js (with App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** React
- **Icons:** React Icons

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start by exploring the doctor's dashboard at `http://localhost:3000/dashboard/appointments` or the patient-facing UI at `http://localhost:3000/ui/login`.

### Prerequisites

This project requires a backend API to fetch and update data. The key endpoints expected are:
- `GET /api/appointments?doctorId={id}`: To fetch all appointments for a doctor.
- `PUT /api/appointments/{id}?doctorId={id}`: To update the status of an appointment.
- `/api/auth/...`: Endpoints for user authentication (login, forgot password, etc.).

Currently, the application retrieves the `doctorId` from `localStorage` for demonstration purposes. This is set during the login/password reset flow.

## Project Structure

- `src/app/dashboard/`: Contains all routes and pages related to the **Doctor's Dashboard**. This is the primary interface for clinic staff to manage appointments, patients, etc.
- `src/app/ui/`: Contains routes and pages for the **Patient-facing Interface**, such as login, registration, and password reset.
- `src/pages/api/`: Contains all **API Routes** that serve as the backend for the application. This includes logic for authentication and data management.
- `src/components/`: Reusable React components, organized by feature (e.g., `appointments`, `layout`).
- `src/context/`: React context providers, such as `DoctorProvider`, to share state across the application.

## Learn More

To learn more about Next.js, take a look at the following resources:

- Next.js Documentation - learn about Next.js features and API.
- Learn Next.js - an interactive Next.js tutorial.

You can check out the Next.js GitHub repository - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the Vercel Platform from the creators of Next.js.

Check out our Next.js deployment documentation for more details.
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
