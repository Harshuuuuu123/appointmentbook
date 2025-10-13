import React, { InputHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return <input className={`border p-2 rounded-md ${className}`} {...props} />
}
