export function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "16px" }}>{children}</div>
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div style={{ marginBottom: "8px" }}>{children}</div>
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2>{children}</h2>
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function CardDescription({ children }: { children: React.ReactNode }) {
  return <p style={{ color: "#666" }}>{children}</p>
}