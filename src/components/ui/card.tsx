import React, { HTMLAttributes } from "react"

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`rounded-xl border bg-card shadow-sm ${className}`} {...props}>
      {children}
    </div>
  )
}

export const CardHeader: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`flex flex-row items-center gap-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export const CardTitle: React.FC<CardProps> = ({ children, className, ...props }) => {
  return <h3 className={`text-base font-medium ${className}`} {...props}>{children}</h3>
}

export const CardContent: React.FC<CardProps> = ({ children, className, ...props }) => {
  return <div className={`text-sm text-muted-foreground leading-relaxed ${className}`} {...props}>{children}</div>
}
