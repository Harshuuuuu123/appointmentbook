export function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} style={{ padding: "8px 16px", borderRadius: "6px", background: "#333", color: "white" }}>
      {children}
    </button>
  )
}